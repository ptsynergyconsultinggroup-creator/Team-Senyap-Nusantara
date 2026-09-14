import { Member, Program, NewsItem, Transaction } from '../types';

export const initialMembers: Member[] = [
  {
    id: 'TSN-00125',
    name: 'IBRAHIM',
    division: 'Bendahara',
    membershipType: 'Pengurus Regional',
    region: 'Kantor Pusat Jember',
    joinDate: '12 Januari 2022',
    status: 'Pengurus',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    phone: '0823-3262-6916',
    email: 'ibrahim@teamsenyapnusantara.org',
    nik: '3509111201950001',
    reason: 'Pengabdian penuh untuk kemajuan LPKSM & bantuan sosial masyarakat Jember.'
  },
  {
    id: 'TSN-00101',
    name: 'HERI PRABOWO, S.H.',
    division: 'Bantuan Hukum',
    membershipType: 'Paralegal / Advokat',
    region: 'Surabaya',
    joinDate: '15 Maret 2021',
    status: 'Pengurus',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    phone: '+62 813-8899-7711',
    email: 'heri.prabowo@teamsenyapnusantara.org',
    nik: '3578021503880002',
    reason: 'Memperjuangkan keadilan hukum pro bono bagi warga terzalimi.'
  },
  {
    id: 'TSN-00188',
    name: 'SITI RAHMAWATI',
    division: 'Kemanusiaan',
    membershipType: 'Relawan Lapangan',
    region: 'Bandung',
    joinDate: '08 Agustus 2022',
    status: 'Aktif',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    phone: '+62 815-4433-2211',
    email: 'siti.rahmawati@teamsenyapnusantara.org',
    nik: '3273014808940003',
    reason: 'Aktif dalam pertolongan kebencanaan dan logistik kemanusiaan.'
  },
  {
    id: 'TSN-00210',
    name: 'BAMBANG SUPRAYOGI',
    division: 'Humas & Kerjasama',
    membershipType: 'Anggota Biasa',
    region: 'Medan',
    joinDate: '10 November 2023',
    status: 'Aktif',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    phone: '+62 811-9988-7766',
    email: 'bambang.suprayogi@teamsenyapnusantara.org',
    nik: '1271031011890004',
    reason: 'Membangun jejaring komunikasi publik dan sosialisasi program TSN.'
  },
  {
    id: 'TSN-REG-2026-001',
    name: 'AHMAD HIDAYAT',
    division: 'Bantuan Hukum',
    membershipType: 'Paralegal / Advokat',
    region: 'Jember',
    joinDate: '05 Agustus 2026',
    status: 'Menunggu Verifikasi',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    phone: '+62 812-9900-1122',
    email: 'ahmad.hidayat@gmail.com',
    nik: '3509120508980005',
    reason: 'Ingin bergabung menjadi paralegal pendamping di LPKSM Jember.'
  },
  {
    id: 'TSN-REG-2026-002',
    name: 'DEWI LESTARI',
    division: 'Sosial',
    membershipType: 'Relawan Lapangan',
    region: 'Banyuwangi',
    joinDate: '06 Agustus 2026',
    status: 'Menunggu Verifikasi',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    phone: '+62 857-1122-3344',
    email: 'dewi.lestari@gmail.com',
    nik: '3510041204990006',
    reason: 'Siap diterjunkan pada kegiatan penyaluran sembako & bakti sosial.'
  }
];

