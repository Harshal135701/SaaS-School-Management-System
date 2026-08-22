import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
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

  // Theme sync on mount
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (storedTheme) {
      setSettings(prev => ({ ...prev, themeMode: storedTheme }));
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleThemeChange = (themeId: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, themeMode: themeId }));
    if (themeId === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      showToast('Theme updated to Dark Mode 🌙');
    } else if (themeId === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      showToast('Theme updated to Light Mode ☀️');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', 'system');
      showToast('Theme set to System Default 💻');
    }
  };

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
      showToast('Passwords do not match!');
      return;
    }
    showToast('Admin password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System defaults saved successfully!');
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          Super Admin System Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure platform branding, security protocols, system appearance, and administrator profiles
        </p>
      </div>

      {/* Settings Layout: Vertical Sidebar + Content Panel */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Vertical Tabs Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
          {[
            { id: 'profile', label: 'My Profile', icon: User, desc: 'Personal & contact info' },
            { id: 'security', label: 'Security & 2FA', icon: Lock, desc: 'Password & auth' },
            { id: 'appearance', label: 'Theme & Appearance', icon: Sun, desc: 'Light, dark & system' },
            { id: 'accessibility', label: 'Accessibility', icon: Eye, desc: 'Display & motion' },
            { id: 'system', label: 'System Defaults', icon: Sliders, desc: 'Platform configurations' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold truncate">{tab.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full min-w-0 space-y-6">

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
                  onClick={() => handleThemeChange(theme.id as any)}
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
