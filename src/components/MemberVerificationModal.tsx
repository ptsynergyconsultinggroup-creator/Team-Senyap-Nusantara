import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { KTACard } from './KTACard';
import {
  ShieldCheck,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Scale,
  Printer,
  Camera,
  Wallet,
  Lock,
  FileCheck,
  Info,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { PrintableKTAModal } from './PrintableKTAModal';
import { QRScannerModal } from './QRScannerModal';

interface MemberVerificationModalProps {
  members: Member[];
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenLegalAid?: () => void;
  onOpenFinancialReport?: () => void;
  onUpdateMember?: (updatedMember: Member) => void;
}

export const MemberVerificationModal: React.FC<MemberVerificationModalProps> = ({
  members,
  isOpen,
  onClose,
  onOpenRegister,
  onOpenLegalAid,
  onOpenFinancialReport,
  onUpdateMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // Auto search member if opened via scanned QR link / URL parameter
  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const verifyId = params.get('verify') || params.get('id') || params.get('kta');
      if (verifyId) {
        const query = verifyId.trim().toLowerCase();
        const match = members.find(
          (m) =>
            m.id.toLowerCase() === query ||
            m.name.toLowerCase().includes(query)
        );
        if (match) {
          setSearchQuery(match.id);
          setSelectedMemberId(match.id);
          setHasSearched(true);
        }
      }
    }
  }, [isOpen, members]);

  const handleScanSuccess = (member: Member) => {
    setSearchQuery(member.id);
    setSelectedMemberId(member.id);
    setHasSearched(true);
    setScanNotification(`✓ KTA Terverifikasi: ${member.name} (${member.id})`);
    setTimeout(() => setScanNotification(null), 5000);
  };

  const handleScanNotFound = (scannedText: string) => {
    setSearchQuery(scannedText);
    setSelectedMemberId('');
    setHasSearched(true);
    setScanNotification(`⚠ KTA / QR Code "${scannedText}" tidak terdaftar dalam pangkalan data resmi TSN.`);
    setTimeout(() => setScanNotification(null), 6000);
  };

  // Sync found member with latest members array
  const foundMember = members.find((m) => m.id === selectedMemberId) || null;

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    setHasSearched(true);
    const match = members.find(
      (m) =>
        m.id.toLowerCase() === query ||
        m.name.toLowerCase() === query
    );

    if (match) {
      setSelectedMemberId(match.id);
    } else {
      setSelectedMemberId('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-amber-500/40 rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto text-stone-100 shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-950 border border-stone-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pr-8 sm:pr-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Pusat Verifikasi Keabsahan KTA & Data Anggota</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-bold font-serif text-amber-200">
            Verifikasi Identitas & Status Anggota
          </h3>
          <p className="text-xs text-stone-300 max-w-lg mx-auto">
            Pastikan keabsahan personel yang bertugas di lapangan atau mewakili LPKSM Senyap Nusantara Jaya Jember.
          </p>
        </div>

        {/* Search Bar & Camera Scan Button */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan ID KTA resmi (contoh: TSN-00125)..."
              className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-all font-mono"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition-all cursor-pointer shadow"
            >
              Cari KTA
            </button>
            <button
              type="button"
              onClick={() => setIsQRScannerOpen(true)}
              className="flex-1 sm:flex-none px-4 py-3 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-stone-950 border border-emerald-500/50 hover:bg-emerald-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              title="Pindai QR Code KTA Fisik Anggota Menggunakan Kamera"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Scan QR</span>
            </button>
          </div>
        </form>

        {/* Scan Notification Banner */}
        {scanNotification && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 transition-all ${
              scanNotification.includes('✓')
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}
          >
            <span>{scanNotification}</span>
            <button
              onClick={() => setScanNotification(null)}
              className="text-stone-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search Result & Dashboard Features */}
        <div className="pt-2 border-t border-amber-500/20 space-y-6">
          {foundMember ? (
            <div className="space-y-6">
              {/* Member Status & Control Bar */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded-lg overflow-hidden border border-amber-500/50 shrink-0 bg-stone-900">
                    <img
                      src={foundMember.photoUrl}
                      alt={foundMember.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold font-serif text-amber-200 uppercase">
                        {foundMember.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                        {foundMember.id}
                      </span>
                    </div>
                    <div className="text-xs text-stone-300 flex flex-wrap gap-x-3 gap-y-1">
                      <span>
                        Divisi: <strong className="text-amber-400">{foundMember.division}</strong>
                      </span>
                      <span>
                        Wilayah: <strong>{foundMember.region}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verified / Status Badge */}
                <div
                  className={`w-full md:w-auto px-4 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow shrink-0 border ${
                    foundMember.status === 'Aktif' ||
                    foundMember.status === 'Terverifikasi' ||
                    foundMember.status === 'Pengurus'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : foundMember.status === 'Menunggu Verifikasi'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {foundMember.status === 'Menunggu Verifikasi' ? (
                    <>
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Draft / Menunggu Verifikasi</span>
                    </>
                  ) : foundMember.status === 'Nonaktif' ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>KTA Nonaktif / Dicabut</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>KTA Terverifikasi Resmi</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status Explanation Banner */}
              {foundMember.status === 'Menunggu Verifikasi' ? (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
                  <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-300 font-serif uppercase tracking-wide">
                      Kartu Belum Disahkan: Menunggu Verifikasi DPP Jember
                    </h4>
                    <p className="text-xs text-stone-300">
                      Berkas anggota ini sedang dalam tahap pemeriksaan data kependudukan oleh Pengurus Pusat. Kartu ini <strong className="text-amber-200">TIDAK SAH</strong> untuk digunakan melakukan mediasi, advokasi, atau bertindak atas nama lembaga di lapangan.
                    </p>
                  </div>
                </div>
              ) : foundMember.status === 'Nonaktif' ? (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-300 font-serif uppercase tracking-wide">
                      Keanggotaan Telah Berakhir / Dinonaktifkan
                    </h4>
                    <p className="text-xs text-stone-300">
                      Masa berlaku kartu ini telah kedaluwarsa atau keanggotaan dicabut oleh pimpinan organisasi karena pelanggaran kode etik. Dilarang keras menggunakan atribut ini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-300 font-serif uppercase tracking-wide flex items-center gap-2">
                      <span>Status Keanggotaan: {foundMember.status.toUpperCase()}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h4>
                    <p className="text-xs text-stone-300">
                      Tercatat sah dalam pangkalan data DPP LPKSM Senyap Nusantara Jaya Jember. Berwenang menjalankan tugas kemanusiaan dan pendampingan perlindungan konsumen sesuai ketentuan.
                    </p>
                  </div>
                </div>
              )}

              {/* Render Interactive 3D KTA Card */}
              <KTACard member={foundMember} />

              {/* UU PDP Security Notice */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Data pribadi (NIK & Nomor Kontak) disamarkan untuk kepatuhan{' '}
                    <strong className="text-stone-300">UU Pelindungan Data Pribadi No. 27 Tahun 2022</strong>.
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 hidden sm:inline">
                  PDP SECURE
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="p-3.5 bg-stone-950 border border-amber-500/30 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase font-serif mb-1">
                    <Printer className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Cetak KTA PDF</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Unduh berkas lembar cetak standar KTP ISO 7810.
                  </p>
                </button>

                {onOpenLegalAid && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLegalAid();
                    }}
                    className="p-3.5 bg-stone-950 border border-amber-500/30 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase font-serif mb-1">
                      <Scale className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>Posko Pengaduan</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Lapor sengketa konsumen atau permohonan advokasi hukum.
                    </p>
                  </button>
                )}

                {onOpenFinancialReport && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFinancialReport();
                    }}
                    className="p-3.5 bg-stone-950 border border-emerald-500/30 hover:border-emerald-400 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase font-serif mb-1">
                      <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Kas Organisasi</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Pantau transparansi aliran dana publik dan iuran.
                    </p>
                  </button>
                )}
              </div>
            </div>
          ) : hasSearched ? (
            <div className="p-6 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h4 className="text-base font-bold text-rose-300 font-serif">
                Data Anggota Tidak Ditemukan
              </h4>
              <p className="text-xs text-stone-300 max-w-md mx-auto">
                ID KTA atau kata kunci "<span className="font-mono text-amber-300">{searchQuery}</span>" tidak terdaftar di database resmi LPKSM Senyap Nusantara Jaya. Pastikan penulisan ID sudah sesuai (contoh: TSN-00125).
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenRegister();
                  }}
                  className="px-4 py-2 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 cursor-pointer"
                >
                  Daftar Anggota Baru TSN
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl bg-stone-950 border border-stone-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase">
                  Pengecekan Keabsahan Personel LPKSM
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Ketik Nomor ID KTA di kolom pencarian atau gunakan tombol <strong>Scan QR</strong> pada bagian atas untuk memindai kartu fisik anggota.
                </p>
              </div>

              {/* Data Protection Shield Note */}
              <div className="p-3.5 rounded-xl bg-stone-900 border border-amber-500/20 max-w-lg mx-auto text-left flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  <strong className="text-amber-300">Komitmen Perlindungan Privasi (UU PDP No. 27/2022):</strong>{' '}
                  Pangkalan data anggota tidak dipublikasikan secara terbuka (open-directory) guna menjaga keamanan identitas para relawan dan pengurus dari risiko penipuan serta penyalahgunaan data kependudukan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable KTA Modal */}
      {foundMember && (
        <PrintableKTAModal
          isOpen={isPrintModalOpen}
          member={foundMember}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* QR Camera Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        members={members}
        onScanSuccess={handleScanSuccess}
        onScanNotFound={handleScanNotFound}
      />
    </div>
  );
};
