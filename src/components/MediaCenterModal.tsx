import React, { useState } from 'react';
import { PressRelease, MediaAccreditation, SiteConfig } from '../types';
import { initialPressReleases, mediaFactSheet } from '../data/pressData';
import { TSNLogo } from './TSNLogo';
import { downloadElementAsPDF } from '../utils/pdfExport';
import {
  Newspaper,
  Download,
  Calendar,
  Phone,
  Mail,
  Share2,
  Check,
  Search,
  ExternalLink,
  X,
  FileText,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Camera,
  MessageSquare,
  Building,
  Quote,
  Send,
  Printer,
  ChevronRight,
  Info,
  Clock,
  Radio,
  FileDown,
  Copy,
  SlidersHorizontal,
  BadgeCheck,
} from 'lucide-react';

interface MediaCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig?: SiteConfig;
}

export const MediaCenterModal: React.FC<MediaCenterModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'releases' | 'mediakit' | 'events' | 'contact'>('releases');
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(initialPressReleases[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Accreditation form state
  const [accreditationForm, setAccreditationForm] = useState({
    journalistName: '',
    mediaOutlet: '',
    mediaType: 'Online' as 'Online' | 'Cetak' | 'Televisi' | 'Radio',
    pressCardNumber: '',
    phone: '',
    email: '',
    eventOrTopic: mediaFactSheet.pressConferences[0].title,
    notes: '',
  });
  const [accreditationSubmitted, setAccreditationSubmitted] = useState(false);

  // Interview request form state
  const [interviewForm, setInterviewForm] = useState({
    journalistName: '',
    mediaOutlet: '',
    phone: '',
    requestedSpokesperson: 'HERI PRABOWO, S.H.',
    topic: '',
    deadlineDate: '',
  });
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);

  if (!isOpen) return null;

  const filteredReleases = initialPressReleases.filter(
    (pr) =>
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.releaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.spokesperson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyPressText = (release: PressRelease) => {
    const fullText = `
[SIARAN PERS RESMI - LPKSM SENYAP NUSANTARA JAYA]
Nomor: ${release.releaseNumber}
Status: ${release.embargo}
Tanggal: ${release.date}
Dateline: ${release.dateline}

${release.title.toUpperCase()}
${release.subtitle}

${release.summary}

${release.body.join('\n\n')}

KUTIPAN RESMI JURU BICARA (${release.spokesperson} - ${release.spokespersonRole}):
${release.keyQuotes.join('\n')}

KONTAK MEDIA:
Narahubung: ${release.mediaContact.name} (${release.mediaContact.role})
Telepon/WhatsApp: ${release.mediaContact.phone}
Email: ${release.mediaContact.email}
Sekretariat: ${mediaFactSheet.centralOffice}
    `.trim();

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleDownloadReleasePDF = async () => {
    if (!selectedRelease) return;
    setIsDownloadingPdf(true);
    try {
      const filename = `Siaran_Pers_LPKSM_TSN_${selectedRelease.releaseNumber.replace(/[\/\s]/g, '_')}.pdf`;
      await downloadElementAsPDF('printable-press-release-sheet', filename);
    } catch (err) {
      console.error('Error generating press release PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleAccreditationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accreditationForm.journalistName || !accreditationForm.mediaOutlet) return;
    setAccreditationSubmitted(true);
  };

  const handleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewForm.journalistName || !interviewForm.phone) return;
    setInterviewSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-stone-950 border border-amber-500/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[94vh] text-stone-100 my-auto">
        
        {/* Top Header Section */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/70 to-stone-950 border-b border-amber-500/30 p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 z-10"
            title="Tutup Ruang Media"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pr-10 sm:pr-0">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Newspaper className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Kanal Resmi Wartawan & Insan Pers
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                  <span>UU Pers No. 40/1999 & Hak Jawab</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold font-serif text-amber-200 mt-1">
                Pusat Informasi Media & Ruang Pers (Press Room)
              </h2>
              <p className="text-xs text-stone-300 max-w-2xl mt-0.5">
                Portal komunikasi resmi Dewan Pimpinan Pusat LPKSM Senyap Nusantara Jaya untuk rekan jurnalis media online, cetak, televisi, dan radio.
              </p>
            </div>
          </div>

          {/* Tab Navigation Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-2 border-t border-amber-500/20 scrollbar-none">
            <button
              onClick={() => setActiveTab('releases')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'releases'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/30 hover:text-amber-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Siaran Pers Resmi ({initialPressReleases.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('mediakit')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'mediakit'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/30 hover:text-amber-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Media Kit & Aset Resmi</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/30 hover:text-amber-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda Liputan & Akreditasi</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/30 hover:text-amber-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Meja Humas & Wawancara</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* ================= TAB 1: SIARAN PERS RESMI ================= */}
          {activeTab === 'releases' && (
            <div className="space-y-6">
              {/* Search and Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/80 p-3 rounded-2xl border border-amber-500/20">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari rilis (topik, no. surat, juru bicara)..."
                    className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400 w-full sm:w-auto justify-end">
                  <span className="text-amber-300 font-mono font-bold">{filteredReleases.length} Siaran Pers</span>
                  <span>tersedia untuk dikutip media</span>
                </div>
              </div>

              {/* Master-Detail Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Press Release List */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">
                    Daftar Siaran Pers Terbit
                  </div>
                  <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                    {filteredReleases.map((release) => {
                      const isSelected = selectedRelease?.id === release.id;
                      return (
                        <div
                          key={release.id}
                          onClick={() => setSelectedRelease(release)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                              : 'bg-stone-900/60 border-stone-800 hover:border-amber-500/30 hover:bg-stone-900'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                            <span className="text-amber-400 font-semibold">{release.releaseNumber}</span>
                            <span>{release.date}</span>
                          </div>
                          <h4 className={`text-xs font-bold font-serif line-clamp-2 leading-snug ${
                            isSelected ? 'text-amber-200' : 'text-stone-200'
                          }`}>
                            {release.title}
                          </h4>
                          <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                            {release.summary}
                          </p>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400">
                            <span className="truncate max-w-[180px]">Narasumber: <strong className="text-stone-300">{release.spokesperson}</strong></span>
                            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                              <span>Baca Lengkap</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Detailed Reading & Export Panel */}
                <div className="lg:col-span-7">
                  {selectedRelease ? (
                    <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-6 space-y-5">
                      
                      {/* Top Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-800">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase border border-amber-500/30">
                            {selectedRelease.embargo}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">{selectedRelease.releaseNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyPressText(selectedRelease)}
                            className="px-3 py-1.5 text-xs font-bold text-stone-200 bg-stone-950 border border-amber-500/30 hover:border-amber-400 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
                            title="Salin Naskah Siaran Pers ke Clipboard untuk Berita"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Teks Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-amber-400" />
                                <span>Salin Naskah Berita</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleDownloadReleasePDF}
                            disabled={isDownloadingPdf}
                            className="px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isDownloadingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Printable Naskah Dinas Preview Frame */}
                      <div
                        id="printable-press-release-sheet"
                        className="bg-stone-950 border border-stone-800 rounded-xl p-5 sm:p-6 space-y-4 text-stone-200 leading-relaxed text-xs shadow-inner"
                      >
                        {/* Kop Siaran Pers */}
                        <div className="border-b-2 border-amber-500/60 pb-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <TSNLogo size="sm" showText={false} />
                            <div>
                              <div className="text-xs font-black font-serif text-amber-200 uppercase tracking-wide">
                                SIARAN PERS RESMI DPP LPKSM SENYAP NUSANTARA JAYA
                              </div>
                              <div className="text-[10px] text-stone-400">
                                SK Kemenkumham: AHU-0004521.AH.01.07.2024 • TDLPK: 510/024/DISPERINDAG/2024
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-[10px] font-mono text-stone-400 hidden sm:block">
                            <div>Tanggal Terbit: <strong className="text-stone-200">{selectedRelease.date}</strong></div>
                            <div>Pukul: 10.00 WIB</div>
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-1 pt-1">
                          <h3 className="text-sm sm:text-base font-bold font-serif text-amber-100 uppercase leading-snug">
                            {selectedRelease.title}
                          </h3>
                          <p className="text-xs text-amber-300/90 italic">
                            {selectedRelease.subtitle}
                          </p>
                        </div>

                        {/* Dateline & Body Paragraphs */}
                        <div className="space-y-3 pt-2 text-stone-300">
                          <p>
                            <strong className="text-amber-400 uppercase font-mono">{selectedRelease.dateline} — </strong>
                            {selectedRelease.body[0]}
                          </p>
                          {selectedRelease.body.slice(1).map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>

                        {/* Official Quotes Box */}
                        <div className="p-4 rounded-xl bg-amber-950/25 border-l-4 border-amber-400 space-y-2 my-3">
                          <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                            <Quote className="w-3.5 h-3.5 text-amber-400" />
                            <span>Kutipan Resmi Narasumber LPKSM TSN:</span>
                          </div>
                          {selectedRelease.keyQuotes.map((q, idx) => (
                            <p key={idx} className="italic text-amber-100/90 text-xs">
                              {q}
                            </p>
                          ))}
                          <div className="text-[11px] font-bold text-amber-300 text-right pt-1">
                            — {selectedRelease.spokesperson}, <span className="font-normal text-stone-300">{selectedRelease.spokespersonRole}</span>
                          </div>
                        </div>

                        {/* Media Contact Footer */}
                        <div className="pt-3 border-t border-stone-800 text-[11px] space-y-1 text-stone-400">
                          <div className="font-bold text-stone-300 uppercase text-[10px]">Kontak Konfirmasi Media & Liputan:</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span>Narahubung: <strong className="text-amber-300">{selectedRelease.mediaContact.name}</strong> ({selectedRelease.mediaContact.role})</span>
                            <span>WhatsApp/HP: <strong className="text-amber-300 font-mono">{selectedRelease.mediaContact.phone}</strong></span>
                            <span>Email: <strong className="text-stone-200">{selectedRelease.mediaContact.email}</strong></span>
                          </div>
                          <div className="text-[10px] text-stone-500 pt-1">
                            Alamat Sekretariat: {mediaFactSheet.centralOffice}
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="p-12 text-center text-stone-500 bg-stone-900/50 rounded-2xl border border-stone-800">
                      Pilih salah satu siaran pers di sisi kiri untuk melihat isi naskah dan mengunduh berkas.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ================= TAB 2: MEDIA KIT & ASET RESMI ================= */}
          {activeTab === 'mediakit' && (
            <div className="space-y-6">
              <div className="bg-stone-900/80 p-5 rounded-2xl border border-amber-500/30 space-y-3">
                <h3 className="text-base font-bold font-serif text-amber-200 uppercase">
                  Aset Visual Resmi & Pedoman Identitas LPKSM TSN
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
                  Rekan jurnalis, produser, dan tim redaksi diperkenankan mengunduh serta mencantumkan aset resmi di bawah ini untuk keperluan pemberitaan, siaran grafis berita televisi, atau media online dengan tetap mematuhi proporsi logo asli.
                </p>
              </div>

              {/* Logo Downloads Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-stone-900/70 border border-amber-500/20 rounded-2xl p-5 text-center space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-24 h-24 mx-auto p-3 rounded-2xl bg-stone-950 border border-amber-500/40 flex items-center justify-center shadow">
                      <TSNLogo size="md" showText={false} />
                    </div>
                    <h4 className="text-xs font-bold text-amber-200 uppercase font-serif">Logo Lambang Utama (Gold Edition)</h4>
                    <p className="text-[11px] text-stone-400">Lambang Garuda & Timbangan Keadilan format vektor resolusi tinggi.</p>
                  </div>
                  <button
                    onClick={() => alert('Logo resmi resolusi tinggi berhasil disiapkan untuk media.')}
                    className="w-full py-2 px-3 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Logo SVG / PNG</span>
                  </button>
                </div>

                <div className="bg-stone-900/70 border border-amber-500/20 rounded-2xl p-5 text-center space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-24 h-24 mx-auto p-3 rounded-2xl bg-white border border-stone-300 flex items-center justify-center shadow">
                      <TSNLogo size="md" showText={false} />
                    </div>
                    <h4 className="text-xs font-bold text-amber-200 uppercase font-serif">Logo Transparan (Light Canvas)</h4>
                    <p className="text-[11px] text-stone-400">Khusus digunakan untuk latar belakang putih, surat kabar cetak, atau tayangan berita cerah.</p>
                  </div>
                  <button
                    onClick={() => alert('Logo transparan siap diunduh.')}
                    className="w-full py-2 px-3 text-xs font-bold text-stone-200 bg-stone-950 border border-amber-500/40 hover:bg-amber-500/20 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG Transparan</span>
                  </button>
                </div>

                <div className="bg-stone-900/70 border border-amber-500/20 rounded-2xl p-5 text-center space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-24 h-24 mx-auto p-2 rounded-2xl bg-stone-950 border border-amber-500/40 flex items-center justify-center shadow overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                        alt="Juru Bicara"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-amber-200 uppercase font-serif">Foto Resmi Juru Bicara DPP</h4>
                    <p className="text-[11px] text-stone-400">Paket foto resmi pengurus harian resolusi cetak 300 DPI untuk artikel berita.</p>
                  </div>
                  <button
                    onClick={() => alert('Foto resmi pengurus berhasil diunduh.')}
                    className="w-full py-2 px-3 text-xs font-bold text-stone-200 bg-stone-950 border border-amber-500/40 hover:bg-amber-500/20 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Foto Pengurus (HD)</span>
                  </button>
                </div>
              </div>

              {/* Fact Sheet Table */}
              <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div>
                    <h4 className="text-xs font-bold font-serif text-amber-300 uppercase">Lembar Fakta Kelembagaan (Fact Sheet)</h4>
                    <p className="text-[11px] text-stone-400">Data identitas hukum resmi untuk akurasi penulisan dalam redaksi berita.</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Update 2025/2026
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Nama Lembaga Resmi</span>
                    <span className="text-amber-200 font-bold">{mediaFactSheet.legalEntity}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Singkatan Populer</span>
                    <span className="text-amber-200 font-bold">{mediaFactSheet.organizationName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">SK Pengesahan Kemenkumham RI</span>
                    <span className="text-amber-300 font-mono font-bold">{mediaFactSheet.kemenkumhamReg}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Nomor TDLPK Disperindag</span>
                    <span className="text-amber-300 font-mono font-bold">{mediaFactSheet.tdlpkReg}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">NPWP Badan Hukum</span>
                    <span className="text-amber-300 font-mono font-bold">{mediaFactSheet.npwp}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Dasar Hukum Operasional</span>
                    <span className="text-stone-300 text-[11px] leading-tight block">{mediaFactSheet.legalBasis}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: AGENDA LIPUTAN & AKREDITASI ================= */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Press Conference Schedule */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">
                    Jadwal Konferensi Pers & Agenda Liputan Terbuka
                  </div>
                  <div className="space-y-3">
                    {mediaFactSheet.pressConferences.map((pc) => (
                      <div key={pc.id} className="p-4 rounded-2xl bg-stone-900/90 border border-amber-500/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {pc.status}
                          </span>
                          <span className="text-[11px] text-stone-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{pc.date}</span>
                          </span>
                        </div>
                        <h4 className="text-xs font-bold font-serif text-amber-100 leading-snug">
                          {pc.title}
                        </h4>
                        <div className="text-[11px] text-stone-300">
                          <strong>Lokasi:</strong> {pc.location}
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                          {pc.agenda}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Journalist Accreditation Form */}
                <div className="lg:col-span-6">
                  <div className="bg-stone-900/95 border border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                        <UserCheck className="w-3 h-3 text-amber-400" />
                        <span>Formulir Akreditasi Media</span>
                      </div>
                      <h4 className="text-sm font-bold font-serif text-amber-200">
                        Pendaftaran & Konfirmasi Liputan Wartawan
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Daftarkan diri Anda untuk mendapatkan tempat liputan khusus, berkas siaran pers fisik, dan akses doorstop wawancara narasumber.
                      </p>
                    </div>

                    {!accreditationSubmitted ? (
                      <form onSubmit={handleAccreditationSubmit} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                            Nama Lengkap Wartawan *
                          </label>
                          <input
                            type="text"
                            required
                            value={accreditationForm.journalistName}
                            onChange={(e) => setAccreditationForm({ ...accreditationForm, journalistName: e.target.value })}
                            placeholder="Contoh: Rian Anggoro, S.I.Kom"
                            className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                              Nama Media / Redaksi *
                            </label>
                            <input
                              type="text"
                              required
                              value={accreditationForm.mediaOutlet}
                              onChange={(e) => setAccreditationForm({ ...accreditationForm, mediaOutlet: e.target.value })}
                              placeholder="Contoh: Radar Jember / Kompas TV"
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                              Jenis Media
                            </label>
                            <select
                              value={accreditationForm.mediaType}
                              onChange={(e) => setAccreditationForm({ ...accreditationForm, mediaType: e.target.value as any })}
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                            >
                              <option value="Online">Media Siber / Online</option>
                              <option value="Televisi">Televisi Berita</option>
                              <option value="Cetak">Surat Kabar / Koran Cetak</option>
                              <option value="Radio">Radio Siaran</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                              Nomor ID Pers / Kartu Wartawan
                            </label>
                            <input
                              type="text"
                              value={accreditationForm.pressCardNumber}
                              onChange={(e) => setAccreditationForm({ ...accreditationForm, pressCardNumber: e.target.value })}
                              placeholder="No. KTA Pers / Dewan Pers"
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                              Nomor WhatsApp Aktif *
                            </label>
                            <input
                              type="tel"
                              required
                              value={accreditationForm.phone}
                              onChange={(e) => setAccreditationForm({ ...accreditationForm, phone: e.target.value })}
                              placeholder="0812-xxxx-xxxx"
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition shadow cursor-pointer flex items-center justify-center gap-2 mt-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Konfirmasi Akreditasi</span>
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 space-y-2 text-center">
                        <BadgeCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                        <h4 className="text-xs font-bold text-emerald-300 font-serif uppercase">
                          Akreditasi Diterima
                        </h4>
                        <p className="text-[11px] text-stone-300">
                          Terima kasih rekan <strong>{accreditationForm.journalistName}</strong> dari <strong>{accreditationForm.mediaOutlet}</strong>. Tim Humas TSN akan mengirimkan barcode akses dan materi pers via WhatsApp ke nomor <span className="font-mono text-amber-300">{accreditationForm.phone}</span>.
                        </p>
                        <button
                          onClick={() => setAccreditationSubmitted(false)}
                          className="px-3 py-1 bg-stone-900 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-lg cursor-pointer hover:bg-stone-800"
                        >
                          Daftarkan Rekan Lainnya
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 4: MEJA HUMAS & WAWANCARA ================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Spokesperson List & Hotline */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-serif text-amber-200 uppercase">Hotline Khusus Wartawan (Fast-Response)</h4>
                        <span className="text-[10px] text-stone-400">Bebas antrean layanan pengaduan umum</span>
                      </div>
                    </div>
                    <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-stone-400">WhatsApp Meja Media:</div>
                        <div className="text-base font-bold font-mono text-amber-300">{mediaFactSheet.mediaHotline}</div>
                      </div>
                      <a
                        href={`https://wa.me/6282332626916?text=Halo%20Humas%20LPKSM%20TSN,%20saya%20jurnalis%20ingin%20konfirmasi%20berita`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">
                    Juru Bicara Resmi Organisasi
                  </div>

                  <div className="space-y-2.5">
                    {mediaFactSheet.spokespersons.map((sp, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-amber-200 uppercase">{sp.name}</h5>
                          <span className="text-[10px] font-mono text-amber-400">{sp.phone}</span>
                        </div>
                        <div className="text-[11px] text-stone-300 font-semibold">{sp.role}</div>
                        <p className="text-[10px] text-stone-400">Bidang: {sp.expertise}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Interview Request Form */}
                <div className="lg:col-span-6">
                  <div className="bg-stone-900/95 border border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                        <Quote className="w-3 h-3 text-amber-400" />
                        <span>Permohonan Wawancara Eksklusif</span>
                      </div>
                      <h4 className="text-sm font-bold font-serif text-amber-200">
                        Pengajuan Wawancara Narasumber / Liputan Khusus
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Kirimkan topik bahasan dan tenggat waktu siaran berita Anda agar tim humas dapat menjadwalkan narasumber yang tepat.
                      </p>
                    </div>

                    {!interviewSubmitted ? (
                      <form onSubmit={handleInterviewSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                              Nama Jurnalis *
                            </label>
                            <input
                              type="text"
                              required
                              value={interviewForm.journalistName}
                              onChange={(e) => setInterviewForm({ ...interviewForm, journalistName: e.target.value })}
                              placeholder="Nama Anda"
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                              Nama Media *
                            </label>
                            <input
                              type="text"
                              required
                              value={interviewForm.mediaOutlet}
                              onChange={(e) => setInterviewForm({ ...interviewForm, mediaOutlet: e.target.value })}
                              placeholder="Nama Redaksi / Media"
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                              Nomor WhatsApp *
                            </label>
                            <input
                              type="tel"
                              required
                              value={interviewForm.phone}
                              onChange={(e) => setInterviewForm({ ...interviewForm, phone: e.target.value })}
                              placeholder="0812-xxxx-xxxx"
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                              Pilih Narasumber
                            </label>
                            <select
                              value={interviewForm.requestedSpokesperson}
                              onChange={(e) => setInterviewForm({ ...interviewForm, requestedSpokesperson: e.target.value })}
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                            >
                              <option value="HERI PRABOWO, S.H.">HERI PRABOWO, S.H. (Bantuan Hukum & Sengketa)</option>
                              <option value="IBRAHIM">IBRAHIM (Juru Bicara DPP & Keuangan)</option>
                              <option value="BAMBANG SUPRAYOGI">BAMBANG SUPRAYOGI (Humas & Kebijakan)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-300 uppercase mb-1">
                            Topik Wawancara / Daftar Pertanyaan Pokok *
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={interviewForm.topic}
                            onChange={(e) => setInterviewForm({ ...interviewForm, topic: e.target.value })}
                            placeholder="Uraikan secara singkat sudut pandang (angle) berita atau isu perlindungan konsumen yang ingin ditanyakan..."
                            className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition shadow cursor-pointer flex items-center justify-center gap-2 mt-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Ajukan Jadwal Wawancara</span>
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 space-y-2 text-center">
                        <BadgeCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                        <h4 className="text-xs font-bold text-emerald-300 font-serif uppercase">
                          Permohonan Terkirim
                        </h4>
                        <p className="text-[11px] text-stone-300">
                          Permintaan wawancara untuk narasumber <strong>{interviewForm.requestedSpokesperson}</strong> telah kami terima. Kepala Biro Humas akan segera menghubungi WhatsApp <span className="font-mono text-amber-300">{interviewForm.phone}</span>.
                        </p>
                        <button
                          onClick={() => setInterviewSubmitted(false)}
                          className="px-3 py-1 bg-stone-900 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-lg cursor-pointer hover:bg-stone-800"
                        >
                          Ajukan Wawancara Lain
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-stone-950 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Meja Media Buka Setiap Hari Kerja • Sekretariat Jember</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-stone-300 hover:text-white bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-xl transition cursor-pointer"
          >
            Tutup Ruang Media
          </button>
        </div>

      </div>
    </div>
  );
};
