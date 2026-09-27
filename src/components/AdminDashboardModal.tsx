import React, { useState, useEffect } from 'react';
import { Member, Transaction, SiteConfig, AuditLog, NewsItem, Vehicle, LegalAidCase } from '../types';
import { ShieldCheck, UserCheck, Clock, Search, X, CheckCircle2, XCircle, FileText, Printer, Filter, UserPlus, ShieldAlert, Sparkles, AlertCircle, Edit3, Trash2, Wallet, PlusCircle, ArrowUpRight, ArrowDownRight, DollarSign, Settings, Upload, Image, Save, Check, FileSpreadsheet, FileCheck, History, Plus, Building, Send, Layers, CheckSquare, Square, Download, CreditCard, Eye, LogOut, KeyRound, Lock, Activity, Mail, Newspaper, LayoutDashboard, Globe, ArrowRight, Car, Scale, Menu, PhoneCall, ChevronRight, Hash, Shield, Tag, User, MapPin } from 'lucide-react';
import { PrintableKTAModal } from './PrintableKTAModal';
import { EditMemberModal } from './EditMemberModal';
import { TSNLogo } from './TSNLogo';
import { initialSiteConfig, initialNews, initialLegalAidCases } from '../data/mockData';
import { initialVehicles } from '../services/vehicleService';
import { exportFinancialToExcel, exportMembersToExcel, exportVehiclesToExcel } from '../utils/exportExcel';
import { downloadElementAsPDF, downloadBatchElementsAsPDF } from '../utils/pdfExport';
import { subscribeAuditLogs, recordAuditLog } from '../services/auditService';
import { getMemberPrivateData } from '../services/memberService';
import { auth } from '../firebase';
import { sendAdminPasswordReset } from '../services/authService';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onVerifyMember: (memberId: string) => void;
  onRejectMember: (memberId: string) => void;
  onAddMember: (member: Member) => void;
  onUpdateMember: (updatedMember: Member) => void;
  onDeleteMember?: (memberId: string) => void;
  transactions?: Transaction[];
  onAddTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  siteConfig?: SiteConfig;
  onUpdateSiteConfig?: (newConfig: SiteConfig) => void;
  adminName?: string;
  onLogout?: () => void;
  news?: NewsItem[];
  onAddNews?: (news: NewsItem) => Promise<void> | void;
  onUpdateNews?: (news: NewsItem) => Promise<void> | void;
  onDeleteNews?: (newsId: string) => Promise<void> | void;
  vehicles?: Vehicle[];
  onAddVehicle?: (vehicle: Vehicle) => Promise<void> | void;
  onUpdateVehicle?: (vehicle: Vehicle) => Promise<void> | void;
  onDeleteVehicle?: (vehicleId: string) => Promise<void> | void;
  legalAidCases?: LegalAidCase[];
  onUpdateLegalAidStatus?: (ticketNumber: string, status: LegalAidCase['status']) => Promise<void> | void;
  isFullScreen?: boolean;
  onSwitchToPublic?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  members,
  onVerifyMember,
  onRejectMember,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  transactions = [],
  onAddTransaction,
  onDeleteTransaction,
  siteConfig = initialSiteConfig,
  onUpdateSiteConfig,
  adminName,
  onLogout,
  news = initialNews,
  onAddNews,
  onUpdateNews,
  onDeleteNews,
  vehicles = initialVehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  legalAidCases = initialLegalAidCases,
  onUpdateLegalAidStatus,
  isFullScreen = true,
  onSwitchToPublic,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'pending'
    | 'all'
    | 'add'
    | 'vehicles'
    | 'legalaid'
    | 'cashbook'
    | 'news'
    | 'documents'
    | 'organization'
    | 'settings'
    | 'audit'
  >('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [vehicleStickerFilter, setVehicleStickerFilter] = useState('all');
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToast, setVehicleToast] = useState<string | null>(null);
  const [legalAidStatusFilter, setLegalAidStatusFilter] = useState('all');
  const [legalAidSearch, setLegalAidSearch] = useState('');
  const [legalAidToast, setLegalAidToast] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const liveClock = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const liveDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [memberToPrint, setMemberToPrint] = useState<Member | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [viewingKtpMember, setViewingKtpMember] = useState<Member | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [loadingPrivateMember, setLoadingPrivateMember] = useState<boolean>(false);
  const [resetEmailStatus, setResetEmailStatus] = useState<string | null>(null);

  // Subscribe to real-time audit logs only when modal is open and admin is authenticated
  useEffect(() => {
    if (!isOpen || !auth.currentUser) {
      setAuditLogs([]);
      return;
    }

    let isMounted = true;
    const unsubAudit = subscribeAuditLogs(
      (logs) => {
        if (isMounted) {
          setAuditLogs(logs);
        }
      },
      (err) => {
        console.warn('Audit logs listener notice:', err);
      }
    );

    return () => {
      isMounted = false;
      if (unsubAudit) unsubAudit();
    };
  }, [isOpen]);

  const handleInspectKtp = async (m: Member) => {
    setViewingKtpMember(m);
    setLoadingPrivateMember(true);
    try {
      const priv = await getMemberPrivateData(m.id);
      if (priv) {
        setViewingKtpMember((prev) => (prev ? {
          ...prev,
          nik: priv.nik || prev.nik,
          phone: priv.phone || prev.phone,
          email: priv.email || prev.email,
          address: priv.address || prev.address,
          ktpUrl: priv.ktpUrl || prev.ktpUrl,
          signatureUrl: priv.signatureUrl || prev.signatureUrl,
        } : null));
      }
    } catch (err) {
      console.warn('Inspect private member details error:', err);
    } finally {
      setLoadingPrivateMember(false);
    }
  };

  // Official Documents Generator State inside Admin Dashboard
  type DocumentType =
    | 'surat_tugas'
    | 'surat_pengangkatan'
    | 'surat_kuasa'
    | 'surat_klarifikasi'
    | 'surat_keterangan'
    | 'surat_mediasi'
    | 'surat_bap_mediasi';

  const [docSubTab, setDocSubTab] = useState<'create' | 'archive'>('create');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('surat_tugas');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [autoPopulateToast, setAutoPopulateToast] = useState<string | null>(null);

  const [docNumber, setDocNumber] = useState<string>(
    `No: 088/SPT-ADV/LPKSM-TSN/VIII/${new Date().getFullYear()}`
  );
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [destination, setDestination] = useState<string>('Wilayah Kab. Jember & Sekitarnya');
  const [taskDescription, setTaskDescription] = useState<string>(
    'Melakukan verifikasi, pendampingan konsumen, dan pemantauan aksi sosial kemanusiaan sesuai UU No. 8 Tahun 1999 tentang Perlindungan Konsumen.'
  );
  const [recipientName, setRecipientName] = useState<string>('Pimpinan PT / Instansi Terkait');
  const [caseSubject, setCaseSubject] = useState<string>('Pengaduan Hak Konsumen & Permohonan Klarifikasi Usaha');
  const [includeStamp, setIncludeStamp] = useState<boolean>(true);
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);

  const ALL_DOC_TYPES: DocumentType[] = [
    'surat_tugas',
    'surat_pengangkatan',
    'surat_keterangan',
    'surat_kuasa',
    'surat_klarifikasi',
    'surat_mediasi',
    'surat_bap_mediasi',
  ];
  const [docViewMode, setDocViewMode] = useState<'single' | 'batch'>('single');
  const [selectedBatchTypes, setSelectedBatchTypes] = useState<DocumentType[]>(ALL_DOC_TYPES);

  const getRefNoForType = (type: DocumentType) => {
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const currentMonthRoman = romanMonths[new Date().getMonth()] || 'VIII';
    const currentYear = new Date().getFullYear();
    const prefixMap: Record<DocumentType, string> = {
      surat_tugas: 'SPT-ADV',
      surat_pengangkatan: 'SK-PENG',
      surat_kuasa: 'SKU-ADV',
      surat_klarifikasi: 'SKL-KONS',
      surat_keterangan: 'SKK-ANG',
      surat_mediasi: 'SUM-MED',
      surat_bap_mediasi: 'BA-DADING',
    };
    return `No: 088/${prefixMap[type] || 'DOC'}/LPKSM-TSN/${currentMonthRoman}/${currentYear}`;
  };

  const applyMemberTemplateData = (member: Member, docType: DocumentType) => {
    if (!member) return;
    const memberName = member.name || 'Anggota TSN';
    const memberId = member.id || 'TSN-001';
    const division = member.division || 'Divisi Pendampingan Konsumen';
    const joinDate = member.joinDate || '2024-01-01';
    const address = member.address || 'Kab. Jember, Jawa Timur';

    setDocNumber(getRefNoForType(docType));

    switch (docType) {
      case 'surat_keterangan':
        setRecipientName(memberName);
        setCaseSubject(`Konfirmasi Keanggotaan Aktif LPKSM Senyap Nusantara Jaya`);
        setDestination(`Sekretariat & Wilayah Kerja (${address})`);
        setTaskDescription(
          `Pengurus Pusat LPKSM Senyap Nusantara Jaya menerangkan dengan sebenarnya bahwa ${memberName} (ID: ${memberId}, NIK: ${member.nik || '3509111201950001'}) terdaftar sah sebagai Anggota Aktif sejak ${joinDate} bertugas pada ${division} dengan wewenang serta kewajiban penuh sesuai AD/ART Organisasi.`
        );
        break;

      case 'surat_pengangkatan':
        setRecipientName(memberName);
        setCaseSubject(`Surat Keputusan (SK) Pengangkatan Jabatan Organisasi`);
        setDestination(`Pengurus Pusat & Wilayah Kerja (${address})`);
        setTaskDescription(
          `Mengesahkan dan mengangkat ${memberName} (ID: ${memberId}, NIK: ${member.nik || '3509111201950001'}) dalam jabatan/posisi ${division} LPKSM Senyap Nusantara Jaya terhitung sejak tanggal diterbitkan dengan kewenangan dan tanggung jawab advokasi konsumen.`
        );
        break;

      case 'surat_tugas':
        setRecipientName(`Pimpinan PT / Instansi / Masyarakat Terkait`);
        setCaseSubject(`Pelaksanaan Perintah Tugas Advokasi & Pendampingan Konsumen`);
        setDestination(address || 'Wilayah Kab. Jember & Sekitarnya');
        setTaskDescription(
          `Memberikan perintah tugas resmi kepada ${memberName} (ID: ${memberId} - ${division}) untuk melakukan verifikasi, pendampingan konsumen, dan aksi pengawasan perlindungan konsumen sesuai UU No. 8 Tahun 1999.`
        );
        break;

      case 'surat_kuasa':
        setRecipientName(`Pemberi Kuasa (Masyarakat / Konsumen)`);
        setCaseSubject(`Pendampingan Hukum & Advokasi Perlindungan Hak Konsumen`);
        setDestination(address);
        setTaskDescription(
          `Penerima Kuasa ${memberName} (ID: ${memberId} - ${division}) berwenang mendampingi, melakukan mediasi, memberikan advokasi hukum, serta mewakili kepentingan konsumen pada instansi atau badan peradilan terkait.`
        );
        break;

      case 'surat_klarifikasi':
        setRecipientName(`Pimpinan Pelaku Usaha / Instansi Terkait`);
        setCaseSubject(`Pengaduan Hak Konsumen & Permohonan Klarifikasi Resmi`);
        setDestination(`Kantor Pimpinan Pelaku Usaha`);
        setTaskDescription(
          `Sehubungan dengan aduan masyarakat konsumen yang didampingi oleh Petugas Advokasi ${memberName} (ID: ${memberId}), memohon klarifikasi tertulis resmi terkait pemenuhan hak-hak konsumen sesuai aturan perundang-undangan.`
        );
        break;

      case 'surat_mediasi':
        setRecipientName(`Para Pihak Bersengketa`);
        setCaseSubject(`Musyawarah Mediasi Sengketa Perlindungan Konsumen`);
        setDestination(`Sekretariat Pusat LPKSM Senyap Nusantara Jaya`);
        setTaskDescription(
          `Mengundang para pihak dalam musyawarah mediasi yang difasilitasi oleh Mediator / Petugas LPKSM ${memberName} (ID: ${memberId} - ${division}) demi penyelesaian sengketa konsumen secara adil.`
        );
        break;

      case 'surat_bap_mediasi':
        setRecipientName(`Pimpinan Pelaku Usaha / Teradu`);
        setCaseSubject(`Kesepakatan Perdamaian Sengketa Konsumen: Konsumen vs Teradu`);
        setDestination(`Sekretariat Pusat LPKSM Senyap Nusantara Jaya`);
        setTaskDescription(
          `Para pihak difasilitasi Mediator Resmi ${memberName} (NTA: ${memberId}) telah bersepakat damai secara musyawarah mufakat (Acta van Dading) berdasarkan UU No. 8 Tahun 1999 jo. PP No. 59 Tahun 2001.`
        );
        break;
    }

    setAutoPopulateToast(`Data ${memberName} berhasil diisikan otomatis!`);
    setTimeout(() => {
      setAutoPopulateToast(null);
    }, 3500);
  };

  const toggleBatchType = (typeToToggle: DocumentType) => {
    if (selectedBatchTypes.includes(typeToToggle)) {
      if (selectedBatchTypes.length === 1) {
        alert('Minimal 1 jenis surat harus dipilih untuk pencetakan batch.');
        return;
      }
      setSelectedBatchTypes(selectedBatchTypes.filter((t) => t !== typeToToggle));
    } else {
      setSelectedBatchTypes([...selectedBatchTypes, typeToToggle]);
    }
  };

  const handlePrintAll = () => {
    setDocViewMode('batch');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadAdminPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      if (docViewMode === 'single') {
        const el = document.getElementById(`admin-doc-canvas-${selectedDocType}`);
        if (el) {
          const docTitleClean = getDocTitle(selectedDocType).replace(/[^a-zA-Z0-9]/g, '_');
          const memberNameClean = (currentDocMember?.name || 'TSN').replace(/[^a-zA-Z0-9]/g, '_');
          await downloadElementAsPDF(
            el,
            `${docTitleClean}_${memberNameClean}.pdf`,
            'portrait'
          );
        }
      } else {
        const elements = selectedBatchTypes
          .map((t) => document.getElementById(`admin-doc-canvas-${t}`))
          .filter(Boolean) as HTMLElement[];

        if (elements.length > 0) {
          const memberNameClean = (currentDocMember?.name || 'TSN').replace(/[^a-zA-Z0-9]/g, '_');
          await downloadBatchElementsAsPDF(
            elements,
            `Kumpulan_Dokumen_Resmi_${memberNameClean}.pdf`
          );
        }
      }
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Gagal mengunduh PDF. Silakan gunakan tombol Cetak Presisi browser.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const [issuedDocs, setIssuedDocs] = useState<Array<{
    id: string;
    docNumber: string;
    docType: DocumentType;
    title: string;
    recipient: string;
    memberName: string;
    memberId: string;
    issueDate: string;
    status: string;
  }>>([
    {
      id: 'DOC-1001',
      docNumber: 'No: 042/SPT/LPKSM-TSN/8/2026',
      docType: 'surat_tugas',
      title: 'SURAT PERINTAH TUGAS (SPT) ADVOKASI',
      recipient: 'Masyarakat Balung Jember',
      memberName: 'IBRAHIM',
      memberId: 'TSN-00101',
      issueDate: '2026-08-01',
      status: 'Diterbitkan',
    },
    {
      id: 'DOC-1002',
      docNumber: 'No: 015/SKT/LPKSM-TSN/8/2026',
      docType: 'surat_keterangan',
      title: 'SURAT KETERANGAN KEANGGOTAAN AKTIF',
      recipient: 'Siti Aminah',
      memberName: 'Siti Aminah',
      memberId: 'TSN-00102',
      issueDate: '2026-08-03',
      status: 'Diterbitkan',
    },
  ]);

  const getDocTitle = (type: DocumentType) => {
    switch (type) {
      case 'surat_tugas':
        return 'SURAT PERINTAH TUGAS (SPT) ADVOKASI';
      case 'surat_pengangkatan':
        return 'SURAT KEPUTUSAN (SK) PENGANGKATAN JABATAN';
      case 'surat_kuasa':
        return 'SURAT KUASA PENDAMPINGAN HUKUM & KONSUMEN';
      case 'surat_klarifikasi':
        return 'SURAT PERMOHONAN KLARIFIKASI & PENGADUAN KONSUMEN';
      case 'surat_keterangan':
        return 'SURAT KETERANGAN KEANGGOTAAN AKTIF LPKSM';
      case 'surat_mediasi':
        return 'SURAT UNDANGAN MEDIASI SENGKETA KONSUMEN';
      case 'surat_bap_mediasi':
        return 'BERITA ACARA MEDIASI SENGKETA KONSUMEN (ACTA VAN DADING)';
      default:
        return 'DOKUMEN RESMI LPKSM';
    }
  };

  const currentDocMember = members.find((m) => m.id === selectedMemberId) || members[0] || {
    id: 'TSN-001',
    name: 'PENGURUS LPKSM',
    region: 'Jember',
    division: 'Pengurus',
    status: 'Aktif',
    joinDate: '2026',
    photoUrl: '',
  };

  const handleSaveDocToArchive = () => {
    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      docNumber,
      docType: selectedDocType,
      title: getDocTitle(selectedDocType),
      recipient: recipientName || destination,
      memberName: currentDocMember?.name || 'Anggota TSN',
      memberId: currentDocMember?.id || 'TSN-000',
      issueDate,
      status: 'Diterbitkan',
    };

    setIssuedDocs([newDoc, ...issuedDocs]);
    alert('Dokumen resmi berhasil disimpan ke Arsip Persuratan Organisasi!');
    setDocSubTab('archive');
  };

  // Site Config Form State
  const [configForm, setConfigForm] = useState<SiteConfig>(siteConfig);
  const [showConfigSuccess, setShowConfigSuccess] = useState(false);

  useEffect(() => {
    if (siteConfig) {
      setConfigForm(siteConfig);
    }
  }, [siteConfig]);

  // Handle Logo Upload File Convert to Base64 Data URL
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfigForm((prev) => ({
          ...prev,
          logoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSiteConfig) {
      onUpdateSiteConfig(configForm);
    }
    setShowConfigSuccess(true);
    setTimeout(() => setShowConfigSuccess(false), 3000);
  };

  const REGION_OPTIONS = [
    { code: '35.09', name: '35.09 - Jawa Timur (Kab. Jember - Kantor Pusat)', province: 'Jawa Timur', regency: 'Jember' },
    { code: '35.10', name: '35.10 - Jawa Timur (Kab. Banyuwangi)', province: 'Jawa Timur', regency: 'Banyuwangi' },
    { code: '35.08', name: '35.08 - Jawa Timur (Kab. Lumajang)', province: 'Jawa Timur', regency: 'Lumajang' },
    { code: '35.11', name: '35.11 - Jawa Timur (Kab. Bondowoso)', province: 'Jawa Timur', regency: 'Bondowoso' },
    { code: '35.12', name: '35.12 - Jawa Timur (Kab. Situbondo)', province: 'Jawa Timur', regency: 'Situbondo' },
    { code: '35.78', name: '35.78 - Jawa Timur (Kota Surabaya)', province: 'Jawa Timur', regency: 'Surabaya' },
    { code: '31.71', name: '31.71 - DKI Jakarta (Jakarta Pusat)', province: 'DKI Jakarta', regency: 'Jakarta Pusat' },
    { code: '32.73', name: '32.73 - Jawa Barat (Kota Bandung)', province: 'Jawa Barat', regency: 'Bandung' },
    { code: '33.74', name: '33.74 - Jawa Tengah (Kota Semarang)', province: 'Jawa Tengah', regency: 'Semarang' },
  ];

  const getNextSequenceId = (regionCode: string = '35.09', year: string = '2026') => {
    const prefix = `${regionCode}-${year}-`;
    let maxSeq = 16; // M. Very Ardiyansyah is 35.09-2026-0016
    members.forEach((m) => {
      if (m.id && m.id.startsWith(prefix)) {
        const numPart = parseInt(m.id.slice(prefix.length), 10);
        if (!isNaN(numPart) && numPart > maxSeq) {
          maxSeq = numPart;
        }
      }
    });
    let nextCandidate = maxSeq + 1;
    while (members.some((m) => m.id === `${prefix}${String(nextCandidate).padStart(4, '0')}`)) {
      nextCandidate++;
    }
    return `${prefix}${String(nextCandidate).padStart(4, '0')}`;
  };

  // Master Member Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    nik: '',
    regionCode: '35.09',
    region: 'Jawa Timur',
    position: 'Anggota',
    division: 'Sosial' as Member['division'],
    joinYear: '2026',
    status: 'Aktif' as Member['status'],
    membershipType: 'Anggota Biasa' as any,
    phone: '',
    email: '',
    birthPlace: '',
    birthDate: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    religion: 'Islam',
    address: '',
    village: '',
    district: '',
    regency: 'Jember',
    province: 'Jawa Timur',
    notes: '',
    photoUrl: '',
  });

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: '',
    memberId: '',
    memberName: '',
    vehicleType: 'Mobil' as Vehicle['vehicleType'],
    brandModel: '',
    year: '2024',
    color: '',
    chassisNumber: '',
    engineNumber: '',
    stickerStatus: 'Diterbitkan & Tertempel' as Vehicle['stickerStatus'],
    stickerNumber: '',
    notes: '',
  });

  // Cashbook Input Form State
  const [trxForm, setTrxForm] = useState({
    type: 'pemasukan' as 'pemasukan' | 'pengeluaran',
    category: 'Iuran Bulanan Anggota',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recordedBy: 'IBRAHIM (Bendahara Pusat)',
  });
  const [showTrxSuccess, setShowTrxSuccess] = useState(false);

  if (!isOpen) return null;

  const pendingMembers = members.filter((m) => m.status === 'Menunggu Verifikasi');
  const activeMembers = members.filter((m) => m.status === 'Aktif' || m.status === 'Terverifikasi' || m.status === 'Pengurus');
  const totalIncome = transactions.filter((t) => t.type === 'pemasukan').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'pengeluaran').reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const filteredAllMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.nik && m.nik.includes(searchQuery));

    const matchesStatus =
      selectedStatusFilter === 'all' || m.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredVehicles = vehicles.filter((v) => {
    const q = vehicleSearchQuery.toLowerCase();
    const matchesSearch =
      v.licensePlate.toLowerCase().includes(q) ||
      v.memberName.toLowerCase().includes(q) ||
      v.memberId.toLowerCase().includes(q) ||
      v.brandModel.toLowerCase().includes(q) ||
      (v.stickerNumber && v.stickerNumber.toLowerCase().includes(q));

    const matchesType = vehicleTypeFilter === 'all' || v.vehicleType === vehicleTypeFilter;
    const matchesSticker = vehicleStickerFilter === 'all' || v.stickerStatus === vehicleStickerFilter;
    return matchesSearch && matchesType && matchesSticker;
  });

  const filteredLegalCases = legalAidCases.filter((c) => {
    const q = legalAidSearch.toLowerCase();
    const matchesSearch =
      c.ticketNumber.toLowerCase().includes(q) ||
      c.applicantName.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      (c.reportedParty && c.reportedParty.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q);

    const matchesStatus = legalAidStatusFilter === 'all' || c.status === legalAidStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name) return;

    const officialId = getNextSequenceId(manualForm.regionCode || '35.09', manualForm.joinYear || '2026');
    const newMember: Member = {
      id: officialId,
      name: manualForm.name.trim(),
      position: manualForm.position || 'Anggota',
      division: manualForm.division || 'Sosial',
      membershipType: manualForm.membershipType || 'Anggota Biasa',
      region: manualForm.region || 'Jawa Timur',
      joinDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      joinYear: manualForm.joinYear || '2026',
      validUntil: '30 Desember 2027',
      status: manualForm.status,
      photoUrl: manualForm.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      phone: manualForm.phone || 'BELUM DIINPUT',
      email: manualForm.email || 'BELUM DIINPUT',
      nik: manualForm.nik || 'BELUM DIINPUT',
      birthPlace: manualForm.birthPlace || 'BELUM DIINPUT',
      birthDate: manualForm.birthDate || 'BELUM DIINPUT',
      gender: manualForm.gender || 'Laki-laki',
      religion: manualForm.religion || 'Islam',
      address: manualForm.address || 'BELUM DIINPUT',
      village: manualForm.village || 'BELUM DIINPUT',
      district: manualForm.district || 'BELUM DIINPUT',
      regency: manualForm.regency || 'Jember',
      province: manualForm.province || 'Jawa Timur',
      verifiedBy: adminName || 'IBRAHIM ASEGAF (Bendahara Pusat)',
      verifiedAt: new Date().toLocaleDateString('id-ID'),
      notes: manualForm.notes || 'Pendaftaran manual administrator TSN',
      createdAt: new Date().toISOString(),
    };

    onAddMember(newMember);
    setActiveTab('all');
    setManualForm({
      name: '',
      nik: '',
      regionCode: '35.09',
      region: 'Jawa Timur',
      position: 'Anggota',
      division: 'Sosial',
      joinYear: '2026',
      status: 'Aktif',
      membershipType: 'Anggota Biasa',
      phone: '',
      email: '',
      birthPlace: '',
      birthDate: '',
      gender: 'Laki-laki',
      religion: 'Islam',
      address: '',
      village: '',
      district: '',
      regency: 'Jember',
      province: 'Jawa Timur',
      notes: '',
      photoUrl: '',
    });
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.licensePlate) return;

    const cleanPlate = vehicleForm.licensePlate.trim().toUpperCase();
    const cleanId = cleanPlate.replace(/\s+/g, '-');

    const selectedMember = members.find((m) => m.id === vehicleForm.memberId);
    const finalMemberName = selectedMember ? selectedMember.name : (vehicleForm.memberName || 'Anggota TSN');

    const vData: Vehicle = {
      id: cleanId,
      licensePlate: cleanPlate,
      memberId: vehicleForm.memberId || '35.09-2026-0016',
      memberName: finalMemberName,
      vehicleType: vehicleForm.vehicleType,
      brandModel: vehicleForm.brandModel || 'BELUM DIINPUT',
      year: vehicleForm.year || '2024',
      color: vehicleForm.color || 'BELUM DIINPUT',
      chassisNumber: vehicleForm.chassisNumber || 'BELUM DIINPUT',
      engineNumber: vehicleForm.engineNumber || 'BELUM DIINPUT',
      stickerStatus: vehicleForm.stickerStatus,
      stickerNumber: vehicleForm.stickerNumber || `TSN-STK-${cleanPlate.slice(-4)}`,
      notes: vehicleForm.notes || 'Kendaraan operasional anggota TSN',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (editingVehicle) {
      if (onUpdateVehicle) await onUpdateVehicle(vData);
      setEditingVehicle(null);
      setVehicleToast(`Kendaraan ${cleanPlate} berhasil diperbarui.`);
    } else {
      if (onAddVehicle) await onAddVehicle(vData);
      setVehicleToast(`Kendaraan ${cleanPlate} berhasil didaftarkan ke Master Database.`);
    }

    setIsAddVehicleOpen(false);
    setVehicleForm({
      licensePlate: '',
      memberId: '',
      memberName: '',
      vehicleType: 'Mobil',
      brandModel: '',
      year: '2024',
      color: '',
      chassisNumber: '',
      engineNumber: '',
      stickerStatus: 'Diterbitkan & Tertempel',
      stickerNumber: '',
      notes: '',
    });
    setTimeout(() => setVehicleToast(null), 3500);
  };

  const handleDeleteVehicleAction = async (v: Vehicle) => {
    if (confirm(`Yakin ingin menghapus data kendaraan ${v.licensePlate} (${v.memberName})?`)) {
      if (onDeleteVehicle) {
        await onDeleteVehicle(v.id);
        setVehicleToast(`Kendaraan ${v.licensePlate} berhasil dihapus.`);
        setTimeout(() => setVehicleToast(null), 3500);
      }
    }
  };

  const handleUpdateStickerStatus = async (v: Vehicle, newStatus: Vehicle['stickerStatus']) => {
    const updated: Vehicle = {
      ...v,
      stickerStatus: newStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    if (onUpdateVehicle) {
      await onUpdateVehicle(updated);
      setVehicleToast(`Status stiker ${v.licensePlate} diubah menjadi: ${newStatus}`);
      setTimeout(() => setVehicleToast(null), 3500);
    }
  };

  const handleCaseStatusChange = async (ticketNumber: string, newStatus: LegalAidCase['status']) => {
    if (onUpdateLegalAidStatus) {
      await onUpdateLegalAidStatus(ticketNumber, newStatus);
      setLegalAidToast(`Status kasus #${ticketNumber} berhasil diubah menjadi: ${newStatus}`);
      setTimeout(() => setLegalAidToast(null), 3500);
    }
  };

  const handleTrxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxForm.amount || isNaN(Number(trxForm.amount))) return;

    const newTrx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      date: trxForm.date,
      type: trxForm.type,
      category: trxForm.category,
      amount: Number(trxForm.amount),
      description: trxForm.description || (trxForm.type === 'pemasukan' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
      recordedBy: trxForm.recordedBy,
    };

    if (onAddTransaction) {
      onAddTransaction(newTrx);
    }

    setShowTrxSuccess(true);
    setTimeout(() => setShowTrxSuccess(false), 3000);
    setTrxForm({
      type: 'pemasukan',
      category: 'Iuran Bulanan Anggota',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      recordedBy: 'IBRAHIM (Bendahara Pusat)',
    });
  };

  // News Management Form & State
  const [newsFormMode, setNewsFormMode] = useState<'list' | 'create' | 'edit'>('list');
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('all');
  const [selectedNewsPreview, setSelectedNewsPreview] = useState<NewsItem | null>(null);
  const [newsToast, setNewsToast] = useState<string | null>(null);
  const [isSubmittingNews, setIsSubmittingNews] = useState(false);

  const [newsFormData, setNewsFormData] = useState<NewsItem>({
    id: '',
    title: '',
    category: 'Advokasi Hukum',
    author: adminName || 'Humas TSN Pusat',
    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    summary: '',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
  });

  const newsCategories = [
    'Advokasi Hukum',
    'Kemanusiaan',
    'Pengumuman',
    'Bakti Sosial',
    'Edukasi',
    'Kegiatan Lapangan',
    'Siaran Pers',
  ];

  const newsImagePresets = [
    { label: 'Advokasi Hukum & Mediasi', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800' },
    { label: 'Aksi Tanggap Bencana', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800' },
    { label: 'Bakti Sosial & Sembako', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800' },
    { label: 'Edukasi & Sosialisasi', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800' },
    { label: 'KTA Digital & Kelembagaan', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800' },
    { label: 'Pertemuan & Audiensi', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800' },
  ];

  const handleStartCreateNews = () => {
    setNewsFormData({
      id: `news-${Date.now()}`,
      title: '',
      category: 'Advokasi Hukum',
      author: adminName || 'Humas TSN Pusat',
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      summary: '',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
    });
    setNewsFormMode('create');
  };

  const handleStartEditNews = (item: NewsItem) => {
    setNewsFormData(item);
    setNewsFormMode('edit');
  };

  const handleNewsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran file foto berita maksimal 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewsFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsFormData.title.trim() || !newsFormData.summary.trim() || !newsFormData.content.trim()) {
      alert('Mohon lengkapi Judul, Ringkasan, dan Isi Berita.');
      return;
    }

    setIsSubmittingNews(true);
    try {
      if (newsFormMode === 'create') {
        const itemToSave: NewsItem = {
          ...newsFormData,
          id: newsFormData.id || `news-${Date.now()}`,
        };
        if (onAddNews) {
          await onAddNews(itemToSave);
        }
        await recordAuditLog(
          'PUBLISH_NEWS',
          itemToSave.id,
          `Memublikasikan berita baru: "${itemToSave.title}" (${itemToSave.category})`
        );
        setNewsToast('Berita baru berhasil dipublikasikan!');
      } else {
        if (onUpdateNews) {
          await onUpdateNews(newsFormData);
        }
        await recordAuditLog(
          'UPDATE_NEWS',
          newsFormData.id,
          `Memperbarui naskah berita: "${newsFormData.title}"`
        );
        setNewsToast('Perubahan berita berhasil disimpan!');
      }
      setNewsFormMode('list');
      setTimeout(() => setNewsToast(null), 4000);
    } catch (err: any) {
      alert(`Gagal menyimpan berita: ${err.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setIsSubmittingNews(false);
    }
  };

  const handleDeleteNewsItem = async (item: NewsItem) => {
    if (!window.confirm(`Yakin ingin menghapus berita: "${item.title}"?`)) {
      return;
    }
    try {
      if (onDeleteNews) {
        await onDeleteNews(item.id);
      }
      await recordAuditLog(
        'DELETE_NEWS',
        item.id,
        `Menghapus berita: "${item.title}"`
      );
      setNewsToast('Berita berhasil dihapus.');
      setTimeout(() => setNewsToast(null), 4000);
    } catch (err: any) {
      alert(`Gagal menghapus berita: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  const filteredNewsList = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(newsSearchQuery.toLowerCase());
    const matchesCategory =
      newsCategoryFilter === 'all' || item.category === newsCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col lg:flex-row font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Toast Notifications */}
      {vehicleToast && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-500 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-stone-950" />
          <span>{vehicleToast}</span>
        </div>
      )}
      {legalAidToast && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl bg-emerald-400 text-stone-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-stone-950" />
          <span>{legalAidToast}</span>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* DEDICATED ADMIN SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-72 xl:w-80 bg-stone-900 border-r border-amber-500/20 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Organization Authority Header */}
        <div className="p-4 border-b border-amber-500/20 bg-stone-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-1.5 shadow-inner">
                <TSNLogo className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block">
                  PUSAT KENDALI RESMI
                </span>
                <h2 className="text-sm font-bold font-serif text-amber-200 truncate">
                  TEAM SENYAP NUSANTARA
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded-lg bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Master 4-Entity Relationship Badge */}
          <div className="mt-3 p-2.5 rounded-xl bg-stone-900/90 border border-amber-500/30 text-[10px] space-y-1">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span>BADAN HUKUM:</span>
              <span className="font-mono text-[9px] text-amber-400/90">RESMI KEMENKUMHAM</span>
            </div>
            <div className="font-bold text-stone-100 text-[11px] truncate">
              SENYAP NUSANTARA JAYA
            </div>
            <div className="font-mono text-[9px] text-stone-400 truncate">
              AHU-0001353.AH.01.07.TAHUN 2026
            </div>
            <div className="pt-1 border-t border-stone-800 text-[9px] text-amber-300/80 flex items-center justify-between">
              <span>TSN • LPKTSN • YLBH CAKRA</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
          {/* GROUP 1: KONTROL UTAMA */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
              KONTROL UTAMA
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab('overview'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Ringkasan Eksekutif</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('pending'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Verifikasi Anggota</span>
              </div>
              {pendingMembers.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'pending' ? 'bg-stone-950 text-amber-300' : 'bg-amber-500 text-stone-950 animate-pulse'
                }`}>
                  {pendingMembers.length}
                </span>
              )}
            </button>
          </div>

          {/* GROUP 2: MASTER DATA RESMI */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
              MASTER DATA RESMI
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab('all'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Database Anggota</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">({members.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('add'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-4 h-4" />
                <span>Registrasi Baru (ID)</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">Auto</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('vehicles'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'vehicles'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4" />
                <span>Master Kendaraan</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">({vehicles.length})</span>
            </button>
          </div>

          {/* GROUP 3: LAYANAN & PUBLIKASI */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
              LAYANAN & OPERASIONAL
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab('legalaid'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'legalaid'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4" />
                <span>Pengaduan & Advokasi</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">({legalAidCases.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('news'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4" />
                <span>Warta & Berita Resmi</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">({news.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('documents'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Dokumen & SK Resmi</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">({issuedDocs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('cashbook'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'cashbook'
                  ? 'bg-emerald-500 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Buku Kas & Transaksi</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {currentBalance >= 0 ? '+' : ''}{Math.round(currentBalance / 1000)}k
              </span>
            </button>
          </div>

          {/* GROUP 4: SISTEM & LEGALITAS */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
              SISTEM & LEGALITAS
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab('organization'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'organization'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4" />
                <span>Struktur 4 Entitas & Kontak</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Pengaturan Portal</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('audit'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>Audit Trail Keamanan</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">({auditLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer with Admin & Actions */}
        <div className="p-3 border-t border-amber-500/20 bg-stone-950/80 space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-amber-200 truncate">{adminName || 'Admin Pusat'}</div>
              <div className="text-[10px] text-stone-400 truncate">Administrator Penuh</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onSwitchToPublic || onClose}
              className="px-2.5 py-2 text-xs font-bold text-amber-300 bg-stone-900 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Tinjau Website Publik"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Tinjau Web</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-2 text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl hover:bg-rose-900/60 transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Keluar Sesi"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-950 min-h-screen">
        {/* Top Command Bar */}
        <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-6 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700"
                title="Buka Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                    Pusat Kendali Pengurus TSN
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Sistem Aktif & Terlindungi</span>
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold font-serif text-amber-200">
                  {activeTab === 'overview' && 'Ringkasan & Statistik Eksekutif'}
                  {activeTab === 'pending' && `Verifikasi Calon Anggota (${pendingMembers.length} Antrean)`}
                  {activeTab === 'all' && `Database Master Keanggotaan (${members.length} Anggota)`}
                  {activeTab === 'add' && 'Registrasi Anggota Baru (Sequence ID Otomatis)'}
                  {activeTab === 'vehicles' && `Master Kendaraan Anggota (${vehicles.length} Kendaraan)`}
                  {activeTab === 'legalaid' && `Posko Pengaduan Konsumen & Advokasi (${legalAidCases.length} Kasus)`}
                  {activeTab === 'news' && `Warta & Berita Resmi (${news.length} Artikel)`}
                  {activeTab === 'documents' && `Dokumen & SK Resmi Organisasi (${issuedDocs.length} Template)`}
                  {activeTab === 'cashbook' && 'Buku Kas & Laporan Finansial Akuntabel'}
                  {activeTab === 'organization' && 'Identitas, Hubungan 4 Entitas & Master Kontak'}
                  {activeTab === 'settings' && 'Pengaturan Portal & Konfigurasi Sistem'}
                  {activeTab === 'audit' && `Audit Trail & Log Keamanan (${auditLogs.length} Entri)`}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex flex-col text-right pr-2 border-r border-stone-800">
                <span className="text-[11px] font-mono text-amber-300 font-semibold">{liveClock} WIB</span>
                <span className="text-[10px] text-stone-400">{liveDate}</span>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Tambah Anggota Baru"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Anggota</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('vehicles'); setIsAddVehicleOpen(true); }}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Daftarkan Kendaraan Baru"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>+ Kendaraan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cashbook')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Catat Kas Baru"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>+ Kas</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onSwitchToPublic || onClose}
                className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-stone-900 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 hover:text-amber-200 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Buka tampilan website seperti yang dilihat publik/pengunjung"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Tinjau Website Publik</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/40 rounded-xl hover:bg-rose-900/60 transition cursor-pointer flex items-center gap-1"
                  title="Keluar dari sesi administrator"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1920px] w-full mx-auto">
          {/* Progress Summary Cards (Shown on sub-tabs) */}
          {activeTab !== 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-stone-900 border border-amber-500/20 space-y-1">
                <div className="text-[11px] font-bold uppercase text-stone-400">Total Terdaftar</div>
                <div className="text-2xl font-black font-serif text-amber-300">{members.length}</div>
                <div className="text-[10px] text-stone-500">Anggota Dalam Database</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1 relative overflow-hidden">
                <div className="text-[11px] font-bold uppercase text-amber-300 flex items-center justify-between">
                  <span>Menunggu Verifikasi</span>
                  {pendingMembers.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  )}
                </div>
                <div className="text-2xl font-black font-serif text-amber-200">{pendingMembers.length}</div>
                <div className="text-[10px] text-amber-400/80">Butuh Persetujuan Admin</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                <div className="text-[11px] font-bold uppercase text-emerald-300">Aktif & Terverifikasi</div>
                <div className="text-2xl font-black font-serif text-emerald-400">{activeMembers.length}</div>
                <div className="text-[10px] text-emerald-400/80">KTA Resmi Terbit</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-900 border border-amber-500/20 space-y-1">
                <div className="text-[11px] font-bold uppercase text-amber-400">Kantor Pusat Jember</div>
                <div className="text-xs font-bold text-stone-200 truncate">Verifikator: IBRAHIM</div>
                <div className="text-[10px] text-amber-300/80 font-mono">Bendahara Pusat</div>
              </div>
            </div>
          )}

          {/* TAB 0: EXECUTIVE OVERVIEW & KPI */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Stat Banners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Anggota */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase">
                    <span>Total Anggota Terdaftar</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-serif text-amber-300">{members.length}</span>
                    <span className="text-xs text-stone-400">orang terdata</span>
                  </div>
                  <div className="mt-2 text-[11px] text-stone-400 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{activeMembers.length} Aktif / KTA</span>
                    <span>•</span>
                    <span className={pendingMembers.length > 0 ? "text-amber-400 font-bold" : "text-stone-500"}>
                      {pendingMembers.length} Verifikasi
                    </span>
                  </div>
                </div>

                {/* Menunggu Verifikasi */}
                <div className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden transition ${
                  pendingMembers.length > 0
                    ? 'bg-gradient-to-br from-amber-950/60 to-stone-950 border-amber-500/60'
                    : 'bg-stone-900 border-stone-800'
                }`}>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase">
                    <span className={pendingMembers.length > 0 ? "text-amber-300 font-bold" : "text-stone-400"}>
                      Menunggu Verifikasi
                    </span>
                    <div className={`p-2 rounded-xl ${pendingMembers.length > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-500'}`}>
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className={`text-3xl sm:text-4xl font-black font-serif ${pendingMembers.length > 0 ? 'text-amber-200' : 'text-stone-400'}`}>
                      {pendingMembers.length}
                    </span>
                    <span className="text-xs text-stone-400">permohonan berkas</span>
                  </div>
                  <div className="mt-2">
                    {pendingMembers.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('pending')}
                        className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 underline cursor-pointer"
                      >
                        <span>Periksa Sekarang ({pendingMembers.length} berkas)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Semua berkas telah terverifikasi</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Saldo Kas Organisasi */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-emerald-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase">
                    <span>Saldo Kas Bersih</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-black font-mono ${currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Rp {currentBalance.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
                    <span className="text-emerald-400">Masuk: Rp {totalIncome.toLocaleString('id-ID')}</span>
                    <span className="text-rose-400">Keluar: Rp {totalExpense.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Berita & Dokumen */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase">
                    <span>Publikasi & Persuratan</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <FileCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black font-serif text-amber-300">{news.length}</span>
                      <span className="text-[10px] text-stone-400 block">Berita Terbit</span>
                    </div>
                    <div className="h-8 w-px bg-stone-800"></div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-black font-serif text-amber-200">{issuedDocs.length}</span>
                      <span className="text-[10px] text-stone-400 block">SK & Dokumen</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
                    <button type="button" onClick={() => setActiveTab('news')} className="text-amber-400 hover:underline cursor-pointer">
                      + Tulis Berita
                    </button>
                    <button type="button" onClick={() => setActiveTab('documents')} className="text-amber-400 hover:underline cursor-pointer">
                      + Terbitkan Dokumen
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Action Command Launchpad */}
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-amber-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Pusat Kendali Cepat Administrator (Action Launchpad)</span>
                  </h4>
                  <span className="text-xs text-stone-400">Akses instan seluruh modul operasional</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pending')}
                    className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/30 hover:border-amber-400 hover:bg-stone-900 transition text-left space-y-1.5 cursor-pointer group"
                  >
                    <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300">Verifikasi Anggota</div>
                    <div className="text-[10px] text-stone-400">{pendingMembers.length} menunggu persetujuan</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/30 hover:border-amber-400 hover:bg-stone-900 transition text-left space-y-1.5 cursor-pointer group"
                  >
                    <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300">Database Anggota</div>
                    <div className="text-[10px] text-stone-400">Cetak KTA, edit, cari</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('cashbook')}
                    className="p-3.5 rounded-xl bg-stone-950 border border-emerald-500/30 hover:border-emerald-400 hover:bg-stone-900 transition text-left space-y-1.5 cursor-pointer group"
                  >
                    <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-stone-100 group-hover:text-emerald-300">Buku Kas Organisasi</div>
                    <div className="text-[10px] text-stone-400">Catat pemasukan/pengeluaran</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('news')}
                    className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/30 hover:border-amber-400 hover:bg-stone-900 transition text-left space-y-1.5 cursor-pointer group"
                  >
                    <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300">Publikasi Berita</div>
                    <div className="text-[10px] text-stone-400">Tulis warta & rilis pers</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/30 hover:border-amber-400 hover:bg-stone-900 transition text-left space-y-1.5 cursor-pointer group"
                  >
                    <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300">Dokumen & SK Resmi</div>
                    <div className="text-[10px] text-stone-400">Surat tugas, somasi, KTA PDF</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportFinancialToExcel(transactions, siteConfig)}
                    className="p-3.5 rounded-xl bg-stone-950 border border-emerald-500/30 hover:border-emerald-400 hover:bg-stone-900 transition text-left space-y-1.5 cursor-pointer group"
                  >
                    <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-stone-100 group-hover:text-emerald-300">Ekspor Excel Kas</div>
                    <div className="text-[10px] text-stone-400">Unduh laporan pembukuan</div>
                  </button>
                </div>
              </div>

              {/* Split Grid: Recent Pending Approvals & Recent Financial Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Pending Member Registrations */}
                <div className="p-5 rounded-2xl bg-stone-900/90 border border-amber-500/20 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div>
                      <h5 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Calon Anggota Menunggu Verifikasi</span>
                      </h5>
                      <p className="text-[11px] text-stone-400">Tinjau KTP dan terbitkan KTA resmi</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pending')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Lihat Semua ({pendingMembers.length})
                    </button>
                  </div>

                  {pendingMembers.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                      <p>Semua pendaftaran telah diverifikasi. Tidak ada berkas tertunda.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingMembers.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={member.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover border border-amber-500/30 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-stone-200 truncate">{member.name}</div>
                              <div className="text-[10px] text-stone-400">{member.division} • {member.region}</div>
                              <div className="text-[9px] text-stone-500 font-mono">Daftar: {member.joinDate}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleInspectKtp(member)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>KTP</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onVerifyMember(member.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Setujui</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Recent Financial Flow & System Status */}
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-stone-900/90 border border-amber-500/20 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <div>
                        <h5 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          <span>Mutasi Kas Organisasi Terakhir</span>
                        </h5>
                        <p className="text-[11px] text-stone-400">Pencatatan kas masuk & keluar secara transparan</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('cashbook')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                      >
                        Buka Buku Kas
                      </button>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="py-6 text-center text-stone-500 text-xs">
                        Belum ada transaksi kas yang dicatat.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions.slice(0, 4).map((trx) => (
                          <div
                            key={trx.id}
                            className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-stone-200 truncate">{trx.description}</div>
                              <div className="text-[10px] text-stone-400">{trx.date} • {trx.category}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`font-mono font-bold ${trx.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {trx.type === 'pemasukan' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                              </span>
                              <div className="text-[9px] text-stone-500 uppercase">{trx.type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cloud & Security Status Card */}
                  <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-stone-200 block">Infrastruktur Cloud & Keamanan Aktif</span>
                        <span className="text-[10px] text-stone-400">Firestore RBAC Security Rules & Enkripsi Data Pribadi Terproteksi</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('audit')}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Buka Log Audit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* TAB 1: PENDING VERIFICATIONS */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-200 font-serif uppercase">
                Permohonan Masuk Menunggu Persetujuan ({pendingMembers.length})
              </span>
              <span className="text-stone-400 text-[11px]">
                Klik "Setujui & Verifikasi" untuk menerbitkan KTA resmi secara otomatis.
              </span>
            </div>

            {pendingMembers.length === 0 ? (
              <div className="p-8 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300 font-serif uppercase">
                  Semua Pendaftaran Telah Terverifikasi
                </h4>
                <p className="text-xs text-stone-400">
                  Tidak ada permohonan keanggotaan baru yang tertunda saat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMembers.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-14 rounded-lg overflow-hidden border border-amber-500/50 shrink-0 bg-stone-900">
                        <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-serif text-amber-200 uppercase">{m.name}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                            {m.id}
                          </span>
                        </div>
                        <div className="text-xs text-stone-300 flex flex-wrap gap-x-3 gap-y-1">
                          <span>Kategori: <strong className="text-amber-400">{m.membershipType || 'Anggota'}</strong></span>
                          <span>Divisi: <strong>{m.division}</strong></span>
                          <span>Wilayah: <strong>{m.region}</strong></span>
                        </div>
                        {m.nik && (
                          <div className="text-[11px] text-stone-400 font-mono">
                            NIK: {m.nik} | HP: {m.phone || '-'}
                          </div>
                        )}
                        {m.reason && (
                          <div className="text-[11px] text-amber-200/80 italic bg-stone-900 px-2 py-1 rounded border border-amber-500/20 mt-1">
                            "{m.reason}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleInspectKtp(m)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/50 rounded-lg hover:bg-emerald-900/60 cursor-pointer flex items-center gap-1.5 shadow"
                        title="Periksa Foto KTP & Berkas Asli (Subkoleksi Privat)"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Periksa KTP & Data</span>
                      </button>

                      <button
                        onClick={() => setMemberToEdit(m)}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
                        title="Edit Data & Foto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Data</span>
                      </button>

                      <button
                        onClick={() => setMemberToPrint(m)}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-stone-900 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Preview KTA</span>
                      </button>

                      <button
                        onClick={() => onRejectMember(m.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-lg hover:bg-rose-900/60 cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Tolak</span>
                      </button>

                      <button
                        onClick={() => onVerifyMember(m.id)}
                        className="px-4 py-1.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-lg hover:brightness-110 cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Setujui & Verifikasi</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL MEMBERS DATABASE */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Search & Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Nama, NIK, ID TSN, atau Wilayah..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-bold"
              >
                <option value="all">Semua Status</option>
                <option value="Pengurus font-bold">Status: Pengurus</option>
                <option value="Aktif">Status: Aktif</option>
                <option value="Menunggu Verifikasi">Status: Menunggu Verifikasi</option>
                <option value="Nonaktif">Status: Nonaktif</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-amber-500/30 bg-stone-950">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-900 border-b border-amber-500/30 text-amber-200 uppercase text-[10px] tracking-wider font-serif">
                  <tr>
                    <th className="p-3">Anggota & ID</th>
                    <th className="p-3">Kategori & Divisi</th>
                    <th className="p-3">Wilayah</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {filteredAllMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={m.photoUrl} alt="" className="w-9 h-11 rounded object-cover border border-amber-500/30" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-bold text-amber-200 font-serif uppercase">{m.name}</div>
                            <div className="font-mono text-[11px] text-amber-400/90">{m.id}</div>
                            {m.nik && <div className="text-[10px] text-stone-500 font-mono">NIK: {m.nik}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-stone-200">{m.membershipType || 'Anggota'}</div>
                        <div className="text-[11px] text-stone-400">{m.division}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-stone-200">{m.region}</div>
                        <div className="text-[10px] text-stone-500">{m.joinDate}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block border ${
                            m.status === 'Pengurus'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : m.status === 'Aktif' || m.status === 'Terverifikasi'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                              : m.status === 'Menunggu Verifikasi'
                              ? 'bg-yellow-950 text-yellow-300 border-yellow-500/40'
                              : 'bg-stone-800 text-stone-400 border-stone-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleInspectKtp(m)}
                            className="p-1.5 text-emerald-400 bg-stone-900 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 cursor-pointer"
                            title="Periksa Dokumen KTP & Data Privat"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setMemberToEdit(m)}
                            className="px-2.5 py-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
                            title="Edit Data & Foto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => setMemberToPrint(m)}
                            className="p-1.5 text-amber-300 bg-stone-900 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 cursor-pointer"
                            title="Cetak PDF KTA"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteMember && (
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus data anggota ${m.name} (${m.id})?`)) {
                                  onDeleteMember(m.id);
                                }
                              }}
                              className="p-1.5 text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-500/30 cursor-pointer"
                              title="Hapus Data Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {m.status === 'Menunggu Verifikasi' && (
                            <button
                              onClick={() => onVerifyMember(m.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-stone-950 bg-gradient-to-r from-amber-300 to-amber-500 rounded-lg hover:brightness-110 cursor-pointer"
                            >
                              Verifikasi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INPUT ANGGOTA MANUAL */}
        {activeTab === 'add' && (
          <form onSubmit={handleManualAddSubmit} className="space-y-4 max-w-2xl mx-auto bg-stone-950 p-6 rounded-2xl border border-amber-500/30">
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold font-serif text-amber-200 uppercase">
                Input Data Anggota Langsung (Admin)
              </h4>
              <p className="text-xs text-stone-400">
                Pendaftaran manual oleh pengurus pusat Jember tanpa melalui antrean verifikasi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300 uppercase">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="Nama beserta gelar"
                  className="w-full px-3.5 py-2 bg-stone-900 border border-amber-500/30 rounded-xl text-xs text-stone-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300 uppercase">NIK *</label>
                <input
                  type="text"
                  required
                  value={manualForm.nik}
                  onChange={(e) => setManualForm({ ...manualForm, nik: e.target.value })}
                  placeholder="16 Digit NIK"
                  className="w-full px-3.5 py-2 bg-stone-900 border border-amber-500/30 rounded-xl text-xs text-stone-100 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300 uppercase">Divisi *</label>
                <select
                  value={manualForm.division}
                  onChange={(e) => setManualForm({ ...manualForm, division: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-stone-900 border border-amber-500/30 rounded-xl text-xs text-stone-100"
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
                <label className="block text-xs font-semibold text-stone-300 uppercase">Status Awal</label>
                <select
                  value={manualForm.status}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-stone-900 border border-amber-500/30 rounded-xl text-xs text-stone-100"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pengurus">Pengurus</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300 uppercase">Wilayah *</label>
                <input
                  type="text"
                  required
                  value={manualForm.region}
                  onChange={(e) => setManualForm({ ...manualForm, region: e.target.value })}
                  placeholder="Contoh: Kantor Pusat Jember"
                  className="w-full px-3.5 py-2 bg-stone-900 border border-amber-500/30 rounded-xl text-xs text-stone-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-300 uppercase">No WhatsApp</label>
                <input
                  type="tel"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  placeholder="+62 812-xxxx-xxxx"
                  className="w-full px-3.5 py-2 bg-stone-900 border border-amber-500/30 rounded-xl text-xs text-stone-100 font-mono"
                />
              </div>
            </div>

          </form>
        )}

        {/* TAB: MASTER DATABASE KENDARAAN ANGGOTA */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            {/* Header Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-400" /> Total Kendaraan
                </span>
                <p className="text-xl font-black text-amber-400 mt-1 font-mono">{vehicles.length}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Terdaftar di Master TSN</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-400" /> Roda 4 (Mobil)
                </span>
                <p className="text-xl font-black text-blue-400 mt-1 font-mono">
                  {vehicles.filter((v) => v.vehicleType === 'Mobil').length}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Armada Komunitas</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" /> Stiker Aktif
                </span>
                <p className="text-xl font-black text-emerald-400 mt-1 font-mono">
                  {vehicles.filter((v) => v.stickerStatus === 'Diterbitkan & Tertempel').length}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Resmi Tertempel</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Dalam Proses Cetak
                </span>
                <p className="text-xl font-black text-amber-300 mt-1 font-mono">
                  {vehicles.filter((v) => v.stickerStatus === 'Dalam Proses Cetak').length}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Antrean Fisik</p>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vehicleSearchQuery}
                    onChange={(e) => setVehicleSearchQuery(e.target.value)}
                    placeholder="Cari plat nomor, ID anggota (35.09-2026-0016), pemilik, merk..."
                    className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={vehicleTypeFilter}
                  onChange={(e) => setVehicleTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">Semua Tipe Kendaraan</option>
                  <option value="Mobil">Mobil (Roda 4)</option>
                  <option value="Motor">Motor (Roda 2)</option>
                  <option value="Truk/Lainnya">Truk / Lainnya</option>
                </select>

                <select
                  value={vehicleStickerFilter}
                  onChange={(e) => setVehicleStickerFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">Semua Status Stiker</option>
                  <option value="Diterbitkan & Tertempel">Tertempel Resmi</option>
                  <option value="Dalam Proses Cetak">Dalam Proses Cetak</option>
                  <option value="Belum Didaftarkan">Belum Didaftarkan</option>
                  <option value="Dicabut">Dicabut</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportVehiclesToExcel(filteredVehicles)}
                  className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Export Data Kendaraan ke Format Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingVehicle(null);
                    setVehicleForm({
                      licensePlate: '',
                      memberId: '35.09-2026-0016',
                      memberName: 'M. Very Ardiyansyah',
                      vehicleType: 'Mobil',
                      brandModel: '',
                      year: '2024',
                      color: '',
                      chassisNumber: '',
                      engineNumber: '',
                      stickerStatus: 'Diterbitkan & Tertempel',
                      stickerNumber: '',
                      notes: '',
                    });
                    setIsAddVehicleOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Daftarkan Kendaraan</span>
                </button>
              </div>
            </div>

            {/* Vehicles Table */}
            <div className="rounded-xl border border-stone-800 overflow-hidden bg-stone-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/90 text-stone-400 font-semibold border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Plat Nomor & Jenis</th>
                      <th className="py-3 px-4">Anggota Pemilik</th>
                      <th className="py-3 px-4">Merk / Model & Warna</th>
                      <th className="py-3 px-4">No. Rangka / Mesin</th>
                      <th className="py-3 px-4">Status Stiker TSN</th>
                      <th className="py-3 px-4 text-center">Aksi Kontrol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80 text-stone-200">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400">
                          <Car className="w-8 h-8 text-stone-600 mx-auto mb-2 opacity-50" />
                          <p className="font-semibold">Tidak ada kendaraan yang cocok dengan filter.</p>
                          <p className="text-[11px] text-stone-400 mt-1">Gunakan tombol &quot;Daftarkan Kendaraan&quot; untuk input baru.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((v) => {
                        const ownerMember = members.find((m) => m.id === v.memberId);
                        return (
                          <tr key={v.id} className="hover:bg-stone-800/40 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="px-2.5 py-1 rounded-md bg-stone-950 border border-stone-700 font-mono font-black text-amber-300 tracking-wider text-xs shadow-inner">
                                  {v.licensePlate}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  v.vehicleType === 'Mobil'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {v.vehicleType}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-stone-100">{v.memberName}</div>
                              <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                                <User className="w-3 h-3" />
                                <span>{v.memberId}</span>
                                {ownerMember && (
                                  <span className="text-[10px] text-stone-400">({ownerMember.position || 'Anggota'})</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-stone-200">
                                {v.brandModel || <span className="text-stone-400 italic">BELUM DIINPUT</span>}
                              </div>
                              <div className="text-[11px] text-stone-400 mt-0.5">
                                Tahun: {v.year || '2024'} • Warna: {v.color || <span className="italic">BELUM DIINPUT</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px]">
                              <div>Rangka: {v.chassisNumber || <span className="text-stone-400 italic font-sans">BELUM DIINPUT</span>}</div>
                              <div className="text-stone-400 mt-0.5">Mesin: {v.engineNumber || <span className="text-stone-400 italic font-sans">BELUM DIINPUT</span>}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <select
                                  value={v.stickerStatus}
                                  onChange={(e) => handleUpdateStickerStatus(v, e.target.value as Vehicle['stickerStatus'])}
                                  className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer ${
                                    v.stickerStatus === 'Diterbitkan & Tertempel'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                      : v.stickerStatus === 'Dalam Proses Cetak'
                                      ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                      : 'bg-stone-900 text-stone-400 border-stone-700'
                                  }`}
                                >
                                  <option value="Diterbitkan & Tertempel">Diterbitkan & Tertempel</option>
                                  <option value="Dalam Proses Cetak">Dalam Proses Cetak</option>
                                  <option value="Belum Didaftarkan">Belum Didaftarkan</option>
                                  <option value="Dicabut">Dicabut</option>
                                </select>
                                {v.stickerNumber && (
                                  <div className="text-[10px] text-amber-400/80 font-mono">
                                    No. Seri: {v.stickerNumber}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingVehicle(v);
                                    setVehicleForm({
                                      licensePlate: v.licensePlate,
                                      memberId: v.memberId,
                                      memberName: v.memberName,
                                      vehicleType: v.vehicleType,
                                      brandModel: v.brandModel === 'BELUM DIINPUT' ? '' : v.brandModel,
                                      year: v.year || '2024',
                                      color: v.color === 'BELUM DIINPUT' ? '' : v.color,
                                      chassisNumber: v.chassisNumber === 'BELUM DIINPUT' ? '' : v.chassisNumber,
                                      engineNumber: v.engineNumber === 'BELUM DIINPUT' ? '' : v.engineNumber,
                                      stickerStatus: v.stickerStatus,
                                      stickerNumber: v.stickerNumber || '',
                                      notes: v.notes || '',
                                    });
                                    setIsAddVehicleOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 transition cursor-pointer"
                                  title="Edit data kendaraan"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVehicleAction(v)}
                                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-900/60 text-rose-300 transition cursor-pointer"
                                  title="Hapus kendaraan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Tambah / Edit Kendaraan */}
            {isAddVehicleOpen && (
              <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                      <Car className="w-5 h-5 text-amber-400" />
                      <span>{editingVehicle ? 'Edit Data Kendaraan Anggota' : 'Daftarkan Kendaraan Baru Anggota TSN'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddVehicleOpen(false)}
                      className="text-stone-400 hover:text-white p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleVehicleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">
                          Plat Nomor Kendaraan <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={vehicleForm.licensePlate}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value.toUpperCase() })}
                          placeholder="Contoh: N 1234 ABC"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-amber-300 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">
                          Jenis Kendaraan
                        </label>
                        <select
                          value={vehicleForm.vehicleType}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value as Vehicle['vehicleType'] })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                        >
                          <option value="Mobil">Mobil (Roda 4)</option>
                          <option value="Motor">Motor (Roda 2)</option>
                          <option value="Truk/Lainnya">Truk / Kendaraan Niaga</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">
                        Hubungkan ke Anggota TSN <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={vehicleForm.memberId}
                        onChange={(e) => {
                          const mId = e.target.value;
                          const found = members.find((m) => m.id === mId);
                          setVehicleForm({
                            ...vehicleForm,
                            memberId: mId,
                            memberName: found ? found.name : vehicleForm.memberName,
                          });
                        }}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400 font-mono"
                      >
                        <option value="">-- Pilih Anggota dari Master Database --</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.id}) - {m.position || 'Anggota'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Merk & Model</label>
                        <input
                          type="text"
                          value={vehicleForm.brandModel}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, brandModel: e.target.value })}
                          placeholder="Contoh: Toyota Avanza"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Tahun Kendaraan</label>
                        <input
                          type="text"
                          value={vehicleForm.year}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                          placeholder="Contoh: 2024"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Warna</label>
                        <input
                          type="text"
                          value={vehicleForm.color}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                          placeholder="Contoh: Hitam Metalik"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">No. Rangka (Opsional)</label>
                        <input
                          type="text"
                          value={vehicleForm.chassisNumber}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, chassisNumber: e.target.value.toUpperCase() })}
                          placeholder="Jika belum ada, ketik BELUM DIINPUT"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400 font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">No. Mesin (Opsional)</label>
                        <input
                          type="text"
                          value={vehicleForm.engineNumber}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, engineNumber: e.target.value.toUpperCase() })}
                          placeholder="Jika belum ada, ketik BELUM DIINPUT"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400 font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Status Stiker TSN</label>
                        <select
                          value={vehicleForm.stickerStatus}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, stickerStatus: e.target.value as Vehicle['stickerStatus'] })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                        >
                          <option value="Diterbitkan & Tertempel">Diterbitkan & Tertempel</option>
                          <option value="Dalam Proses Cetak">Dalam Proses Cetak</option>
                          <option value="Belum Didaftarkan">Belum Didaftarkan</option>
                          <option value="Dicabut">Dicabut</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Nomor Seri Stiker TSN</label>
                        <input
                          type="text"
                          value={vehicleForm.stickerNumber}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, stickerNumber: e.target.value.toUpperCase() })}
                          placeholder="Contoh: TSN-STK-2026-0016"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-amber-300 font-mono focus:outline-none focus:border-amber-400 uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">Catatan Operasional</label>
                      <textarea
                        rows={2}
                        value={vehicleForm.notes}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                        placeholder="Contoh: Kendaraan operasional pendampingan anggota di wilayah Jawa Timur..."
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => setIsAddVehicleOpen(false)}
                        className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold shadow"
                      >
                        {editingVehicle ? 'Perbarui Data Kendaraan' : 'Simpan ke Master Database'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: POSKO PENGADUAN KONSUMEN (LPKTSN) & BANTUAN HUKUM (YLBH CAKRA) */}
        {activeTab === 'legalaid' && (
          <div className="space-y-6">
            {/* Header Box explaining LPKTSN & YLBH CAKRA distinction */}
            <div className="p-4 rounded-xl bg-stone-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-black text-[10px] uppercase">
                    LPKTSN & YLBH CAKRA
                  </span>
                  <h4 className="text-sm font-bold text-amber-300 font-serif">
                    Posko Pengaduan Konsumen & Advokasi Bantuan Hukum
                  </h4>
                </div>
                <p className="text-xs text-stone-400 mt-1 max-w-3xl">
                  <strong>LPKTSN</strong> menjalankan fungsi mediasi sengketa konsumen, perlindungan konsumen, dan fasilitasi penyelesaian masalah. 
                  <strong> YLBH CAKRA</strong> mendampingi perkara advokasi dan bantuan hukum sesuai kewenangan dan dokumen legalitasnya.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs font-mono text-amber-400">
                  Total: {legalAidCases.length} Berkas
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Menunggu Peninjauan
                </span>
                <p className="text-xl font-black text-blue-400 mt-1 font-mono">
                  {legalAidCases.filter((c) => c.status === 'Menunggu Peninjauan').length}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Tahap Klarifikasi
                </span>
                <p className="text-xl font-black text-amber-400 mt-1 font-mono">
                  {legalAidCases.filter((c) => c.status === 'Tahap Klarifikasi').length}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-purple-400" /> Mediasi / Tim Hukum
                </span>
                <p className="text-xl font-black text-purple-400 mt-1 font-mono">
                  {legalAidCases.filter((c) => c.status === 'Mediasi Terjadwal' || c.status === 'Tim Hukum Ditugaskan').length}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Kasus Selesai
                </span>
                <p className="text-xl font-black text-emerald-400 mt-1 font-mono">
                  {legalAidCases.filter((c) => c.status === 'Selesai').length}
                </p>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={legalAidSearch}
                    onChange={(e) => setLegalAidSearch(e.target.value)}
                    placeholder="Cari tiket pengaduan, nama pemohon, atau pihak terlapor..."
                    className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={legalAidStatusFilter}
                  onChange={(e) => setLegalAidStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">Semua Status Kasus</option>
                  <option value="Menunggu Peninjauan">Menunggu Peninjauan</option>
                  <option value="Tahap Klarifikasi">Tahap Klarifikasi</option>
                  <option value="Tim Hukum Ditugaskan">Tim Hukum Ditugaskan</option>
                  <option value="Mediasi Terjadwal">Mediasi Terjadwal</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Cases Table */}
            <div className="rounded-xl border border-stone-800 overflow-hidden bg-stone-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/90 text-stone-400 font-semibold border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">No. Tiket & Tanggal</th>
                      <th className="py-3 px-4">Entitas & Kategori</th>
                      <th className="py-3 px-4">Pemohon / Kontak</th>
                      <th className="py-3 px-4">Pihak Terlapor / Sengketa</th>
                      <th className="py-3 px-4">Status & Progres</th>
                      <th className="py-3 px-4 text-center">Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80 text-stone-200">
                    {filteredLegalCases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400">
                          <Scale className="w-8 h-8 text-stone-600 mx-auto mb-2 opacity-50" />
                          <p className="font-semibold">Tidak ada pengaduan atau perkara yang ditemukan.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLegalCases.map((c) => {
                        return (
                          <tr key={c.ticketNumber} className="hover:bg-stone-800/40 transition">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-amber-300 text-xs">{c.ticketNumber}</span>
                              <div className="text-[11px] text-stone-400 mt-0.5">{c.submittedAt || '2026-08-01'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (c.category || '').includes('Konsumen')
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {(c.category || '').includes('Konsumen') ? 'LPKTSN (Konsumen)' : 'YLBH Cakra (Advokasi)'}
                              </span>
                              <div className="text-[11px] text-stone-300 mt-1 font-semibold line-clamp-1">{c.category}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-stone-100">{c.applicantName}</div>
                              <div className="text-[11px] text-stone-400 font-mono mt-0.5">{c.phone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-stone-300 font-semibold">{c.reportedParty || 'Pihak Terlapor / Lembaga'}</div>
                              <div className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{c.description}</div>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={c.status}
                                onChange={(e) => handleCaseStatusChange(c.ticketNumber, e.target.value as LegalAidCase['status'])}
                                className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer ${
                                  c.status === 'Selesai'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                    : c.status === 'Mediasi Terjadwal' || c.status === 'Tim Hukum Ditugaskan'
                                    ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                                    : c.status === 'Tahap Klarifikasi'
                                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                    : 'bg-blue-950 text-blue-300 border-blue-500/40'
                                }`}
                              >
                                <option value="Menunggu Peninjauan">Menunggu Peninjauan</option>
                                <option value="Tahap Klarifikasi">Tahap Klarifikasi</option>
                                <option value="Tim Hukum Ditugaskan">Tim Hukum Ditugaskan</option>
                                <option value="Mediasi Terjadwal">Mediasi Terjadwal</option>
                                <option value="Selesai">Selesai</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <a
                                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(c.applicantName)},%20kami%20dari%20Tim%20Advokasi%20TSN%20mengenai%20tiket%20${c.ticketNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 text-[10px] font-bold transition"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STRUKTUR IDENTITAS 4 ENTITAS, MASTER KONTAK & PENGURUS RESMI */}
        {activeTab === 'organization' && (
          <div className="space-y-6">
            {/* Visual Hierarchy Tree */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-amber-500/40 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                    MASTER SPECIFICATION RESMI
                  </span>
                  <h3 className="text-base font-bold text-stone-100 font-serif mt-1">
                    Struktur Hubungan 4 Entitas Organisasi
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Hubungan terikat secara legal dan fungsional, tidak saling tumpang tindih, dan masing-masing memiliki batas kewenangan jelas.
                  </p>
                </div>
              </div>

              {/* Hierarchy Diagram Cards */}
              <div className="mt-6 flex flex-col items-center space-y-4">
                {/* 1. Badan Hukum */}
                <div className="w-full max-w-2xl p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-stone-900 border-2 border-amber-400 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-black uppercase">
                      1. BADAN HUKUM / BADAN NAUNGAN KOMUNITAS
                    </span>
                    <span className="font-mono text-xs text-amber-300 font-bold">
                      AHU-0001353.AH.01.07.TAHUN 2026
                    </span>
                  </div>
                  <h4 className="text-base font-black text-amber-300 font-serif mt-2 tracking-wide">
                    SENYAP NUSANTARA JAYA
                  </h4>
                  <p className="text-xs text-stone-300 mt-1">
                    Badan hukum resmi yang menaungi Komunitas Team Senyap Nusantara (TSN). Nomor AHU ditetapkan resmi dalam sistem dan dilarang diubah tanpa SK resmi.
                  </p>
                </div>

                <div className="flex items-center justify-center text-amber-400">
                  <ArrowRight className="w-6 h-6 rotate-90 animate-bounce" />
                </div>

                {/* 2. Komunitas */}
                <div className="w-full max-w-2xl p-4 rounded-xl bg-stone-900 border border-stone-700 shadow">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 text-[10px] font-black uppercase">
                      2. KOMUNITAS
                    </span>
                    <span className="text-xs text-stone-400 font-semibold">
                      Naungan: Senyap Nusantara Jaya
                    </span>
                  </div>
                  <h4 className="text-base font-black text-stone-100 font-serif mt-2 tracking-wide">
                    TEAM SENYAP NUSANTARA (TSN)
                  </h4>
                  <p className="text-xs text-stone-300 mt-1">
                    Komunitas yang mewadahi anggota dengan sistem keanggotaan terintegrasi (KTA portrait borderless ukuran KTP) dan Master Database Kendaraan.
                  </p>
                </div>

                <div className="flex items-center justify-center text-amber-400">
                  <ArrowRight className="w-6 h-6 rotate-90" />
                </div>

                {/* 3. LPKTSN */}
                <div className="w-full max-w-2xl p-4 rounded-xl bg-stone-900 border border-stone-700 shadow">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-black uppercase">
                      3. LEMBAGA PERLINDUNGAN KONSUMEN
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      TDLPK: 510/024/TDLPK/Disperindag/2024
                    </span>
                  </div>
                  <h4 className="text-base font-black text-blue-300 font-serif mt-2 tracking-wide">
                    LEMBAGA PERLINDUNGAN KONSUMEN TEAM SENYAP NUSANTARA (LPKTSN)
                  </h4>
                  <p className="text-xs text-stone-300 mt-1">
                    Lembaga perlindungan konsumen yang memberikan fungsi perlindungan, advokasi konsumen, mediasi, fasilitasi masalah finansial/leasing, dan edukasi konsumen. Memiliki record legalitas tersendiri (bukan nomor AHU induk secara otomatis).
                  </p>
                </div>

                <div className="flex items-center justify-center text-amber-400">
                  <ArrowRight className="w-6 h-6 rotate-90" />
                </div>

                {/* 4. YLBH CAKRA */}
                <div className="w-full max-w-2xl p-4 rounded-xl bg-stone-900 border border-stone-700 shadow">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-black uppercase">
                      4. BANTUAN HUKUM / ADVOKASI
                    </span>
                    <span className="text-xs text-stone-400">
                      Alamat Operasional Terpadu TSN
                    </span>
                  </div>
                  <h4 className="text-base font-black text-purple-300 font-serif mt-2 tracking-wide">
                    YLBH CAKRA
                  </h4>
                  <p className="text-xs text-stone-300 mt-1">
                    Entitas bantuan hukum dan advokasi yang memberikan layanan litigasi & non-litigasi bagi anggota dan masyarakat. Menggunakan alamat kantor operasional dan nomor kontak yang sama dengan Team Senyap Nusantara (alamat dalam SK disimpan terpisah sebagai Alamat Legalitas).
                  </p>
                </div>
              </div>
            </div>

            {/* Master Contact Operasional Card */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-stone-100 font-serif uppercase tracking-wide">
                  Master Contact Operasional (TSN, LPKTSN, YLBH CAKRA)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-black uppercase">
                    1. ALAMAT KANTOR OPERASIONAL
                  </span>
                  <p className="font-semibold text-stone-200 mt-2">
                    {siteConfig?.address || 'Jl. Raya Nusantara No. 88, Jawa Timur'}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Digunakan bersama untuk operasional harian TSN, LPKTSN, dan YLBH Cakra.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] font-black uppercase">
                    2. ALAMAT DALAM DOKUMEN LEGALITAS (SK)
                  </span>
                  <p className="font-semibold text-stone-300 mt-2">
                    Tercatat dalam Berkas SK Pendirian Notaris & Kemenkumham
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Hanya untuk arsip legalitas formal, tidak ditampilkan sebagai alamat publik harian.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-black uppercase">
                    3. KONTAK RESMI OPERASIONAL
                  </span>
                  <p className="font-mono font-bold text-emerald-400 mt-2">
                    Telepon / WA: {siteConfig?.whatsappNumber || siteConfig?.phoneHotline || '+62 822-2999-9999'}
                  </p>
                  <p className="font-mono text-stone-400 mt-1">
                    Email: {siteConfig?.email || 'sekretariat@senyapnusantara.id'}
                  </p>
                </div>
              </div>
            </div>

            {/* Struktur Pengurus Resmi yang Ditetapkan Admin */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-stone-100 font-serif uppercase tracking-wide">
                    Struktur Kepengurusan Resmi Organisasi
                  </h4>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-stone-800 text-amber-300 font-mono">
                  Sesuai Master Specification (Ditetapkan Admin)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Ketua */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/40">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">KETUA UMUM</span>
                  <div className="text-sm font-black text-stone-100 font-serif mt-1">ACHMAT ATARI</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Penanggung Jawab Utama Komunitas</div>
                </div>

                {/* Sekretaris */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">SEKRETARIS</span>
                  <div className="text-sm font-black text-stone-100 font-serif mt-1">WENDA</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Administrasi & Kesekretariatan</div>
                </div>

                {/* Bendahara */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">BENDAHARA</span>
                  <div className="text-sm font-black text-stone-100 font-serif mt-1">IBRAHIM ASEGAF</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Keuangan & Akuntabilitas Kas</div>
                </div>

                {/* Pengawas */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">PENGAWAS</span>
                  <div className="text-sm font-black text-stone-100 font-serif mt-1">SAMSUL ANAM</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Pengawasan Kinerja & Kode Etik</div>
                </div>

                {/* Humas */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">HUMAS</span>
                  <div className="text-sm font-black text-stone-100 font-serif mt-1">BENY</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Hubungan Masyarakat & Publikasi</div>
                </div>
              </div>

              {/* Tim Hukum & Advokasi */}
              <div className="mt-4 pt-4 border-t border-stone-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                  <Scale className="w-4 h-4" /> Tim Hukum & Advokasi (YLBH Cakra / TSN)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="font-bold text-stone-200">LUKMANUL HAKIM, S.H., M.H.</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Advokat & Konsultan Hukum</div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="font-bold text-stone-200">SUYITNO RAHMAN, S.H., M.H.</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Advokat & Konsultan Hukum</div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="font-bold text-stone-200">ARIEF SUPRAYITNO, S.H., M.H.</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Advokat & Konsultan Hukum</div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="font-bold text-stone-200">KHULAIFI, S.H., M.Kn.</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Ahli Hukum & Notariat</div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Aturan Master Sistem:</strong> Seluruh susunan nama pengurus di atas telah dikunci sesuai Master Specification. Dilarang menambah, menghapus, atau mengubah nama pengurus kecuali melalui penetapan langsung oleh Administrator Utama.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CASHBOOK & FINANCIAL INPUT */}
        {activeTab === 'cashbook' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-stone-950 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-emerald-300 font-serif uppercase flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Input Kas Keluar & Masuk LPKSM TSN</span>
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Input transaksi keuangan organisasi untuk dilaporkan secara transparan kepada seluruh anggota.
                </p>
              </div>

              {showTrxSuccess && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Transaksi Berhasil Disimpan!</span>
                </div>
              )}
            </div>

            {/* Form Input Transaksi Baru */}
            <form onSubmit={handleTrxSubmit} className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
              <div className="text-xs font-bold text-amber-200 font-serif uppercase flex items-center gap-2 pb-2 border-b border-stone-800">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Formulir Transaksi Kas Baru</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Jenis Transaksi */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase">Jenis Transaksi *</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-900 rounded-xl border border-stone-800">
                    <button
                      type="button"
                      onClick={() => setTrxForm({ ...trxForm, type: 'pemasukan', category: 'Iuran Bulanan Anggota' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        trxForm.type === 'pemasukan'
                          ? 'bg-emerald-500 text-stone-950 font-extrabold shadow'
                          : 'text-stone-400 hover:text-emerald-300'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Pemasukan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrxForm({ ...trxForm, type: 'pengeluaran', category: 'Bantuan Sosial & Sembako' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        trxForm.type === 'pengeluaran'
                          ? 'bg-rose-500 text-white font-extrabold shadow'
                          : 'text-stone-400 hover:text-rose-300'
                      }`}
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Pengeluaran</span>
                    </button>
                  </div>
                </div>

                {/* Tanggal */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={trxForm.date}
                    onChange={(e) => setTrxForm({ ...trxForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-mono"
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase">Kategori *</label>
                  <select
                    value={trxForm.category}
                    onChange={(e) => setTrxForm({ ...trxForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100"
                  >
                    {trxForm.type === 'pemasukan' ? (
                      <>
                        <option value="Iuran Bulanan Anggota">Iuran Bulanan Anggota</option>
                        <option value="Donasi & Hamba Allah">Donasi & Hamba Allah</option>
                        <option value="Sponsor Kegiatan Baksos">Sponsor Kegiatan Baksos</option>
                        <option value="Kas Masuk Pusat">Kas Masuk Pusat</option>
                        <option value="Lain-Lain">Lain-Lain (Pemasukan)</option>
                      </>
                    ) : (
                      <>
                        <option value="Bantuan Sosial & Sembako">Bantuan Sosial & Sembako</option>
                        <option value="Pendampingan Hukum LPKSM">Pendampingan Hukum LPKSM</option>
                        <option value="Operasional Kantor Pusat">Operasional Kantor Pusat</option>
                        <option value="Cetak KTA & Perlengkapan">Cetak KTA & Perlengkapan</option>
                        <option value="Santunan Anak Yatim">Santunan Anak Yatim</option>
                        <option value="Lain-Lain">Lain-Lain (Pengeluaran)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Jumlah Nominal */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase">Jumlah Rp *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="Contoh: 150000"
                    value={trxForm.amount}
                    onChange={(e) => setTrxForm({ ...trxForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Keterangan */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase">Keterangan / Rincian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Penerimaan iuran kas 5 anggota DPC Jember"
                    value={trxForm.description}
                    onChange={(e) => setTrxForm({ ...trxForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100"
                  />
                </div>

                {/* Dicatat Oleh */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase">Verifikator Bendahara</label>
                  <input
                    type="text"
                    value={trxForm.recordedBy}
                    onChange={(e) => setTrxForm({ ...trxForm, recordedBy: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-300 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 rounded-xl hover:brightness-110 shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Simpan Transaksi Kas Ke Sistem</span>
              </button>
            </form>

            {/* Daftar Transaksi Terbaru Dalam Admin Panel */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-stone-300 uppercase font-serif">
                  Riwayat Transaksi Kas Terdaftar ({transactions.length})
                </h5>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportFinancialToExcel(transactions, siteConfig)}
                    className="px-3 py-1.5 bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-stone-900 border border-amber-500/40 text-amber-300 hover:bg-stone-800 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cetak PDF</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 text-stone-400 uppercase font-bold text-[10px] border-b border-stone-800">
                    <tr>
                      <th className="p-3">ID / Tanggal</th>
                      <th className="p-3">Jenis</th>
                      <th className="p-3">Kategori & Keterangan</th>
                      <th className="p-3">Nominal (Rp)</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-sans">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-stone-900/50">
                        <td className="p-3 font-mono text-stone-400">
                          <div className="text-stone-200 font-bold text-[11px]">{t.id}</div>
                          <div className="text-[10px]">{t.date}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.type === 'pemasukan'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {t.type === 'pemasukan' ? '+ MASUK' : '- KELUAR'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-stone-200">{t.category}</div>
                          <div className="text-[11px] text-stone-400">{t.description}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-xs">
                          <span className={t.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}>
                            {t.type === 'pemasukan' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {onDeleteTransaction && (
                            <button
                              onClick={() => onDeleteTransaction(t.id)}
                              className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WEBSITE CONFIG & LOGO EDITOR */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Pengaturan Konten Website & Logo Organisasi</span>
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Ubah logo terbaru, teks halaman utama, informasi kontak, dan data penting website TSN secara langsung.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {showConfigSuccess && (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Konten Website Berhasil Diperbarui!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Perubahan</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: UPLOAD LOGO */}
            <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
              <h5 className="text-xs font-bold text-amber-300 uppercase font-serif pb-2 border-b border-stone-800 flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-400" />
                <span>1. Logo Resmi Website & Organisasi</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Preview Box */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-stone-900 rounded-xl border border-amber-500/30 text-center space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Preview Logo Saat Ini</span>
                  {configForm.logoUrl ? (
                    <img
                      src={configForm.logoUrl}
                      alt="Logo Uploaded Preview"
                      className="w-24 h-24 object-contain rounded-xl border border-amber-500/40 p-2 bg-stone-950 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl border border-amber-500/40 bg-stone-950 flex items-center justify-center text-amber-400 font-black font-serif text-2xl">
                      TSN
                    </div>
                  )}
                  <span className="text-[10px] text-amber-300 font-mono">
                    {configForm.logoUrl ? 'Gambar Custom Terpasang' : 'Logo Default SVG Vector'}
                  </span>
                </div>

                {/* File Upload & URL Inputs */}
                <div className="sm:col-span-8 space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-300 uppercase">Upload File Logo Baru (PNG / JPG / SVG)</label>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition-all">
                        <Upload className="w-4 h-4" />
                        <span>Pilih File Dari Komputer/HP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {configForm.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setConfigForm({ ...configForm, logoUrl: '' })}
                          className="px-3 py-2 bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                          Reset ke Logo Default
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">Maksimal 5MB. Format disarankan PNG transparan atau SVG.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-300 uppercase">Atau Masukkan URL Gambar Logo Online</label>
                    <input
                      type="text"
                      placeholder="https://domain.com/logo.png"
                      value={configForm.logoUrl || ''}
                      onChange={(e) => setConfigForm({ ...configForm, logoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: IDENTITAS ORGANISASI */}
            <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
              <h5 className="text-xs font-bold text-amber-300 uppercase font-serif pb-2 border-b border-stone-800">
                2. Identitas & Nama Resmi Organisasi
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Nama Utama Organisasi</label>
                  <input
                    type="text"
                    required
                    value={configForm.orgName}
                    onChange={(e) => setConfigForm({ ...configForm, orgName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Sub-Judul / Nama LPKSM</label>
                  <input
                    type="text"
                    required
                    value={configForm.subTitle}
                    onChange={(e) => setConfigForm({ ...configForm, subTitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: HERO SECTION (HALAMAN UTAMA) */}
            <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
              <h5 className="text-xs font-bold text-amber-300 uppercase font-serif pb-2 border-b border-stone-800">
                3. Teks Banner Utama (Hero Section)
              </h5>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Judul Utama Banner (Headline)</label>
                  <input
                    type="text"
                    value={configForm.heroHeadline}
                    onChange={(e) => setConfigForm({ ...configForm, heroHeadline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-serif font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Slogan / Tagline Sub-Judul</label>
                  <input
                    type="text"
                    value={configForm.heroTagline}
                    onChange={(e) => setConfigForm({ ...configForm, heroTagline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-serif"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Deskripsi Singkat Banner</label>
                  <textarea
                    rows={2}
                    value={configForm.heroDescription}
                    onChange={(e) => setConfigForm({ ...configForm, heroDescription: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: TENTANG KAMI */}
            <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
              <h5 className="text-xs font-bold text-amber-300 uppercase font-serif pb-2 border-b border-stone-800">
                4. Profil & Halaman "Tentang Kami"
              </h5>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Judul Section Profil</label>
                  <input
                    type="text"
                    value={configForm.aboutTitle}
                    onChange={(e) => setConfigForm({ ...configForm, aboutTitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Paragraf Penjelasan Profil</label>
                  <textarea
                    rows={3}
                    value={configForm.aboutText1}
                    onChange={(e) => setConfigForm({ ...configForm, aboutText1: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: KONTAK & ALAMAT */}
            <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
              <h5 className="text-xs font-bold text-amber-300 uppercase font-serif pb-2 border-b border-stone-800">
                5. Kontak Hotline & Alamat Sekretariat
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Telepon / Hotline</label>
                  <input
                    type="text"
                    value={configForm.phoneHotline}
                    onChange={(e) => setConfigForm({ ...configForm, phoneHotline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Nomor WhatsApp (Format: 628xxx)</label>
                  <input
                    type="text"
                    value={configForm.whatsappNumber}
                    onChange={(e) => setConfigForm({ ...configForm, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-emerald-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Email Resmi</label>
                  <input
                    type="email"
                    value={configForm.email}
                    onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Alamat Kantor Sekretariat</label>
                  <input
                    type="text"
                    value={configForm.address}
                    onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: STATISTIK HIGHLIGHTS */}
            <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
              <h5 className="text-xs font-bold text-amber-300 uppercase font-serif pb-2 border-b border-stone-800">
                6. Angka Statistik Beranda
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Statistik Anggota</label>
                  <input
                    type="text"
                    value={configForm.statMembersCount}
                    onChange={(e) => setConfigForm({ ...configForm, statMembersCount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-300 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Statistik Provinsi</label>
                  <input
                    type="text"
                    value={configForm.statProvincesCount}
                    onChange={(e) => setConfigForm({ ...configForm, statProvincesCount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-300 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Statistik Pro-Bono</label>
                  <input
                    type="text"
                    value={configForm.statProBonoRate}
                    onChange={(e) => setConfigForm({ ...configForm, statProBonoRate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-300 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 7: LEGALITAS & IZIN RESMI LPKSM */}
            <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-800">
                <h5 className="text-xs font-bold text-amber-300 uppercase font-serif flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>7. Legalitas & Izin Operasional Negara (Permendag RI No. 35/2021)</span>
                </h5>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
                  Sesuai UU No. 8/1999 & PP No. 59/2001
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">Nomor TDLPK Resmi</label>
                  <input
                    type="text"
                    value={configForm.tdlpkNumber || '510/024/TDLPK/DISPERINDAG/2024'}
                    onChange={(e) => setConfigForm({ ...configForm, tdlpkNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-200 font-mono font-bold"
                  />
                  <p className="text-[10px] text-stone-500">Tanda Daftar LPKSM Disperindag</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">SK Kemenkumham RI</label>
                  <input
                    type="text"
                    value={configForm.kemenkumhamNumber || 'AHU-0004521.AH.01.07.TAHUN 2024'}
                    onChange={(e) => setConfigForm({ ...configForm, kemenkumhamNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-200 font-mono font-bold"
                  />
                  <p className="text-[10px] text-stone-500">Legalitas Badan Hukum AHU</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase">NPWP Badan LPKSM</label>
                  <input
                    type="text"
                    value={configForm.npwpNumber || '14.285.901.4-626.000'}
                    onChange={(e) => setConfigForm({ ...configForm, npwpNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-200 font-mono font-bold"
                  />
                  <p className="text-[10px] text-stone-500">Nomor Pokok Wajib Pajak</p>
                </div>
              </div>
            </div>

            {/* SECTION 8: KEAMANAN SISTEM & FIREBASE AUTHENTICATION */}
            <div className="p-5 rounded-xl bg-stone-950 border border-amber-500/40 space-y-4 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-800">
                <h5 className="text-xs font-bold text-amber-300 uppercase font-serif flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>8. Keamanan Akun Pengurus & Firebase Authentication</span>
                </h5>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  RBAC Firestore Rules Active
                </span>
              </div>

              <p className="text-xs text-stone-300">
                Kredensial PIN frontend telah sepenuhnya digantikan oleh <strong>Firebase Authentication & Role-Based Access Control (RBAC)</strong>. Data pribadi anggota, kas, dan berkas dilindungi di level database cloud.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-stone-400 block uppercase">
                    Administrator Terautentikasi Saat Ini:
                  </span>
                  <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>{auth.currentUser?.email || adminName || 'ptsynergyconsultinggroup@gmail.com'}</span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    UID: {auth.currentUser?.uid || 'Cloud Identity Verified'}
                  </p>
                </div>

                <div className="space-y-2 flex flex-col justify-center sm:items-end">
                  <button
                    type="button"
                    onClick={async () => {
                      const targetEmail = auth.currentUser?.email || 'ptsynergyconsultinggroup@gmail.com';
                      try {
                        await sendAdminPasswordReset(targetEmail);
                        setResetEmailStatus(`Link reset sandi dikirim ke ${targetEmail}`);
                        setTimeout(() => setResetEmailStatus(null), 6000);
                      } catch (err: any) {
                        setResetEmailStatus(`Gagal kirim reset: ${err.message}`);
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 rounded-xl cursor-pointer transition flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kirim Email Reset Sandi</span>
                  </button>
                  {resetEmailStatus && (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {resetEmailStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-stone-900/40 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
                <div className="font-semibold text-stone-300">Pedoman Penambahan Admin:</div>
                <p>
                  Untuk menambahkan pengurus baru atau mendelegasikan wewenang cabang, buat akun pengguna di Firebase Authentication, lalu cantumkan UID/email di koleksi <code className="text-amber-300 font-mono">admins</code> atau tetapkan custom claims <code className="text-amber-300 font-mono">admin: true</code>.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan Website</span>
            </button>
          </form>
        )}

        {/* TAB 5.5: KELOLA BERITA & INFORMASI PUBLIK */}
        {activeTab === 'news' && (
          <div className="space-y-5">
            {/* Status Toast */}
            {newsToast && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{newsToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewsToast(null)}
                  className="p-1 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Sub-view: FORM TULIS / EDIT BERITA */}
            {newsFormMode !== 'list' ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setNewsFormMode('list')}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>← Kembali ke Daftar Berita</span>
                    </button>
                    <h4 className="text-lg font-bold font-serif text-amber-200">
                      {newsFormMode === 'create'
                        ? 'Tulis & Terbitkan Berita Baru'
                        : `Edit Naskah Berita: ${newsFormData.title}`}
                    </h4>
                    <p className="text-xs text-stone-400">
                      Berita yang dipublikasikan akan langsung muncul secara realtime di halaman depan situs web TSN.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNewsFormMode('list')}
                    className="px-3.5 py-1.5 text-xs text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-xl cursor-pointer self-start sm:self-auto"
                  >
                    Batal
                  </button>
                </div>

                <form onSubmit={handleNewsFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column: Metadata & Photo */}
                    <div className="lg:col-span-6 space-y-4">
                      <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-stone-300 uppercase">
                            Judul Berita <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Tim Senyap Nusantara Salurkan Bantuan Logistik..."
                            value={newsFormData.title}
                            onChange={(e) =>
                              setNewsFormData({ ...newsFormData, title: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 font-bold focus:border-amber-400 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-stone-300 uppercase">
                              Kategori Berita <span className="text-amber-400">*</span>
                            </label>
                            <select
                              value={newsFormData.category}
                              onChange={(e) =>
                                setNewsFormData({ ...newsFormData, category: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-300 font-bold focus:border-amber-400 outline-none"
                            >
                              {newsCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-stone-300 uppercase">
                              Penulis / Redaksi
                            </label>
                            <input
                              type="text"
                              value={newsFormData.author}
                              onChange={(e) =>
                                setNewsFormData({ ...newsFormData, author: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-200 focus:border-amber-400 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-stone-300 uppercase">
                            Tanggal Publikasi
                          </label>
                          <input
                            type="text"
                            value={newsFormData.date}
                            onChange={(e) =>
                              setNewsFormData({ ...newsFormData, date: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-200 focus:border-amber-400 outline-none"
                          />
                        </div>

                        {/* Image Selection */}
                        <div className="space-y-2 pt-2 border-t border-stone-800">
                          <label className="block text-xs font-semibold text-stone-300 uppercase">
                            Foto Sampul Berita (Cover)
                          </label>
                          
                          <input
                            type="text"
                            placeholder="URL Gambar (https://...)"
                            value={newsFormData.imageUrl}
                            onChange={(e) =>
                              setNewsFormData({ ...newsFormData, imageUrl: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-200 font-mono focus:border-amber-400 outline-none"
                          />

                          {/* Quick Photo Presets */}
                          <div className="space-y-1">
                            <span className="text-[11px] text-stone-400 block">Preset Foto Cepat TSN:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {newsImagePresets.map((preset) => (
                                <button
                                  type="button"
                                  key={preset.label}
                                  onClick={() =>
                                    setNewsFormData({ ...newsFormData, imageUrl: preset.url })
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                                    newsFormData.imageUrl === preset.url
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* File Upload Option */}
                          <div className="flex items-center gap-3 pt-1">
                            <label className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition">
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                              <span>Upload File Gambar</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewsImageUpload}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[10px] text-stone-500">Maks. 3MB (JPG/PNG/WEBP)</span>
                          </div>

                          {/* Image Preview Thumbnail */}
                          {newsFormData.imageUrl && (
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-700 bg-stone-900 mt-2">
                              <img
                                src={newsFormData.imageUrl}
                                alt="Pratinjau Sampul Berita"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-300 font-bold uppercase">
                                {newsFormData.category}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Summary & Full Content */}
                    <div className="lg:col-span-6 space-y-4">
                      <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-4 h-full flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="block text-xs font-semibold text-stone-300 uppercase">
                                Ringkasan Singkat (Lead / Abstrak) <span className="text-amber-400">*</span>
                              </label>
                              <span className="text-[10px] text-stone-500">
                                2 - 3 kalimat pembuka yang memikat
                              </span>
                            </div>
                            <textarea
                              required
                              rows={3}
                              placeholder="Tuliskan ringkasan singkat intisari berita yang akan muncul pada kartu halaman utama..."
                              value={newsFormData.summary}
                              onChange={(e) =>
                                setNewsFormData({ ...newsFormData, summary: e.target.value })
                              }
                              className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 leading-relaxed focus:border-amber-400 outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="block text-xs font-semibold text-stone-300 uppercase">
                                Isi Lengkap Berita (Naskah Penuh) <span className="text-amber-400">*</span>
                              </label>
                              <span className="text-[10px] text-stone-500">
                                Paragraf lengkap artikel berita
                              </span>
                            </div>
                            <textarea
                              required
                              rows={9}
                              placeholder="Tuliskan naskah lengkap berita di sini (kronologi, keterangan saksi/pengurus, dasar hukum, kutipan resmi, dst)..."
                              value={newsFormData.content}
                              onChange={(e) =>
                                setNewsFormData({ ...newsFormData, content: e.target.value })
                              }
                              className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-100 leading-relaxed focus:border-amber-400 outline-none font-sans"
                            />
                          </div>
                        </div>

                        {/* Submit Action Box */}
                        <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setNewsFormMode('list')}
                            className="px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200 transition cursor-pointer"
                          >
                            Batal
                          </button>

                          <button
                            type="submit"
                            disabled={isSubmittingNews}
                            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            <span>
                              {isSubmittingNews
                                ? 'Menyimpan ke Cloud...'
                                : newsFormMode === 'create'
                                ? 'Publikasikan Berita Sekarang'
                                : 'Simpan Pembaruan Naskah'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              /* Sub-view: DAFTAR BERITA PUBLIK */
              <div className="space-y-4">
                {/* Action & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950 p-4 rounded-xl border border-stone-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[220px]">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
                      <input
                        type="text"
                        placeholder="Cari judul, ringkasan, atau isi..."
                        value={newsSearchQuery}
                        onChange={(e) => setNewsSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-200 focus:border-amber-400 outline-none"
                      />
                    </div>

                    <select
                      value={newsCategoryFilter}
                      onChange={(e) => setNewsCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-300 font-semibold focus:border-amber-400 outline-none cursor-pointer"
                    >
                      <option value="all">Semua Kategori ({news.length})</option>
                      {newsCategories.map((cat) => {
                        const count = news.filter((n) => n.category === cat).length;
                        return (
                          <option key={cat} value={cat}>
                            {cat} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    onClick={handleStartCreateNews}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Tulis Berita Baru</span>
                  </button>
                </div>

                {/* News Articles Grid */}
                {filteredNewsList.length === 0 ? (
                  <div className="p-12 text-center rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                    <Newspaper className="w-10 h-10 text-stone-600 mx-auto" />
                    <div className="text-sm font-semibold text-stone-300">
                      Tidak ada berita yang sesuai dengan kriteria pencarian
                    </div>
                    <p className="text-xs text-stone-500">
                      Ubah kata kunci pencarian atau klik "+ Tulis Berita Baru" untuk menerbitkan artikel pertama.
                    </p>
                    <button
                      onClick={handleStartCreateNews}
                      className="px-4 py-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition cursor-pointer"
                    >
                      Mulai Tulis Berita
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNewsList.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="flex gap-3">
                          <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-stone-900 border border-stone-800 relative">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-amber-300 uppercase">
                              {item.category}
                            </div>
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[10px] text-stone-400">
                              <span>{item.date}</span>
                              <span>•</span>
                              <span className="truncate">{item.author}</span>
                            </div>

                            <h5 className="text-xs sm:text-sm font-bold font-serif text-amber-100 line-clamp-2 leading-snug">
                              {item.title}
                            </h5>

                            <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons row */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                          <span className="text-[10px] font-mono text-stone-500 truncate max-w-[120px]">
                            ID: {item.id}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedNewsPreview(item)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-stone-300 bg-stone-900 border border-stone-700 hover:text-amber-300 transition cursor-pointer flex items-center gap-1"
                              title="Pratinjau Berita"
                            >
                              <Eye className="w-3 h-3 text-amber-400" />
                              <span>Lihat</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartEditNews(item)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1"
                              title="Edit Naskah Berita"
                            >
                              <Edit3 className="w-3 h-3 text-amber-400" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteNewsItem(item)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition cursor-pointer flex items-center gap-1"
                              title="Hapus Berita"
                            >
                              <Trash2 className="w-3 h-3 text-rose-400" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Pratinjau Berita (Preview) */}
        {selectedNewsPreview && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/50 rounded-2xl p-6 space-y-5 max-h-[88vh] overflow-y-auto text-stone-100 shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedNewsPreview(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase">
                  {selectedNewsPreview.category}
                </span>
                <h3 className="text-xl font-bold font-serif text-amber-200">
                  {selectedNewsPreview.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-stone-400 pt-1">
                  <span>{selectedNewsPreview.date}</span>
                  <span>•</span>
                  <span>Oleh: {selectedNewsPreview.author}</span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden aspect-video bg-stone-950 border border-stone-800">
                <img
                  src={selectedNewsPreview.imageUrl}
                  alt={selectedNewsPreview.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-stone-300 leading-relaxed">
                <p className="font-semibold text-amber-100">{selectedNewsPreview.summary}</p>
                <p className="whitespace-pre-line">{selectedNewsPreview.content}</p>
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedNewsPreview;
                    setSelectedNewsPreview(null);
                    handleStartEditNews(toEdit);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xl hover:bg-amber-500/25 cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Naskah Ini</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNewsPreview(null)}
                  className="px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 to-amber-500 rounded-xl hover:brightness-110 cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OFFICIAL DOCUMENTS & CORRESPONDENCE */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
                <button
                  onClick={() => setDocSubTab('create')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    docSubTab === 'create'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Surat / Terbitkan</span>
                </button>
                <button
                  onClick={() => setDocSubTab('archive')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    docSubTab === 'archive'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Arsip Surat Keluar ({issuedDocs.length})</span>
                </button>
              </div>

              {docSubTab === 'create' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadAdminPDF}
                    disabled={isGeneratingPDF}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    title="Unduh langsung sebagai berkas PDF resmi"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingPDF ? 'Memproses PDF...' : 'Unduh PDF'}</span>
                  </button>
                  <button
                    onClick={handlePrintAll}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-500/50 rounded-xl hover:bg-amber-900 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                    title="Cetak Seluruh Dokumen Legal Sekaligus (Print All Queue)"
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Print All ({selectedBatchTypes.length})</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-100 bg-stone-900 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Cetak (Printer)</span>
                  </button>
                  <button
                    onClick={handleSaveDocToArchive}
                    className="px-4 py-2 text-xs font-bold text-amber-300 bg-stone-950 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    <span>Simpan Ke Arsip</span>
                  </button>
                </div>
              )}
            </div>

            {/* CREATE SURAT FORM & PREVIEW */}
            {docSubTab === 'create' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block print:w-full print:p-0 print:m-0">
                
                {/* Form controls */}
                <div className="lg:col-span-4 space-y-4 bg-stone-950 p-4 rounded-xl border border-stone-800 h-fit print:hidden">
                  <div className="text-xs font-bold font-serif text-amber-300 uppercase tracking-wider border-b border-stone-800 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Parameter Dokumen Resmi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDocViewMode('single')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          docViewMode === 'single' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                        }`}
                      >
                        Single
                      </button>
                      <button
                        onClick={() => setDocViewMode('batch')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          docViewMode === 'batch' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                        }`}
                      >
                        Batch ({selectedBatchTypes.length})
                      </button>
                    </div>
                  </div>

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
                    {currentDocMember && (
                      <div className="p-2.5 bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 rounded-xl space-y-2 text-xs relative overflow-hidden">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={currentDocMember.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={currentDocMember.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/80 shadow shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-amber-200 truncate uppercase text-[11px]">
                                {currentDocMember.name}
                              </h4>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold shrink-0">
                                {currentDocMember.status || 'Aktif'}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-400 font-mono">
                              ID: <strong className="text-amber-300">{currentDocMember.id}</strong>
                            </p>
                            <p className="text-[10px] text-stone-300 font-medium truncate">
                              {currentDocMember.division}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => applyMemberTemplateData(currentDocMember, selectedDocType)}
                          className="w-full py-1 px-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Isi Ulang Data Ke Template</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Auto Populate Toast Notification */}
                  {autoPopulateToast && (
                    <div className="p-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{autoPopulateToast}</span>
                    </div>
                  )}

                  {docViewMode === 'single' ? (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-300 uppercase">
                        Jenis Dokumen
                      </label>
                      <select
                        value={selectedDocType}
                        onChange={(e) => {
                          const type = e.target.value as DocumentType;
                          setSelectedDocType(type);
                          applyMemberTemplateData(currentDocMember, type);
                        }}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-amber-100 font-semibold focus:outline-none focus:border-amber-400"
                      >
                        <option value="surat_tugas">Surat Perintah Tugas Advokasi (SPT)</option>
                        <option value="surat_pengangkatan">Surat Keputusan (SK) Pengangkatan Jabatan</option>
                        <option value="surat_keterangan">Surat Keterangan Keanggotaan Aktif LPKSM</option>
                        <option value="surat_kuasa">Surat Kuasa Pendampingan Hukum</option>
                        <option value="surat_klarifikasi">Surat Permohonan Klarifikasi Usaha / Konsumen</option>
                        <option value="surat_mediasi">Surat Undangan Mediasi Sengketa Konsumen</option>
                        <option value="surat_bap_mediasi">Berita Acara Mediasi Sengketa (Acta van Dading)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2 bg-stone-900/80 p-3 rounded-lg border border-amber-500/30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300 uppercase flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          Antrean Batch Print:
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-300 uppercase">
                      Tujuan / Penerima / Lokasi Tugas
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

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
                      <span>Sertakan Tanda Tangan Digital Pengurus</span>
                    </label>
                  </div>

                  {/* Download PDF & Print All Buttons */}
                  <div className="space-y-2 pt-2 border-t border-stone-800">
                    <button
                      onClick={handleDownloadAdminPDF}
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

                {/* Live A4 Preview Canvas Container */}
                <div className="lg:col-span-8 print:col-span-12 print:w-full print:p-0 print:m-0 overflow-x-auto flex flex-col items-center gap-6">
                  {docViewMode === 'batch' && (
                    <div className="w-[210mm] p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-3 print:hidden">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong>Mode Cetak Batch Aktif:</strong> {selectedBatchTypes.length} dokumen legal resmi digabungkan dalam antrean cetak.
                        </span>
                      </div>
                      <button
                        onClick={handlePrintAll}
                        className="px-3 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg text-[11px] shrink-0 hover:bg-amber-400 cursor-pointer"
                      >
                        Cetak Semua
                      </button>
                    </div>
                  )}

                  {(docViewMode === 'single' ? [selectedDocType] : selectedBatchTypes).map((docTypeToRender, index, arr) => {
                    const docRefNum = docViewMode === 'batch' ? getRefNoForType(docTypeToRender) : docNumber;
                    const showPageBreak = docViewMode === 'batch' && index < arr.length - 1;

                    return (
                      <div
                        key={docTypeToRender}
                        id={`admin-doc-canvas-${docTypeToRender}`}
                        className={`w-[210mm] min-h-[297mm] bg-white text-stone-900 p-8 sm:p-10 border border-stone-300 shadow-2xl relative font-serif text-sm leading-relaxed official-document-canvas ${
                          showPageBreak ? 'print-page-break mb-8' : ''
                        }`}
                      >
                        {/* Kop Surat */}
                        <div className="pb-3 border-b-4 border-double border-stone-900 flex items-center justify-between gap-4">
                          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                            <TSNLogo size="md" showText={false} />
                          </div>
                          <div className="text-center flex-1 space-y-0.5">
                            <h1 className="text-sm sm:text-base font-black tracking-wide uppercase text-stone-950">
                              LEMBAGA PERLINDUNGAN KONSUMEN SWADAYA MASYARAKAT
                            </h1>
                            <h2 className="text-base sm:text-lg font-black tracking-widest uppercase text-amber-900 font-serif">
                              "SENYAP NUSANTARA JAYA"
                            </h2>
                            <p className="text-[10px] font-sans font-semibold text-stone-700 leading-tight">
                              SK KEMENKUMHAM RI: {siteConfig.kemenkumhamNumber || 'AHU-0004521.AH.01.07.TAHUN 2024'} • TDLPK: {siteConfig.tdlpkNumber || '510/024/TDLPK/DISPERINDAG/2024'} • NPWP: {siteConfig.npwpNumber || '14.285.901.4-626.000'}<br />
                              Sekretariat Pusat: {siteConfig.address || 'Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kab. Jember, Jawa Timur 68161'}
                            </p>
                            <p className="text-[10px] font-mono text-stone-600">
                              Hotline WA: {siteConfig.whatsappNumber || '0823-3262-6916'} • Email: {siteConfig.email || 'sekretariat@senyapnusantara.or.id'}
                            </p>
                          </div>
                          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                            <TSNLogo size="md" showText={false} />
                          </div>
                        </div>

                        {/* Title */}
                        <div className="my-5 text-center space-y-1">
                          <h3 className="text-base font-black uppercase underline tracking-wider text-stone-900">
                            {getDocTitle(docTypeToRender)}
                          </h3>
                          <p className="text-xs font-mono font-bold text-stone-700">{docRefNum}</p>
                        </div>

                        {/* Content */}
                        <div className="space-y-4 my-4 text-justify text-xs font-sans text-stone-800 leading-relaxed">
                          <div className="p-2 bg-stone-50 border-l-2 border-amber-600 text-[11px] font-sans text-stone-700">
                            <strong>Dasar Hukum Organsisasi:</strong> UU No. 8 Tahun 1999 tentang Perlindungan Konsumen, PP No. 59 Tahun 2001 tentang LPKSM, serta AD/ART LPKSM Senyap Nusantara Jaya.
                          </div>

                          {docTypeToRender === 'surat_tugas' && (
                            <>
                              <p>
                                Pengurus Pusat LPKSM Senyap Nusantara Jaya dengan ini memberikan Perintah Tugas Resmi kepada Anggota / Petugas Advokasi berikut:
                              </p>
                              <div className="my-2 p-3 bg-stone-50 border border-stone-300 rounded font-sans space-y-1 text-xs">
                                <div className="grid grid-cols-12 gap-1">
                                  <span className="col-span-4 font-bold text-stone-700">Nama Lengkap</span>
                                  <span className="col-span-8 font-bold text-stone-950 uppercase">: {currentDocMember.name}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-1">
                                  <span className="col-span-4 text-stone-600">ID Anggota / KTA</span>
                                  <span className="col-span-8 font-mono font-bold text-stone-900">: {currentDocMember.id}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-1">
                                  <span className="col-span-4 text-stone-600">Jabatan Organisasi</span>
                                  <span className="col-span-8 text-stone-800">: {currentDocMember.membershipType || currentDocMember.division}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-1">
                                  <span className="col-span-4 text-stone-600">Wilayah Penugasan</span>
                                  <span className="col-span-8 text-stone-800">: {destination}</span>
                                </div>
                              </div>
                              <p className="font-bold text-stone-900 uppercase underline mt-3">
                                RINCIAN PERINTH TUGAS & WEWENANG:
                              </p>
                              <div className="pl-3 border-l-2 border-amber-600 bg-amber-50/40 p-2 text-stone-900 font-sans italic rounded">
                                "{taskDescription}"
                              </div>
                            </>
                          )}

                          {docTypeToRender !== 'surat_tugas' && (
                            <>
                              <p>
                                Pengurus Pusat LPKSM Senyap Nusantara Jaya menerbitkan dokumen ini untuk menindaklanjuti permohonan/tugas advokasi perlindungan konsumen atas nama <strong>{currentDocMember.name}</strong> (ID: {currentDocMember.id}).
                              </p>
                              <div className="my-2 p-3 bg-stone-50 border border-stone-300 rounded font-sans space-y-1 text-xs">
                                <div className="grid grid-cols-12 gap-1">
                                  <span className="col-span-4 font-bold text-stone-700">Penerima / Tujuan</span>
                                  <span className="col-span-8 font-bold text-stone-950">: {recipientName || destination}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-1">
                                  <span className="col-span-4 text-stone-600">Subjek Advokasi</span>
                                  <span className="col-span-8 text-stone-900">: {caseSubject}</span>
                                </div>
                              </div>
                              <div className="pl-3 border-l-2 border-amber-600 bg-amber-50/40 p-2 text-stone-900 italic rounded">
                                "{taskDescription}"
                              </div>
                            </>
                          )}

                          <p className="pt-2">
                            Demikian Surat Resmi ini diterbitkan secara sah oleh LPKSM Senyap Nusantara Jaya untuk digunakan sebagaimana mestinya. Seluruh instansi dan pihak terkait dimohon memberikan bantuan serta aksesibilitas yang diperlukan.
                          </p>
                        </div>

                        {/* Signature */}
                        <div className="pt-8 mt-6 border-t border-stone-200 print-avoid-break">
                          <div className="flex justify-between items-end gap-2">
                            <div className="text-center space-y-10">
                              <div className="text-xs text-stone-600 font-sans">
                                Petugas / Yang Menerima Tugas,
                              </div>
                              <div className="relative inline-block min-w-[140px]">
                                {includeSignature && currentDocMember.signatureUrl ? (
                                  <img
                                    src={currentDocMember.signatureUrl}
                                    alt="Tanda Tangan"
                                    className="h-12 mx-auto object-contain"
                                  />
                                ) : (
                                  <div className="h-12" />
                                )}
                                <div className="font-bold underline uppercase text-xs text-stone-900 font-sans">
                                  {currentDocMember.name}
                                </div>
                                <div className="text-[10px] text-stone-500 font-mono">
                                  ID: {currentDocMember.id}
                                </div>
                              </div>
                            </div>

                            {includeStamp && (
                              <div className="text-center">
                                <div className="w-24 h-24 border-2 border-dashed border-emerald-700/70 rounded-full flex flex-col items-center justify-center p-1 text-emerald-900 text-[8px] font-bold mx-auto leading-tight bg-emerald-50/40 rotate-[-12deg]">
                                  <ShieldCheck className="w-6 h-6 text-emerald-700 mb-0.5" />
                                  <span>STEMPEL RESMI</span>
                                  <span>LPKSM SENYAP</span>
                                  <span>NUSANTARA JAYA</span>
                                </div>
                              </div>
                            )}

                            <div className="text-center space-y-10">
                              <div className="text-xs text-stone-600 font-sans">
                                Jember, {issueDate}<br />
                                <strong>Pengurus Pusat LPKSM Senyap</strong>
                              </div>
                              <div>
                                <div className="font-bold underline uppercase text-xs text-stone-900 font-sans">
                                  IBRAHIM
                                </div>
                                <div className="text-[10px] text-stone-500 font-sans">
                                  Bendahara / Pengurus Pusat
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              /* Archive Table */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase font-serif text-amber-200">
                    Daftar Surat & Dokumen Resmi Terarsip ({issuedDocs.length})
                  </h4>
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
        )}

        {/* TAB 7: AUDIT TRAIL & SYSTEM LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-stone-950 border border-amber-500/30">
              <div>
                <h4 className="text-sm font-bold text-amber-200 font-serif uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Audit Trail & Log Aktivitas Pengurus</span>
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Rekam jejak setiap tindakan verifikasi anggota, transaksi keuangan, dan perubahan sistem tercatat permanen di Firestore.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                    const dlAnchor = document.createElement('a');
                    dlAnchor.setAttribute("href", dataStr);
                    dlAnchor.setAttribute("download", `tsn-audit-trail-${new Date().toISOString().split('T')[0]}.json`);
                    dlAnchor.click();
                  }}
                  className="px-3 py-2 text-xs font-semibold text-stone-200 bg-stone-900 border border-stone-700 hover:border-amber-400 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-400 font-semibold mr-1">Filter Kategori:</span>
              {[
                { id: 'all', label: 'Semua Log' },
                { id: 'MEMBER', label: 'Keanggotaan' },
                { id: 'TRX', label: 'Transaksi Kas' },
                { id: 'CONFIG', label: 'Pengaturan Web' },
                { id: 'AUTH', label: 'Autentikasi' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAuditFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    auditFilter === f.id
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <span className="ml-auto text-stone-500 text-[11px] font-mono">
                Menampilkan {
                  auditLogs.filter((l) => auditFilter === 'all' || l.action.includes(auditFilter)).length
                } peristiwa
              </span>
            </div>

            {/* Audit Trail List */}
            <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-900 text-amber-300 font-serif border-b border-stone-800">
                  <tr>
                    <th className="p-3">Waktu (WIB)</th>
                    <th className="p-3">Aksi / Operasi</th>
                    <th className="p-3">Target ID</th>
                    <th className="p-3">Keterangan Aktivitas</th>
                    <th className="p-3">Operator Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80 text-stone-300">
                  {auditLogs
                    .filter((l) => auditFilter === 'all' || l.action.includes(auditFilter))
                    .map((log) => {
                      const isMember = log.action.includes('MEMBER');
                      const isTrx = log.action.includes('TRX');
                      const isConfig = log.action.includes('CONFIG');

                      return (
                        <tr key={log.id} className="hover:bg-stone-900/50 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                isMember
                                  ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                                  : isTrx
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                  : isConfig
                                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-300 whitespace-nowrap">
                            {log.target}
                          </td>
                          <td className="p-3 text-stone-200">
                            {log.details}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                            {log.performedBy}
                          </td>
                        </tr>
                      );
                    })}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-500 text-xs">
                        Belum ada riwayat audit trail yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* PDF Modal if admin triggers KTA print */}
      <PrintableKTAModal
        member={memberToPrint}
        isOpen={!!memberToPrint}
        onClose={() => setMemberToPrint(null)}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={!!memberToEdit}
        member={memberToEdit}
        onClose={() => setMemberToEdit(null)}
        onSave={(updated) => {
          onUpdateMember(updated);
          setMemberToEdit(null);
        }}
        isAdmin={true}
      />

      {/* KTP Document Inspection Modal */}
      {viewingKtpMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl text-stone-100">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Pemeriksaan Dokumen KTP & Subkoleksi Privat</span>
                </div>
                <div className="text-sm font-bold text-stone-100 font-serif">
                  {viewingKtpMember.name} ({viewingKtpMember.id})
                </div>
              </div>
              <button
                onClick={() => setViewingKtpMember(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingPrivateMember && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2 animate-pulse">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Memuat data privat terenkripsi dari subkoleksi members/{viewingKtpMember.id}/private/data...</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div>
                  <span className="text-stone-400 text-[11px] block">NIK Asli (Dekripsi):</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{viewingKtpMember.nik || 'Tidak diisi'}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">Wilayah / Domisili:</span>
                  <span className="font-semibold text-stone-200">{viewingKtpMember.region}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">No. WhatsApp / Telepon:</span>
                  <span className="font-mono text-stone-300">{viewingKtpMember.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">Email Anggota:</span>
                  <span className="font-mono text-stone-300">{viewingKtpMember.email || '-'}</span>
                </div>
                {viewingKtpMember.address && (
                  <div className="col-span-2">
                    <span className="text-stone-400 text-[11px] block">Alamat Lengkap KTP:</span>
                    <span className="text-stone-200">{viewingKtpMember.address}</span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-stone-400 text-[11px] block">Tingkat Keamanan Data:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Terisolasi di Subkoleksi Privat & Kepatuhan UU PDP No. 27/2022</span>
                  </span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border-2 border-amber-500/40 bg-stone-950 max-h-[46vh] flex items-center justify-center p-2">
                {viewingKtpMember.ktpUrl ? (
                  <img
                    src={viewingKtpMember.ktpUrl}
                    alt="Foto Dokumen KTP"
                    className="max-h-[42vh] w-auto object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="py-10 text-center text-stone-400 text-xs">
                    Foto fisik KTP belum diunggah atau disimpan terpisah
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
              <span className="text-[10px] text-stone-400">
                Pastikan nama dan NIK pada dokumen sesuai sebelum memberikan persetujuan.
              </span>
              <div className="flex items-center gap-2">
                {viewingKtpMember.status === 'Menunggu Verifikasi' && (
                  <button
                    onClick={() => {
                      onVerifyMember(viewingKtpMember.id);
                      setViewingKtpMember(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui & Terbitkan KTA</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingKtpMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-300 bg-stone-800 rounded-xl hover:bg-stone-700 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
