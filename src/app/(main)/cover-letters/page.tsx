'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Calendar, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface CoverLetter {
  id: string;
  title: string | null;
  jobDescription: string;
  content: string;
  createdAt: string;
  resume?: {
    id: string;
    title: string | null;
  } | null;
  parsedMetadata?: {
    basicInfo?: {
      firstName: string;
      lastName: string;
    };
    createdWithoutResume?: boolean;
  };
}

export default function CoverLettersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cover-letters');
      if (response.ok) {
        const data = await response.json();
        setCoverLetters(data);
      } else {
        console.error('Failed to fetch cover letters');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load cover letters"
        });
      }
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cover letters"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/cover-letters/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCoverLetters(coverLetters.filter(cl => cl.id !== id));
        toast({
          title: "Success",
          description: "Cover letter deleted successfully"
        });
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
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTitle = (coverLetter: CoverLetter) => {
    if (coverLetter.title) return coverLetter.title;
    
    // Extract job title from job description if no title
    const firstLine = coverLetter.jobDescription.split('\n')[0];
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + '...';
    }
    return firstLine || 'Untitled Cover Letter';
  };

  const getSubtitle = (coverLetter: CoverLetter) => {
    if (coverLetter.resume) {
      return `Based on: ${coverLetter.resume.title || 'Untitled Resume'}`;
    }
    
    if (coverLetter.parsedMetadata?.basicInfo) {
      const { firstName, lastName } = coverLetter.parsedMetadata.basicInfo;
      return `Created by: ${firstName} ${lastName}`;
    }
    
    return 'Standalone cover letter';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Cover Letters</h1>
          <Button
            onClick={() => router.push('/cover-letters/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Cover Letter
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading cover letters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cover Letters</h1>
        <Button
          onClick={() => router.push('/cover-letters/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Cover Letter
        </Button>
      </div>

      {coverLetters.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No cover letters yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first cover letter to get started
          </p>
          <Button
            onClick={() => router.push('/cover-letters/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Cover Letter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverLetters.map((coverLetter) => (
            <Card 
              key={coverLetter.id} 
              className="p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/cover-letters/edit/${coverLetter.id}`)}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(coverLetter.id)}
                    disabled={deletingId === coverLetter.id}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    {deletingId === coverLetter.id ? (
                      <div className="animate-spin h-4 w-4 border-b-2 border-current rounded-full" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div 
                className="cursor-pointer"
                onClick={() => router.push(`/cover-letters/edit/${coverLetter.id}`)}
              >
                <h3 className="font-semibold mb-1 line-clamp-2">
                  {getTitle(coverLetter)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {getSubtitle(coverLetter)}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  Created {formatDate(coverLetter.createdAt)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 