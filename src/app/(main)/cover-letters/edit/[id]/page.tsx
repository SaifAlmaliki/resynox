'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

interface CoverLetter {
  id: string;
  title: string | null;
  jobDescription: string;
  content: string;
  createdAt: string;
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
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
    if (!coverLetter) return;

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
        toast({
          title: "Success",
          description: "Cover letter updated successfully"
        });
        setCoverLetter({
          ...coverLetter,
          title: title.trim() || null,
          content: content.trim(),
        });
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

  const handleDelete = async () => {
    if (!coverLetter) return;
    
    if (!confirm('Are you sure you want to delete this cover letter? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/cover-letters/${coverLetter.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Cover letter deleted successfully"
        });
        router.push('/cover-letters');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete cover letter"
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading cover letter...</p>
        </div>
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className="container mx-auto py-8">
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
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/cover-letters">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cover Letters
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Cover Letter</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {getCreatorInfo()} • Created {formatDate(coverLetter.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:bg-red-50"
            >
              {deleting ? (
                <div className="animate-spin h-4 w-4 border-b-2 border-current rounded-full mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !content.trim()}
            >
              {saving ? (
                <div className="animate-spin h-4 w-4 border-b-2 border-current rounded-full mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cover Letter Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your cover letter"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Cover Letter Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[500px]"
                  placeholder="Edit your cover letter content here..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Job Description Reference</h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Original job description this cover letter was created for:
              </p>
              <div className="max-h-[400px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {coverLetter.jobDescription}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 