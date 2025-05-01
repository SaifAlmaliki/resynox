import { SubscriptionLevel } from "./subscription";

/**
 * Determines whether a user can create more resumes based on their subscription level and current resume count.
 *
 * @param subscriptionLevel - The user's current subscription level (e.g., "free", "pro").
 * @param currentResumeCount - The number of resumes the user has already created.
 * @returns true if the user can create more resumes, false otherwise.
 */
export function canCreateResume(subscriptionLevel: SubscriptionLevel, currentResumeCount: number ) {
  // A mapping that defines the maximum number of resumes allowed for each subscription level
  const maxResumeMap: Record<SubscriptionLevel, number> = {
    free: 1,            // Free users can create 1 resume
    pro: Infinity,      // Pro users can create unlimited resumes (merged with pro_plus)
  };

  // Look up the maximum number of resumes allowed for the user's subscription level
  const maxResumes = maxResumeMap[subscriptionLevel];

  // Return true if the user's current resume count is less than the maximum allowed
  return currentResumeCount < maxResumes;
}

/**
 * Determines whether a user can use AI tools based on their subscription level.
 *
 * @param subscriptionLevel - The user's subscription level (e.g., "free", "pro").
 * @returns true if the user can use AI tools, false if they are on the free plan.
 */
export function canUseAITools(subscriptionLevel: SubscriptionLevel) {
  // AI tools are available for all subscription levels except "free"
  return subscriptionLevel !== "free";
}

/**
 * Determines whether a user can access advanced customizations based on their subscription level.
 *
 * @param subscriptionLevel - The user's subscription level (e.g., "free", "pro").
 * @returns true if the user is on the "pro" subscription, false otherwise.
 */
export function canUseCustomizations(subscriptionLevel: SubscriptionLevel) {
  // Advanced customizations are available to all "pro" users (merged with pro_plus)
  return subscriptionLevel === "pro";
}
