"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Add this new function to save job details
export async function saveJobToInterview({ jobTitle, companyName, jobDescription }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const interview = await db.interview.create({
      data: {
        userId: user.id,
        jobTitle: jobTitle,
        companyName: companyName,
        jobDescription: jobDescription,
        interviewType: "General", // Default type
        duration: 30, // Default duration
        questions:[], // Empty array initially
      },
    });

    console.log("Interview created:", interview);
    
    return {
      success: true,
      interviewId: interview.interviewId,
      message: "Job details saved successfully!",
    };
  } catch (error) {
    console.error("Error saving job to interview:", error);
    throw new Error("Failed to save job details");
  }
}

// export async function generateQuestions(interviewId) {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });
//   if (!user) throw new Error("User not found");

//   // Find the existing interview instead of creating a new one
//   const interview = await db.interview.findUnique({
//     where: { interviewId: interviewId },
//   });
//   if (!interview) throw new Error("Interview not found");

//   try {
//     const prompt = `
// You are an expert technical interviewer. Based on the following inputs, generate a well-structured list of high-quality interview questions.

// **Job Title**: ${interview.jobTitle || "N/A"}
// **Company Name**: ${interview.companyName || "N/A"}
// **Job Description**: ${interview.jobDescription || "N/A"}
// **Interview Type**: ${interview.interviewType || "Technical"}
// **User Skills**: ${user.skills?.join(", ") || "N/A"}
// **User Experience**: ${user.experience || 0} years
// **Interview Duration**: ${interview.duration || 30} minutes

// Generate exactly 8-10 questions covering different aspects:
// - 3-4 Technical questions (specific to the role and job description)
// - 2-3 Behavioral questions
// - 1-2 Experience-based questions
// - 1-2 Problem-solving scenarios

// ✅ Format your response as valid JSON only:
// [
//   {
//     "question": "string",
//     "type": "Technical | Behavioral | Experience | Problem Solving | Leadership"
//   }
// ]
// `;

//     const result = await model.generateContent(prompt);
//     const raw = result.response.text();

//     const cleaned = raw.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
//     const questions = JSON.parse(cleaned);

//     // Update the interview with the generated questions
//     await db.interview.update({
//       where: { interviewId: interviewId },
//       data: { questions: questions }
//     });

//     console.log("Generated questions:", questions);
//     return questions;
//   } catch (error) {
//     console.error("Error generating questions:", error);
//     throw new Error("Failed to generate questions");
//   }
// }

export async function getInterviewById(interviewId) {
  const interview = await db.interview.findUnique({
    where: { interviewId: interviewId },
  });
  return interview;
}



export async function generateQuestions(interviewId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const interview = await db.interview.findUnique({
    where: { interviewId: interviewId },
  });
  if (!interview) throw new Error("Interview not found");

  try {
    const prompt = `
You are an expert technical interviewer. Based on the following inputs, generate a well-structured list of high-quality interview questions.

**Job Title**: ${interview.jobTitle || "N/A"}
**Company Name**: ${interview.companyName || "N/A"}
**Job Description**: ${interview.jobDescription || "N/A"}
**Interview Type**: ${interview.interviewType || "Technical"}
**User Skills**: ${user.skills?.join(", ") || "N/A"}
**User Experience**: ${user.experience || 0} years
**Interview Duration**: ${interview.duration || 30} minutes

Generate exactly 8-10 questions covering different aspects:
- 3-4 Technical questions (specific to the role and job description)
- 2-3 Behavioral questions
- 1-2 Experience-based questions
- 1-2 Problem-solving scenarios

✅ Format your response as valid JSON only:
[
  {
    "question": "string",
    "type": "Technical | Behavioral | Experience | Problem Solving | Leadership"
  }
]
`;

    // Generate AI content
    const result = await model.generateContent(prompt);

    // Safely extract text from Gemini response
    let raw = "";
    if (typeof result.response.text === "function") {
      raw = result.response.text();
    } else {
      raw = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // Clean the response and parse JSON
    let questions = [];
    try {
      const cleaned = raw.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
      questions = JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse Gemini JSON response:", raw);
      throw new Error("Invalid JSON returned from Gemini API");
    }

    // Update the interview in DB
    await db.interview.update({
      where: { interviewId: interviewId },
      data: { questions },
    });

    console.log("Generated questions:", questions);
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions");
  }
}


// export async function getInterviewById(interviewId) {
//   try {
//     console.log("Fetching interview with ID:", interviewId);
    
//     // Add authentication check
//     const { userId } = await auth();
//     if (!userId) {
//       console.log("No user authenticated");
//       throw new Error("Unauthorized");
//     }

//     // Get user from database
//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });
//     if (!user) {
//       console.log("User not found in database");
//       throw new Error("User not found");
//     }

//     // Find interview and ensure it belongs to the current user
//     const interview = await db.interview.findUnique({
//       where: { 
//         interviewId: interviewId,
//         userId: user.id, // Add this security check
//       },
//     });

//     console.log("Interview found:", interview ? "Yes" : "No");
    
//     if (!interview) {
//       throw new Error("Interview not found or access denied");
//     }

//     return interview;
//   } catch (error) {
//     console.error("Error in getInterviewById:", error);
//     throw error;
//   }
// }