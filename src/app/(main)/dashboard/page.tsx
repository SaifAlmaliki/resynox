import Link from "next/link";
import { FileText, Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/actions/interview.actions";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Choose what you'd like to do today
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resume Builder Card */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Resume Builder</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">
              Create a professional resume in minutes with our AI-powered tools. 
              Choose from modern templates and get personalized content suggestions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/resumes">
                Build Resume <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Mock Interview Card */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Mock Interviews</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">
              Practice with AI-powered interviews and get instant feedback.
              Improve your interview skills with realistic voice-based mock interviews.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/interview">
                Start Interview <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
