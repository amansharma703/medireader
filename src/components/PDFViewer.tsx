"use client";
import React, { useState, useEffect } from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <span>Loading Document...</span>
        </div>
      )}
      <iframe
        src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
        className="w-full h-full"
        frameBorder="0"
        onLoad={handleLoad} // Set loading to false when iframe loads
      ></iframe>
    </div>
  );
};

export default PDFViewer;
