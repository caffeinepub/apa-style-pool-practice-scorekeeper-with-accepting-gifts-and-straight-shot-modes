import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useActorRetry } from '../../hooks/useActorRetry';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APA_SKILL_LEVELS, formatSkillLevel } from '../../lib/apa/apaEqualizer';
import { Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';

export default function ProfileSetupDialog() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { retryConnection } = useActorRetry();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [showConnectionWarning, setShowConnectionWarning] = useState(false);

  const isAuthenticated = !!identity;

  // Show profile setup dialog if user is authenticated but has no profile
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setIsOpen(true);
      setIsEditMode(false);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  // Show connection warning after 8 seconds if actor is still not available
  useEffect(() => {
    if (isOpen && !actor && identity) {
      const timer = setTimeout(() => {
        setShowConnectionWarning(true);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setShowConnectionWarning(false);
    }
  }, [isOpen, actor, identity]);

  // Load existing profile data when editing
  useEffect(() => {
    if (isEditMode && userProfile) {
      setName(userProfile.name);
      setSkillLevel(userProfile.apaSkillLevel ? userProfile.apaSkillLevel.toString() : '');
    }
  }, [isEditMode, userProfile]);

  const handleOpenEditMode = () => {
    if (userProfile) {
      setName(userProfile.name);
      setSkillLevel(userProfile.apaSkillLevel ? userProfile.apaSkillLevel.toString() : '');
      setIsEditMode(true);
      setIsOpen(true);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready. Please wait and try again.');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        apaSkillLevel: skillLevel ? BigInt(parseInt(skillLevel)) : undefined,
      });

      toast.success(isEditMode ? 'Profile updated successfully' : 'Profile created successfully');
      setIsOpen(false);
      setIsEditMode(false);
      setName('');
      setSkillLevel('');
    } catch (error) {
      const errorText = extractErrorText(error);
      toast.error(errorText);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      setIsOpen(false);
      setIsEditMode(false);
      setName('');
      setSkillLevel('');
    }
  };

  const handleRetryConnection = () => {
    retryConnection();
    toast.info('Retrying connection...');
  };

  const canSave = name.trim().length > 0;

  return (
    <>
      {/* Edit Profile Button (only shown when profile exists) */}
      {isAuthenticated && userProfile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenEditMode}
          title="Edit Profile"
        >
          <Settings className="h-5 w-5" />
        </Button>
      )}

      {/* Profile Setup/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={isEditMode ? setIsOpen : undefined}>
        <DialogContent className={isEditMode ? '' : 'pointer-events-auto'}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Profile' : 'Welcome! Set Up Your Profile'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update your profile information below.'
                : 'Please enter your name to get started. You can also set your APA skill level.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Connection Warning */}
            {showConnectionWarning && !actor && (
              <Alert>
                <AlertDescription className="flex items-center justify-between">
                  <span>Still connecting to backend. Please wait or retry.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryConnection}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Connection
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saveProfile.isPending}
              />
            </div>

            {/* APA Skill Level */}
            <div className="space-y-2">
              <Label htmlFor="skillLevel">APA Skill Level (Optional)</Label>
              <Select
                value={skillLevel}
                onValueChange={setSkillLevel}
                disabled={saveProfile.isPending}
              >
                <SelectTrigger id="skillLevel">
                  <SelectValue placeholder="Select your skill level" />
                </SelectTrigger>
                <SelectContent>
                  {APA_SKILL_LEVELS.map((sl) => (
                    <SelectItem key={sl} value={sl.toString()}>
                      {formatSkillLevel(sl)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isEditMode && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saveProfile.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!canSave || saveProfile.isPending}
              className="flex-1"
            >
              {saveProfile.isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
