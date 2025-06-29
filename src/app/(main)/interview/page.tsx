import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Lock, Sparkles, Zap, Target } from "lucide-react";
import InterviewCard from "@/components/interview/InterviewCard";
import { getCurrentUser, getInterviewsByUserId } from "@/lib/actions/interview.actions";
import { Interview } from "@/types/interview";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canUseVoiceAgent, canUseVoiceInterview } from "@/lib/permissions";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InterviewPage = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold">Please sign in to access interviews</h1>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  const hasVoiceAgentAccess = canUseVoiceAgent(subscriptionLevel);
  const voiceInterviewStatus = await canUseVoiceInterview(userId);
  
  const user = await getCurrentUser();
  const userInterviews = user ? await getInterviewsByUserId(user.id) : [];

  if (!hasVoiceAgentAccess) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        <div className="animate-fade-in-up">
          <Card className="border-2 border-orange-200 bg-orange-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-orange-800">Voice Agent Interviews - Pro Plus Feature</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-orange-700 text-lg">
                Advanced AI voice interviewer with feedback is available exclusively for Pro Plus subscribers.
              </p>
              <div className="bg-white/80 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-orange-800">Pro Plus Features Include:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• 5 voice agent interviews per month</li>
                  <li>• AI interview feedback & analysis</li>
                  <li>• Plus all Pro features</li>
                </ul>
              </div>
              <div className="pt-4 flex gap-3 justify-center">
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/billing">
                    Upgrade to Pro Plus <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline">
                  <Link href="/pricing">View All Plans</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      {/* Voice Interview Usage Status for Pro Plus users */}
      {hasVoiceAgentAccess && (
        <div className="animate-fade-in-up">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Voice Interview Usage</h3>
                    <p className="text-green-700">
                      {voiceInterviewStatus.canUse 
                        ? `${voiceInterviewStatus.used} of ${voiceInterviewStatus.limit} interviews used this month`
                        : `Monthly limit reached (${voiceInterviewStatus.used}/${voiceInterviewStatus.limit})`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-800">
                    {voiceInterviewStatus.limit - voiceInterviewStatus.used}
                  </div>
                  <div className="text-sm text-green-600">remaining</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-green-200/50 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(voiceInterviewStatus.used / voiceInterviewStatus.limit) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Page Header */}
      <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-3xl font-bold">AI Voice Interviews</h1>
        <p className="text-gray-600">Practice with our advanced AI interviewer and get comprehensive feedback</p>
      </div>

      {/* Your Interviews Section */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-semibold">Your Interviews</h2>
        
        {userInterviews.length > 0 ? (
          <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4 stagger-container">
            {userInterviews.map((interview: Interview, index) => (
              <div key={interview.id} className="stagger-item" style={{ '--item-index': index } as any}>
                <InterviewCard
                  interviewId={interview.id}
                  userId={interview.userId}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              </div>
            ))}
            
            {/* Add Interview Card */}
            <div className="stagger-item" style={{ '--item-index': userInterviews.length } as any}>
              <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-200 h-full">
                <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[200px] text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Mic className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">New Interview</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create a new mock interview to practice your skills
                  </p>
                  {voiceInterviewStatus.canUse ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/interview/generate">Start New Interview</Link>
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-red-600 mb-2">Monthly limit reached</p>
                      <Button disabled variant="outline" size="sm">
                        Start New Interview
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <Mic className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold">No interviews yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Start your first AI-powered mock interview to practice and improve your skills.
            </p>
            {voiceInterviewStatus.canUse ? (
              <Button asChild>
                <Link href="/interview/generate">Create Your First Interview</Link>
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">Monthly limit reached</p>
                <Button disabled>Create Your First Interview</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* How it Works Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">How Voice Interviews Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: 1, title: "Setup Interview", desc: "Choose your role, experience level, and tech stack", icon: Target },
                { step: 2, title: "Voice Conversation", desc: "Engage in realistic conversation with AI interviewer", icon: Mic },
                { step: 3, title: "Get Feedback", desc: "Receive detailed analysis and improvement suggestions", icon: Sparkles }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-4 text-lg font-semibold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700">
                <Mic className="h-4 w-4 mr-2" />
                <p className="text-sm">Click the Start Interview button and allow microphone access when prompted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default InterviewPage;
