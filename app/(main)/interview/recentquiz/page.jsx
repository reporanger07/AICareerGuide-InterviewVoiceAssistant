// app/(main)/interview/recentquiz/page.jsx
import QuizList from '../_components/quiz-list';
import { getAssessments } from '@/actions/interview';

export default async function RecentQuizPage() {
  const assessments = await getAssessments(); // fetch from DB or API
  return <QuizList assessments={assessments} />; // pass as prop
}
