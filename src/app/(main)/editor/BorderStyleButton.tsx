import { Button } from "@/components/ui/button"; // Custom button component
import usePremiumModal from "@/hooks/usePremiumModal"; // Hook to control the premium modal
import { canUseCustomizations } from "@/lib/permissions"; // Function to check customization permissions
import { Circle, Square, Squircle } from "lucide-react"; // Icon components representing different border styles
import { useSubscriptionLevel } from "../SubscriptionLevelProvider"; // Hook to get the user's current subscription level

// Enum-like object defining possible border styles
export const BorderStyles = {
  SQUARE: "square",     // Square border style
  CIRCLE: "circle",     // Circle border style
  SQUIRCLE: "squircle", // Squircle (rounded square) border style
};

// Extract border styles into an array for easy cycling
const borderStyles = Object.values(BorderStyles);

// Props for the BorderStyleButton component
interface BorderStyleButtonProps {
  borderStyle: string | undefined; // Current selected border style
  onChange: (borderStyle: string) => void; // Callback function to handle border style changes
}

// Main component: BorderStyleButton
// Allows users to toggle between different border styles for their resume.
export default function BorderStyleButton({ borderStyle, onChange }: BorderStyleButtonProps) {
  const subscriptionLevel = useSubscriptionLevel(); // Get the user's subscription level
  const premiumModal = usePremiumModal();           // Hook to open the premium modal

  /**
   * Handles the click event on the button.
   * - Opens the premium modal if the user lacks customization permissions.
   * - Otherwise, cycles through the available border styles.
   */
  function handleClick() {
    // Check if the user has access to border customizations
    if (!canUseCustomizations(subscriptionLevel)) {
      premiumModal.setOpen(true); // Open the premium modal if access is restricted
      return; // Exit early if customizations are not allowed
    }

    // Find the index of the current border style in the array
    const currentIndex = borderStyle ? borderStyles.indexOf(borderStyle) : 0;

    // Calculate the index of the next border style in a cyclic manner
    const nextIndex = (currentIndex + 1) % borderStyles.length;

    // Call the onChange handler with the next border style
    onChange(borderStyles[nextIndex]);
  }

  // Dynamically determine which icon to display based on the current border style
  const Icon =
    borderStyle === "square"
      ? Square // Square icon
      : borderStyle === "circle"
      ? Circle // Circle icon
      : Squircle; // Squircle icon (default)

  // Render the button with the appropriate icon and functionality
  return (
    <Button variant="outline" size="icon" title="Change border style" onClick={handleClick}>
      <Icon className="size-5" /> {/* Display the appropriate icon */}
    </Button>
  );
}
