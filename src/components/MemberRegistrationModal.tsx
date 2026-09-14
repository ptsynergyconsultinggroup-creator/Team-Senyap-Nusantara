import React, { useState, useRef } from 'react';
import { Member, MembershipType } from '../types';
import { KTACard } from './KTACard';
import { SignatureCanvas } from './SignatureCanvas';
import {
  Upload,
  CheckCircle2,
  ShieldCheck,
  X,
  Sparkles,
  Users,
  Scale,
  Heart,
  ShieldAlert,
  FileText,
  CreditCard,
  Loader2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ShieldX,
} from 'lucide-react';
import { processAndCompressImage } from '../utils/imageUtils';

interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (newMember: Member) => void;
  onOpenTerms?: () => void;
}

export const MemberRegistrationModal: React.FC<MemberRegistrationModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  onOpenTerms,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    membershipType: 'Relawan Lapangan' as MembershipType,
    division: 'Kemanusiaan' as Member['division'],
    region: 'Kantor Pusat Jember',
    phone: '',
    email: '',
    reason: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    ktpUrl: '' as string | undefined,
    signatureUrl: '' as string | undefined,
  });

  const [agreeIntegrityPact, setAgreeIntegrityPact] = useState(false);
  const [agreeDataPrivacy, setAgreeDataPrivacy] = useState(false);
  const [nikError, setNikError] = useState<string | null>(null);

  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);
  const [isCompressingKtp, setIsCompressingKtp] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isDragOverKtp, setIsDragOverKtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ktpInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingPhoto(true);
        const compressedUrl = await processAndCompressImage(file, 600, 800, 0.88);
        setFormData((prev) => ({ ...prev, photoUrl: compressedUrl }));
      } catch (err) {
        console.error('Error optimizing photo:', err);
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const handleKtpFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar (JPG, PNG, atau WEBP)');
      return;
    }
    try {
      setIsCompressingKtp(true);
      const compressedUrl = await processAndCompressImage(file, 1200, 900, 0.85);
      setFormData((prev) => ({ ...prev, ktpUrl: compressedUrl }));
    } catch (err) {
      console.error('Error optimizing KTP:', err);
      alert('Gagal memproses gambar KTP. Silakan coba lagi.');
    } finally {
      setIsCompressingKtp(false);
    }
  };

  const handleKtpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleKtpFile(file);
    }
  };

  const handleKtpDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverKtp(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleKtpFile(file);
    }
  };

  const handleNikChange = (val: string) => {
    // Only accept numeric characters
    const numericOnly = val.replace(/\D/g, '').slice(0, 16);
    setFormData((prev) => ({ ...prev, nik: numericOnly }));

    if (numericOnly.length > 0 && numericOnly.length < 16) {
      setNikError(`NIK baru terisi ${numericOnly.length} dari 16 digit angka wajib.`);
    } else {
      setNikError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Strict NIK Validation
    if (!/^\d{16}$/.test(formData.nik)) {
      setNikError('NIK wajib berjumlah tepat 16 digit angka sesuai KTP resmi.');
      return;
    }

    // Integrity Pact and Privacy Check
    if (!agreeIntegrityPact) {
      alert('Anda wajib menyetujui Pakta Integritas & Anti-Pungli untuk bergabung.');
      return;
    }

    if (!agreeDataPrivacy) {
      alert('Anda wajib menyetujui Pemrosesan Data Pribadi (UU PDP) untuk keperluan administrasi KTA.');
      return;
    }

    setIsSubmitting(true);
    // Generate TSN ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `TSN-${randomNum}`;

    const newMember: Member = {
      id: newId,
      name: formData.name.toUpperCase(),
      nik: formData.nik,
      membershipType: formData.membershipType,
      division: formData.division,
      region: formData.region,
      joinDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      status: 'Menunggu Verifikasi', // Sent to Admin for review
      photoUrl: formData.photoUrl,
      ktpUrl: formData.ktpUrl,
      ktpUploadedAt: formData.ktpUrl ? new Date().toLocaleDateString('id-ID') : undefined,
      phone: formData.phone,
      email: formData.email,
      reason: formData.reason,
      signatureUrl: formData.signatureUrl,
    };

    try {
      await onAddMember(newMember);
      setRegisteredMember(newMember);
    } finally {
      setIsSubmitting(false);
    }
  };

  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  ];

  const membershipOptions: { type: MembershipType; label: string; desc: string; icon: any }[] = [
    {
      type: 'Anggota Biasa',
      label: 'Anggota Biasa / Simpatisan',
      desc: 'Pendukung aksi kemanusiaan & kegiatan sosial TSN di daerah',
      icon: Users,
    },
    {
      type: 'Relawan Lapangan',
      label: 'Relawan Lapangan / TRC',
      desc: 'Tim Reaksi Cepat untuk aksi tanggap bencana & bakti sosial',
      icon: Heart,
    },
    {
      type: 'Paralegal / Advokat',
      label: 'Paralegal / Bantuan Hukum',
      desc: 'Pendamping advokasi hukum & perlindungan konsumen LPKSM',
      icon: Scale,
    },
    {
      type: 'Pengurus Regional',
      label: 'Pengurus Regional / Cabang',
      desc: 'Koordinator organisasi & pengelola posko pengaduan daerah',
      icon: ShieldAlert,
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Formulir Pendaftaran Anggota & KTA Resmi TSN</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-bold font-serif text-amber-200">
            Bergabung Bersama Team Senyap Nusantara
          </h3>
          <p className="text-xs text-stone-300 max-w-lg mx-auto">
            Wadah pengabdian sosial kemanusiaan, perlindungan hak konsumen, dan penegakan keadilan berlandaskan integritas tanpa pungutan liar.
          </p>
        </div>

        {!registeredMember ? (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Step 1: Membership Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                1. Pilih Kategori Keanggotaan *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {membershipOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.membershipType === opt.type;
                  return (
                    <div
                      key={opt.type}
                      onClick={() => setFormData((prev) => ({ ...prev, membershipType: opt.type }))}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                          : 'bg-stone-950/60 border-stone-800 hover:border-amber-500/30'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-900 text-stone-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className={`text-xs font-bold ${isSelected ? 'text-amber-200' : 'text-stone-200'}`}>
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-stone-400 leading-snug">{opt.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Upload Pas Foto */}
            <div className="space-y-2 pt-2 border-t border-amber-500/20">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                2. Pas Foto Resmi untuk KTA *
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-950 p-4 rounded-xl border border-stone-800">
                <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-amber-500 bg-stone-900 shrink-0 shadow-md relative">
                  <img
                    src={formData.photoUrl}
                    alt="Preview KTA"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isCompressingPhoto && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-amber-300 text-[10px]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="space-y-2.5 text-center sm:text-left flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-200 bg-stone-900 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 cursor-pointer transition-all shadow">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{isCompressingPhoto ? 'Memproses Foto...' : 'Upload Pas Foto KTA'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="text-[11px] text-stone-400">Atau pilih pas foto cepat:</div>
                  <div className="flex justify-center sm:justify-start gap-2">
                    {samplePhotos.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, photoUrl: url }))}
                        className={`w-9 h-9 rounded-lg border overflow-hidden cursor-pointer ${
                          formData.photoUrl === url ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-stone-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Upload Dokumen KTP */}
            <div className="space-y-2 pt-2 border-t border-amber-500/20">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                  3. Upload Foto Dokumen KTP Asli *
                </label>
                <span className="text-[10px] text-amber-400 font-semibold">Tersimpan Aman di Cloud TSN</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Wajib untuk verifikasi identitas resmi anggota oleh Pengurus Pusat Jember. Foto KTP dijaga kerahasiaannya dan hanya dapat diakses oleh tim admin verifikator.
              </p>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverKtp(true);
                }}
                onDragLeave={() => setIsDragOverKtp(false)}
                onDrop={handleKtpDrop}
                onClick={() => ktpInputRef.current?.click()}
                className={`relative p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                  isDragOverKtp
                    ? 'border-amber-400 bg-amber-500/10'
                    : formData.ktpUrl
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : 'border-stone-700 bg-stone-950 hover:border-amber-500/40 hover:bg-stone-900/60'
                }`}
              >
                <input
                  ref={ktpInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleKtpInputChange}
                  className="hidden"
                />

                {isCompressingKtp ? (
                  <div className="py-6 text-center space-y-2">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <div className="text-xs font-bold text-amber-300">Mengompresi & Mempersiapkan Dokumen KTP...</div>
                    <div className="text-[10px] text-stone-400">Menyesuaikan ukuran gambar untuk penyimpanan cloud terenkripsi</div>
                  </div>
                ) : formData.ktpUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-36 h-22 rounded-lg overflow-hidden border border-emerald-500/60 bg-stone-900 shrink-0 shadow">
                      <img src={formData.ktpUrl} alt="Preview KTP" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Foto KTP Siap Disimpan ke Cloud</span>
                      </div>
                      <div className="text-xs text-stone-200">Dokumen KTP berhasil diunggah dan terkompresi.</div>
                      <div className="text-[11px] text-amber-400 font-semibold cursor-pointer hover:underline">
                        Klik area ini jika ingin mengganti foto KTP
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, ktpUrl: undefined }));
                      }}
                      className="px-3 py-1.5 text-xs text-red-300 bg-red-950/40 border border-red-500/40 rounded-lg hover:bg-red-900/40 transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="py-5 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-200">Tarik & Lepas Foto KTP Anda di sini</span>
                      <span className="text-xs text-stone-400"> atau </span>
                      <span className="text-xs font-bold text-amber-400 underline">Pilih Berkas dari HP/Komputer</span>
                    </div>
                    <p className="text-[10px] text-stone-500">Mendukung format JPG, PNG, atau scan kamera (otomatis dioptimasi)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Inputs Grid */}
            <div className="space-y-4 pt-2 border-t border-amber-500/20">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                4. Identitas Diri Anggota *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-300 uppercase">
                    Nama Lengkap (beserta Gelar) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: AHMAD HIDAYAT, S.H."
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Stricter NIK Input with 16-digit Counter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-stone-300 uppercase">
                      NIK (Wajib 16 Digit Angka) *
                    </label>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        formData.nik.length === 16 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {formData.nik.length}/16 Digit
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => handleNikChange(e.target.value)}
                    placeholder="Contoh: 3509120508980005"
                    className={`w-full px-3.5 py-2.5 bg-stone-950 rounded-xl text-xs text-stone-100 font-mono focus:outline-none transition border ${
                      formData.nik.length === 16
                        ? 'border-emerald-500/70 focus:border-emerald-400'
                        : formData.nik.length > 0
                        ? 'border-amber-500/60 focus:border-amber-400'
                        : 'border-stone-800 focus:border-amber-400'
                    }`}
                  />
                  {nikError && (
                    <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{nikError}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-300 uppercase">
                    Divisi Tugas Organisasi
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) =>
                      setFormData({ ...formData, division: e.target.value as Member['division'] })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Sosial">Sosial & Bakti Sembako</option>
                    <option value="Kemanusiaan">Kemanusiaan & TRC Bencana</option>
                    <option value="Bantuan Hukum">Bantuan Hukum & Paralegal</option>
                    <option value="Humas & Kerjasama">Humas & Hubungan Antar Lembaga</option>
                    <option value="Bendahara">Bendahara & Keuangan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-300 uppercase">
                    Wilayah Cabang / Posko Domisili *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Contoh: Kantor Pusat Jember / Banyuwangi / Surabaya"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-300 uppercase">
                    Nomor WhatsApp / Kontak HP *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-300 uppercase">
                    Email Aktif
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-stone-300 uppercase">
                  Alasan & Motivasi Pengabdian
                </label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Tuliskan komitmen moral Anda bergabung bersama LPKSM Senyap Nusantara Jaya..."
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Step 5: PAKTA INTEGRITAS & ANTI-PUNGLI (MANDATORY COMPLIANCE) */}
            <div className="space-y-3 pt-3 border-t border-amber-500/30">
              <div className="flex items-center gap-2 text-rose-300">
                <ShieldX className="w-5 h-5 text-rose-400 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-serif text-amber-200">
                  5. Pakta Integritas & Deklarasi Anti-Pungli (Anti-Extortion) *
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-rose-500/40 space-y-2 text-[11px] text-stone-300 leading-relaxed">
                <p className="font-bold text-amber-300">
                  Dengan mendaftar sebagai anggota LPKSM Senyap Nusantara Jaya, saya berikrar sungguh-sungguh:
                </p>
                <ol className="space-y-1.5 pl-4 list-decimal marker:text-amber-400">
                  <li>
                    <strong>Menjunjung Tinggi Moralitas:</strong> Menjaga kehormatan, integritas, dan martabat organisasi sesuai AD/ART serta peraturan perundang-undangan RI.
                  </li>
                  <li>
                    <strong>Larangan Mutlak Pungli & Pemerasan:</strong> TIDAK AKAN melakukan pungutan liar (pungli), pemerasan, atau meminta imbalan finansial yang tidak sah dari konsumen maupun pelaku usaha dengan dalih apapun.
                  </li>
                  <li>
                    <strong>Larangan Penyalahgunaan Atribut:</strong> TIDAK AKAN menyalahgunakan Kartu Tanda Anggota (KTA), seragam, atau kop surat untuk intimidasi, tindakan premanisme, atau tindakan melawan hukum lainnya.
                  </li>
                  <li>
                    <strong>Sanksi Tegas:</strong> Bersedia diberhentikan secara tidak hormat, KTA dicabut seketika, dan diproses secara pidana di hadapan aparat penegak hukum jika melanggar pakta ini.
                  </li>
                </ol>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-200">
                  <input
                    type="checkbox"
                    required
                    checked={agreeIntegrityPact}
                    onChange={(e) => setAgreeIntegrityPact(e.target.checked)}
                    className="mt-0.5 rounded border-amber-500/60 bg-stone-950 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span>
                    <strong className="text-amber-300">Saya Menyetujui Pakta Integritas & Anti-Pungli:</strong> Saya sadar sepenuhnya dan berikrar tidak akan melakukan pungutan liar atau menyalahgunakan KTA.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-200">
                  <input
                    type="checkbox"
                    required
                    checked={agreeDataPrivacy}
                    onChange={(e) => setAgreeDataPrivacy(e.target.checked)}
                    className="mt-0.5 rounded border-amber-500/60 bg-stone-950 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span>
                    <strong className="text-amber-300">Persetujuan Pemrosesan Data Pribadi (UU PDP No. 27/2022):</strong> Saya mengizinkan data kependudukan dan foto KTP diproses secara terenkripsi untuk administrasi resmi LPKSM.{' '}
                    {onOpenTerms && (
                      <button
                        type="button"
                        onClick={onOpenTerms}
                        className="text-amber-400 underline hover:text-amber-300 inline-flex items-center gap-0.5"
                      >
                        <span>Baca Syarat & Privasi</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Step 6: Digital Signature Canvas */}
            <div className="space-y-2 pt-2 border-t border-amber-500/20">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                6. Tanda Tangan Digital Pendaftar *
              </label>
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <SignatureCanvas
                  value={formData.signatureUrl}
                  onChange={(signatureDataUrl) =>
                    setFormData((prev) => ({ ...prev, signatureUrl: signatureDataUrl }))
                  }
                  applicantName={formData.name}
                />
                <p className="text-[10px] text-stone-500 italic">
                  * Tanda tangan digital ini menyatakan keabsahan data kependudukan serta pengesahan Pakta Integritas.
                </p>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || formData.nik.length !== 16 || !agreeIntegrityPact || !agreeDataPrivacy}
                className="w-full py-4 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Data & Berkas ke Cloud TSN...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Kirim Pendaftaran & Terbitkan Preview KTA</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Registration Submitted & KTA Preview */
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-xl font-bold text-amber-200 font-serif">
                Pendaftaran Berhasil Dikirim ke Cloud TSN!
              </h3>
              <p className="text-xs text-stone-300 max-w-md mx-auto">
                Permohonan keanggotaan atas nama <strong className="text-amber-200">{registeredMember.name}</strong> telah tersimpan di sistem basis data pusat (<span className="text-amber-300 font-mono">{registeredMember.id}</span>).
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <div className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 py-1 px-3 rounded-full inline-block border border-amber-500/30">
                  Status: Menunggu Verifikasi Admin Kantor Pusat Jember
                </div>
                {registeredMember.ktpUrl && (
                  <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 py-1 px-3 rounded-full inline-flex items-center gap-1 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Dokumen KTP Tersimpan</span>
                  </div>
                )}
              </div>
            </div>

            {/* Display Interactive KTA Card Preview */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-300 font-serif uppercase">
                Preview KTA Digital Pendaftaran (Status Draft / Pending)
              </div>
              <KTACard member={registeredMember} />
            </div>

            {/* Display Signature Confirmation Badge if available */}
            {registeredMember.signatureUrl && (
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between gap-4 max-w-sm mx-auto text-left">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-amber-300 uppercase">Tanda Tangan Digital Tersimpan</div>
                  <div className="text-[11px] text-stone-400">Tercatat secara elektronik pada formulir pakta integritas</div>
                </div>
                <div className="h-10 px-3 bg-white/90 rounded border border-stone-300 flex items-center justify-center shrink-0">
                  <img src={registeredMember.signatureUrl} alt="Tanda Tangan" className="h-8 object-contain max-w-[100px]" />
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setRegisteredMember(null);
                  setFormData({
                    name: '',
                    nik: '',
                    membershipType: 'Relawan Lapangan',
                    division: 'Kemanusiaan',
                    region: 'Kantor Pusat Jember',
                    phone: '',
                    email: '',
                    reason: '',
                    photoUrl: samplePhotos[0],
                    signatureUrl: undefined,
                  });
                  setAgreeIntegrityPact(false);
                  setAgreeDataPrivacy(false);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-amber-200 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                Daftar Anggota Lain
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 to-amber-500 rounded-xl hover:brightness-105 shadow transition-all cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
