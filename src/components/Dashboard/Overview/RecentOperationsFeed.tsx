import React, { useState } from 'react';
import { formatAmount } from '../../../lib/formatters';
import { TabType } from '../../Sidebar';
import {
  FileText,
  ShoppingBag,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface RecentOperationsFeedProps {
  invoices?: any[];
  purchaseInvoices?: any[];
  payments?: any[];
  currency?: string;
  onNavigate?: (tab: TabType, extra?: any) => void;
}

export const RecentOperationsFeed: React.FC<RecentOperationsFeedProps> = ({
  invoices = [],
  purchaseInvoices = [],
  payments = [],
  currency = 'YER',
  onNavigate,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'SALES' | 'PURCHASES' | 'PAYMENTS'>('ALL');

  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safePurchases = Array.isArray(purchaseInvoices) ? purchaseInvoices : [];
  const safePayments = Array.isArray(payments) ? payments : [];

  // Build unified items
  const salesItems = safeInvoices.map(i => ({
    id: i.id,
    type: 'SALES',
    title: `فاتورة مبيعات ${i.invoice_number || i.code || ''}`,
    entity: i.customer_name || 'عميل نقدي',
    amount: Number(i.total || 0),
    currency: i.currency || currency,
    status: i.status || 'PAID',
    date: i.invoice_date || i.created_at || new Date().toISOString(),
    targetTab: 'invoices' as TabType,
  }));

  const purchaseItems = safePurchases.map(p => ({
    id: p.id,
    type: 'PURCHASE',
    title: `فاتورة مشتريات ${p.invoice_number || p.code || ''}`,
    entity: p.supplier_name || 'مورد عام',
    amount: Number(p.total || 0),
    currency: p.currency || currency,
    status: p.status || 'PAID',
    date: p.invoice_date || p.created_at || new Date().toISOString(),
    targetTab: 'purchase_invoices' as TabType,
  }));

  const paymentItems = safePayments.map(pmt => ({
    id: pmt.id,
    type: pmt.type === 'IN' || pmt.customer_name ? 'PAYMENT_IN' : 'PAYMENT_OUT',
    title: pmt.type === 'IN' || pmt.customer_name ? `سند قبض ${pmt.payment_number || ''}` : `سند صرف ${pmt.payment_number || ''}`,
    entity: pmt.customer_name || pmt.supplier_name || 'سند مالي',
    amount: Number(pmt.amount || 0),
    currency: pmt.currency || currency,
    status: 'COMPLETED',
    date: pmt.payment_date || pmt.created_at || new Date().toISOString(),
    targetTab: 'payments' as TabType,
  }));

  const allItems = [...salesItems, ...purchaseItems, ...paymentItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = allItems.filter(item => {
    if (filterType === 'SALES') return item.type === 'SALES';
    if (filterType === 'PURCHASES') return item.type === 'PURCHASE';
    if (filterType === 'PAYMENTS') return item.type === 'PAYMENT_IN' || item.type === 'PAYMENT_OUT';
    return true;
  }).slice(0, 8);

  return (
    <div className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl space-y-4 text-right">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">آخر العمليات والحركات المالية والتشغيلية</h3>
            <p className="text-[11px] text-slate-400">سجل لحظي متزامن لكل فواتير المبيعات، المشتريات، وسندات الصرف والقبض</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-[11px] font-semibold">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'SALES', label: 'مبيعات' },
            { id: 'PURCHASES', label: 'مشتريات' },
            { id: 'PAYMENTS', label: 'سندات' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Feed List */}
      <div className="space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => {
            const isSales = item.type === 'SALES';
            const isPurchase = item.type === 'PURCHASE';
            const isPaymentIn = item.type === 'PAYMENT_IN';

            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => onNavigate && onNavigate(item.targetTab, { id: item.id })}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-700/60 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl border ${
                      isSales
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
                        : isPurchase
                        ? 'bg-teal-950 text-teal-400 border-teal-800/50'
                        : isPaymentIn
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
                        : 'bg-slate-900 text-rose-400 border-rose-900/50'
                    }`}
                  >
                    {isSales ? (
                      <FileText className="w-4 h-4" />
                    ) : isPurchase ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : isPaymentIn ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                      <span>{item.title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          item.status === 'PAID' || item.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        }`}
                      >
                        {item.status === 'PAID' ? 'مدفوعة' : item.status === 'COMPLETED' ? 'مكتمل' : 'آجلة / معلقة'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      الطرف: <strong className="text-slate-300">{item.entity}</strong> • {new Date(item.date).toLocaleDateString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="text-left flex items-center gap-3">
                  <div>
                    <div className={`text-xs font-black font-mono ${isPurchase || item.type === 'PAYMENT_OUT' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isPurchase || item.type === 'PAYMENT_OUT' ? '-' : '+'}{formatAmount(item.amount)} {item.currency}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {isSales ? 'إيراد بيع' : isPurchase ? 'مشتريات' : isPaymentIn ? 'تحصيل عميل' : 'سداد مورد'}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors rotate-180" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            لا توجد حركات مسجلة مطابقة للفلتر المحدد
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={() => onNavigate && onNavigate('ledger')}
          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>عرض دفتر الأستاذ واليومية العامة</span>
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <span className="text-[11px] text-slate-500 font-mono">متزامن مع قيود المحاسبة تلقائياً</span>
      </div>
    </div>
  );
};
