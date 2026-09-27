import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  X,
  KeyRound,
  CheckCircle2,
  Trash2,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import {
  loginAdmin,
  getActiveAdminCredentials,
  updateAdminCredentials,
  resetAdminCredentialsToDefault,
  clearOldAdminSessions,
  DEFAULT_ADMIN_CREDENTIALS,
} from '../services/authService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (adminName: string) => void;
  siteConfig?: any;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'change_password'>('login');
  const [username, setUsername] = useState('admin@teamsenyapnusantara.org');
  const [password, setPassword] = useState('AdminTSN#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Change password form state
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [customUsernameInput, setCustomUsernameInput] = useState('');

  // Active credentials summary
  const [currentCreds, setCurrentCreds] = useState(getActiveAdminCredentials());

  useEffect(() => {
    if (isOpen) {
      const creds = getActiveAdminCredentials();
      setCurrentCreds(creds);
      setUsername(creds.username || DEFAULT_ADMIN_CREDENTIALS.primaryEmail);
      setPassword(creds.password || DEFAULT_ADMIN_CREDENTIALS.defaultPassword);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const result = await loginAdmin(username, password);
      setIsLoading(false);
      setSuccessMsg('Autentikasi berhasil! Mengalihkan ke Dashboard Pengurus...');
      setTimeout(() => {
        onLoginSuccess(result.displayName);
        onClose();
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Login gagal. Periksa kembali user dan password Anda.');
    }
  };

  const handleAutoFillDefault = () => {
    clearOldAdminSessions();
    setUsername(DEFAULT_ADMIN_CREDENTIALS.primaryEmail);
    setPassword(DEFAULT_ADMIN_CREDENTIALS.defaultPassword);
    setErrorMsg(null);
    setSuccessMsg('Kredensial login terbaru berhasil diisi otomatis.');
  };

  const handleClearStaleSession = () => {
    clearOldAdminSessions();
    setErrorMsg(null);
    setSuccessMsg('Seluruh sesi login lama dan cache browser berhasil dibersihkan.');
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPasswordInput.length < 6) {
      setErrorMsg('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await updateAdminCredentials(newPasswordInput, customUsernameInput || username);
      const updated = getActiveAdminCredentials();
      setCurrentCreds(updated);
      setUsername(updated.username);
      setPassword(updated.password);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setIsLoading(false);
      setSuccessMsg('Kata sandi baru berhasil disimpan! Anda sekarang dapat login menggunakan sandi baru.');
      setActiveTab('login');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Gagal mengubah kata sandi.');
    }
  };

  const handleResetToFactoryDefault = () => {
    resetAdminCredentialsToDefault();
    const defaultCreds = getActiveAdminCredentials();
    setCurrentCreds(defaultCreds);
    setUsername(DEFAULT_ADMIN_CREDENTIALS.primaryEmail);
    setPassword(DEFAULT_ADMIN_CREDENTIALS.defaultPassword);
    setErrorMsg(null);
    setSuccessMsg('Kredensial berhasil dikembalikan ke standar awal sistem.');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-500/50 rounded-2xl p-5 sm:p-8 space-y-5 text-stone-100 shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-950 border border-stone-800"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              Autentikasi Panel Pengurus TSN
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
              {activeTab === 'login' ? 'Login Pengurus / Admin' : 'Kelola Kata Sandi Admin'}
            </h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Akses khusus jajaran pengurus pusat dan pengelola portal Team Senyap Nusantara.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 gap-2 pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'login'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Masuk Panel</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('change_password');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'change_password'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Ubah Sandi Baru</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Login Form */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {/* Quick Active Credential Box */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kredensial Aktif Terbaru:
                </span>
                <button
                  type="button"
                  onClick={handleAutoFillDefault}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-amber-200 hover:text-amber-100 transition cursor-pointer"
                >
                  Isi Otomatis
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
                <div>
                  <span className="text-stone-400 text-[10px] block font-sans">User ID / Email:</span>
                  <span className="text-stone-200 font-bold break-all select-all">
                    {currentCreds.username}
                  </span>
                  <span className="text-[9px] text-stone-500 block font-sans mt-0.5">
                    (atau ketik: <code className="text-amber-300">admin</code>)
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] block font-sans">Kata Sandi:</span>
                  <span className="text-amber-300 font-bold select-all">
                    {currentCreds.password}
                  </span>
                  <span className="text-[9px] text-stone-500 block font-sans mt-0.5">
                    {currentCreds.isCustomized ? '(Sandi kustom aktif)' : '(Sandi resmi sistem)'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>User ID / Email Administrator</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@teamsenyapnusantara.org atau admin"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono transition"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kata Sandi (Password)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('change_password')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Ingin ubah kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <span>Masuk ke Dashboard Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Session Management Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-800 text-[11px] text-stone-400">
              <button
                type="button"
                onClick={handleClearStaleSession}
                className="inline-flex items-center gap-1.5 text-stone-400 hover:text-red-300 transition cursor-pointer"
                title="Hapus sesi lama dan token tersimpan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Sesi Lama / Cache</span>
              </button>
              <button
                type="button"
                onClick={handleResetToFactoryDefault}
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition cursor-pointer"
                title="Kembalikan user dan password ke bawaan sistem"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset ke Standar Sistem</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Change Password Form */}
        {activeTab === 'change_password' && (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl text-xs text-stone-300 space-y-1">
              <p className="font-semibold text-amber-300">Pengaturan Sandi Baru:</p>
              <p className="text-[11px] text-stone-400">
                Anda dapat menentukan sendiri User ID dan kata sandi baru untuk administrator. Setelah disimpan, Anda dapat langsung login dengan kredensial baru tersebut.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>User ID / Email Admin (Opsional, bawaan: {DEFAULT_ADMIN_CREDENTIALS.primaryEmail})</span>
              </label>
              <input
                type="text"
                value={customUsernameInput}
                onChange={(e) => setCustomUsernameInput(e.target.value)}
                placeholder="ptsynergyconsultinggroup@gmail.com atau admin"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Kata Sandi Baru (Minimal 6 Karakter)</span>
              </label>
              <input
                type="password"
                required
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Konfirmasi Kata Sandi Baru</span>
              </label>
              <input
                type="password"
                required
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono transition"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="flex-1 py-2.5 text-xs text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? <span>Menyimpan...</span> : <span>Simpan Sandi Baru</span>}
              </button>
            </div>
          </form>
        )}

        {/* Security Info */}
        <div className="pt-2 border-t border-stone-800 text-center space-y-1 text-[11px] text-stone-500">
          <div className="flex items-center justify-center gap-1 text-amber-400/90 font-medium">
            <Lock className="w-3 h-3" />
            <span>Hak Akses Administrator Team Senyap Nusantara</span>
          </div>
          <p className="text-[10px] text-stone-500 max-w-xs mx-auto">
            Gunakan user dan kata sandi di atas untuk membuka Panel Anggota, Kas, Dokumen Resmi, dan Manajemen Berita.
          </p>
        </div>
      </div>
    </div>
  );
};
