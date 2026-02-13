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
            Clear all balls from the table in 20 strokes or fewer to win. This drill helps you 
            develop efficient shot selection and position play.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">How to Play</h3>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>You may shoot any ball in any order</li>
            <li>The 8-ball must be pocketed last</li>
            <li>You must pocket all balls to complete the drill</li>
            <li>The break shot does not count as a stroke</li>
            <li>Each normal shot counts as 1 stroke</li>
            <li>Each scratch counts as 2 strokes</li>
            <li>If you scratch on the break, it counts as 1 stroke (the break itself doesn't count, but the scratch penalty does)</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Winning</h3>
          <p className="text-muted-foreground">
            Complete the drill with a total of 20 strokes or fewer to win. Track your progress 
            over time with the moving average to see improvement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
