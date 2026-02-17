import { Card, CardContent } from '@/components/ui/card';

export default function AcceptingGiftsRulesPanel() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="mb-2 font-semibold">Objective</h3>
          <p className="text-sm text-muted-foreground">
            Practice running out racks with a fixed number of object balls. Progress through 12 levels from 2+8 to 7+9.
          </p>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Level System</h3>
          <p className="text-sm text-muted-foreground">
            The drill uses a fixed 12-level progression: 2+8 → 3+8 → 2+9 → 3+9 → 4+8 → 4+9 → 5+8 → 5+9 → 6+8 → 6+9 → 7+8 → 7+9.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            "+8" levels: run balls in any order; the 8-ball must be called to finish.
          </p>
          <p className="text-sm text-muted-foreground">
            "+9" levels: run balls in strict ascending order; the 9-ball ends the rack.
          </p>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Match Format</h3>
          <p className="text-sm text-muted-foreground">
            Each match is a race to 7 against a ghost opponent. Each rack is one attempt. If you run out all balls, you get the point. Otherwise, the ghost gets the point.
          </p>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Progression Rules</h3>
          <p className="text-sm text-muted-foreground">
            <strong>Win:</strong> Move up to the next level in the sequence.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Loss:</strong> If you skipped ahead, stay at your baseline level. If you played at your baseline level, move down one level.
          </p>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Progress Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Your current level is saved across sessions. You can skip ahead to any level when starting a new match.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
