import { notFound } from "next/navigation";
import { getCurrentUser, getInterviewById } from "@/lib/actions/interview.actions";
import { Agent } from "@/components/interview/Agent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Briefcase, Code, Layers, Mic } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// In Next.js 15, params is a Promise
async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params Promise to get the actual values
  const resolvedParams = await params;
  const [user, interview] = await Promise.all([
    getCurrentUser(),
    getInterviewById(resolvedParams.id),
  ]);

  if (!interview) {
    notFound();
  }

  // Format the date
  const formattedDate = interview.createdAt ? formatDistanceToNow(new Date(interview.createdAt), { addSuffix: true }) : "";

  return (
    <div className="container py-8 max-w-7xl mx-auto">
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

      {/* Agent component */}
      <Card className="border shadow-sm mb-8">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-xl">
            <Mic className="h-5 w-5 mr-2" />
            Start Your Interview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Agent
            userName={user?.name || 'User'}
            userId={user?.id}
            interviewId={interview.id}
            type="interview"
            questions={interview.questions}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewDetailPage;
