'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CoverLettersPage() {
  const router = useRouter();

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for cover letter cards */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Software Engineer Position</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created 2 days ago
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 