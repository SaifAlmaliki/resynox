'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, WandSparklesIcon } from "lucide-react";
import Link from "next/link";


interface CoverLetter {
  id: string;
  title: string | null;
  jobDescription: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  resume?: {
    id: string;
    title: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  parsedMetadata?: {
    basicInfo?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    createdWithoutResume?: boolean;
  };
}

export default function EditCoverLetterPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  // Loading and data states
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [title, setTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [content, setContent] = useState("");
  
  // Action states
  const [saving, setSaving] = useState(false);
  const [enhancingParagraph, setEnhancingParagraph] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchCoverLetter(params.id as string);
    }
  }, [params.id]);

  const fetchCoverLetter = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cover-letters/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCoverLetter(data);
        setTitle(data.title || "");
        setJobDescription(data.jobDescription || "");
        setContent(data.content || "");
      } else if (response.status === 404) {
        toast({
          variant: "destructive",
          title: "Not Found",
          description: "Cover letter not found"
        });
        router.push('/cover-letters');
      } else {
        throw new Error('Failed to fetch cover letter');
      }
    } catch (error) {
      console.error('Error fetching cover letter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cover letter"
      });
      router.push('/cover-letters');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!coverLetter || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Content",
        description: "Cover letter content cannot be empty."
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/cover-letters/${coverLetter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setCoverLetter({
          ...coverLetter,
          title: updatedData.title,
          content: updatedData.content,
          updatedAt: updatedData.updatedAt,
        });
        toast({
          title: "Success",
          description: "Cover letter updated successfully"
        });
        
        // Redirect to cover letters page after successful save
        setTimeout(() => {
          router.push('/cover-letters');
        }, 1000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving cover letter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save cover letter"
      });
    } finally {
      setSaving(false);
    }
  };



  const enhanceParagraph = async (paragraphIndex: number) => {
    if (!content?.trim()) return;
    
    setEnhancingParagraph(paragraphIndex);
    try {
      const response = await fetch("/api/cover-letters/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paragraph: content.trim(),
          jobDescription: jobDescription.trim(),
          context: coverLetter?.resume ? 'resume-based' : 'standalone'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to enhance cover letter";
        
        // Handle specific error cases
        if (response.status === 402) {
          // Insufficient points
          toast({
            variant: "destructive",
            title: "Insufficient Points",
            description: errorMessage
          });
        } else {
          throw new Error(errorMessage);
        }
        return;
      }
      
      const data = await response.json();
      setContent(data.enhancedParagraph);
      
      toast({
        title: "Enhanced!",
        description: "Your cover letter has been enhanced with AI suggestions."
      });
      
      // Notify navbar to refresh points after successful enhancement
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('points:update'));
      }
    } catch (error) {
      console.error("Error enhancing cover letter:", error);
      toast({
        variant: "destructive",
        title: "Enhancement Failed",
        description: "Failed to enhance cover letter. Please try again."
      });
    } finally {
      setEnhancingParagraph(null);
    }
  };

  const renderCoverLetterWithEnhancement = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] w-full"
            placeholder="Your cover letter content will appear here..."
          />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Button
            onClick={() => enhanceParagraph(0)}
            disabled={enhancingParagraph === 0 || !content.trim()}
            variant="outline"
            className="min-w-[150px]"
          >
            {enhancingParagraph === 0 ? (
              "Enhancing..."
            ) : (
              <>
                <WandSparklesIcon className="size-4 mr-2" />
                Enhance with AI
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Cost: 5 points
          </p>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} at ${hours}:${minutes}`;
  };

  const getCreatorInfo = () => {
    if (coverLetter?.resume) {
      return `Based on: ${coverLetter.resume.title || 'Untitled Resume'}`;
    }
    
    if (coverLetter?.parsedMetadata?.basicInfo) {
      const { firstName, lastName } = coverLetter.parsedMetadata.basicInfo;
      return `Created by: ${firstName} ${lastName}`;
    }
    
    return 'Standalone cover letter';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading cover letter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Cover letter not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The cover letter you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/cover-letters">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cover Letters
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" asChild>
              <Link href="/cover-letters">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Edit Cover Letter</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {getCreatorInfo()} • Created {formatDate(coverLetter.createdAt)}
            {coverLetter.updatedAt !== coverLetter.createdAt && 
              ` • Updated ${formatDate(coverLetter.updatedAt)}`
            }
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Cover Letter Title */}
            <div>
              <Label htmlFor="title" className="text-base font-medium">Cover Letter Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineer at Google, Marketing Manager Position, etc."
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Give your cover letter a descriptive title to help you distinguish it from others
              </p>
            </div>

            {/* Job Description */}
            <div>
              <Label htmlFor="jobDescription" className="text-base font-medium">Job Description</Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="min-h-[200px] mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Update the job description to regenerate your cover letter for a different position
              </p>
            </div>

            {/* Cover Letter Content */}
            <div>
              <Label className="text-base font-medium">Your Cover Letter</Label>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Review and edit your cover letter. Use the "Regenerate" button to create new content based on the job description, 
                or "Enhance" to improve the current content with AI.
              </p>
              
                             {renderCoverLetterWithEnhancement()}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="min-w-[120px]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 