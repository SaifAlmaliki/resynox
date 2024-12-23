import {
  Breadcrumb,             // Container for the breadcrumb component
  BreadcrumbItem,         // Represents a single item in the breadcrumb
  BreadcrumbLink,         // Provides a link for navigable breadcrumb items
  BreadcrumbList,         // Wrapper for the list of breadcrumb items
  BreadcrumbPage,         // Represents the current page in the breadcrumb
  BreadcrumbSeparator,    // Separator element between breadcrumb items
} from "@/components/ui/breadcrumb";

// Importing steps configuration to define navigation structure for breadcrumbs
import { steps } from "./steps";  // Array of steps with titles and keys
import React from "react";        // React library for building UI

// Interface to define the props expected by the Breadcrumbs component
interface BreadcrumbsProps {
  currentStep: string; // Represents the currently active step in the breadcrumb
  setCurrentStep: (step: string) => void; // Function to update the current step
}

// Breadcrumbs component definition
export default function Breadcrumbs({ currentStep, setCurrentStep }: BreadcrumbsProps) {
  return (
    // Center-align the breadcrumb container
    <div className="flex justify-center">
      {/* Outer wrapper for the breadcrumb */}
      <Breadcrumb>
        {/* Wrapper for the breadcrumb items */}
        <BreadcrumbList>
          {/* Map over the steps to dynamically generate breadcrumb items */}
          {steps.map((step) => (
            // React.Fragment allows grouping of multiple elements without adding an extra DOM node
            <React.Fragment key={step.key}>
              {/* Individual breadcrumb item */}
              <BreadcrumbItem>
                {/* Conditionally render the breadcrumb content */}
                {step.key === currentStep ? (
                  // Highlight the current page (non-navigable)
                  <BreadcrumbPage>{step.title}</BreadcrumbPage>
                ) : (
                  // Render as a link if not the current step (navigable)
                  <BreadcrumbLink asChild>
                    {/* Button that triggers navigation to the selected step */}
                    <button onClick={() => setCurrentStep(step.key)}>
                      {step.title}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {/* Separator between breadcrumb items, hidden for the last item */}
              <BreadcrumbSeparator className="last:hidden" />
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
