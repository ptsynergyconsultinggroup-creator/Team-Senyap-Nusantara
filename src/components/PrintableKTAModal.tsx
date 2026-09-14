import React, { useState } from 'react';
import { Member } from '../types';
import { TSNLogo } from './TSNLogo';
import { downloadElementAsPDF } from '../utils/pdfExport';
import { Printer, X, ShieldCheck, CheckCircle2, Download, Sparkles, Share2, Check, Eye, Layout, FileText, AlertCircle, ZoomIn, ZoomOut, Scissors, Info } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface PrintableKTAModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableKTAModal: React.FC<PrintableKTAModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'paper' | 'cards'>('paper');
  const [paperOrientation, setPaperOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen || !member) return null;

  const verificationUrl = `${window.location.origin}?verify=${member.id}`;

  const handleShare = async () => {
    const shareData = {
      title: `KTA LPKSM TSN - ${member.name}`,
      text: `Kartu Tanda Anggota Resmi LPKSM Senyap Nusantara Jaya atas nama ${member.name} (ID: ${member.id}). Verifikasi keabsahan KTA secara instant melalui tautan resmi berikut:`,
      url: verificationUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate high-resolution PNG image of KTA card using Canvas
  const handleDownloadPNG = async (side: 'front' | 'back') => {
    setIsGeneratingImage(true);
    try {
      const canvas = document.createElement('canvas');
      // ISO 7810 300 DPI high resolution canvas: 1008px x 636px (Ratio 1.585)
      const width = 1008;
      const height = 636;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Metallic Dark Gradient
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.2);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.6, '#09090b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Background Micro Guilloche Grid Pattern
      ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
      for (let x = 0; x < width; x += 16) {
        for (let y = 0; y < height; y += 16) {
          ctx.fillRect(x, y, 2, 2);
        }
      }

      // 3. Gold Metallic Outer & Inner Borders
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 10;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, width - 52, height - 52);

      if (side === 'front') {
        // === FRONT SIDE CANVAS DRAWING ===
        
        // Header Divider
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 130);
        ctx.lineTo(width - 40, 130);
        ctx.stroke();

        // Header Text
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px Georgia, serif';
        ctx.fillText('KARTU TANDA ANGGOTA RESMI', 120, 62);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText('LPKSM SENYAP NUSANTARA JAYA', 120, 90);

        ctx.fillStyle = '#a8a29e';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('Jl. Lumajang - Jember, Kebon, Tutul, Balung, Jember 68161', 120, 112);

        // Status Badge (Top Right)
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(width - 200, 48, 160, 36);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(width - 200, 48, 160, 36);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`✓ ${member.status.toUpperCase()}`, width - 120, 71);
        ctx.textAlign = 'left';

        // Member Photo Box (Left Column)
        const photoX = 50;
        const photoY = 155;
        const photoW = 210;
        const photoH = 280;

        ctx.fillStyle = '#18181b';
        ctx.fillRect(photoX, photoY, photoW, photoH);

        // Gold Photo Border
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoW, photoH);

        // Member Photo Image
        const photo = new Image();
        photo.crossOrigin = 'anonymous';
        photo.src = member.photoUrl;

        await new Promise((resolve) => {
          photo.onload = resolve;
          photo.onerror = resolve;
        });

        if (photo.complete && photo.naturalWidth !== 0) {
          ctx.drawImage(photo, photoX + 4, photoY + 4, photoW - 8, photoH - 8);
        } else {
          ctx.fillStyle = '#d97706';
          ctx.font = 'bold 16px Arial, sans-serif';
          ctx.fillText('FOTO KTA', photoX + 60, photoY + 140);
        }

        // ORIGINAL Hologram Tag on Photo
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(photoX + photoW - 75, photoY + photoH - 25, 70, 20);
        ctx.fillStyle = '#09090b';
        ctx.font = 'bold 10px Arial, sans-serif';
        ctx.fillText('★ ORIGINAL', photoX + photoW - 70, photoY + photoH - 11);

        // ID Code below photo
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`ID: ${member.id}`, photoX + (photoW / 2), photoY + photoH + 28);
        ctx.textAlign = 'left';

        // Member Details Grid (Right Column)
        const detailX = 290;

        // Nama
        ctx.fillStyle = '#d97706';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('NAMA LENGKAP', detailX, 170);

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 26px Georgia, serif';
        ctx.fillText(member.name.toUpperCase(), detailX, 205);

        // Grid Details
        ctx.fillStyle = '#d97706';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('NIK (NO. INDUK)', detailX, 250);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(member.nik || '3509111201950001', detailX, 275);

        ctx.fillStyle = '#d97706';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('JABATAN', detailX + 320, 250);
        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText((member.membershipType || member.division).toUpperCase(), detailX + 320, 275);

        ctx.fillStyle = '#d97706';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('WILAYAH TUGAS', detailX, 320);
        ctx.fillStyle = '#e7e5e4';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText(member.region.toUpperCase(), detailX, 345);

        ctx.fillStyle = '#d97706';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('MASA TERBIT', detailX + 320, 320);
        ctx.fillStyle = '#e7e5e4';
        ctx.font = '18px monospace';
        ctx.fillText(member.joinDate, detailX + 320, 345);

        // Bottom Divider
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 510);
        ctx.lineTo(width - 40, 510);
        ctx.stroke();

        // Footer Brand
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px Georgia, serif';
        ctx.fillText('TEAM SENYAP NUSANTARA', 40, 550);

        ctx.fillStyle = '#fef3c7';
        ctx.font = '13px Arial, sans-serif';
        ctx.fillText('Kantor Pusat Jember • Hotline WA: 0823-3262-6916', 40, 575);

        // QR Code Drawing
        const qrCanvasElement = document.getElementById(`printable-qr-canvas-${member.id}`) as HTMLCanvasElement;
        if (qrCanvasElement) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(width - 145, 495, 105, 105);
          ctx.drawImage(qrCanvasElement, width - 140, 500, 95, 95);
        }

      } else {
        // === BACK SIDE CANVAS DRAWING ===
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('KETENTUAN KARTU TANDA ANGGOTA (KTA)', width / 2, 75);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('LPKSM SENYAP NUSANTARA JAYA', width / 2, 110);

        // Divider
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 140);
        ctx.lineTo(width - 80, 140);
        ctx.stroke();

        // Notice Box
        ctx.fillStyle = '#18181b';
        ctx.fillRect(80, 170, width - 160, 260);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 170, width - 160, 260);

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'italic 18px Georgia, serif';
        ctx.fillText('"Kartu ini adalah identitas resmi anggota LPKSM Senyap Nusantara Jaya yang terdaftar secara sah', width / 2, 220);
        ctx.fillText('sesuai UU No. 8 Tahun 1999 tentang Perlindungan Konsumen."', width / 2, 250);

        ctx.fillStyle = '#e7e5e4';
        ctx.font = '15px Arial, sans-serif';
        ctx.fillText('1. Pemegang kartu berwenang mendampingi konsumen & kegiatan kemanusiaan.', width / 2, 310);
        ctx.fillText('2. Dilarang menyalahgunakan KTA ini untuk tindakan yang melanggar hukum.', width / 2, 345);
        ctx.fillText('3. Jika menemukan kartu ini, mohon kembalikan ke Sekretariat Kantor Pusat.', width / 2, 380);

        // Footer Divider
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 465);
        ctx.lineTo(width - 80, 465);
        ctx.stroke();

        // Footer Office Details
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('KANTOR PUSAT SEKRETARIAT JEMBER', width / 2, 510);

        ctx.fillStyle = '#fef3c7';
        ctx.font = '16px Georgia, serif';
        ctx.fillText('Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kab. Jember, Jawa Timur 68161', width / 2, 545);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('HOTLINE / WHATSAPP: 0823-3262-6916', width / 2, 580);

        ctx.textAlign = 'left';
      }

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `KTA_TSN_${member.id}_${side.toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const el =
        document.getElementById('kta-print-paper-sheet') ||
        document.getElementById('kta-cards-dual-preview');
      if (el) {
        const cleanName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
        await downloadElementAsPDF(
          el,
          `KTA_${cleanName}_${member.id}.pdf`,
          previewMode === 'paper' ? paperOrientation : 'landscape'
        );
      } else {
        alert('Gagal menemukan area pratinjau KTA untuk diunduh.');
      }
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Gagal mengunduh PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div className="print-modal-box relative w-full max-w-4xl bg-stone-900 border border-amber-500/40 rounded-2xl p-4 sm:p-6 space-y-5 text-stone-100 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:w-full my-auto">
        
        {/* Top Header & Toolbar - Hidden on Print */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-amber-500/20 pb-4 gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shrink-0">
              <Eye className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Simulasi Layout Kertas Cetak A4 / PVC Card</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-200">
                Pratinjau Cetak KTA Presisi Tinggi
              </h3>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0 disabled:opacity-50"
              title="Unduh Lembar KTA langsung sebagai dokumen PDF"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Unduh PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-100 bg-stone-900 border border-amber-500/40 rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
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

        {/* Hidden QRCodeCanvas for Canvas PNG Image Generator */}
        <div className="hidden">
          <QRCodeCanvas
            id={`printable-qr-canvas-${member.id}`}
            value={verificationUrl}
            size={200}
            level="H"
            marginSize={1}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        {/* Interactive Print Preview Control Switcher - Hidden on Print */}
        <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/30 space-y-3 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setPreviewMode('paper')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewMode === 'paper'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Simulasi Lembar Kertas A4</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('cards')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewMode === 'cards'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Mode Kartu Tunggal</span>
              </button>
            </div>

            {/* Paper Controls (When in Paper Mode) */}
            {previewMode === 'paper' && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Orientation Switcher */}
                <button
                  type="button"
                  onClick={() => setPaperOrientation(paperOrientation === 'portrait' ? 'landscape' : 'portrait')}
                  className="px-3 py-1.5 text-xs font-bold text-stone-300 bg-stone-900 border border-stone-800 rounded-lg hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Posisi Kertas: {paperOrientation === 'portrait' ? 'Tegak (Portrait)' : 'Mendatar (Landscape)'}</span>
                </button>

                {/* Crop Marks Toggle */}
                <button
                  type="button"
                  onClick={() => setShowCropMarks(!showCropMarks)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
                    showCropMarks
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-stone-900 text-stone-400 border-stone-800'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Garis Potong (Crop Marks): {showCropMarks ? 'ON' : 'OFF'}</span>
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setZoomScale(Math.max(75, zoomScale - 15))}
                    className="p-1 text-stone-400 hover:text-amber-300 cursor-pointer"
                    title="Perkecil Tampilan"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-amber-300 px-1.5 font-bold">{zoomScale}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomScale(Math.min(125, zoomScale + 15))}
                    className="p-1 text-stone-400 hover:text-amber-300 cursor-pointer"
                    title="Perbesar Tampilan"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick PNG Downloads & Print Guidance Callout */}
          <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Standard KTP/SIM ISO 7810: <strong>85.6 mm × 53.98 mm</strong> (300 DPI High Definition)</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isGeneratingImage}
                onClick={() => handleDownloadPNG('front')}
                className="px-3 py-1 bg-stone-900 border border-amber-500/40 text-amber-200 hover:bg-amber-500/20 text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>PNG Depan</span>
              </button>
              <button
                type="button"
                disabled={isGeneratingImage}
                onClick={() => handleDownloadPNG('back')}
                className="px-3 py-1 bg-stone-900 border border-amber-500/40 text-amber-200 hover:bg-amber-500/20 text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>PNG Belakang</span>
              </button>
            </div>
          </div>
        </div>

        {/* Print Configuration Guidance Alert */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5 print:hidden">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Petunjuk Pengaturan Printer Browser Saat Mengklik "Cetak":</span>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              1. Wajib centang menu <strong className="text-amber-300">"Background graphics / Grafik latar belakang"</strong> agar warna metallic dan foto KTA tercetak. <br />
              2. Atur <strong className="text-amber-300">Margins</strong> ke <strong className="text-amber-300">"None / Minimum"</strong> dan Scale/Skala ke <strong className="text-amber-300">"100% / Custom"</strong> untuk hasil presisi KTP asli.
            </p>
          </div>
        </div>

        {/* PRINT PREVIEW DISPLAY CANVAS AREA */}
        <div className="overflow-x-auto py-2 flex justify-center">
          
          {/* OPTION 1: A4 PAPER SHEET PREVIEW SIMULATION */}
          {previewMode === 'paper' ? (
            <div 
              id="kta-print-paper-sheet"
              style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: 'top center' }}
              className={`transition-all duration-200 bg-white text-stone-900 shadow-2xl rounded-sm p-5 sm:p-8 border border-stone-300 mx-auto relative max-w-full ${
                paperOrientation === 'portrait' ? 'w-[210mm] min-h-[297mm]' : 'w-[297mm] min-h-[210mm]'
              } print:w-full print:min-h-0 print:p-0 print:border-none print:shadow-none print:transform-none`}
            >
              {/* Paper Watermark & Ruler Scale Label (Screen Only) */}
              <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase tracking-wider pb-2 border-b border-dashed border-stone-300 print:hidden">
                <span>SIMULASI KERTAS A4 (210 × 297 mm)</span>
                <span>LPKSM SENYAP NUSANTARA JAYA</span>
                <span>300 DPI PRINT READY</span>
              </div>

              {/* Document Header on Printed Sheet */}
              <div className="pt-6 pb-4 mb-6 border-b-2 border-stone-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TSNLogo size="md" showText={false} />
                  <div>
                    <h2 className="text-base font-black font-serif text-stone-900 uppercase tracking-wide">
                      LEMBAR CETAK RESMI KARTU TANDA ANGGOTA (KTA)
                    </h2>
                    <p className="text-xs font-semibold text-amber-800">
                      LPKSM SENYAP NUSANTARA JAYA — SEKRETARIAT PUSAT JEMBER
                    </p>
                    <p className="text-[10px] text-stone-500 font-sans">
                      Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kab. Jember, Jawa Timur 68161
                    </p>
                  </div>
                </div>

                <div className="text-right border-l border-stone-300 pl-4">
                  <div className="text-[10px] text-stone-500 font-mono">ID KTA: <strong className="text-stone-900">{member.id}</strong></div>
                  <div className="text-[10px] text-stone-500 font-mono">TANGGAL: {member.joinDate}</div>
                  <div className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                    ✓ STATUS: {member.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Cards Placement Container on Paper */}
              <div className="my-8 space-y-8">
                <div className="text-center text-xs font-serif font-bold text-stone-600 uppercase tracking-widest border-b border-stone-200 pb-1 print:hidden">
                  — POSISI HASIL CETAK TAMPAK DEPAN DAN BELAKANG —
                </div>

                <div className={`flex ${paperOrientation === 'portrait' ? 'flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6' : 'flex-row justify-center items-center gap-8'} print:flex print:flex-col print:items-center print:gap-6`}>
                  
                  {/* FRONT SIDE CARD ON PAPER */}
                  <div className="relative group p-2">
                    {/* Crop Marks / Garis Potong (4 Corners) */}
                    {showCropMarks && (
                      <>
                        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-stone-900 z-20 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-stone-900 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-stone-900 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-stone-900 z-20 pointer-events-none" />
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-stone-400 tracking-wider print:hidden">
                          TAMPAK DEPAN (85.6mm)
                        </div>
                      </>
                    )}

                    <div className="ktp-print-card w-[320px] sm:w-[340px] aspect-[85.6/53.98] rounded-xl bg-stone-950 border-[2px] border-amber-500/90 p-2 sm:p-2.5 flex flex-col justify-between relative overflow-hidden shadow-xl bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-950 via-stone-950 to-stone-950 text-white">
                      <div className="absolute inset-1 rounded-lg border border-amber-500/35 pointer-events-none" />
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

                      {/* Header Kop Kartu */}
                      <div className="relative z-10 border-b border-amber-500/40 pb-0.5 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <TSNLogo size="sm" showText={false} />
                          <div className="min-w-0">
                            <div className="text-[7.5px] sm:text-[8.5px] font-black font-serif tracking-wider text-amber-200 uppercase truncate leading-tight">
                              KARTU TANDA ANGGOTA RESMI
                            </div>
                            <div className="text-[6.5px] sm:text-[7.5px] font-black tracking-wider text-amber-300 uppercase leading-none truncate">
                              LPKSM SENYAP NUSANTARA JAYA
                            </div>
                          </div>
                        </div>
                        <div className="px-1 py-0.5 rounded bg-emerald-950 border border-emerald-500/80 text-[6.5px] sm:text-[7px] font-black text-emerald-400 shrink-0">
                          ✓ {member.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Photo & Details */}
                      <div className="relative z-10 grid grid-cols-12 gap-1.5 my-auto items-center">
                        <div className="col-span-4 flex flex-col items-center justify-center">
                          <div className="relative rounded p-0.5 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-800 w-full max-w-[70px] sm:max-w-[78px]">
                            <div className="aspect-[3/4] rounded bg-stone-900 overflow-hidden relative">
                              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute bottom-0.5 right-0.5 bg-amber-500 text-stone-950 font-black text-[4.5px] sm:text-[5px] px-0.5 rounded">ORIGINAL</div>
                            </div>
                          </div>
                          <div className="text-[5.5px] sm:text-[6px] font-mono font-bold text-amber-400 mt-0.5 uppercase truncate max-w-full">
                            ID: {member.id}
                          </div>
                        </div>

                        <div className="col-span-8 space-y-0.5 text-stone-100 pl-0.5">
                          <div>
                            <div className="text-[5.5px] text-amber-300/70 uppercase font-semibold">Nama Lengkap</div>
                            <div className="text-[8.5px] sm:text-[9.5px] font-bold uppercase font-serif text-amber-100 truncate">{member.name}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                            <div>
                              <div className="text-[5.5px] text-amber-300/70 uppercase">NIK</div>
                              <div className="font-mono font-bold text-amber-300 text-[7px] sm:text-[8px] truncate">{member.nik || '3509111201950001'}</div>
                            </div>
                            <div>
                              <div className="text-[5.5px] text-amber-300/70 uppercase">Jabatan</div>
                              <div className="font-semibold text-amber-100 text-[6.5px] sm:text-[7.5px] truncate">{member.membershipType || member.division}</div>
                            </div>
                            <div>
                              <div className="text-[5.5px] text-amber-300/70 uppercase">Wilayah</div>
                              <div className="font-semibold text-stone-200 text-[6.5px] sm:text-[7.5px] truncate">{member.region}</div>
                            </div>
                            <div>
                              <div className="text-[5.5px] text-amber-300/70 uppercase">Terbit</div>
                              <div className="text-[6.5px] sm:text-[7.5px] text-stone-300 font-mono truncate">{member.joinDate}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="relative z-10 pt-0.5 border-t border-amber-500/30 flex items-center justify-between gap-1">
                        <div>
                          <div className="text-[7px] sm:text-[8px] font-black font-serif text-amber-300 uppercase tracking-widest">
                            TEAM SENYAP NUSANTARA
                          </div>
                          <div className="text-[5px] sm:text-[5.5px] text-amber-200/80 uppercase">Kantor Pusat Jember • WA: 0823-3262-6916</div>
                        </div>
                        <div className="p-0.5 rounded bg-white border border-amber-500/70 shrink-0">
                          <QRCodeSVG value={verificationUrl} size={20} level="M" bgColor="#FFFFFF" fgColor="#000000" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE CARD ON PAPER */}
                  <div className="relative group p-2">
                    {/* Crop Marks */}
                    {showCropMarks && (
                      <>
                        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-stone-900 z-20 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-stone-900 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-stone-900 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-stone-900 z-20 pointer-events-none" />
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-stone-400 tracking-wider print:hidden">
                          TAMPAK BELAKANG (85.6mm)
                        </div>
                      </>
                    )}

                    <div className="ktp-print-card w-[320px] sm:w-[340px] aspect-[85.6/53.98] rounded-xl bg-stone-950 border-[2px] border-amber-500/90 p-2 sm:p-2.5 flex flex-col justify-between relative overflow-hidden shadow-xl bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-950 via-stone-950 to-stone-950 text-white">
                      <div className="absolute inset-1 rounded-lg border border-amber-500/35 pointer-events-none" />

                      <div className="relative z-10 text-center space-y-0.5 border-b border-amber-500/30 pb-0.5">
                        <div className="text-[6.5px] sm:text-[7px] font-serif font-black text-amber-400 uppercase">KETENTUAN KARTU TANDA ANGGOTA (KTA)</div>
                        <div className="text-[8px] sm:text-[9px] font-serif font-black text-amber-300 uppercase">LPKSM SENYAP NUSANTARA JAYA</div>
                      </div>

                      <div className="relative z-10 px-1.5 py-0.5 my-auto space-y-0.5 bg-stone-900/90 rounded-lg border border-amber-500/30 text-[6px] sm:text-[6.5px] leading-tight text-stone-200">
                        <p className="font-serif italic text-amber-100 text-center">
                          "Kartu ini adalah identitas resmi anggota LPKSM Senyap Nusantara Jaya sesuai UU No. 8 Tahun 1999."
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-[5.5px] sm:text-[6px] text-stone-300">
                          <li>Pemegang berwenang mendampingi konsumen & aksi kemanusiaan.</li>
                          <li>Dilarang menyalahgunakan KTA untuk tindakan melanggar hukum.</li>
                        </ul>
                      </div>

                      <div className="relative z-10 pt-0.5 border-t border-amber-500/30 text-center space-y-0.5">
                        <div className="text-[6.5px] sm:text-[7.5px] font-bold text-amber-300 uppercase">KANTOR PUSAT SEKRETARIAT JEMBER</div>
                        <div className="text-[5.5px] sm:text-[6.5px] text-amber-100/90">Jl. Lumajang - Jember, Kebon, Tutul, Balung, Jember 68161</div>
                        <div className="text-[6px] sm:text-[7px] font-mono font-bold text-emerald-400">HOTLINE / WA: 0823-3262-6916</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Official Stamp & Signatures Block on Paper */}
              <div className="pt-8 text-stone-900 text-xs border-t border-stone-300 space-y-6">
                <div className="flex justify-between items-end px-6">
                  <div className="text-center space-y-10">
                    <div className="text-stone-600 font-sans">Pemegang KTA Resmi,</div>
                    <div>
                      <div className="font-bold underline uppercase text-stone-900">{member.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono">ID: {member.id}</div>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 border-2 border-emerald-600/40 rounded-full flex flex-col items-center justify-center p-1 text-emerald-800 text-[8px] font-bold mx-auto leading-tight">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 mb-0.5" />
                      <span>TERVERIFIKASI</span>
                      <span>DOKUMEN RESMI</span>
                    </div>
                  </div>

                  <div className="text-center space-y-10">
                    <div className="text-stone-600 font-sans">
                      Jember, {member.joinDate}<br />
                      <strong>LPKSM Senyap Nusantara Jaya</strong>
                    </div>
                    <div>
                      <div className="font-bold underline uppercase text-stone-900">IBRAHIM</div>
                      <div className="text-[10px] text-stone-500 font-sans">Bendahara Pusat</div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[9px] text-stone-400 font-mono pt-2 border-t border-dashed border-stone-200">
                  Dokumen ini diterbitkan oleh Sistem Database Resmi Team Senyap Nusantara Jaya. Hak cipta dilindungi undang-undang.
                </div>
              </div>

            </div>
          ) : (
            
            /* OPTION 2: DUAL CARDS PREVIEW ONLY MODE */
            <div id="kta-cards-dual-preview" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center max-w-2xl mx-auto py-4 bg-stone-900/50 p-4 rounded-xl">
              {/* FRONT SIDE */}
              <div className="space-y-2 flex flex-col items-center">
                <div className="text-center text-xs font-bold text-amber-300 font-serif uppercase tracking-wider">
                  — TAMPAK DEPAN (FRONT SIDE) —
                </div>
                <div className="ktp-print-card w-full max-w-[440px] aspect-[85.6/53.98] rounded-2xl bg-stone-950 border-[2px] border-amber-500/90 p-3 flex flex-col justify-between relative overflow-hidden shadow-2xl bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-950 via-stone-950 to-stone-950">
                  <div className="absolute inset-1 rounded-xl border border-amber-500/35 pointer-events-none" />
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

                  <div className="relative z-10 border-b border-amber-500/40 pb-1 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TSNLogo size="sm" showText={false} />
                      <div className="min-w-0">
                        <div className="text-[9.5px] font-black font-serif tracking-wider text-amber-200 uppercase truncate">
                          KARTU TANDA ANGGOTA RESMI
                        </div>
                        <div className="text-[8px] font-black tracking-wider text-amber-300 uppercase leading-none truncate">
                          LPKSM SENYAP NUSANTARA JAYA
                        </div>
                      </div>
                    </div>
                    <div className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/80 text-[8px] font-black text-emerald-400 shrink-0">
                      ✓ {member.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-12 gap-2 my-auto items-center">
                    <div className="col-span-4 flex flex-col items-center justify-center">
                      <div className="relative rounded p-0.5 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-800 shadow-lg w-full max-w-[92px]">
                        <div className="aspect-[3/4] rounded bg-stone-900 overflow-hidden relative">
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute bottom-0.5 right-0.5 bg-amber-500 text-stone-950 font-black text-[5.5px] px-1 rounded">ORIGINAL</div>
                        </div>
                      </div>
                      <div className="text-[6.5px] font-mono font-bold text-amber-400 mt-1 uppercase text-center truncate">
                        ID: {member.id}
                      </div>
                    </div>

                    <div className="col-span-8 space-y-1 text-stone-100 pl-0.5">
                      <div>
                        <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold">Nama Lengkap</div>
                        <div className="text-[11px] font-bold font-serif text-amber-100 uppercase truncate">{member.name}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5">
                        <div>
                          <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold">NIK</div>
                          <div className="font-mono font-bold text-amber-300 text-[9.5px] truncate">{member.nik || '3509111201950001'}</div>
                        </div>
                        <div>
                          <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold">Jabatan</div>
                          <div className="font-semibold text-amber-100 text-[9px] truncate">{member.membershipType || member.division}</div>
                        </div>
                        <div>
                          <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold">Wilayah Tugas</div>
                          <div className="font-semibold text-stone-200 text-[9px] truncate">{member.region}</div>
                        </div>
                        <div>
                          <div className="text-[6.5px] text-amber-300/70 uppercase font-semibold">Masa Terbit</div>
                          <div className="text-[8.5px] text-stone-300 font-mono truncate">{member.joinDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-1 border-t border-amber-500/30 flex items-center justify-between gap-1">
                    <div>
                      <div className="text-[9px] font-black font-serif text-amber-300 uppercase tracking-widest">TEAM SENYAP NUSANTARA</div>
                      <div className="text-[6.5px] font-semibold text-amber-200/80 uppercase">Kantor Pusat Jember • WA: 0823-3262-6916</div>
                    </div>
                    <div className="p-0.5 rounded bg-white border border-amber-500/70 shrink-0">
                      <QRCodeSVG value={verificationUrl} size={28} level="M" bgColor="#FFFFFF" fgColor="#000000" />
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="space-y-2 flex flex-col items-center">
                <div className="text-center text-xs font-bold text-amber-300 font-serif uppercase tracking-wider">
                  — TAMPAK BELAKANG (BACK SIDE) —
                </div>
                <div className="ktp-print-card w-full max-w-[440px] aspect-[85.6/53.98] rounded-2xl bg-stone-950 border-[2px] border-amber-500/90 p-3 flex flex-col justify-between relative overflow-hidden shadow-2xl bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-950 via-stone-950 to-stone-950">
                  <div className="absolute inset-1 rounded-xl border border-amber-500/35 pointer-events-none" />

                  <div className="relative z-10 text-center space-y-0.5 border-b border-amber-500/30 pb-1">
                    <div className="text-[7.5px] font-serif font-black text-amber-400 uppercase">KETENTUAN KARTU TANDA ANGGOTA (KTA)</div>
                    <div className="text-[10.5px] font-serif font-black text-amber-300 uppercase">LPKSM SENYAP NUSANTARA JAYA</div>
                  </div>

                  <div className="relative z-10 px-2 py-1 my-auto space-y-1 bg-stone-900/90 rounded-xl border border-amber-500/30 text-[8px] leading-tight text-stone-200">
                    <p className="font-serif italic text-amber-100 text-center text-[8.5px]">
                      "Kartu ini adalah identitas resmi anggota LPKSM Senyap Nusantara Jaya yang terdaftar secara sah sesuai UU No. 8 Tahun 1999."
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[7px] text-stone-300">
                      <li>Pemegang kartu berwenang mendampingi konsumen & kegiatan kemanusiaan.</li>
                      <li>Dilarang menyalahgunakan KTA ini untuk tindakan yang melanggar hukum.</li>
                      <li>Jika menemukan kartu ini, mohon kembalikan ke Sekretariat Kantor Pusat.</li>
                    </ul>
                  </div>

                  <div className="relative z-10 pt-1 border-t border-amber-500/30 text-center space-y-0.5">
                    <div className="text-[8px] font-bold text-amber-300 uppercase">KANTOR PUSAT JEMBER</div>
                    <div className="text-[7px] font-serif text-amber-100/90">Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kab. Jember 68161</div>
                    <div className="text-[7.5px] font-mono font-bold text-emerald-400">HOTLINE / WA: 0823-3262-6916</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Buttons - Hidden on Print */}
        <div className="pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-stone-400">
            Anggota: <strong className="text-amber-200">{member.name}</strong> (<span className="font-mono text-amber-300">{member.id}</span>)
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 text-xs font-bold text-sky-300 bg-stone-950 border border-sky-500/40 rounded-xl hover:bg-sky-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <span>Bagikan Link</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-300 bg-stone-950 border border-stone-800 rounded-xl hover:text-white cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 flex items-center gap-2 shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};