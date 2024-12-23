import { cn } from "@/lib/utils";       // A utility function for conditional classnames
import { Loader2 } from "lucide-react"; // An icon component (a loader/spinner) from Lucide React icon library
import { Button, ButtonProps } from "./ui/button"; // Reuse the existing Button component and its props

interface LoadingButtonProps extends ButtonProps {
  loading: boolean; // Indicates if the button is in a loading state
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  // This component renders a button that can show a loading spinner when 'loading' is true.
  // It leverages the base Button component and dynamically adjusts disabled state and styles.

  return (
    <Button
      disabled={loading || disabled}
      // Disable the button if it's loading or if it's explicitly disabled.

      className={cn("flex items-center gap-2", className)}
      // Add spacing and alignment classes, merge with any additional classes passed in.

      {...props}
      // Spread the remaining props onto the underlying Button component.
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {/* If in loading state, show a spinner icon that rotates */}

      {props.children}
      {/* Render the button's children (e.g., text or icons) passed from the parent */}
    </Button>
  );
}
