import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { TabType } from '../Sidebar';
import { DashboardHeader } from './Overview/DashboardHeader';
import { CashFlowTreasuryCenter } from './Overview/CashFlowTreasuryCenter';
import { SalesAnalyticsCenter } from './Overview/SalesAnalyticsCenter';
import { ReceivablesPayablesHub } from './Overview/ReceivablesPayablesHub';
import { InventoryIntelligenceHub } from './Overview/InventoryIntelligenceHub';
import { SmartAlertsAIWidget } from './Overview/SmartAlertsAIWidget';
import { RecentOperationsFeed } from './Overview/RecentOperationsFeed';
import { SystemStatusAuditWidget } from './Overview/SystemStatusAuditWidget';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface OverviewTabProps {
  onNavigate?: (tab: TabType, extra?: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate }) => {
  const { company, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [topData, setTopData] = useState<any>(null);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [purchaseInvoicesList, setPurchaseInvoicesList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [currency, setCurrency] = useState<string>(company?.currency || 'YER');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('today');

  const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.rows)) return res.rows;
    if (res.data && typeof res.data === 'object') {
      for (const key of ['customers', 'suppliers', 'products', 'invoices', 'payments', 'logs', 'audit_logs', 'items', 'movements']) {
        if (Array.isArray(res.data[key])) return res.data[key];
      }
    }
    return [];
  };

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        statsRes,
        paymentsStatsRes,
        customersRes,
        suppliersRes,
        productsRes,
        invoicesRes,
        purchaseInvoicesRes,
        paymentsRes,
        auditLogsRes,
      ] = await Promise.all([
        api.getFinancialHealth().catch(() => ({ data: null })),
        api.getPaymentStats().catch(() => ({ data: null })),
        api.getCustomers().catch(() => ({ data: [] })),
        api.getSuppliers().catch(() => ({ data: [] })),
        api.getProducts().catch(() => ({ data: [] })),
        api.getInvoices().catch(() => ({ data: [] })),
        api.getPurchaseInvoices().catch(() => ({ data: [] })),
        api.getPayments().catch(() => ({ data: [] })),
        api.getAuditLogs ? api.getAuditLogs({ limit: 10 }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      const safeCust = extractArray(customersRes);
      const safeSupp = extractArray(suppliersRes);
      const safeProd = extractArray(productsRes);
      const safeInv = extractArray(invoicesRes);
      const safePurch = extractArray(purchaseInvoicesRes);
      const safePmts = extractArray(paymentsRes);
      const safeLogs = extractArray(auditLogsRes);

      setCustomersList(safeCust);
      setSuppliersList(safeSupp);
      setProductsList(safeProd);
      setInvoicesList(safeInv);
      setPurchaseInvoicesList(safePurch);
      setPaymentsList(safePmts);
      setAuditLogsList(safeLogs);

      setStats({
        ...(statsRes?.data || {}),
        payments: paymentsStatsRes?.data || null,
        productCount: safeProd.length,
        totalSales: statsRes?.data?.totalSales ?? safeInv.reduce((sum: number, i: any) => sum + Number(i.total || 0), 0),
        totalPurchases: statsRes?.data?.totalPurchases ?? safePurch.reduce((sum: number, p: any) => sum + Number(p.total || 0), 0),
      });

      setTopData({
        topCustomers: safeCust.slice(0, 5),
        topSuppliers: safeSupp.slice(0, 5),
        topProducts: safeProd.slice(0, 5),
      });

      if (company?.currency) {
        setCurrency(company.currency);
      }
    } catch (err: any) {
      setError(err.message || 'فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [company?.id]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24 text-slate-100">
      {/* Header & Quick Actions */}
      <DashboardHeader
        company={company}
        user={user}
        currency={currency}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        isLoading={loading}
        loading={loading}
        onRefresh={fetchOverviewData}
        onNavigate={onNavigate}
      />

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-xs text-rose-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchOverviewData}
            className="flex items-center gap-1 font-bold underline hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treasury & Cash Flow */}
        <div className="lg:col-span-2 space-y-6">
          <CashFlowTreasuryCenter
            stats={stats}
            currency={currency}
            onNavigate={onNavigate}
          />
          <SalesAnalyticsCenter
            stats={stats}
            topData={topData}
            currency={currency}
            onNavigate={onNavigate}
          />
          <ReceivablesPayablesHub
            stats={stats}
            topData={topData}
            customersList={customersList}
            suppliersList={suppliersList}
            currency={currency}
            onNavigate={onNavigate}
          />
        </div>

        {/* Intelligence, Alerts & Recent Activity Side Panel */}
        <div className="space-y-6">
          <SmartAlertsAIWidget stats={stats} currency={currency} onNavigate={onNavigate} />
          <InventoryIntelligenceHub
            stats={stats}
            productsList={productsList}
            currency={currency}
            onNavigate={onNavigate}
          />
          <RecentOperationsFeed
            invoices={invoicesList}
            purchaseInvoices={purchaseInvoicesList}
            payments={paymentsList}
            currency={currency}
            onNavigate={onNavigate}
          />
          <SystemStatusAuditWidget
            auditLogs={auditLogsList}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
