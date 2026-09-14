import React from 'react';
import { TSNLogo } from './TSNLogo';
import { Heart, HandHeart, Scale, Handshake, Shield, CheckCircle2, Compass, Target } from 'lucide-react';
import { SiteConfig } from '../types';

interface AboutSectionProps {
  onOpenLegalAid?: () => void;
  onOpenRegister?: () => void;
  siteConfig?: SiteConfig;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ siteConfig }) => {
  const pillars = [
    {
      id: 'sosial',
      title: 'Sosial',
      subtitle: 'Bakti Sosial & Kesejahteraan',
      icon: Heart,
      description:
        'Penyaluran sembako rutin, santunan yatim dan lansia dhuafa, layanan kesehatan cuma-cuma, serta aksi pemberdayaan ekonomi masyarakat prasejahtera.',
    },
    {
      id: 'kemanusiaan',
      title: 'Kemanusiaan',
      subtitle: 'Tanggap Bencana & Aksi Cepat',
      icon: HandHeart,
      description:
        'Tim Reaksi Cepat (TRC) siaga bencana alam, pendirian dapur umum mandiri, pendistribusian logistik darurat, dan evakuasi korban terdampak musibah.',
    },
    {
      id: 'bantuan-hukum',
      title: 'Bantuan Hukum',
      subtitle: 'Advokasi & Hak Konsumen',
      icon: Scale,
      description:
        'Pendampingan hukum pro-bono (bebas biaya) bagi masyarakat kecil dan konsumen yang menghadapi sengketa sepihak, diskriminasi, atau penindasan.',
    },
    {
      id: 'kerjasama',
      title: 'Kerjasama',
      subtitle: 'Sinergi Lintas Sektor',
      icon: Handshake,
      description:
        'Membangun kemitraan strategis dengan dinas perindustrian & perdagangan, aparat penegak hukum, lembaga medis, serta seluruh elemen masyarakat sipil.',
    },
  ];

  return (
    <section id="profil" className="py-20 bg-stone-900 relative overflow-hidden text-stone-100">
      {/* Background Subtle Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Icon & Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <TSNLogo size="md" showText={false} className="mx-auto" logoUrl={siteConfig?.logoUrl} />

          <h2 className="text-3xl sm:text-4xl font-black font-serif uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-wider">
            {siteConfig?.aboutTitle || 'PROFIL & LEGALITAS ORGANISASI'}
          </h2>

          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />

          <p className="text-stone-300 text-base sm:text-lg leading-relaxed font-sans">
            {siteConfig?.aboutText1 ||
              'Team Senyap Nusantara adalah wadah pengabdian sosial dan kemanusiaan yang menaungi Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) Senyap Nusantara Jaya. Berkedudukan di Kabupaten Jember, Jawa Timur, kami mengabdi demi keadilan sosial tanpa membedakan suku, agama, maupun golongan.'}
          </p>
          {siteConfig?.aboutText2 && (
            <p className="text-amber-200/90 text-sm sm:text-base leading-relaxed font-sans pt-1">
              {siteConfig.aboutText2}
            </p>
          )}
        </div>

        {/* Legal Credentials & State Registration Badge Bar */}
        <div className="mt-10 max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border border-amber-500/40 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                  LEGALITAS RESMI TERDAFTAR NEGARA
                </div>
                <div className="text-base sm:text-lg font-bold text-stone-100 font-serif">
                  LPKSM Senyap Nusantara Jaya
                </div>
                <div className="text-xs text-stone-400">
                  Landasan Yuridis: UU RI No. 8/1999 (UUPK) jo. Permendag RI No. 35/2021
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-[11px] font-mono">
              <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-500/30 text-amber-300">
                <span className="text-stone-400">TDLPK: </span>
                <strong className="text-amber-200">{siteConfig?.tdlpkNumber || '510/024/TDLPK/DISPERINDAG/2024'}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-500/30 text-amber-300">
                <span className="text-stone-400">AHU: </span>
                <strong className="text-amber-200">{siteConfig?.kemenkumhamNumber || 'AHU-0004521.AH.01.07.2024'}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-500/30 text-amber-300">
                <span className="text-stone-400">NPWP: </span>
                <strong className="text-amber-200">{siteConfig?.npwpNumber || '14.285.901.4-626.000'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Card (Professional, Clear, Meaningful) */}
        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visi */}
          <div className="p-6 rounded-2xl bg-stone-950/80 border border-amber-500/25 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-300">
              <Compass className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold font-serif uppercase tracking-wider">Visi Organisasi</h3>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">
              Menjadi benteng terdepan perlindungan hak konsumen dan pelopor aksi kemanusiaan yang berintegritas, mandiri, responsif, dan senantiasa berpihak pada keadilan masyarakat lemah.
            </p>
          </div>

          {/* Misi */}
          <div className="p-6 rounded-2xl bg-stone-950/80 border border-amber-500/25 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-300">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold font-serif uppercase tracking-wider">Misi Pengabdian</h3>
            </div>
            <ul className="text-stone-300 text-sm space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Pendampingan hukum dan advokasi mediasi konsumen secara pro-bono (bebas biaya).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Aksi tanggap bencana dan penyaluran sembako langsung ke masyarakat terdampak.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Membangun kesadaran literasi hak-hak konsumen di seluruh pelosok Nusantara.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="mt-14">
          <div className="text-center mb-8">
            <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest">
              FOKUS PENGABDIAN
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 uppercase tracking-wide mt-1">
              Empat Pilar Utama Team Senyap Nusantara
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="group relative p-6 rounded-2xl bg-stone-950/80 border border-amber-500/30 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col justify-between"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-950 to-stone-900 border border-amber-500/50 flex items-center justify-center text-amber-300 mx-auto group-hover:scale-105 group-hover:text-amber-200 shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all">
                      <IconComponent className="w-7 h-7 stroke-[1.75]" />
                    </div>

                    <h4 className="mt-5 text-lg font-bold font-serif text-amber-200 text-center tracking-wide">
                      {pillar.title}
                    </h4>

                    <div className="text-[11px] font-semibold text-amber-400/80 text-center uppercase tracking-wider mt-0.5">
                      {pillar.subtitle}
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-stone-300 text-center leading-relaxed font-sans">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-amber-500/20 text-center">
                    <span className="text-xs font-semibold text-amber-300/80 group-hover:text-amber-200 flex items-center justify-center gap-1 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Integritas TSN</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dignified Motto Banner (No duplicate buttons) */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-950 to-amber-950/40 border border-amber-500/30 text-center space-y-2">
          <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-200 uppercase tracking-widest">
            Motto: Solid • Integritas • Kebersamaan
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mx-auto italic">
            "Bergerak dalam senyap, bertindak cepat untuk kemanusiaan, membela keadilan tanpa pamrih bagi seluruh rakyat Indonesia."
          </p>
        </div>
      </div>
    </section>
  );
};
