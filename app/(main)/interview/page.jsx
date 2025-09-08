import React from 'react'
import { getAssessments } from '@/actions/interview';
import StatsCards from './_components/stats-card';
import QuizList from './_components/quiz-list';

const InterviewPage = async () => {
  const assessments = await getAssessments();

  return (
    <div>
      <h1 className='text-4xl md:text-5xl font-bold mb-8 gradient-title'>Interview Practice</h1>

      <div className='space-y-8'>
        <StatsCards assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}

export default InterviewPage;
