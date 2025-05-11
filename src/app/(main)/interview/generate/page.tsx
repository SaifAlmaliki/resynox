import Agent from "@/components/interview/Agent";
import { getCurrentUser } from "@/lib/actions/interview.actions";

const InterviewGeneratePage = async () => {
  const user = await getCurrentUser();

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Personalized Interview</h1>
      
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <p className="text-muted-foreground">
          Our AI interviewer will ask you personalized questions based on your resume data.
          The questions are tailored to your skills, experience level, and job role.
          Speak naturally and receive real-time feedback on your responses.
        </p>
      </div>

      <Agent
        userName={user?.name || 'User'}
        userId={user?.id}
        type="generate"
      />
      
      <div className="mt-8 bg-card rounded-lg p-6 border shadow-sm">
        <h3 className="text-xl font-semibold mb-4">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">1. Start the interview</h4>
            <p className="text-sm text-muted-foreground">Click the Start Interview button and allow microphone access when prompted. Questions are automatically personalized based on your resume.</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">2. Answer questions</h4>
            <p className="text-sm text-muted-foreground">The AI interviewer will ask you tailored questions about your skills and experience. Respond naturally as you would in a real interview.</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">3. Get feedback</h4>
            <p className="text-sm text-muted-foreground">After the interview, you'll receive detailed feedback on your performance and areas for improvement to help you prepare for real interviews.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewGeneratePage;
