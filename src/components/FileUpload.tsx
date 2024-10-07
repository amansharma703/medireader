"use client";

import { getS3Url, uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [processStage, setProcessStage] = React.useState<"uploading" | "reading" | "analyzing" | "summarizing" | null>(null);

  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
      openAIFileId,
    }: {
      file_key: string;
      file_name: string;
      openAIFileId: string;
    }) => {
      setProcessStage("analyzing");
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
        openAIFileId,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        setProcessStage("uploading");

        const data = await uploadToS3(file);
        const formData = new FormData();
        formData.append("file", file);

        setProcessStage("reading");
        const response = await axios.post("/api/upload", formData);
        const pdfUrl = getS3Url(data?.file_key);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong");
          return;
        }

        mutate(
          { file_key: data.file_key, file_name: data.file_name, openAIFileId: response.data.openAIFile.id },
          {
            onSuccess: ({ chat_id }) => {
              setProcessStage("summarizing");
              toast.success("Chat created!");
              router.push(`/chat/${chat_id}`);
            },
            onError: (err) => {
              toast.error("Error creating chat");
              console.error(err);
            },
          }
        );
      } catch (error) {
        toast.error("Upload failed. Please try again.");
        console.error(error);
      } finally {
        setUploading(false);
        setProcessStage(null);
      }
    },
    // Add this to disable drag and drop
    disabled: uploading,
  });


  const renderLoader = () => {
    switch (processStage) {
      case "uploading":
        return (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Uploading PDF...</p>
          </>
        );
      case "reading":
        return (
          <>
            <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Reading file content...</p>
          </>
        );
      case "analyzing":
        return (
          <>
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Analyzing lab report...</p>
          </>
        );
      case "summarizing":
        return (
          <>
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Generating summary and health score...</p>
          </>
        );
      default:
        return (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        );
    }
  };

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className: `border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`,
        })}
      >
        <input
          {...getInputProps({
            disabled: uploading,
          })}
        />
        {renderLoader()}
      </div>
    </div>
  );
};

export default FileUpload;
