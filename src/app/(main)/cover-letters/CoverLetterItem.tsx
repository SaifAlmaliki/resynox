"use client";

import LoadingButton from "@/components/LoadingButton";
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
import { formatDate } from "date-fns";
import { FileText, MoreVertical, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

interface CoverLetter {
  id: string;
  title: string | null;
  content: string;
  jobDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CoverLetterItemProps {
  coverLetter: CoverLetter;
  onDelete: (id: string) => void;
}

export default function CoverLetterItem({ coverLetter, onDelete }: CoverLetterItemProps) {
  const wasUpdated = coverLetter.updatedAt !== coverLetter.createdAt;

  const handlePrint = () => {
    window.open(`/cover-letters/${coverLetter.id}/print`, '_blank');
  };

  return (
    <div className="group relative rounded-lg border border-transparent bg-secondary p-3 transition-colors hover:border-border">
      <div className="space-y-3">
        <Link
          href={`/cover-letters/${coverLetter.id}/edit`}
          className="inline-block w-full text-center"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="line-clamp-1 font-semibold">
                {coverLetter.title || "Untitled Cover Letter"}
              </p>
              <p className="text-xs text-muted-foreground">
                {wasUpdated ? "Updated" : "Created"} on{" "}
                {formatDate(coverLetter.updatedAt, "MMM d, yyyy h:mm a")}
              </p>
            </div>
          </div>
          
          {/* Preview of content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-left">
            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {coverLetter.content.length > 150 
                ? `${coverLetter.content.substring(0, 150)}...`
                : coverLetter.content
              }
            </div>
          </div>
        </Link>
      </div>

      <MoreMenu 
        coverLetterId={coverLetter.id} 
        onPrintClick={handlePrint}
        onDeleteClick={() => onDelete(coverLetter.id)}
      />
    </div>
  );
}

interface MoreMenuProps {
  coverLetterId: string;
  onPrintClick: () => void;
  onDeleteClick: () => void;
}

function MoreMenu({ coverLetterId, onPrintClick, onDeleteClick }: MoreMenuProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-0.5 md:opacity-0 opacity-100 transition-opacity group-hover:opacity-100 p-2 md:p-1"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={onPrintClick}
          >
            <Printer className="size-4" />
            Download / Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        coverLetterId={coverLetterId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        onConfirm={onDeleteClick}
      />
    </>
  );
}

interface DeleteConfirmationDialogProps {
  coverLetterId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function DeleteConfirmationDialog({ 
  coverLetterId, 
  open, 
  onOpenChange, 
  onConfirm 
}: DeleteConfirmationDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/cover-letters/${coverLetterId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete cover letter');
        }

        onConfirm();
        onOpenChange(false);
        
        toast({
          title: "Success",
          description: "Cover letter deleted successfully.",
        });
      } catch (error) {
        console.error(error);
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
          <DialogTitle>Delete cover letter?</DialogTitle>
          <DialogDescription>
            This will permanently delete this cover letter. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton variant="destructive" onClick={handleDelete} loading={isPending}>
            Delete
          </LoadingButton>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 