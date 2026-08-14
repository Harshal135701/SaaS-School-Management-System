import React from 'react';
import { Card } from '../../components/ui/Card';
import { Settings, Shield, Key, Server } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-slate-700" />
          System Settings & Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure RBAC roles, academic sessions, and Spring Boot integration endpoints</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg" hoverLift={false}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" /> RBAC & Role Permission Configuration
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Super Admin Scope</span>
                  <span className="text-slate-500">Unrestricted access across all modules, staff provisioning, and financial records</span>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px]">ACTIVE</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Faculty / Teacher Scope</span>
                  <span className="text-slate-500">Restricted to assigned classes, attendance telemetry, marks entry, and homework</span>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px]">CONFIGURED</span>
              </div>
            </div>
          </Card>

          <Card padding="lg" hoverLift={false}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-purple-600" /> Backend API Connection Settings
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              The UI architecture is completely REST-ready for seamless Spring Boot Security + JWT integration.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Spring Boot Base URL</label>
                <input
                  type="text"
                  disabled
                  value="http://localhost:8080/api/v1"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">JWT Bearer Token Target Header</label>
                <input
                  type="text"
                  disabled
                  value="Authorization: Bearer <token>"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-600"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="md" hoverLift={false}>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-amber-600" /> System Information
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Frontend Version:</span>
                <span className="font-bold text-slate-900">v2.4.0 (Production)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>UI Stack:</span>
                <span className="font-bold text-slate-900">React + Vite + TS</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Styling Engine:</span>
                <span className="font-bold text-slate-900">Tailwind CSS v4</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
