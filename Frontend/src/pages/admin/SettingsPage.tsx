import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import api from '../../services/api';
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
  AlertCircle,
  Settings
} from 'lucide-react';

interface FranchiseSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  themeMode: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderFriendly: boolean;
  twoFactorEnabled: boolean;
}

const defaultSettings: FranchiseSettings = {
  timezone: 'UTC',
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  themeMode: 'system',
  reducedMotion: false,
  highContrast: false,
  screenReaderFriendly: false,
  twoFactorEnabled: false
};

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'accessibility' | 'system'>('profile');

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [franchiseInfo, setFranchiseInfo] = useState<any>(null);

  // Profile loading & saving state
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password & Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // System Settings State
  const [settings, setSettings] = useState<FranchiseSettings>(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      const res = await api.get('/franchise/auth/me');
      if (res.data?.success && res.data.admin) {
        const admin = res.data.admin;
        setName(admin.name || '');
        setEmail(admin.email || '');
        if (admin.phone) setPhone(admin.phone);
        if (admin.franchise) setFranchiseInfo(admin.franchise);

        // Sync local storage user if exists so header/sidebar update
        try {
          const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
          if (userStr) {
            const parsed = JSON.parse(userStr);
            const updatedUser = { ...parsed, name: admin.name || parsed.name, email: admin.email || parsed.email, phone: admin.phone || parsed.phone };
            if (sessionStorage.getItem('user')) sessionStorage.setItem('user', JSON.stringify(updatedUser));
            if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (e) {}
      } else {
        setProfileError(res.data?.message || 'Failed to load profile.');
      }
    } catch (err: any) {
      console.error('Error fetching franchise admin profile:', err);
      setProfileError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await api.get('/franchise/settings');
      if (res.data?.success && res.data.data) {
        setSettings(res.data.data);
        applyTheme(res.data.data.themeMode);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  const applyTheme = (themeMode: string) => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (themeMode === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', 'system');
    }
  };

  const updateSettings = async (updates: Partial<FranchiseSettings>, successMessage: string) => {
    try {
      const res = await api.put('/franchise/settings', updates);
      if (res.data?.success && res.data.data) {
        setSettings(res.data.data);
        showToast(successMessage, 'success');
      }
    } catch (err: any) {
      console.error('Error updating settings:', err);
      showToast(err.response?.data?.message || 'Failed to update settings', 'error');
    }
  };

  const handleThemeChange = async (themeId: 'light' | 'dark' | 'system') => {
    applyTheme(themeId);
    await updateSettings({ themeMode: themeId }, `Theme updated to ${themeId === 'system' ? 'System Default' : themeId === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError(null);
      const payload: any = { name: name.trim(), email: email.trim() };
      if (phone.trim()) payload.phone = phone.trim();

      const res = await api.put('/franchise/auth/profile', payload);

      if (res.data?.success) {
        const admin = res.data.data;
        if (admin) {
          setName(admin.name || name);
          setEmail(admin.email || email);
          if (admin.phone) setPhone(admin.phone);
          if (admin.franchise) setFranchiseInfo(admin.franchise);
        } else {
          await fetchProfile();
        }

        // Sync stored user
        try {
          const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
          if (userStr) {
            const parsed = JSON.parse(userStr);
            const updatedUser = {
              ...parsed,
              name: admin?.name || name.trim(),
              email: admin?.email || email.trim(),
            };
            if (sessionStorage.getItem('user')) sessionStorage.setItem('user', JSON.stringify(updatedUser));
            if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (e) {}

        showToast('Profile changes saved successfully', 'success');
      } else {
        setProfileError(res.data?.message || 'Failed to save profile');
        showToast(res.data?.message || 'Failed to save profile', 'error');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setProfileError(err.response?.data?.message || 'Failed to save profile');
      showToast(err.response?.data?.message || 'Failed to save profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await api.put('/franchise/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        showToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.data?.message || 'Failed to update password', 'error');
      }
    } catch (err: any) {
      console.error('Error updating password:', err);
      showToast(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      await updateSettings({
        timezone: settings.timezone,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
      }, 'System defaults saved successfully');
    } finally {
      setSettingsSaving(false);
    }
  };

  const toggleSetting = async (key: keyof FranchiseSettings, label: string) => {
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    await updateSettings({ [key]: newValue }, `${label} ${newValue ? 'Enabled' : 'Disabled'}`);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className={`text-white px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 ${
            toastMsg.type === 'error' ? 'bg-rose-900 border-rose-800' : 'bg-slate-900 border-slate-800'
          }`}>
            {toastMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {toastMsg.message}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-blue-600" />
            Settings
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Franchise Administration Configuration</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT NAV */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'security', label: 'Security & 2FA', icon: Lock },
            { id: 'appearance', label: 'Theme & Appearance', icon: Eye },
            { id: 'accessibility', label: 'Accessibility', icon: Monitor },
            { id: 'system', label: 'System Defaults', icon: Sliders }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0">

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl">
              {profileLoading ? (
                <Card className="p-6 border-slate-200/80">
                  <div className="py-8 text-center text-xs font-semibold text-slate-500">Loading profile...</div>
                </Card>
              ) : (
                <>
                  {/* Franchise Information (Read-only) */}
                  {franchiseInfo && (
                    <Card className="p-6 border-slate-200/80">
                      <h3 className="text-base font-extrabold text-slate-900 mb-4 pb-4 border-b border-slate-100">
                        Franchise Registration Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Franchise Name"
                          value={franchiseInfo.name || ''}
                          disabled
                          onChange={() => {}}
                        />
                        <Input
                          label="Franchise Code"
                          value={franchiseInfo.code || ''}
                          disabled
                          onChange={() => {}}
                        />
                        <Input
                          label="Registration Email"
                          value={franchiseInfo.email || ''}
                          disabled
                          onChange={() => {}}
                        />
                        <Input
                          label="Contact Phone"
                          value={franchiseInfo.phone || ''}
                          disabled
                          onChange={() => {}}
                        />
                        <div className="md:col-span-2">
                          <Input
                            label="Address"
                            value={franchiseInfo.address || ''}
                            disabled
                            onChange={() => {}}
                          />
                        </div>
                        <Input
                          label="City"
                          value={franchiseInfo.city || ''}
                          disabled
                          onChange={() => {}}
                        />
                        <Input
                          label="State"
                          value={franchiseInfo.state || ''}
                          disabled
                          onChange={() => {}}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-4 italic">
                        Franchise-level information is read-only. Please contact platform support to update registration details.
                      </p>
                    </Card>
                  )}

                  {/* Franchise Admin Profile (Editable) */}
                  <Card className="p-6 border-slate-200/80">
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <h3 className="text-base font-extrabold text-slate-900 mb-2 pb-4 border-b border-slate-100">
                        Franchise Admin Profile
                      </h3>
                      {profileError && (
                        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-2 border border-rose-100">
                          <AlertCircle className="w-4 h-4" />
                          {profileError}
                        </div>
                      )}

                      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                        <Avatar
                          name={name || 'Admin'}
                          size="xl"
                          className="ring-4 ring-slate-50 shadow-sm"
                        />
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">{name || 'Franchise Admin'}</h3>
                          <p className="text-xs text-slate-500 font-medium">Franchise Administrator</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Full Name *"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />

                        <Input
                          label="Email Address *"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />

                        <Input
                          label="Contact Phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button variant="primary" type="submit" isLoading={profileSaving} disabled={profileSaving}>
                          {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                        </Button>
                      </div>
                    </form>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-3xl">
              <Card className="p-6 border-slate-200/80">
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">Change Password</h3>

                  <div className="space-y-4">
                    <Input
                      label="Current Password *"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4" />}
                      required
                    />

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
                    <Button variant="primary" type="submit" isLoading={passwordSaving} disabled={passwordSaving}>
                      {passwordSaving ? 'Updating Password...' : 'Update Password'}
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
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        Enforce 2FA for Franchise Admin Login
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 uppercase">Coming Soon</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">Requires an authenticator app code on login. (Not yet configured in backend)</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorEnabled}
                    onChange={() => toggleSetting('twoFactorEnabled', '2FA')}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: THEME & APPEARANCE */}
          {activeTab === 'appearance' && (
            <Card className="p-6 border-slate-200/80 max-w-3xl space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Theme & Appearance</h3>
              <p className="text-xs text-slate-500 font-medium">Select your preferred visual mode for the dashboard workspace.</p>

              {settingsLoading ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-500">Loading settings...</div>
              ) : (
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
              )}
            </Card>
          )}

          {/* TAB 4: ACCESSIBILITY */}
          {activeTab === 'accessibility' && (
            <Card className="p-6 border-slate-200/80 max-w-3xl space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Accessibility Settings</h3>

              {settingsLoading ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-500">Loading settings...</div>
              ) : (
                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <span className="block">Reduced Motion & Animations</span>
                      <span className="text-[10px] text-slate-500 font-normal">Minimizes UI animations.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.reducedMotion}
                      onChange={() => toggleSetting('reducedMotion', 'Reduced motion')}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <span className="block">High Contrast UI</span>
                      <span className="text-[10px] text-slate-500 font-normal">Increases contrast for readability.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={() => toggleSetting('highContrast', 'High contrast')}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <span className="block">Screen Reader Optimized Text Tags</span>
                      <span className="text-[10px] text-slate-500 font-normal">Improves compatibility with screen readers.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.screenReaderFriendly}
                      onChange={() => toggleSetting('screenReaderFriendly', 'Screen reader mode')}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* TAB 5: BASIC SYSTEM CONFIG */}
          {activeTab === 'system' && (
            <Card className="p-6 border-slate-200/80 max-w-3xl">
              {settingsLoading ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-500">Loading settings...</div>
              ) : (
                <form onSubmit={handleSaveSystem} className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">Franchise System Defaults</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Button variant="primary" type="submit" isLoading={settingsSaving} disabled={settingsSaving}>
                      {settingsSaving ? 'Saving Defaults...' : 'Save System Defaults'}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
