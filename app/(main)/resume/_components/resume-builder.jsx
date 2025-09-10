"use client";
import { Button } from "@/components/ui/button";
import { Download, Save ,Edit, Loader2,Monitor,AlertTriangle,lo} from "lucide-react";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useFetch from "@/hooks/use-fetch";
import { saveResume } from "@/actions/resume";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema } from "@/app/lib/schema";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EntryForm from "./entry-form";
import { entriesToMarkdown } from "@/app/lib/helper";
import { useUser } from "@clerk/nextjs";
import MDEditor from "@uiw/react-md-editor";
import html2pdf from "html2pdf.js";
//import dynamic from "next/dynamic";
//const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });


const ResumeBuilder = ({ initialContent }) => {
  const [activeTab, setActiveTab] = useState("edit");
  const [resumeMode,setResumeMode]=useState("preview")
  const[previewContent,setPreviewContent]=useState(initialContent);

  const [isGenerating, setIsGenerating] = useState(false);
  const {user}=useUser();
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });
  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);

    }
  }, [formValues, activeTab]);


   const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.github) parts.push(`🐦 [github](${contactInfo.github})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

const generatePDF = async () => {
    setIsGenerating(true);
    try {

         // Dynamically import html2pdf only on client side
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default;

    
      const element = document.getElementById("resume-pdf");
      const opt = {
        margin: [15, 15],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

//   const generatePDF = async () => {
//   if (typeof window === "undefined") return; // prevent SSR errors
//   setIsGenerating(true);

//   try {

//     const html2pdfModule = await import("html2pdf.js");
//     const html2pdf = html2pdfModule.default;


    
//     const element = document.getElementById("resume-pdf");

//     if (!element) {
//       console.error(" Resume element not found!");
//       setIsGenerating(false);
//       return;
//     }

//     const opt = {
//       margin: [15, 15],
//       filename: "resume.pdf",
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//     };

//     await html2pdf().set(opt).from(element).save();
//   } catch (error) {
//     console.error("PDF generation error:", error);
//   } finally {
//     setIsGenerating(false);
//   }
// };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="text-6xl font-bold gradient-title">Resume Builder</h1>

        <div className="space-x-2">
          <Button>
            <Save className=" h-4 w-4" />
            Save
          </Button>

          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <form className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="Example@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile no:</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+XX XXXXXXXXXX"
                    error={errors.contactInfo?.mobile}
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Linkedin:</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="hrpps://linkedin.com/in/username"
                    error={errors.contactInfo?.linkedin}
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Github:</label>
                  <Input
                    {...register("contactInfo.github")}
                    type="url"
                    placeholder="https://github.com/username"
                    error={errors.contactInfo?.github}
                  />
                  {errors.contactInfo?.github && (
                    <p className="text-sm text-red-600">
                      {errors.contactInfo.github.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* --------------------------------------------------------------------------------------------------------------------------------- */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                control={control}
                name="summary"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32 "
                    placeholder="Write a brief summary about your professional background and career objectives"
                    error={errors.summary}
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.summary.message}
                </p>
              )}
            </div>
            {/* -------------------------------------------------------------------------------------------------------------- */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                control={control}
                name="skills"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-16 "
                    placeholder="List your skills"
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.skills.message}
                </p>
              )}
            </div>

            {/* -------------------------------------------------------------------------------------------------------------------*/}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>
        <TabsContent value="preview">
          <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>

              
          {resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose editied markdown if you update the form data.
              </span>
            </div>
          )}

          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
            </div>

            <div className="hidden">
            <div id="resume-pdf">
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: "white",
                  color: "black",
                }}
              />
            </div>
          </div>

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;
