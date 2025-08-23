"use client";

import LoadingButton from "@/components/LoadingButton";
import CoverLetterPreview from "@/components/CoverLetterPreview";
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
import { FileText, MoreVertical, Download, Trash2, Printer } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface CoverLetterItemProps {
  coverLetter: {
    id: string;
    title: string | null;
    jobDescription: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    resume?: {
      id: string;
      title: string | null;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      city: string | null;
      country: string | null;
    } | null;
    parsedMetadata?: {
      basicInfo?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        city?: string;
        country?: string;
      };
    };
  };
}

export default function CoverLetterItem({ coverLetter }: CoverLetterItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
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

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: getTitle(),
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body {
          font-size: 12pt;
          line-height: 1.4;
          color: #000;
          background: #fff;
        }
      }
    `,
  });



  const handleDownloadPDF = () => {
    // Notify user to disable browser headers/footers for a clean PDF
    toast({
      description:
        "Tip: In the print dialog, uncheck 'Headers and footers' to remove the date, title, and URL from the PDF.",
    });
    // Open browser's print dialog; user can choose 'Save as PDF'
    reactToPrintFn();
  };

  const handleDirectPrint = () => {
    // Same function; also remind about headers/footers
    toast({
      description:
        "Tip: In the print dialog, uncheck 'Headers and footers' for a professional print.",
    });
    reactToPrintFn();
  };

  const handleDownloadTXT = () => {
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
          <p className="text-xs text-muted-foreground">
            {wasUpdated ? "Updated" : "Created"} on{" "}
            {formatDate(coverLetter.updatedAt, "MMM d, yyyy h:mm a")}
          </p>
        </Link>

        <div className="relative inline-block w-full">
          <CoverLetterPreview
            coverLetter={coverLetter}
            contentRef={contentRef}
            className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>

      <MoreMenu 
        coverLetterId={coverLetter.id} 
        onDownloadPDFClick={handleDownloadPDF}
        onPrintClick={handleDirectPrint}
        onDownloadTXTClick={handleDownloadTXT}
        title={getTitle()}
      />
    </div>
  );
}

interface MoreMenuProps {
  coverLetterId: string;
  onDownloadPDFClick: () => void;
  onPrintClick: () => void;
  onDownloadTXTClick: () => void;
  title: string;
}

function MoreMenu({ coverLetterId, onDownloadPDFClick, onPrintClick, onDownloadTXTClick, title }: MoreMenuProps) {
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
            onClick={onDownloadPDFClick}
          >
            <Download className="size-4" />
            Download PDF
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={onPrintClick}
          >
            <Printer className="size-4" />
            Print Cover Letter
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={onDownloadTXTClick}
          >
            <FileText className="size-4" />
            Download TXT
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="size-4" />
            Delete
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
            This will permanently delete &quot;{title}&quot;. This action cannot be undone.
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