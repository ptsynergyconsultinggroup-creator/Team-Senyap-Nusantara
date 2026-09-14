import React, { useState, useRef, useEffect } from 'react';
import { Member, SiteConfig } from '../types';
import { TSNLogo } from './TSNLogo';
import { downloadElementAsPDF, downloadBatchElementsAsPDF } from '../utils/pdfExport';
import {
  FileText,
  X,
  Printer,
  Sparkles,
  Download,
  Copy,
  Check,
  User,
  ShieldCheck,
  Building,
  Calendar,
  PenTool,
  Search,
  Plus,
  Send,
  History,
  FileCheck,
  Scale,
  AlertCircle,
  AlertTriangle,
  Users,
  Layers,
  CheckSquare,
  Square,
  ListOrdered,
  Upload,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  PlusCircle,
  Trash2,
  Paperclip,
  Sliders,
  Edit3,
  Save,
  FileUp,
  RefreshCw,
  QrCode,
} from 'lucide-react';

export type DocumentType =
  | 'surat_tugas'
  | 'surat_pengangkatan'
  | 'surat_kuasa'
  | 'surat_klarifikasi'
  | 'surat_mediasi'
  | 'surat_bap_mediasi'
  | 'surat_keterangan';

export interface IssuedDocument {
  id: string;
  docNumber: string;
  docType: DocumentType;
  title: string;
  recipient: string;
  memberName: string;
  memberId: string;
  issueDate: string;
  status: 'Diterbitkan' | 'Arsip' | 'Dalam Proses';
  details: any;
}

interface OfficialDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  siteConfig?: SiteConfig;
}

