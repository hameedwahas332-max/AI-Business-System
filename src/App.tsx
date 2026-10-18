import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { AuthModal } from './components/Auth/AuthModal';
import { GlobalSearchModal } from './components/Common/GlobalSearchModal';

import { OverviewTab } from './components/Dashboard/OverviewTab';
import { ProductionDataInitializationTab } from './components/Dashboard/ProductionDataInitializationTab';
import { WhatsAppManagerTab } from './components/Dashboard/WhatsAppManagerTab';
import { FinancialReportingHub } from './components/Dashboard/FinancialReportingHub';
import { RealBusinessOperationsTab } from './components/Dashboard/RealBusinessOperationsTab';
import { CustomerSuccessTab } from './components/Dashboard/CustomerSuccessTab';
import { ReportsTab } from './components/Dashboard/ReportsTab';
import { CashFlowForecastTab } from './components/Dashboard/CashFlowForecastTab';
import { NotificationsTab } from './components/Dashboard/NotificationsTab';
import { AIAssistantTab } from './components/Dashboard/AIAssistantTab';
import { OCRTab } from './components/Dashboard/OCRTab';
import { CustomersTab } from './components/Dashboard/CustomersTab';
import { SuppliersTab } from './components/Dashboard/SuppliersTab';
import { ProductsTab } from './components/Dashboard/ProductsTab';
import { InvoicesTab } from './components/Dashboard/InvoicesTab';
import { PurchaseInvoicesTab } from './components/Dashboard/PurchaseInvoicesTab';
import { PaymentsTab } from './components/Dashboard/PaymentsTab';
import { LedgerTab } from './components/Dashboard/LedgerTab';
import { InventoryTab } from './components/Dashboard/InventoryTab';
import { UsersTab } from './components/Dashboard/UsersTab';
import { RolesTab } from './components/Dashboard/RolesTab';
import { SubscriptionTab } from './components/Dashboard/SubscriptionTab';
import { EnterpriseControlCenterTab } from './components/Dashboard/EnterpriseControlCenterTab';
import { SystemHealthTab } from './components/Dashboard/SystemHealthTab';
import { BackupRestoreTab } from './components/Dashboard/BackupRestoreTab';
import { AuditTab } from './components/Dashboard/AuditTab';
import { SwaggerTab } from './components/Dashboard/SwaggerTab';
import { ProductionVerificationTab } from './components/Dashboard/ProductionVerificationTab';
import { TestRunnerTab } from './components/Dashboard/TestRunnerTab';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: TabType, extra?: any) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onNavigate={handleNavigate} />;
      case 'production_data_init':
        return <ProductionDataInitializationTab />;
      case 'whatsapp':
        return <WhatsAppManagerTab />;
      case 'financial_intelligence':
        return <FinancialReportingHub />;
      case 'real_business':
        return <RealBusinessOperationsTab />;
      case 'customer_success':
        return <CustomerSuccessTab />;
      case 'reports':
        return <ReportsTab />;
      case 'cashflow_forecast':
        return <CashFlowForecastTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'ai':
        return <AIAssistantTab />;
      case 'ocr':
        return <OCRTab />;
      case 'customers':
        return <CustomersTab />;
      case 'suppliers':
        return <SuppliersTab />;
      case 'products':
        return <ProductsTab />;
      case 'pos':
      case 'invoices':
        return <InvoicesTab />;
      case 'purchase_invoices':
        return <PurchaseInvoicesTab />;
      case 'payments':
        return <PaymentsTab />;
      case 'ledger':
        return <LedgerTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'users':
        return <UsersTab />;
      case 'roles':
        return <RolesTab />;
      case 'control_center':
        return <EnterpriseControlCenterTab />;
      case 'subscription':
        return <SubscriptionTab />;
      case 'observability':
        return <SystemHealthTab />;
      case 'backups':
        return <BackupRestoreTab />;
      case 'audit':
        return <AuditTab />;
      case 'swagger':
        return <SwaggerTab />;
      case 'production_verification':
        return <ProductionVerificationTab />;
      case 'test':
        return <TestRunnerTab />;
      default:
        return <OverviewTab onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden" dir="rtl">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Header
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenNotifications={() => setActiveTab('notifications')}
          onOpenGlobalSearch={() => setIsSearchOpen(true)}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {renderContent()}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
