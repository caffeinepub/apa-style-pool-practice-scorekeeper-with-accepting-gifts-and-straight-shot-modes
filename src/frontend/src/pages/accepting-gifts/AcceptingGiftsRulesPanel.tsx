import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AcceptingGiftsRulesPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accepting Gifts Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h3 className="mb-2 font-semibold">Objective</h3>
          <p className="text-muted-foreground">
            The Accepting Gifts drill is designed to practice position play and shot selection. 
            The goal is to run out the table while accepting difficult positions ("gifts") that 
            your opponent leaves you.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">How to Play</h3>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Start with ball in hand</li>
            <li>Attempt to run out the remaining balls on the table</li>
            <li>Score points based on successful runs and position play</li>
            <li>Track your progress over multiple sessions</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Scoring</h3>
          <p className="text-muted-foreground">
            Award yourself points for successful runs, good position play, and completing 
            difficult shots. The exact scoring system can be customized to your practice goals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
