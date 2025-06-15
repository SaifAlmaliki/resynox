'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CoverLettersPage() {
  const router = useRouter();

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Placeholder for cover letter cards */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Software Engineer Position</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created 2 days ago
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
} 