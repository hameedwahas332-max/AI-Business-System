import React from 'react';
import { TabType } from '../../Sidebar';
import {
  ShieldCheck,
  Activity,
  ScrollText,
  Database,
  Lock,
  ChevronRight,
  Server,
  Cpu,
  Clock,
} from 'lucide-react';

interface SystemStatusAuditWidgetProps {
  auditLogs?: any[];
  onNavigate?: (tab: TabType, extra?: any) => void;
}

export const SystemStatusAuditWidget: React.FC<SystemStatusAuditWidgetProps> = ({
  auditLogs = [],
  onNavigate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 Cols: Real Audit Trail Activity Stream */}
      <div className="lg:col-span-7 bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 text-right">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ScrollText className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">سجل الأمان والتدقيق والعمليات (Audit Trail)</h3>
              <p className="text-[11px] text-slate-400">توثيق رقابي لكل إجراء تم على مستوى المؤسسة والمستخدمين</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('audit')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>سجل التدقيق الكامل</span>
          </button>
        </div>

        {/* Logs List */}
        <div className="space-y-2 flex-1">
          {auditLogs && auditLogs.length > 0 ? (
            auditLogs.slice(0, 4).map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-800/60 transition-all flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{log.action || 'عملية نظام'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {log.entity || 'System'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    بواسطة: <strong className="text-slate-300">{log.user_name || log.user_email || 'المدير التنفيذي'}</strong>
                  </div>
                </div>

                <div className="text-left font-mono text-[10px] text-slate-500">
                  {log.created_at ? new Date(log.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : 'منذ قليل'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs rounded-xl bg-slate-950/40 border border-slate-800">
              لا توجد سجلات أمان جديدة خلال الجلسة الحالية
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">سجل غير قابل للتعديل (Immutable Audit Log)</span>
          <button
            onClick={() => onNavigate && onNavigate('audit')}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>التفاصيل</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>

      {/* Right 5 Cols: System Health & Security Metrics */}
      <div className="lg:col-span-5 bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 text-right">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">بيئة التشغيل والحماية (Security & Health)</h3>
              <p className="text-[11px] text-slate-400">حالة قاعدة البيانات، النسخ الاحتياطي، والتشفير</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('observability')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>مراقبة النظام</span>
          </button>
        </div>

        {/* Health Badges List */}
        <div className="space-y-2.5 flex-1">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-200 font-semibold">قاعدة البيانات (PostgreSQL)</span>
            </div>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              متصل / سليم 100%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-teal-400" />
              <span className="text-slate-200 font-semibold">عزل المؤسسات (Tenant Isolation)</span>
            </div>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800/60">
              مفعّل ومحمي
            </span>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('backups')}
            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-800/60 cursor-pointer flex items-center justify-between text-xs transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-200 font-semibold group-hover:text-emerald-300 transition-colors">النسخ الاحتياطي والاستعادة (Backup)</span>
            </div>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              إدارة النسخ
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate && onNavigate('swagger')}
            className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <span>التوثيق البرمجي REST API</span>
          </button>
          <span className="text-[10px] font-mono text-slate-500">v1.0.0 Production Core</span>
        </div>
      </div>
    </div>
  );
};