export const initialPrograms: Program[] = [
  {
    id: 'prog-1',
    title: 'Bakti Sosial & Sembako Murah',
    category: 'Sosial',
    description: 'Penyaluran paket bahan pokok dan pelayanan kesehatan gratis untuk masyarakat prasejahtera di berbagai pelosok daerah.',
    fullContent: 'Program Bakti Sosial Team Senyap Nusantara secara rutin menyasar keluarga prasejahtera, lansia sebatang kara, serta anak-anak yatim. Kami membagikan bantuan pangan gizi, layanan pemeriksaan kesehatan cuma-cuma, serta bantuan perlengkapan sekolah bagi anak-anak di wilayah pelosok.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    date: 'Setiap Bulan',
    location: 'Nasional (Seluruh Wilayah Indonesia)',
    impactNumber: '15.000+',
    impactUnit: 'Penerima Manfaat'
  },
  {
    id: 'prog-2',
    title: 'Tim Reaksi Cepat Bantuan Bencana',
    category: 'Bantuan Bencana',
    description: 'Evakuasi darurat, pendirian dapur umum, dan pendistribusian logistik saat terjadi bencana alam banjir, gempa, dan tanah longsor.',
    fullContent: 'Tim Reaksi Cepat (TRC) Team Senyap Nusantara diterjunkan langsung ke garis depan saat bencana alam melanda. Dilengkapi dengan personel terlatih dan armada logistik mandiri, TSN memfokuskan aksi pada penyelamatan awal, pendirian dapur umum higienis, serta pemulihan pasca-bencana.',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    date: 'Tanggap 24/7',
    location: 'Wilayah Bencana Nasional',
    impactNumber: '42+',
    impactUnit: 'Titik Posko Bencana'
  },
  {
    id: 'prog-3',
    title: 'Advokasi Perlindungan Konsumen & Mediasi Non-Litigasi',
    category: 'Advokasi Hukum',
    description: 'Fasilitasi mediasi tripartit sengketa konsumen, pendampingan hukum pro bono, peninjauan klausula baku, serta ganti rugi sesuai UU No. 8/1999.',
    fullContent: 'Sebagai Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) yang terdaftar resmi (TDLPK 510/024/TDLPK/DISPERINDAG/2024), divisi Bantuan Hukum kami aktif mengadvokasi hak-hak konsumen, memfasilitasi musyawarah perdamaian (Acta van Dading), serta mendampingi konsumen berhadapan dengan pelaku usaha maupun di hadapan BPSK dan Pengadilan.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    date: 'Layanan Rutin 24/7',
    location: 'Posko Advokasi LPKSM Jember & Seluruh Indonesia',
    impactNumber: '1.250+',
    impactUnit: 'Sengketa Tuntas'
  },
  {
    id: 'prog-4',
    title: 'Edukasi Hak Konsumen & Pengawasan Klausula Baku',
    category: 'Edukasi',
    description: 'Sosialisasi UU No. 8/1999 dan Permendag RI No. 35/2021, pencegahan penipuan transaksi digital, serta pengawasan mutu peredaran barang dan jasa.',
    fullContent: 'Berdasarkan Pasal 44 UU Perlindungan Konsumen, LPKSM Senyap Nusantara Jaya menyelenggarakan edukasi literasi konsumen cerdas ke pasar-pasar tradisional, komunitas UMKM, kampus, dan masyarakat luas agar konsumen sadar akan hak ganti rugi dan tidak dirugikan oleh perjanjian sepihak (klausula baku).',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
    date: 'Jadwal Berkala',
    location: 'Wilayah Jawa Timur & Nasional',
    impactNumber: '180+',
    impactUnit: 'Sosialisasi Terlaksana'
  }
];

export const initialNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'LPKSM Senyap Nusantara Jaya Fasilitasi Puluhan Mediasi Damai Sengketa Konsumen di Jawa Timur',
    category: 'Advokasi Hukum',
    date: '04 Agustus 2026',
    author: 'Divisi Advokasi LPKSM',
    summary: 'Melalui musyawarah tripartit berlandaskan UU No. 8/1999 dan PP No. 59/2001, tim mediator LPKSM sukses memfasilitasi ganti rugi damai bagi puluhan konsumen.',
    content: 'LPKSM Senyap Nusantara Jaya kembali membuktikan komitmennya dalam memperjuangkan hak masyarakat konsumen. Sebanyak puluhan aduan transaksi perdagangan berhasil diselesaikan melalui Berita Acara Kesepakatan Perdamaian (Acta van Dading) tanpa perlu menempuh proses litigasi yang berbelit-belit.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'news-2',
    title: 'Tim Senyap Nusantara Salurkan Bantuan Logistik bagi Korban Bencana di Sumatera & Jawa',
    category: 'Kemanusiaan',
    date: '28 Juli 2026',
    author: 'Humas TSN Pusat',
    summary: 'Relawan TSN bahu-membahu menyalurkan bantuan pangan, tenda darurat, dan obat-obatan bagi warga terdampak bencana alam.',
    content: 'Penyaluran bantuan kemanusiaan ini melibatkan lebih dari 50 relawan lapangan Team Senyap Nusantara. Dalam tempo kurang dari 24 jam setelah kejadian, posko utama TSN telah berdiri untuk melayani warga terdampak.',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'news-3',
    title: 'Penerbitan KTA Digital Terintegrasi: Penguatan Integritas & Otorisasi Surat Tugas Resmi LPKSM',
    category: 'Pengumuman',
    date: '15 Juli 2026',
    author: 'Pengurus Pusat TSN & LPKSM',
    summary: 'Sistem KTA Digital resmi diintegrasikan dengan generator dokumen hukum, QR Code verifikasi real-time, dan proteksi hak akses.',
    content: 'Sistem KTA Digital dan Dokumen Resmi terenkripsi memastikan setiap advokat, mediator, dan relawan yang bertugas di lapangan mengantongi identitas dan Surat Perintah Tugas (SPT) sah yang dapat diverifikasi publik secara transparan demi mencegah penyalahgunaan.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'TRX-001',
    date: '2026-08-01',
    type: 'pemasukan',
    category: 'Iuran Bulanan Anggota',
    amount: 2500000,
    description: 'Iuran Wajib & Sukarela Anggota TSN Wilayah Jember & Surabaya',
    recordedBy: 'IBRAHIM (Bendahara Pusat)',
  },
  {
    id: 'TRX-002',
    date: '2026-08-02',
    type: 'pemasukan',
    category: 'Donasi Kemanusiaan',
    amount: 5000000,
    description: 'Sumbangan Donatur Dermawan untuk Posko Bantuan Hukum & Sosial',
    recordedBy: 'IBRAHIM (Bendahara Pusat)',
  },
  {
    id: 'TRX-003',
    date: '2026-08-03',
    type: 'pengeluaran',
    category: 'Pencetakan KTA & Seragam',
    amount: 1200000,
    description: 'Biaya cetak KTA PVC standar KTP dan pembuatan emblem kemeja TSN',
    recordedBy: 'IBRAHIM (Bendahara Pusat)',
  },
  {
    id: 'TRX-004',
    date: '2026-08-04',
    type: 'pengeluaran',
    category: 'Operasional Posko Jember',
    amount: 850000,
    description: 'Listrik, internet Wi-Fi posko, dan konsumsi rapat koordinasi relawan',
    recordedBy: 'IBRAHIM (Bendahara Pusat)',
  },
  {
    id: 'TRX-005',
    date: '2026-08-05',
    type: 'pemasukan',
    category: 'Bantuan Donatur Mitra',
    amount: 3500000,
    description: 'Support program advokasi konsumen LPKSM Senyap Nusantara Jaya',
    recordedBy: 'IBRAHIM (Bendahara Pusat)',
  },
  {
    id: 'TRX-006',
    date: '2026-08-06',
    type: 'pengeluaran',
    category: 'Aksi Sosial & Sembako',
    amount: 2100000,
    description: 'Pembelian paket sembako meuntuk santunan anak yatim & kaum dhuafa',
    recordedBy: 'IBRAHIM (Bendahara Pusat)',
  },
];

