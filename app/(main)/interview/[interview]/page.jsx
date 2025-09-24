"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInterviewById, generateQuestions } from "@/actions/mockinterview";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const InterviewPage = () => {
  const { interview } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!interview) {
      setError("Interview ID is missing");
      setLoading(false);
      return;
    }

    const loadInterview = async () => {
      try {
        console.log("Loading interview with ID:", interview);
        const data = await getInterviewById(interview);
        console.log("Interview data received:", data);
        
        if (!data) {
          setError("Interview not found");
          toast.error("Interview not found. Please try again.");
          return;
        }
        
        setInterviewData(data);
        toast.success("Interview loaded successfully!");
        
      } catch (error) {
        console.error("Error loading interview:", error);
        setError(error.message || "Failed to load interview");
        toast.error(`Failed to load interview: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interview]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading interview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-2xl mx-auto shadow-lg border">
          <CardContent className="flex flex-col items-center text-center gap-4 py-16">
            <AlertCircle className="h-12 w-12" />
            <CardTitle className="text-xl font-bold">
              Error Loading Interview
            </CardTitle>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardContent className="flex flex-col items-center text-center gap-4 py-16">
            <AlertCircle className="h-12 w-12" />
            <CardTitle className="text-xl font-bold">
              No Interview Data
            </CardTitle>
            <p className="text-muted-foreground">
              Unable to load interview information.
            </p>
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg border h-80 flex items-center justify-center">
        <CardContent className="flex flex-col items-center text-center gap-4">
          <CheckCircle className="h-12 w-12 mb-2" />
          <CardTitle className="text-2xl font-bold">
            Your Interview is Ready!
          </CardTitle>
          <p className="text-muted-foreground max-w-md">
            Your AI-powered mock interview for <strong>{interviewData?.jobTitle}</strong> at <strong>{interviewData?.companyName}</strong> has been prepared with personalized questions. 
            Ready to test your skills and boost your confidence?
          </p>
          <Button 
            className="mt-2"
            size="lg"
            onClick={() => router.push(`/interview/${interview}/start`)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewPage;
