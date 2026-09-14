import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface SignatureCanvasProps {
  value?: string;
  onChange: (signatureDataUrl: string | undefined) => void;
  applicantName?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  value,
  onChange,
  applicantName = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState<boolean>(!!value);
  const [penColor, setPenColor] = useState<string>('#1d4ed8'); // Classic dark blue ink

  // Setup canvas size and DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = penColor;

    if (value) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, []);

  // Update pen color
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = penColor;
    }
  }, [penColor]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSignature();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    // Export transparent PNG
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(undefined);
  };

  // Generate stylized auto-signature as backup/convenience
  const generateAutoSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    // Clear first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = 'italic 32px "Playfair Display", "Dancing Script", cursive, serif';
    ctx.fillStyle = penColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textToSign = applicantName.trim() ? applicantName : 'Tanda Tangan Resmi';
    ctx.fillText(textToSign, rect.width / 2, rect.height / 2 - 5);

    // Decorative underline swoop
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = penColor;
    ctx.moveTo(rect.width / 4, rect.height / 2 + 15);
    ctx.quadraticCurveTo(rect.width / 2, rect.height / 2 + 25, (rect.width * 3) / 4, rect.height / 2 + 12);
    ctx.stroke();
    ctx.restore();

    setHasSignature(true);
    setTimeout(() => {
      saveSignature();
    }, 50);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 uppercase">
          <PenTool className="w-3.5 h-3.5 text-amber-400" />
          <span>Goreskan Tanda Tangan Digital *</span>
        </div>

        {/* Color Switcher & Clear Actions */}
        <div className="flex items-center gap-2">
          {/* Ink Options */}
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setPenColor('#1d4ed8')}
              className={`w-4 h-4 rounded-full bg-blue-600 transition-transform cursor-pointer ${
                penColor === '#1d4ed8' ? 'ring-2 ring-amber-400 scale-110' : 'opacity-60'
              }`}
              title="Tinta Biru Gelap"
            />
            <button
              type="button"
              onClick={() => setPenColor('#09090b')}
              className={`w-4 h-4 rounded-full bg-stone-950 border border-stone-700 transition-transform cursor-pointer ${
                penColor === '#09090b' ? 'ring-2 ring-amber-400 scale-110' : 'opacity-60'
              }`}
              title="Tinta Hitam"
            />
            <button
              type="button"
              onClick={() => setPenColor('#d97706')}
              className={`w-4 h-4 rounded-full bg-amber-600 transition-transform cursor-pointer ${
                penColor === '#d97706' ? 'ring-2 ring-amber-400 scale-110' : 'opacity-60'
              }`}
              title="Tinta Emas"
            />
          </div>

          {hasSignature && (
            <button
              type="button"
              onClick={clearCanvas}
              className="px-2 py-1 text-[11px] text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Eraser className="w-3 h-3" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Signature Canvas Box */}
      <div className="relative rounded-xl border border-amber-500/30 bg-stone-950/90 overflow-hidden shadow-inner group">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="w-full h-36 cursor-crosshair touch-none relative z-10"
        />

        {/* Baseline Signature Guide Line */}
        <div className="absolute left-6 right-6 bottom-8 border-b border-dashed border-stone-700/60 pointer-events-none flex items-center justify-between">
          <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest pl-1">
            Garis Tanda Tangan
          </span>
          <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest pr-1">
            {applicantName ? applicantName : 'TSN Digital Sign'}
          </span>
        </div>

        {/* Empty Canvas Watermark Guidance */}
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-600 pointer-events-none p-4 text-center space-y-1">
            <PenTool className="w-6 h-6 text-stone-700 mb-1 animate-pulse" />
            <p className="text-xs font-semibold text-stone-400">
              Gunakan Layar Sentuh / Mouse untuk Menanda Tangan
            </p>
            <p className="text-[10px] text-stone-500">
              Coretkan tanda tangan Anda secara langsung di dalam kotak ini
            </p>
          </div>
        )}

        {/* Signed Status Indicator */}
        {hasSignature && (
          <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-bold text-emerald-400 flex items-center gap-1 shadow">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Tanda Tangan Terrekam</span>
          </div>
        )}
      </div>

      {/* Auto Signature Helper Button */}
      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
        <span>Goreskan tanda tangan dengan jari atau mouse.</span>
        <button
          type="button"
          onClick={generateAutoSignature}
          className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Buat Otomatis Dari Nama</span>
        </button>
      </div>
    </div>
  );
};
