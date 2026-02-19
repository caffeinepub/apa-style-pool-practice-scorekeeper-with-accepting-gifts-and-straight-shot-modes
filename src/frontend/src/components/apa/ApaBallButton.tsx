import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BallState = 'unscored' | 'playerA' | 'playerB' | 'dead';

interface ApaBallButtonProps {
  ballNumber: number;
  state: BallState;
  onClick: () => void;
  disabled?: boolean;
  isDead?: boolean;
}

export default function ApaBallButton({ ballNumber, state, onClick, disabled, isDead }: ApaBallButtonProps) {
  const ballValue = ballNumber === 9 ? 2 : 1;
  
  const stateStyles = {
    unscored: 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400',
    playerA: 'bg-emerald-600 border-2 border-emerald-700 text-white hover:bg-emerald-700',
    playerB: 'bg-blue-600 border-2 border-blue-700 text-white hover:bg-blue-700',
    dead: 'bg-gray-400 border-2 border-gray-500 text-white hover:bg-gray-500',
  };

  const stateLabels = {
    unscored: 'Unscored',
    playerA: 'Player A',
    playerB: 'Player B',
    dead: 'Dead Ball',
  };

  // Use isDead prop to override state styling when needed
  const effectiveState = isDead ? 'dead' : state;

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isDead}
      className={cn(
        'h-16 w-16 rounded-full text-xl font-bold shadow-md transition-all',
        stateStyles[effectiveState],
        (disabled || isDead) && 'opacity-40 cursor-not-allowed hover:opacity-40'
      )}
      aria-label={`Ball ${ballNumber} (${ballValue} point${ballValue > 1 ? 's' : ''}) - ${stateLabels[effectiveState]}`}
    >
      {ballNumber}
    </Button>
  );
}
