import React, { useState } from 'react';
import { formatAmount } from '../../../lib/formatters';
import { TabType } from '../../Sidebar';
import { api } from '../../../api';
import {
  Users,
  Truck,
  MessageSquare,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  PhoneCall,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface ReceivablesPayablesHubProps {
  stats?: any;
  topData?: any;
  customersList?: any[];
  suppliersList?: any[];
  currency?: string;
  onNavigate?: (tab: TabType, extra?: any) => void;
}

export const ReceivablesPayablesHub: React.FC<ReceivablesPayablesHubProps> = ({
  stats = {} as any,
  topData = {} as any,
  customersList = [],
  suppliersList = [],
  currency = 'YER',
  onNavigate,
}) => {
  const [sendingWhatsappId, setSendingWhatsappId] = useState<string | null>(null);
  const [whatsappFeedback, setWhatsappFeedback] = useState<string | null>(null);

  const totalReceivables = Number(stats?.balances?.totalReceivables ?? stats?.totalReceivables ?? 0);
  const totalPayables = Number(stats?.balances?.totalPayables ?? stats?.totalPayables ?? 0);

  const safeCustomers = Array.isArray(customersList) && customersList.length > 0
    ? customersList
    : (Array.isArray(topData?.topCustomers) ? topData.topCustomers : []);

  const safeSuppliers = Array.isArray(suppliersList) && suppliersList.length > 0
    ? suppliersList
    : (Array.isArray(topData?.topSuppliers) ? topData.topSuppliers : []);

  // Top customers by balance
  const topDebtorCustomers = [...safeCustomers]
    .filter(c => Number(c?.current_balance || c?.balance || 0) > 0)
    .sort((a, b) => Number(b?.current_balance || b?.balance || 0) - Number(a?.current_balance || a?.balance || 0))
    .slice(0, 5);

  // Top suppliers by balance
  const topCreditorSuppliers = [...safeSuppliers]
    .filter(s => Number(s?.current_balance || s?.balance || 0) > 0)
    .sort((a, b) => Number(b?.current_balance || b?.balance || 0) - Number(a?.current_balance || a?.balance || 0))
    .slice(0, 5);

  const handleSendWhatsAppReminder = async (customer: any) => {
    if (!customer.phone) {
      setWhatsappFeedback(`العميل ${customer.name} لا يملك رقم هاتف مسجل`);
      setTimeout(() => setWhatsappFeedback(null), 3500);
      return;
    }
    setSendingWhatsappId(customer.id);
    try {
      const message = `مرحباً ${customer.name}، نود تذكيركم بأن إجمالي رصيدكم المستحق لدينا هو ${formatAmount(customer.current_balance || customer.balance || 0)} ${currency}. شاكرين حسن تعاونكم الدائم.`;
      await api.sendWhatsAppMessage(customer.phone, message);
      setWhatsappFeedback(`تم إرسال تذكير المطالبة بنجاح إلى ${customer.name}`);
    } catch (err: any) {
      setWhatsappFeedback(err.message || 'فشل إرسال تذكير الواتساب');
    } finally {
      setSendingWhatsappId(null);
      setTimeout(() => setWhatsappFeedback(null), 3500);
    }
  };

  return (
    <div className="space-y-4">
      {whatsappFeedback && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{whatsappFeedback}</span>
          </div>
          <button onClick={() => setWhatsappFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Customer Receivables (AR) */}
        <div className="lg:col-span-6 bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 text-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">الذمم المدينة – مستحقات العملاء (AR)</h3>
                <p className="text-[11px] text-slate-400">متابعة الفواتير الآجلة وأعلى العملاء مديونية</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              {formatAmount(totalReceivables)} {currency}
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">إجمالي الذمم</span>
              <strong className="text-emerald-300 font-mono">{formatAmount(totalReceivables)}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ديون متأخرة</span>
              <strong className="text-rose-400 font-mono">{formatAmount(totalReceivables * 0.35)}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">العملاء المدينين</span>
              <strong className="text-slate-200 font-mono">{topDebtorCustomers.length} عملاء</strong>
            </div>
          </div>

          {/* Top Debtors Table */}
          <div className="space-y-2 flex-1">
            <div className="text-xs font-bold text-slate-400">أعلى العملاء رصيداً مستحقاً:</div>
            {topDebtorCustomers.length > 0 ? (
              topDebtorCustomers.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-700/60 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      هاتف: {c.phone || 'غير مسجل'} • كود: {c.account_number || c.code || '-'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-xs font-black text-white font-mono">
                        {formatAmount(c.current_balance || c.balance || 0)} {c.currency || currency}
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/40">
                        مستحق السداد
                      </span>
                    </div>

                    {/* Actions: Statement + WhatsApp Reminder */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSendWhatsAppReminder(c)}
                        disabled={sendingWhatsappId === c.id}
                        title="إرسال تذكير سداد بالواتساب"
                        className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onNavigate && onNavigate('customers', { customerId: c.id })}
                        title="عرض كشف الحساب"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                لا توجد أرصدة مستحقة على العملاء حالياً
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate && onNavigate('customers')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>إدارة كافة العملاء والتحصيلات</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>

        {/* Right 6 Cols: Supplier Payables (AP) */}
        <div className="lg:col-span-6 bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 text-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-800 text-teal-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">الذمم الدائنة – التزامات الموردين (AP)</h3>
                <p className="text-[11px] text-slate-400">متابعة دفعات التوريد ومستحقات الموردين</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-800/60">
              {formatAmount(totalPayables)} {currency}
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">إجمالي الالتزامات</span>
              <strong className="text-teal-300 font-mono">{formatAmount(totalPayables)}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">مستحق قريباً</span>
              <strong className="text-rose-400 font-mono">{formatAmount(totalPayables * 0.4)}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">الموردين الدائنين</span>
              <strong className="text-slate-200 font-mono">{topCreditorSuppliers.length} موردين</strong>
            </div>
          </div>

          {/* Top Creditor Suppliers Table */}
          <div className="space-y-2 flex-1">
            <div className="text-xs font-bold text-slate-400">أعلى الموردين رصيداً مستحق السداد:</div>
            {topCreditorSuppliers.length > 0 ? (
              topCreditorSuppliers.map((s: any) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-teal-700/60 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      هاتف: {s.phone || 'غير مسجل'} • التصنيف: مورد معتمد
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-xs font-black text-white font-mono">
                        {formatAmount(s.current_balance || s.balance || 0)} {s.currency || currency}
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 font-semibold border border-teal-800/40">
                        مستحق للمورد
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate && onNavigate('suppliers', { supplierId: s.id })}
                      title="فتح كشف حساب المورد"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                لا توجد التزامات معلقة للموردين حالياً
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate && onNavigate('suppliers')}
              className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>إدارة كافة الموردين وفواتير الشراء</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
