import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { toast } from 'sonner';
import { 
  Fingerprint, 
  Clock, 
  LogIn, 
  LogOut,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AttendanceRecord {
  staffId: string;
  staffName: string;
  type: 'check_in' | 'check_out';
  timestamp: Date;
  branchCode: string;
}

interface AttendanceButtonProps {
  branchCode: string;
  currentStaff?: { id: string; name: string };
  onAttendanceRecorded?: (record: AttendanceRecord) => void;
}

// Store attendance in localStorage for demo
const ATTENDANCE_KEY = 'washlab_attendance';

const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const stored = localStorage.getItem(ATTENDANCE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeAttendance = (record: AttendanceRecord) => {
  const records = getStoredAttendance();
  records.push(record);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

const isStaffCheckedIn = (staffId: string): boolean => {
  const records = getStoredAttendance();
  const staffRecords = records.filter(r => r.staffId === staffId);
  if (staffRecords.length === 0) return false;
  
  const lastRecord = staffRecords[staffRecords.length - 1];
  return lastRecord.type === 'check_in';
};

export const AttendanceButton = ({ branchCode, currentStaff, onAttendanceRecorded }: AttendanceButtonProps) => {
  const { isSupported, isProcessing, verifyStaff } = useWebAuthn();
  const [showDialog, setShowDialog] = useState(false);
  const [lastAction, setLastAction] = useState<'check_in' | 'check_out' | null>(null);
  const [lastStaff, setLastStaff] = useState<string | null>(null);

  const handleAttendance = async () => {
    if (!isSupported) {
      toast.error('WebAuthn not supported on this device');
      return;
    }

    setShowDialog(true);
    const result = await verifyStaff();
    
    if (result.success && result.staffId && result.staffName) {
      const isCheckedIn = isStaffCheckedIn(result.staffId);
      const actionType = isCheckedIn ? 'check_out' : 'check_in';
      
      const record: AttendanceRecord = {
        staffId: result.staffId,
        staffName: result.staffName,
        type: actionType,
        timestamp: new Date(),
        branchCode
      };
      
      storeAttendance(record);
      setLastAction(actionType);
      setLastStaff(result.staffName);
      
      if (actionType === 'check_in') {
        toast.success(`${result.staffName} checked in!`, {
          description: `Time: ${new Date().toLocaleTimeString()}`
        });
      } else {
        toast.success(`${result.staffName} checked out!`, {
          description: `Time: ${new Date().toLocaleTimeString()}`
        });
      }
      
      onAttendanceRecorded?.(record);
      
      // Auto-close dialog after success
      setTimeout(() => setShowDialog(false), 1500);
    } else {
      setShowDialog(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleAttendance}
        variant="outline"
        className="gap-2 rounded-xl h-12 px-4 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
      >
        <Clock className="w-5 h-5" />
        Attendance
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Staff Attendance</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6">
            {isProcessing ? (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <p className="text-muted-foreground">Verifying identity...</p>
                <p className="text-sm text-muted-foreground mt-1">Complete biometric verification</p>
              </>
            ) : lastAction ? (
              <>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  lastAction === 'check_in' ? 'bg-success/10' : 'bg-accent/10'
                }`}>
                  {lastAction === 'check_in' ? (
                    <LogIn className="w-10 h-10 text-success" />
                  ) : (
                    <LogOut className="w-10 h-10 text-accent" />
                  )}
                </div>
                <p className="font-semibold text-foreground">
                  {lastAction === 'check_in' ? 'Checked In!' : 'Checked Out!'}
                </p>
                <p className="text-muted-foreground">{lastStaff}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date().toLocaleTimeString()}
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Fingerprint className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground">Tap to verify with Face ID</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const getTodayAttendance = (branchCode?: string): AttendanceRecord[] => {
  const records = getStoredAttendance();
  const today = new Date().toDateString();
  
  return records.filter(r => {
    const recordDate = new Date(r.timestamp).toDateString();
    const matchesBranch = branchCode ? r.branchCode === branchCode : true;
    return recordDate === today && matchesBranch;
  });
};

export const getStaffAttendanceStatus = (staffId: string): { isCheckedIn: boolean; lastAction?: AttendanceRecord } => {
  const records = getStoredAttendance();
  const staffRecords = records.filter(r => r.staffId === staffId);
  
  if (staffRecords.length === 0) {
    return { isCheckedIn: false };
  }
  
  const lastRecord = staffRecords[staffRecords.length - 1];
  return {
    isCheckedIn: lastRecord.type === 'check_in',
    lastAction: lastRecord
  };
};