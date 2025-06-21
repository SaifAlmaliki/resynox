"use client";

import LoadingButton from "@/components/LoadingButton";
import ResumePreview from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import { ClickableCard } from "@/components/ui/nav-link";
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
import { MoreVertical, Printer, Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useReactToPrint } from "react-to-print";
import { deleteResume } from "./actions";

interface ResumeItemProps {
  resume: ResumeServerData;
}

export default function ResumeItem({ resume }: ResumeItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resume.title || "Resume",
    pageStyle: `
      @page {
        size: A4;
        margin: 0.75in;
      }
      @media print {
        body {
          font-size: 12pt;
          line-height: 1.4;
          color: #000;
          background: white;
        }
      }
    `,
  });

  const handleDownloadPDF = () => {
    // Enhanced print trigger that opens browser's print dialog
    // User can then choose "Save as PDF" or print directly
    reactToPrintFn();
  };

  const handleDirectPrint = () => {
    // Same function but with clearer intent for direct printing
    reactToPrintFn();
  };

  const wasUpdated = resume.updatedAt !== resume.createdAt;

  return (
    <ClickableCard 
      href={`/editor?resumeId=${resume.id}`}
      className="group relative rounded-lg border border-transparent bg-secondary p-3 transition-colors hover:border-border"
    >
      <div className="space-y-3">
        <div className="inline-block w-full text-center">
          <p className="line-clamp-1 font-semibold">{resume.title || "No title"}</p>
          {resume.description && (
            <p className="line-clamp-2 text-sm">{resume.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {wasUpdated ? "Updated" : "Created"} on{" "}
            {formatDate(resume.updatedAt, "MMM d, yyyy h:mm a")}
          </p>
        </div>

        <div className="relative inline-block w-full">
          <ResumePreview
            resumeData={mapToResumeValues(resume)}
            contentRef={contentRef}
            className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>

      <MoreMenu 
        resumeId={resume.id} 
        onPrintClick={handleDirectPrint}
        onDownloadClick={handleDownloadPDF}
      />
    </ClickableCard>
  );
}

interface MoreMenuProps {
  resumeId: string;
  onPrintClick: () => void;
  onDownloadClick: () => void;
}

function MoreMenu({ resumeId, onPrintClick, onDownloadClick }: MoreMenuProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-0.5 md:opacity-0 opacity-100 transition-opacity group-hover:opacity-100 p-2 md:p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadClick();
            }}
          >
            <Download className="size-4" />
            Download PDF
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onPrintClick();
            }}
          >
            <Printer className="size-4" />
            Print Resume
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirmation(true);
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        resumeId={resumeId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      />
    </>
  );
}

interface DeleteConfirmationDialogProps {
  resumeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteConfirmationDialog({ resumeId, open, onOpenChange }: DeleteConfirmationDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      try {
        await deleteResume(resumeId);
        onOpenChange(false);
        toast({
          description: "Resume deleted successfully.",
        });
        router.push("/resumes");
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
          <DialogTitle>Delete resume?</DialogTitle>
          <DialogDescription>
            This will permanently delete this resume. This action cannot be
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
