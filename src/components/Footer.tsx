import React from 'react';
import { TSNLogo } from './TSNLogo';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Send, Scale, ShieldCheck, UserPlus, Clock, LayoutDashboard, Newspaper, Lock } from 'lucide-react';
import { SiteConfig } from '../types';

interface FooterProps {
  onOpenRegister: () => void;
  onOpenVerify: () => void;
  onOpenLegalAid: () => void;
  onOpenAdmin: () => void;
  onOpenMediaCenter?: () => void;
  onOpenTerms?: (tab?: 'terms' | 'privacy') => void;
  siteConfig?: SiteConfig;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRegister,
  onOpenVerify,
  onOpenLegalAid,
  onOpenAdmin,
  onOpenMediaCenter,
  onOpenTerms,
  siteConfig,
}) => {
  const orgName = siteConfig?.orgName || 'TEAM SENYAP NUSANTARA';
  const subTitle = siteConfig?.subTitle || 'LPKSM SENYAP NUSANTARA JAYA';
  const phoneHotline = siteConfig?.phoneHotline || '0823-3262-6916';
  const whatsappNumber = siteConfig?.whatsappNumber || '6282332626916';
  const email = siteConfig?.email || 'info@teamsenyapnusantara.org';
  const address = siteConfig?.address || 'Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kabupaten Jember, Jawa Timur 68161';

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-amber-500/20 pt-16 pb-12 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-amber-500/15">

          {/* Col 1: Logo Brand & Official Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <TSNLogo size="sm" showText={false} logoUrl={siteConfig?.logoUrl} />
              <div>
                <div className="text-xl font-black font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500">
                  {orgName}
                </div>
                <div className="text-[10px] font-bold text-amber-200/80 tracking-widest uppercase">
                  {subTitle}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) resmi & organisasi kemanusiaan yang berintegritas tinggi dalam pelayanan sosial, penanganan bencana, dan advokasi hukum pro-bono.
            </p>

            <div className="p-3 rounded-xl bg-stone-900/90 border border-amber-500/20 text-[11px] font-mono space-y-1 text-stone-300">
              <div className="text-[10px] uppercase font-bold text-amber-400 font-sans">Legalitas Resmi Terdaftar:</div>
              <div>TDLPK: <span className="text-amber-200 font-bold">{siteConfig?.tdlpkNumber || '510/024/TDLPK/DISPERINDAG/2024'}</span></div>
              <div>Kemenkumham: <span className="text-amber-200 font-bold">{siteConfig?.kemenkumhamNumber || 'AHU-0004521.AH.01.07.2024'}</span></div>
              <div>NPWP: <span className="text-amber-200 font-bold">{siteConfig?.npwpNumber || '14.285.901.4-626.000'}</span></div>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-2">
                Media Sosial & Kanal Resmi
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all cursor-pointer"
                  title="Facebook TSN"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all cursor-pointer"
                  title="Twitter TSN"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all cursor-pointer"
                  title="Instagram TSN"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all cursor-pointer"
                  title="Telegram TSN"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-amber-200 pb-1 border-b border-amber-500/20 inline-block">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href="#hero" className="hover:text-amber-300 transition-colors">
                  Halaman Utama
                </a>
              </li>
              <li>
                <a href="#profil" className="hover:text-amber-300 transition-colors">
                  Profil & Legalitas
                </a>
              </li>
              <li>
                <a href="#program" className="hover:text-amber-300 transition-colors">
                  Program Kerja & Aksi
                </a>
              </li>
              <li>
                <a href="#galeri" className="hover:text-amber-300 transition-colors">
                  Galeri Dokumentasi
                </a>
              </li>
              <li>
                <a href="#berita" className="hover:text-amber-300 transition-colors">
                  Warta & Berita
                </a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-amber-300 transition-colors">
                  Posko & Sekretariat
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Services & Action Modals */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-amber-200 pb-1 border-b border-amber-500/20 inline-block">
              Layanan Publik & Media
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button
                  onClick={onOpenVerify}
                  className="hover:text-amber-300 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-300 hover:translate-x-0.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Verifikasi KTA Digital Anggota</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLegalAid}
                  className="hover:text-amber-300 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-300 hover:translate-x-0.5"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Posko Bantuan Hukum Konsumen</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenRegister}
                  className="hover:text-amber-300 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-300 hover:translate-x-0.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Pendaftaran Anggota Baru TSN</span>
                </button>
              </li>
              {onOpenMediaCenter && (
                <li>
                  <button
                    onClick={onOpenMediaCenter}
                    className="hover:text-sky-300 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-sky-200 hover:translate-x-0.5 font-medium"
                  >
                    <Newspaper className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Pusat Informasi Media & Pers</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-amber-300/90 hover:translate-x-0.5 font-semibold pt-1 border-t border-stone-800"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Portal Khusus Pengurus & Admin</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Office Contact Info */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-amber-200 pb-1 border-b border-amber-500/20 inline-block">
              Sekretariat & Hotline
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-900/80 border border-amber-500/20">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-amber-300 block">{subTitle}</span>
                  <p className="text-[11px] text-stone-300 leading-tight">
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-amber-300 hover:text-amber-100 text-xs font-semibold hover:underline"
                >
                  {phoneHotline} (WA & Call)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-stone-300 text-xs">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-amber-200/80 text-[11px]">Posko Pengaduan: 08.00 - 17.00 WIB</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Legal compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div className="flex items-center gap-2 text-stone-400 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Team Senyap Nusantara & LPKSM Senyap Nusantara Jaya.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-400">
            <span className="text-amber-400/80 font-medium">Kabupaten Jember, Jawa Timur</span>
            <span>•</span>
            {onOpenTerms && (
              <>
                <button
                  onClick={() => onOpenTerms('terms')}
                  className="hover:text-amber-300 transition-colors underline cursor-pointer"
                >
                  Syarat & Ketentuan
                </button>
                <span>•</span>
                <button
                  onClick={() => onOpenTerms('privacy')}
                  className="hover:text-amber-300 transition-colors underline cursor-pointer"
                >
                  Kebijakan Privasi (UU PDP 27/2022)
                </button>
                <span>•</span>
              </>
            )}
            <button
              onClick={onOpenAdmin}
              className="text-stone-500 hover:text-amber-400/80 transition-colors cursor-pointer"
            >
              Login Pengurus
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
