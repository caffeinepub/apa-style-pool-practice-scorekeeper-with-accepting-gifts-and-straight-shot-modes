import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APA_SKILL_LEVELS, formatSkillLevel, getPointsToWin } from '../../lib/apa/apaEqualizer';

interface ProfileSetupDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: 'setup' | 'edit';
}

export default function ProfileSetupDialog({ open: controlledOpen, onOpenChange, mode = 'setup' }: ProfileSetupDialogProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [apaSkillLevel, setApaSkillLevel] = useState<string>('');

  const isAuthenticated = !!identity;
  const showProfileSetup = mode === 'setup' && isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const isOpen = controlledOpen !== undefined ? controlledOpen : showProfileSetup;

  useEffect(() => {
    if (mode === 'edit' && userProfile) {
      setName(userProfile.name);
      setApaSkillLevel(userProfile.apaSkillLevel ? userProfile.apaSkillLevel.toString() : '');
    } else if (!showProfileSetup) {
      setName('');
      setApaSkillLevel('');
    }
  }, [showProfileSetup, mode, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const profile = {
        name: name.trim(),
        apaSkillLevel: apaSkillLevel ? BigInt(apaSkillLevel) : undefined,
      };
      await saveProfile.mutateAsync(profile);
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (mode === 'edit' && onOpenChange) {
      onOpenChange(open);
    }
    // For setup mode, prevent closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
        if (mode === 'setup') {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Your Profile' : 'Welcome! Set up your profile'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Update your name and default APA skill level'
              : 'Please enter your name to get started with Pool Scorekeeper'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apa-skill-level">APA 9-Ball Skill Level (Default)</Label>
            <Select value={apaSkillLevel} onValueChange={setApaSkillLevel}>
              <SelectTrigger id="apa-skill-level">
                <SelectValue placeholder="Select skill level (optional)" />
              </SelectTrigger>
              <SelectContent>
                {APA_SKILL_LEVELS.map(sl => (
                  <SelectItem key={sl} value={sl.toString()}>
                    {formatSkillLevel(sl)} - {getPointsToWin(sl)} points
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used as your default skill level when starting APA matches
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={!name.trim() || saveProfile.isPending}
            >
              {saveProfile.isPending ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Continue'}
            </Button>
            {mode === 'edit' && onOpenChange && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
