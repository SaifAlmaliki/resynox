import { SubscriptionLevel } from "./subscription";

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

export function canUseVoiceAgent(subscriptionLevel: SubscriptionLevel) {
  // Voice agent for mock interviews is available only to "pro_plus" users
  return subscriptionLevel === "pro_plus";
}
