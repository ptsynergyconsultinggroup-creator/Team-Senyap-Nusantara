import React, { useState } from 'react';
import { Transaction, SiteConfig } from '../types';
import { Wallet, TrendingUp, TrendingDown, DollarSign, X, Search, Filter, Calendar, ShieldCheck, Printer, ArrowUpRight, ArrowDownRight, FileSpreadsheet, Download } from 'lucide-react';
import { exportFinancialToExcel } from '../utils/exportExcel';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  siteConfig?: SiteConfig;
}

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  siteConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pemasukan' | 'pengeluaran'>('all');

  if (!isOpen) return null;

  const orgName = siteConfig?.orgName || 'TEAM SENYAP NUSANTARA';
  const subTitle = siteConfig?.subTitle || 'LPKSM SENYAP NUSANTARA JAYA';

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Filter list
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recordedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.date.includes(searchQuery);

    const matchesType = filterType === 'all' || t.type === filterType;

    return matchesSearch && matchesType;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* SCREEN UI CONTAINER */}
      <div className="print:hidden relative w-full max-w-4xl bg-stone-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-stone-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer rounded-xl bg-stone-950 border border-stone-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wide">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Transparansi Kas & Keuangan {subTitle}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-amber-200">
            Laporan Kas Pemasukan & Pengeluaran
          </h3>
          <p className="text-xs text-stone-300 max-w-xl mx-auto">
            Pantau arus dana iuran anggota, donasi kemanusiaan, dan alokasi operasional organisasi secara akuntabel dan transparan.
          </p>
        </div>

        {/* FINANCIAL SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Saldo Kas */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/80 via-stone-950 to-stone-950 border border-amber-500/50 shadow-xl space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Saldo Kas Akhir</span>
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-200 pt-1">
              {formatRupiah(currentBalance)}
            </div>
            <p className="text-[11px] text-stone-400">Total Kas Bersih Organisasi</p>
          </div>

          {/* Total Pemasukan */}
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Total Pemasukan</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300 pt-1">
              {formatRupiah(totalIncome)}
            </div>
            <p className="text-[11px] text-emerald-400/80">Iuran, Donasi & Support Mitra</p>
          </div>

          {/* Total Pengeluaran */}
          <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 shadow-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Total Pengeluaran</span>
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-300 pt-1">
              {formatRupiah(totalExpense)}
            </div>
            <p className="text-[11px] text-rose-400/80">Aksi Baksos, KTA & Operasional</p>
          </div>
        </div>

        {/* EXPORT & PRINT BAR */}
        <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, kategori, atau tanggal..."
              className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-amber-500/20 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => exportFinancialToExcel(filteredTransactions, siteConfig)}
              className="px-3.5 py-2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Excel (.xls)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-stone-950 rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow hover:brightness-110 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Save PDF</span>
            </button>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="bg-stone-950 rounded-2xl border border-amber-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-900 border-b border-amber-500/30 text-amber-300 uppercase font-serif">
                <tr>
                  <th className="p-3.5">No / ID</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Tipe & Kategori</th>
                  <th className="p-3.5">Keterangan Dana</th>
                  <th className="p-3.5 text-right">Jumlah (Rp)</th>
                  <th className="p-3.5">Penanggung Jawab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-stone-900/60 transition-colors">
                      <td className="p-3.5 font-mono text-amber-400 font-bold">{t.id}</td>
                      <td className="p-3.5 font-mono text-stone-300 whitespace-nowrap">{t.date}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.type === 'pemasukan'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {t.type === 'pemasukan' ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{t.category}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-200 max-w-xs">{t.description}</td>
                      <td
                        className={`p-3.5 text-right font-mono font-bold text-sm whitespace-nowrap ${
                          t.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'pemasukan' ? '+' : '-'} {formatRupiah(t.amount)}
                      </td>
                      <td className="p-3.5 text-stone-400 text-[11px] whitespace-nowrap">{t.recordedBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      Tidak ada data transaksi kas yang sesuai dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Diperbarui Secara Real-Time oleh Bendahara Kantor Pusat Jember</span>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL A4 DOCUMENT FORM */}
      <div className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black p-8 font-sans space-y-6">
        {/* Kop Surat Header */}
        <div className="border-b-4 border-black pb-4 text-center space-y-1">
          <h1 className="text-xl font-black uppercase tracking-wider font-serif">{orgName}</h1>
          <h2 className="text-base font-bold uppercase tracking-wide text-amber-700">{subTitle}</h2>
          <p className="text-xs text-gray-600">
            Sekretariat Pusat: Jl. Lumajang - Jember, Kebon, Tutul, Kec. Balung, Kab. Jember 68161
          </p>
          <p className="text-xs text-gray-600 font-mono">
            Hotline: 0823-3262-6916 | Email: sekretariat@tsn-jaya.or.id
          </p>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold uppercase underline tracking-wider font-serif">
            LAPORAN ARUS KAS PEMASUKAN & PENGELUARAN ORGANISASI
          </h3>
          <p className="text-xs text-gray-500 font-mono">
            Tanggal Cetak Dokumen: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Summary Table */}
        <table className="w-full text-xs border-collapse border border-gray-400 font-mono">
          <tbody>
            <tr className="bg-gray-100 font-bold">
              <td className="p-2 border border-gray-400">TOTAL PEMASUKAN:</td>
              <td className="p-2 border border-gray-400 text-green-700">{formatRupiah(totalIncome)}</td>
              <td className="p-2 border border-gray-400">TOTAL PENGELUARAN:</td>
              <td className="p-2 border border-gray-400 text-red-700">{formatRupiah(totalExpense)}</td>
              <td className="p-2 border border-gray-400 bg-amber-50">SALDO KAS BERSIH:</td>
              <td className="p-2 border border-gray-400 font-black text-amber-800">{formatRupiah(currentBalance)}</td>
            </tr>
          </tbody>
        </table>

        {/* Main Transactions Print Table */}
        <table className="w-full text-xs border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200 text-black uppercase font-bold text-[10px]">
              <th className="p-2 border border-gray-400 text-left">No ID</th>
              <th className="p-2 border border-gray-400 text-left">Tanggal</th>
              <th className="p-2 border border-gray-400 text-left">Tipe & Kategori</th>
              <th className="p-2 border border-gray-400 text-left">Keterangan Rincian Dana</th>
              <th className="p-2 border border-gray-400 text-right">Pemasukan (Rp)</th>
              <th className="p-2 border border-gray-400 text-right">Pengeluaran (Rp)</th>
              <th className="p-2 border border-gray-400 text-left">Verifikator</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-300 font-mono text-[11px]">
                <td className="p-2 border border-gray-300 font-bold">{t.id}</td>
                <td className="p-2 border border-gray-300 whitespace-nowrap">{t.date}</td>
                <td className="p-2 border border-gray-300 font-sans font-semibold">
                  [{t.type.toUpperCase()}] {t.category}
                </td>
                <td className="p-2 border border-gray-300 font-sans">{t.description}</td>
                <td className="p-2 border border-gray-300 text-right font-bold text-green-700">
                  {t.type === 'pemasukan' ? formatRupiah(t.amount) : '-'}
                </td>
                <td className="p-2 border border-gray-300 text-right font-bold text-red-700">
                  {t.type === 'pengeluaran' ? formatRupiah(t.amount) : '-'}
                </td>
                <td className="p-2 border border-gray-300 font-sans">{t.recordedBy}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold font-mono text-xs">
              <td colSpan={4} className="p-2 border border-gray-400 text-right">TOTAL ARUS KAS:</td>
              <td className="p-2 border border-gray-400 text-right text-green-700">{formatRupiah(totalIncome)}</td>
              <td className="p-2 border border-gray-400 text-right text-red-700">{formatRupiah(totalExpense)}</td>
              <td className="p-2 border border-gray-400">SALDO: {formatRupiah(currentBalance)}</td>
            </tr>
          </tbody>
        </table>

        {/* Approval Signatures */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs space-y-0">
          <div className="space-y-12">
            <div>Mengetahui,<br /><strong>Ketua LPKSM Senyap Nusantara Jaya</strong></div>
            <div className="font-bold underline uppercase">BAMBANG SUBAGIO, S.H.</div>
          </div>
          <div className="space-y-12">
            <div>Jember, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br /><strong>Bendahara Pusat Organisasi</strong></div>
            <div className="font-bold underline uppercase">IBRAHIM</div>
          </div>
        </div>
      </div>
    </div>
  );
};
