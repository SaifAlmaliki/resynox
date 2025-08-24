import prisma from "./prisma";
import { env } from "@/env";
import type { Prisma } from "@prisma/client";

// Map Stripe priceId -> monthly allowance
function getAllowanceForPriceId(priceId: string | null | undefined): number {
  if (!priceId) return 0;
  if (priceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY) return 80;
  if (priceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY) return 40;
  const id = priceId.toLowerCase();
  if (id.includes("pro_plus") || id.includes("proplus")) return 80;
  if (id.includes("pro")) return 40;
  return 0;
}

export async function getPointBalance(userId: string): Promise<number> {
  const sub = await prisma.userSubscription.findUnique({ where: { userId } });
  return sub?.pointsBalance ?? 0;
}

export async function hasPoints(userId: string, cost: number): Promise<boolean> {
  const balance = await getPointBalance(userId);
  return balance >= cost;
}

export async function creditPoints(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Prisma.InputJsonValue | null,
) {
  if (amount <= 0) return;
  await prisma.$transaction([
    prisma.userSubscription.update({
      where: { userId },
      data: { pointsBalance: { increment: amount } },
    }),
    prisma.pointsTransaction.create({
      data: { userId, delta: amount, reason, metadata: metadata ?? undefined },
    }),
  ]);
}

export async function deductPoints(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Prisma.InputJsonValue | null,
): Promise<{ ok: boolean; message?: string }> {
  if (amount <= 0) return { ok: true };
  return await prisma.$transaction(async (tx) => {
    const sub = await tx.userSubscription.findUnique({ where: { userId }, select: { pointsBalance: true } });
    const balance = sub?.pointsBalance ?? 0;
    if (balance < amount) return { ok: false, message: "Insufficient points" };

    await tx.userSubscription.update({
      where: { userId },
      data: { pointsBalance: { decrement: amount } },
    });
    await tx.pointsTransaction.create({
      data: { userId, delta: -amount, reason, metadata: metadata ?? undefined },
    });
    return { ok: true };
  });
}

// One-time 30 starter points on signup
export async function grantStarterPointsIfNeeded(userId: string) {
  const sub = await prisma.userSubscription.findUnique({ where: { userId } });
  if (!sub) return; // create on demand elsewhere
  if (sub.starterPointsGrantedAt) return;
  await prisma.$transaction([
    prisma.userSubscription.update({
      where: { userId },
      data: { starterPointsGrantedAt: new Date(), pointsBalance: { increment: 30 } },
    }),
    prisma.pointsTransaction.create({
      data: { userId, delta: 30, reason: "starter_bonus" },
    }),
  ]);
}

// Ensure new users have subscription record and starter points
export async function ensureUserSubscriptionAndStarterPoints(userId: string): Promise<{ isNewUser: boolean; pointsGranted: number }> {
  let sub = await prisma.userSubscription.findUnique({ where: { userId } });
  let isNewUser = false;
  let pointsGranted = 0;

  // If no subscription exists, create one for free users
  if (!sub) {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    sub = await prisma.userSubscription.create({
      data: {
        userId,
        stripeCustomerId: `free_${userId}`, // Placeholder for free users
        stripeSubscriptionId: `free_sub_${userId}`, // Placeholder for free users
        stripePriceId: '', // Empty string signifies no paid price
        stripeCurrentPeriodEnd: nextMonth,
        pointsBalance: 0,
        pointsAllowance: 0,
        voiceInterviewsUsed: 0,
        voiceInterviewsResetDate: now
      }
    });
    isNewUser = true;
  }

  // Grant starter points if not already granted
  if (!sub.starterPointsGrantedAt) {
    await prisma.$transaction([
      prisma.userSubscription.update({
        where: { userId },
        data: { starterPointsGrantedAt: new Date(), pointsBalance: { increment: 30 } },
      }),
      prisma.pointsTransaction.create({
        data: { userId, delta: 30, reason: "starter_bonus" },
      }),
    ]);
    pointsGranted = 30;
  }

  return { isNewUser, pointsGranted };
}

// Apply monthly allowance with rollover
export async function applyMonthlyAllowance(userId: string): Promise<number> {
  const sub = await prisma.userSubscription.findUnique({ where: { userId } });
  if (!sub) return 0;
  const allowance = getAllowanceForPriceId(sub.stripePriceId);
  if (allowance <= 0) return 0;
  await prisma.$transaction([
    prisma.userSubscription.update({
      where: { userId },
      data: { pointsAllowance: allowance, pointsBalance: { increment: allowance } },
    }),
    prisma.pointsTransaction.create({
      data: { userId, delta: allowance, reason: "monthly_allowance", metadata: { priceId: sub.stripePriceId } },
    }),
  ]);
  return allowance;
}

// Idempotent allowance for the current billing period
export async function applyMonthlyAllowanceIfNeeded(userId: string): Promise<number> {
  return await prisma.$transaction(async (tx) => {
    const sub = await tx.userSubscription.findUnique({ where: { userId } });
    if (!sub) return 0;
    const allowance = getAllowanceForPriceId(sub.stripePriceId);
    if (allowance <= 0) return 0;

    const periodEnd = sub.stripeCurrentPeriodEnd;
    if (!periodEnd) return 0;
    const periodStart = new Date(periodEnd);
    periodStart.setMonth(periodStart.getMonth() - 1);

    const alreadyCredited = await tx.pointsTransaction.count({
      where: {
        userId,
        reason: "monthly_allowance",
        createdAt: { gte: periodStart },
      },
    });

    if (alreadyCredited > 0) return 0;

    await tx.userSubscription.update({
      where: { userId },
      data: { pointsAllowance: allowance, pointsBalance: { increment: allowance } },
    });
    await tx.pointsTransaction.create({
      data: { userId, delta: allowance, reason: "monthly_allowance", metadata: { priceId: sub.stripePriceId ?? null } },
    });
    return allowance;
  });
}

export const POINT_COSTS = {
  enhance_experience: 2,
  resume_summary: 4,
  cover_letter: 5,
  cover_letter_enhance: 5,
  voice_session_start: 10,
  feedback: 0,
} as const;
