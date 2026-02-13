import { type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface ModeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  variant?: 'default' | 'accent';
}

export default function ModeCard({ title, description, icon, path, variant = 'default' }: ModeCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={`group cursor-pointer transition-all hover:shadow-lg ${variant === 'accent' ? 'border-emerald-500/50' : ''}`}>
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white transition-transform group-hover:scale-110">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => navigate({ to: path })}
          className="w-full"
          variant={variant === 'accent' ? 'default' : 'outline'}
        >
          Start New Game
        </Button>
      </CardContent>
    </Card>
  );
}
