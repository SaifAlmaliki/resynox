import { notFound } from "next/navigation";
import { getCurrentUser, getInterviewById } from "@/lib/actions/interview.actions";
import { Agent } from "@/components/interview/Agent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [user, interview] = await Promise.all([
    getCurrentUser(),
    getInterviewById(resolvedParams.id),
  ]);

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
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800 mb-1">Interview Too Short</h3>
                <p className="text-orange-700 text-sm">
                  Your interview lasted only {duration} minute{duration !== '1' ? 's' : ''}. 
                  To generate meaningful feedback, interviews must be at least 5 minutes long. 
                  Please conduct a longer interview session to receive detailed feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header section with interview details */}
      <div className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-3">{interview.role} Interview</h1>
            <p className="text-muted-foreground mb-4">
              Personalized interview based on your resume and skills
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="capitalize px-3 py-1 text-sm">
                <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                {interview.level}
              </Badge>
              <Badge variant="outline" className="capitalize px-3 py-1 text-sm">
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                {interview.type}
              </Badge>
              <Badge variant="outline" className="capitalize px-3 py-1 text-sm">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                {formattedDate}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {interview.techstack.map((tech: string) => (
                <Badge key={tech} variant="secondary" className="capitalize px-3 py-1 text-sm">
                  <Code className="h-3.5 w-3.5 mr-1.5" />
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
              <Mic className="h-16 w-16 text-primary/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Questions section */}
      <Card className="mb-8 border shadow-sm">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-xl">
            <Code className="h-5 w-5 mr-2" />
            Interview Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-4">
            {interview.questions.map((question: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium mr-3">{index + 1}</span>
                <span className="text-base">{question}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewDetailPage;
