import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-career-coach",
  name: "AI Career Coach",
  credentials: {
    apiKey: process.env.GEMINI_API_KEY, // remove quotes around process.env
  },
});
