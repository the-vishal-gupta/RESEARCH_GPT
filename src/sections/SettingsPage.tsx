import { useState, useEffect } from 'react';
import { Bell, Globe, Eye, Shield, User, Mail, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { settingsService, type UserSettings } from '@/services/settingsService';
import { toast } from 'sonner';

export function SettingsPage() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    citationAlerts: true,
    newPaperAlerts: false,
    weeklyDigest: true,
    publicProfile: true,
    showCitations: true,
    darkMode: false,
    autoSave: true,
    language: 'en'
  });

  // Dialog states
  const [emailDialog, setEmailDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [languageDialog, setLanguageDialog] = useState(false);
  const [twoFactorDialog, setTwoFactorDialog] = useState(false);

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Load settings on mount
  useEffect(() => {
    if (currentUser) {
      const userSettings = settingsService.getSettings(currentUser.id);
      setSettings(userSettings);
      setSelectedLanguage(userSettings.language);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const userProfile = settingsService.getUserProfile(currentUser.id);
  const passwordLastChanged = userProfile?.passwordLastChanged 
    ? new Date(userProfile.passwordLastChanged).toLocaleDateString()
    : 'Never';

  const handleToggle = (key: keyof UserSettings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    settingsService.updateSetting(currentUser.id, key, newValue as any);
    toast.success('Settings updated');
  };

  const handleEmailChange = () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a valid email');
      return;
    }

    const success = settingsService.updateEmail(currentUser.id, newEmail);
    if (success) {
      toast.success('Email updated successfully');
      setEmailDialog(false);
      setNewEmail('');
    } else {
      toast.error('Email already in use');
    }
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const success = settingsService.updatePassword(currentUser.id, currentPassword, newPassword);
    if (success) {
      toast.success('Password updated successfully');
      setPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('Current password is incorrect');
    }
  };

  const handleLanguageChange = () => {
    settingsService.updateLanguage(currentUser.id, selectedLanguage);
    setSettings(prev => ({ ...prev, language: selectedLanguage }));
    toast.success('Language updated');
    setLanguageDialog(false);
  };

  const handleToggle2FA = () => {
    const newValue = !userProfile?.twoFactorEnabled;
    settingsService.toggle2FA(currentUser.id, newValue);
    toast.success(newValue ? '2FA enabled' : '2FA disabled');
    setTwoFactorDialog(false);
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Chinese',
      ja: 'Japanese'
    };
    return languages[code] || 'English';
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fa]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-medium text-[#202124] mb-2">Settings</h1>
        <p className="text-[#5f6368] mb-8">Manage your preferences and account settings</p>

        {/* Account Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#4285f4]" />
              Account
            </CardTitle>
            <CardDescription>Manage your profile and account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Email</p>
                <p className="text-sm text-[#5f6368]">{currentUser.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEmailDialog(true)}>Change</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Password</p>
                <p className="text-sm text-[#5f6368]">Last changed: {passwordLastChanged}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPasswordDialog(true)}>Update</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Two-factor authentication</p>
                <p className="text-sm text-[#5f6368]">{userProfile?.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTwoFactorDialog(true)}
              >
                {userProfile?.twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#4285f4]" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#5f6368]" />
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">Email notifications</Label>
                  <p className="text-sm text-[#5f6368]">Receive updates via email</p>
                </div>
              </div>
              <Switch 
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#5f6368]" />
                <div>
                  <Label htmlFor="citation-alerts" className="font-medium">Citation alerts</Label>
                  <p className="text-sm text-[#5f6368]">Get notified when your papers are cited</p>
                </div>
              </div>
              <Switch 
                id="citation-alerts"
                checked={settings.citationAlerts}
                onCheckedChange={() => handleToggle('citationAlerts')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#5f6368]" />
                <div>
                  <Label htmlFor="new-paper-alerts" className="font-medium">New paper alerts</Label>
                  <p className="text-sm text-[#5f6368]">Get notified about new papers in your field</p>
                </div>
              </div>
              <Switch 
                id="new-paper-alerts"
                checked={settings.newPaperAlerts}
                onCheckedChange={() => handleToggle('newPaperAlerts')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#5f6368]" />
                <div>
                  <Label htmlFor="weekly-digest" className="font-medium">Weekly digest</Label>
                  <p className="text-sm text-[#5f6368]">Receive a weekly summary of your citations</p>
                </div>
              </div>
              <Switch 
                id="weekly-digest"
                checked={settings.weeklyDigest}
                onCheckedChange={() => handleToggle('weeklyDigest')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#4285f4]" />
              Privacy
            </CardTitle>
            <CardDescription>Control your profile visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#5f6368]" />
                <div>
                  <Label htmlFor="public-profile" className="font-medium">Public profile</Label>
                  <p className="text-sm text-[#5f6368]">Make your profile visible to others</p>
                </div>
              </div>
              <Switch 
                id="public-profile"
                checked={settings.publicProfile}
                onCheckedChange={() => handleToggle('publicProfile')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#5f6368]" />
                <div>
                  <Label htmlFor="show-citations" className="font-medium">Show citation count</Label>
                  <p className="text-sm text-[#5f6368]">Display your citation metrics publicly</p>
                </div>
              </div>
              <Switch 
                id="show-citations"
                checked={settings.showCitations}
                onCheckedChange={() => handleToggle('showCitations')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#4285f4]" />
              Appearance
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? (
                  <Moon className="w-5 h-5 text-[#5f6368]" />
                ) : (
                  <Sun className="w-5 h-5 text-[#5f6368]" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">Dark mode</Label>
                  <p className="text-sm text-[#5f6368]">Use dark theme</p>
                </div>
              </div>
              <Switch 
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={() => handleToggle('darkMode')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#5f6368]" />
                <div>
                  <Label htmlFor="auto-save" className="font-medium">Auto-save to library</Label>
                  <p className="text-sm text-[#5f6368]">Automatically save viewed papers</p>
                </div>
              </div>
              <Switch 
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={() => handleToggle('autoSave')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#4285f4]" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Interface language</p>
                <p className="text-sm text-[#5f6368]">{getLanguageName(settings.language)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLanguageDialog(true)}>Change</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Change Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>
              Enter your new email address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="new.email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleEmailChange}>Update Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Change Dialog */}
      <Dialog open={languageDialog} onOpenChange={setLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Language</DialogTitle>
            <DialogDescription>
              Select your preferred language
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLanguageDialog(false)}>Cancel</Button>
            <Button onClick={handleLanguageChange}>Update Language</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Toggle Dialog */}
      <Dialog open={twoFactorDialog} onOpenChange={setTwoFactorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userProfile?.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {userProfile?.twoFactorEnabled 
                ? 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
                : 'Two-factor authentication adds an extra layer of security to your account.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTwoFactorDialog(false)}>Cancel</Button>
            <Button onClick={handleToggle2FA}>
              {userProfile?.twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
