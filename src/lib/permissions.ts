import { SubscriptionLevel } from "./subscription";
import prisma from "./prisma";

export function canCreateResume(subscriptionLevel: SubscriptionLevel, currentResumeCount: number ) {
  // A mapping that defines the maximum number of resumes allowed for each subscription level
  const maxResumeMap: Record<SubscriptionLevel, number> = {
    free: 1,
    pro: Infinity,
    pro_plus: Infinity,
  };

  // Look up the maximum number of resumes allowed for the user's subscription level
  const maxResumes = maxResumeMap[subscriptionLevel];

  // Return true if the user's current resume count is less than the maximum allowed
  return currentResumeCount < maxResumes;
}

export function canUseAITools(subscriptionLevel: SubscriptionLevel) {
  // AI tools are available for all subscription levels except "free"
  return subscriptionLevel !== "free";
}

export function canUseCustomizations(subscriptionLevel: SubscriptionLevel) {
  // Advanced customizations are available to "pro" and "pro_plus" users
  return subscriptionLevel === "pro" || subscriptionLevel === "pro_plus";
}

export function canCreateCoverLetter(subscriptionLevel: SubscriptionLevel, currentCoverLetterCount: number) {
  // A mapping that defines the maximum number of cover letters allowed for each subscription level
  const maxCoverLetterMap: Record<SubscriptionLevel, number> = {
    free: 1,
    pro: 3,
    pro_plus: 10,
  };

  // Look up the maximum number of cover letters allowed for the user's subscription level
  const maxCoverLetters = maxCoverLetterMap[subscriptionLevel];

  // Return true if the user's current cover letter count is less than the maximum allowed
  return currentCoverLetterCount < maxCoverLetters;
}

export function canUseVoiceAgent(subscriptionLevel: SubscriptionLevel) {
  // Voice agent for mock interviews is available only to "pro_plus" users
  return subscriptionLevel === "pro_plus";
}

export async function canUseVoiceInterview(userId: string): Promise<{ canUse: boolean; used: number; limit: number }> {
  try {
    // Get user's subscription details
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    // For users without subscription (free tier), create a basic record to track usage
    if (!subscription) {
      // Create a basic subscription record for free users to track voice interview usage
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await prisma.userSubscription.create({
        data: {
          userId,
          stripeCustomerId: `free_${userId}`, // Placeholder for free users
          stripeSubscriptionId: `free_sub_${userId}`, // Placeholder for free users
          stripePriceId: 'free_tier',
          stripeCurrentPeriodEnd: nextMonth,
          voiceInterviewsUsed: 0,
          voiceInterviewsResetDate: now
        }
      });
      
      return { canUse: true, used: 0, limit: 2 };
    }

    // Check if user has active subscription
    const now = new Date();
    const isActiveSubscription = subscription.stripeCurrentPeriodEnd > now;
    
    if (!isActiveSubscription) {
      // Expired subscription - treat as free tier
      return { canUse: true, used: 0, limit: 2 };
    }

    // Check subscription type and set limits accordingly
    const priceId = subscription.stripePriceId.toLowerCase();
    const isProPlus = priceId.includes('pro_plus') || priceId.includes('proplus');
    const isPro = priceId.includes('pro') && !isProPlus;
    
    let limit: number;
    if (isProPlus) {
      limit = 5; // Pro Plus users get 5 voice interviews
    } else if (isPro) {
      limit = 3; // Pro users get 3 voice interviews
    } else {
      limit = 2; // Free/other users get 2 voice interviews
    }

    let used = subscription.voiceInterviewsUsed;

    // Check if we need to reset the counter based on billing period
    const currentPeriodStart = new Date(subscription.stripeCurrentPeriodEnd);
    currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1); // Go back one month to get period start

    if (!subscription.voiceInterviewsResetDate || subscription.voiceInterviewsResetDate < currentPeriodStart) {
      // Reset the counter for new billing period
      await prisma.userSubscription.update({
        where: { userId },
        data: {
          voiceInterviewsUsed: 0,
          voiceInterviewsResetDate: currentPeriodStart
        }
      });
      used = 0;
    }

    return {
      canUse: used < limit,
      used,
      limit
    };
  } catch (error) {
    console.error("Error checking voice interview permissions:", error);
    return { canUse: false, used: 0, limit: 0 };
  }
}

export async function incrementVoiceInterviewUsage(userId: string): Promise<void> {
  try {
    // First check if user has a subscription record
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });
    
    if (subscription) {
      // Update existing subscription
      await prisma.userSubscription.update({
        where: { userId },
        data: {
          voiceInterviewsUsed: {
            increment: 1
          }
        }
      });
    } else {
      // This shouldn't happen if canUseVoiceInterview was called first,
      // but handle it gracefully by creating a record
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await prisma.userSubscription.create({
        data: {
          userId,
          stripeCustomerId: `free_${userId}`,
          stripeSubscriptionId: `free_sub_${userId}`,
          stripePriceId: 'free_tier',
          stripeCurrentPeriodEnd: nextMonth,
          voiceInterviewsUsed: 1, // Start with 1 since we're incrementing
          voiceInterviewsResetDate: now
        }
      });
    }
  } catch (error) {
    console.error("Error incrementing voice interview usage:", error);
  }
}
