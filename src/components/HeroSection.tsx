import React from 'react';
import { TSNLogo } from './TSNLogo';
import { ShieldCheck, UserPlus, Scale, Award, Wallet, ArrowRight, CheckCircle2, QrCode } from 'lucide-react';
import tsnHeroBg from '../assets/images/tsn_hero_bg_1786004372007.jpg';
import { SiteConfig } from '../types';

interface HeroSectionProps {
  onOpenRegister: () => void;
  onOpenVerify: () => void;
  onOpenLegalAid: () => void;
  onOpenFinancialReport?: () => void;
  onScrollToAbout: () => void;
  siteConfig?: SiteConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenRegister,
  onOpenVerify,
  onOpenLegalAid,
  onOpenFinancialReport,
  onScrollToAbout,
  siteConfig,
}) => {
  const headline = siteConfig?.heroHeadline || siteConfig?.orgName || 'TEAM SENYAP NUSANTARA';
  const tagline = siteConfig?.heroTagline || siteConfig?.subTitle || 'Solid • Integritas • Kebersamaan';
  const description =
    siteConfig?.heroDescription ||
    'Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) dan komunitas kemanusiaan yang bergerak dalam senyap membela hak-hak rakyat, penanganan bencana, aksi sosial, serta bantuan hukum pro-bono di seluruh pelosok Indonesia.';

  return (
    <section id="hero" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-stone-950 py-12 lg:py-20">
      {/* Background Glows & Metallic Gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/70 via-stone-950 to-stone-950">
        <img
          src={tsnHeroBg}
          alt="TSN Hero Gold Background"
          className="w-full h-full object-cover opacity-35 mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-stone-950/90 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Authoritative Identity & Direct Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top State Accreditation Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/90 to-stone-900 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>LPKSM Resmi Terdaftar • Kabupaten Jember</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 leading-tight uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                {headline}
              </h1>
              <p className="mt-2 text-base sm:text-2xl font-bold tracking-widest text-amber-200/90 font-serif uppercase">
                {tagline}
              </p>
            </div>

            {/* Strategic Pillars Tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-amber-300/80 uppercase tracking-wider">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25">Advokasi Konsumen</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25">Aksi Kemanusiaan</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25">Bantuan Hukum Pro-Bono</span>
            </div>

            {/* Mission Statement */}
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
              {description}
            </p>

            {/* Clean Primary Actions (No duplicate buttons) */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <button
                id="btn-hero-legal-aid"
                onClick={onOpenLegalAid}
                className="px-6 py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow-[0_0_20px_rgba(234,179,8,0.45)] transition-all flex items-center gap-2 cursor-pointer font-serif"
              >
                <Scale className="w-4 h-4 text-stone-950" />
                <span>Posko Pengaduan Hukum</span>
              </button>

              <button
                id="btn-hero-verify-kta"
                onClick={onOpenVerify}
                className="px-5 py-3.5 text-xs sm:text-sm font-bold tracking-wider text-amber-200 bg-stone-900/90 border border-amber-500/50 rounded-xl hover:border-amber-400 hover:bg-stone-800 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Cek Keaslian KTA</span>
              </button>

              <button
                onClick={onScrollToAbout}
                className="text-xs font-semibold text-amber-300/80 hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer px-2 py-2"
              >
                <span>Pelajari Profil Lembaga</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Key Trust Metrics */}
            <div className="pt-5 border-t border-amber-500/20 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-amber-300 font-serif">
                  {siteConfig?.statMembersCount || '500+'}
                </div>
                <div className="text-[11px] text-stone-400">Anggota Terdaftar</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-amber-300 font-serif">
                  {siteConfig?.statProvincesCount || '34'}
                </div>
                <div className="text-[11px] text-stone-400">Wilayah Sebaran</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-serif">
                  {siteConfig?.statProBonoRate || '100%'}
                </div>
                <div className="text-[11px] text-stone-400">Layanan Pro-Bono</div>
              </div>
            </div>
          </div>

          {/* Right Column: Prestige KTA Showcase & Non-Duplicated Services */}
          <div className="lg:col-span-5 relative">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-stone-900/95 via-stone-900/90 to-stone-950 border border-amber-500/40 shadow-2xl backdrop-blur-md space-y-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <TSNLogo size="sm" showText={false} />
                  <div>
                    <h3 className="text-xs font-bold font-serif text-amber-200 uppercase tracking-wide">
                      Identitas Digital Anggota
                    </h3>
                    <p className="text-[10px] text-stone-400 font-mono">Standar Resmi LPKSM TSN</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Sistem Aktif</span>
                </span>
              </div>

              {/* Realistic Mini KTA Preview Showcase */}
              <div
                onClick={onOpenVerify}
                className="relative rounded-2xl bg-gradient-to-tr from-stone-950 via-amber-950/70 to-stone-900 p-4 border border-amber-500/50 shadow-xl cursor-pointer group hover:border-amber-400 transition-all overflow-hidden"
              >
                {/* Gold Glow line */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <TSNLogo size="sm" showText={false} />
                    <div>
                      <div className="text-[11px] font-black font-serif text-amber-200 tracking-wider">
                        KARTU TANDA ANGGOTA
                      </div>
                      <div className="text-[8.5px] text-amber-400/80 font-mono">
                        LPKSM SENYAP NUSANTARA JAYA
                      </div>
                    </div>
                  </div>
                  {/* Hologram Badge */}
                  <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 text-[9px] font-bold uppercase tracking-wider shadow">
                    ORIGINAL
                  </div>
                </div>

                {/* Card Sample Details */}
                <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs relative z-10">
                  <div>
                    <div className="text-[9px] text-stone-400 uppercase">Nomor Registrasi Anggota</div>
                    <div className="font-mono font-bold text-amber-300 text-sm tracking-wider">
                      TSN-JBR-2024-XXXX
                    </div>
                    <div className="text-[10px] text-stone-300 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Terdaftar & Berhak Pendampingan UU 8/1999</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-stone-900/90 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-500/15 flex items-center justify-between text-[10px] text-amber-300/80 font-medium">
                  <span>Klik untuk Cari ID / Scan QR</span>
                  <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Verifikasi Sekarang →
                  </span>
                </div>
              </div>

              {/* Two Distinct Complementary Services (No Duplication) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* 1. Pendaftaran Anggota Baru */}
                <button
                  id="btn-hero-register"
                  onClick={onOpenRegister}
                  className="p-3 rounded-xl bg-stone-950/80 border border-amber-500/25 hover:border-amber-400 hover:bg-amber-500/10 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-105 transition-transform">
                      <UserPlus className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold font-serif text-amber-200 uppercase group-hover:text-amber-300">
                      Daftar Anggota
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 leading-tight">
                    Formulir online relawan & anggota resmi TSN
                  </p>
                </button>

                {/* 2. Kas Transparansi Keuangan */}
                {onOpenFinancialReport && (
                  <button
                    id="btn-hero-finance"
                    onClick={onOpenFinancialReport}
                    className="p-3 rounded-xl bg-stone-950/80 border border-emerald-500/25 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold font-serif text-emerald-200 uppercase group-hover:text-emerald-300">
                        Kas Organisasi
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      Laporan kas & transparansi keuangan
                    </p>
                  </button>
                )}
              </div>

              {/* Trust Subtext */}
              <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 text-center font-medium">
                Komitmen Bersama: Pelayanan Bebas Pungutan Liar & Berintegritas
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
