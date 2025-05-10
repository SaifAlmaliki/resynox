import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic } from "lucide-react";
import InterviewCard from "@/components/interview/InterviewCard";
import { getCurrentUser, getInterviewsByUserId } from "@/lib/actions/interview.actions";
import { Interview } from "@/types/interview";

const InterviewPage = async () => {
  const user = await getCurrentUser();
  const userInterviews = user ? await getInterviewsByUserId(user.id) : [];

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      {/* Hero section with interview starter */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Get Interview-Ready with AI-Powered Practice & Feedback</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Practice real interview questions & get instant feedback
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/interview/generate">
                Start an Interview <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <Image 
              src="/robot.png" 
              alt="AI Interview Robot" 
              width={300} 
              height={300}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Your Interviews section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Your Interviews</h2>
        
        {userInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInterviews.map((interview: Interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={interview.userId}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))}
            
            {/* Add Interview Card */}
            <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-8 h-full">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">New Interview</h3>
              <p className="text-center text-muted-foreground mb-4">
                Create a new mock interview to practice your skills
              </p>
              <Button asChild variant="outline">
                <Link href="/interview/generate">Start New Interview</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">No interviews yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created any interviews yet. Start your first mock interview to practice your skills.
            </p>
            <Button asChild>
              <Link href="/interview/generate">Start Your First Interview</Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* How it works section */}
      <div className="bg-card rounded-lg p-6 border shadow-sm">
        <h3 className="text-xl font-semibold mb-4">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">1. Start the interview</h4>
            <p className="text-sm text-muted-foreground">Click the Start Interview button and allow microphone access when prompted.</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">2. Answer questions</h4>
            <p className="text-sm text-muted-foreground">The AI interviewer will ask you questions. Respond naturally as you would in a real interview.</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">3. Get feedback</h4>
            <p className="text-sm text-muted-foreground">After the interview, you'll receive detailed feedback on your performance and areas for improvement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
