import { useState } from 'react';
import { Bell, Plus, Trash2, Edit2, BellRing, Mail, Rss, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Alert {
  id: string;
  name: string;
  query: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastSent: Date;
  newResults: number;
  active: boolean;
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Transformer Research',
      query: 'transformer architecture OR "attention mechanism"',
      frequency: 'weekly',
      lastSent: new Date('2025-02-20'),
      newResults: 12,
      active: true,
    },
    {
      id: '2',
      name: 'Machine Learning in Healthcare',
      query: '"machine learning" AND healthcare AND diagnosis',
      frequency: 'weekly',
      lastSent: new Date('2025-02-18'),
      newResults: 8,
      active: true,
    },
    {
      id: '3',
      name: 'Citation Alerts - My Papers',
      query: 'author:"S Chen"',
      frequency: 'daily',
      lastSent: new Date('2025-02-21'),
      newResults: 3,
      active: true,
    },
  ]);

  const [newAlertDialogOpen, setNewAlertDialogOpen] = useState(false);
  const [newAlertName, setNewAlertName] = useState('');
  const [newAlertQuery, setNewAlertQuery] = useState('');
  const [newAlertFrequency, setNewAlertFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const handleCreateAlert = () => {
    if (newAlertName.trim() && newAlertQuery.trim()) {
      const newAlert: Alert = {
        id: Date.now().toString(),
        name: newAlertName,
        query: newAlertQuery,
        frequency: newAlertFrequency,
        lastSent: new Date(),
        newResults: 0,
        active: true,
      };
      setAlerts([...alerts, newAlert]);
      setNewAlertDialogOpen(false);
      setNewAlertName('');
      setNewAlertQuery('');
      toast.success('Alert created successfully');
    }
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success('Alert deleted');
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    ));
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Bell className="w-4 h-4" />;
      case 'weekly': return <BellRing className="w-4 h-4" />;
      case 'monthly': return <Mail className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-white border-b border-[#dadce0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-[#202124]">Alerts</h1>
              <p className="text-sm text-[#5f6368]">
                Get notified about new papers matching your interests
              </p>
            </div>
            <Dialog open={newAlertDialogOpen} onOpenChange={setNewAlertDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4285f4]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-[#202124] mb-1 block">
                      Alert name
                    </label>
                    <Input
                      value={newAlertName}
                      onChange={(e) => setNewAlertName(e.target.value)}
                      placeholder="e.g., Transformer Research"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#202124] mb-1 block">
                      Search query
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa0a6]" />
                      <Input
                        value={newAlertQuery}
                        onChange={(e) => setNewAlertQuery(e.target.value)}
                        placeholder="e.g., transformer architecture"
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-[#5f6368] mt-1">
                      Use keywords, author names, or boolean operators (AND, OR)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#202124] mb-2 block">
                      Frequency
                    </label>
                    <div className="flex gap-2">
                      {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setNewAlertFrequency(freq)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            newAlertFrequency === freq
                              ? 'bg-[#4285f4] text-white'
                              : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
                          }`}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#4285f4]"
                    onClick={handleCreateAlert}
                    disabled={!newAlertName.trim() || !newAlertQuery.trim()}
                  >
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-medium text-[#4285f4]">{alerts.length}</p>
              <p className="text-sm text-[#5f6368]">Active alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-medium text-[#188038]">
                {alerts.reduce((sum, a) => sum + a.newResults, 0)}
              </p>
              <p className="text-sm text-[#5f6368]">New results this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-medium text-[#202124]">
                {alerts.filter(a => a.frequency === 'daily').length}
              </p>
              <p className="text-sm text-[#5f6368]">Daily alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rss className="w-5 h-5 text-[#4285f4]" />
              Your Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-[#dadce0] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#202124] mb-2">
                  No alerts yet
                </h3>
                <p className="text-sm text-[#5f6368] mb-4">
                  Create alerts to get notified about new papers
                </p>
                <Button 
                  className="bg-[#4285f4]"
                  onClick={() => setNewAlertDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first alert
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-lg border transition-all ${
                      alert.active 
                        ? 'bg-white border-[#dadce0]' 
                        : 'bg-[#f8f9fa] border-[#e8eaed] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-[#202124]">{alert.name}</h3>
                          {alert.newResults > 0 && (
                            <Badge className="bg-[#188038] text-white">
                              {alert.newResults} new
                            </Badge>
                          )}
                          {!alert.active && (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-[#5f6368] mb-2 font-mono bg-[#f8f9fa] px-2 py-1 rounded inline-block">
                          {alert.query}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-[#5f6368]">
                          <span className="flex items-center gap-1">
                            {getFrequencyIcon(alert.frequency)}
                            {alert.frequency.charAt(0).toUpperCase() + alert.frequency.slice(1)}
                          </span>
                          <span>
                            Last sent: {alert.lastSent.toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAlert(alert.id)}
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            alert.active ? 'bg-[#4285f4]' : 'bg-[#dadce0]'
                          }`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            alert.active ? 'left-5' : 'left-1'
                          }`} />
                        </button>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-[#5f6368] hover:text-[#d93025]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
