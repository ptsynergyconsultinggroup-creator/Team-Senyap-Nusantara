import React, { useState, useEffect } from 'react';
import { initialMembers, initialTransactions, initialSiteConfig } from './data/mockData';
import { Member, Transaction, SiteConfig } from './types';
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
} from './services/dbService';

export default function App() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(initialSiteConfig);
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

    return () => {
      unsubMembers();
      unsubTransactions();
      unsubConfig();
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
      const updated: Member = {
        ...target,
        status: 'Aktif',
        verifiedBy: 'IBRAHIM (Bendahara Pusat)',
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

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleOpenDocuments = () => {
    if (isAdminLoggedIn) {
      setIsDocumentsOpen(true);
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
    setIsAdminOpen(true);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      sessionStorage.removeItem('tsn_admin_session');
      sessionStorage.removeItem('tsn_admin_user');
    } catch (e) {
      console.error(e);
    }
    setIsAdminOpen(false);
    setIsDocumentsOpen(false);
  };

  const pendingCount = members.filter((m) => m.status === 'Menunggu Verifikasi').length;

  const scrollToAbout = () => {
    setActiveSection('profil');
    const el = document.getElementById('profil');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
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

        <NewsSection />

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

      {/* Protected Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
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
