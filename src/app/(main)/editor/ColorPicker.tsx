import { Button } from "@/components/ui/button"; // Custom button component
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Popover components for UI interactions
import usePremiumModal from "@/hooks/usePremiumModal"; // Custom hook to handle premium modal interactions
import { canUseCustomizations } from "@/lib/permissions"; // Function to check if customizations are allowed for the user's subscription
import { PaletteIcon } from "lucide-react"; // Icon component for the color palette
import { useState } from "react"; // React state hook
import { Color, ColorChangeHandler, TwitterPicker } from "react-color"; // React color picker library components
import { useSubscriptionLevel } from "../SubscriptionLevelProvider"; // Hook to get the user's current subscription level

// Props for the ColorPicker component
interface ColorPickerProps {
  color: Color | undefined; // Current selected color
  onChange: ColorChangeHandler; // Function to handle color change
}

// Main component: ColorPicker
// Allows users to pick a color for their resume, with restrictions based on their subscription level.
export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const subscriptionLevel = useSubscriptionLevel(); // Get the user's current subscription level
  const premiumModal = usePremiumModal(); // Hook to open the premium upgrade modal
  const [showPopover, setShowPopover] = useState(false); // State to control the visibility of the popover

  return (
    // Popover container to toggle color picker visibility
    <Popover open={showPopover} onOpenChange={setShowPopover}>
      {/* Trigger for the popover, using a custom button */}
      <PopoverTrigger asChild>
        <Button
          variant="outline" // Button style variant
          size="icon"       // Icon-sized button
          title="Change resume color" // Tooltip for accessibility
          onClick={() => {
            // Check if the user has access to customizations
            if (!canUseCustomizations(subscriptionLevel)) {
              premiumModal.setOpen(true); // Open the premium modal if access is restricted
              return;
            }
            setShowPopover(true); // Open the popover if access is granted
          }}
        >
          <PaletteIcon className="size-5" /> {/* Color palette icon */}
        </Button>
      </PopoverTrigger>

      {/* Popover content: Displays the color picker */}
      <PopoverContent
        className="border-none bg-transparent shadow-none" // Remove default styles for customization
        align="end" // Align the popover to the end of the button
      >
        {/* TwitterPicker: A compact color picker component */}
        <TwitterPicker
          color={color} // Current selected color
          onChange={onChange} // Handle color change
          triangle="top-right" // Triangle indicator for the popover position
        />
      </PopoverContent>
    </Popover>
  );
}