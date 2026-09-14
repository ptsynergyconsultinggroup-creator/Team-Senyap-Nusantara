import React, { useState } from 'react';
import { Shield, Lock, Scale, CheckCircle2, AlertTriangle, FileText, X, ChevronRight } from 'lucide-react';
import { TSNLogo } from './TSNLogo';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy';
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-950 border border-amber-500/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh] text-stone-100 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/60 to-stone-950 border-b border-amber-500/30 p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-900 border border-stone-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Aspek Hukum & Legalitas Kelembagaan LPKSM
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-200">
                Syarat, Ketentuan & Kebijakan Pelindungan Data Pribadi
              </h3>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-amber-500/20">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-amber-500 text-stone-950 font-extrabold shadow'
                  : 'bg-stone-900 text-stone-300 hover:text-amber-200 border border-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Syarat & Ketentuan Keanggotaan</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-amber-500 text-stone-950 font-extrabold shadow'
                  : 'bg-stone-900 text-stone-300 hover:text-amber-200 border border-stone-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kebijakan Privasi (UU PDP No. 27/2022)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-stone-300 leading-relaxed">
          {activeTab === 'terms' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-[11px] font-serif">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Landasan Hukum & Status Kelembagaan</span>
                </div>
                <p>
                  Team Senyap Nusantara (TSN) beroperasi secara sah melalui badan hukum <strong>LPKSM Senyap Nusantara Jaya</strong> yang terdaftar resmi pada Kementerian Hukum dan HAM RI No. <strong>AHU-0004521.AH.01.07.Tahun 2024</strong> serta memiliki Tanda Daftar LPKSM No. <strong>510/024/TDLPK/DISPERINDAG/2024</strong> berdasarkan Undang-Undang No. 8 Tahun 1999 tentang Perlindungan Konsumen jo. PP No. 59 Tahun 2001.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase">
                  1. Hak dan Kewajiban Anggota
                </h4>
                <ul className="space-y-2 pl-4 list-disc marker:text-amber-400">
                  <li>
                    Setiap anggota berhak mendapatkan Kartu Tanda Anggota (KTA) resmi setelah melalui tahapan verifikasi data administrasi kependudukan oleh Dewan Pengurus Pusat (DPP).
                  </li>
                  <li>
                    Anggota berhak mengikuti seluruh program sosial, pendidikan paralegal, dan kegiatan advokasi kemanusiaan yang diselenggarakan organisasi.
                  </li>
                  <li>
                    Anggota wajib menjaga nama baik, kehormatan, integritas, dan martabat organisasi LPKSM Senyap Nusantara Jaya di ruang publik maupun media sosial.
                  </li>
                  <li>
                    Anggota wajib mematuhi Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) serta instruksi resmi pimpinan DPP.
                  </li>
                </ul>

                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase pt-2">
                  2. Pakta Integritas & Larangan Mutlak Anti-Pungli
                </h4>
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold uppercase text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Larangan Keras Penyalahgunaan Atribut & Pemerasan</span>
                  </div>
                  <p className="text-stone-300">
                    Seluruh anggota DILARANG KERAS melakukan pungutan liar (pungli), pemerasan, intimidasi, ataupun meminta imbalan finansial yang tidak sah kepada masyarakat/konsumen maupun pelaku usaha dengan mengatasnamakan LPKSM Senyap Nusantara Jaya.
                  </p>
                </div>

                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase pt-2">
                  3. Ketentuan Kartu Tanda Anggota (KTA) & Sanksi Pencabutan
                </h4>
                <ul className="space-y-2 pl-4 list-disc marker:text-amber-400">
                  <li>
                    KTA fisik maupun digital berstatus "Menunggu Verifikasi" atau ber-watermark DRAFT <strong>TIDAK BERLAKU</strong> untuk menjalankan tugas advokasi lapangan atau mewakili organisasi.
                  </li>
                  <li>
                    Pelanggaran terhadap pakta integritas dan hukum yang berlaku di wilayah NKRI berakibat pada pembekuan seketika (status Nonaktif) dan pencabutan hak keanggotaan secara tidak hormat serta pelaporan kepada pihak berwajib.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold uppercase text-[11px] font-serif">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Kepatuhan Terhadap UU Pelindungan Data Pribadi (UU No. 27/2022)</span>
                </div>
                <p>
                  LPKSM Senyap Nusantara Jaya berkomitmen penuh menjaga kerahasiaan, integritas, dan keamanan seluruh data pribadi anggota, sukarelawan, dan konsumen pelapor sengketa sesuai regulasi perlindungan data pribadi di Republik Indonesia.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase">
                  1. Jenis Data Pribadi yang Diproses
                </h4>
                <p>
                  Kami hanya mengumpulkan data yang relevan dan dibutuhkan secara sah untuk verifikasi keabsahan identitas, meliputi: Nama Lengkap, Nomor Induk Kependudukan (NIK 16 digit), Pas Foto Diri, Foto Dokumen KTP, Nomor Kontak WhatsApp/Telepon, Domisili Wilayah, serta Tanda Tangan Digital.
                </p>

                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase pt-2">
                  2. Prinsip Penyamaran Data (Data Masking) pada Akses Publik
                </h4>
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                  <p>
                    Guna mencegah pencurian identitas, doxxing, dan penyalahgunaan oleh pihak ketiga di internet:
                  </p>
                  <ul className="space-y-1.5 pl-4 list-disc marker:text-amber-400 text-stone-300">
                    <li>
                      <strong>Nomor NIK disamarkan secara otomatis</strong> pada tampilan publik kartu KTA digital (contoh: <span className="font-mono text-amber-300 font-bold">350911******0001</span>).
                    </li>
                    <li>
                      Nomor telepon, berkas foto KTP asli, dan tanda tangan digital <strong>TIDAK PERNAH</strong> dipublikasikan secara bebas dan hanya dapat diakses oleh Administrator/Verifikator resmi yang terotentikasi.
                    </li>
                    <li>
                      Pencarian data publik hanya dapat dilakukan dengan memasukkan Nomor ID KTA spesifik atau pemindaian QR Code fisik, bukan penelusuran daftar terbuka.
                    </li>
                  </ul>
                </div>

                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase pt-2">
                  3. Penggunaan & Hak Subjek Data
                </h4>
                <p>
                  Data Anda semata-mata digunakan untuk penerbitan KTA, pendataan organisasi, dan pembelaan hak advokasi konsumen. Kami menjamin tidak memperjualbelikan atau mendistribusikan data pribadi Anda kepada pihak komersial manapun.
                </p>
                <p>
                  Sesuai Pasal 5 s.d. Pasal 13 UU PDP, setiap pemilik data berhak mengajukan pembaruan data, perbaikan data yang keliru, maupun permohonan penonaktifan keanggotaan melalui kontak resmi sekretariat DPP.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-amber-500/20 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            DPP LPKSM Senyap Nusantara Jaya • Jember, Jawa Timur
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition cursor-pointer"
          >
            Saya Memahami & Menyetujui
          </button>
        </div>

      </div>
    </div>
  );
};
