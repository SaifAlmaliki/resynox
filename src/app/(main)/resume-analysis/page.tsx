"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
import { resumeAnalysisSchema, ResumeAnalysisValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload, Loader2, CheckCircle, XCircle, Star, AlertTriangle, Lightbulb } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";
import { analyzeResume, getUserAnalyses } from "./actions";
import { useEffect } from "react";

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  overallScore?: number;
  recommendations?: string[];
  analyzedAt: string;
}

interface Analysis {
  id: string;
  pdfFileUrl: string;
  jobDescription: string;
  analysisResult: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

export default function ResumeAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [previousAnalyses, setPreviousAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();

  const form = useForm<ResumeAnalysisValues>({
    resolver: zodResolver(resumeAnalysisSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  // Load previous analyses on mount
  useEffect(() => {
    loadPreviousAnalyses();
  }, []);

  const loadPreviousAnalyses = async () => {
    try {
      const analyses = await getUserAnalyses();
      setPreviousAnalyses(analyses);
    } catch (error) {
      console.error("Error loading analyses:", error);
    }
  };

  const onSubmit = async (values: ResumeAnalysisValues) => {
    // Check if user has pro subscription
    if (!canUseAITools(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    
    try {
      const result = await analyzeResume(values);
      
      if (result.success) {
        setCurrentAnalysis(result.result);
        form.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Reload analyses list
        await loadPreviousAnalyses();
        
        toast({
          title: "Analysis Complete!",
          description: "Your resume has been successfully analyzed.",
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewAnalysis = (analysis: Analysis) => {
    if (analysis.analysisResult) {
      try {
        const result = JSON.parse(analysis.analysisResult);
        setCurrentAnalysis(result);
        setSelectedAnalysis(analysis);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load analysis results",
        });
      }
    }
  };

  const renderAnalysisResult = (result: AnalysisResult) => (
    <div className="space-y-6">
      {result.overallScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">
              {result.overallScore}/100
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Lightbulb className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Resume Analysis</h1>
          <p className="text-muted-foreground">
            Upload your resume and job description to get AI-powered insights on your strengths and areas for improvement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload & Analyze</CardTitle>
              <CardDescription>
                Upload your PDF resume and provide the job description you're targeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="resumePdf"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>Resume PDF</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <Input
                              {...field}
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                onChange(file);
                              }}
                              className="cursor-pointer"
                            />
                            <Upload className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Paste the job description here..."
                            className="min-h-[150px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isAnalyzing} className="w-full">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing... (up to 25 seconds)
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Previous Analyses */}
          <Card>
            <CardHeader>
              <CardTitle>Previous Analyses</CardTitle>
              <CardDescription>
                View your previous resume analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {previousAnalyses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No previous analyses found
                  </p>
                ) : (
                  previousAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewAnalysis(analysis)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {analysis.status === "completed" && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {analysis.status === "failed" && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {analysis.status === "processing" && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                          <span className="font-medium">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground capitalize">
                          {analysis.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {analysis.jobDescription.substring(0, 100)}...
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        {currentAnalysis && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              {selectedAnalysis && (
                <CardDescription>
                  Analyzed on {new Date(selectedAnalysis.createdAt).toLocaleDateString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {renderAnalysisResult(currentAnalysis)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 