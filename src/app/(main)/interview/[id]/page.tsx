import { notFound } from "next/navigation";
import { getInterviewById } from "@/lib/actions/interview.actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Briefcase, Code, Layers, Mic, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

// In Next.js 15, params is a Promise
async function InterviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the params Promise to get the actual values
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const interview = await getInterviewById(resolvedParams.id);

  if (!interview) {
    notFound();
  }

  // Check for error messages from redirects
  const error = resolvedSearchParams.error;
  const duration = resolvedSearchParams.duration;

  // Format the date
  const formattedDate = interview.createdAt ? format(new Date(interview.createdAt), 'MMMM d, yyyy') : "";

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      {/* Error Alert for insufficient interview duration */}
      {error === 'interview_too_short' && (
        <Card className="mb-8 border-orange-200 bg-orange-50/80 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-700" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800 mb-1">Interview Too Short</h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  Your interview lasted only {duration} minute{duration !== '1' ? 's' : ''}. To generate meaningful feedback, interviews must be at least 5 minutes long. Please conduct a longer interview session to receive detailed feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header section with interview details */}
      <div className="mb-10 rounded-2xl p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">{interview.role} Interview</h1>
            <p className="text-muted-foreground mb-5">
              Personalized interview based on your resume and skills
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="capitalize px-3 py-1 text-sm bg-background/60">
                <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                {interview.level}
              </Badge>
              <Badge variant="outline" className="capitalize px-3 py-1 text-sm bg-background/60">
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                {interview.type}
              </Badge>
              <Badge variant="outline" className="capitalize px-3 py-1 text-sm bg-background/60">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                {formattedDate}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {interview.techstack.map((tech: string) => (
                <Badge key={tech} variant="secondary" className="capitalize px-3 py-1 text-sm bg-primary/10 text-primary">
                  <Code className="h-3.5 w-3.5 mr-1.5" />
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 -m-6 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent blur-2xl rounded-full" />
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center border border-primary/20 bg-background/70 backdrop-blur">
                <Mic className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note: Removed the "Interview Questions" section because ElevenLabs drives the conversation dynamically. */}
    </div>
  );
};

export default InterviewDetailPage;
