import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AcceptingGiftsPerformanceRow {
  ballCount: number;
  wins: number;
  losses: number;
}

interface AcceptingGiftsPerformanceByBallCountTableProps {
  rows: AcceptingGiftsPerformanceRow[];
}

export default function AcceptingGiftsPerformanceByBallCountTable({ rows }: AcceptingGiftsPerformanceByBallCountTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No performance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Ball Count</CardTitle>
        <CardDescription>
          Win/loss record for each starting ball count level (2–7) in Accepting Gifts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ball Count</TableHead>
              <TableHead>Wins</TableHead>
              <TableHead>Losses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.ballCount}>
                <TableCell className="font-medium">{row.ballCount}</TableCell>
                <TableCell>{row.wins}</TableCell>
                <TableCell>{row.losses}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
