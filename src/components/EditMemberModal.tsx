import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { SignatureCanvas } from './SignatureCanvas';
import { X, Upload, Image as ImageIcon, Camera, Check, ShieldCheck, User, Phone, Mail, MapPin, Award, FileText, PenTool, CreditCard, Trash2, Loader2 } from 'lucide-react';
import { processAndCompressImage } from '../utils/imageUtils';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (updatedMember: Member) => void;
  isAdmin?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
];

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  isAdmin = false,
}) => {
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isProcessingKtp, setIsProcessingKtp] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
      setPhotoPreview(member.photoUrl || '');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  // Handle local file photo upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await processAndCompressImage(file, 600, 800, 0.88);
        setPhotoPreview(compressed);
        setFormData((prev) => ({ ...prev, photoUrl: compressed }));
      } catch (err) {
        console.error('Failed to compress photo:', err);
      }
    }
  };

  const handleKtpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsProcessingKtp(true);
        const compressed = await processAndCompressImage(file, 1200, 900, 0.85);
        setFormData((prev) => ({
          ...prev,
          ktpUrl: compressed,
          ktpUploadedAt: new Date().toLocaleDateString('id-ID'),
        }));
      } catch (err) {
        console.error('Failed to compress KTP:', err);
      } finally {
        setIsProcessingKtp(false);
      }
    }
  };

  const handleSelectPreset = (url: string) => {
    setPhotoPreview(url);
    setFormData((prev) => ({ ...prev, photoUrl: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const updated: Member = {
      ...member,
      ...formData,
      name: (formData.name || '').toUpperCase(),
      photoUrl: photoPreview || member.photoUrl,
    } as Member;

    onSave(updated);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-stone-100 shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdmin ? 'Akses Admin: Edit Data & Foto Peserta' : 'Dashboard Peserta: Edit Data & Profil Saya'}</span>
            </div>
            <h3 className="text-xl font-bold font-serif text-amber-200">
              Ubah Profil Anggota — <span className="font-mono text-amber-400">{member.id}</span>
            </h3>
            <p className="text-xs text-stone-400">
              Perbarui nama, NIK, kontak, lokasi, serta pasfoto resmi untuk pembaruan KTA Digital.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-950 border border-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {showSuccessToast && (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-300">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Data dan foto berhasil diperbarui! KTA Digital langsung disesuaikan.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PHOTO SECTION WITH LIVE PREVIEW & UPLOAD */}
          <div className="p-4 bg-stone-950 rounded-xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5 font-serif">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Foto Profil & Pasfoto KTA Resmi</span>
              </span>
              <span className="text-[10px] text-stone-400">Format 3x4 atau Pasfoto Resmi</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Photo Preview Frame */}
              <div className="relative rounded-lg p-0.5 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-800 shadow-lg w-28 shrink-0">
                <div className="aspect-[3/4] rounded bg-stone-900 overflow-hidden relative group">
                  <img
                    src={photoPreview || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'}
                    alt="Preview Foto"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-amber-200 font-bold">
                    Foto KTA
                  </div>
                </div>
                <div className="text-[9px] font-mono font-bold text-amber-400 text-center mt-1 uppercase">
                  Pratinjau KTA
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase">
                    Unggah File Foto Dari Perangkat
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Pilih File Foto (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Avatar Selector */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase">
                    Atau Pilih Dari Sampel Foto Resmi:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(url)}
                        className={`w-9 h-11 rounded border overflow-hidden transition-all cursor-pointer ${
                          photoPreview === url ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-stone-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Photo URL */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase">
                    Atau Masukkan URL Link Foto:
                  </label>
                  <input
                    type="url"
                    value={photoPreview}
                    onChange={(e) => {
                      setPhotoPreview(e.target.value);
                      setFormData((prev) => ({ ...prev, photoUrl: e.target.value }));
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 bg-stone-900 border border-amber-500/20 rounded-lg text-xs text-stone-200 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FORM FIELDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-300 uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Nama Lengkap *</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama beserta gelar"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-300 uppercase flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>NIK (16 Digit) *</span>
              </label>
              <input
                type="text"
                required
                value={formData.nik || ''}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="3509xxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-300 uppercase flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>No. WhatsApp / Handphone</span>
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0823-3262-6916"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-300 uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Email Anggota</span>
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@domain.com"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-300 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Wilayah Tugas / Kantor Regional *</span>
              </label>
              <input
                type="text"
                required
                value={formData.region || ''}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="Kantor Pusat Jember, Surabaya, dll"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-300 uppercase">Divisi Organisasi</label>
              <select
                value={formData.division || 'Kemanusiaan'}
                onChange={(e) => setFormData({ ...formData, division: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-semibold"
              >
                <option value="Sosial">Sosial</option>
                <option value="Kemanusiaan">Kemanusiaan</option>
                <option value="Bantuan Hukum">Bantuan Hukum</option>
                <option value="Humas & Kerjasama">Humas & Kerjasama</option>
                <option value="Pengawas">Pengawas</option>
                <option value="Bendahara">Bendahara</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-300 uppercase">Kategori Keanggotaan</label>
              <select
                value={formData.membershipType || 'Relawan Lapangan'}
                onChange={(e) => setFormData({ ...formData, membershipType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-semibold"
              >
                <option value="Anggota Biasa">Anggota Biasa</option>
                <option value="Relawan Lapangan">Relawan Lapangan</option>
                <option value="Paralegal / Advokat">Paralegal / Advokat</option>
                <option value="Pengurus Regional">Pengurus Regional</option>
                <option value="Anggota Kehormatan">Anggota Kehormatan</option>
              </select>
            </div>

            {/* Admin only option to change Status */}
            {isAdmin && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amber-300 uppercase">Status Keaktifan (Akses Admin)</label>
                <select
                  value={formData.status || 'Aktif'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/50 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="Aktif">Status: Aktif</option>
                  <option value="Terverifikasi">Status: Terverifikasi</option>
                  <option value="Pengurus">Status: Pengurus</option>
                  <option value="Menunggu Verifikasi">Status: Menunggu Verifikasi</option>
                  <option value="Nonaktif">Status: Nonaktif</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-300 uppercase flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Catatan / Alasan Keanggotaan</span>
            </label>
            <textarea
              rows={2}
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Catatan pengabdian atau alasan bergabung..."
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* DOKUMEN KTP ANGGOTA */}
          <div className="p-4 bg-stone-950 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300 uppercase flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Dokumen Foto KTP Anggota</span>
              </label>
              {formData.ktpUrl && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Tersimpan di Cloud
                </span>
              )}
            </div>

            {formData.ktpUrl ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                <div className="w-36 h-22 rounded overflow-hidden border border-amber-500/50 bg-stone-900 shrink-0">
                  <img src={formData.ktpUrl} alt="Foto KTP" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1.5 flex-1 text-center sm:text-left">
                  <div className="text-xs text-stone-200 font-medium">Foto KTP Asli telah terlampir</div>
                  {formData.ktpUploadedAt && (
                    <div className="text-[10px] text-stone-400">Diunggah pada: {formData.ktpUploadedAt}</div>
                  )}
                  <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                    <label className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/40 rounded hover:bg-amber-500/30 cursor-pointer">
                      Ganti Foto KTP
                      <input type="file" accept="image/*" onChange={handleKtpUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, ktpUrl: undefined }))}
                      className="px-2.5 py-1 text-[11px] font-semibold text-red-300 bg-red-950/40 border border-red-500/40 rounded hover:bg-red-900/40 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-stone-900/40 rounded-lg border border-dashed border-stone-800 space-y-2">
                <p className="text-xs text-stone-400">Belum ada foto KTP yang diunggah untuk anggota ini</p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-200 bg-amber-500/20 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 cursor-pointer">
                  {isProcessingKtp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Foto KTP Sekarang</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleKtpUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* DIGITAL SIGNATURE EDIT SECTION */}
          <div className="p-4 bg-stone-950 rounded-xl border border-amber-500/30 space-y-3">
            <SignatureCanvas
              value={formData.signatureUrl}
              onChange={(signatureDataUrl) =>
                setFormData((prev) => ({ ...prev, signatureUrl: signatureDataUrl }))
              }
              applicantName={formData.name || ''}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-stone-400 hover:text-stone-200 bg-stone-950 border border-stone-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow-lg cursor-pointer"
            >
              Simpan Perubahan Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
