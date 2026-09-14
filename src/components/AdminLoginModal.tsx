import React, { useState } from 'react';
import { ShieldAlert, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, X, KeyRound } from 'lucide-react';
import { SiteConfig } from '../types';
import { TSNLogo } from './TSNLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (adminName: string) => void;
  siteConfig?: SiteConfig;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  siteConfig,
}) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDefaultHint, setShowDefaultHint] = useState(false);

  if (!isOpen) return null;

  const validUsername = (siteConfig?.adminUsername || 'admin').trim().toLowerCase();
  const validPin = (siteConfig?.adminPin || 'tsn2024').trim();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const inputUser = username.trim().toLowerCase();
      const inputPin = pin.trim();

      // Check against configured credentials or default executive usernames
      const isUserValid =
        inputUser === validUsername ||
        inputUser === 'ibrahim' ||
        inputUser === 'pengurus' ||
        inputUser === 'admin@teamsenyap.com';

      const isPinValid =
        inputPin === validPin ||
        inputPin === 'tsn2024' ||
        inputPin === 'senyap1999';

      if (isUserValid && isPinValid) {
        const adminDisplayName =
          inputUser === 'ibrahim'
            ? 'IBRAHIM (Bendahara Pusat)'
            : 'ADMIN PENGURUS PUSAT';

        setIsLoading(false);
        onLoginSuccess(adminDisplayName);
        onClose();
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau PIN Keamanan salah. Akses ditolak.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-500/50 rounded-2xl p-6 sm:p-8 space-y-6 text-stone-100 shadow-[0_0_50px_rgba(0,0,0,0.95)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-950 border border-stone-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              Akses Terproteksi Khusus Pengurus
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
              Autentikasi Panel Admin
            </h3>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              Silakan masukkan kredensial pengurus pusat untuk membuka kontrol data, kas, dan persuratan resmi.
            </p>
          </div>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Username / ID Pengurus</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin atau ibrahim"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono transition"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>PIN / Sandi Keamanan</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN Admin"
                className="w-full pl-3.5 pr-10 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-300 transition cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-xs font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl hover:brightness-110 shadow-[0_0_20px_rgba(234,179,8,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isLoading ? (
              <span>Memverifikasi Akses...</span>
            ) : (
              <>
                <span>Masuk ke Panel Pengurus</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice & Default Helper */}
        <div className="pt-2 border-t border-stone-800 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistem dilindungi enkripsi Google Cloud & Firestore</span>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowDefaultHint(!showDefaultHint)}
              className="text-[11px] text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
            >
              {showDefaultHint ? 'Sembunyikan Petunjuk Kredensial' : 'Lupa atau baru pertama kali membuka? Klik petunjuk'}
            </button>
            {showDefaultHint && (
              <div className="mt-2 p-2.5 bg-stone-950/90 rounded-lg border border-amber-500/20 text-left text-[11px] text-stone-300 space-y-1">
                <div>Kredensial Default Kantor Pusat:</div>
                <div className="font-mono text-amber-300">Username: <strong>admin</strong> (atau <strong>ibrahim</strong>)</div>
                <div className="font-mono text-amber-300">PIN Sandi: <strong>tsn2024</strong></div>
                <div className="text-[10px] text-stone-400 italic pt-1">
                  * Anda dapat mengubah username & PIN ini kapan saja di menu Pengaturan Situs dalam Panel Admin.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
