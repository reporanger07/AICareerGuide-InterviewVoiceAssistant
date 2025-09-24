"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInterviewById, generateQuestions } from "@/actions/mockinterview";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Phone, Timer, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Vapi from "@vapi-ai/web";
import Alert from "../_components/alert";
const InterviewSessionPage = () => {
  const { interview } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState(null);
  const [error, setError] = useState(null);
  const [vapiInstance, setVapiInstance] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Initialize Vapi instance
  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
    setVapiInstance(vapi);

    vapi.on("call-start", () => {
      console.log("Call started");
      setCallActive(true);
    });
    
    vapi.on("call-end", () => {
      console.log("Call ended");
      setCallActive(false);
    });
    
    vapi.on("message", (message) => {
      if (message.type === "transcript") {
        console.log(`${message.role}: ${message.transcript}`);
      }
    });

    return () => {
      // Cleanup
      vapi.stop();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (callActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  // Load interview data
  useEffect(() => {
    if (!interview) {
      setError("Interview ID is missing");
      setLoading(false);
      return;
    }

    const loadInterview = async () => {
      try {
        const data = await getInterviewById(interview);
        if (!data) {
          setError("Interview not found");
          toast.error("Interview not found. Please try again.");
          return;
        }

        setInterviewData(data);
        toast.success("Interview loaded successfully!");
      } catch (err) {
        console.error("Error loading interview:", err);
        setError(err.message || "Failed to load interview");
        toast.error(`Failed to load interview: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interview]);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call function
  const startCall = () => {
    if (!vapiInstance || !interviewData?.questions?.length) {
      toast.error("Unable to start call. Please try again.");
      return;
    }

    const questionList = interviewData.questions.map(q => q.question).join(", ");

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi there! Welcome to your ${interviewData.jobTitle} interview at ${interviewData.companyName}. I'm excited to learn more about you. Are you ready to begin?`,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI voice assistant conducting interviews for a ${interviewData.jobTitle} position at ${interviewData.companyName}. 

Your job is to ask candidates the provided interview questions and assess their responses. Begin with a friendly introduction, setting a relaxed yet professional tone.

Ask one question at a time and wait for the candidate's response before proceeding. Keep questions clear and concise.

Here are the interview questions to ask: ${questionList}

Guidelines:
- Be friendly, engaging, and professional
- Keep responses conversational and natural
- Provide encouraging feedback after each answer
- If the candidate struggles, offer hints or rephrase questions
- After all questions, provide a brief summary of their performance
- End on a positive note

Remember to maintain a supportive interview environment while gathering meaningful insights about the candidate's qualifications.`
          },
        ],
      },
    };

    // Start the call with your assistant ID
    vapiInstance.start("ec69387e-14a3-4dd3-ada1-e7e2e4dbd09b", assistantOptions);
  };

  const stopInterview = () => {
    if (vapiInstance) {
      vapiInstance.stop();
      setCallActive(false);
      setTimeElapsed(0);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading interview session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-2xl mx-auto shadow-lg border-red-200">
          <CardContent className="flex flex-col items-center text-center gap-4 py-16">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <CardTitle className="text-xl font-bold text-red-700">Error Loading Interview</CardTitle>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className=" border-b px-6 py-4 flex justify-between items-center">
//         <h2 className="text-xl font-semibold">AI Interview Session</h2>
//         <div className="flex items-center gap-2">
//           <Timer className="h-4 w-4" />
//           <span className="font-mono">{formatTime(timeElapsed)}</span>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex items-center justify-center p-6">
//         <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* AI Recruiter */}
//           <Card className="bg-white shadow-lg">
//             <CardContent className="flex flex-col items-center justify-center h-80 p-8">
//               <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                 <span className="text-2xl font-semibold text-gray-600">AI</span>
//               </div>
//               <p className="font-medium text-lg">AI Recruiter</p>
//               {callActive && (
//                 <div className="mt-4 flex items-center">
//                   <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
//                   <span className="text-sm text-gray-600">Active</span>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* User */}
//           <Card className="bg-white shadow-lg">
//             <CardContent className="flex flex-col items-center justify-center h-80 p-8">
//               <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
//                 <span className="text-2xl font-semibold text-white">U</span>
//               </div>
//               <p className="font-medium text-lg">You</p>
//               {callActive && (
//                 <div className="mt-4 flex items-center">
//                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
//                   <span className="text-sm text-gray-600">Listening</span>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="bg-white border-t px-6 py-4">
//         <div className="flex justify-center items-center gap-4">
//           {!callActive ? (
//             <Button
//               onClick={startCall}
//               size="lg"
//               className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600"
//             >
//               <Phone className="h-6 w-6" />
//             </Button>
//           ) : (
//             <>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="rounded-full w-14 h-14 p-0"
//               >
//                 <Mic className="h-6 w-6" />
//               </Button>
              
//               <Button
//                 onClick={stopInterview}
//                 size="lg"
//                 className="rounded-full w-14 h-14 p-0 bg-red-500 hover:bg-red-600"
//               >
//                 <Phone className="h-6 w-6" />
//               </Button>
//             </>
//           )}
//         </div>
        
//         {!callActive && (
//           <div className="text-center mt-4">
//             <p className="text-sm text-gray-500">
//               Click the green button to start your AI interview for {interviewData?.jobTitle}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// return (
//   <div className="min-h-screen">
//     {/* Header */}
//     <div className="border-b px-6 py-4 flex justify-between items-center">
//       <h2 className="text-xl font-semibold">AI Interview Session</h2>
//       <div className="flex items-center gap-2 px-3 py-2 rounded-full">
//         <Timer className="h-4 w-4" />
//         <span className="font-mono">{formatTime(timeElapsed)}</span>
//       </div>
//     </div>

//     {/* Main Content */}
//     <div className="flex-1 flex items-center justify-center p-6">
//       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* AI Recruiter */}
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center h-80 p-8">
//             <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
//               <span className="text-2xl font-bold">AI</span>
//             </div>
//             <p className="font-medium text-lg mb-2">AI Recruiter</p>
//             {callActive && (
//               <div className="mt-4 flex items-center px-3 py-1 rounded-full">
//                 <div className="w-3 h-3 rounded-full animate-pulse mr-2"></div>
//                 <span className="text-sm font-medium">Speaking</span>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* User */}
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center h-80 p-8">
//             <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
//               <span className="text-2xl font-bold">U</span>
//             </div>
//             <p className="font-medium text-lg mb-2">You</p>
//             {callActive && (
//               <div className="mt-4 flex items-center px-3 py-1 rounded-full">
//                 <div className="w-3 h-3 rounded-full animate-pulse mr-2"></div>
//                 <span className="text-sm font-medium">Listening</span>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>

//     {/* Controls */}
//     <div className="border-t px-6 py-6">
//       <div className="flex justify-center items-center gap-6">
//         {!callActive ? (
//           <Button
//             onClick={startCall}
//             size="lg"
//             className="rounded-full w-16 h-16 p-0"
//           >
//             <Phone className="h-7 w-7" />
//           </Button>
//         ) : (
//           <>
//             <Button
//               size="lg"
//               variant="outline"
//               className="rounded-full w-16 h-16 p-0"
//             >
//               <Mic className="h-7 w-7" />
//             </Button>
            
//             <Button
//               onClick={stopInterview}
//               size="lg"
//               className="rounded-full w-16 h-16 p-0"
//             >
//               <Phone className="h-7 w-7" />
//             </Button>
//           </>
//         )}
//       </div>
      
//       {!callActive && (
//         <div className="text-center mt-6">
//           <p className="inline-block px-4 py-2 rounded-full">
//             Click the button to start your AI interview for{' '}
//             <span className="font-semibold">{interviewData?.jobTitle}</span>
//           </p>
//         </div>
//       )}
//     </div>
//   </div>
// );

//return (
//   <div className="min-h-screen">
//     {/* Header */}
//     <div className="border-b px-6 py-4 flex justify-between items-center">
//       <h2 className="text-xl font-semibold">AI Interview Session</h2>
//       <div className="flex items-center gap-2 px-3 py-2 rounded-full">
//         <Timer className="h-4 w-4" />
//         <span className="font-mono">{formatTime(timeElapsed)}</span>
//       </div>
//     </div>

//     {/* Main Content */}
//     <div className="flex-1 flex items-center justify-center p-6">
//       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* AI Recruiter */}
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center h-80 p-8">
//             <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
//               <span className="text-2xl font-bold">AI</span>
//             </div>
//             <p className="font-medium text-lg mb-2">AI Recruiter</p>
//             {callActive && (
//               <div className="mt-4 flex items-center px-3 py-1 rounded-full">
//                 <div className="w-3 h-3 rounded-full animate-pulse mr-2"></div>
//                 <span className="text-sm font-medium">Speaking</span>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* User */}
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center h-80 p-8">
//             <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
//               <span className="text-2xl font-bold">U</span>
//             </div>
//             <p className="font-medium text-lg mb-2">You</p>
//             {callActive && (
//               <div className="mt-4 flex items-center px-3 py-1 rounded-full">
//                 <div className="w-3 h-3 rounded-full animate-pulse mr-2"></div>
//                 <span className="text-sm font-medium">Listening</span>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>

//     {/* Controls */}
//     <div className="border-t px-6 py-6">
//       <div className="flex justify-center items-center gap-6">
//         {!callActive ? (
//           <Button
//             onClick={startCall}
//             size="lg"
//             className="rounded-full w-16 h-16 p-0"
//           >
//             <Phone className="h-7 w-7" />
//           </Button>
//         ) : (
//           <>
//             <Button
//               size="lg"
//               variant="outline"
//               className="rounded-full w-16 h-16 p-0"
//             >
//               <Mic className="h-7 w-7" />
//             </Button>
            
//             <Button
//               onClick={stopInterview}
//               size="lg"
//               className="rounded-full w-16 h-16 p-0"
//             >
//               <Phone className="h-7 w-7" />
//             </Button>
//           </>
//         )}
//       </div>
      
//       {!callActive && (
//         <div className="text-center mt-6">
//           <p className="inline-block px-4 py-2 rounded-full">
//             Click the button to start your AI interview for{' '}
//             <span className="font-semibold">{interviewData?.jobTitle}</span>
//           </p>
//         </div>
//       )}
//     </div>
//   </div>
// );


return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
    {/* Header */}
    <div className="backdrop-blur-sm bg-black/20 border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-white">AI Interview Session</h2>
      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
        <Timer className="h-4 w-4 text-white" />
        <span className="font-mono text-white">{formatTime(timeElapsed)}</span>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Recruiter */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center h-80 p-8">
            <div className="relative flex items-center justify-center mb-4">
              {/* Light grey circle background */}
              <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                {/* Avatar circle */}
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-black">
                  <span className="text-2xl font-bold text-white">AI</span>
                </div>
              </div>
              
              {/* Wavy shadow animation when speaking */}
              {callActive && (
                <>
                  <div className="absolute w-40 h-40 border-2 border-green-500 rounded-full animate-ping opacity-30"></div>
                  <div className="absolute w-44 h-44 border border-green-400 rounded-full animate-pulse opacity-20"></div>
                  <div className="absolute w-48 h-48 border border-green-300 rounded-full animate-ping opacity-10" style={{animationDelay: '0.5s'}}></div>
                </>
              )}
            </div>
            <p className="font-medium text-lg mb-2 text-white">AI Recruiter</p>
          </CardContent>
        </Card>

        {/* User */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center h-80 p-8">
            <div className="relative flex items-center justify-center mb-4">
              {/* Light grey circle background */}
              <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                {/* Avatar circle */}
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-black">
                  <span className="text-2xl font-bold text-white">U</span>
                </div>
              </div>
              
              {/* Wavy shadow animation when speaking */}
              {callActive && (
                <>
                  <div className="absolute w-40 h-40 border-2 border-blue-500 rounded-full animate-ping opacity-30"></div>
                  <div className="absolute w-44 h-44 border border-blue-400 rounded-full animate-pulse opacity-20"></div>
                  <div className="absolute w-48 h-48 border border-blue-300 rounded-full animate-ping opacity-10" style={{animationDelay: '0.5s'}}></div>
                </>
              )}
            </div>
            <p className="font-medium text-lg mb-2 text-white">You</p>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Controls */}
    <div className="backdrop-blur-sm bg-black/20 border-t border-white/10 px-6 py-6">
      <div className="flex justify-center items-center gap-6">
        {!callActive ? (
          <Button
            onClick={startCall}
            size="lg"
            className="rounded-full w-16 h-16 p-0 bg-white/90 hover:bg-white text-black shadow-2xl"
          >
            <Phone className="h-7 w-7" />
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-16 h-16 p-0 bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <Mic className="h-7 w-7" />
            </Button>
            <Alert>
            <Button
              onClick={stopInterview}
              size="lg"
              className="rounded-full w-16 h-16 p-0 bg-red-600 hover:bg-red-700 text-white shadow-2xl"
            >
              <Phone className="h-7 w-7" />
            </Button>
            </Alert>
          </>
        )}
      </div>
      
      {!callActive && (
        <div className="text-center mt-6">
          <p className="text-white/80 bg-white/10 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
            Click the button to start your AI interview for{' '}
            <span className="font-semibold text-white">{interviewData?.jobTitle}</span>
          </p>
        </div>
      )}
    </div>
  </div>
);

}
export default InterviewSessionPage;