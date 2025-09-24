"use client";

import React, { useState } from "react";
import JobForm from "./job-form";
import { startMockInterview, generateQuestions } from "@/actions/mockinterview";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const StartInterview = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartInterview = async ({ jobTitle, companyName, jobDescription }) => {
    setLoading(true);
    try {
      // 1. Generate AI questions
      const questions = await generateQuestions("Technical");

      // 2. Save interview in DB
      const interview = await startMockInterview({
        jobTitle,
        companyName,
        interviewType: "Technical", // or make dynamic
        questions,
      });

      toast.success("Interview started successfully!");
      console.log("Saved interview:", interview);

      // 3. Redirect to the new interview page
      router.push(`/interview/${interview.interviewId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <JobForm onSubmitForm={handleStartInterview} />
      {loading && <p className="text-center mt-4">Generating interview questions...</p>}
    </div>
  );
};

export default StartInterview;
