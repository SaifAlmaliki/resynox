import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { applyMonthlyAllowanceIfNeeded, getPointBalance, POINT_COSTS } from "@/lib/points";
import { getUserSubscriptionLevel } from "@/lib/subscription";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure allowance is applied before checking balance
    await applyMonthlyAllowanceIfNeeded(userId);

    const [subscriptionLevel, points] = await Promise.all([
      getUserSubscriptionLevel(userId),
      getPointBalance(userId),
    ]);

    // For AI tools access, require enough points for the cheapest AI action used here (cover letter = 5)
    const required = POINT_COSTS.cover_letter ?? 5;
    const canUse = points >= required;

    return NextResponse.json({
      canUse,
      subscriptionLevel,
      points,
      requiredPoints: required,
    });
  } catch (err) {
    console.error("/api/permissions/ai-tools error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
