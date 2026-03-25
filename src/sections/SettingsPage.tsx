import { useState } from 'react';
import { Bell, Globe, Eye, Shield, User, Mail, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    citationAlerts: true,
    newPaperAlerts: false,
    weeklyDigest: true,
    publicProfile: true,
    showCitations: true,
    darkMode: false,
    autoSave: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Settings updated');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fa]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-medium text-[#202124] mb-2">Settings</h1>
        <p className="text-[#5f6368] mb-8">Manage your Google Scholar preferences</p>

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
                <p className="text-sm text-[#5f6368]">user@university.edu</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Password</p>
                <p className="text-sm text-[#5f6368]">Last changed 3 months ago</p>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#202124]">Two-factor authentication</p>
                <p className="text-sm text-[#5f6368]">Not enabled</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
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
                <p className="text-sm text-[#5f6368]">English</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