export const formatIndonesianDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export const OfficialDocumentsModal: React.FC<OfficialDocumentsModalProps> = ({
  isOpen,
  onClose,
  members,
  siteConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'archive'>('create');
  const [docViewMode, setDocViewMode] = useState<'single' | 'batch'>('single');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('surat_tugas');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [isCopied, setIsCopied] = useState(false);
  const [autoPopulateToast, setAutoPopulateToast] = useState<string | null>(null);

  // Batch Queue Types Selection (All 7 Official Types)
  const ALL_DOC_TYPES: DocumentType[] = [
    'surat_tugas',
    'surat_pengangkatan',
    'surat_kuasa',
    'surat_klarifikasi',
    'surat_mediasi',
    'surat_bap_mediasi',
    'surat_keterangan',
  ];
  const [selectedBatchTypes, setSelectedBatchTypes] = useState<DocumentType[]>(ALL_DOC_TYPES);

  // Form Fields
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();
  const romanMonthsList = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const initialRomanMonth = romanMonthsList[currentMonthNum - 1] || 'IX';

  const [docNumber, setDocNumber] = useState<string>(
    `Nomor: 042/SPT-ADV/LPKSM-TSN/${initialRomanMonth}/${currentYearNum}`
  );
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [destination, setDestination] = useState<string>('Wilayah Kab. Jember & Sekitarnya');
  const [taskDescription, setTaskDescription] = useState<string>(
    'Melakukan klarifikasi lapangan, investigasi faktual, dan pemeriksaan dokumen transaksi atas dugaan pelanggaran hak konsumen serta memfasilitasi musyawarah mediasi non-litigasi sesuai UU No. 8 Tahun 1999 jo. PP No. 59 Tahun 2001.'
  );
  const [recipientName, setRecipientName] = useState<string>('Pimpinan PT / Pelaku Usaha Terkait');
  const [caseSubject, setCaseSubject] = useState<string>('Pelaksanaan Tugas Klarifikasi, Pemantauan & Advokasi Perlindungan Konsumen');
  const [includeStamp, setIncludeStamp] = useState<boolean>(true);
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);

  // Google Docs Style Live Editor State
  const [editorMode, setEditorMode] = useState<'docs' | 'form'>('docs');
  const [docFontFamily, setDocFontFamily] = useState<'font-serif' | 'font-sans' | 'font-mono'>('font-serif');
  const [docFontSize, setDocFontSize] = useState<'text-xs' | 'text-sm' | 'text-base'>('text-sm');
  const [docLineHeight, setDocLineHeight] = useState<'leading-normal' | 'leading-relaxed' | 'leading-loose'>('leading-relaxed');
  const [docTextAlign, setDocTextAlign] = useState<'text-left' | 'text-center' | 'text-right' | 'text-justify'>('text-justify');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Signer role state (Pimpinan Penandatangan Dokumen)
  const [signerRole, setSignerRole] = useState<'ibrahim' | 'heri' | 'siti'>('heri');

  // Custom Editable Document Content & Sections (Google Docs Style)
  const [customHeaderTitle, setCustomHeaderTitle] = useState('LEMBAGA PERLINDUNGAN KONSUMEN SWADAYA MASYARAKAT');
  const [customHeaderSub, setCustomHeaderSub] = useState('LPKSM "SENYAP NUSANTARA JAYA"');
  const [customHeaderAddress, setCustomHeaderAddress] = useState(
    'SK KEMENKUMHAM RI NOMOR: AHU-0004521.AH.01.07.TAHUN 2024 • NPWP BADAN: 14.285.901.4-626.000\nTANDA DAFTAR LEMBAGA PERLINDUNGAN KONSUMEN (TDLPK) NO. 510/024/TDLPK/DISPERINDAG/2024\n(Berdasarkan Permendag RI No. 35 Tahun 2021 jo. UU No. 8 Tahun 1999 & PP No. 59 Tahun 2001)\nSekretariat Pusat: Jl. Lumajang - Jember, Dusun Kebon, Desa Tutul, Kec. Balung, Kab. Jember, Jawa Timur 68161'
  );
  const [customHeaderHotline, setCustomHeaderHotline] = useState(
    'Hotline Advokasi & Pengaduan (WA): +62 823-3262-6916 • Pos-el: sekretariat@teamsenyapnusantara.org • Laman: teamsenyapnusantara.org'
  );
  const [customKopLogoUrl, setCustomKopLogoUrl] = useState<string | null>(null);

  // Sync with siteConfig if provided
  useEffect(() => {
    if (siteConfig) {
      if (siteConfig.kemenkumhamNumber || siteConfig.tdlpkNumber || siteConfig.address) {
        setCustomHeaderAddress(
          `SK KEMENKUMHAM RI NOMOR: ${siteConfig.kemenkumhamNumber || 'AHU-0004521.AH.01.07.TAHUN 2024'} • NPWP BADAN: ${siteConfig.npwpNumber || '14.285.901.4-626.000'}\nTANDA DAFTAR LEMBAGA PERLINDUNGAN KONSUMEN (TDLPK) NO. ${siteConfig.tdlpkNumber || '510/024/TDLPK/DISPERINDAG/2024'} (PERMENDAG RI NO. 35 TAHUN 2021)\nSekretariat Pusat: ${siteConfig.address || 'Jl. Lumajang - Jember, Dusun Kebon, Desa Tutul, Kec. Balung, Kab. Jember, Jawa Timur 68161'}`
        );
      }
      if (siteConfig.whatsappNumber || siteConfig.email) {
        setCustomHeaderHotline(
          `Hotline Advokasi & Pengaduan (WA): +62 ${siteConfig.whatsappNumber?.replace(/^0|^62/, '') || '823-3262-6916'} • Pos-el: ${siteConfig.email || 'sekretariat@teamsenyapnusantara.org'} • Laman: teamsenyapnusantara.org`
        );
      }
    }
  }, [siteConfig]);

  // Helper for signer details
  const getSignerDetails = () => {
    switch (signerRole) {
      case 'ibrahim':
        return { name: 'IBRAHIM', title: 'Bendahara Umum / Pengurus Pusat' };
      case 'siti':
        return { name: 'SITI RAHMAWATI', title: 'Sekretaris Jenderal LPKSM' };
      case 'heri':
      default:
        return { name: 'HERI PRABOWO, S.H.', title: 'Ketua Umum / Advokat LPKSM' };
    }
  };

  // Custom Clauses / Points (Pasal / Poin Tambahan)
  const [customClauses, setCustomClauses] = useState<Array<{ id: string; title: string; content: string }>>([
    {
      id: 'clause-1',
      title: 'DASAR HUKUM & KEDUDUKAN HUKUM (LEGAL STANDING LPKSM):',
      content:
        'Berdasarkan Pasal 44 ayat (3) dan Pasal 46 ayat (1) huruf c UU RI No. 8 Tahun 1999 jo. PP RI No. 59 Tahun 2001, LPKSM Senyap Nusantara Jaya berstatus badan hukum resmi dan berwenang menerima pengaduan, memberikan advokasi, memfasilitasi perundingan damai non-litigasi, serta mendampingi konsumen memperjuangkan hak-haknya demi tegaknya kepastian hukum.',
    },
    {
      id: 'clause-2',
      title: 'PERLINDUNGAN DATA PRIBADI & INTEGRITAS (UU NO. 27 TAHUN 2022):',
      content:
        'Seluruh identitas, berkas transaksi, dan keterangan para pihak dirahasiakan dan dilindungi sesuai amanat UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Pelaksanaan tugas advokasi bebas dari segala bentuk pungutan liar (pungli) dan gratifikasi.',
    },
  ]);

  // Custom Image Attachments (Lampiran Foto / Bukti / Gambar)
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; url: string; caption: string }>>([]);

  // Upload Custom Stamp & Signature
  const [customSignatureImg, setCustomSignatureImg] = useState<string | null>(null);
  const [customStampImg, setCustomStampImg] = useState<string | null>(null);

  // File Upload Input Refs
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Document Import (.txt or .json)
  const handleImportDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(result);
          if (parsed.docNumber) setDocNumber(parsed.docNumber);
          if (parsed.taskDescription) setTaskDescription(parsed.taskDescription);
          if (parsed.recipientName) setRecipientName(parsed.recipientName);
          if (parsed.destination) setDestination(parsed.destination);
          if (parsed.caseSubject) setCaseSubject(parsed.caseSubject);
          if (parsed.customHeaderTitle) setCustomHeaderTitle(parsed.customHeaderTitle);
          if (parsed.customHeaderSub) setCustomHeaderSub(parsed.customHeaderSub);
          if (parsed.customHeaderAddress) setCustomHeaderAddress(parsed.customHeaderAddress);
          if (parsed.customClauses) setCustomClauses(parsed.customClauses);
          if (parsed.attachments) setAttachments(parsed.attachments);
          setAutoPopulateToast(`Draft dokumen '${file.name}' berhasil dimuat!`);
        } catch (err) {
          alert('Format berkas JSON tidak valid.');
        }
      } else {
        setTaskDescription(result);
        setAutoPopulateToast(`Teks dari berkas '${file.name}' berhasil disalin ke dokumen!`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Upload Custom Logo Kop Surat
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setCustomKopLogoUrl(url);
      setAutoPopulateToast('Logo Kop Surat berhasil diunggah!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload Custom Stempel
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setCustomStampImg(url);
      setIncludeStamp(true);
      setAutoPopulateToast('Stempel Resmi berhasil diunggah!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload Custom Tanda Tangan
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setCustomSignatureImg(url);
      setIncludeSignature(true);
      setAutoPopulateToast('Tanda Tangan Digital berhasil diunggah!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload Attachment Image
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            url,
            caption: `Lampiran Bukti: ${file.name}`,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    setAutoPopulateToast('Lampiran berkas foto berhasil diunggah!');
    e.target.value = '';
  };

  // Export Document as JSON Draft
  const handleExportJSON = () => {
    const draft = {
      docType: selectedDocType,
      docNumber,
      issueDate,
      destination,
      recipientName,
      caseSubject,
      taskDescription,
      customHeaderTitle,
      customHeaderSub,
      customHeaderAddress,
      customClauses,
      attachments,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(draft, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Draft_Surat_${selectedDocType}_${docNumber.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Add Clause
  const handleAddClause = () => {
    setCustomClauses([
      ...customClauses,
      {
        id: `clause-${Date.now()}`,
        title: `POIN KHUSUS ${customClauses.length + 1}:`,
        content: 'Tuliskan rincian klausul, poin pengaduan, atau undang-undang tambahan di sini...',
      },
    ]);
  };

  // Remove Clause
  const handleRemoveClause = (id: string) => {
    setCustomClauses(customClauses.filter((c) => c.id !== id));
  };

  // Helper to get prefix for document number according to State Administrative / LPKSM standards
  const getRefNoForType = (type: DocumentType) => {
    const prefixMap: Record<DocumentType, string> = {
      surat_tugas: 'SPT-ADV',
      surat_pengangkatan: 'SK-PENG',
      surat_kuasa: 'SKU-KONS',
      surat_klarifikasi: 'SOM-KLAR',
      surat_mediasi: 'UND-MED',
      surat_bap_mediasi: 'BA-MED',
      surat_keterangan: 'SKK-ANG',
    };
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const romanMonth = romanMonths[currentMonth - 1] || 'IX';
    return `Nomor: 042/${prefixMap[type] || 'DOC'}/LPKSM-TSN/${romanMonth}/${currentYear}`;
  };

  // Auto-populate member details into selected letter template
  const applyMemberTemplateData = (member: Member, docType: DocumentType) => {
    if (!member) return;
    const memberName = member.name || 'Anggota TSN';
    const memberId = member.id || 'TSN-001';
    const division = member.division || 'Divisi Advokasi & Bantuan Hukum';
    const joinDate = member.joinDate || '2024-01-01';
    const address = member.address || 'Kab. Jember, Jawa Timur';

    // Set updated Ref Number
    setDocNumber(getRefNoForType(docType));

    switch (docType) {
      case 'surat_keterangan':
        setRecipientName(memberName);
        setCaseSubject('Surat Keterangan Keanggotaan & Keabsahan Relawan Resmi (SKK)');
        setDestination(`Sekretariat & Wilayah Kerja (${address})`);
        setTaskDescription(
          `Pengurus Pusat LPKSM Senyap Nusantara Jaya menerangkan dengan sebenarnya bahwa Saudara/i ${memberName} (NTA: ${memberId}, NIK: ${member.nik || '3509111201950001'}) adalah Anggota Resmi yang tercatat aktif dalam database induk organisasi sejak ${joinDate} pada ${division}. Yang bersangkutan memiliki kewenangan menjalankan mandat advokasi non-litigasi dengan berpegang teguh pada Pakta Integritas, bebas dari segala bentuk pungli, dan berpedoman pada UU RI No. 8 Tahun 1999 jo. PP RI No. 59 Tahun 2001.`
        );
        break;

      case 'surat_pengangkatan':
        setRecipientName(memberName);
        setCaseSubject('Surat Keputusan (SK) Pengangkatan Pengurus & Penetapan Jabatan Organisasi');
        setDestination(`Struktur Pengurus Wilayah (${address})`);
        setTaskDescription(
          `Menimbang dedikasi, integritas, dan kompetensi, Pengurus Pusat menetapkan pengangkatan Saudara/i ${memberName} (NTA: ${memberId}, NIK: ${member.nik || '3509111201950001'}) dalam jabatan ${member.membershipType || division} LPKSM Senyap Nusantara Jaya dengan wewenang mengawal pengawasan barang/jasa, mengelola posko advokasi masyarakat, dan memfasilitasi mediasi sengketa konsumen berlandaskan AD/ART dan perundang-undangan RI.`
        );
        break;

      case 'surat_tugas':
        setRecipientName('Pimpinan Pelaku Usaha / Pihak Terkait');
        setCaseSubject('Pelaksanaan Perintah Tugas Klarifikasi, Pemantauan & Advokasi Perlindungan Konsumen');
        setDestination(address || 'Wilayah Kab. Jember & Jawa Timur');
        setTaskDescription(
          `Memberikan Perintah Tugas resmi kepada Saudara/i ${memberName} (NTA: ${memberId}, NIK: ${member.nik || '3509111201950001'} - ${division}) untuk:
1. Melakukan klarifikasi lapangan, investigasi faktual, dan pemeriksaan dokumen transaksi atas dugaan pelanggaran hak-hak konsumen;
2. Mendampingi konsumen pengadu dan memfasilitasi musyawarah mediasi non-litigasi sesuai amanat Pasal 44 & 46 UU No. 8 Tahun 1999 jo. PP No. 59 Tahun 2001;
3. Berkoordinasi dengan BPSK Kabupaten/Kota, instansi dinas pembina, dan aparat penegak hukum (APH) setempat;
4. [PAKTA INTEGRITAS]: Petugas wajib menjunjung kode etik advokasi, dilarang memungut biaya tidak sah/pungli, dan wajib melaporkan hasil pelaksanaan tugas selambat-lambatnya 7 hari kerja.`
        );
        break;

      case 'surat_kuasa':
        setRecipientName('Pemberi Kuasa (Konsumen Pengadu)');
        setCaseSubject('Surat Kuasa Khusus Pendampingan & Penyelesaian Sengketa Hak Konsumen');
        setDestination(address);
        setTaskDescription(
          `Pemberi Kuasa memberikan KUASA KHUSUS kepada Saudara/i ${memberName} (NTA: ${memberId} - ${division}) untuk mendampingi, mewakili kepentingan hukum Pemberi Kuasa, mengajukan permohonan klarifikasi/somasi, menghadiri musyawarah atau mediasi tripartit di BPSK, serta melakukan segala tindakan hukum yang patut dan sah sesuai Pasal 1792 s.d. Pasal 1819 KUHPerdata jo. UU No. 8 Tahun 1999 dengan hak substitusi dan hak retensi.`
        );
        break;

      case 'surat_klarifikasi':
        setRecipientName('Direksi / Pimpinan Pelaku Usaha (Teradu)');
        setCaseSubject('Somasi I & Permohonan Klarifikasi Resmi Pelanggaran Hak-Hak Konsumen');
        setDestination('Kantor Pelaku Usaha / Teradu');
        setTaskDescription(
          `Berdasarkan Laporan Pengaduan Konsumen yang teregistrasi resmi di Posko Pengaduan LPKSM Senyap Nusantara Jaya, kami menyampaikan Somasi I dan Permohonan Klarifikasi atas dugaan pelanggaran Pasal 4, Pasal 7, Pasal 18 (Larangan Klausula Baku), dan Pasal 19 UU No. 8 Tahun 1999. Pelaku Usaha diberikan tenggat waktu 7 (tujuh) hari kalender sejak surat ini diterima untuk memberikan penjelasan tertulis dan iktikad baik penyelesaian ganti rugi sebelum sengketa diproses lebih lanjut ke BPSK, Ditjen PKTN Kemendag RI, atau jalur hukum yang berlaku.`
        );
        break;

      case 'surat_mediasi':
        setRecipientName('Pihak Konsumen & Pihak Pelaku Usaha');
        setCaseSubject('Undangan Musyawarah / Mediasi Tripartit Penyelesaian Sengketa Konsumen');
        setDestination('Sekretariat Pusat LPKSM Senyap Nusantara Jaya (Balung, Jember)');
        setTaskDescription(
          `Mengundang secara resmi Para Pihak Bersengketa (Konsumen Pengadu dan Pelaku Usaha Teradu) untuk menghadiri Sidang Musyawarah/Mediasi Tripartit non-litigasi yang difasilitasi oleh Mediator Resmi LPKSM Saudara/i ${memberName} (NTA: ${memberId}) bertempat di Kantor Sekretariat Pusat LPKSM Senyap Nusantara Jaya guna mewujudkan mufakat damai, kepastian hukum, dan pemenuhan hak konsumen secara adil berlandaskan PP No. 59 Tahun 2001.`
        );
        break;

      case 'surat_bap_mediasi':
        setRecipientName('Para Pihak Bersengketa & Mediator LPKSM');
        setCaseSubject('Berita Acara Kesepakatan Perdamaian Sengketa Konsumen (Acta van Dading)');
        setDestination('Sekretariat Pusat LPKSM Senyap Nusantara Jaya');
        setTaskDescription(
          `Para Pihak dengan sukarela dan tanpa paksaan dari pihak mana pun menyepakati butir-butir penyelesaian damai sengketa konsumen ini. Pelaku Usaha menyatakan bersedia memenuhi kewajiban ganti rugi/penggantian produk, Konsumen menyatakan menerima dan mencabut laporan aduan, serta Para Pihak melepaskan hak saling menuntut baik perdata maupun pidana di kemudian hari (Acquit et de charge). Kesepakatan ini bersifat final dan mengikat sebagaimana diatur dalam Pasal 1338 jo. Pasal 1851 KUHPerdata.`
        );
        break;
    }

    setAutoPopulateToast(`Data ${memberName} berhasil diisikan otomatis ke template!`);
    setTimeout(() => {
      setAutoPopulateToast(null);
    }, 3500);
  };

  // Pre-populated Archive List
  const [issuedDocs, setIssuedDocs] = useState<IssuedDocument[]>([
    {
      id: 'DOC-1001',
      docNumber: 'No: 042/SPT/LPKSM-TSN/8/2026',
      docType: 'surat_tugas',
      title: 'Surat Perintah Tugas Pendampingan Konsumen',
      recipient: 'Masyarakat Balung Jember',
      memberName: 'Ibrahim',
      memberId: 'TSN-00101',
      issueDate: '2026-08-01',
      status: 'Diterbitkan',
      details: {},
    },
    {
      id: 'DOC-1002',
      docNumber: 'No: 015/SK/LPKSM-TSN/8/2026',
      docType: 'surat_keterangan',
      title: 'Surat Keterangan Keanggotaan Aktif',
      recipient: 'Siti Aminah',
      memberName: 'Siti Aminah',
      memberId: 'TSN-00102',
      issueDate: '2026-08-03',
      status: 'Diterbitkan',
      details: {},
    },
  ]);

  // PDF Export state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen) return null;

  const currentMember = members.find((m) => m.id === selectedMemberId) || members[0];

  const handlePrint = () => {
    window.print();
  };

  const handlePrintAll = () => {
    setDocViewMode('batch');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      if (docViewMode === 'single') {
        const el = document.getElementById(`official-doc-canvas-${selectedDocType}`);
        if (el) {
          const docTitleClean = getDocTitle(selectedDocType).replace(/[^a-zA-Z0-9]/g, '_');
          const memberNameClean = (currentMember?.name || 'TSN').replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `${docTitleClean}_${memberNameClean}.pdf`;
          const success = await downloadElementAsPDF(
            el,
            fileName,
            'portrait'
          );
          if (success) {
            setAutoPopulateToast(`Berkas PDF resmi '${fileName}' berhasil diunduh dengan kop surat profesional!`);
            setTimeout(() => setAutoPopulateToast(null), 4000);
          }
        }
      } else {
        const elements = selectedBatchTypes
          .map((t) => document.getElementById(`official-doc-canvas-${t}`))
          .filter(Boolean) as HTMLElement[];

        if (elements.length > 0) {
          const memberNameClean = (currentMember?.name || 'TSN').replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `Kumpulan_Dokumen_Resmi_LPKSM_${memberNameClean}.pdf`;
          const success = await downloadBatchElementsAsPDF(
            elements,
            fileName
          );
          if (success) {
            setAutoPopulateToast(`Berkas PDF seluruh dokumen resmi (${elements.length} berkas) berhasil diunduh!`);
            setTimeout(() => setAutoPopulateToast(null), 4000);
          }
        }
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Gagal membuat berkas PDF. Silakan gunakan tombol Cetak / Save PDF browser.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const toggleBatchType = (type: DocumentType) => {
    if (selectedBatchTypes.includes(type)) {
      if (selectedBatchTypes.length === 1) {
        alert('Minimal 1 jenis dokumen harus dipilih untuk antrean cetak.');
        return;
      }
      setSelectedBatchTypes(selectedBatchTypes.filter((t) => t !== type));
    } else {
      setSelectedBatchTypes([...selectedBatchTypes, type]);
    }
  };

  const handleSaveToArchive = () => {
    if (docViewMode === 'batch') {
      const newDocs: IssuedDocument[] = selectedBatchTypes.map((type, idx) => ({
        id: `DOC-${Date.now().toString().slice(-4)}-${idx}`,
        docNumber: getRefNoForType(type),
        docType: type,
        title: getDocTitle(type),
        recipient: recipientName || destination,
        memberName: currentMember?.name || 'Anggota TSN',
        memberId: currentMember?.id || 'TSN-000',
        issueDate,
        status: 'Diterbitkan',
        details: { taskDescription, caseSubject },
      }));

      setIssuedDocs([...newDocs, ...issuedDocs]);
      alert(`Berhasil menyimpan ${newDocs.length} dokumen legal ke Arsip Persuratan!`);
    } else {
      const newDoc: IssuedDocument = {
        id: `DOC-${Date.now().toString().slice(-4)}`,
        docNumber,
        docType: selectedDocType,
        title: getDocTitle(selectedDocType),
        recipient: recipientName || destination,
        memberName: currentMember?.name || 'Anggota TSN',
        memberId: currentMember?.id || 'TSN-000',
        issueDate,
        status: 'Diterbitkan',
        details: { taskDescription, caseSubject },
      };

      setIssuedDocs([newDoc, ...issuedDocs]);
      alert('Dokumen resmi berhasil disimpan ke Arsip Persuratan Organisasi!');
    }
    setActiveTab('archive');
  };

  const getDocTitle = (type: DocumentType) => {
    switch (type) {
      case 'surat_tugas':
        return 'SURAT PERINTAH TUGAS (SPT) ADVOKASI & INVESTIGASI';
      case 'surat_pengangkatan':
        return 'SURAT KEPUTUSAN (SK) PENGANGKATAN PENGURUS ORGANISASI';
      case 'surat_kuasa':
        return 'SURAT KUASA KHUSUS PENDAMPINGAN SENGKETA KONSUMEN';
      case 'surat_klarifikasi':
        return 'SURAT SOMASI & PERMOHONAN KLARIFIKASI HAK KONSUMEN';
      case 'surat_mediasi':
        return 'SURAT UNDANGAN MEDIASI TRIPARTIT SENGKETA KONSUMEN';
      case 'surat_bap_mediasi':
        return 'BERITA ACARA MEDIASI & KESEPAKATAN PERDAMAIAN (ACTA VAN DADING)';
      case 'surat_keterangan':
        return 'SURAT KETERANGAN KEANGGOTAAN RESMI (SKK)';
      default:
        return 'DOKUMEN RESMI LPKSM';
    }
  };

  const renderOfficialDocumentCanvas = (docTypeToRender: DocumentType, showPageBreak: boolean = false) => {
    const docRefNum = docViewMode === 'batch' ? getRefNoForType(docTypeToRender) : docNumber;
    const isCorrespondenceLetter = docTypeToRender === 'surat_klarifikasi' || docTypeToRender === 'surat_mediasi';

    return (
      <div
        key={docTypeToRender}
        id={`official-doc-canvas-${docTypeToRender}`}
        className={`w-[210mm] max-w-full min-h-[297mm] bg-white text-stone-900 p-8 sm:p-12 border border-stone-300 shadow-2xl relative ${docFontFamily} ${docFontSize} ${docLineHeight} ${docTextAlign} ${
          isBold ? 'font-bold' : ''
        } ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''} official-document-canvas ${
          showPageBreak ? 'print-page-break mb-8' : ''
        }`}
      >
        {/* KOP SURAT RESMI TATA NASKAH DINAS LPKSM SENYAP NUSANTARA JAYA */}
        <div className="pb-3 flex items-center justify-between gap-4 relative">
          {/* Logo Lembaga Kiri */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            {customKopLogoUrl ? (
              <img src={customKopLogoUrl} alt="Logo Kop" className="w-20 h-20 object-contain" />
            ) : (
              <TSNLogo size="md" showText={false} />
            )}
          </div>

          {/* Isi Kop Surat Tengah */}
          <div className="text-center flex-1 space-y-0.5 px-2">
            <input
              type="text"
              value={customHeaderTitle}
              onChange={(e) => setCustomHeaderTitle(e.target.value)}
              className="w-full text-center text-xs sm:text-sm font-black tracking-wider uppercase text-stone-950 bg-transparent border-none focus:outline-none focus:bg-amber-50/50 rounded leading-tight"
            />
            <input
              type="text"
              value={customHeaderSub}
              onChange={(e) => setCustomHeaderSub(e.target.value)}
              className="w-full text-center text-base sm:text-lg font-black tracking-widest uppercase text-amber-950 font-serif bg-transparent border-none focus:outline-none focus:bg-amber-50/50 rounded leading-tight"
            />
            <div className="text-[10px] font-bold tracking-wider text-amber-900 uppercase font-sans">
              DEWAN PENGURUS PUSAT (DPP) • KABUPATEN JEMBER, PROVINSI JAWA TIMUR
            </div>
            <textarea
              rows={3}
              value={customHeaderAddress}
              onChange={(e) => setCustomHeaderAddress(e.target.value)}
              className="w-full text-center text-[9.5px] font-sans font-medium text-stone-700 leading-tight bg-transparent border-none focus:outline-none focus:bg-amber-50/50 rounded resize-none"
            />
            <input
              type="text"
              value={customHeaderHotline}
              onChange={(e) => setCustomHeaderHotline(e.target.value)}
              className="w-full text-center text-[9px] font-mono text-stone-600 bg-transparent border-none focus:outline-none focus:bg-amber-50/50 rounded"
            />
          </div>

          {/* Lambang Keadilan & Advokasi Kanan */}
          <div className="w-20 h-20 shrink-0 flex flex-col items-center justify-center">
            {customKopLogoUrl ? (
              <img src={customKopLogoUrl} alt="Logo Kop" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-amber-800 bg-amber-50/60 p-1 flex flex-col items-center justify-center text-center shadow-xs">
                <Scale className="w-6 h-6 text-amber-900" />
                <span className="text-[6.5px] font-black uppercase text-amber-950 tracking-tighter leading-none mt-0.5">
                  ADVOKASI & HUKUM
                </span>
                <span className="text-[5.5px] font-bold text-amber-800 tracking-tighter">LPKSM RI</span>
              </div>
            )}
          </div>
        </div>

        {/* GARIS PEMISAH KOP SURAT RESMI (DOUBLE LINE TATA NASKAH DINAS) */}
        <div className="border-t-2 border-stone-950 mt-1 mb-0.5" />
        <div className="border-t border-stone-900 mb-4" />

        {/* HEADER NASKAH DINAS: FORMAT BERDASARKAN JENIS SURAT */}
        {isCorrespondenceLetter ? (
          // FORMAT SURAT DINAS KORESPONDENSI EKSTERNAL (SOMASI & UNDANGAN MEDIASI)
          <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-stone-600 font-semibold">Nomor</span>
                <span className="col-span-9 font-mono font-bold text-stone-950">: {docRefNum}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-stone-600 font-semibold">Sifat</span>
                <span className="col-span-9 font-bold text-stone-900">: PENTING / SEGERA</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-stone-600 font-semibold">Lampiran</span>
                <span className="col-span-9 text-stone-800">: 1 (satu) Berkas Pengaduan Konsumen</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-stone-600 font-semibold">Perihal</span>
                <span className="col-span-9 font-bold text-stone-950">: {caseSubject}</span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <p className="text-stone-800 font-medium">Jember, {formatIndonesianDate(issueDate)}</p>
              <div className="text-left inline-block mt-2 bg-stone-50/80 p-2 border border-stone-200 rounded">
                <p className="font-bold text-stone-900 text-[11px]">Kepada Yth.</p>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="font-black text-stone-950 text-xs uppercase bg-transparent border-none focus:outline-none focus:bg-white rounded w-full"
                  placeholder="Nama Pimpinan / Direksi Pelaku Usaha"
                />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="text-[11px] text-stone-700 bg-transparent border-none focus:outline-none focus:bg-white rounded w-full italic"
                  placeholder="Alamat Kantor / Domisili Usaha"
                />
              </div>
            </div>
          </div>
        ) : (
          // FORMAT SURAT PENETAPAN / TUGAS / KEPUTUSAN / KUASA / BAP / KETERANGAN
          <div className="my-4 text-center space-y-1">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-stone-950 font-serif border-b-2 border-stone-950 inline-block pb-0.5">
              {getDocTitle(docTypeToRender)}
            </h3>
            <p className="text-xs font-mono font-bold text-stone-800 tracking-wider">
              {docRefNum}
            </p>
          </div>
        )}

        {/* DASAR HUKUM & KONSIDERANS RESMI (LEGAL BASIS ACCORDING TO RI LEGISLATION) */}
        <div className="my-3 p-2.5 bg-stone-50 border border-stone-300 border-l-4 border-l-amber-700 rounded text-[10.5px] font-sans text-stone-800 leading-relaxed">
          <span className="font-bold uppercase text-amber-950">Landasan Hukum & Kewenangan Resmi LPKSM: </span>
          <span>
            Pasal 44 & 46 UU RI No. 8 Tahun 1999 tentang Perlindungan Konsumen • PP RI No. 59 Tahun 2001 tentang LPKSM • Permendag RI No. 35 Tahun 2021 tentang TDLPK • UU RI No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) • SK Kemenkumham RI No. AHU-0004521.AH.01.07.Tahun 2024 & AD/ART LPKSM Senyap Nusantara Jaya.
          </span>
        </div>

        {/* DOCUMENT BODY CONTENT ACCORDING TO THE 7 FORMAL TYPES */}
        <div className="space-y-4 my-4 text-xs font-sans text-stone-900 leading-relaxed">
          {/* 1. SURAT PERINTAH TUGAS (SPT) */}
          {docTypeToRender === 'surat_tugas' && (
            <>
              <p>
                Dewan Pengurus Pusat Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) Senyap Nusantara Jaya dengan ini memberikan <strong>SURAT PERINTAH TUGAS (SPT)</strong> kepada Petugas / Advokasi Resmi Organisasi:
              </p>

              <div className="my-2 p-3 bg-stone-50 border border-stone-300 rounded font-sans space-y-1 text-xs">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 font-bold text-stone-700">Nama Lengkap Petugas</span>
                  <span className="col-span-8 font-bold text-stone-950 uppercase">: {currentMember.name}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Nomor Tanda Anggota (NTA)</span>
                  <span className="col-span-8 font-mono font-bold text-stone-900">: {currentMember.id}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">NIK Kependudukan</span>
                  <span className="col-span-8 font-mono text-stone-800">
                    : {currentMember.nik || '3509111201950001'}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Jabatan / Divisi</span>
                  <span className="col-span-8 text-stone-900 font-semibold">
                    : {currentMember.membershipType || currentMember.division}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Wilayah Penugasan</span>
                  <span className="col-span-8 text-stone-900">: {destination}</span>
                </div>
              </div>

              <p className="font-bold text-stone-900 uppercase underline text-[11px] mt-2">
                RINCIAN PERINTAH TUGAS & WEWENANG RESMI:
              </p>
              <div className="p-3 bg-amber-50/40 border border-amber-300/80 rounded font-sans text-xs">
                <textarea
                  rows={4}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none resize-y text-xs text-stone-900 font-sans leading-relaxed"
                  placeholder="Tuliskan butir-butir tugas advokasi di sini..."
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-300/80 rounded text-[11px] text-emerald-950 font-sans">
                <strong>PAKTA INTEGRITAS & ANTI-PUNGLI:</strong> Petugas dilarang keras menerima imbalan tidak sah/suap/pungutan liar dalam bentuk apa pun, wajib menjunjung tinggi etika advokasi, dan wajib menyampaikan laporan tertulis hasil tugas kepada Pengurus Pusat dalam waktu 7 (tujuh) hari kerja.
              </div>
            </>
          )}

          {/* 2. SURAT KEPUTUSAN (SK) PENGANGKATAN PENGURUS */}
          {docTypeToRender === 'surat_pengangkatan' && (
            <>
              <div className="text-center font-bold text-xs uppercase tracking-wider text-stone-800 border-b pb-1">
                TENTANG: PENGANGKATAN PENGURUS DAN PENETAPAN JABATAN STRUKTURAL LPKSM SENYAP NUSANTARA JAYA
              </div>

              <div className="space-y-1.5 text-[11.5px]">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-2 font-bold text-stone-800">Menimbang</span>
                  <div className="col-span-10 space-y-0.5 text-stone-800">
                    <p>a. Bahwa untuk memperkuat kinerja advokasi perlindungan konsumen, dipandang perlu mengangkat pengurus yang memiliki dedikasi, integritas, dan kompetensi tinggi;</p>
                    <p>b. Bahwa yang namanya tercantum dalam keputusan ini dinilai cakap dan memenuhi syarat untuk memangku amanat organisasi.</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-2 font-bold text-stone-800">Mengingat</span>
                  <div className="col-span-10 space-y-0.5 text-stone-700">
                    <p>1. UU RI No. 8 Tahun 1999 tentang Perlindungan Konsumen;</p>
                    <p>2. PP RI No. 59 Tahun 2001 tentang Lembaga Perlindungan Konsumen Swadaya Masyarakat;</p>
                    <p>3. Permendag RI No. 35 Tahun 2021 tentang Sertifikasi & Pengawasan Lembaga Perlindungan Konsumen;</p>
                    <p>4. Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) LPKSM Senyap Nusantara Jaya.</p>
                  </div>
                </div>
              </div>

              <div className="text-center font-black uppercase tracking-widest text-xs text-amber-950 py-1">
                MEMUTUSKAN:
              </div>

              <div className="my-2 p-3 bg-stone-50 border border-stone-300 rounded font-sans space-y-1 text-xs">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 font-bold text-stone-700">Nama Pengurus</span>
                  <span className="col-span-8 font-bold text-stone-950 uppercase">: {currentMember.name}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">ID Anggota / KTA</span>
                  <span className="col-span-8 font-mono font-bold text-stone-900">: {currentMember.id}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">NIK Kependudukan</span>
                  <span className="col-span-8 font-mono text-stone-800">
                    : {currentMember.nik || '3509111201950001'}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Jabatan Ditetapkan</span>
                  <span className="col-span-8 font-bold text-amber-950 uppercase">
                    : {currentMember.membershipType || currentMember.division}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Terhitung Mulai Tanggal</span>
                  <span className="col-span-8 text-stone-900 font-semibold">: {formatIndonesianDate(issueDate)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-300/80 rounded">
                <p className="font-bold text-stone-900 uppercase text-[11px] mb-1">AMANAT TUGAS & TANGGUNG JAWAB:</p>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none resize-y text-xs text-stone-900 font-sans"
                />
              </div>
            </>
          )}

          {/* 3. SURAT KUASA KHUSUS */}
          {docTypeToRender === 'surat_kuasa' && (
            <>
              <p>
                Yang bertanda tangan di bawah ini Konsumen / Pemberi Kuasa:
              </p>

              <div className="my-2 p-2.5 bg-stone-50 border border-stone-300 rounded space-y-1 text-xs">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 font-bold text-stone-700">Nama Pemberi Kuasa</span>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="col-span-8 font-bold text-stone-950 uppercase bg-transparent border-none focus:outline-none focus:bg-white rounded"
                    placeholder="Nama Konsumen Pemberi Kuasa"
                  />
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Alamat / Domisili</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="col-span-8 text-stone-800 bg-transparent border-none focus:outline-none focus:bg-white rounded"
                    placeholder="Alamat Lengkap Konsumen"
                  />
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Perkara Pokok</span>
                  <span className="col-span-8 font-semibold text-stone-900">: {caseSubject}</span>
                </div>
              </div>

              <p>
                Dengan ini memberikan <strong>KUASA KHUSUS</strong> kepada Petugas Advokasi Resmi LPKSM Senyap Nusantara Jaya:
              </p>

              <div className="my-2 p-2.5 bg-stone-50 border border-stone-300 rounded space-y-1 text-xs">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 font-bold text-stone-700">Nama Penerima Kuasa</span>
                  <span className="col-span-8 font-bold text-stone-950 uppercase">
                    : {currentMember.name} (NTA: {currentMember.id})
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Jabatan Organisasi</span>
                  <span className="col-span-8 text-stone-800">: {currentMember.membershipType || currentMember.division}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Dasar Hukum Kuasa</span>
                  <span className="col-span-8 text-stone-800">: Pasal 1792 s.d. 1819 KUHPerdata jo. Pasal 44 & 46 UU No. 8/1999</span>
                </div>
              </div>

              <p className="font-bold text-stone-900 uppercase underline text-[11px] mt-2">
                CAKUPAN WEWENANG KHUSUS KHIDMAT ADVOKASI:
              </p>
              <div className="p-3 bg-amber-50/40 border border-amber-300/80 rounded">
                <textarea
                  rows={4}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none resize-y text-xs text-stone-900 font-sans leading-relaxed"
                />
              </div>

              <p className="text-[11px] text-stone-700 italic">
                Kuasa ini diberikan dengan Hak Substitusi (pelimpahan sebagian/seluruh kuasa) serta Hak Retensi sebagaimana diatur dalam ketentuan hukum Republik Indonesia yang berlaku.
              </p>
            </>
          )}

          {/* 4. SURAT SOMASI & PERMOHONAN KLARIFIKASI RESMI */}
          {docTypeToRender === 'surat_klarifikasi' && (
            <>
              <p>
                Dengan hormat,
              </p>
              <p>
                Sehubungan dengan adanya Laporan Pengaduan Konsumen yang teregistrasi secara sah pada Posko Advokasi dan Pengaduan LPKSM Senyap Nusantara Jaya tertanggal <strong>{formatIndonesianDate(issueDate)}</strong>, dengan didampingi Petugas Advokasi (<strong>{currentMember.name}</strong> - NTA: <strong>{currentMember.id}</strong>), bersama ini kami menyampaikan hal-hal sebagai berikut:
              </p>

              <div className="my-2 p-3 bg-amber-50/40 border border-amber-300/80 rounded">
                <p className="font-bold text-stone-900 uppercase text-[11px] mb-1">POKOK DUGAAN PELANGGARAN HAK KONSUMEN & URAIAN FAKTA:</p>
                <textarea
                  rows={4}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none resize-y text-xs text-stone-900 font-sans leading-relaxed"
                />
              </div>

              <div className="space-y-1 text-[11.5px]">
                <p>Berdasarkan ketentuan hukum yang berlaku:</p>
                <ul className="list-disc pl-5 space-y-0.5 text-stone-800">
                  <li><strong>Pasal 4 UU RI No. 8/1999:</strong> Hak konsumen atas informasi yang benar, jelas, dan jujur, serta hak mendapatkan advokasi, perlindungan, dan ganti rugi;</li>
                  <li><strong>Pasal 7 & Pasal 18 UU RI No. 8/1999:</strong> Kewajiban beriktikad baik serta larangan pencantuman Klausula Baku yang merugikan/mengalihkan tanggung jawab sepihak;</li>
                  <li><strong>Pasal 19 UU RI No. 8/1999:</strong> Kewajiban Pelaku Usaha memberikan ganti rugi atas kerusakan, pencemaran, dan/atau kerugian konsumen;</li>
                  <li><strong>Pasal 62 UU RI No. 8/1999:</strong> Sanksi pidana penjara paling lama 5 (lima) tahun atau denda paling banyak Rp 2.000.000.000,- (dua miliar rupiah) atas pelanggaran ketentuan undang-undang perlindungan konsumen.</li>
                </ul>
              </div>

              <div className="p-2.5 bg-red-50 border border-red-300 rounded text-red-950 font-medium text-[11px]">
                <strong>PERINGATAN HUKUM & TENGGAT WAKTU:</strong> Kami memberikan tenggat waktu <strong>7 (tujuh) hari kalender</strong> terhitung sejak surat ini diterima agar pihak Saudara menyampaikan klarifikasi tertulis dan iktikad baik penyelesaian ganti rugi. Apabila tenggat waktu diabaikan, kami akan menempuh langkah hukum lanjutan ke BPSK (Badan Penyelesaian Sengketa Konsumen), Kementerian Perdagangan RI, atau Aparat Penegak Hukum.
              </div>
            </>
          )}

          {/* 5. SURAT UNDANGAN MEDIASI TRIPARTIT */}
          {docTypeToRender === 'surat_mediasi' && (
            <>
              <p>
                Dengan hormat,
              </p>
              <p>
                Dalam rangka mewujudkan penyelesaian sengketa konsumen secara musyawarah mufakat, berkeadilan, dan bermartabat tanpa perlu melalui proses peradilan yang panjang, LPKSM Senyap Nusantara Jaya memfasilitasi <strong>Forum Sidang Musyawarah Mediasi Tripartit</strong> non-litigasi.
              </p>

              <div className="my-2 p-3 bg-stone-50 border border-stone-300 rounded font-sans space-y-1.5 text-xs">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 font-bold text-stone-700">Pokok Perkara</span>
                  <span className="col-span-8 font-bold text-stone-950">: {caseSubject}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Mediator Pendamping</span>
                  <span className="col-span-8 font-bold text-amber-900">: {currentMember.name} (NTA: {currentMember.id})</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Hari / Tanggal Sidang</span>
                  <span className="col-span-8 text-stone-900 font-semibold">: {formatIndonesianDate(issueDate)} (Pukul 10.00 WIB s.d. Selesai)</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Tempat Pelaksanaan</span>
                  <span className="col-span-8 text-stone-900">: Ruang Mediasi Sekretariat Pusat LPKSM Senyap Nusantara Jaya ({destination})</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-300/80 rounded">
                <p className="font-bold text-stone-900 uppercase text-[11px] mb-1">AGENDA & PANDUAN MUSYAWARAH:</p>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none resize-y text-xs text-stone-900 font-sans leading-relaxed"
                />
              </div>

              <p className="text-[11.5px]">
                Mengingat pentingnya kepastian hukum bagi kedua belah pihak, dimohon kehadiran principal atau perwakilan resmi yang memiliki wewenang penuh mengambil keputusan penyelesaian perkara.
              </p>
            </>
          )}

          {/* 6. BERITA ACARA MEDIASI & KESEPAKATAN PERDAMAIAN (ACTA VAN DADING) */}
          {docTypeToRender === 'surat_bap_mediasi' && (
            <>
              <p className="text-[11.5px]">
                Pada hari ini, tanggal <strong>{formatIndonesianDate(issueDate)}</strong>, bertempat di Kantor Sekretariat LPKSM Senyap Nusantara Jaya ({destination}), telah diadakan musyawarah mediasi tripartit sengketa perlindungan konsumen antara:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-1 text-xs">
                <div className="p-2.5 bg-stone-50 border border-stone-300 rounded space-y-1">
                  <div className="font-bold text-stone-900 uppercase text-[10.5px] border-b pb-0.5">PIHAK I (KONSUMEN PENGADU)</div>
                  <div className="text-stone-800">Nama: <strong>{caseSubject.split('vs')[0]?.trim() || 'Konsumen Pengadu'}</strong></div>
                  <div className="text-[10px] text-stone-600">Kedudukan: Konsumen Pengguna Barang / Jasa</div>
                </div>
                <div className="p-2.5 bg-stone-50 border border-stone-300 rounded space-y-1">
                  <div className="font-bold text-stone-900 uppercase text-[10.5px] border-b pb-0.5">PIHAK II (PELAKU USAHA TERADU)</div>
                  <div className="text-stone-800">Nama/Entitas: <strong>{recipientName || 'Pimpinan Pelaku Usaha'}</strong></div>
                  <div className="text-[10px] text-stone-600">Kedudukan: Penyedia Barang / Pelaku Usaha</div>
                </div>
              </div>

              <p className="text-[11.5px]">
                Dengan difasilitasi oleh Mediator Resmi LPKSM Senyap Nusantara Jaya (<strong>{currentMember.name}</strong>, NTA: {currentMember.id}), Para Pihak dengan itikad baik dan tanpa tekanan telah mencapai kesepakatan perdamaian secara musyawarah mufakat:
              </p>

              <div className="p-3 bg-amber-50/40 border border-amber-300/80 rounded space-y-2 text-xs">
                <div className="font-bold text-stone-900 uppercase text-[11px]">KLAUSUL-KLAUSUL KESEPAKATAN PERDAMAIAN DAMAI (ACTA VAN DADING):</div>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none resize-y text-xs text-stone-900 font-sans"
                  placeholder="Tuliskan butir-butir kesepakatan ganti rugi atau penyelesaian damai di sini..."
                />
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-stone-800 font-sans">
                  <li>Pihak II bersedia melaksanakan pemenuhan kewajiban kompensasi/penggantian produk selambat-lambatnya 7 (tujuh) hari kerja sejak naskah ini ditandatangani;</li>
                  <li>Pihak I menyatakan menerima pemenuhan tersebut dan secara sukarela mencabut seluruh berkas laporan pengaduan;</li>
                  <li>Para Pihak menyatakan sengketa telah selesai secara kekeluargaan (final and binding) serta melepaskan hak saling menuntut secara perdata maupun pidana di kemudian hari (Acquit et de charge).</li>
                </ol>
              </div>

              <p className="text-[10.5px] italic text-stone-600">
                Berita Acara ini dibuat rangkap 3 (tiga) bermaterai cukup dan memiliki kekuatan hukum yang mengikat Para Pihak sebagaimana dimaksud dalam Pasal 1338 jo. Pasal 1851 KUHPerdata serta PP RI No. 59 Tahun 2001.
              </p>
            </>
          )}

          {/* 7. SURAT KETERANGAN KEANGGOTAAN RESMI (SKK) */}
          {docTypeToRender === 'surat_keterangan' && (
            <>
              <p>
                Dewan Pengurus Pusat Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) Senyap Nusantara Jaya menerangkan dengan sebenarnya bahwa:
              </p>

              <div className="my-2 p-3 bg-stone-50 border border-stone-300 rounded font-sans space-y-1.5 text-xs">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 font-bold text-stone-700">Nama Lengkap</span>
                  <span className="col-span-8 font-bold text-stone-950 uppercase">: {currentMember.name}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Nomor Tanda Anggota (NTA)</span>
                  <span className="col-span-8 font-mono font-bold text-stone-900">: {currentMember.id}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">NIK Kependudukan</span>
                  <span className="col-span-8 font-mono text-stone-800">
                    : {currentMember.nik || '3509111201950001'}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Jabatan / Divisi</span>
                  <span className="col-span-8 text-stone-900 font-semibold">
                    : {currentMember.membershipType || currentMember.division}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-stone-600">Status Keanggotaan</span>
                  <span className="col-span-8 font-bold text-emerald-800 uppercase">: AKTIF & TERDAFTAR SECARA SAH</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-300/80 rounded">
                <p className="font-bold text-stone-900 uppercase text-[11px] mb-1">KETERANGAN WEWENANG ADVOKASI:</p>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none resize-y text-xs text-stone-900 font-sans leading-relaxed"
                />
              </div>

              <p className="text-[11.5px]">
                Adalah benar-benar Anggota Aktif LPKSM Senyap Nusantara Jaya yang senantiasa patuh pada Kode Etik Advokasi, AD/ART Organisasi, serta perundang-undangan perlindungan konsumen yang sah di Negara Kesatuan Republik Indonesia.
              </p>
            </>
          )}

          {/* CUSTOM CLAUSES (PASAL / POIN TAMBAHAN) */}
          {customClauses.map((clause) => (
            <div
              key={clause.id}
              className="my-3 p-3 bg-amber-50/20 border border-amber-300/60 rounded relative group font-sans text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <input
                  type="text"
                  value={clause.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setCustomClauses(
                      customClauses.map((c) => (c.id === clause.id ? { ...c, title: newTitle } : c))
                    );
                  }}
                  className="font-bold text-stone-950 uppercase bg-transparent border-none focus:outline-none focus:bg-white/80 rounded px-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveClause(clause.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded print:hidden transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                  title="Hapus Klausul"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={clause.content}
                onChange={(e) => {
                  const newContent = e.target.value;
                  setCustomClauses(
                    customClauses.map((c) => (c.id === clause.id ? { ...c, content: newContent } : c))
                  );
                }}
                className="w-full bg-transparent border-none focus:outline-none text-stone-900 text-xs resize-y rounded p-1 font-sans leading-relaxed"
              />
            </div>
          ))}

          {/* ATTACHMENTS SECTION (LAMPIRAN FOTO / BUKTI) */}
          {attachments.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-300 space-y-3 font-sans">
              <h4 className="font-bold uppercase text-xs text-stone-900 tracking-wider">
                LAMPIRAN FOTO / BUKTI PENDUKUNG RESMI:
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2 border border-stone-300 rounded bg-stone-50 space-y-1 relative group"
                  >
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-full h-32 object-cover rounded border border-stone-200"
                    />
                    <input
                      type="text"
                      value={att.caption}
                      onChange={(e) => {
                        const newCap = e.target.value;
                        setAttachments(
                          attachments.map((a) => (a.id === att.id ? { ...a, caption: newCap } : a))
                        );
                      }}
                      className="w-full text-[10px] font-medium text-stone-700 bg-transparent border-none focus:outline-none text-center italic"
                    />
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                      className="absolute top-3 right-3 p-1 bg-red-600 text-white rounded-full shadow print:hidden hover:bg-red-700 transition-all cursor-pointer"
                      title="Hapus Lampiran"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="pt-2 text-[11.5px]">
            Demikian Surat Resmi ini diterbitkan secara sah oleh LPKSM Senyap Nusantara Jaya untuk dipergunakan sebagaimana mestinya. Seluruh instansi pemerintah, BPSK, aparat penegak hukum, dan pihak terkait dimohon memberikan bantuan serta aksesibilitas yang diperlukan.
          </p>
        </div>

        {/* SIGNATURE & OFFICIAL STAMP BLOCK (TAILORED ACCORDING TO DOCUMENT TYPE) */}
        <div className="pt-6 mt-6 border-t border-stone-300 print-avoid-break">
          {docTypeToRender === 'surat_kuasa' ? (
            // SIGNATURE BLOCK FOR SURAT KUASA KHUSUS (WITH MATERAI 10.000)
            <div className="space-y-6">
              <div className="flex justify-between items-end gap-2">
                {/* Pemberi Kuasa (dengan Materai) */}
                <div className="text-center space-y-2">
                  <div className="text-xs text-stone-700 font-sans">Pemberi Kuasa (Konsumen),</div>
                  <div className="w-28 h-16 border border-dashed border-stone-400 bg-stone-50 flex items-center justify-center mx-auto text-[9px] text-stone-500 font-mono">
                    MATERAI
                    <br />
                    Rp 10.000
                  </div>
                  <div className="font-bold underline uppercase text-xs text-stone-950 font-sans mt-2">
                    {recipientName || 'Konsumen Pengadu'}
                  </div>
                </div>

                {/* Stempel Tengah */}
                {includeStamp && (
                  <div className="text-center">
                    {customStampImg ? (
                      <img src={customStampImg} alt="Stempel Resmi" className="w-24 h-24 object-contain rotate-[-10deg] mx-auto" />
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-amber-800/80 rounded-full flex flex-col items-center justify-center p-1 text-amber-950 text-[7.5px] font-black mx-auto leading-tight bg-amber-50/50 rotate-[-10deg] shadow-xs">
                        <Scale className="w-5 h-5 text-amber-900 mb-0.5" />
                        <span>DEWAN PENGURUS PUSAT</span>
                        <span className="text-[8.5px] font-black text-amber-900">LPKSM TSN JEMBER</span>
                        <span className="text-[6.5px]">SK KEMENKUMHAM RI</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Penerima Kuasa */}
                <div className="text-center space-y-2">
                  <div className="text-xs text-stone-700 font-sans">Penerima Kuasa (Petugas LPKSM),</div>
                  <div className="relative inline-block min-w-[140px] h-16 flex items-center justify-center">
                    {includeSignature && (customSignatureImg || currentMember.signatureUrl) ? (
                      <img
                        src={customSignatureImg || currentMember.signatureUrl}
                        alt="Tanda Tangan"
                        className="h-14 mx-auto object-contain"
                      />
                    ) : (
                      <div className="h-14" />
                    )}
                  </div>
                  <div className="font-bold underline uppercase text-xs text-stone-950 font-sans">
                    {currentMember.name}
                  </div>
                  <div className="text-[10px] text-stone-600 font-mono">NTA: {currentMember.id}</div>
                </div>
              </div>

              {/* Mengetahui Pengurus Pusat */}
              <div className="text-center pt-2 border-t border-dashed border-stone-200">
                <div className="text-xs text-stone-700 font-sans">
                  Mengetahui,
                  <br />
                  <strong>DEWAN PENGURUS PUSAT LPKSM SENYAP NUSANTARA JAYA</strong>
                </div>
                <div className="mt-8 font-bold underline uppercase text-xs text-stone-950 font-sans">
                  {getSignerDetails().name}
                </div>
                <div className="text-[10px] text-stone-600 font-sans">
                  {getSignerDetails().title}
                </div>
              </div>
            </div>
          ) : docTypeToRender === 'surat_bap_mediasi' ? (
            // SIGNATURE BLOCK FOR BAP MEDIASI (PIHAK I, PIHAK II, & MEDIATOR)
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center items-end">
                <div className="space-y-10">
                  <div className="text-xs text-stone-700 font-sans">Pihak I (Konsumen),</div>
                  <div>
                    <div className="font-bold underline uppercase text-xs text-stone-950 font-sans">
                      {caseSubject.split('vs')[0]?.trim() || 'Konsumen Pengadu'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-sans">Pihak Pengadu</div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="text-xs text-stone-700 font-sans">Pihak II (Pelaku Usaha),</div>
                  <div>
                    <div className="font-bold underline uppercase text-xs text-stone-950 font-sans">
                      {recipientName || 'Pimpinan Pelaku Usaha'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-sans">Pihak Teradu</div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="text-xs text-stone-700 font-sans">Mediator Resmi LPKSM,</div>
                  <div>
                    {includeSignature && (customSignatureImg || currentMember.signatureUrl) ? (
                      <img
                        src={customSignatureImg || currentMember.signatureUrl}
                        alt="Tanda Tangan"
                        className="h-10 mx-auto object-contain -mt-8 mb-2"
                      />
                    ) : null}
                    <div className="font-bold underline uppercase text-xs text-stone-950 font-sans">
                      {currentMember.name}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">NTA: {currentMember.id}</div>
                  </div>
                </div>
              </div>

              {/* Mengetahui Pengurus Pusat */}
              <div className="text-center pt-2 border-t border-dashed border-stone-200">
                <div className="text-xs text-stone-700 font-sans">
                  Mengetahui dan Mengesahkan,
                  <br />
                  <strong>KETUA UMUM LPKSM SENYAP NUSANTARA JAYA</strong>
                </div>
                {includeStamp && (
                  <div className="my-1">
                    <div className="w-20 h-20 border border-dashed border-amber-800 rounded-full flex flex-col items-center justify-center p-1 text-amber-950 text-[7px] font-black mx-auto leading-tight bg-amber-50/40 rotate-[-10deg]">
                      <Scale className="w-4 h-4 text-amber-900 mb-0.5" />
                      <span>STEMPEL RESMI</span>
                      <span>LPKSM TSN</span>
                    </div>
                  </div>
                )}
                <div className="font-bold underline uppercase text-xs text-stone-950 font-sans mt-1">
                  HERI PRABOWO, S.H.
                </div>
                <div className="text-[10px] text-stone-600 font-sans">Ketua Umum / Advokat LPKSM</div>
              </div>
            </div>
          ) : (
            // STANDARD OFFICIAL INDONESIAN ADMINISTRATIVE SIGNATURE BLOCK
            <div className="flex justify-between items-end gap-2">
              {/* Petugas / Penerima Mandat */}
              <div className="text-center space-y-8">
                <div className="text-xs text-stone-700 font-sans">
                  {docTypeToRender === 'surat_klarifikasi' || docTypeToRender === 'surat_mediasi'
                    ? 'Petugas Advokasi Pendamping,'
                    : 'Yang Menerima Mandat / Petugas,'}
                </div>
                <div className="relative inline-block min-w-[140px]">
                  {includeSignature && (customSignatureImg || currentMember.signatureUrl) ? (
                    <img
                      src={customSignatureImg || currentMember.signatureUrl}
                      alt="Tanda Tangan"
                      className="h-12 mx-auto object-contain"
                    />
                  ) : (
                    <div className="h-12" />
                  )}
                  <div className="font-bold underline uppercase text-xs text-stone-950 font-sans">
                    {currentMember.name}
                  </div>
                  <div className="text-[10px] text-stone-600 font-mono">NTA: {currentMember.id}</div>
                </div>
              </div>

              {/* Center Official Stamp */}
              {includeStamp && (
                <div className="text-center">
                  {customStampImg ? (
                    <img src={customStampImg} alt="Stempel Resmi" className="w-24 h-24 object-contain rotate-[-10deg] mx-auto" />
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-amber-800/90 rounded-full flex flex-col items-center justify-center p-1 text-amber-950 text-[7.5px] font-black mx-auto leading-tight bg-amber-50/50 rotate-[-10deg] shadow-xs">
                      <Scale className="w-5 h-5 text-amber-900 mb-0.5" />
                      <span>DEWAN PENGURUS PUSAT</span>
                      <span className="text-[8.5px] font-black text-amber-900">LPKSM TSN JEMBER</span>
                      <span className="text-[6.5px]">SK KEMENKUMHAM RI</span>
                    </div>
                  )}
                </div>
              )}

              {/* Pejabat Pengurus Pusat */}
              <div className="text-center space-y-8">
                <div className="text-xs text-stone-700 font-sans">
                  Jember, {formatIndonesianDate(issueDate)}
                  <br />
                  <strong>DEWAN PENGURUS PUSAT LPKSM SENYAP</strong>
                </div>
                <div>
                  <div className="font-bold underline uppercase text-xs text-stone-950 font-sans">
                    {getSignerDetails().name}
                  </div>
                  <div className="text-[10px] text-stone-600 font-sans">
                    {getSignerDetails().title}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOKUMEN KEABSAHAN RESMI DENGAN SERIAL HASH & QR VALIDATION */}
          <div className="mt-6 pt-3 border-t border-dashed border-stone-300 flex flex-wrap items-center justify-between gap-2 text-[9px] text-stone-500 font-mono">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-stone-100 border border-stone-300 rounded">
                <QrCode className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <p className="font-bold text-stone-800">VALIDASI ELEKTRONIK LPKSM RI</p>
                <p>KODE KEABSAHAN: TSN-SEC-{docRefNum.replace(/[^a-zA-Z0-9]/g, '')}</p>
              </div>
            </div>
            <div className="text-right">
              <p>Dokumen resmi tercatat pada Sistem Registrasi Persuratan LPKSM Senyap Nusantara Jaya.</p>
              <p>Verifikasi daring: teamsenyapnusantara.org/validasi</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-amber-500/40 rounded-2xl text-stone-100 shadow-2xl overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:p-0 my-auto">
        
        {/* Header Bar - Hidden on Print */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/80 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 shrink-0">
              <FileText className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Modul Persuratan & Dokumentasi Terintegrasi</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-200">
                Penerbitan Surat Menyurat Resmi LPKSM Senyap Nusantara Jaya
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0 disabled:opacity-50"
              title="Unduh langsung sebagai berkas PDF resmi"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPDF ? 'Memproses PDF...' : 'Unduh PDF'}</span>
            </button>
            <button
              onClick={handlePrintAll}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-500/50 rounded-xl hover:bg-amber-900 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
              title="Cetak Seluruh Dokumen Legal Sekaligus (Print All Queue)"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Print All ({selectedBatchTypes.length})</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-100 bg-stone-900 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak (Printer)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-950 border border-stone-800 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Container */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Top Control Tabs - Hidden on Print */}
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Buat Surat Baru</span>
              </button>
              <button
                onClick={() => setActiveTab('archive')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'archive'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Arsip Surat Keluar ({issuedDocs.length})</span>
              </button>
            </div>

            {activeTab === 'create' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
                  <button
                    onClick={() => setDocViewMode('single')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      docViewMode === 'single'
                        ? 'bg-amber-500 text-stone-950 shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Dokumen Tunggal</span>
                  </button>
                  <button
                    onClick={() => setDocViewMode('batch')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      docViewMode === 'batch'
                        ? 'bg-amber-500 text-stone-950 shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Antrean Print All ({selectedBatchTypes.length})</span>
                  </button>
                </div>

                <button
                  onClick={handleSaveToArchive}
                  className="px-4 py-2 text-xs font-bold text-amber-300 bg-stone-950 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>Simpan Ke Arsip Persuratan</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: CREATE & PRINT LIVE SURAT */}
          {activeTab === 'create' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block print:w-full print:p-0 print:m-0">
              
              {/* Left Column: Form Controls (Hidden on Print) */}
              <div className="lg:col-span-4 space-y-4 print:hidden bg-stone-950 p-4 rounded-xl border border-stone-800 h-fit">
                <div className="text-xs font-bold font-serif text-amber-300 uppercase tracking-wider border-b border-stone-800 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Parameter & Pengaturan Surat</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {docViewMode === 'batch' ? 'BATCH QUEUE' : 'SINGLE MODE'}
                  </span>
                </div>

                {/* Member Assignee Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-stone-300 uppercase flex items-center justify-between">
                    <span>Pilih Anggota & Auto-Populate</span>
                    <span className="text-[10px] text-amber-400 font-mono">Auto-Sync</span>
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => {
                      const mId = e.target.value;
                      setSelectedMemberId(mId);
                      const targetM = members.find((m) => m.id === mId);
                      if (targetM) {
                        applyMemberTemplateData(targetM, selectedDocType);
                      }
                    }}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400 font-medium"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id} - {m.division})
                      </option>
                    ))}
                  </select>

                  {/* Auto-Populated Member Details Card */}
                  {currentMember && (
                    <div className="p-3 bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 rounded-xl space-y-2 text-xs relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentMember.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={currentMember.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/80 shadow shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-amber-200 truncate uppercase text-xs">
                              {currentMember.name}
                            </h4>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold shrink-0">
                              {currentMember.status || 'Aktif'}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 font-mono">
                            ID: <strong className="text-amber-300">{currentMember.id}</strong> • NIK: {currentMember.nik || '3509111201950001'}
                          </p>
                          <p className="text-[10px] text-stone-300 font-medium truncate">
                            {currentMember.division} ({currentMember.membershipType || 'Anggota'})
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => applyMemberTemplateData(currentMember, selectedDocType)}
                        className="w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Isi Ulang Data {currentMember.name.split(' ')[0]} ke Template</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Template Preset Buttons */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      Template Cepat
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocType('surat_keterangan');
                          setDocViewMode('single');
                          applyMemberTemplateData(currentMember, 'surat_keterangan');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold border text-left transition-all flex items-center gap-1 cursor-pointer ${
                          selectedDocType === 'surat_keterangan' && docViewMode === 'single'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <FileCheck className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">1. SK Keanggotaan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocType('surat_pengangkatan');
                          setDocViewMode('single');
                          applyMemberTemplateData(currentMember, 'surat_pengangkatan');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold border text-left transition-all flex items-center gap-1 cursor-pointer ${
                          selectedDocType === 'surat_pengangkatan' && docViewMode === 'single'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">2. SK Pengangkatan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocType('surat_tugas');
                          setDocViewMode('single');
                          applyMemberTemplateData(currentMember, 'surat_tugas');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold border text-left transition-all flex items-center gap-1 cursor-pointer ${
                          selectedDocType === 'surat_tugas' && docViewMode === 'single'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <FileText className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">3. Surat Tugas (SPT)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocType('surat_kuasa');
                          setDocViewMode('single');
                          applyMemberTemplateData(currentMember, 'surat_kuasa');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold border text-left transition-all flex items-center gap-1 cursor-pointer ${
                          selectedDocType === 'surat_kuasa' && docViewMode === 'single'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Scale className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">4. Surat Kuasa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocType('surat_klarifikasi');
                          setDocViewMode('single');
                          applyMemberTemplateData(currentMember, 'surat_klarifikasi');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold border text-left transition-all flex items-center gap-1 cursor-pointer ${
                          selectedDocType === 'surat_klarifikasi' && docViewMode === 'single'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">5. Somasi & Klarifikasi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocType('surat_mediasi');
                          setDocViewMode('single');
                          applyMemberTemplateData(currentMember, 'surat_mediasi');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold border text-left transition-all flex items-center gap-1 cursor-pointer ${
                          selectedDocType === 'surat_mediasi' && docViewMode === 'single'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Users className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">6. Undangan Mediasi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocType('surat_bap_mediasi');
                          setDocViewMode('single');
                          applyMemberTemplateData(currentMember, 'surat_bap_mediasi');
                        }}
                        className={`col-span-2 p-1.5 rounded-lg text-[10px] font-bold border text-left transition-all flex items-center gap-1 cursor-pointer ${
                          selectedDocType === 'surat_bap_mediasi' && docViewMode === 'single'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <FileCheck className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">7. Berita Acara Mediasi (Acta van Dading)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auto Populate Toast Notification */}
                {autoPopulateToast && (
                  <div className="p-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{autoPopulateToast}</span>
                  </div>
                )}

                {/* If Single Mode: Document Type Selector */}
                {docViewMode === 'single' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-300 uppercase">
                      Jenis Dokumen / Surat
                    </label>
                    <select
                      value={selectedDocType}
                      onChange={(e) => {
                        const type = e.target.value as DocumentType;
                        setSelectedDocType(type);
                        applyMemberTemplateData(currentMember, type);
                      }}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-amber-100 font-semibold focus:outline-none focus:border-amber-400"
                    >
                      <option value="surat_tugas">1. Surat Perintah Tugas Advokasi & Investigasi (SPT)</option>
                      <option value="surat_pengangkatan">2. Surat Keputusan Pengangkatan Pengurus (SK Organisasi)</option>
                      <option value="surat_kuasa">3. Surat Kuasa Khusus Pendampingan Sengketa Konsumen</option>
                      <option value="surat_klarifikasi">4. Surat Somasi & Permohonan Klarifikasi Hak Konsumen</option>
                      <option value="surat_mediasi">5. Surat Undangan Mediasi Tripartit Sengketa Konsumen</option>
                      <option value="surat_bap_mediasi">6. Berita Acara Mediasi & Kesepakatan Perdamaian (Acta van Dading)</option>
                      <option value="surat_keterangan">7. Surat Keterangan Keanggotaan Resmi (SKK)</option>
                    </select>
                  </div>
                ) : (
                  /* Batch Queue Checklist Selector */
                  <div className="space-y-2 bg-stone-900/80 p-3 rounded-lg border border-amber-500/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300 uppercase flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        Pilih Antrean Cetak Batch:
                      </span>
                      <button
                        onClick={() => setSelectedBatchTypes(ALL_DOC_TYPES)}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        Pilih Semua
                      </button>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {ALL_DOC_TYPES.map((type) => {
                        const isChecked = selectedBatchTypes.includes(type);
                        return (
                          <div
                            key={type}
                            onClick={() => toggleBatchType(type)}
                            className={`p-2 rounded-md border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                                : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-stone-600 shrink-0" />
                              )}
                              <span className="font-medium text-[11px]">{getDocTitle(type)}</span>
                            </div>
                            <span className="font-mono text-[9px] text-stone-400">
                              {getRefNoForType(type).split('/')[1]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Doc Reference Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-300 uppercase">
                    Nomor Surat Resmi Utama
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Recipient / Destination */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-300 uppercase">
                    Tujuan / Penerima / Lokasi Tugas
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="misal: Wilayah Kab. Jember"
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Task Details / Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-300 uppercase">
                    Rincian Perintah / Poin Utama
                  </label>
                  <textarea
                    rows={3}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Signer Selection Control */}
                <div className="space-y-1 pt-2 border-t border-stone-800">
                  <label className="text-[11px] font-semibold text-stone-300 uppercase flex items-center justify-between">
                    <span>Pejabat Pengesah & Tanda Tangan</span>
                    <span className="text-[10px] text-amber-400 font-mono">Otorisasi Sah</span>
                  </label>
                  <select
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value as 'ibrahim' | 'heri' | 'siti')}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-amber-200 font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="ibrahim">IBRAHIM (Bendahara / Pengurus Pusat)</option>
                    <option value="heri">HERI PRABOWO, S.H. (Ketua Umum / Advokat LPKSM)</option>
                    <option value="siti">SITI RAHMAWATI (Sekretaris Jenderal)</option>
                  </select>
                </div>

                {/* Toggles for Digital Stamp & Signature */}
                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                    <input
                      type="checkbox"
                      checked={includeStamp}
                      onChange={(e) => setIncludeStamp(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Sertakan Stempel Resmi LPKSM</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                    <input
                      type="checkbox"
                      checked={includeSignature}
                      onChange={(e) => setIncludeSignature(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Sertakan Tanda Tangan Pengurus & Anggota</span>
                  </label>
                </div>

                {/* Download PDF & Print All Queue Buttons */}
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingPDF ? 'Membuat Berkas PDF...' : 'Unduh Berkas PDF Resmi'}</span>
                  </button>

                  <button
                    onClick={handlePrintAll}
                    className="w-full py-2 px-4 bg-stone-900 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Cetak Antrean ({selectedBatchTypes.length} Surat)</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Live Official Letter Preview Canvas */}
              <div className="lg:col-span-8 print:col-span-12 print:w-full print:p-0 print:m-0 overflow-x-auto flex flex-col items-center gap-6">
                
                {/* Hidden Upload Inputs */}
                <input type="file" ref={docFileInputRef} onChange={handleImportDocumentFile} accept=".txt,.json" className="hidden" />
                <input type="file" ref={logoFileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                <input type="file" ref={stampFileInputRef} onChange={handleStampUpload} accept="image/*" className="hidden" />
                <input type="file" ref={signatureFileInputRef} onChange={handleSignatureUpload} accept="image/*" className="hidden" />
                <input type="file" ref={attachmentFileInputRef} onChange={handleAttachmentUpload} accept="image/*" multiple className="hidden" />

                {/* Google Docs Style Toolbar */}
                <div className="w-[210mm] max-w-full bg-stone-900 border border-amber-500/30 rounded-xl p-3 space-y-3 print:hidden shadow-xl">
                  {/* Top Bar: Actions & Upload Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold font-serif text-amber-300 flex items-center gap-1 pr-2 border-r border-stone-700">
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Editor Google Dokumen
                      </span>

                      <button
                        type="button"
                        onClick={() => docFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Unggah berkas teks (.txt) atau draft dokumen (.json)"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unggah Berkas / Draft</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                        title="Unggah Logo Kop Surat Custom"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Logo Kop</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => stampFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                        title="Unggah Stempel Resmi Custom"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Stempel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => signatureFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                        title="Unggah Tanda Tangan Digital Custom"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tanda Tangan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => attachmentFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                        title="Unggah foto atau berkas bukti pendukung ke lampiran surat"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Foto / Bukti</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddClause}
                        className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Pasal / Poin</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportJSON}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Simpan seluruh isi dokumen sebagai draft JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Simpan Draft JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Font Family */}
                    <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-500 uppercase px-1 font-mono">Font:</span>
                      <button
                        type="button"
                        onClick={() => setDocFontFamily('font-serif')}
                        className={`px-2 py-0.5 rounded font-serif text-xs cursor-pointer ${
                          docFontFamily === 'font-serif' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Serif
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocFontFamily('font-sans')}
                        className={`px-2 py-0.5 rounded font-sans text-xs cursor-pointer ${
                          docFontFamily === 'font-sans' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Sans
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocFontFamily('font-mono')}
                        className={`px-2 py-0.5 rounded font-mono text-xs cursor-pointer ${
                          docFontFamily === 'font-mono' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Mono
                      </button>
                    </div>

                    {/* Font Size */}
                    <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-500 uppercase px-1 font-mono">Ukuran:</span>
                      <button
                        type="button"
                        onClick={() => setDocFontSize('text-xs')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                          docFontSize === 'text-xs' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Kecil
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocFontSize('text-sm')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                          docFontSize === 'text-sm' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Standar
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocFontSize('text-base')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                          docFontSize === 'text-base' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Besar
                      </button>
                    </div>

                    {/* Line Height */}
                    <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-500 uppercase px-1 font-mono">Spasi:</span>
                      <button
                        type="button"
                        onClick={() => setDocLineHeight('leading-normal')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                          docLineHeight === 'leading-normal' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        1.0
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocLineHeight('leading-relaxed')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                          docLineHeight === 'leading-relaxed' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        1.5
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocLineHeight('leading-loose')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                          docLineHeight === 'leading-loose' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        2.0
                      </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                      <button
                        type="button"
                        onClick={() => setDocTextAlign('text-left')}
                        className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                          docTextAlign === 'text-left' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Kiri
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocTextAlign('text-center')}
                        className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                          docTextAlign === 'text-center' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Tengah
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocTextAlign('text-right')}
                        className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                          docTextAlign === 'text-right' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Kanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocTextAlign('text-justify')}
                        className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                          docTextAlign === 'text-justify' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Rata
                      </button>
                    </div>

                    {/* Style Toggles */}
                    <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                      <button
                        type="button"
                        onClick={() => setIsBold(!isBold)}
                        className={`px-2.5 py-0.5 rounded text-xs font-bold cursor-pointer ${
                          isBold ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsItalic(!isItalic)}
                        className={`px-2.5 py-0.5 rounded text-xs italic font-bold cursor-pointer ${
                          isItalic ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsUnderline(!isUnderline)}
                        className={`px-2.5 py-0.5 rounded text-xs underline font-bold cursor-pointer ${
                          isUnderline ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        U
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Batch Queue Notification Banner (Hidden on Print) */}
                {docViewMode === 'batch' && (
                  <div className="w-[210mm] p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Antrean Cetak Masal Aktif:</strong> Menampilkan {selectedBatchTypes.length} dokumen legal resmi. Mengklik Cetak akan menggabungkan seluruh dokumen dalam 1 tugas pencetakan.
                      </span>
                    </div>
                    <button
                      onClick={handlePrintAll}
                      className="px-3 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg text-[11px] shrink-0 hover:bg-amber-400 cursor-pointer"
                    >
                      Cetak Sekarang
                    </button>
                  </div>
                )}

                {docViewMode === 'single'
                  ? renderOfficialDocumentCanvas(selectedDocType, false)
                  : selectedBatchTypes.map((type, idx) =>
                      renderOfficialDocumentCanvas(type, idx < selectedBatchTypes.length - 1)
                    )}
              </div>

            </div>
          ) : (
            /* TAB 2: ISSUED DOCUMENTS ARCHIVE TABLE */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase font-serif text-amber-200">
                  Arsip Persuratan & Dokumen Keluar Terdaftar
                </h3>
                <span className="text-xs text-stone-400">
                  Total Terarsip: <strong>{issuedDocs.length} Dokumen</strong>
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 text-amber-300 font-serif border-b border-stone-800">
                    <tr>
                      <th className="p-3">No. Surat / ID</th>
                      <th className="p-3">Judul Dokumen</th>
                      <th className="p-3">Penerima / Tujuan</th>
                      <th className="p-3">Petugas</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {issuedDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-stone-900/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-300">
                          {doc.docNumber}
                        </td>
                        <td className="p-3 font-semibold text-stone-100">{doc.title}</td>
                        <td className="p-3 text-stone-300">{doc.recipient}</td>
                        <td className="p-3 text-amber-100">{doc.memberName}</td>
                        <td className="p-3 text-stone-400 font-mono">{doc.issueDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
