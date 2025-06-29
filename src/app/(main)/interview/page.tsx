import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Lock, Sparkles, Zap, Target, Check, Star } from "lucide-react";
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
          {/* Enhanced Pro Plus Upgrade Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"></div>
            
            {/* Content */}
            <div className="relative">
              <CardHeader className="text-center pb-8 pt-12">
                {/* Icon with premium badge */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="w-full h-full bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>

                {/* Title and badge */}
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
                    <Zap className="h-4 w-4 text-green-700 mr-2" />
                    <span className="text-green-800 font-semibold text-sm">Pro Plus Feature</span>
                  </div>
                  
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Voice Agent Interviews
                  </CardTitle>
                  
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Experience the future of interview preparation with our advanced AI voice interviewer and comprehensive feedback system.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pb-12">
                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  {[
                    { 
                      icon: Mic, 
                      title: "5 Voice Interviews", 
                      desc: "Monthly limit with renewal",
                      highlight: "Per Month"
                    },
                    { 
                      icon: Target, 
                      title: "AI Feedback", 
                      desc: "Detailed analysis & insights",
                      highlight: "Comprehensive"
                    },
                    { 
                      icon: Sparkles, 
                      title: "Plus All Pro", 
                      desc: "Complete feature access",
                      highlight: "Everything Included"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="group">
                      <Card className="h-full border border-green-200/50 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6 text-center">
                          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="h-7 w-7 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{feature.desc}</p>
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            <Check className="h-3 w-3 mr-1" />
                            {feature.highlight}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* What's Included Section */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-green-200/50">
                  <h4 className="font-semibold text-gray-900 mb-6 text-center text-lg">What's Included in Pro Plus</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "5 voice agent interviews per month",
                      "AI interview feedback & analysis",
                      "Unlimited resumes & cover letters",
                      "Advanced AI tools & customizations",
                      "Priority customer support",
                      "All future Pro Plus features"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                    <Link href="/billing" className="flex items-center">
                      Upgrade to Pro Plus
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Link href="/pricing">View All Plans</Link>
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      Cancel anytime
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      Instant access
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      30-day guarantee
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
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
