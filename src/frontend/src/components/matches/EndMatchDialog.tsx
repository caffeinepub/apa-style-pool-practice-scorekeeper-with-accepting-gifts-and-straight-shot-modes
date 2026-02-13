import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface EndMatchDialogProps {
  onConfirm: () => Promise<void>;
  disabled?: boolean;
}

export default function EndMatchDialog({ onConfirm, disabled }: EndMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const handleConfirm = async () => {
    setIsEnding(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="lg" className="w-full">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          End & Save Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Session?</DialogTitle>
          <DialogDescription>
            This will save the session to your history. You can view it later from the Match History page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isEnding}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isEnding}>
            {isEnding ? 'Saving...' : 'End & Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
