import { Card } from "@/components/ui/card"

export function GameInstructions() {
  return (
    <Card className="mt-8 p-4">
      <h3 className="font-semibold mb-2">How to Play:</h3>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>1. Each player mentally selects one logo from their grid</p>
        <p>2. Players take turns asking yes/no questions verbally</p>
        <p>3. Click on logos to eliminate them based on the answers</p>
        <p>4. First player to correctly guess their opponent's logo wins!</p>
      </div>
    </Card>
  )
}
