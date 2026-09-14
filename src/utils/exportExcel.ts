import { Transaction, SiteConfig } from '../types';

export const exportFinancialToExcel = (transactions: Transaction[], siteConfig?: SiteConfig) => {
  const orgName = siteConfig?.orgName || 'TEAM SENYAP NUSANTARA';
  const subTitle = siteConfig?.subTitle || 'LPKSM SENYAP NUSANTARA JAYA';
  
  const totalIncome = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Kas LPKSM</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
        .org-title { font-size: 16pt; font-weight: bold; color: #09090b; text-align: center; }
        .org-subtitle { font-size: 12pt; font-weight: bold; color: #b45309; text-align: center; }
        .meta-text { font-size: 9pt; color: #64748b; text-align: center; margin-bottom: 20px; }
        
        .summary-box { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .summary-box td { padding: 8px 12px; font-weight: bold; border: 1px solid #cbd5e1; font-size: 10pt; }
        
        .main-table { width: 100%; border-collapse: collapse; }
        .main-table th { background-color: #1e293b; color: #ffffff; padding: 10px; border: 1px solid #334155; font-size: 10pt; text-align: left; }
        .main-table td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 9.5pt; }
        
        .income { color: #15803d; font-weight: bold; }
        .expense { color: #b91c1c; font-weight: bold; }
        .total-row { background-color: #f8fafc; font-weight: bold; font-size: 10pt; }
      </style>
    </head>
    <body>
      <div class="org-title">${orgName.toUpperCase()}</div>
      <div class="org-subtitle">${subTitle.toUpperCase()} — LAPORAN ARUS KAS PEMASUKAN & PENGELUARAN</div>
      <div class="meta-text">Alamat: Jl. Lumajang - Jember, Balung, Kabupaten Jember, Jawa Timur | Tanggal Ekspor: ${todayStr}</div>

      <table class="summary-box">
        <tr>
          <td style="background-color: #f1f5f9;">TOTAL PEMASUKAN:</td>
          <td class="income">Rp ${totalIncome.toLocaleString('id-ID')}</td>
          <td style="background-color: #f1f5f9;">TOTAL PENGELUARAN:</td>
          <td class="expense">Rp ${totalExpense.toLocaleString('id-ID')}</td>
          <td style="background-color: #fef3c7;">SALDO KAS BERSIH:</td>
          <td style="color: #b45309; font-size: 11pt;">Rp ${balance.toLocaleString('id-ID')}</td>
        </tr>
      </table>

      <table class="main-table">
        <thead>
          <tr>
            <th>No ID</th>
            <th>Tanggal</th>
            <th>Tipe Transaksi</th>
            <th>Kategori</th>
            <th>Keterangan Rincian Dana</th>
            <th style="text-align: right;">Pemasukan (Rp)</th>
            <th style="text-align: right;">Pengeluaran (Rp)</th>
            <th>Penanggung Jawab</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (t) => `
            <tr>
              <td>${t.id}</td>
              <td>${t.date}</td>
              <td style="font-weight: bold;">${t.type.toUpperCase()}</td>
              <td>${t.category}</td>
              <td>${t.description}</td>
              <td style="text-align: right;" class="income">${t.type === 'pemasukan' ? `Rp ${t.amount.toLocaleString('id-ID')}` : '-'}</td>
              <td style="text-align: right;" class="expense">${t.type === 'pengeluaran' ? `Rp ${t.amount.toLocaleString('id-ID')}` : '-'}</td>
              <td>${t.recordedBy}</td>
            </tr>
          `
            )
            .join('')}
          <tr class="total-row">
            <td colspan="5" style="text-align: right;">JUMLAH TOTAL:</td>
            <td style="text-align: right;" class="income">Rp ${totalIncome.toLocaleString('id-ID')}</td>
            <td style="text-align: right;" class="expense">Rp ${totalExpense.toLocaleString('id-ID')}</td>
            <td>SALDO AKHIR: Rp ${balance.toLocaleString('id-ID')}</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_Kas_LPKSM_TSN_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
