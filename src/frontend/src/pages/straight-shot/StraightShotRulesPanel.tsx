import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StraightShotRulesPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Straight Shot Strokes Drill Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h3 className="mb-2 font-semibold">Objective</h3>
          <p className="text-muted-foreground">
            Clear all balls from the table in 20 shots or fewer to win. This drill helps you 
            develop efficient shot selection and position play.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">How to Play</h3>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Set up all balls on the table</li>
            <li>You may shoot any ball in any order</li>
            <li>The 8-ball must be pocketed last</li>
            <li>Complete the run and count your total shots</li>
            <li>After finishing, record the total number of shots you took</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Winning</h3>
          <p className="text-muted-foreground">
            <strong>20 shots or under is a win.</strong> Over 20 shots is a loss. Track your progress 
            over time with the moving average to see improvement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
