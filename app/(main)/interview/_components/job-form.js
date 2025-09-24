"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, Sparkles } from "lucide-react";
import { saveJobToInterview, generateQuestions } from "@/actions/mockinterview";

// Validation schema
const jobSchema = z.object({
  jobTitle: z.string().min(2, "Please enter a job title"),
  companyName: z.string().min(2, "Please enter a company name"),
  jobDescription: z.string().min(
    10,
    "Job description should be at least 10 characters"
  ),
});

const JobForm = ({ onSubmitForm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState("form"); // "form", "generating", "success"
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setCurrentStep("saving");
      
      // Step 1: Save job details to database
      const result = await saveJobToInterview(data);
      
      if (result.success) {
        // Step 2: Generate questions
        setIsSubmitting(false);
        setIsGenerating(true);
        setCurrentStep("generating");
        
        await generateQuestions(result.interviewId);
        
        // Step 3: Success
        setIsGenerating(false);
        setSubmitSuccess(true);
        setCurrentStep("success");
        
        // Call parent callback if provided
        if (onSubmitForm) {
          onSubmitForm(data);
        }
        
        // Reset form
        reset();
        
        // Redirect to interview page
        setTimeout(() => {
          router.push(`/interview/${result.interviewId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving job or generating questions:", error);
      alert("Failed to process your request. Please try again.");
      setCurrentStep("form");
    } finally {
      setIsSubmitting(false);
      setIsGenerating(false);
    }
  };

  // Success state
  if (currentStep === "success") {
    return (
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-green-700 mb-2">
            Interview Ready!
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Job details saved and AI questions generated successfully!
            <br />
            Redirecting to your interview...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Generating questions state
  if (currentStep === "generating") {
    return (
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Sparkles className="h-16 w-16 text-primary mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold mb-2">
            Generating AI Questions...
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Creating personalized interview questions based on your job description
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Form state
  return (
    <Card className="w-full max-w-lg mt-10 mx-2">
      <CardHeader>
        <CardTitle className="text-4xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Add job details to create your personalized AI-powered interview experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              placeholder="Frontend Developer"
              disabled={isSubmitting}
              {...register("jobTitle")}
            />
            {errors.jobTitle && (
              <p className="text-sm text-red-500 mt-1">
                {errors.jobTitle.message}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company</Label>
            <Input
              id="companyName"
              placeholder="e.g. Google"
              disabled={isSubmitting}
              {...register("companyName")}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500 mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              className="h-32"
              placeholder="Describe the role, responsibilities, required skills, and any specific requirements..."
              disabled={isSubmitting}
              {...register("jobDescription")}
            />
            {errors.jobDescription && (
              <p className="text-sm text-red-500 mt-1">
                {errors.jobDescription.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || isGenerating}>
            {currentStep === "saving" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Job Details...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create AI Interview
              </>
            )}
          </Button>
        </form>

        {/* Info about what happens next */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>What happens next:</strong> We'll save your job details and generate personalized interview questions using AI based on your requirements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobForm;