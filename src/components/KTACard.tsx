import React, { useState, useRef } from 'react';
import { Member } from '../types';
import { TSNLogo } from './TSNLogo';
import {
  RotateCw,
  Printer,
  CheckCircle2,
  QrCode,
  Building2,
  Phone,
  Award,
  ShieldCheck,
  X,
  Sparkles,
  Share2,
  Check,
  Clock,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';
import { PrintableKTAModal } from './PrintableKTAModal';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface KTACardProps {
  member: Member;
  className?: string;
  showPrintOption?: boolean;
}

export const KTACard: React.FC<KTACardProps> = ({ member, className = '', showPrintOption = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showFullNik, setShowFullNik] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isAdminAuthenticated =
    typeof window !== 'undefined' &&
    window.sessionStorage.getItem('tsn_admin_session') === 'active';

  const verificationUrl = `${window.location.origin}?verify=${member.id}`;

  const maskNIK = (nik?: string) => {
    if (!nik) return '3509********0001';
    const clean = nik.trim();
    if (clean.length < 10) return '3509********0001';
    return clean.slice(0, 4) + '********' + clean.slice(-4);
  };

  const handleShare = async () => {
    const shareData = {
      title: `KTA LPKSM TSN - ${member.name}`,
      text: `Kartu Tanda Anggota Resmi LPKSM Senyap Nusantara Jaya atas nama ${member.name} (ID: ${member.id}). Verifikasi keabsahan KTA secara instant melalui tautan resmi berikut:`,
      url: verificationUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const isPending = member.status === 'Menunggu Verifikasi';
  const isInactive = member.status === 'Nonaktif';
  const isActive = !isPending && !isInactive;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Hidden QRCodeCanvas for Canvas Exporting */}
      <div className="hidden">
        <QRCodeCanvas
          id={`kta-qr-canvas-${member.id}`}
          value={verificationUrl}
          size={160}
          level="H"
          marginSize={1}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-3.5 py-2 text-xs font-bold text-amber-300 bg-stone-900 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCw className="w-4 h-4 text-amber-400" />
          <span>Putar Kartu ({isFlipped ? 'Tampak Belakang' : 'Tampak Depan'})</span>
        </button>

        <button
          onClick={() => setIsQrModalOpen(true)}
          className="px-3.5 py-2 text-xs font-bold text-emerald-300 bg-stone-900 border border-emerald-500/40 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Scan QR Verifikasi</span>
        </button>

        <button
          onClick={handleShare}
          className="px-3.5 py-2 text-xs font-bold text-sky-300 bg-stone-900 border border-sky-500/40 rounded-xl hover:bg-sky-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          title="Bagikan Tautan Verifikasi KTA ke Medsos / WhatsApp"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Link Tersalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Bagikan KTA</span>
            </>
          )}
        </button>

        {showPrintOption && (
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF KTA (Presisi KTP)</span>
          </button>
        )}
      </div>

      {/* Card Container - Ratio 85.6mm x 53.98mm (KTP ISO 7810 Standard) */}
      <div className="perspective-1000 w-full max-w-[440px] aspect-[85.6/53.98] relative group">
        <div
          ref={cardRef}
          className={`w-full h-full duration-700 preserve-3d transition-transform relative rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT SIDE (TAMPAK DEPAN) ================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-stone-950 border-[2px] border-amber-500/90 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden backface-hidden shadow-2xl bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-950 via-stone-950 to-stone-950">
            {/* Fine Metallic Border Inner Ring */}
            <div className="absolute inset-1 rounded-xl border border-amber-500/35 pointer-events-none" />

            {/* Background Guilloche Watermark Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
            <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* STATUS WATERMARK OVERLAYS */}
            {isPending && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none">
                <div className="rotate-[-25deg] px-6 py-2 border-2 border-dashed border-amber-400/80 bg-amber-950/80 backdrop-blur-[1px] text-amber-300 font-black text-xs sm:text-sm tracking-widest uppercase shadow-2xl">
                  DRAFT / MENUNGGU VERIFIKASI
                </div>
              </div>
            )}

            {isInactive && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none">
                <div className="rotate-[-25deg] px-6 py-2 border-2 border-rose-500/80 bg-rose-950/85 backdrop-blur-[1px] text-rose-300 font-black text-xs sm:text-sm tracking-widest uppercase shadow-2xl">
                  KTA NONAKTIF / DICABUT
                </div>
              </div>
            )}

            {/* Header Kop Kartu */}
            <div className="relative z-10 border-b border-amber-500/40 pb-1 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <TSNLogo size="sm" showText={false} />
                <div className="min-w-0">
                  <div className="text-[8.5px] sm:text-[9.5px] font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 uppercase truncate leading-tight">
                    KARTU TANDA ANGGOTA RESMI
                  </div>
                  <div className="text-[7.5px] sm:text-[8px] font-black tracking-wider text-amber-300 uppercase leading-none truncate">
                    LPKSM SENYAP NUSANTARA JAYA
                  </div>
                  <div className="text-[6px] sm:text-[6.5px] text-amber-200/70 truncate tracking-tight font-sans mt-0.5">
                    Jl. Lumajang - Jember, Kebon, Tutul, Balung, Jember 68161
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`px-1.5 py-0.5 rounded border text-[7px] sm:text-[8px] font-black flex items-center gap-1 shrink-0 shadow ${
                  isActive
                    ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-400'
                    : isPending
                    ? 'bg-amber-950/90 border-amber-500/80 text-amber-300'
                    : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
                }`}
              >
                {isActive ? (
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                ) : isPending ? (
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                ) : (
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                )}
                <span>{member.status.toUpperCase()}</span>
              </div>
            </div>

            {/* Main Content Body: Photo & Member Data Grid */}
            <div className="relative z-10 grid grid-cols-12 gap-2 my-auto items-center">
              {/* Photo Frame (35% Width) */}
              <div className="col-span-4 flex flex-col items-center justify-center">
                <div className="relative rounded p-0.5 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-800 shadow-lg w-full max-w-[92px]">
                  <div className="aspect-[3/4] rounded bg-stone-900 overflow-hidden relative">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* Hologram Watermark Badge */}
                    <div className="absolute bottom-0.5 right-0.5 bg-amber-500/90 text-stone-950 font-black text-[5.5px] px-1 rounded backdrop-blur-sm border border-amber-300 flex items-center gap-0.5">
                      <Award className="w-2 h-2 text-stone-950" />
                      <span>{isActive ? 'ORIGINAL' : 'VERIFY'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[6.5px] font-mono font-bold text-amber-400 mt-1 uppercase tracking-tight text-center truncate max-w-full">
                  ID: {member.id}
                </div>
              </div>

              {/* Member Data Details (65% Width) */}
              <div className="col-span-8 space-y-1 text-stone-100 pl-0.5">
                <div>
                  <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold tracking-wider">
                    Nama Lengkap
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase font-serif text-amber-100 truncate leading-tight">
                    {member.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5">
                  <div>
                    <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold flex items-center gap-1">
                      <span>NIK</span>
                      {isAdminAuthenticated && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullNik(!showFullNik);
                          }}
                          className="text-amber-400 hover:text-amber-200"
                          title="Admin: Buka / Tutup Sensor NIK"
                        >
                          {showFullNik ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>
                    <div className="font-mono font-bold text-amber-300 text-[8px] sm:text-[9px] truncate">
                      {isAdminAuthenticated && showFullNik ? member.nik : maskNIK(member.nik)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold">Jabatan</div>
                    <div className="font-semibold text-amber-100 text-[8px] sm:text-[9px] truncate">
                      {member.membershipType || member.division || 'Anggota Aktif'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold">Wilayah Tugas</div>
                    <div className="font-semibold text-stone-200 text-[8px] sm:text-[9px] truncate">
                      {member.region}
                    </div>
                  </div>
                  <div>
                    <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold">Masa Terbit</div>
                    <div className="text-[8px] sm:text-[8.5px] text-stone-300 truncate font-mono">
                      {member.joinDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Band */}
            <div className="relative z-10 pt-1 border-t border-amber-500/30 flex items-center justify-between gap-1">
              <div className="min-w-0">
                <div className="text-[8.5px] sm:text-[9px] font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 uppercase tracking-widest truncate">
                  TEAM SENYAP NUSANTARA
                </div>
                <div className="text-[6px] sm:text-[6.5px] font-semibold text-amber-200/80 tracking-wider uppercase truncate">
                  Kantor Pusat Jember • Kontak WA: 0823-3262-6916
                </div>
              </div>

              {/* QR Code Verification */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQrModalOpen(true);
                }}
                className="p-0.5 rounded bg-white border border-amber-500/70 shrink-0 cursor-pointer hover:scale-110 transition-transform shadow"
                title="Klik untuk Perbesar QR Code Verifikasi"
              >
                <QRCodeSVG
                  value={verificationUrl}
                  size={28}
                  level="M"
                  marginSize={1}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </button>
            </div>
          </div>

          {/* ================= BACK SIDE (TAMPAK BELAKANG) ================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-stone-950 border-[2px] border-amber-500/90 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden backface-hidden rotate-y-180 shadow-2xl bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-950 via-stone-950 to-stone-950">
            <div className="absolute inset-1 rounded-xl border border-amber-500/35 pointer-events-none" />

            {/* Back Header */}
            <div className="relative z-10 text-center space-y-0.5 border-b border-amber-500/30 pb-1">
              <div className="text-[7.5px] font-serif font-black tracking-widest text-amber-400 uppercase">
                KETENTUAN KARTU TANDA ANGGOTA (KTA)
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] font-serif font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase">
                LPKSM SENYAP NUSANTARA JAYA
              </div>
            </div>

            {/* Legal Notice Box with Anti-Pungli Warning */}
            <div className="relative z-10 px-2 py-1 my-auto space-y-1 bg-stone-900/90 rounded-xl border border-amber-500/30 text-[7px] sm:text-[8px] leading-tight text-stone-200">
              <p className="font-serif italic text-amber-100 text-center text-[7.5px] sm:text-[8.5px]">
                "Kartu ini adalah identitas resmi anggota LPKSM Senyap Nusantara Jaya yang terdaftar secara sah sesuai UU No. 8 Tahun 1999 tentang Perlindungan Konsumen."
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[6.5px] sm:text-[7px] text-stone-300">
                <li>Pemegang kartu berwenang mendampingi konsumen & giat sosial kemanusiaan.</li>
                <li className="text-amber-300 font-semibold">
                  DILARANG KERAS melakukan pungli, pemerasan, atau penyalahgunaan atribut.
                </li>
                <li>Jika menemukan kartu ini, mohon serahkan ke Sekretariat Pusat Jember.</li>
              </ul>
            </div>

            {/* Full Office Address & Contact Footer */}
            <div className="relative z-10 pt-1 border-t border-amber-500/30 space-y-0.5 text-center">
              <div className="text-[8px] font-bold text-amber-300 uppercase flex items-center justify-center gap-1">
                <Building2 className="w-2.5 h-2.5 text-amber-400" />
                <span>KANTOR PUSAT JEMBER</span>
              </div>
              <div className="text-[7px] font-serif text-amber-100/90 leading-tight">
                Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kab. Jember, Jawa Timur 68161
              </div>
              <div className="text-[7.5px] font-mono font-bold text-emerald-400 flex items-center justify-center gap-1 pt-0.5">
                <Phone className="w-2.5 h-2.5 text-emerald-400" />
                <span>HOTLINE PENGADUAN: 0823-3262-6916</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Inspection Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-stone-900 border border-amber-500/40 rounded-2xl p-6 text-center space-y-5 text-stone-100 shadow-2xl">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors rounded-lg bg-stone-950 border border-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>QR Verifikasi Resmi TSN</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold font-serif text-amber-200 uppercase">{member.name}</h4>
              <p className="text-xs text-stone-400 font-mono">
                ID KTA: {member.id} | Status:{' '}
                <strong
                  className={
                    isActive
                      ? 'text-emerald-400'
                      : isPending
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }
                >
                  {member.status}
                </strong>
              </p>
            </div>

            {/* Large Scannable QR Code */}
            <div className="p-4 bg-white rounded-2xl border-2 border-amber-500/80 inline-block shadow-2xl">
              <QRCodeSVG
                value={verificationUrl}
                size={200}
                level="H"
                marginSize={1}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>

            <div className="space-y-2 text-xs text-stone-300 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
              <p className="font-semibold text-amber-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Petunjuk Verifikasi Instant:</span>
              </p>
              <p className="text-stone-400 text-[11px]">
                Arahkan kamera smartphone atau aplikasi pembaca QR ke gambar di atas untuk memverifikasi keabsahan KTA dan status keanggotaan secara langsung.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleShare}
                className="px-4 py-2 text-xs font-bold bg-stone-950 border border-sky-500/40 text-sky-300 hover:bg-sky-500/20 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Link Tersalin</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-sky-400" />
                    <span>Bagikan Tautan</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-5 py-2 text-xs font-bold bg-amber-500 text-stone-950 rounded-xl hover:brightness-110 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable PDF Modal */}
      <PrintableKTAModal
        member={member}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
