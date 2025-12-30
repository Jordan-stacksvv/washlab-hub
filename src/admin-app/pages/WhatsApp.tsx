import { useState } from 'react';
import { Button } from '@/shared/ui';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MessageSquare, Send, Users, Link2, Copy } from 'lucide-react';

/**
 * WhatsApp Page
 * Broadcast messages and share links
 */
const WhatsApp = () => {
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'branch'>('all');

  const appLinks = {
    public: 'https://washlab.com',
    washstation: 'https://app.washlab.com',
    admin: 'https://admin.washlab.com',
  };

  const copyLink = (link: string, name: string) => {
    navigator.clipboard.writeText(link);
    toast.success(`${name} link copied!`);
  };

  const sendBroadcast = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success('Broadcast queued for sending!');
    setMessage('');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">WhatsApp</h1>
        <p className="text-muted-foreground mt-1">Send broadcasts and share links</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Send Broadcast
          </h3>

          <div className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={recipientType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRecipientType('all')}
                >
                  All Customers
                </Button>
                <Button
                  variant={recipientType === 'branch' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRecipientType('branch')}
                >
                  By Branch
                </Button>
              </div>
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={5}
                className="mt-2"
              />
            </div>

            <Button onClick={sendBroadcast} className="gap-2">
              <Send className="w-4 h-4" />
              Send Broadcast
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Quick Links
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-semibold text-foreground">Public Website</p>
                <p className="text-sm text-muted-foreground">{appLinks.public}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(appLinks.public, 'Public')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-semibold text-foreground">WashStation App</p>
                <p className="text-sm text-muted-foreground">{appLinks.washstation}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(appLinks.washstation, 'WashStation')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-semibold text-foreground">Admin Dashboard</p>
                <p className="text-sm text-muted-foreground">{appLinks.admin}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(appLinks.admin, 'Admin')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Staff enrollment links are generated in the Staff section
            </p>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/staff'}>
              <Users className="w-4 h-4 mr-2" />
              Go to Staff Management
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
