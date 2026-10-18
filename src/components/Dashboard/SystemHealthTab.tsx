import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { EnterpriseObservabilityDashboard } from '../EnterpriseObservabilityDashboard';
import { DataGovernanceDashboard } from '../DataGovernanceDashboard';
import {
  Activity,
  Database,
  Server,
  Clock,
  HardDrive,
  Cpu,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Mail,
  MessageSquare,
  Bot,
  CreditCard,
  Layers,
  CheckCircle2,
  Code2,
} from 'lucide-react';

export const SystemHealthTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'observability_8_9' | 'data_governance_8_10' | 'system_metrics'>('observability_8_9');
  const [metrics, setMetrics] = useState<any>(null);
  const [prometheusRaw, setPrometheusRaw] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'dashboard' | 'prometheus'>('dashboard');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = api.getToken();
      const res = await fetch('/api/v1/system/metrics?format=json', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('غير مصرح: هذه الشاشة مخصصة لمديري النظام (Admin) فقط');
        }
        throw new Error(`فشل جلب المقاييس (${res.status})`);
      }

      const data = await res.json();
      setMetrics(data);

      // Fetch prometheus text as well for raw preview mode
      const rawRes = await fetch('/api/v1/system/metrics', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'text/plain',
        },
      });
      if (rawRes.ok) {
        const text = await rawRes.text();
        setPrometheusRaw(text);
      }
    } catch (err: any) {
      setError(err?.message || 'تعذر الاتصال بمركز المقاييس التشغيلية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">جاري فحص حالة النظام وتجميع المقاييس التشغيلية...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-800/50 rounded-2xl text-red-300 space-y-3">
        <div className="flex items-center gap-2 font-bold text-red-400 text-lg">
          <AlertTriangle className="w-5 h-5" />
          <span>تنبيه الوصول لمقاييس النظام</span>
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-red-800/40 hover:bg-red-800/60 border border-red-700/50 rounded-xl text-xs font-semibold text-red-200 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  const db = metrics?.database || {};
  const runtime = metrics?.runtime || {};
  const http = metrics?.http || {};
  const providers = metrics?.providers || {};
  const scheduler = metrics?.scheduler || {};

  return (
    <div className="space-y-6 text-slate-200">
      {/* Sub-Tab Selector */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-sm font-semibold w-fit">
        <button
          onClick={() => setActiveSubTab('observability_8_9')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'observability_8_9'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          منصة المراقبة والتتبع الموزع والذكاء الاصطناعي للحوادث (Phase 8.9)
        </button>
        <button
          onClick={() => setActiveSubTab('data_governance_8_10')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'data_governance_8_10'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          حكومة البيانات والخصوصية والامتثال (Phase 8.10)
        </button>
        <button
          onClick={() => setActiveSubTab('system_metrics')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'system_metrics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          مقاييس النظام و Prometheus (Phase 7.8)
        </button>
      </div>

      {activeSubTab === 'observability_8_9' ? (
        <EnterpriseObservabilityDashboard />
      ) : activeSubTab === 'data_governance_8_10' ? (
        <DataGovernanceDashboard />
      ) : (
        <>
          {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-emerald-900/50 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-100">صحّة النظام والمراقبة التشغيلية</h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded-full border border-emerald-500/30 font-bold">
              Phase 7.8
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            مراقبة الأداء، جاهزية الخدمات، الذاكرة، والمقاييس المتوافقة مع Prometheus بدون تسريب أي بيانات مالية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'dashboard' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اللوحة التفاعلية
            </button>
            <button
              onClick={() => setViewMode('prometheus')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'prometheus' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Prometheus Raw
            </button>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>تحديث تلقائي (10ث)</span>
          </button>

          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 transition-all disabled:opacity-50"
            title="تحديث الآن"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {viewMode === 'prometheus' ? (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Prometheus Plain-Text Metric Output (v0.0.4)</span>
            </span>
            <span className="text-[10px] text-slate-500">GET /api/v1/system/metrics</span>
          </div>
          <pre className="p-4 bg-slate-900 rounded-xl overflow-x-auto text-emerald-400 text-[11px] leading-relaxed max-h-[600px]">
            {prometheusRaw || 'جاري تحميل مقاييس Prometheus...'}
          </pre>
        </div>
      ) : (
        <>
          {/* Top Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Status */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">حالة بيئة النظام</div>
                <div className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>نشط ومستقر</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Uptime: {Math.floor((runtime.uptimeSeconds || 0) / 60)}m {((runtime.uptimeSeconds || 0) % 60)}s
                </div>
              </div>
            </div>

            {/* Database Health */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">قاعدة البيانات (PostgreSQL)</div>
                <div className="text-lg font-bold text-slate-100 mt-0.5">
                  {db.status === 'healthy' ? 'سليمة (Healthy)' : 'تأخر بالاستجابة'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Latency: {db.latencyMs || 0} ms | Tables: {db.tablesCount || 0}
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">ذاكرة Node.js (Heap)</div>
                <div className="text-lg font-bold text-slate-100 mt-0.5">
                  {runtime.memory?.heapUsedMb || 0} MB
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Total: {runtime.memory?.heapTotalMb || 0} MB | RSS: {runtime.memory?.rssMb || 0} MB
                </div>
              </div>
            </div>

            {/* Active Requests & Latency */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">إجمالي طلبات HTTP</div>
                <div className="text-lg font-bold text-slate-100 mt-0.5">
                  {http.totalRequests || 0} طلب
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Instance ID: {metrics?.serviceInstanceId?.substring(0, 16)}...
                </div>
              </div>
            </div>
          </div>

          {/* External Services & Providers Health Grid */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>جاهزية المزوّدات والخدمات الخارجية (External Providers)</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Zero Key Redaction Enforced</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Storage */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span>التخزين (Storage)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Provider: <span className="text-slate-200">{providers.storage?.provider || 'local'}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                  {providers.storage?.status || 'HEALTHY'}
                </div>
              </div>

              {/* Email */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>البريد (Email)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Provider: <span className="text-slate-200">{providers.email?.provider || 'mock'}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                  {providers.email?.status || 'HEALTHY'}
                </div>
              </div>

              {/* WhatsApp */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>واتساب (WhatsApp)</span>
                  </div>
                  {providers.whatsapp?.status === 'HEALTHY' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Provider: <span className="text-slate-200">{providers.whatsapp?.provider || 'mock'}</span>
                </div>
                <div className={`text-[10px] font-semibold px-2 py-0.5 rounded border w-fit ${
                  providers.whatsapp?.status === 'HEALTHY'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {providers.whatsapp?.status || 'NOT_CONFIGURED'}
                </div>
              </div>

              {/* AI Gemini */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>الذكاء الاصطناعي (AI)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Engine: <span className="text-slate-200">{providers.ai?.provider || 'gemini'}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                  {providers.ai?.status || 'HEALTHY'}
                </div>
              </div>

              {/* Billing */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <CreditCard className="w-4 h-4 text-rose-400" />
                    <span>الاشتراكات (Billing)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Provider: <span className="text-slate-200">{providers.billing?.provider || 'mock_saas'}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                  {providers.billing?.status || 'HEALTHY'}
                </div>
              </div>
            </div>
          </div>

          {/* Scheduler & Route Analytics Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Background Scheduler Details */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>جدولة المهام الخلفية (Background Scheduler)</span>
              </h3>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">حالة المجدول (Scheduler Status):</span>
                  <span className="text-emerald-400 font-bold">{scheduler.status || 'healthy'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">الأقفال الموزعة النشطة (Active Locks):</span>
                  <span className="text-blue-400 font-bold">{scheduler.activeLocksCount || 0} locks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">التذكيرات المجدولة الإجمالية:</span>
                  <span className="text-purple-400 font-bold">{scheduler.totalRemindersCount || 0} reminders</span>
                </div>
              </div>
            </div>

            {/* Error Counters & Types */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>سجل أخطاء الاستجابات (HTTP Errors & Exclusions)</span>
              </h3>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">أخطاء 4xx (Client Errors):</span>
                  <span className="text-amber-400 font-bold">{http.errorsTotal?.['4xx'] || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">أخطاء 5xx (Server Errors):</span>
                  <span className="text-red-400 font-bold">{http.errorsTotal?.['5xx'] || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">فشل المصادقة (Auth Failures):</span>
                  <span className="text-purple-400 font-bold">{http.errorsTotal?.auth_failure || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">تجاوز حدود الاستخدام (Rate Limit):</span>
                  <span className="text-blue-400 font-bold">{http.errorsTotal?.rate_limit_exceeded || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </>
      )}
    </div>
  );
};
