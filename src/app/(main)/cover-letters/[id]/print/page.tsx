"use client";

import CoverLetterPreview from "@/components/CoverLetterPreview";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface CoverLetterData {
  id: string;
  title: string;
  content: string;
  jobDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function CoverLetterPrintPage() {
  const params = useParams();
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoverLetter();
  }, [params.id]);

  useEffect(() => {
    // Auto-print when data is loaded
    if (coverLetterData && !loading) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [coverLetterData, loading]);

  const fetchCoverLetter = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cover-letters/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cover letter');
      }
      
      const data = await response.json();
      setCoverLetterData({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
    } catch (error) {
      console.error('Error fetching cover letter:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading cover letter...</p>
        </div>
      </div>
    );
  }

  if (!coverLetterData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cover letter not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <CoverLetterPreview
          coverLetterData={coverLetterData}
          className="w-full max-w-none"
        />
      </div>
    </div>
  );
} 