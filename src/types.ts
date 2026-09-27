export type MembershipType = 
  | 'Anggota Biasa'
  | 'Relawan Lapangan'
  | 'Paralegal / Advokat'
  | 'Pengurus Regional'
  | 'Anggota Kehormatan';

export interface Member {
  id: string; // Format resmi: KODE_WILAYAH-TAHUN_BERGABUNG-NOMOR_URUT (e.g. 35.09-2026-0016)
  name: string;
  division?: 'Sosial' | 'Kemanusiaan' | 'Bantuan Hukum' | 'Humas & Kerjasama' | 'Pengawas' | 'Bendahara' | string;
  position?: 'Ketua' | 'Sekretaris' | 'Bendahara' | 'Pengawas' | 'Humas' | 'Tim Hukum' | 'Anggota' | string;
  membershipType?: MembershipType;
  region: string; // e.g. Jawa Timur, Kantor Pusat Jember
  joinDate: string;
  joinYear?: string;
  validUntil?: string; // e.g. "30 Desember 2027"
  status: 'Aktif' | 'Nonaktif' | 'Menunggu Verifikasi' | 'Ditangguhkan' | 'Berakhir' | 'Arsip' | 'Pengurus' | 'Terverifikasi';
  photoUrl: string;
  ktpUrl?: string; // Foto KTP / Dokumen Identitas
  ktpUploadedAt?: string;
  phone?: string;
  email?: string;
  nik?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  religion?: string;
  address?: string;
  village?: string; // Desa / Kelurahan
  district?: string; // Kecamatan
  regency?: string; // Kabupaten / Kota
  province?: string; // Provinsi
  signatureUrl?: string;
  reason?: string;
  qrCodeValue?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string; // auto id or formatted plate
  licensePlate: string; // e.g. "P 1234 AB"
  memberId: string; // Linked directly to Member ID e.g. "35.09-2026-0016"
  memberName: string;
  vehicleType: 'Mobil' | 'Motor' | 'Truk Logistik TRC' | 'Ambulans Kemanusiaan' | 'Lainnya';
  brandModel: string; // e.g. "Toyota Avanza", "Honda Vario"
  year: string; // e.g. "2023"
  color: string; // e.g. "Hitam Metalik"
  chassisNumber?: string; // No. Rangka (sensitif / opsional)
  engineNumber?: string; // No. Mesin (sensitif / opsional)
  stickerStatus: 'Diterbitkan & Tertempel' | 'Dalam Proses Cetak' | 'Belum Didaftarkan' | 'Dicabut';
  stickerNumber?: string; // No. Seri Stiker TSN (e.g. "TSN-STK-0016")
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Program {
  id: string;
  title: string;
  category: 'Sosial' | 'Bantuan Bencana' | 'Advokasi Hukum' | 'Edukasi';
  description: string;
  fullContent: string;
  imageUrl: string;
  date: string;
  location: string;
  impactNumber: string;
  impactUnit: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  summary: string;
  content: string;
  imageUrl: string;
}

export interface LegalAidCase {
  ticketNumber: string;
  applicantName: string;
  phone: string;
  category:
    | 'Sengketa Konsumen (LPKSM)'
    | 'Mediasi & Arbitrase Non-Litigasi'
    | 'Klausula Baku & Ganti Rugi'
    | 'Advokasi Hukum'
    | 'Bantuan Bencana'
    | 'Bakti Sosial'
    | 'Konsultasi Umum'
    | string;
  location: string;
  reportedParty?: string; // Nama Pelaku Usaha / Toko / Lembaga Terlapor
  businessSector?: string; // Sektor Usaha (Fintech, Leasing, Properti, dll)
  estimatedLoss?: string; // Estimasi kerugian finansial konsumen (Rp)
  description: string;
  status: 'Menunggu Peninjauan' | 'Tim Hukum Ditugaskan' | 'Tahap Klarifikasi' | 'Mediasi Terjadwal' | 'Selesai';
  submittedAt: string;
  consentPrivacy?: boolean;
}

export interface PressRelease {
  id: string;
  releaseNumber: string; // e.g. "PR-015/LPKSM-TSN/PERS/IX/2025"
  date: string;
  embargo: 'FOR IMMEDIATE RELEASE' | 'EMBARGOED' | 'SIARAN SEGERA';
  title: string;
  subtitle: string;
  dateline: string; // e.g. "JEMBER, JAWA TIMUR"
  spokesperson: string;
  spokespersonRole: string;
  summary: string;
  body: string[];
  keyQuotes: string[];
  mediaContact: {
    name: string;
    role: string;
    phone: string;
    email: string;
  };
  attachments?: {
    name: string;
    type: string;
    size: string;
  }[];
}

export interface MediaAccreditation {
  id: string;
  journalistName: string;
  mediaOutlet: string;
  mediaType: 'Online' | 'Cetak' | 'Televisi' | 'Radio';
  pressCardNumber: string;
  phone: string;
  email: string;
  eventOrTopic: string;
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string; // e.g. "2026-08-01"
  type: 'pemasukan' | 'pengeluaran';
  category: string; // e.g. "Iuran Anggota", "Donasi Dermawan", "Operasional Posko Jember", "Bantuan Hukum Pro-Bono", "Pencetakan KTA & Seragam"
  amount: number; // in IDR (Rupiah)
  description: string;
  recordedBy: string; // e.g. "Ibrahim (Bendahara)"
}

export interface MemberPrivate {
  nik?: string;
  phone?: string;
  email?: string;
  address?: string;
  ktpUrl?: string;
  signatureUrl?: string;
  reason?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  adminEmail: string;
  adminUid: string;
  action:
    | 'VERIFY_MEMBER'
    | 'REJECT_MEMBER'
    | 'UPDATE_MEMBER'
    | 'DELETE_MEMBER'
    | 'ADD_TRANSACTION'
    | 'DELETE_TRANSACTION'
    | 'UPDATE_CONFIG'
    | 'UPDATE_LEGAL_AID'
    | 'PUBLISH_NEWS'
    | 'UPDATE_NEWS'
    | 'DELETE_NEWS'
    | 'ADD_VEHICLE'
    | 'UPDATE_VEHICLE'
    | 'DELETE_VEHICLE';
  targetId: string;
  details: string;
}

export interface AdminProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'superadmin' | 'admin' | 'verifikator';
  createdAt?: string;
}

export interface SiteConfig {
  logoUrl?: string;
  logoType?: 'svg' | 'image' | 'both';
  orgName: string;
  subTitle: string;
  heroHeadline: string;
  heroTagline: string;
  heroDescription: string;
  phoneHotline: string;
  whatsappNumber: string;
  email: string;
  address: string;
  legalNumber: string;
  tdlpkNumber?: string;
  kemenkumhamNumber?: string;
  npwpNumber?: string;
  ketuaUmumName?: string;
  sekretarisName?: string;
  bendaharaName?: string;
  statMembersCount: string;
  statProvincesCount: string;
  statProBonoRate: string;
  aboutTitle: string;
  aboutText1: string;
  aboutText2: string;
  bankAccountInfo: string;
}

