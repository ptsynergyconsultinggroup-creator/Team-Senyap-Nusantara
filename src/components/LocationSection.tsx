import React from 'react';
import { MapPin, Navigation, Phone, Clock, ExternalLink, Building2, MessageSquare } from 'lucide-react';

interface LocationSectionProps {
  onOpenLegalAid?: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = () => {
  const officeAddress =
    'Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kabupaten Jember, Jawa Timur 68161';
  const officeName = 'KANTOR LPKSM SENYAP NUSANTARA JAYA';

  const mapsQuery = encodeURIComponent(`${officeName}, ${officeAddress}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <section id="kontak" className="py-20 bg-stone-900 text-stone-100 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider font-mono">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Markas Resmi Organisasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            SEKRETARIAT PUSAT & POSKO PENGADUAN
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          <p className="text-stone-300 max-w-2xl mx-auto text-sm sm:text-base">
            Kunjungi sekretariat resmi LPKSM Senyap Nusantara Jaya untuk konsultasi tatap muka, pengaduan konsumen, dan koordinasi relawan.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Office Details Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-amber-400 tracking-wider font-mono">
                  Sekretariat Utama Jember
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
                  {officeName}
                </h3>
                <p className="text-xs text-stone-400">
                  Lembaga Perlindungan Konsumen Swadaya Masyarakat & Posko Kemanusiaan
                </p>
              </div>

              <div className="space-y-4 text-sm text-stone-300">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-900 border border-amber-500/20">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-200 text-xs uppercase mb-0.5">Alamat Lengkap</div>
                    <div className="leading-relaxed text-xs">{officeAddress}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-900 border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-200 text-xs uppercase mb-0.5">Jam Pelayanan Posko</div>
                    <div className="text-xs">Senin – Sabtu: 08.00 – 17.00 WIB</div>
                    <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                      Layanan Darurat Bencana & TRC: Siaga 24 Jam
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-900 border border-amber-500/20">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <div className="font-bold text-amber-200 text-xs uppercase mb-0.5">Kontak Resmi & WhatsApp</div>
                    <div className="flex flex-wrap items-center gap-2 my-1">
                      <a
                        href="https://wa.me/6282332626916"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-amber-300 hover:text-amber-100 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 transition-all"
                      >
                        <span>0823-3262-6916</span>
                        <span className="text-[10px] bg-emerald-500 text-stone-950 px-1.5 py-0.2 rounded font-sans font-bold">
                          WA Aktif
                        </span>
                      </a>
                    </div>
                    <div className="text-[11px] text-stone-400">Pusat Informasi, Konsultasi & Pengaduan Cepat</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Directions & WhatsApp Actions */}
            <div className="space-y-2.5 pt-4 border-t border-amber-500/20">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(234,179,8,0.3)]"
              >
                <Navigation className="w-4 h-4" />
                <span>Buka Rute di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>

              <a
                href="https://wa.me/6282332626916"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 rounded-xl hover:bg-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Hubungi Posko via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Location Map Display */}
          <div className="lg:col-span-7 rounded-2xl bg-stone-950 border border-amber-500/30 overflow-hidden shadow-2xl relative min-h-[380px] flex flex-col">
            <div className="bg-stone-900 p-3.5 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-200 font-bold font-serif uppercase">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Peta Lokasi Kantor Jember, Jawa Timur
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono font-normal">Kec. Balung, Kab. Jember</span>
            </div>

            {/* Map Embed with clear overlay */}
            <div className="relative flex-1 bg-stone-900 overflow-hidden min-h-[320px]">
              <iframe
                title="Kantor LPKSM Senyap Nusantara Jaya Jember"
                src={`https://maps.google.com/maps?q=-8.2662,113.5358&z=14&output=embed`}
                className="w-full h-full min-h-[340px] border-0 filter grayscale opacity-90 hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 p-3 rounded-xl bg-stone-950/95 border border-amber-500/40 backdrop-blur-md shadow-lg max-w-xs space-y-1">
                <div className="text-xs font-bold text-amber-300 font-serif">LPKSM SENYAP NUSANTARA JAYA</div>
                <div className="text-[10px] text-stone-300">Jl. Lumajang - Jember, Balung, Jember 68161</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
