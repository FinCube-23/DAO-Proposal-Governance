import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ExchangeRatePie() {
  const totalMembers = 42; // Hardcoded number

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 pb-0">
        <div className="flex flex-col items-center mt-6 mb-2">
          <div className="text-lg font-semibold">Total Members</div>
          <div className="text-3xl font-bold mb-2">{totalMembers}</div>
          <Button size="sm" variant="outline">
            View all
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
