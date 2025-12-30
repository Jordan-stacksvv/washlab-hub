import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Fingerprint,
  Copy,
  ExternalLink,
  Trash2,
  Check,
  MessageSquare
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  branchId: string;
  role: 'receptionist' | 'admin';
  isEnrolled: boolean;
  enrollmentLink?: string;
}

// Mock staff data
const mockStaff: StaffMember[] = [
  { id: 'staff-1', name: 'Alex Mensah', phone: '0241234567', branchId: 'pentagon', role: 'receptionist', isEnrolled: true },
  { id: 'staff-2', name: 'Grace Osei', phone: '0551234567', branchId: 'brunei', role: 'receptionist', isEnrolled: false, enrollmentLink: 'https://admin.washlab.com/enroll/grace-abc123' },
  { id: 'staff-3', name: 'Kofi Asante', phone: '0271234567', branchId: 'pentagon', role: 'admin', isEnrolled: true },
];

const AdminStaff = () => {
  const { enrolledStaff, removeEnrollment } = useWebAuthn();
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', branchId: 'pentagon', role: 'receptionist' as const });

  const generateEnrollmentLink = (staffId: string, staffName: string) => {
    const token = `${staffName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const link = `${window.location.origin}/admin/enroll/${token}`;
    return link;
  };

  const addStaffMember = () => {
    if (!newStaff.name || !newStaff.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    const id = `staff-${Date.now()}`;
    const enrollmentLink = generateEnrollmentLink(id, newStaff.name);
    
    const member: StaffMember = {
      id,
      name: newStaff.name,
      phone: newStaff.phone,
      branchId: newStaff.branchId,
      role: newStaff.role,
      isEnrolled: false,
      enrollmentLink
    };

    setStaff([...staff, member]);
    setNewStaff({ name: '', phone: '', branchId: 'pentagon', role: 'receptionist' });
    setShowAddForm(false);
    toast.success('Staff member added! Share the enrollment link via WhatsApp.');
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const sendWhatsApp = (phone: string, link: string, name: string) => {
    const message = `Hi ${name}! 👋\n\nYou've been added to WashLab staff. Please complete your biometric enrollment by clicking this link:\n\n${link}\n\nThis will set up Face ID / Fingerprint for attendance and payment authorization.`;
    const url = `https://wa.me/233${phone.slice(1)}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage staff and biometric enrollment</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Staff Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                placeholder="e.g., Alex Mensah"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                placeholder="e.g., 0241234567"
              />
            </div>
            <div>
              <Label>Branch</Label>
              <select
                value={newStaff.branchId}
                onChange={(e) => setNewStaff({ ...newStaff, branchId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="pentagon">Pentagon Hall</option>
                <option value="brunei">Brunei Hostel</option>
              </select>
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'receptionist' })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={addStaffMember}>Create & Generate Link</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">Staff</th>
              <th className="text-left p-4 font-semibold text-foreground">Branch</th>
              <th className="text-left p-4 font-semibold text-foreground">Role</th>
              <th className="text-left p-4 font-semibold text-foreground">Enrollment Status</th>
              <th className="text-left p-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-t border-border">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-foreground capitalize">{member.branchId}</td>
                <td className="p-4 text-foreground capitalize">{member.role}</td>
                <td className="p-4">
                  {member.isEnrolled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <Fingerprint className="w-4 h-4" />
                      Enrolled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      Pending
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {!member.isEnrolled && member.enrollmentLink && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(member.enrollmentLink!)}
                          className="gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendWhatsApp(member.phone, member.enrollmentLink!, member.name)}
                          className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enrolled Staff from WebAuthn */}
      {enrolledStaff.length > 0 && (
        <div className="mt-8 bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            Biometric Enrollments (This Device)
          </h3>
          <div className="space-y-2">
            {enrolledStaff.map((enrolled) => (
              <div key={enrolled.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{enrolled.staffName}</p>
                  <p className="text-xs text-muted-foreground">
                    Enrolled: {new Date(enrolled.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEnrollment(enrolled.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
