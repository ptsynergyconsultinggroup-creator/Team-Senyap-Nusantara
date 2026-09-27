import React, { useState, useEffect } from 'react';
import { initialMembers, initialTransactions, initialSiteConfig, initialNews, initialLegalAidCases } from './data/mockData';
import { Member, Transaction, SiteConfig, NewsItem, Vehicle, LegalAidCase } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProgramsSection } from './components/ProgramsSection';
import { GallerySection } from './components/GallerySection';
import { NewsSection } from './components/NewsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { MemberVerificationModal } from './components/MemberVerificationModal';
import { MemberRegistrationModal } from './components/MemberRegistrationModal';
import { LegalAidRequestModal } from './components/LegalAidRequestModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { FinancialReportModal } from './components/FinancialReportModal';
import { OfficialDocumentsModal } from './components/OfficialDocumentsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { MediaCenterModal } from './components/MediaCenterModal';
import { TermsAndPrivacyModal } from './components/TermsAndPrivacyModal';
import {
  subscribeMembers,
  saveMember,
  updateMember,
  deleteMember,
  subscribeTransactions,
  saveTransaction,
  deleteTransaction,
  subscribeSiteConfig,
  saveSiteConfig,
  subscribeAdminAuth,
  subscribeNews,
  saveNews,
  updateNews,
  deleteNews,
  logoutAdmin,
  subscribeVehicles,
  saveVehicle,
  updateVehicle,
  deleteVehicle,
  initialVehicles,
  subscribeLegalAidCases,
  updateLegalAidCaseStatus,
} from './services';

