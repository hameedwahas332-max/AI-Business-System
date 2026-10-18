import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  Sliders,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  History,
  FileCheck,
  Bot,
  Activity,
  Search,
  Sparkles,
  Layers,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  Zap,
  HelpCircle,
  Check,
  X,
  Clock,
  ArrowRight,
  Database,
  GitBranch,
} from 'lucide-react';

interface SettingItem {
  definition: {
    key: string;
    displayNameAr: string;
    displayNameEn: string;
    descriptionAr: string;
    category: string;
    allowedScopes: string[];
    dataType: string;
    defaultValue: any;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    isLocked: boolean;
    isMandatory: boolean;
    overrideAllowed: boolean;
    requiresApproval: boolean;
    rollbackSupported: boolean;
    validationRules?: any;
    dependencies?: string[];
    affectedModules: string[];
  };
  effectiveValue: any;
  sourceScope: string;
  sourceScopeId: string;
  isInherited: boolean;
  status: string;
  hierarchyChain: Array<{ scope: string; scopeId: string; value: any; isActive: boolean }>;
  hasPendingChangeRequest: boolean;
  hasDrift: boolean;
}

interface GovernanceState {
  companyId: string;
  safeModeEnabled: boolean;
  emergencyLockActive: boolean;
  emergencyLockReason?: string;
  expertModeEnabled: boolean;
  healthScore: number;
}

interface ChangeRequest {
  id: string;
  requestedByName: string;
  scope: string;
  settingKey: string;
  settingDisplayNameAr: string;
  oldValue: any;
  newValue: any;
  reason: string;
  riskLevel: string;
  status: string;
  createdAt: string;
}

const CATEGORY_NAMES_AR: Record<string, string> = {
  SYSTEM: 'نظام وتشغيل التطبيق',
  COMPANY: 'بيانات وهوية المنشأة',
  BRANCHES: 'الفروع ونقاط البيع',
  ROLES: 'الأدوار والمستخدمين',
  UI: 'الواجهة والتفضيلات',
  ACCOUNTING: 'السياسات المحاسبية',
  SALES: 'سياسات المبيعات والأسعار',
  PURCHASES: 'سياسات المشتريات والتوريد',
  INVENTORY: 'المخزون والمستودعات',
  CUSTOMERS: 'العملاء والائتمان',
  SUPPLIERS: 'الموردين والمدفوعات',
  PAYMENTS: 'طرق الدفع والتحصيل',
  CURRENCIES: 'العملات وأسعار الصرف',
  TAXES: 'الضرائب والفاتورة الإلكترونية',
  PRINTING: 'الطباعة ونماذج الفواتير',
  NOTIFICATIONS: 'الإشعارات والتنبيهات',
  WHATSAPP: 'تكامل ورسائل الواتساب',
  AI: 'المساعد الذكي للأعمال',
  SECURITY: 'الأمان وحماية البيانات',
  BACKUP: 'النسخ الاحتياطي والحفظ',
};

