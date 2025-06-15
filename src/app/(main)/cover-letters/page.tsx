'use client';

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CoverLetterItem from "./CoverLetterItem";

interface CoverLetter {
  id: string;
  title: string | null;
  content: string;
  jobDescription: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoverLettersPage() {
  const router = useRouter();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cover-letters');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cover letters');
      }
      
      const data = await response.json();
      setCoverLetters(data);
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      setError('Failed to load cover letters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setCoverLetters(coverLetters.filter(cl => cl.id !== id));
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Cover Letters</h1>
          <p className="text-gray-600 dark:text-gray-400">Create professional cover letters tailored to your job applications</p>
        </div>
        <Button
          onClick={() => router.push('/cover-letters/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
        >
          <Plus className="h-4 w-4" />
          Create New Cover Letter
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading cover letters...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchCoverLetters} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : coverLetters.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No cover letters yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't created any cover letters yet. Start your first cover letter to stand out in your job applications.
          </p>
          <Button asChild>
            <Link href="/cover-letters/new">Create Your First Cover Letter</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coverLetters.map((coverLetter) => (
            <CoverLetterItem
              key={coverLetter.id}
              coverLetter={{
                ...coverLetter,
                createdAt: new Date(coverLetter.createdAt),
                updatedAt: new Date(coverLetter.updatedAt),
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
} 