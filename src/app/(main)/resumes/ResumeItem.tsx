"use client";

import LoadingButton from "@/components/LoadingButton";
import ResumePreview from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ResumeServerData } from "@/lib/types";
import { mapToResumeValues } from "@/lib/utils";
import { formatDate } from "date-fns";
import { MoreVertical, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useReactToPrint } from "react-to-print";
import { deleteResume } from "./actions";

// Interface for the main ResumeItem component props
interface ResumeItemProps {
  resume: ResumeServerData;
}

// Main component to display a single resume item with actions
export default function ResumeItem({ resume }: ResumeItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Functionality to print the resume
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resume.title || "Resume", // Default document title
  });

  // Check if the resume was updated after its creation
  const wasUpdated = resume.updatedAt !== resume.createdAt;

  return (
    <div className="group relative rounded-lg border border-transparent bg-secondary p-3 transition-colors hover:border-border">
      {/* Resume Details Section */}
      <div className="space-y-3">
        {/* Link to edit the resume */}
        <Link
          href={`/editor?resumeId=${resume.id}`}
          className="inline-block w-full text-center"
        >
          {/* Resume title */}
          <p className="line-clamp-1 font-semibold">{resume.title || "No title"}</p>
          {/* Optional description */}
          {resume.description && (
            <p className="line-clamp-2 text-sm">{resume.description}</p>
          )}
          {/* Last updated/created information */}
          <p className="text-xs text-muted-foreground">
            {wasUpdated ? "Updated" : "Created"} on{" "}
            {formatDate(resume.updatedAt, "MMM d, yyyy h:mm a")}
          </p>
        </Link>

        {/* Resume Preview */}
        <Link
          href={`/editor?resumeId=${resume.id}`}
          className="relative inline-block w-full"
        >
          <ResumePreview
            resumeData={mapToResumeValues(resume)}
            contentRef={contentRef}
            className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
          />
          {/* Gradient overlay for better visibility */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </Link>
      </div>

      {/* Action Menu */}
      <MoreMenu resumeId={resume.id} onPrintClick={reactToPrintFn} />
    </div>
  );
}

// Interface for MoreMenu props
interface MoreMenuProps {
  resumeId: string;         // Unique identifier for the resume
  onPrintClick: () => void; // Callback function for printing
}

// Component for the dropdown menu (delete, print)
function MoreMenu({ resumeId, onPrintClick }: MoreMenuProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <>
      {/* Dropdown Menu Trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        {/* Dropdown Menu Options */}
        <DropdownMenuContent>
          {/* Delete Option */}
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>

          {/* Print Option */}
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={onPrintClick}
          >
            <Printer className="size-4" />
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        resumeId={resumeId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      />
    </>
  );
}

// Interface for DeleteConfirmationDialog props
interface DeleteConfirmationDialogProps {
  resumeId: string; // Unique identifier for the resume
  open: boolean;  	// Whether the dialog is open
  onOpenChange: (open: boolean) => void; // Function to control dialog open state
}

// Dialog component for confirming deletion of a resume
function DeleteConfirmationDialog({ resumeId, open, onOpenChange }: DeleteConfirmationDialogProps) {
  const { toast } = useToast();                         // Hook to show toast notifications
  const [isPending, startTransition] = useTransition(); // Handles loading state

  // Function to handle the delete action
  async function handleDelete() {
    startTransition(async () => {
      try {
        await deleteResume(resumeId); // API call to delete the resume
        onOpenChange(false);          // Close the dialog
      } catch (error) {
        console.error(error);
        // Show error toast if deletion fails
        toast({
          variant: "destructive",
          description: "Something went wrong. Please try again.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete resume?</DialogTitle>
          <DialogDescription>
            This will permanently delete this resume. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* Delete button with loading state */}
          <LoadingButton variant="destructive" onClick={handleDelete} loading={isPending}>
            Delete
          </LoadingButton>
          {/* Cancel button */}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
