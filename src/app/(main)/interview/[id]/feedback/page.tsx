import { notFound } from "next/navigation";
import { getCurrentUser, getInterviewById, getFeedbackByInterviewId } from "@/lib/actions/interview.actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// In Next.js 15, params is a Promise
async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params Promise to get the actual values
  const resolvedParams = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    notFound();
  }

  const [interview, feedback] = await Promise.all([
    getInterviewById(resolvedParams.id),
    getFeedbackByInterviewId({
      interviewId: resolvedParams.id,
      userId: user.id,
    }),
  ]);

  if (!interview || !feedback) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="capitalize">
            {interview.role}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {interview.level}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {interview.type}
          </Badge>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{feedback.totalScore}/100</div>
            <Progress value={feedback.totalScore} className="flex-1 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Category Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.isArray(feedback.categoryScores) && feedback.categoryScores.map((category, index) => {
            // Define a type for the expected category structure
            interface CategoryItem {
              name?: string;
              score?: number;
              comment?: string;
              [key: string]: string | number | boolean | object | undefined;
            }
            // Safely access properties with type checking
            const categoryObj = category as CategoryItem;
            const name = typeof categoryObj?.name === 'string' ? categoryObj.name : 'Unknown';
            const score = typeof categoryObj?.score === 'number' ? categoryObj.score : 0;
            const comment = typeof categoryObj?.comment === 'string' ? categoryObj.comment : '';
            
            return (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <div className="font-medium">{name}</div>
                  <div className="text-sm">{score}/100</div>
                </div>
                <Progress value={score} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">{comment}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {feedback.strengths.map((strength: string, index: number) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Areas for Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {feedback.areasForImprovement.map((area: string, index: number) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Final Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Final Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{feedback.finalAssessment}</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Export the component as default
export default FeedbackPage;