export const initialSiteConfig = {
  logoUrl: '',
  logoType: 'both' as 'svg' | 'image' | 'both',
  orgName: 'TEAM SENYAP NUSANTARA',
  subTitle: 'LPKSM SENYAP NUSANTARA JAYA (KABUPATEN JEMBER)',
  heroHeadline: 'TEAM SENYAP NUSANTARA',
  heroTagline: 'Solid • Integritas • Kebersamaan',
  heroDescription: 'Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) dan Komunitas Sosial Kemanusiaan terdaftar resmi negara. Berkomitmen mengadvokasi hak-hak konsumen, bantuan hukum pro-bono, aksi kemanusiaan, serta bakti sosial berlandaskan UU No. 8 Tahun 1999 dan regulasi perundang-undangan Republik Indonesia.',
  phoneHotline: '0823-3262-6916',
  whatsappNumber: '6282332626916',
  email: 'sekretariat@teamsenyapnusantara.org',
  address: 'Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kabupaten Jember, Jawa Timur 68161',
  legalNumber: 'AHU-0004521.AH.01.07.Tahun 2024 / TDLPK: 510/024/Disperindag/2024',
  tdlpkNumber: 'No. 510/024/TDLPK/Disperindag/2024',
  kemenkumhamNumber: 'AHU-0004521.AH.01.07.Tahun 2024',
  npwpNumber: '14.285.901.4-626.000',
  ketuaUmumName: 'HERI PRABOWO, S.H.',
  sekretarisName: 'SITI RAHMAWATI',
  bendaharaName: 'IBRAHIM (Bendahara Pusat)',
  statMembersCount: '500+',
  statProvincesCount: '34',
  statProBonoRate: '100%',
  aboutTitle: 'PROFIL LPKSM SENYAP NUSANTARA JAYA & TSN',
  aboutText1: 'Team Senyap Nusantara (TSN) berkolaborasi dengan Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) Senyap Nusantara Jaya yang berkedudukan hukum di Kabupaten Jember, Jawa Timur. Lembaga ini diakui secara sah oleh Negara Kesatuan Republik Indonesia berdasarkan UU No. 8 Tahun 1999 tentang Perlindungan Konsumen dan PP No. 59 Tahun 2001.',
  aboutText2: 'Sebagai LPKSM berbadan hukum dan memiliki Tanda Daftar Lembaga Perlindungan Konsumen (TDLPK) resmi Dinas Perindustrian dan Perdagangan, kami menjalankan fungsi pengawasan peredaran barang/jasa, penerimaan pengaduan, konsultasi hak konsumen, mediasi sengketa non-litigasi, serta aksi kemanusiaan dan bakti sosial tanpa dipungut biaya (pro bono) bagi masyarakat prasejahtera.',
  bankAccountInfo: 'Bank Mandiri: 143-00-1234567-8 a/n LPKSM SENYAP NUSANTARA JAYA',
  adminUsername: 'admin',
  adminPin: 'tsn2024',
};


