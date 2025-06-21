// Import required components and libraries
import { Button } from "@/components/ui/button"; // UI button component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Form-related components for better structure and validation
import { Input } from "@/components/ui/input"; // UI input component
import { EditorFormProps } from "@/lib/types"; // Type definitions for props
import { cn } from "@/lib/utils"; // Utility function for conditional classnames
import { educationSchema, EducationValues } from "@/lib/validation"; // Zod schema for validation and related types
import {
  closestCenter, // Drag-and-drop collision detection strategy
  DndContext, // Context for drag-and-drop
  DragEndEvent, // Event type for drag-end
  KeyboardSensor, // Sensor for keyboard interactions
  PointerSensor, // Sensor for mouse/pointer interactions
  useSensor, // Hook to create a sensor
  useSensors, // Hook to manage multiple sensors
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"; // Modifier to restrict dragging to vertical axis
import {
  arrayMove,       // Helper to reorder items in an array
  SortableContext, // Context for sortable elements
  sortableKeyboardCoordinates, // Keyboard coordinates for sorting
  useSortable,    // Hook to make an item sortable
  verticalListSortingStrategy, // Strategy for vertical sorting
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"; // Utilities for styling during dragging
import { zodResolver } from "@hookform/resolvers/zod"; // Resolver for Zod schema validation
import { GripHorizontal, Trash2 } from "lucide-react"; // Icons for UI elements
import { useEffect } from "react"; // React hook for lifecycle events
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form"; // Hooks for managing forms

// Main EducationForm component
export default function EducationForm({
  resumeData, // Resume data passed as props
  setResumeData, // Function to update resume data
}: EditorFormProps) {
  // Initialize form with default values and validation schema
  const form = useForm<EducationValues>({
    resolver: zodResolver(educationSchema), // Use Zod schema for validation
    defaultValues: {
      educations: resumeData.educations || [], // Load existing education data or an empty array
    },
  });

  // Sync form changes with parent component state
  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger(); // Validate form
      if (!isValid) return; // Skip update if invalid
      setResumeData({
        ...resumeData,
        educations: values.educations?.filter((edu) => edu !== undefined) || [], // Update parent state with valid education entries
      });
    });
    return unsubscribe; // Cleanup the watcher on component unmount
  }, [form, resumeData, setResumeData]);

  // Manage a dynamic list of education fields
  const { fields, append, remove, move } = useFieldArray({
    control: form.control, // Attach control to manage form state
    name: "educations", // Field name in form data
  });

  // Set up drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor), // Sensor for mouse/pointer interactions
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates, // Keyboard sorting strategy
    })
  );

  // Handle the drag-end event to reorder education fields
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event; // Extract active and over items
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id); // Find the index of the dragged item
      const newIndex = fields.findIndex((field) => field.id === over.id); // Find the index of the drop target
      move(oldIndex, newIndex); // Update the order in the form
      return arrayMove(fields, oldIndex, newIndex); // Reorder the fields array
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header Section */}
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Education</h2>
        <p className="text-sm text-muted-foreground">
          Add as many educations as you like.
        </p>
      </div>

      {/* Form Section */}
      <Form {...form}>
        <form className="space-y-3">
          {/* Drag-and-Drop Context */}
          <DndContext
            sensors={sensors} // Sensors for interaction
            collisionDetection={closestCenter} // Define how collisions are detected
            onDragEnd={handleDragEnd} // Handle drag-end event
            modifiers={[restrictToVerticalAxis]} // Restrict dragging to vertical axis
          >
            {/* Sortable Context */}
            <SortableContext
              items={fields} // List of draggable items
              strategy={verticalListSortingStrategy} // Sorting strategy for vertical lists
            >
              {/* Render each education field */}
              {fields.map((field, index) => (
                <EducationItem
                  id={field.id}   // Unique identifier for the item
                  key={field.id}  // React key for rendering
                  index={index}   // Index of the item in the list
                  form={form}     // Form instance
                  remove={remove} // Function to remove an item
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add Education Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() =>
                append({
                  degree: "", // Default degree value
                  school: "", // Default school value
                  startDate: "", // Default start date
                  endDate: "", // Default end date
                })
              }
            >
              Add education
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Component for individual education items
interface EducationItemProps {
  id: string; // Unique ID for the item
  form: UseFormReturn<EducationValues>; // Form instance
  index: number; // Index of the item
  remove: (index: number) => void; // Function to remove the item
}

function EducationItem({ id, form, index, remove }: EducationItemProps) {
  // Hooks for drag-and-drop functionality
  const {
    attributes, // Dragging attributes
    listeners,  // Event listeners
    setNodeRef, // Ref for the draggable element
    transform,  // Transformation styles for dragging
    transition, // CSS transition for dragging
    isDragging, // Whether the item is currently being dragged
  } = useSortable({ id });

  return (
    <div
      className={cn(
        "space-y-3 rounded-md border bg-background p-3",
        isDragging && "relative z-50 cursor-grab shadow-xl" // Styling when dragging
      )}
      ref={setNodeRef} // Attach ref to the container
      style={{
        transform: CSS.Transform.toString(transform), // Apply transformations
        transition, // Apply transitions
      }}
    >
      {/* Header with Drag Handle */}
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Education {index + 1}</span>
        <GripHorizontal
          className="size-5 cursor-grab text-muted-foreground focus:outline-none"
          {...attributes} // Drag attributes
          {...listeners} // Drag listeners
        />
      </div>

      {/* Degree Input */}
      <FormField
        control={form.control}
        name={`educations.${index}.degree`} // Field name in form data
        render={({ field }) => (
          <FormItem>
            <FormLabel>Degree</FormLabel>
            <FormControl>
              <Input {...field} autoFocus /> {/* Input for degree */}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* School Input */}
      <FormField
        control={form.control}
        name={`educations.${index}.school`} // Field name in form data
        render={({ field }) => (
          <FormItem>
            <FormLabel>School</FormLabel>
            <FormControl>
              <Input {...field} /> {/* Input for school */}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Start and End Date Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`educations.${index}.startDate`} // Field name in form data
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value ? field.value.slice(0, 10) : ""} // Handle empty string properly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`educations.${index}.endDate`} // Field name in form data
          render={({ field }) => (
            <FormItem>
              <FormLabel>End date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value ? field.value.slice(0, 10) : ""} // Handle empty string properly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Remove Button */}
      <Button variant="destructive" type="button" onClick={() => remove(index)} className="flex items-center gap-2">
        <Trash2 className="h-4 w-4" />
        Remove
      </Button>
    </div>
  );
}