export const EnterpriseControlCenterTab: React.FC = () => {
  // Main view level
  const [activeLevel, setActiveLevel] = useState<'SETTINGS' | 'CONTROL_CENTER'>('SETTINGS');
  const [activeSubTab, setActiveSubTab] = useState<
    'OVERVIEW' | 'REQUESTS' | 'DRIFT' | 'VERSIONS' | 'SNAPSHOTS' | 'DIAGNOSTICS' | 'PRESETS' | 'AI_ASSISTANT'
  >('OVERVIEW');

  // Data states
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [governance, setGovernance] = useState<GovernanceState | null>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [drifts, setDrifts] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedScope, setSelectedScope] = useState<string>('COMPANY');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modals & details
  const [editingSetting, setEditingSetting] = useState<SettingItem | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [editReason, setEditReason] = useState<string>('');
  const [presetDiffModal, setPresetDiffModal] = useState<{ preset: any; diffs: any[] } | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<any>(null);

  // Fetch initial data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [settingsRes, govRes, crRes, presetsRes, snapshotsRes] = await Promise.all([
        api.getControlCenterSettings(),
        api.getControlCenterGovernance(),
        api.getControlCenterChangeRequests(),
        api.getControlCenterPresets(),
        api.getControlCenterSnapshots(),
      ]);

      if (settingsRes.success) setSettings(settingsRes.data);
      if (govRes.success) setGovernance(govRes.data);
      if (crRes.success) setChangeRequests(crRes.data);
      if (presetsRes.success) setPresets(presetsRes.data);
      if (snapshotsRes.success) setSnapshots(snapshotsRes.data);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'فشل تحميل بيانات مركز التحكم' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleApplySetting = async () => {
    if (!editingSetting) return;
    try {
      setActionLoading(true);
      const res = await api.applyControlCenterSetting({
        key: editingSetting.definition.key,
        value: editValue,
        scope: selectedScope,
        reason: editReason || 'تعديل عبر واجهة الإعدادات',
      });

      if (res.success) {
        setStatusMessage({
          type: res.data.requiresApproval ? 'info' : 'success',
          text: res.message || 'تم تحديث الإعداد بنجاح',
        });
        setEditingSetting(null);
        loadAllData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'فشل تطبيق الإعداد' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSafeMode = async () => {
    if (!governance) return;
    try {
      setActionLoading(true);
      const res = await api.setControlCenterSafeMode(!governance.safeModeEnabled);
      if (res.success) {
        setGovernance(res.data);
        setStatusMessage({ type: 'success', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEmergencyLock = async () => {
    if (!governance) return;
    const reason = prompt('أدخل سبب تفعيل أو إلغاء قفل الطوارئ (Emergency Safe Lock):', 'إجراء صيانة وحماية استثنائي');
    if (reason === null) return;

    try {
      setActionLoading(true);
      const res = await api.setControlCenterEmergencyLock(!governance.emergencyLockActive, reason);
      if (res.success) {
        setGovernance(res.data);
        setStatusMessage({ type: 'success', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await api.approveControlCenterChangeRequest(id);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        loadAllData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (id: string) => {
    const reason = prompt('أدخل سبب رفض طلب التعديل:', 'غير متوافق مع السياسات المحاسبية');
    if (!reason) return;
    try {
      setActionLoading(true);
      const res = await api.rejectControlCenterChangeRequest(id, reason);
      if (res.success) {
        setStatusMessage({ type: 'info', text: res.message });
        loadAllData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanDrift = async () => {
    try {
      setActionLoading(true);
      const res = await api.scanControlCenterDrift();
      if (res.success) {
        setDrifts(res.data.drifts || []);
        setStatusMessage({
          type: res.data.hasDrift ? 'error' : 'success',
          text: res.data.hasDrift
            ? `تم اكتشاف ${res.data.driftCount} انحرافاً في الإعدادات بحاجة لمعالجة`
            : 'تم الفحص بنجاح: لا توجد أي انحرافات غير مصرح بها في النظام',
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReconcileDrift = async (drift: any) => {
    try {
      setActionLoading(true);
      const res = await api.reconcileControlCenterDrift({
        settingKey: drift.settingKey,
        scope: drift.scope,
        scopeId: drift.scopeId,
      });
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        handleScanDrift();
        loadAllData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLoadDiagnostics = async () => {
    try {
      setActionLoading(true);
      const res = await api.getControlCenterDiagnostics();
      if (res.success) {
        setDiagnostics(res.data.answers || []);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLoadVersions = async () => {
    try {
      setActionLoading(true);
      const res = await api.getControlCenterVersions();
      if (res.success) {
        setVersions(res.data || []);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreviewPreset = async (preset: any) => {
    try {
      setActionLoading(true);
      const res = await api.previewControlCenterPreset(preset.id);
      if (res.success) {
        setPresetDiffModal({ preset, diffs: res.data });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      setActionLoading(true);
      const res = await api.applyControlCenterPreset(presetId);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setPresetDiffModal(null);
        loadAllData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConsultAI = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setActionLoading(true);
      const res = await api.consultControlCenterAIAssistant(aiPrompt);
      if (res.success) {
        setAiResponse(res.data);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    const name = prompt('أدخل اسم لقطة الإعدادات:', `Snapshot-${new Date().toLocaleDateString('ar-SA')}`);
    if (!name) return;
    try {
      setActionLoading(true);
      const res = await api.createControlCenterSnapshot({ name, description: 'لقطة يدوية لحفظ الحالة المستقرة' });
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        loadAllData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreSnapshot = async (id: string) => {
    if (!confirm('هل أنت متأكد من استعادة هذه اللقطة؟ سيتم إرجاع كافة الإعدادات القابلة للتراجع إلى قيمها السابقة.')) return;
    try {
      setActionLoading(true);
      const res = await api.restoreControlCenterSnapshot(id);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        loadAllData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter settings
  const filteredSettings = settings.filter((s) => {
    const matchCat = selectedCategory === 'ALL' || s.definition.category === selectedCategory;
    const matchQuery =
      !searchQuery ||
      s.definition.displayNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.definition.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.definition.descriptionAr && s.definition.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  const categories: string[] = ['ALL', ...Array.from(new Set<string>(settings.map((s) => String(s.definition.category))))];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800">حرج للغاية (Critical)</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">عالي التأثير (High)</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-950 text-sky-300 border border-sky-800">متوسط (Medium)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">منخفض (Low)</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Locked':
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800"><Lock className="w-3 h-3" /> مقفل أساسي</span>;
      case 'Pending Approval':
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800"><Clock className="w-3 h-3" /> قيد المراجعة</span>;
      case 'Drifted':
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800"><AlertTriangle className="w-3 h-3" /> انحراف غير مصرح</span>;
      case 'Custom':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800">مخصص للمنشأة</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">موروث (نظامي)</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-100" dir="rtl">
      {/* Top Banner & Two-Level Mode Switcher */}
      <div className="bg-slate-900/90 border border-emerald-900/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                الإعدادات ومركز التحكم
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  Enterprise Suite
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                الحوكمة الشاملة، إدارة السياسات، أمان البيانات، دورة التعديل، والتحكم الفني المتقدم
              </p>
            </div>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              id="btn-switch-settings"
              onClick={() => setActiveLevel('SETTINGS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeLevel === 'SETTINGS'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              المستوى 1: إعدادات المنظومة
            </button>
            <button
              id="btn-switch-control-center"
              onClick={() => setActiveLevel('CONTROL_CENTER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeLevel === 'CONTROL_CENTER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              المستوى 2: مركز التحكم والسياسات
            </button>
          </div>
        </div>

        {/* Governance KPI Bar */}
        {governance && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400">مؤشر صحة الإعدادات</div>
              <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <Activity className="w-4 h-4" />
                {governance.healthScore}%
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400">حالة الوضع الآمن (Safe Mode)</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className={`text-xs font-bold ${governance.safeModeEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {governance.safeModeEnabled ? 'مفعّل (محمي)' : 'معطل'}
                </span>
                <button
                  id="btn-toggle-safemode"
                  onClick={handleToggleSafeMode}
                  disabled={actionLoading}
                  className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700"
                >
                  {governance.safeModeEnabled ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400">قفل الطوارئ (Emergency Lock)</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className={`text-xs font-bold ${governance.emergencyLockActive ? 'text-rose-400' : 'text-slate-400'}`}>
                  {governance.emergencyLockActive ? 'مغلق (نشط)' : 'مفتوح'}
                </span>
                <button
                  id="btn-toggle-emergency-lock"
                  onClick={handleToggleEmergencyLock}
                  disabled={actionLoading}
                  className={`text-[11px] px-2 py-0.5 rounded border ${
                    governance.emergencyLockActive
                      ? 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {governance.emergencyLockActive ? 'إلغاء القفل' : 'قفل فوري'}
                </button>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400">الطلبات المعلقة</div>
              <div className="text-lg font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                <FileCheck className="w-4 h-4" />
                {changeRequests.filter((cr) => cr.status === 'PENDING_REVIEW').length} طلب
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification / Toast Message */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-800 text-rose-300'
              : 'bg-sky-950/80 border-sky-800 text-sky-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {statusMessage.type === 'info' && <Sparkles className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 1: ENTERPRISE SETTINGS (20 Categories, Scope Selector, Value Tuning) */}
      {/* ========================================================================= */}
      {activeLevel === 'SETTINGS' && (
        <div className="space-y-5">
          {/* Controls Bar: Search & Category Filter & Scope Selector */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                id="input-search-settings"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في كافة إعدادات وسياسات المنظومة (بالاسم، الكود، الوصف)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Scope Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">نطاق التعديل:</span>
              <select
                id="select-scope"
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="COMPANY">المنشأة العامة (Company Default)</option>
                <option value="BRANCH">الفرع (Branch)</option>
                <option value="ROLE">الدور الوظيفي (Role)</option>
                <option value="USER">المستخدم (User)</option>
              </select>
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'كافة الفئات (20 مجالاً)' : (CATEGORY_NAMES_AR as Record<string, string>)[String(cat)] || String(cat)}
              </button>
            ))}
          </div>

          {/* Settings Grid */}
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
              جاري جلب إعدادات المنظومة وسلاسل التوريث...
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400">
              لا توجد إعدادات مطابقة لبحثك في الفئة المحددة.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSettings.map((item) => (
                <div
                  key={item.definition.key}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          {item.definition.displayNameAr}
                          {item.definition.isMandatory && (
                            <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-900/50">
                              إلزامي
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{item.definition.key}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getRiskBadge(item.definition.riskLevel)}
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {item.definition.descriptionAr}
                    </p>

                    {/* Value Preview */}
                    <div className="mt-3 bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">القيمة الفعالة:</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {typeof item.effectiveValue === 'boolean'
                          ? item.effectiveValue
                            ? 'مفعّل (True)'
                            : 'معطل (False)'
                          : JSON.stringify(item.effectiveValue)}
                      </span>
                    </div>

                    {/* Affected Modules */}
                    {item.definition.affectedModules.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <span className="text-[10px] text-slate-500">الوحدات المتأثرة:</span>
                        {item.definition.affectedModules.map((m) => (
                          <span key={m} className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      المصدر: {item.sourceScope} ({item.sourceScopeId})
                    </span>
                    <button
                      id={`btn-edit-${item.definition.key}`}
                      onClick={() => {
                        setEditingSetting(item);
                        setEditValue(item.effectiveValue);
                        setEditReason('');
                      }}
                      disabled={item.definition.isLocked}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                        item.definition.isLocked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      {item.definition.isLocked ? 'مقفل نظامياً' : 'تعديل الإعداد'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: ADVANCED CONTROL CENTER (Governance, Audit, Rollback, Drift, AI) */}
      {/* ========================================================================= */}
      {activeLevel === 'CONTROL_CENTER' && (
        <div className="space-y-5">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'OVERVIEW' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              لوحة الحوكمة والسلامة
            </button>
            <button
              onClick={() => setActiveSubTab('REQUESTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'REQUESTS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              مركز الموافقات والتغييرات ({changeRequests.filter((c) => c.status === 'PENDING_REVIEW').length})
            </button>
            <button
              onClick={() => {
                setActiveSubTab('DRIFT');
                handleScanDrift();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'DRIFT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              فاحص الانحراف (Drift Scanner)
            </button>
            <button
              onClick={() => {
                setActiveSubTab('VERSIONS');
                handleLoadVersions();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'VERSIONS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              سجل الإصدارات والتراجع
            </button>
            <button
              onClick={() => setActiveSubTab('SNAPSHOTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'SNAPSHOTS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              لقطات النظام والحالة المستقرة (LKG)
            </button>
            <button
              onClick={() => {
                setActiveSubTab('DIAGNOSTICS');
                handleLoadDiagnostics();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'DIAGNOSTICS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              فاحص التشخيص (10 أسئلة)
            </button>
            <button
              onClick={() => setActiveSubTab('PRESETS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'PRESETS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              الإعدادات الجاهزة للأنشطة (Presets)
            </button>
            <button
              onClick={() => setActiveSubTab('AI_ASSISTANT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'AI_ASSISTANT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              المساعد الذكي للسياسات (AI)
            </button>
          </div>

          {/* SubTab 1: Overview & Governance */}
          {activeSubTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  سياسات السلامة والحوكمة الإلزامية
                </h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">الوضع الآمن (Safe Mode)</div>
                      <div className="text-[11px] text-slate-400">إلزامية تحويل التعديلات الحرجة إلى طلبات تغيير تتطلب موافقة رسمية</div>
                    </div>
                    <span className="text-emerald-400 font-bold">نشط</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">حماية المبادئ المحاسبية المقفلة</div>
                      <div className="text-[11px] text-slate-400">منع أي مساس بمبدأ القيد المزدوج الإلزامي</div>
                    </div>
                    <span className="text-purple-400 font-bold">مقفل نظامياً</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">التراجع التلقائي الآمن (Auto-Rollback)</div>
                      <div className="text-[11px] text-slate-400">فحص فوري بعد كل تعديل والتراجع الفوري في حال حدوث أي خلل</div>
                    </div>
                    <span className="text-emerald-400 font-bold">مفعّل</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  هيكلية التوريث الصارمة (Hierarchy Order)
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono text-[10px]">1</span>
                    <span className="font-bold text-white">النظام الأساسي (SYSTEM)</span> - القيمة الافتراضية العالمية
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono text-[10px]">2</span>
                    <span className="font-bold text-white">المنشأة (COMPANY)</span> - سياسات وهوية المنشأة العامة
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono text-[10px]">3</span>
                    <span className="font-bold text-white">الفرع (BRANCH)</span> - تخصيصات الفروع المستقلة
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono text-[10px]">4</span>
                    <span className="font-bold text-white">الدور (ROLE)</span> - قيود وحدود الصلاحيات الوظيفية
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono text-[10px]">5</span>
                    <span className="font-bold text-white">المستخدم (USER)</span> - التفضيلات الشخصية والواجهة
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Change Requests & Approvals */}
          {activeSubTab === 'REQUESTS' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                سجل طلبات التعديل والموافقات المعلقة
              </h3>
              {changeRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">لا توجد طلبات تعديل معلقة حالياً.</div>
              ) : (
                <div className="space-y-3">
                  {changeRequests.map((cr) => (
                    <div
                      key={cr.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{cr.settingDisplayNameAr}</span>
                          <span className="text-[10px] font-mono text-slate-500">{cr.settingKey}</span>
                          {getRiskBadge(cr.riskLevel)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">السبب: {cr.reason}</div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                          <span>طالب التعديل: {cr.requestedByName}</span>
                          <span>القيمة الحالية: {JSON.stringify(cr.oldValue)}</span>
                          <ArrowRight className="w-3 h-3 inline text-emerald-400" />
                          <span className="text-emerald-400 font-bold">القيمة المقترحة: {JSON.stringify(cr.newValue)}</span>
                        </div>
                      </div>

                      {cr.status === 'PENDING_REVIEW' ? (
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-approve-cr-${cr.id}`}
                            onClick={() => handleApproveRequest(cr.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            اعتماد وتطبيق
                          </button>
                          <button
                            id={`btn-reject-cr-${cr.id}`}
                            onClick={() => handleRejectRequest(cr.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            رفض
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">{cr.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab 3: Drift Scanner */}
          {activeSubTab === 'DRIFT' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  فاحص الانحرافات والمطابقة التلقائية (Drift Scanner)
                </h3>
                <button
                  id="btn-re-scan-drift"
                  onClick={handleScanDrift}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  إعادة الفحص الآن
                </button>
              </div>

              {drifts.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800 text-emerald-400 text-xs flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  النظام متطابق تماماً مع السياسات الأساسية المعتمدة ولا توجد أي انحرافات مسجلة.
                </div>
              ) : (
                <div className="space-y-3">
                  {drifts.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl bg-slate-950 border border-rose-900/60 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-bold text-sm text-rose-300 flex items-center gap-2">
                          {d.settingDisplayNameAr}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                            {d.driftType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">
                          القيمة المتوقعة: {JSON.stringify(d.expectedValue)} | القيمة المكتشفة: {JSON.stringify(d.actualValue)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleReconcileDrift(d)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        معالجة واستعادة الأصل
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab 4: Versions & History */}
          {activeSubTab === 'VERSIONS' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                سجل الإصدارات وتاريخ التعديلات
              </h3>
              {versions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">لا توجد إصدارات سابقة مسجلة.</div>
              ) : (
                <div className="space-y-2">
                  {versions.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          #{v.versionNumber}
                        </span>
                        <div>
                          <div className="font-bold text-white">{v.settingDisplayNameAr}</div>
                          <div className="text-[11px] text-slate-400">{v.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                        <span>بواسطة: {v.changerName}</span>
                        <span>{new Date(v.createdAt).toLocaleString('ar-SA')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab 5: Snapshots & LKG */}
          {activeSubTab === 'SNAPSHOTS' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  لقطات النظام والحالة المستقرة الموثوقة (Last Known Good)
                </h3>
                <button
                  id="btn-create-snapshot"
                  onClick={handleCreateSnapshot}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  إنشاء لقطة جديدة الآن
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {snapshots.map((snap) => (
                  <div key={snap.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{snap.name}</span>
                      {snap.isLastKnownGood && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          حالة موثوقة (LKG)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{snap.description}</p>
                    <div className="text-[10px] font-mono text-slate-500 truncate">SHA-256: {snap.checksum}</div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{new Date(snap.createdAt).toLocaleDateString('ar-SA')}</span>
                      <button
                        onClick={() => handleRestoreSnapshot(snap.id)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                      >
                        استعادة هذه اللقطة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 6: Diagnostics 10 Questions */}
          {activeSubTab === 'DIAGNOSTICS' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                فاحص التشخيص والمساءلة الفنية (10 أسئلة إلزامية)
              </h3>
              <div className="space-y-3">
                {diagnostics.map((d, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-xs text-emerald-400 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-mono text-[10px] border border-emerald-800">
                        {idx + 1}
                      </span>
                      {d.questionAr}
                    </div>
                    <div className="text-xs text-slate-300 pr-7">{d.answerAr}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 7: Business Presets */}
          {activeSubTab === 'PRESETS' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                الإعدادات الجاهزة للأنشطة التجارية (Business Presets)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presets.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{p.nameAr}</div>
                      <p className="text-xs text-slate-400 mt-1">{p.descriptionAr}</p>
                      <div className="mt-3 text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/40">
                        يوصى به لـ: {p.recommendedFor}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{Object.keys(p.settings || {}).length} إعداداً مخصصاً</span>
                      <button
                        onClick={() => handlePreviewPreset(p)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        معاينة الفروقات وتطبيق
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 8: AI Configuration Assistant */}
          {activeSubTab === 'AI_ASSISTANT' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Bot className="w-5 h-5 text-emerald-400" />
                المساعد الذكي لصياغة السياسات والإعدادات (AI Copilot)
              </div>
              <p className="text-xs text-slate-400">
                اطرح أي استفسار باللغة الطبيعية (مثل: "كيف أمنع البيع الآجل؟"، "تفعيل الضريبة 15%") وسيقوم المساعد بتحليل الأثر وصياغة مقترح رسمي.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConsultAI()}
                  placeholder="اكتب استفسارك أو الإعداد الذي تريد تغييره هنا..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleConsultAI}
                  disabled={actionLoading || !aiPrompt.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  استشارة
                </button>
              </div>

              {aiResponse && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs text-slate-200">{aiResponse.messageAr}</div>
                  {aiResponse.proposals && aiResponse.proposals.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="text-[11px] font-bold text-amber-400">المقترحات المصاغة للمراجعة:</div>
                      {aiResponse.proposals.map((prop: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-white">{prop.settingDisplayNameAr}</div>
                            <div className="text-[11px] text-slate-400">{prop.reasonAr}</div>
                            <div className="text-[10px] font-mono text-emerald-400 mt-1">
                              القيمة المقترحة: {JSON.stringify(prop.suggestedValue)}
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                setActionLoading(true);
                                const res = await api.applyControlCenterSetting({
                                  key: prop.settingKey,
                                  value: prop.suggestedValue,
                                  reason: prop.reasonAr,
                                });
                                setStatusMessage({ type: 'info', text: res.message });
                                loadAllData();
                              } catch (err: any) {
                                setStatusMessage({ type: 'error', text: err.message });
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                          >
                            رفع طلب اعتماد
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Setting Edit Modal Dialog */}
      {editingSetting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">تعديل الإعداد: {editingSetting.definition.displayNameAr}</h3>
              <button onClick={() => setEditingSetting(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-400">{editingSetting.definition.descriptionAr}</div>

              {/* Value Input depending on data type */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">القيمة الجديدة:</label>
                {editingSetting.definition.dataType === 'boolean' ? (
                  <select
                    value={editValue ? 'true' : 'false'}
                    onChange={(e) => setEditValue(e.target.value === 'true')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="true">مفعّل (True / نعم)</option>
                    <option value="false">معطل (False / لا)</option>
                  </select>
                ) : editingSetting.definition.validationRules?.options ? (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    {editingSetting.definition.validationRules.options.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.labelAr || opt.value}
                      </option>
                    ))}
                  </select>
                ) : editingSetting.definition.dataType === 'integer' ||
                  editingSetting.definition.dataType === 'decimal' ||
                  editingSetting.definition.dataType === 'percentage' ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">سبب التعديل (إلزامي للتدقيق):</label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="أدخل مبرر التعديل الفني أو الإداري..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              {/* Safety notice */}
              {editingSetting.definition.riskLevel === 'CRITICAL' || editingSetting.definition.riskLevel === 'HIGH' ? (
                <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    هذا الإعداد عالي التأثير ({editingSetting.definition.riskLevel}). في ظل تفعيل الوضع الآمن، سيتم توجيه
                    طلبك كطلب تغيير للمراجعة والاعتماد.
                  </span>
                </div>
              ) : null}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingSetting(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                إلغاء
              </button>
              <button
                id="btn-confirm-save-setting"
                onClick={handleApplySetting}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                حفظ وتطبيق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Diff Modal Dialog */}
      {presetDiffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">معاينة فروقات الإعداد الجاهز: {presetDiffModal.preset.nameAr}</h3>
              <button onClick={() => setPresetDiffModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar">
              {presetDiffModal.diffs.map((d: any) => (
                <div
                  key={d.key}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    d.willChange
                      ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white">{d.displayNameAr}</div>
                    <div className="font-mono text-[10px] text-slate-500">{d.key}</div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span>{JSON.stringify(d.currentValue)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-400">{JSON.stringify(d.presetValue)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">سيتم أخذ لقطة حماية تلقائية قبل التطبيق.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPresetDiffModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  id="btn-confirm-apply-preset"
                  onClick={() => handleApplyPreset(presetDiffModal.preset.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  تأكيد وتطبيق الإعداد الجاهز
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
