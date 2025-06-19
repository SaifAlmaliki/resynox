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
import { FileText, MoreVertical, Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

interface CoverLetterItemProps {
  coverLetter: {
    id: string;
    title: string | null;
    jobDescription: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function CoverLetterItem({ coverLetter }: CoverLetterItemProps) {
  const wasUpdated = coverLetter.updatedAt.getTime() !== coverLetter.createdAt.getTime();

  const getTitle = () => {
    if (coverLetter.title) return coverLetter.title;
    
    // Extract job title from job description if no title
    const firstLine = coverLetter.jobDescription.split('\n')[0];
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + '...';
    }
    return firstLine || 'Untitled Cover Letter';
  };

  const getDescription = () => {
    // Get first few words of job description as description
    const words = coverLetter.jobDescription.split(' ').slice(0, 12);
    return words.length >= 12 ? words.join(' ') + '...' : words.join(' ');
  };

  const handleDownload = () => {
    // Create a downloadable text file
    const element = document.createElement('a');
    const file = new Blob([coverLetter.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${getTitle().replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="group relative rounded-lg border border-transparent bg-secondary p-3 transition-colors hover:border-border">
      <div className="space-y-3">
        <Link
          href={`/cover-letters/edit/${coverLetter.id}`}
          className="inline-block w-full text-center"
        >
          <p className="line-clamp-1 font-semibold">{getTitle()}</p>
          <p className="line-clamp-2 text-sm">{getDescription()}</p>
          <p className="text-xs text-muted-foreground">
            {wasUpdated ? "Updated" : "Created"} on{" "}
            {formatDate(coverLetter.updatedAt, "MMM d, yyyy h:mm a")}
          </p>
        </Link>

        <Link
          href={`/cover-letters/edit/${coverLetter.id}`}
          className="relative inline-block w-full"
        >
          <div className="flex h-32 items-center justify-center rounded border bg-white shadow-sm transition-shadow group-hover:shadow-lg">
            <div className="text-center">
              <FileText className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <p className="text-xs text-muted-foreground">Cover Letter</p>
            </div>
          </div>
        </Link>
      </div>

      <MoreMenu 
        coverLetterId={coverLetter.id} 
        onDownloadClick={handleDownload}
        title={getTitle()}
      />
    </div>
  );
}

interface MoreMenuProps {
  coverLetterId: string;
  onDownloadClick: () => void;
  title: string;
}

function MoreMenu({ coverLetterId, onDownloadClick, title }: MoreMenuProps) {
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
            onClick={onDownloadClick}
          >
            <Download className="size-4" />
            Download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        coverLetterId={coverLetterId}
        title={title}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      />
    </>
  );
}

interface DeleteConfirmationDialogProps {
  coverLetterId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteConfirmationDialog({ 
  coverLetterId, 
  title, 
  open, 
  onOpenChange 
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

        toast({
          title: "Success",
          description: "Cover letter deleted successfully"
        });

        onOpenChange(false);
        
        // Refresh the page to update the list
        window.location.reload();
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
            This will permanently delete "{title}". This action cannot be undone.
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