export default function App() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(initialSiteConfig);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [legalAidCases, setLegalAidCases] = useState<LegalAidCase[]>(initialLegalAidCases);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLegalAidOpen, setIsLegalAidOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('tsn_admin_session') === 'active';
    } catch {
      return false;
    }
  });
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'public'>(() => {
    try {
      return sessionStorage.getItem('tsn_admin_session') === 'active' ? 'dashboard' : 'public';
    } catch {
      return 'public';
    }
  });
  const [adminUser, setAdminUser] = useState<string>(() => {
    try {
      return sessionStorage.getItem('tsn_admin_user') || 'IBRAHIM (Bendahara Pusat)';
    } catch {
      return 'IBRAHIM (Bendahara Pusat)';
    }
  });
  const [isFinancialReportOpen, setIsFinancialReportOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isMediaCenterOpen, setIsMediaCenterOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms');
  const [activeSection, setActiveSection] = useState('hero');

  const handleOpenTerms = (tab: 'terms' | 'privacy' = 'terms') => {
    setTermsTab(tab);
    setIsTermsOpen(true);
  };

  // Real-time synchronization with Firestore
  useEffect(() => {
    const unsubMembers = subscribeMembers((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setMembers(cloudMembers);
      }
    });

    const unsubTransactions = subscribeTransactions((cloudTransactions) => {
      if (cloudTransactions && cloudTransactions.length > 0) {
        setTransactions(cloudTransactions);
      }
    });

    const unsubConfig = subscribeSiteConfig((cloudConfig) => {
      if (cloudConfig) {
        setSiteConfig(cloudConfig);
      }
    });

    const unsubAuth = subscribeAdminAuth((user, isAdmin) => {
      if (user && isAdmin) {
        setIsAdminLoggedIn(true);
        setAdminUser(user.displayName || user.email || 'Pengurus Pusat');
      } else if (!user) {
        setIsAdminLoggedIn(false);
        setAdminViewMode('public');
      }
    });

    const unsubNews = subscribeNews((cloudNews) => {
      if (cloudNews && cloudNews.length > 0) {
        setNews(cloudNews);
      }
    });

    const unsubVehicles = subscribeVehicles((cloudVehicles) => {
      if (cloudVehicles && cloudVehicles.length > 0) {
        setVehicles(cloudVehicles);
      }
    });

    const unsubLegalAid = subscribeLegalAidCases((cloudCases) => {
      if (cloudCases && cloudCases.length > 0) {
        setLegalAidCases(cloudCases);
      }
    });

    return () => {
      unsubMembers();
      unsubTransactions();
      unsubConfig();
      unsubAuth();
      unsubNews();
      unsubVehicles();
      unsubLegalAid();
    };
  }, []);

  // Auto-open verification modal if opened via scanned QR code URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verify') || params.get('id') || params.get('kta');
    if (verifyId) {
      setIsVerifyOpen(true);
    }
  }, []);

  const handleAddMember = async (newMember: Member) => {
    // Optimistic UI update
    setMembers((prev) => [newMember, ...prev]);
    // Save to Firestore
    await saveMember(newMember);
  };

  const handleVerifyMember = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (target) {
      let finalId = target.id;
      if (finalId.startsWith('TSN-REG-') || !finalId.includes('-202')) {
        const prefix = '35.09-2026-';
        let maxSeq = 16;
        members.forEach((m) => {
          if (m.id && m.id.startsWith(prefix)) {
            const val = parseInt(m.id.slice(prefix.length), 10);
            if (!isNaN(val) && val > maxSeq) maxSeq = val;
          }
        });
        let candidate = maxSeq + 1;
        while (members.some((m) => m.id === `${prefix}${String(candidate).padStart(4, '0')}`)) {
          candidate++;
        }
        finalId = `${prefix}${String(candidate).padStart(4, '0')}`;
      }

      const updated: Member = {
        ...target,
        id: finalId,
        status: 'Aktif',
        validUntil: target.validUntil || '30 Desember 2027',
        verifiedBy: adminUser || 'IBRAHIM ASEGAF (Bendahara Pusat)',
        verifiedAt: new Date().toLocaleDateString('id-ID'),
      };
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      await updateMember(updated);
    }
  };

  const handleRejectMember = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (target) {
      const updated: Member = {
        ...target,
        status: 'Nonaktif',
      };
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      await updateMember(updated);
    }
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
    await updateMember(updatedMember);
  };

  const handleDeleteMember = async (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    await deleteMember(memberId);
  };

  const handleAddTransaction = async (newTrx: Transaction) => {
    setTransactions((prev) => [newTrx, ...prev]);
    await saveTransaction(newTrx);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    await deleteTransaction(transactionId);
  };

  const handleUpdateSiteConfig = async (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    await saveSiteConfig(newConfig);
  };

  const handleAddNews = async (newNews: NewsItem) => {
    setNews((prev) => [newNews, ...prev.filter((n) => n.id !== newNews.id)]);
    await saveNews(newNews);
  };

  const handleUpdateNews = async (updatedNews: NewsItem) => {
    setNews((prev) => prev.map((n) => (n.id === updatedNews.id ? updatedNews : n)));
    await updateNews(updatedNews);
  };

  const handleDeleteNews = async (newsId: string) => {
    setNews((prev) => prev.filter((n) => n.id !== newsId));
    await deleteNews(newsId);
  };

  const handleAddVehicle = async (vehicle: Vehicle) => {
    setVehicles((prev) => [vehicle, ...prev.filter((v) => v.id !== vehicle.id)]);
    await saveVehicle(vehicle);
  };

  const handleUpdateVehicle = async (vehicle: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? vehicle : v)));
    await updateVehicle(vehicle);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    await deleteVehicle(vehicleId);
  };

  const handleUpdateLegalAidStatus = async (ticketNumber: string, status: LegalAidCase['status']) => {
    setLegalAidCases((prev) =>
      prev.map((c) => (c.ticketNumber === ticketNumber ? { ...c, status } : c))
    );
    await updateLegalAidCaseStatus(ticketNumber, status);
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setAdminViewMode('dashboard');
      setIsAdminOpen(false);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleOpenDocuments = () => {
    if (isAdminLoggedIn) {
      setAdminViewMode('dashboard');
      setIsAdminOpen(false);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = (userDisplayName: string) => {
    setIsAdminLoggedIn(true);
    setAdminUser(userDisplayName);
    try {
      sessionStorage.setItem('tsn_admin_session', 'active');
      sessionStorage.setItem('tsn_admin_user', userDisplayName);
    } catch (e) {
      console.error(e);
    }
    setAdminViewMode('dashboard');
    setIsAdminOpen(false);
    setIsAdminLoginOpen(false);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    logoutAdmin();
    setAdminViewMode('public');
    setIsAdminOpen(false);
    setIsDocumentsOpen(false);
  };

  const pendingCount = members.filter((m) => m.status === 'Menunggu Verifikasi').length;

  const scrollToAbout = () => {
    setActiveSection('profil');
    const el = document.getElementById('profil');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // If admin is logged in and working in dashboard mode, render the Full Dedicated Admin Workspace!
  if (isAdminLoggedIn && adminViewMode === 'dashboard') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
        <AdminDashboardModal
          isOpen={true}
          isFullScreen={true}
          onClose={() => setAdminViewMode('public')}
          onSwitchToPublic={() => setAdminViewMode('public')}
          members={members}
          onVerifyMember={handleVerifyMember}
          onRejectMember={handleRejectMember}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          siteConfig={siteConfig}
          onUpdateSiteConfig={handleUpdateSiteConfig}
          adminName={adminUser}
          onLogout={handleLogout}
          news={news}
          onAddNews={handleAddNews}
          onUpdateNews={handleUpdateNews}
          onDeleteNews={handleDeleteNews}
          vehicles={vehicles}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          legalAidCases={legalAidCases}
          onUpdateLegalAidStatus={handleUpdateLegalAidStatus}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Sticky Top Control Bar for Logged-In Admin when inspecting public portal */}
      {isAdminLoggedIn && (
        <div className="sticky top-0 z-[60] bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-stone-950 px-4 py-2 flex flex-wrap items-center justify-between shadow-2xl text-xs border-b border-amber-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 uppercase font-black text-[10px] tracking-wider">
              👑 Mode Admin Aktif
            </span>
            <span className="text-stone-950">
              Anda sedang meninjau tampilan publik portal sebagai: <strong>{adminUser}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setAdminViewMode('dashboard')}
                className="px-2.5 py-1 rounded-lg bg-stone-950 text-amber-300 text-[11px] font-bold hover:bg-stone-900 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{pendingCount} Verifikasi Menunggu</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setAdminViewMode('dashboard')}
              className="px-3.5 py-1.5 rounded-xl bg-stone-950 text-amber-300 hover:text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow hover:scale-105"
            >
              <span>⬅️ Buka Pusat Kendali Admin (Dashboard Penuh)</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950 text-rose-200 hover:bg-rose-900 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-rose-800/40"
            >
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
      {/* Header / Navbar */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenVerify={() => setIsVerifyOpen(true)}
        onOpenLegalAid={() => setIsLegalAidOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenFinancialReport={() => setIsFinancialReportOpen(true)}
        onOpenDocuments={handleOpenDocuments}
        onOpenMediaCenter={() => setIsMediaCenterOpen(true)}
        onOpenTerms={handleOpenTerms}
        pendingCount={pendingCount}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        siteConfig={siteConfig}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleLogout}
      />

      {/* Main Sections */}
      <main>
        <HeroSection
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenVerify={() => setIsVerifyOpen(true)}
          onOpenLegalAid={() => setIsLegalAidOpen(true)}
          onOpenFinancialReport={() => setIsFinancialReportOpen(true)}
          onScrollToAbout={scrollToAbout}
          siteConfig={siteConfig}
        />

        <AboutSection
          onOpenLegalAid={() => setIsLegalAidOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
          siteConfig={siteConfig}
        />

        <ProgramsSection
          onOpenLegalAid={() => setIsLegalAidOpen(true)}
        />

        <GallerySection />

        <NewsSection news={news} />

        <LocationSection
          onOpenLegalAid={() => setIsLegalAidOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenVerify={() => setIsVerifyOpen(true)}
        onOpenLegalAid={() => setIsLegalAidOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenMediaCenter={() => setIsMediaCenterOpen(true)}
        onOpenTerms={handleOpenTerms}
        siteConfig={siteConfig}
      />

      {/* Modals */}
      <MemberVerificationModal
        members={members}
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenLegalAid={() => setIsLegalAidOpen(true)}
        onOpenFinancialReport={() => setIsFinancialReportOpen(true)}
        onUpdateMember={handleUpdateMember}
      />

      <MemberRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAddMember={handleAddMember}
      />

      <LegalAidRequestModal
        isOpen={isLegalAidOpen}
        onClose={() => setIsLegalAidOpen(false)}
      />

      {/* Protected Admin Login Gate Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        siteConfig={siteConfig}
      />

      <FinancialReportModal
        isOpen={isFinancialReportOpen}
        onClose={() => setIsFinancialReportOpen(false)}
        transactions={transactions}
        siteConfig={siteConfig}
      />

      <OfficialDocumentsModal
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        members={members}
        siteConfig={siteConfig}
      />

      {/* Media Center & Press Room Modal */}
      <MediaCenterModal
        isOpen={isMediaCenterOpen}
        onClose={() => setIsMediaCenterOpen(false)}
        siteConfig={siteConfig}
      />

      {/* Terms & Privacy Compliance Modal (UU PDP No. 27/2022) */}
      <TermsAndPrivacyModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        defaultTab={termsTab}
      />
    </div>
  );
}
