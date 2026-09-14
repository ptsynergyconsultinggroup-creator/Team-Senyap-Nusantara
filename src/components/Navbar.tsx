import React, { useState, useRef, useEffect } from 'react';
import { TSNLogo } from './TSNLogo';
import {
  Menu,
  X,
  ShieldCheck,
  UserPlus,
  Scale,
  PhoneCall,
  LayoutDashboard,
  Home,
  Info,
  Layers,
  Image,
  Newspaper,
  MapPin,
  MessageCircle,
  Wallet,
  FileText,
  Lock,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { SiteConfig } from '../types';

interface NavbarProps {
  onOpenRegister: () => void;
  onOpenVerify: () => void;
  onOpenLegalAid: () => void;
  onOpenAdmin: () => void;
  onOpenFinancialReport?: () => void;
  onOpenDocuments?: () => void;
  onOpenMediaCenter?: () => void;
  onOpenTerms?: () => void;
  pendingCount?: number;
  activeSection: string;
  setActiveSection: (section: string) => void;
  siteConfig?: SiteConfig;
  isAdminLoggedIn?: boolean;
  onLogoutAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegister,
  onOpenVerify,
  onOpenLegalAid,
  onOpenAdmin,
  onOpenFinancialReport,
  onOpenDocuments,
  onOpenMediaCenter,
  onOpenTerms,
  pendingCount = 0,
  activeSection,
  setActiveSection,
  siteConfig,
  isAdminLoggedIn = false,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const orgName = siteConfig?.orgName || 'TEAM SENYAP NUSANTARA';
  const subTitle = siteConfig?.subTitle || 'LPKSM Senyap Nusantara Jaya — Jember';
  const phoneHotline = siteConfig?.phoneHotline || '0823-3262-6916';
  const whatsappNumber = siteConfig?.whatsappNumber || '6282332626916';

  // Handle clicking outside and Escape key to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setServicesMenuOpen(false);
      }
    };
    if (servicesMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [servicesMenuOpen]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Beranda', icon: Home },
    { id: 'profil', label: 'Profil', icon: Info },
    { id: 'program', label: 'Program', icon: Layers },
    { id: 'galeri', label: 'Galeri', icon: Image },
    { id: 'berita', label: 'Warta', icon: Newspaper },
    { id: 'kontak', label: 'Kontak', icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-amber-500/30 shadow-2xl transition-all">
      {/* Top Banner: Emergency Hotline & Official Registration Bar */}
      <div className="bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border-b border-amber-500/20 text-xs py-1 px-3 sm:px-6 text-amber-200/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] gap-2">
          {/* Left info: Hotline & TDLPK */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
            <span className="flex items-center gap-1 font-mono text-amber-300 font-semibold shrink-0">
              <PhoneCall className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Hotline: {phoneHotline}</span>
            </span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span className="hidden md:inline font-mono text-stone-400 truncate">
              TDLPK Disperindag: {siteConfig?.tdlpkNumber || '510/024/TDLPK/2024'}
            </span>
          </div>

          {/* Right info: WhatsApp consultation & Pro-Bono badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Halo%20LPKSM%20Senyap%20Nusantara%20Jaya,%20saya%20ingin%20konsultasi%20bantuan%20hukum`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Konsultasi WA</span>
            </a>
            <span className="hidden lg:inline text-stone-600">•</span>
            <span className="hidden lg:inline text-amber-400/80 font-mono">Bantuan Hukum Pro-Bono</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand Logo & Authority Label */}
          <div
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
          >
            <TSNLogo size="sm" showText={false} logoUrl={siteConfig?.logoUrl} />
            <div className="min-w-0">
              <span className="text-sm sm:text-base lg:text-lg font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 group-hover:brightness-110 transition-all block truncate">
                {orgName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400/80 tracking-wide uppercase font-mono block -mt-0.5 truncate max-w-[170px] sm:max-w-[240px] md:max-w-xs lg:max-w-sm">
                LPKSM Senyap Nusantara Jaya
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop: xl and above to avoid squishing) */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                      : 'text-stone-300 hover:text-amber-200 hover:bg-stone-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Action Area (Visible on lg and above) */}
          <div className="hidden lg:flex items-center space-x-2 shrink-0">
            {/* 1. Quick Cek KTA Button */}
            <button
              id="nav-btn-cek-kta"
              onClick={onOpenVerify}
              className="px-3 py-2 text-xs font-bold text-amber-200 hover:text-amber-100 bg-stone-900/90 border border-amber-500/40 hover:border-amber-400 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
              title="Cek keaslian KTA anggota digital"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cek KTA</span>
            </button>

            {/* 2. Consolidated Services Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="nav-btn-services-menu"
                onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  servicesMenuOpen
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                    : 'bg-stone-900/90 text-stone-200 border-stone-800 hover:border-amber-500/40 hover:text-amber-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Layanan & Info</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-amber-400/80 transition-transform duration-200 ${
                    servicesMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Categorized Dropdown Content */}
              {servicesMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-stone-950 border border-amber-500/40 shadow-2xl backdrop-blur-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Category 1: Layanan Publik & Pers */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 px-2.5 py-1">
                      Layanan Publik & Konsumen
                    </div>

                    <button
                      onClick={() => {
                        setServicesMenuOpen(false);
                        onOpenLegalAid();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-stone-900 border border-transparent hover:border-amber-500/30 transition-all flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Scale className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100 flex items-center justify-between">
                          <span>Posko Bantuan Hukum</span>
                          <span className="text-[9px] font-mono text-emerald-400 font-normal">Pro-Bono</span>
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          Advokasi sengketa konsumen & mediasi
                        </div>
                      </div>
                    </button>

                    {onOpenMediaCenter && (
                      <button
                        onClick={() => {
                          setServicesMenuOpen(false);
                          onOpenMediaCenter();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-900 border border-transparent hover:border-sky-500/30 transition-all flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 group-hover:scale-105 transition-transform shrink-0">
                          <Newspaper className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-sky-200 group-hover:text-sky-100 flex items-center justify-between">
                            <span>Pusat Media & Wartawan</span>
                            <span className="text-[9px] font-mono text-sky-400 font-normal">Pers & Rilis</span>
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            Siaran pers, akreditasi liputan & media kit
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Category 2: Transparansi & Tata Kelola */}
                  <div className="pt-2 mt-2 border-t border-stone-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 px-2.5 py-1">
                      Transparansi & Legalitas
                    </div>

                    {onOpenFinancialReport && (
                      <button
                        onClick={() => {
                          setServicesMenuOpen(false);
                          onOpenFinancialReport();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-900 border border-transparent hover:border-emerald-500/30 transition-all flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                          <Wallet className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-emerald-200 group-hover:text-emerald-100 flex items-center justify-between">
                            <span>Kas Organisasi</span>
                            <span className="text-[9px] font-mono text-emerald-400 font-normal">Transparan</span>
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            Laporan kas masuk & keluar akuntabel
                          </div>
                        </div>
                      </button>
                    )}

                    {onOpenDocuments && (
                      <button
                        onClick={() => {
                          setServicesMenuOpen(false);
                          onOpenDocuments();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-900 border border-transparent hover:border-amber-500/30 transition-all flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-stone-800 text-stone-300 border border-stone-700 group-hover:scale-105 transition-transform shrink-0">
                          <FileText className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-stone-200 group-hover:text-stone-100 flex items-center justify-between">
                            <span>Surat & Dokumen Resmi</span>
                            <span className="text-[9px] font-mono text-amber-400/80 font-normal">7 Template</span>
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            Surat tugas, kuasa, dan BAP mediasi
                          </div>
                        </div>
                      </button>
                    )}

                    {onOpenTerms && (
                      <button
                        onClick={() => {
                          setServicesMenuOpen(false);
                          onOpenTerms();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-900 border border-transparent hover:border-stone-700 transition-all flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-stone-800 text-stone-300 border border-stone-700 group-hover:scale-105 transition-transform shrink-0">
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-stone-200 group-hover:text-stone-100 flex items-center justify-between">
                            <span>Syarat & Privasi PDP</span>
                            <span className="text-[9px] font-mono text-stone-400 font-normal">UU 27/2022</span>
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            Kode etik & perlindungan data anggota
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Category 3: Akses Pengurus */}
                  <div className="pt-2 mt-2 border-t border-stone-800">
                    <button
                      onClick={() => {
                        setServicesMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className={`w-full p-2.5 rounded-xl transition-all flex items-center gap-3 text-left group cursor-pointer border ${
                        isAdminLoggedIn
                          ? 'bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-900/40'
                          : 'bg-stone-900 border-amber-500/30 hover:bg-amber-500/10'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isAdminLoggedIn
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        } group-hover:scale-105 transition-transform`}
                      >
                        {isAdminLoggedIn ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span className={isAdminLoggedIn ? 'text-emerald-300' : 'text-amber-200'}>
                            {isAdminLoggedIn ? 'Panel Admin (Aktif)' : 'Login Pengurus / Admin'}
                          </span>
                          {pendingCount > 0 && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-500 text-stone-950 rounded-full">
                              {pendingCount} Baru
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {isAdminLoggedIn
                            ? 'Kelola anggota, KTA & pengaturan'
                            : 'Verifikasi anggota & posko pengaduan'}
                        </div>
                      </div>
                    </button>

                    {isAdminLoggedIn && onLogoutAdmin && (
                      <div className="pt-1.5 px-1">
                        <button
                          onClick={() => {
                            setServicesMenuOpen(false);
                            onLogoutAdmin();
                          }}
                          className="w-full py-1.5 px-3 rounded-lg text-[11px] font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
                          <span>Keluar dari Sesi Admin</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* 3. Primary CTA: Daftar Anggota */}
            <button
              id="nav-btn-register"
              onClick={onOpenRegister}
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(234,179,8,0.35)] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Daftar</span>
            </button>
          </div>

          {/* Mobile/Tablet Clean Action Strip (Below lg) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Cek KTA Button for Mobile */}
            <button
              onClick={onOpenVerify}
              className="px-2.5 py-1.5 text-xs font-bold text-amber-200 bg-stone-900 border border-amber-500/40 rounded-xl hover:bg-stone-800 flex items-center gap-1 cursor-pointer shrink-0"
              title="Cek KTA"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">Cek KTA</span>
            </button>

            {/* Single Clean Hamburger Button with Badge */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 text-amber-300 hover:text-amber-100 bg-stone-900 border border-amber-500/40 rounded-xl focus:outline-none cursor-pointer flex items-center justify-center relative shrink-0"
              aria-label="Buka Menu Navigasi"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-amber-400" />
              ) : (
                <Menu className="w-5 h-5 text-amber-400" />
              )}
              {pendingCount > 0 && !mobileMenuOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse border-2 border-stone-950"></span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Redesigned Touch-Friendly Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-950 border-b border-amber-500/30 px-4 py-5 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-300 max-h-[85vh] overflow-y-auto">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="text-xs font-bold font-serif uppercase text-amber-300 tracking-wider flex items-center gap-2">
              <TSNLogo size="sm" showText={false} />
              <span>MENU LENGKAP LPKSM TSN</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-amber-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Quick Primary Services */}
          <div className="space-y-2 bg-stone-900/70 p-3 rounded-2xl border border-amber-500/30">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-1">
              Layanan Cepat
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLegalAid();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-left text-xs font-bold text-amber-200 flex flex-col justify-between cursor-pointer hover:bg-amber-500/20"
              >
                <Scale className="w-4 h-4 text-amber-400 mb-1" />
                <span>Posko Hukum</span>
                <span className="text-[9px] text-emerald-400 font-mono">Bebas Biaya</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 text-left text-xs font-black uppercase flex flex-col justify-between cursor-pointer hover:brightness-110"
              >
                <UserPlus className="w-4 h-4 text-stone-950 mb-1" />
                <span>Daftar Anggota</span>
                <span className="text-[9px] text-stone-900 font-sans font-semibold">Formulir Online</span>
              </button>
            </div>
          </div>

          {/* Section 2: Halaman Navigasi */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
              Navigasi Halaman
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-amber-400/80" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                </button>
              );
            })}
          </div>

          {/* Section 3: Transparansi & Portal Admin */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 px-1">
              Transparansi & Media
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {onOpenFinancialReport && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenFinancialReport();
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-emerald-300 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:bg-emerald-950/60"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Kas Organisasi (Transparansi)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Laporan</span>
                </button>
              )}

              {onOpenMediaCenter && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenMediaCenter();
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-sky-200 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-center justify-between cursor-pointer hover:bg-sky-950/60"
                >
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-sky-400" />
                    <span>Pusat Informasi Media (Wartawan)</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400">Pers</span>
                </button>
              )}

              {onOpenDocuments && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDocuments();
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-stone-300 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-850"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Surat & Dokumen Resmi LPKSM</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">Berkas</span>
                </button>
              )}

              {onOpenTerms && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTerms();
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-stone-400 rounded-xl bg-stone-900/60 border border-stone-850 flex items-center justify-between cursor-pointer hover:bg-stone-850"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-stone-400" />
                    <span>Syarat & Privasi PDP (UU 27/2022)</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">Legal</span>
                </button>
              )}

              {/* Login Admin */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-between cursor-pointer ${
                  isAdminLoggedIn
                    ? 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40'
                    : 'text-amber-300 border-amber-500/40 bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{isAdminLoggedIn ? 'Panel Admin (Aktif)' : 'Login Pengurus / Admin'}</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono bg-amber-500 text-stone-950 font-black rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>

              {isAdminLoggedIn && onLogoutAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogoutAdmin();
                  }}
                  className="w-full py-1.5 px-3 text-[11px] font-bold text-rose-300 hover:bg-rose-950/60 rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Logout Sesi Admin</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </header>
  );
};
