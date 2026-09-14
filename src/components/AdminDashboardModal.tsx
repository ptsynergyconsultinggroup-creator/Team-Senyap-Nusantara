import React, { useState, useEffect } from 'react';
import { Member, Transaction, SiteConfig } from '../types';
import { ShieldCheck, UserCheck, Clock, Search, X, CheckCircle2, XCircle, FileText, Printer, Filter, UserPlus, ShieldAlert, Sparkles, AlertCircle, Edit3, Trash2, Wallet, PlusCircle, ArrowUpRight, ArrowDownRight, DollarSign, Settings, Upload, Image, Save, Check, FileSpreadsheet, FileCheck, History, Plus, Building, Send, Layers, CheckSquare, Square, Download, CreditCard, Eye, LogOut, KeyRound, Lock } from 'lucide-react';
import { PrintableKTAModal } from './PrintableKTAModal';
import { EditMemberModal } from './EditMemberModal';
import { TSNLogo } from './TSNLogo';
import { initialSiteConfig } from '../data/mockData';
import { exportFinancialToExcel } from '../utils/exportExcel';
import { downloadElementAsPDF, downloadBatchElementsAsPDF } from '../utils/pdfExport';

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
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'add' | 'cashbook' | 'settings' | 'documents'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [memberToPrint, setMemberToPrint] = useState<Member | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [viewingKtpMember, setViewingKtpMember] = useState<Member | null>(null);

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

  // New Manual Member Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    nik: '',
    division: 'Kemanusiaan' as Member['division'],
    region: 'Kantor Pusat Jember',
    phone: '',
    email: '',
    status: 'Aktif' as Member['status'],
    membershipType: 'Relawan Lapangan' as any,
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

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newMember: Member = {
      id: `TSN-${randomNum}`,
      name: manualForm.name.toUpperCase(),
      nik: manualForm.nik,
      division: manualForm.division,
      membershipType: manualForm.membershipType,
      region: manualForm.region,
      joinDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: manualForm.status,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      phone: manualForm.phone,
      email: manualForm.email,
      verifiedBy: 'IBRAHIM (Bendahara Pusat)',
      verifiedAt: new Date().toLocaleDateString('id-ID'),
    };

    onAddMember(newMember);
    setActiveTab('all');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-amber-500/40 rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto text-stone-100 shadow-2xl my-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-amber-500/20 pb-4 pr-8 sm:pr-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Panel Verifikasi & Database Pengurus</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
              Dashboard Administrasi Keanggotaan TSN
            </h3>
            <p className="text-xs text-stone-400">
              Kelola pendaftaran anggota baru, statistik progres keanggotaan, serta verifikasi KTA resmi LPKSM.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{adminName || 'IBRAHIM (Bendahara Pusat)'}</span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/40 rounded-xl hover:bg-rose-900/50 transition cursor-pointer flex items-center gap-1.5"
                title="Keluar dari Sesi Panel Admin"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Keluar Sesi</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-950 border border-stone-800"
              title="Tutup Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progres Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/20 space-y-1">
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

          <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/20 space-y-1">
            <div className="text-[11px] font-bold uppercase text-amber-400">Kantor Pusat Jember</div>
            <div className="text-xs font-bold text-stone-200 truncate">Verifikator: IBRAHIM</div>
            <div className="text-[10px] text-amber-300/80 font-mono">Bendahara Pusat</div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-amber-500/20 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'bg-stone-950 text-stone-300 border border-stone-800 hover:text-amber-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pendaftaran Baru ({pendingMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'bg-stone-950 text-stone-300 border border-stone-800 hover:text-amber-300'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Daftar Seluruh Anggota ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'add'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'bg-stone-950 text-stone-300 border border-stone-800 hover:text-amber-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Input Anggota Manual</span>
          </button>

          <button
            onClick={() => setActiveTab('cashbook')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'cashbook'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-extrabold'
                : 'bg-stone-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Input Kas & Transaksi ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                : 'bg-stone-950 text-amber-300 border border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Pengaturan Website & Logo</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'bg-stone-950 text-amber-300 border border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Persuratan & Dokumen Resmi ({issuedDocs.length})</span>
          </button>
        </div>

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
                      {m.ktpUrl ? (
                        <button
                          onClick={() => setViewingKtpMember(m)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/50 rounded-lg hover:bg-emerald-900/60 cursor-pointer flex items-center gap-1.5 shadow"
                          title="Periksa Foto KTP Asli"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Periksa KTP</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] text-stone-500 bg-stone-900 border border-stone-800 rounded-lg">
                          Tanpa KTP
                        </span>
                      )}

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

            <button
              type="submit"
              className="w-full py-3 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 to-amber-500 rounded-xl hover:brightness-110 shadow"
            >
              Simpan & Terbitkan KTA Langsung
            </button>
          </form>
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

            {/* SECTION 8: KREDENSIAL KEAMANAN & PIN ADMIN */}
            <div className="p-5 rounded-xl bg-stone-950 border border-amber-500/40 space-y-4 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-800">
                <h5 className="text-xs font-bold text-amber-300 uppercase font-serif flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>8. Kredensial Keamanan & PIN Sandi Panel Admin</span>
                </h5>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                  Proteksi Kantor Pusat Jember
                </span>
              </div>

              <p className="text-xs text-stone-300">
                Kredensial ini digunakan untuk mengunci akses Panel Pengurus. Hanya yang mengetahui username & PIN ini yang dapat memverifikasi anggota, mengedit data, mengelola kas, dan mencetak dokumen resmi berstempel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Username Pengurus</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm.adminUsername || 'admin'}
                    onChange={(e) => setConfigForm({ ...configForm, adminUsername: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-stone-500">Standar: "admin" atau "ibrahim"</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone-300 uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>PIN / Sandi Keamanan Pengurus</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm.adminPin || 'tsn2024'}
                    onChange={(e) => setConfigForm({ ...configForm, adminPin: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-stone-500">Standar: "tsn2024" (Dapat diubah kapan saja)</p>
                </div>
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
                  <span>Pemeriksaan Dokumen KTP Asli</span>
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

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div>
                  <span className="text-stone-400 text-[11px] block">NIK Terdaftar:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{viewingKtpMember.nik || 'Tidak diisi'}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">Wilayah / Domisili:</span>
                  <span className="font-semibold text-stone-200">{viewingKtpMember.region}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">No. WhatsApp:</span>
                  <span className="font-mono text-stone-300">{viewingKtpMember.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">Status Dokumen:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Tersimpan di Cloud TSN</span>
                  </span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border-2 border-amber-500/40 bg-stone-950 max-h-[50vh] flex items-center justify-center p-2">
                {viewingKtpMember.ktpUrl ? (
                  <img
                    src={viewingKtpMember.ktpUrl}
                    alt="Foto Dokumen KTP"
                    className="max-h-[46vh] w-auto object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    Foto KTP tidak tersedia
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
              <span className="text-[10px] text-stone-400">
                Pastikan nama dan NIK pada foto KTP sesuai dengan data registrasi.
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
                    <span>Setujui & Verifikasi</span>
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
