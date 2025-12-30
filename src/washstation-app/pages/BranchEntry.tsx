import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import washLabLogo from '@/assets/washlab-logo.png';
import { Building2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

// Default branch - Academic City
const BRANCHES = [
  { id: 'academic-city', name: 'Academic City', code: 'ACD' },
];

/**
 * Branch Entry Page
 * 
 * First screen staff sees when opening WashStation
 * - Enter branch code to identify location
 * - Proceed to biometric scan
 */
const BranchEntry = () => {
  const navigate = useNavigate();
  const [branchCode, setBranchCode] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<typeof BRANCHES[0] | null>(null);

  const handleCodeChange = (code: string) => {
    const upperCode = code.toUpperCase();
    setBranchCode(upperCode);
    
    const branch = BRANCHES.find(b => b.code === upperCode);
    setSelectedBranch(branch || null);
  };

  const handleContinue = () => {
    if (!selectedBranch) {
      toast.error('Please enter a valid branch code');
      return;
    }
    
    // Store branch in session with consistent key
    sessionStorage.setItem('washlab_branch', JSON.stringify(selectedBranch));
    navigate('/washstation/scan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
      {/* Header */}
      <header className="p-6">
        <img src={washLabLogo} alt="WashLab" className="h-10 w-auto" />
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
                Available codes: ACD (Academic City)
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
