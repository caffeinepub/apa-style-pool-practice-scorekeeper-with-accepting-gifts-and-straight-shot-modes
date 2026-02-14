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
            Practice "accepting gifts" from your opponent in 8-ball matches, when your opponent 
            misses the 8 or one of their last balls. This drill was introduced by Andreas Huber, 
            a professional pool player and instructor.
          </p>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Setup</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Start with a configurable number of object balls (2-7, default 3) plus the 8-ball</li>
            <li>Rack the balls in a diamond or triangle formation</li>
            <li>You play against a "ghost" opponent in a race to 7 sets</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Scoring</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Each set is a race to 7 points</li>
            <li>Run out all balls successfully = 1 point for you</li>
            <li>Miss or fail to run out = 1 point for the ghost</li>
            <li>First to 7 points wins the set</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Ball Count Progression</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Win a set: Add 1 object ball for the next set</li>
            <li>Lose a set: Remove 1 object ball for the next set</li>
            <li>Ball count is clamped between 2 and 7 object balls</li>
            <li>Your progress is saved and continues across sessions</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Tips</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Focus on position play and pattern recognition</li>
            <li>Practice different break patterns and layouts</li>
            <li>Track your progress over multiple sessions</li>
            <li>Challenge yourself to maintain higher ball counts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
