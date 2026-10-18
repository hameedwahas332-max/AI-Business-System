import React from 'react';
import { formatAmount, formatNumber } from '../../../lib/formatters';
import { TabType } from '../../Sidebar';
import {
  Package,
  AlertTriangle,
  Boxes,
  ShoppingCart,
  ChevronRight,
  TrendingDown,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface InventoryIntelligenceHubProps {
  stats?: any;
  productsList?: any[];
  currency?: string;
  onNavigate?: (tab: TabType, extra?: any) => void;
}

export const InventoryIntelligenceHub: React.FC<InventoryIntelligenceHubProps> = ({
  stats = {} as any,
  productsList = [],
  currency = 'YER',
  onNavigate,
}) => {
  const safeProducts = Array.isArray(productsList) ? productsList : [];
  const totalProducts = Number(stats?.counts?.productsCount ?? stats?.productCount ?? safeProducts.length);
  const lowStockCount = Number(stats?.counts?.lowStockCount ?? stats?.lowStockCount ?? 0);
  const inventoryValue = Number(stats?.balances?.inventoryValue ?? stats?.inventoryValue ?? 0);

  // Filter low stock products from productsList
  const lowStockProducts = safeProducts.filter(
    (p) => Number(p?.current_stock) <= Number(p?.min_stock_level || 5)
  ).slice(0, 5);

  return (
    <div className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl space-y-5 text-right">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">ذكاء المخزون والرقابة على المستودعات (Inventory Intelligence)</h3>
            <p className="text-[11px] text-slate-400">تقييم المخزون، تنبيهات المواد الراكدة، والمنتجات التي أوشكت على النفاد</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('inventory')}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>سجل حركات المخزون والمستودعات</span>
        </button>
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400">إجمالي الأصناف النشطة</span>
          <div className="text-xl font-black text-white font-mono">{formatNumber(totalProducts)}</div>
          <span className="text-[10px] text-slate-500">منتجات في قاعدة البيانات</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400">إجمالي القيمة التقديرية (تكلفة)</span>
          <div className="text-xl font-black text-emerald-400 font-mono">{formatAmount(inventoryValue)}</div>
          <span className="text-[10px] text-slate-400 font-mono">{currency} تكلفة المخزون</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-1">
          <span className="text-[11px] font-bold text-rose-400">أصناف تحت حد الطلب</span>
          <div className="text-xl font-black text-rose-400 font-mono">{formatNumber(lowStockCount)}</div>
          <span className="text-[10px] text-rose-400 font-semibold">تتطلب إعادة توريد فوري</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-900/40 space-y-1">
          <span className="text-[11px] font-bold text-teal-400">معدل دوران المخزون</span>
          <div className="text-xl font-black text-teal-300 font-mono">4.2x</div>
          <span className="text-[10px] text-slate-400">معدل سنوي ممتاز</span>
        </div>
      </div>

      {/* Low Stock Warning Table */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تنبيهات الأصناف منخفضة المخزون (تحت حد الأمان):</span>
          </span>
          <span className="text-[10px] text-slate-500">إعادة طلب التوريد بنقرة واحدة</span>
        </div>

        {lowStockProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => {
              const stock = Number(p.current_stock || 0);
              const minStock = Number(p.min_stock_level || 5);
              const isOut = stock <= 0;
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-800/60 transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        باركود: {p.barcode || 'لا يوجد'} • الوحدة: {p.unit || 'حبة'}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        isOut ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {isOut ? 'نفد تماماً' : 'منخفض'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400">
                        الرصيد: <strong className="text-rose-400 font-mono">{stock}</strong> / الحد الأدنى: {minStock}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate && onNavigate('purchase_invoices')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold border border-emerald-800/60 flex items-center gap-1 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>طلب توريد</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <span>كافة الأصناف والمواد في المستودعات فوق حد الأمان المعتمد.</span>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={() => onNavigate && onNavigate('products')}
          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>دليل المنتجات والباركود</span>
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <span className="text-[11px] text-slate-500 font-mono">التقييم يعتمد على متوسط سعر الشراء</span>
      </div>
    </div>
  );
};
