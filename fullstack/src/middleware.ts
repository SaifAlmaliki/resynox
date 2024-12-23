// Import middleware and utilities from Clerk for handling authentication in Next.js.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication.
const isPublicRoute = createRouteMatcher([
  "/",                     // Root path of the application (homepage).
  "/sign-in(.*)",          // Sign-in page and any sub-routes under it.
  "/sign-up(.*)",          // Sign-up page and any sub-routes under it.
  "/api/stripe-webhook",   // Stripe webhook endpoint.
]);

// Default export of the middleware that applies authentication logic to routes.
export default clerkMiddleware(async (auth, request) => {
  // If it's not a public route, enforce authentication.
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// Configuration for the middleware matcher, specifying which routes the middleware should run on.
export const config = {
  matcher: [
    // Match all routes except those that are part of Next.js internals or static files.
    // This ensures the middleware doesn't interfere with files like HTML, CSS, images, or fonts.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Explicitly include all API routes for authentication checks.
    "/(api|trpc)(.*)",
  ],
};
