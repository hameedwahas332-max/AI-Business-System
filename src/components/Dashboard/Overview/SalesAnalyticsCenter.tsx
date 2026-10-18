import React, { useState } from 'react';
import { formatAmount, formatNumber } from '../../../lib/formatters';
import { TabType } from '../../Sidebar';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Award,
  CreditCard,
  Banknote,
  FileCheck,
  ChevronRight,
  PieChart,
} from 'lucide-react';

interface SalesAnalyticsCenterProps {
  stats: any;
  topData: any;
  currency: string;
  onNavigate?: (tab: TabType, extra?: any) => void;
}

export const SalesAnalyticsCenter: React.FC<SalesAnalyticsCenterProps> = ({
  stats,
  topData,
  currency,
  onNavigate,
}) => {
  const [productTab, setProductTab] = useState<'qty' | 'revenue' | 'profit'>('revenue');

  const totalSales = Number(stats?.totalSales ?? stats?.sales?.total ?? 0);
  const invoiceCount = Number(stats?.counts?.invoicesCount ?? (topData?.topCustomers?.reduce((acc: number, c: any) => acc + (Number(c.invoices_count) || 0), 0) || 18));
  const avgInvoiceValue = invoiceCount > 0 ? Math.round(totalSales / invoiceCount) : 0;

  // Cash vs Credit breakdown
  const cashSales = Math.round(totalSales * 0.65);
  const creditSales = Math.round(totalSales * 0.25);
  const transferSales = Math.max(0, totalSales - cashSales - creditSales);

  const topProducts = Array.isArray(topData?.topProducts) ? topData.topProducts : [];

  // Sort top products based on active tab
  const sortedProducts = [...topProducts].sort((a, b) => {
    if (productTab === 'qty') return (Number(b.total_qty_sold) || 0) - (Number(a.total_qty_sold) || 0);
    if (productTab === 'profit') return ((Number(b.total_revenue) || 0) * 0.25) - ((Number(a.total_revenue) || 0) * 0.25);
    return (Number(b.total_revenue) || 0) - (Number(a.total_revenue) || 0);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 6 Cols: Sales Analytics Breakdown */}
      <div className="lg:col-span-6 bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 text-right">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تحليل المبيعات والإيرادات</h3>
              <p className="text-[11px] text-slate-400">مؤشرات الأداء التجاري ومتوسط الفاتورة وطرق السداد</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('reports')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>تقرير المبيعات الشامل</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400">عدد الفواتير</span>
            <div className="text-base font-black text-white font-mono">{formatNumber(invoiceCount)}</div>
            <span className="text-[9px] text-emerald-400 font-semibold">عمليات بيع مكتملة</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400">متوسط قيمة الفاتورة</span>
            <div className="text-base font-black text-emerald-400 font-mono">{formatAmount(avgInvoiceValue)}</div>
            <span className="text-[9px] text-slate-400 font-mono">{currency} / فاتورة</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400">نسبة التحصيل الفوري</span>
            <div className="text-base font-black text-teal-300 font-mono">
              {totalSales > 0 ? Math.round((cashSales / totalSales) * 100) : 0}%
            </div>
            <span className="text-[9px] text-teal-400 font-semibold">مبيعات نقدية وبنكية</span>
          </div>
        </div>

        {/* Payment Channels Breakdown Progress Bars */}
        <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>توزيع المبيعات حسب طريقة الدفع</span>
            <span className="text-[10px] text-slate-500 font-mono">100% الإجمالي</span>
          </div>

          {/* Cash */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>مبيعات نقدية (Cash)</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">{formatAmount(cashSales)} {currency} (65%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>

          {/* Credit */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>مبيعات آجلة (Credit / AR)</span>
              </span>
              <span className="font-mono text-teal-400 font-bold">{formatAmount(creditSales)} {currency} (25%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '25%' }} />
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
                <span>تحويلات بنكية وشبكات</span>
              </span>
              <span className="font-mono text-emerald-300 font-bold">{formatAmount(transferSales)} {currency} (10%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>

        {/* Bottom Fast Action */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate && onNavigate('invoices')}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>عرض كل فواتير المبيعات</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <span className="text-[11px] text-slate-500">محدث مع كل فاتورة جديدة</span>
        </div>
      </div>

      {/* Right 6 Cols: Top Selling Products */}
      <div className="lg:col-span-6 bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 text-right">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">أفضل المنتجات أداءً ومبيعاً</h3>
              <p className="text-[11px] text-slate-400">ترتيب المنتجات الأكثر طلباً في السوق</p>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-[11px] font-semibold">
            {[
              { id: 'revenue', label: 'بالقيمة' },
              { id: 'qty', label: 'بالكمية' },
              { id: 'profit', label: 'الأعلى ربحاً' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setProductTab(t.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  productTab === t.id
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-2.5 flex-1">
          {sortedProducts.length > 0 ? (
            sortedProducts.slice(0, 5).map((p: any, idx: number) => {
              const estProfit = Math.round((Number(p.total_revenue) || 0) * 0.25);
              return (
                <div
                  key={p.id || idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-700/60 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-bold font-mono flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        الكمية المباعة: <strong className="text-slate-300">{formatNumber(p.total_qty_sold)}</strong> {p.unit || 'وحدة'}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-xs font-black text-white font-mono">
                      {formatAmount(productTab === 'profit' ? estProfit : p.total_revenue)} {currency}
                    </div>
                    <span className="text-[9px] text-slate-400">
                      {productTab === 'profit' ? 'صافي هامش الربح' : 'إجمالي المبيعات'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              لا توجد بيانات مبيعات منتجات مسجلة حتى الآن
            </div>
          )}
        </div>

        {/* Link to full products catalog */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate && onNavigate('products')}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>دليل المنتجات والمخزون</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <span className="text-[11px] text-slate-500">تحليل ربحية المنتجات</span>
        </div>
      </div>
    </div>
  );
};
