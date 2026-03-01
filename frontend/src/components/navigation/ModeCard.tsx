import { type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Play, RotateCcw } from 'lucide-react';
import { hasInProgressSession, type SessionKey } from '@/lib/session/inProgressSessions';

interface ModeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  variant?: 'default' | 'accent';
  sessionKey?: SessionKey;
  resumePath?: string;
  primaryCtaText?: string;
}

export default function ModeCard({ 
  title, 
  description, 
  icon, 
  path, 
  variant = 'default',
  sessionKey,
  resumePath,
  primaryCtaText = 'Start New Game',
}: ModeCardProps) {
  const navigate = useNavigate();
  const hasResume = sessionKey && resumePath && hasInProgressSession(sessionKey);

  return (
    <Card className={`group transition-all hover:shadow-lg ${variant === 'accent' ? 'border-emerald-500/50' : ''}`}>
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white transition-transform group-hover:scale-110">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={() => navigate({ to: path })}
          className="w-full gap-2"
          variant={hasResume ? 'outline' : 'default'}
        >
          <Play className="h-4 w-4" />
          {primaryCtaText}
        </Button>
        {hasResume && (
          <Button
            onClick={() => navigate({ to: resumePath })}
            className="w-full gap-2"
            variant="default"
          >
            <RotateCcw className="h-4 w-4" />
            Resume Game
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
