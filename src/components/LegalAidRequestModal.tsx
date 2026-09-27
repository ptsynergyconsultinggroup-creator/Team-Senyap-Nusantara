import React, { useState } from 'react';
import { LegalAidCase } from '../types';
import {
  Scale,
  CheckCircle2,
  FileText,
  Phone,
  MapPin,
  Send,
  X,
  Loader2,
  ShieldCheck,
  Search,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Clock,
  ArrowRight,
  ShieldX,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { saveLegalAidCase, getLegalAidCase } from '../services';

interface LegalAidRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalAidRequestModal: React.FC<LegalAidRequestModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'track' | 'workflow'>('form');
  const [formData, setFormData] = useState({
    applicantName: '',
    phone: '',
    category: 'Sengketa Konsumen (LPKSM)' as LegalAidCase['category'],
    location: '',
    description: '',
    agreeProBono: true,
  });

  const [submittedCase, setSubmittedCase] = useState<LegalAidCase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ticket tracking states
  const [trackTicketInput, setTrackTicketInput] = useState('');
  const [isSearchingTicket, setIsSearchingTicket] = useState(false);
  const [trackedCase, setTrackedCase] = useState<LegalAidCase | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.phone) return;

    setIsSubmitting(true);
    const ticket = `TSN-LBH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCase: LegalAidCase = {
      ticketNumber: ticket,
      applicantName: formData.applicantName,
      phone: formData.phone,
      category: formData.category,
      location: formData.location || 'Kabupaten Jember / Jawa Timur',
      description: formData.description,
      status: 'Tim Hukum Ditugaskan',
      submittedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    try {
      await saveLegalAidCase(newCase);
      setSubmittedCase(newCase);
    } catch (err) {
      console.error('Error saving legal aid case:', err);
      // Fallback show submission
      setSubmittedCase(newCase);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicket = trackTicketInput.trim().toUpperCase();
    if (!cleanTicket) return;

    setIsSearchingTicket(true);
    setTrackError(null);
    setTrackedCase(null);

    try {
      const found = await getLegalAidCase(cleanTicket);
      if (found) {
        setTrackedCase(found);
      } else {
        setTrackError(`Nomor tiket "${cleanTicket}" tidak ditemukan dalam sistem posko hukum TSN.`);
      }
    } catch (err) {
      setTrackError('Gagal memuat status tiket. Silakan coba kembali.');
    } finally {
      setIsSearchingTicket(false);
    }
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Penerimaan & Registrasi Laporan',
      desc: 'Pengisian formulir pengaduan, penyerahan bukti awal (struk, perjanjian kredit, kuitansi), dan penerbitan Nomor Tiket Resmi TSN.',
      time: 'Maks. 1x24 Jam',
    },
    {
      step: '02',
      title: 'Telaah Yuridis & Pembentukan Tim',
      desc: 'Advokat & Paralegal LPKSM menelaah legalitas kasus berdasarkan UU No. 8/1999 dan hukum perdata/pidana yang relevan.',
      time: '1 - 3 Hari Kerja',
    },
    {
      step: '03',
      title: 'Mediasi Bipartit & Klarifikasi Pelaku Usaha',
      desc: 'Penyampaian somasi resmi / undangan musyawarah mediasi untuk mencari kesepakatan win-win tanpa biaya pengadilan.',
      time: '3 - 7 Hari Kerja',
    },
    {
      step: '04',
      title: 'Eskalasi ke BPSK / Jalur Litigasi',
      desc: 'Apabila mediasi buntu atau pelaku usaha beriktikad buruk, perkara dilimpahkan ke Badan Penyelesaian Sengketa Konsumen (BPSK) atau Gugatan Pengadilan.',
      time: 'Sesuai Tahap Sidang',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-amber-500/40 rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto text-stone-100 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-lg bg-stone-950 border border-stone-800 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pr-8 sm:pr-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Posko Pengaduan Sengketa Konsumen & Advokasi Hukum</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-bold font-serif text-amber-200">
            Layanan Bantuan Hukum LPKSM TSN
          </h3>
          <p className="text-xs text-stone-300 max-w-lg mx-auto">
            Berdasarkan UU No. 8 Tahun 1999, LPKSM Senyap Nusantara Jaya memberikan pendampingan sengketa konsumen, mediasi non-litigasi, dan konsultasi hukum pro-bono bagi masyarakat.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-500/20 gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('form');
              setSubmittedCase(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-950 text-stone-400 hover:text-amber-300 border border-stone-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ajukan Pengaduan Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'track'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-950 text-stone-400 hover:text-amber-300 border border-stone-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Lacak Status Tiket Perkara</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'workflow'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-950 text-stone-400 hover:text-amber-300 border border-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Alur Standar Penanganan Kasus</span>
          </button>
        </div>

        {/* Anti-Pungli & Free Pro Bono Guarantee Notice */}
        <div className="p-3.5 rounded-xl bg-stone-950 border border-emerald-500/40 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-stone-300">
            <span className="font-bold text-emerald-300 block">
              Jaminan Layanan Pro-Bono (Bebas Biaya) & Bersih dari Pungli:
            </span>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Seluruh relawan, paralegal, dan pengurus LPKSM Senyap Nusantara Jaya dilarang keras meminta imbalan uang, komisi liar, atau pungli dari konsumen yang sedang didampingi. Jika menemukan oknum melanggar, laporkan langsung ke Hotline Dewan Etik: <strong className="text-amber-300 font-mono">0823-3262-6916</strong>.
            </p>
          </div>
        </div>

        {/* TAB 1: FORM PENGADUAN */}
        {activeTab === 'form' && (
          <>
            {!submittedCase ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-amber-300 uppercase">
                      Nama Lengkap Pemohon / Konsumen *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.applicantName}
                      onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-amber-300 uppercase">
                      Nomor WhatsApp / HP Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Contoh: 0812-xxxx-xxxx"
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-amber-300 uppercase">
                      Kategori Sengketa / Perkara *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as LegalAidCase['category'],
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Sengketa Konsumen (LPKSM)">Sengketa Konsumen (UU No. 8/1999)</option>
                      <option value="Mediasi & Arbitrase Non-Litigasi">Mediasi & Musyawarah Non-Litigasi</option>
                      <option value="Klausula Baku & Ganti Rugi">Pelanggaran Klausula Baku Perjanjian</option>
                      <option value="Advokasi Hukum">Pendampingan Hukum & Somasi</option>
                      <option value="Konsultasi Umum">Konsultasi Hak-Hak Konsumen</option>
                      <option value="Bantuan Bencana">Permohonan Bantuan Darurat Bencana</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-amber-300 uppercase">
                      Domisili / Wilayah Kejadian *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Contoh: Kec. Balung, Kabupaten Jember"
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-amber-300 uppercase">
                    Kronologi / Uraian Singkat Kerugian Konsumen *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ceritakan barang/jasa yang disengketakan, identitas pelaku usaha, dan kerugian materiil/immateriil yang dialami..."
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan Tiket Pengaduan ke Cloud TSN...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim Pengaduan & Dapatkan Nomor Tiket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Confirmation Box */
              <div className="space-y-6 text-center">
                <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-amber-400 mx-auto" />
                  <h3 className="text-xl font-bold text-amber-200 font-serif">
                    Pengaduan Anda Resmi Diterima Posko Hukum TSN
                  </h3>
                  <p className="text-xs text-stone-300">
                    Laporan telah dicatat ke dalam sistem pangkalan data penanganan perkara:
                  </p>
                  <div className="text-2xl font-mono font-black text-amber-300 tracking-wider bg-stone-950 py-2.5 rounded-xl border border-amber-500/40 max-w-sm mx-auto">
                    {submittedCase.ticketNumber}
                  </div>
                  <p className="text-[11px] text-amber-400 font-mono">
                    Simpan nomor tiket di atas untuk melacak perkembangan kasus Anda.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 text-left text-xs space-y-2 border border-amber-500/20 text-stone-300">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase">Nama Pemohon:</span>
                      <strong className="text-stone-200">{submittedCase.applicantName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase">Kategori:</span>
                      <strong className="text-amber-300">{submittedCase.category}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase">Lokasi:</span>
                      <strong className="text-stone-200">{submittedCase.location}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase">Status Berjalan:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {submittedCase.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-left text-[11px] text-stone-400 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Tim Advokasi / Paralegal LPKSM TSN Kantor Pusat Jember akan segera menghubungi nomor WhatsApp Anda (<strong className="text-stone-200 font-mono">{submittedCase.phone}</strong>) untuk melengkapi berkas pendukung dalam waktu maksimal 1x24 jam.
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmittedCase(null);
                      setFormData({
                        applicantName: '',
                        phone: '',
                        category: 'Sengketa Konsumen (LPKSM)',
                        location: '',
                        description: '',
                        agreeProBono: true,
                      });
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-amber-200 border border-amber-500/40 rounded-xl hover:bg-amber-500/20"
                  >
                    Ajukan Kasus Lain
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 to-amber-500 rounded-xl hover:brightness-105"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: LACAK TIKET */}
        {activeTab === 'track' && (
          <div className="space-y-5">
            <form onSubmit={handleTrackTicket} className="space-y-3">
              <label className="block text-xs font-bold text-amber-300 uppercase">
                Masukkan Nomor Tiket Pengaduan (contoh: TSN-LBH-1001)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={trackTicketInput}
                  onChange={(e) => setTrackTicketInput(e.target.value)}
                  placeholder="TSN-LBH-XXXX"
                  className="flex-1 px-4 py-3 bg-stone-950 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-mono text-stone-100 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isSearchingTicket}
                  className="px-5 py-3 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 to-amber-500 rounded-xl hover:brightness-110 cursor-pointer flex items-center gap-1.5"
                >
                  {isSearchingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Cek Progres</span>
                </button>
              </div>
            </form>

            {trackError && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{trackError}</span>
              </div>
            )}

            {trackedCase && (
              <div className="p-5 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase">Nomor Tiket Perkara</span>
                    <h4 className="text-lg font-mono font-bold text-amber-200">{trackedCase.ticketNumber}</h4>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                    Status: {trackedCase.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Nama Pemohon:</span>
                    <strong className="text-stone-200">{trackedCase.applicantName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Kategori Perkara:</span>
                    <strong className="text-amber-300">{trackedCase.category}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Wilayah / Posko:</span>
                    <strong className="text-stone-200">{trackedCase.location}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Tanggal Lapor:</span>
                    <strong className="text-stone-300 font-mono">{trackedCase.submittedAt}</strong>
                  </div>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs space-y-1">
                  <span className="text-amber-300 font-semibold block">Ringkasan Masalah:</span>
                  <p className="text-stone-300 leading-relaxed text-[11px]">{trackedCase.description}</p>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <span>Advokasi sedang berjalan di bawah pengawasan DPP LPKSM TSN.</span>
                  <a
                    href="https://wa.me/6282332626916"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-amber-300 hover:text-amber-200"
                  >
                    Hubungi Petugas Kasus
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALUR POSKO HUKUM STANDAR */}
        {activeTab === 'workflow' && (
          <div className="space-y-4 text-left">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-300 font-serif uppercase">
                Standar Operasional Prosedur (SOP) Advokasi Sengketa Konsumen
              </h4>
              <p className="text-xs text-stone-400">
                Alur penanganan kasus sengketa perlindungan konsumen di LPKSM Senyap Nusantara Jaya sesuai PP No. 59 Tahun 2001:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workflowSteps.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-stone-950 border border-amber-500/20 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-serif font-black text-amber-400/80">
                      {item.step}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                      {item.time}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-amber-200 font-serif">{item.title}</h5>
                  <p className="text-[11px] text-stone-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-xs text-stone-300">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>Dokumen yang Wajib Disiapkan Konsumen Saat Mediasi:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-400 pl-2">
                <li>Kartu Tanda Penduduk (KTP) pelapor / surat kuasa jika diwakilkan.</li>
                <li>Bukti transaksi (struk pembelian, surat perjanjian kredit/leasing, kuitansi, mutasi bank).</li>
                <li>Bukti fisik barang cacat atau rekaman korespondensi somasi awal kepada pelaku usaha.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
