// Import necessary UI components and libraries
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { workExperienceSchema, WorkExperienceValues } from "@/lib/validation";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripHorizontal } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import GenerateWorkExperienceButton from "./GenerateWorkExperienceButton";

// Main component for Work Experience Form
export default function WorkExperienceForm({resumeData, setResumeData }: EditorFormProps) {
  // Initialize the form using react-hook-form and set default values
  const form = useForm<WorkExperienceValues>({
    resolver: zodResolver(workExperienceSchema), // Use Zod schema for validation
    defaultValues: {
      workExperiences: resumeData.workExperiences || [], // Populate with existing data or empty array
    },
  });

  // Synchronize the form values with the parent state (`resumeData`)
  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger(); // Validate form fields
      if (!isValid) return; // Skip updating if the form is invalid
      setResumeData({
        ...resumeData, // Retain other resume data
        workExperiences:
          values.workExperiences?.filter((exp) => exp !== undefined) || [], // Ensure valid work experiences
      });
    });
    return unsubscribe; // Clean up listener on component unmount
  }, [form, resumeData, setResumeData]);

  // Manage dynamic fields using `useFieldArray`
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,    // Hook form control object
    name: "workExperiences",  // Path to dynamic fields in the form state
  });

  // Set up drag-and-drop sensors for reordering work experiences
  const sensors = useSensors(
    useSensor(PointerSensor), // Detect pointer-based drag actions
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates, // Enable keyboard reordering
    }),
  );

  // Handle the end of a drag-and-drop action
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id); // Find source index
      const newIndex = fields.findIndex((field) => field.id === over.id); // Find destination index
      move(oldIndex, newIndex); // Update field order in form state
      return arrayMove(fields, oldIndex, newIndex); // Update local array
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header for the form */}
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Work experience</h2>
        <p className="text-sm text-muted-foreground">
          Add as many work experiences as you like.
        </p>
      </div>

      {/* Render the form */}
      <Form {...form}>
        <form className="space-y-3">
          {/* Drag-and-drop context for sortable work experiences */}
          <DndContext
            sensors={sensors} // Drag sensors
            collisionDetection={closestCenter} // Detect closest drop zone
            onDragEnd={handleDragEnd} // Handle reordering
            modifiers={[restrictToVerticalAxis]} // Restrict drag to vertical axis
          >
            <SortableContext
              items={fields} // List of sortable items
              strategy={verticalListSortingStrategy} // Use vertical ordering
            >
              {/* Render individual work experience items */}
              {fields.map((field, index) => (
                <WorkExperienceItem
                  id={field.id}   // Unique ID for drag-and-drop
                  key={field.id}  // React key
                  index={index}   // Item index
                  form={form}     // Form control
                  remove={remove} // Remove handler
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Button to add a new work experience */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() =>
                append({
                  position: "", // Default empty values
                  company: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
            >
              Add work experience
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Component for rendering individual work experience items
interface WorkExperienceItemProps {
  id: string; // Unique ID for the item
  form: UseFormReturn<WorkExperienceValues>; // Form control object
  index: number; // Index of the item in the array
  remove: (index: number) => void; // Function to remove the item
}

function WorkExperienceItem({id, form, index, remove}: WorkExperienceItemProps) {
  // Manage drag-and-drop sorting for the item
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      className={cn(
        "space-y-3 rounded-md border bg-background p-3",
        isDragging && "relative z-50 cursor-grab shadow-xl", // Add styles for dragging state
      )}
      ref={setNodeRef} // Set ref for drag-and-drop
      style={{
        transform: CSS.Transform.toString(transform), // Apply transform for dragging
        transition, // Apply smooth transition
      }}
    >
      {/* Header with drag handle and item label */}
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Work experience {index + 1}</span>
        <GripHorizontal className="size-5 cursor-grab text-muted-foreground focus:outline-none"
          {...attributes} // Drag handle attributes
          {...listeners} // Drag handle event listeners
        />
      </div>

      {/* Button to generate work experience data */}
      <div className="flex justify-center">
        <GenerateWorkExperienceButton
          onWorkExperienceGenerated={(exp) =>
            form.setValue(`workExperiences.${index}`, exp) // Update form value with generated data
          }
        />
      </div>

      {/* Input field for job title */}
      <FormField
        control={form.control}
        name={`workExperiences.${index}.position`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job title</FormLabel>
            <FormControl>
              <Input {...field} autoFocus />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Input field for company name */}
      <FormField
        control={form.control}
        name={`workExperiences.${index}.company`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Input fields for start and end dates */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`workExperiences.${index}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl>
                <Input {...field} type="date" value={field.value?.slice(0, 10)} // Format date value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`workExperiences.${index}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End date</FormLabel>
              <FormControl>
                <Input {...field} type="date" value={field.value?.slice(0, 10)} // Format date value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormDescription>
        Leave <span className="font-semibold">end date</span> empty if you are
        currently working here.
      </FormDescription>

      {/* Input field for job description */}
      <FormField
        control={form.control}
        name={`workExperiences.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Button to remove the work experience item */}
      <Button variant="destructive" type="button" onClick={() => remove(index)}>
        Remove
      </Button>
    </div>
  );
}
