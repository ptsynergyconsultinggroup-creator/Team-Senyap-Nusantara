import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertTriangle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Member } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onScanSuccess: (member: Member) => void;
  onScanNotFound: (scannedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  members,
  onScanSuccess,
  onScanNotFound,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeFacingMode, setActiveFacingMode] = useState<'environment' | 'user'>('environment');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerId = 'html5qr-code-full-region';

  useEffect(() => {
    if (!isOpen) return;

    setIsInitializing(true);
    setScannerError(null);

    let qrCodeScanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        // Wait a tick for DOM element to render
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const element = document.getElementById(readerId);
        if (!element) {
          throw new Error('Elemen kamera tidak ditemukan');
        }

        qrCodeScanner = new Html5Qrcode(readerId);
        html5QrCodeRef.current = qrCodeScanner;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await qrCodeScanner.start(
          { facingMode: activeFacingMode },
          config,
          (decodedText) => {
            // Stop scanning once code detected
            if (qrCodeScanner && qrCodeScanner.isScanning) {
              qrCodeScanner.stop().catch(console.error);
            }
            handleDecodedText(decodedText);
          },
          () => {
            // Frame parsing callback (no code found in frame), ignore
          }
        );

        setIsInitializing(false);
      } catch (err: any) {
        console.error('QR Scanner Error:', err);
        setIsInitializing(false);
        if (err?.toString().includes('NotAllowedError') || err?.toString().includes('Permission denied')) {
          setScannerError('Akses kamera ditolak oleh peramban. Harap izinkan akses kamera pada browser Anda.');
        } else if (err?.toString().includes('NotFoundError')) {
          setScannerError('Perangkat kamera tidak ditemukan pada sistem ini.');
        } else {
          setScannerError(err?.message || 'Gagal mengaktifkan modul kamera.');
        }
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen, activeFacingMode]);

  const handleDecodedText = (text: string) => {
    let scannedId = text.trim();

    // Check if the QR code is a verification URL (e.g., https://.../?verify=TSN-00125)
    try {
      if (scannedId.includes('?')) {
        const urlParams = new URLSearchParams(scannedId.split('?')[1]);
        const verifyParam = urlParams.get('verify') || urlParams.get('id') || urlParams.get('kta');
        if (verifyParam) {
          scannedId = verifyParam;
        }
      }
    } catch {
      // Ignore URL parsing errors and treat as raw text
    }

    const query = scannedId.trim().toLowerCase();
    const match = members.find(
      (m) =>
        m.id.toLowerCase() === query ||
        m.name.toLowerCase().includes(query) ||
        (m.nik && m.nik.includes(query))
    );

    if (match) {
      onScanSuccess(match);
      onClose();
    } else {
      onScanNotFound(scannedId);
      onClose();
    }
  };

  const toggleCamera = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        setActiveFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
      });
    } else {
      setActiveFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-500/40 rounded-2xl p-5 sm:p-6 text-stone-100 shadow-2xl space-y-4 my-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
              html5QrCodeRef.current.stop().catch(console.error);
            }
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-950 border border-stone-800 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kamera Pemindai QR KTA</span>
          </div>
          <h4 className="text-lg font-bold font-serif text-amber-200">
            Arahkan Kamera ke QR Code KTA
          </h4>
          <p className="text-xs text-stone-400">
            Sistem akan memverifikasi identitas anggota secara otomatis dalam waktu nyata.
          </p>
        </div>

        {/* Camera Viewport Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-amber-500/50 aspect-square flex items-center justify-center shadow-inner">
          <div id={readerId} className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

          {/* Scanner Aiming Overlay Frame */}
          {!scannerError && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-52 border-2 border-dashed border-amber-400/90 rounded-2xl relative shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                {/* Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                
                {/* Laser Scanning Line Animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-pulse relative top-1/2" />
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isInitializing && (
            <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center p-4 text-center space-y-3 z-10">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-semibold text-stone-300">Mengakses Sensor Kamera Perangkat...</p>
            </div>
          )}

          {/* Scanner Error Display */}
          {scannerError && (
            <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-rose-300">Kamera Tidak Siap</p>
                <p className="text-xs text-stone-400 leading-relaxed">{scannerError}</p>
              </div>
              <button
                onClick={() => {
                  setScannerError(null);
                  setIsInitializing(true);
                  setActiveFacingMode('environment');
                }}
                className="mt-2 px-4 py-2 text-xs font-bold bg-amber-500 text-stone-950 rounded-xl hover:brightness-110 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={toggleCamera}
            disabled={isInitializing || !!scannerError}
            className="px-3.5 py-2 text-xs font-bold text-stone-300 bg-stone-950 border border-stone-800 rounded-xl hover:text-amber-300 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Ganti Kamera ({activeFacingMode === 'environment' ? 'Belakang' : 'Depan'})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
              }
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-stone-400 hover:text-white bg-stone-950 border border-stone-800 rounded-xl cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
