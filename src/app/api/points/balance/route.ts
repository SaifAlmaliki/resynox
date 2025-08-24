import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { applyMonthlyAllowanceIfNeeded, getPointBalance, ensureUserSubscriptionAndStarterPoints } from "@/lib/points";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ points: 0 }, { status: 401 });
    }

    let points = 0;
    let isNewUser = false;
    let pointsGranted = 0;
    
    try {
      // Ensure new users have subscription and starter points
      const { isNewUser: newUser, pointsGranted: granted } = await ensureUserSubscriptionAndStarterPoints(userId);
      isNewUser = newUser;
      pointsGranted = granted;
      
      // Ensure monthly allowance is applied for the current period
      await applyMonthlyAllowanceIfNeeded(userId);
      // Read current balance
      points = await getPointBalance(userId);
    } catch {
      // If DB is unreachable, return 0 but do not fail the page
      points = 0;
    }

    return NextResponse.json({ 
      points, 
      isNewUser, 
      pointsGranted,
      message: isNewUser && pointsGranted > 0 ? "Welcome! You've received 30 starter points." : undefined
    });
  } catch {
    return NextResponse.json({ points: 0 }, { status: 500 });
  }
}
