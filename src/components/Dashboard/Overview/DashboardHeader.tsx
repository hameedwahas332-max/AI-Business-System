import React from 'react';
import { TabType } from '../../Sidebar';
import { Company, User } from '../../../types';
import {
  Calendar,
  Building2,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  FileText,
  ShoppingBag,
  CreditCard,
  BookOpen,
  UserPlus,
  Truck,
  PackagePlus,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';

interface DashboardHeaderProps {
  user: User | null;
  company: Company | null;
  selectedPeriod?: string;
  setSelectedPeriod?: (p: string) => void;
  isLoading?: boolean;
  loading?: boolean;
  currency?: string;
  onRefresh: () => void;
  onNavigate?: (tab: TabType, extra?: any) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  company,
  selectedPeriod = 'today',
  setSelectedPeriod = (_p: string) => {},
  isLoading = false,
  loading,
  onRefresh,
  onNavigate,
}) => {
  const isActionLoading = isLoading || Boolean(loading);
  const [isQuickOpen, setIsQuickOpen] = React.useState(false);
  const quickRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setIsQuickOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayStr = new Intl.DateTimeFormat('ar-YE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const quickActions = [
    { label: 'فاتورة مبيعات جديدة', tab: 'invoices' as TabType, icon: FileText, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' },
    { label: 'فاتورة مشتريات جديدة', tab: 'purchase_invoices' as TabType, icon: ShoppingBag, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60' },
    { label: 'سند قبض / تحصيل عميل', tab: 'payments' as TabType, icon: CreditCard, color: 'text-blue-400 bg-blue-950/60 border-blue-800/60' },
    { label: 'سند صرف / دفعة مورد', tab: 'payments' as TabType, icon: CreditCard, color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' },
    { label: 'تسجيل قيد يومية محاسبي', tab: 'ledger' as TabType, icon: BookOpen, color: 'text-purple-400 bg-purple-950/60 border-purple-800/60' },
    { label: 'إضافة عميل جديد', tab: 'customers' as TabType, icon: UserPlus, color: 'text-teal-400 bg-teal-950/60 border-teal-800/60' },
    { label: 'إضافة مورد جديد', tab: 'suppliers' as TabType, icon: Truck, color: 'text-orange-400 bg-orange-950/60 border-orange-800/60' },
    { label: 'إضافة منتج إلى المخزون', tab: 'products' as TabType, icon: PackagePlus, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/50 p-5 sm:p-6 shadow-xl text-slate-100">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left Welcome Details */}
        <div className="space-y-2 text-right">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>لوحة التحكم التنفيذية والرقابة المالية</span>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {company?.currency || 'YER'} • {company?.code || 'MAIN'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>مرحبًا بك، {user?.fullName || user?.email?.split('@')[0] || 'المدير التنفيذي'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            إليك ملخص الأداء المالي، التدفقات النقدية، حركة المبيعات، ومراقبة الذمم والمخزون في الوقت الفعلي.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{todayStr}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>الفرع: <strong className="text-slate-200">{company?.name || 'المركز الرئيسي'}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>الفترة المالية: <strong className="text-slate-200">الربع الحالي {new Date().getFullYear()}</strong></span>
            </span>
          </div>
        </div>

        {/* Right Controls & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
          {/* Period Filter Tabs */}
          <div className="flex items-center bg-slate-900/90 border border-emerald-900/60 p-1 rounded-xl shadow-inner text-xs font-semibold">
            {[
              { id: 'today', label: 'اليوم' },
              { id: '7days', label: '7 أيام' },
              { id: 'month', label: 'الشهر' },
              { id: 'quarter', label: 'الربع' },
              { id: 'year', label: 'السنة' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPeriod && setSelectedPeriod(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === tab.id
                    ? 'bg-emerald-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh Data Button */}
          <button
            onClick={onRefresh}
            disabled={isActionLoading}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-900/60 text-slate-300 hover:text-emerald-300 hover:border-emerald-700 transition-all shadow-sm flex items-center justify-center disabled:opacity-50"
            title="تحديث مؤشرات وبيانات لوحة التحكم"
          >
            <RefreshCw className={`w-4 h-4 ${isActionLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* + New Operation Dropdown Button */}
          <div className="relative" ref={quickRef}>
            <button
              onClick={() => setIsQuickOpen(!isQuickOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ عملية جديدة</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isQuickOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-emerald-800/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                  إجراء عملية سريعة
                </div>
                <div className="space-y-1">
                  {quickActions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsQuickOpen(false);
                          if (onNavigate) onNavigate(action.tab);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg border ${action.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-xs">{action.label}</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
