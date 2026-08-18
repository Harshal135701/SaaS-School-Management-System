import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { superAdminProfile, mockSuperAdminSettings } from '../../data/superAdminMockData';
import type { SuperAdminSettings } from '../../types/superAdmin';
import {
  User,
  Lock,
  Sun,
  Moon,
  Monitor,
  Eye,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  KeyRound
} from 'lucide-react';

interface SuperAdminSettingsPageProps {
  onNavigate: (path: string) => void;
  defaultTab?: 'profile' | 'security' | 'appearance' | 'accessibility' | 'system';
}

export const SuperAdminSettingsPage: React.FC<SuperAdminSettingsPageProps> = ({
  defaultTab = 'profile'
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'accessibility' | 'system'>(defaultTab);

  // Profile Form state
  const [name, setName] = useState(superAdminProfile.name);
  const [email, setEmail] = useState(superAdminProfile.email);
  const [phone, setPhone] = useState(superAdminProfile.phone);

  // Password & Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);

  // System Settings State
  const [settings, setSettings] = useState<SuperAdminSettings>(mockSuperAdminSettings);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Super Admin profile updated successfully!');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!');
      return;
    }
    showToast('Super Admin password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Global SaaS System Configurations saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="indigo" size="sm">SYSTEM ADMINISTRATION</Badge>
          <span className="text-xs font-semibold text-slate-500">Platform Settings & Security</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Super Admin System Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Manage platform parameters, administrator security credentials, display themes, accessibility options, and global SaaS defaults.
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        
        {/* Vertical Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Password & Security', icon: Lock },
            { id: 'appearance', label: 'Theme & Appearance', icon: Sun },
            { id: 'accessibility', label: 'Accessibility', icon: Eye },
            { id: 'system', label: 'Basic System Config', icon: Sliders }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`p-3 flex items-center gap-3 rounded-xl transition-all cursor-pointer text-xs font-extrabold ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-4xl">

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <Card className="p-6 border-slate-200/80 max-w-3xl">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <Avatar src={superAdminProfile.avatar} name={superAdminProfile.name} size="lg" status="online" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{superAdminProfile.name}</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {superAdminProfile.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Super Admin Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Super Admin Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Administrative Title"
                value={superAdminProfile.title}
                disabled
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" type="submit">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-3xl">
          <Card className="p-6 border-slate-200/80 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Change Admin Password</h3>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <Input
                label="Current Password *"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="New Password *"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Confirm New Password *"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit">
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 border-slate-200/80 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Two-Factor Authentication (2FA)</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Enforce 2FA for Super Admin Login</h4>
                  <p className="text-[11px] text-slate-500">Requires an authenticator app code on login.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => {
                  setTwoFactor(e.target.checked);
                  showToast(`2FA is now ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                }}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: THEME & APPEARANCE */}
      {activeTab === 'appearance' && (
        <Card className="p-6 border-slate-200/80 max-w-3xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Theme & Appearance</h3>
          <p className="text-xs text-slate-500 font-medium">Select your preferred visual mode for the Super Admin dashboard workspace.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean, high-visibility light theme' },
              { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Dark theme optimized for night work' },
              { id: 'system', label: 'System Default', icon: Monitor, desc: 'Adapts to OS settings' }
            ].map(theme => {
              const Icon = theme.icon;
              const isSelected = settings.themeMode === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    setSettings({ ...settings, themeMode: theme.id as any });
                    showToast(`Theme updated to ${theme.label}`);
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                  <h4 className="text-xs font-extrabold text-slate-900">{theme.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{theme.desc}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 4: ACCESSIBILITY */}
      {activeTab === 'accessibility' && (
        <Card className="p-6 border-slate-200/80 max-w-3xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Accessibility Settings</h3>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span>Reduced Motion & Animations</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => {
                  setSettings({ ...settings, reducedMotion: e.target.checked });
                  showToast(`Reduced motion ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span>High Contrast UI</span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => {
                  setSettings({ ...settings, highContrast: e.target.checked });
                  showToast(`High contrast ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span>Screen Reader Optimized Text Tags</span>
              <input
                type="checkbox"
                checked={settings.screenReaderFriendly}
                onChange={(e) => {
                  setSettings({ ...settings, screenReaderFriendly: e.target.checked });
                  showToast(`Screen reader mode ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: BASIC SYSTEM CONFIG */}
      {activeTab === 'system' && (
        <Card className="p-6 border-slate-200/80 max-w-3xl">
          <form onSubmit={handleSaveSystem} className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Global SaaS System Defaults</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SaaS Platform Name *"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                required
              />

              <Input
                label="Platform Email *"
                type="email"
                value={settings.platformEmail}
                onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
                required
              />

              <Input
                label="Support Contact Email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />

              <Input
                label="Default Currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              />

              <Input
                label="Platform Timezone"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              />

              <Input
                label="Date Format"
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" type="submit">
                Save System Configurations
              </Button>
            </div>
          </form>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
};
