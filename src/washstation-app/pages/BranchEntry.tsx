import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import washLabWhiteLogo from '@/assets/washlab-white.png';
import { Building2, ArrowRight, User } from 'lucide-react';
import { toast } from 'sonner';
import { getActiveBranches, getBranchByCode, Branch } from '@/config/branches';

// Mock staff list for suggestions
const MOCK_STAFF = [
  { id: 'staff-1', name: 'John Mensah', role: 'Attendant' },
  { id: 'staff-2', name: 'Akosua Darko', role: 'Attendant' },
  { id: 'staff-3', name: 'Kwame Asante', role: 'Supervisor' },
  { id: 'staff-4', name: 'Ama Serwaa', role: 'Attendant' },
  { id: 'staff-5', name: 'Kofi Boateng', role: 'Manager' },
];

/**
 * Branch Entry Page
 * 
 * First screen staff sees when opening WashStation
 * - Enter branch code to identify location
 * - Select staff from suggestions (CLICKABLE)
 * - Proceed to biometric scan
 */
const BranchEntry = () => {
  const navigate = useNavigate();
  const [branchCode, setBranchCode] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [staffQuery, setStaffQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<typeof MOCK_STAFF[0] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const activeBranches = getActiveBranches();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const activeStaff = sessionStorage.getItem('washlab_active_staff');
    const branch = sessionStorage.getItem('washlab_branch');
    if (activeStaff && branch) {
      navigate('/washstation/dashboard');
    }
  }, [navigate]);

  const handleCodeChange = (code: string) => {
    const upperCode = code.toUpperCase();
    setBranchCode(upperCode);
    
    const branch = getBranchByCode(upperCode);
    setSelectedBranch(branch && branch.isActive ? branch : null);
  };

  // Filter staff based on query - only show when there's input
  const filteredStaff = staffQuery.length > 0 
    ? MOCK_STAFF.filter(s => 
        s.name.toLowerCase().includes(staffQuery.toLowerCase())
      )
    : [];

  const handleStaffSelect = (staff: typeof MOCK_STAFF[0]) => {
    setSelectedStaff(staff);
    setStaffQuery(staff.name);
    setShowSuggestions(false);
  };

  const handleContinue = () => {
    if (!selectedBranch) {
      toast.error('Please enter a valid branch code');
      return;
    }
    
    // Store branch in session with consistent key
    sessionStorage.setItem('washlab_branch', JSON.stringify(selectedBranch));
    
    // Store selected staff for face scan page
    if (selectedStaff) {
      sessionStorage.setItem('washlab_selected_staff', JSON.stringify(selectedStaff));
    }
    
    navigate('/washstation/scan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
      {/* Header - WHITE LOGO on blue background */}
      <header className="p-6">
        <img src={washLabWhiteLogo} alt="WashLab" className="h-10 w-auto" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-center text-foreground mb-2">
              WashStation
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Enter your branch code to begin
            </p>

            <div className="space-y-6">
              {/* Branch Code Input */}
              <div>
                <Label>Branch Code</Label>
                <Input
                  value={branchCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="e.g., ACD"
                  className="mt-2 text-center text-2xl font-bold tracking-widest h-14"
                  maxLength={3}
                />
              </div>

              {selectedBranch && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">Selected Branch</p>
                  <p className="text-lg font-bold text-foreground">{selectedBranch.name}</p>
                </div>
              )}

              {/* Staff Selection - CLICKABLE SUGGESTIONS */}
              {selectedBranch && (
                <div className="relative">
                  <Label>Staff Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={staffQuery}
                      onChange={(e) => {
                        setStaffQuery(e.target.value);
                        setShowSuggestions(true);
                        if (!e.target.value) setSelectedStaff(null);
                      }}
                      onFocus={() => staffQuery.length > 0 && setShowSuggestions(true)}
                      placeholder="Type to search staff..."
                      className="pl-10 h-12"
                    />
                  </div>
                  
                  {/* CLICKABLE Staff Suggestions - Only show when there's input */}
                  {showSuggestions && filteredStaff.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                      {filteredStaff.map((staff) => (
                        <button
                          key={staff.id}
                          type="button"
                          onClick={() => handleStaffSelect(staff)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">{staff.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleContinue}
                disabled={!selectedBranch}
                className="w-full h-14 text-lg rounded-xl gap-2"
              >
                Continue to Sign In
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Available codes: {activeBranches.map(b => `${b.code} (${b.name})`).join(', ')}
              </p>
              <p className="text-xs text-center text-amber-600 mt-2">
                ⚠️ Preview Mode – Data stored locally
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-white/60 text-sm">
          © 2025 WashLab • Tablet POS
        </p>
      </footer>
    </div>
  );
};

export default BranchEntry;