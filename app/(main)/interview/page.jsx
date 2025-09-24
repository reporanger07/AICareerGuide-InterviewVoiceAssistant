import React from "react";
import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-card";
import QuizList from "./_components/quiz-list";
//import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateQuestions } from "@/actions/mockinterview";
//import { startMockInterview } from "@/actions/mockinterview";

const InterviewPage = async () => {
   const assessments = await getAssessments();
   //const Questions=await generateQuestions();
  
  //startMockInterview(Questions);
  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-title">
        Interview Practice
      </h1>

      <div className="space-y-8">
        <StatsCards assessments={assessments} />
        <div className="flex w-full gap-4">
          <div className="w-1/2">


          <Card className="border-2 h-80 flex items-center justify-center">
      <CardContent className="flex flex-col items-center text-center gap-4">
        <CardTitle className="text-2xl font-bold gradient-title">
          Ready to Ace Your Interview?
        </CardTitle>
        <CardDescription>
          Start a new mock interview quiz to sharpen your skills and boost your confidence!
        </CardDescription>
        <Link href="/interview/mock">
          <Button className="mt-2">Start New Assessment</Button>
        </Link>
      </CardContent>
    </Card>
             
          </div>
          <div className="w-1/2">


          <Card className="border-2 h-80 flex items-center justify-center">
      <CardContent className="flex flex-col items-center text-center gap-4">
        <CardTitle className="text-2xl font-bold gradient-title">
          Ready to Ace Your Interview?
        </CardTitle>
        <CardDescription>
          Start a new mock interview quiz to sharpen your skills and boost your confidence!
        </CardDescription>
        <Link href="/interview/MockInterview">
          <Button className="mt-2">Start Mock Interview</Button>
        </Link>
      </CardContent>
    </Card>
             
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
