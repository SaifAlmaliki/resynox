import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Mic, Star, TrendingUp, User } from "lucide-react";
import InterviewCard from "@/components/interview/InterviewCard";
import { getCurrentUser } from "@/lib/actions/interview.actions";
import { getInterviewsByUserId } from "@/lib/actions/interview.actions";
import prisma from "@/lib/prisma";

const ProfilePage = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  // Fetch user's data
  const interviews = await getInterviewsByUserId(user.id);
  
  // Fetch user's resumes
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' }
  });

  // Fetch user's feedback
  const feedbacks = await prisma.feedback.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { interview: true }
  });

  // Calculate statistics
  const totalInterviews = interviews.length;
  const totalResumes = resumes.length;
  const averageScore = feedbacks.length > 0 
    ? feedbacks.reduce((sum, feedback) => sum + feedback.totalScore, 0) / feedbacks.length 
    : 0;
  const latestScore = feedbacks.length > 0 ? feedbacks[0].totalScore : 0;
  
  // Get the most recent items
  const recentInterviews = interviews.slice(0, 3);
  const recentResumes = resumes.slice(0, 3);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Track your progress and manage your career development</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href="/interview/generate">
              New Interview <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Mic className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{totalInterviews}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{totalResumes}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{Math.round(averageScore)}/100</div>
            </div>
            <Progress value={averageScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{Math.round(latestScore)}/100</div>
            </div>
            <Progress value={latestScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="resumes">Resumes</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Interviews */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Interviews</CardTitle>
                <CardDescription>Your most recent mock interviews</CardDescription>
              </CardHeader>
              <CardContent>
                {recentInterviews.length > 0 ? (
                  <div className="space-y-4">
                    {recentInterviews.map((interview) => (
                      <div key={interview.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium">{interview.role}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/interview/${interview.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No interviews yet</p>
                )}
                
                {totalInterviews > 0 && (
                  <Button asChild variant="link" className="mt-4 px-0">
                    <Link href="/interview">View all interviews</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Resumes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Resumes</CardTitle>
                <CardDescription>Your most recent resumes</CardDescription>
              </CardHeader>
              <CardContent>
                {recentResumes.length > 0 ? (
                  <div className="space-y-4">
                    {recentResumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium">{resume.title || "Untitled Resume"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(resume.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/resumes/${resume.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No resumes yet</p>
                )}
                
                {totalResumes > 0 && (
                  <Button asChild variant="link" className="mt-4 px-0">
                    <Link href="/resumes">View all resumes</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Progress Overview */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Interview Performance</CardTitle>
                <CardDescription>Your performance across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                {feedbacks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {feedbacks[0].categoryScores.map((category, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <h4 className="text-sm font-medium mb-2">{category.name}</h4>
                        <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                          <div className="text-lg font-bold">{Math.round(category.score)}</div>
                          <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100">
                            <circle 
                              cx="50" cy="50" r="38" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="8"
                              strokeDasharray={`${category.score * 2.4} 1000`}
                              className="text-primary"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No feedback data yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Complete your first interview to see performance analytics and track your progress over time.
                    </p>
                    <Button asChild>
                      <Link href="/interview/generate">Start Your First Interview</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Interviews Tab */}
        <TabsContent value="interviews">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.length > 0 ? (
              <>
                {interviews.map((interview) => (
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
              </>
            ) : (
              <div className="col-span-3 text-center py-12 bg-muted/20 rounded-lg">
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
        </TabsContent>
        
        {/* Resumes Tab */}
        <TabsContent value="resumes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.length > 0 ? (
              <>
                {resumes.map((resume) => (
                  <Card key={resume.id}>
                    <CardHeader>
                      <CardTitle>{resume.title || "Untitled Resume"}</CardTitle>
                      <CardDescription>
                        {resume.jobTitle || "No job title"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {resume.skills && resume.skills.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">Skills:</p>
                            <p className="text-sm text-muted-foreground">
                              {resume.skills.slice(0, 5).join(", ")}
                              {resume.skills.length > 5 && "..."}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">Last updated:</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(resume.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button asChild className="w-full mt-4">
                        <Link href={`/resumes/${resume.id}`}>View Resume</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add Resume Card */}
                <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-8 h-full">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">New Resume</h3>
                  <p className="text-center text-muted-foreground mb-4">
                    Create a new resume to showcase your skills
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/resumes/new">Create New Resume</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center py-12 bg-muted/20 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">No resumes yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven't created any resumes yet. Create your first resume to showcase your skills.
                </p>
                <Button asChild>
                  <Link href="/resumes/new">Create Your First Resume</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Progress Tab */}
        <TabsContent value="progress">
          {feedbacks.length > 0 ? (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Performance Comparison</CardTitle>
                  <CardDescription>Compare your performance across different interviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Interview</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Total Score</th>
                          <th className="text-left py-3 px-4 font-medium">Communication</th>
                          <th className="text-left py-3 px-4 font-medium">Technical</th>
                          <th className="text-left py-3 px-4 font-medium">Problem Solving</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedbacks.map((feedback) => (
                          <tr key={feedback.id} className="border-b">
                            <td className="py-3 px-4">
                              {feedback.interview?.role || "Interview"}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Progress value={feedback.totalScore} className="h-2 w-16 mr-2" />
                                <span>{Math.round(feedback.totalScore)}</span>
                              </div>
                            </td>
                            {feedback.categoryScores.slice(0, 3).map((category, idx) => (
                              <td key={idx} className="py-3 px-4">
                                <div className="flex items-center">
                                  <Progress value={category.score} className="h-2 w-16 mr-2" />
                                  <span>{Math.round(category.score)}</span>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Strengths</CardTitle>
                    <CardDescription>Areas where you perform well</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feedbacks.length > 0 && feedbacks[0].strengths.length > 0 ? (
                      <ul className="space-y-2 list-disc pl-5">
                        {feedbacks[0].strengths.map((strength, index) => (
                          <li key={index} className="text-sm">{strength}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No strengths data available</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Areas for Improvement</CardTitle>
                    <CardDescription>Skills to focus on developing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feedbacks.length > 0 && feedbacks[0].areasForImprovement.length > 0 ? (
                      <ul className="space-y-2 list-disc pl-5">
                        {feedbacks[0].areasForImprovement.map((area, index) => (
                          <li key={index} className="text-sm">{area}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No improvement areas data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">No progress data yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Complete your first interview to see performance analytics and track your progress over time.
              </p>
              <Button asChild>
                <Link href="/interview/generate">Start Your First Interview</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
