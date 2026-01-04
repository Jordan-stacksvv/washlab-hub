import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { toast } from 'sonner';
import { getActiveBranches } from '@/config/branches';
import {
  Users,
  UserPlus,
  Fingerprint,
  Copy,
  ExternalLink,
  Trash2,
  Check,
  MessageSquare,
  Lock
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  branchId: string;
  branchName: string;
  role: string;
  roleLabel: string;
  isEnrolled: boolean;
  enrollmentLink?: string;
  enrollmentToken?: string;
}

const PENDING_ENROLLMENTS_KEY = 'washlab_pending_enrollments';
const ENROLLED_STAFF_KEY = 'washlab_enrolled_staff';

// Staff roles
const STAFF_ROLES = [
  { id: 'washer', name: 'Washer' },
  { id: 'folder', name: 'Folder' },
  { id: 'ironer', name: 'Ironer' },
  { id: 'supervisor', name: 'Supervisor' },
  { id: 'cashier', name: 'Cashier' },
  { id: 'attendant', name: 'Attendant' },
];

// Get branches from centralized config
const BRANCHES = getActiveBranches();

const AdminStaff = () => {
  const navigate = useNavigate();
  const { enrolledStaff, removeEnrollment } = useWebAuthn();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ 
    name: '', 
    phone: '', 
    branchId: BRANCHES[0]?.id || '', 
    role: 'attendant'
  });

  // Load staff from localStorage
  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    try {
      // Load enrolled staff
      const enrolledData = localStorage.getItem(ENROLLED_STAFF_KEY);
      const enrolled = enrolledData ? JSON.parse(enrolledData) : [];
      
      // Load pending enrollments
      const pendingData = localStorage.getItem(PENDING_ENROLLMENTS_KEY);
      const pending = pendingData ? JSON.parse(pendingData) : [];
      
      // Combine into staff list
      const staffList: StaffMember[] = [];
      
      // Add enrolled staff
      enrolled.forEach((e: any) => {
        staffList.push({
          id: e.staffId,
          name: e.name,
          phone: e.phone,
          branchId: e.branch,
          branchName: e.branchName,
          role: e.role,
          roleLabel: STAFF_ROLES.find(r => r.id === e.role)?.name || e.role,
          isEnrolled: true
        });
      });
      
      // Add pending staff
      pending.forEach((p: any) => {
        const link = `${window.location.origin}/admin/enroll/${p.token}?role=${p.role}&branch=${p.branch}`;
        staffList.push({
          id: `pending-${p.token}`,
          name: 'Pending Enrollment',
          phone: '',
          branchId: p.branch,
          branchName: p.branchName,
          role: p.role,
          roleLabel: p.roleLabel,
          isEnrolled: false,
          enrollmentLink: link,
          enrollmentToken: p.token
        });
      });
      
      setStaff(staffList);
    } catch (e) {
      console.error('Error loading staff:', e);
    }
  };

  const generateEnrollmentLink = (role: string, branchId: string) => {
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const branch = BRANCHES.find(b => b.id === branchId);
    const roleObj = STAFF_ROLES.find(r => r.id === role);
    
    // Store pending enrollment with role locked
    const pending = {
      token,
      role,
      roleLabel: roleObj?.name || role,
      branch: branchId,
      branchName: branch?.name || branchId,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    };
    
    try {
      const existingData = localStorage.getItem(PENDING_ENROLLMENTS_KEY);
      const existing = existingData ? JSON.parse(existingData) : [];
      existing.push(pending);
      localStorage.setItem(PENDING_ENROLLMENTS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Error storing pending enrollment:', e);
    }
    
    return `${window.location.origin}/admin/enroll/${token}?role=${role}&branch=${branchId}`;
  };

  const addStaffMember = () => {
    if (!newStaff.role) {
      toast.error('Please select a role');
      return;
    }
    if (!newStaff.branchId) {
      toast.error('Please select a branch');
      return;
    }

    const enrollmentLink = generateEnrollmentLink(newStaff.role, newStaff.branchId);
    
    toast.success('Enrollment link created! Share via WhatsApp.');
    
    // Reload staff list
    loadStaff();
    
    setNewStaff({ name: '', phone: '', branchId: BRANCHES[0]?.id || '', role: 'attendant' });
    setShowAddForm(false);
    
    // Auto-copy link
    navigator.clipboard.writeText(enrollmentLink);
    toast.info('Link copied to clipboard!');
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const sendWhatsApp = (phone: string, link: string, roleLabel: string, branchName: string) => {
    const message = `Hi! 👋\n\nYou've been assigned as *${roleLabel}* at *WashLab ${branchName}*.\n\nPlease complete your biometric enrollment by clicking this link:\n\n${link}\n\nThis will set up Face ID / Fingerprint for attendance and payment authorization.\n\n*Note:* Your role has been pre-assigned and cannot be changed.`;
    const formattedPhone = phone.startsWith('0') ? `233${phone.slice(1)}` : phone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const deleteStaff = (staffId: string, isEnrolled: boolean, token?: string) => {
    if (isEnrolled) {
      // Remove from enrolled staff
      try {
        const data = localStorage.getItem(ENROLLED_STAFF_KEY);
        if (data) {
          const enrolled = JSON.parse(data);
          const updated = enrolled.filter((e: any) => e.staffId !== staffId);
          localStorage.setItem(ENROLLED_STAFF_KEY, JSON.stringify(updated));
        }
        removeEnrollment(staffId);
      } catch (e) {
        console.error('Error removing staff:', e);
      }
    } else if (token) {
      // Remove from pending
      try {
        const data = localStorage.getItem(PENDING_ENROLLMENTS_KEY);
        if (data) {
          const pending = JSON.parse(data);
          const updated = pending.filter((p: any) => p.token !== token);
          localStorage.setItem(PENDING_ENROLLMENTS_KEY, JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Error removing pending:', e);
      }
    }
    
    loadStaff();
    toast.success('Staff member removed');
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
          Create Enrollment Link
        </Button>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">Create New Enrollment Link</h3>
          <p className="text-sm text-muted-foreground mb-4">
            <Lock className="w-4 h-4 inline mr-1" />
            Role and branch will be locked. Staff can only enter name, phone, and biometric.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Role *</Label>
              <Select value={newStaff.role} onValueChange={(v) => setNewStaff({ ...newStaff, role: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Branch *</Label>
              <Select value={newStaff.branchId} onValueChange={(v) => setNewStaff({ ...newStaff, branchId: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> The role and branch you select will be permanently assigned to this enrollment link. 
              The staff member will not be able to change these during enrollment.
            </p>
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button onClick={addStaffMember}>Generate Enrollment Link</Button>
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
              <th className="text-left p-4 font-semibold text-foreground">Status</th>
              <th className="text-left p-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No staff members yet. Create an enrollment link to get started.
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="border-t border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.phone || 'Pending...'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{member.branchName}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      <Lock className="w-3 h-3" />
                      {member.roleLabel}
                    </span>
                  </td>
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
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendWhatsApp('', member.enrollmentLink!, member.roleLabel, member.branchName)}
                            className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Share
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStaff(member.id, member.isEnrolled, member.enrollmentToken)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
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
