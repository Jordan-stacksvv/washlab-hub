import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PRICING_CONFIG } from '@/config/pricing';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  MapPin,
  DollarSign,
  Users,
  Edit2,
  Trash2
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  location: string;
  code: string;
  isActive: boolean;
  staffCount: number;
}

const mockBranches: Branch[] = [
  { id: '1', name: 'Pentagon Hall', location: 'KNUST Campus', code: 'PNT', isActive: true, staffCount: 3 },
  { id: '2', name: 'Brunei Hostel', location: 'KNUST Campus', code: 'BRN', isActive: true, staffCount: 2 },
  { id: '3', name: 'Unity Hall', location: 'KNUST Campus', code: 'UNT', isActive: false, staffCount: 0 },
];

const AdminBranches = () => {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '', code: '' });

  const addBranch = () => {
    if (!newBranch.name || !newBranch.location || !newBranch.code) {
      toast.error('Please fill in all fields');
      return;
    }

    const branch: Branch = {
      id: Date.now().toString(),
      name: newBranch.name,
      location: newBranch.location,
      code: newBranch.code.toUpperCase(),
      isActive: true,
      staffCount: 0
    };

    setBranches([...branches, branch]);
    setNewBranch({ name: '', location: '', code: '' });
    setShowAddForm(false);
    toast.success('Branch added successfully!');
  };

  const toggleBranchStatus = (id: string) => {
    setBranches(branches.map(b => 
      b.id === id ? { ...b, isActive: !b.isActive } : b
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Branches</h1>
          <p className="text-muted-foreground mt-1">Manage WashLab locations</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>

      {/* Pricing Info */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Pricing (All Branches)
        </h3>
        <div className="flex gap-6 text-sm">
          {PRICING_CONFIG.services.map(service => (
            <div key={service.id} className="flex items-center gap-2">
              <span className="text-muted-foreground">{service.label}:</span>
              <span className="font-semibold text-foreground">₵{service.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Branch Form */}
      {showAddForm && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Branch</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Branch Name</Label>
              <Input
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                placeholder="e.g., Independence Hall"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={newBranch.location}
                onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                placeholder="e.g., KNUST Campus"
              />
            </div>
            <div>
              <Label>Branch Code</Label>
              <Input
                value={newBranch.code}
                onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                placeholder="e.g., IND"
                maxLength={3}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={addBranch}>Add Branch</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div 
            key={branch.id} 
            className={`bg-card rounded-xl border p-6 ${
              branch.isActive ? 'border-border' : 'border-border/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                branch.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {branch.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1">{branch.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="w-3 h-3" />
              {branch.location}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{branch.staffCount} staff</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleBranchStatus(branch.id)}
                  className={branch.isActive ? 'text-destructive' : 'text-green-600'}
                >
                  {branch.isActive ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBranches;
