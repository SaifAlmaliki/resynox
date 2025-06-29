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

    if (!subscription) {
      return { canUse: false, used: 0, limit: 0 };
    }

    // Check if user has Pro Plus subscription
    const now = new Date();
    const isActiveSubscription = subscription.stripeCurrentPeriodEnd > now;
    
    if (!isActiveSubscription) {
      return { canUse: false, used: 0, limit: 0 };
    }

    // Check if this is a Pro Plus subscription
    const priceId = subscription.stripePriceId.toLowerCase();
    const isProPlus = priceId.includes('pro_plus') || priceId.includes('proplus');
    
    if (!isProPlus) {
      return { canUse: false, used: 0, limit: 0 };
    }

    // Pro Plus users get 5 voice interviews per billing period
    const limit = 5;
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
    await prisma.userSubscription.update({
      where: { userId },
      data: {
        voiceInterviewsUsed: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error("Error incrementing voice interview usage:", error);
  }
}
