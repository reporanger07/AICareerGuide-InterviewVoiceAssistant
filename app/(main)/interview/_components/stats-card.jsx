"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const StatsCard = ({ assessments }) => {
  const router = useRouter();
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[0];
  };
  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          {/* <OutlookIcon className={`h-4 w-4 ${outlookColor}`} /> */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getAverageScore()}%</div>
          <p className="text-xs text-muted-foreground">
            Across all assessments
          </p>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const latest = getLatestAssessment();
            if (!latest) {
              return (
                <>
                  <div className="text-2xl font-bold">–</div>
                  <p className="text-xs text-muted-foreground">
                    No assessments yet
                  </p>
                </>
              );
            }
            return (
              <>
                <div className="text-2xl font-bold">{latest.quizScore}%</div>
                <p className="text-xs text-muted-foreground">
                  on {new Date(latest.createdAt).toLocaleDateString()}
                </p>
              </>
            );
          })()}
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
          {/* <OutlookIcon className={`h-4 w-4 ${outlookColor}`} /> */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalQuestions()}</div>
          {/* <p className='text-xs text-muted-foreground'>on {new Date(getLatestAssessment().createdAt).toLocaleDateString()}</p> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Recent Assessment
          </CardTitle>
          {/* <OutlookIcon className={`h-4 w-4 ${outlookColor}`} /> */}
        </CardHeader>

        <CardContent>
          <Button
            onClick={() =>
              router.push("/interview/recentquiz", { state: { assessments } })
            }
          >
            Go to Recent Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;
