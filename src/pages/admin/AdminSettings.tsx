import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PRICING_CONFIG } from '@/config/pricing';
import { toast } from 'sonner';
import {
  Settings,
  DollarSign,
  Bell,
  Shield,
  Smartphone,
  Save
} from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    businessName: 'WashLab',
    contactPhone: '0241234567',
    contactEmail: 'hello@washlab.com',
    notifyNewOrders: true,
    notifyCompletedOrders: true,
    requireBiometricPayment: true,
    autoLogoutMinutes: 30
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure WashLab preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Business Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Pricing Display (Read-only) */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Pricing Configuration
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Prices are configured in the central pricing config file.
          </p>
          <div className="space-y-3">
            {PRICING_CONFIG.services.map((service) => (
              <div 
                key={service.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <span className="font-medium text-foreground">{service.label}</span>
                <span className="text-lg font-bold text-primary">₵{service.price}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium text-foreground">Delivery Fee</span>
              <span className="text-lg font-bold text-primary">₵{PRICING_CONFIG.deliveryFee}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium text-foreground">Tax Rate</span>
              <span className="text-lg font-bold text-primary">{PRICING_CONFIG.taxRate * 100}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            To change prices, edit src/config/pricing.ts
          </p>
        </div>

        {/* Notification Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-foreground">Notify on new orders</span>
              <input
                type="checkbox"
                checked={settings.notifyNewOrders}
                onChange={(e) => setSettings({ ...settings, notifyNewOrders: e.target.checked })}
                className="w-5 h-5 rounded border-border"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-foreground">Notify on completed orders</span>
              <input
                type="checkbox"
                checked={settings.notifyCompletedOrders}
                onChange={(e) => setSettings({ ...settings, notifyCompletedOrders: e.target.checked })}
                className="w-5 h-5 rounded border-border"
              />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-foreground block">Require biometric for payments</span>
                <span className="text-xs text-muted-foreground">Staff must verify identity before processing payments</span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireBiometricPayment}
                onChange={(e) => setSettings({ ...settings, requireBiometricPayment: e.target.checked })}
                className="w-5 h-5 rounded border-border"
              />
            </label>
            <div>
              <Label>Auto-logout after (minutes)</Label>
              <Input
                type="number"
                value={settings.autoLogoutMinutes}
                onChange={(e) => setSettings({ ...settings, autoLogoutMinutes: parseInt(e.target.value) })}
                min={5}
                max={120}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
