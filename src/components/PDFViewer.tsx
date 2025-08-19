"use client";
import { DocumentArrowDownIcon, EyeIcon } from "@heroicons/react/24/outline";

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

export default function PDFViewer({ pdfUrl, title }: PDFViewerProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = title;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewInNewTab = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 border-2 border-dashed border-red-200 rounded-lg p-8">
      <svg
        className="mx-auto h-16 w-16 text-red-600 mb-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
        PDF Document
      </h3>
      <p
        className="text-gray-600 mb-4 text-center text-sm max-w-xs truncate"
        title={title}
      >
        {title}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleViewInNewTab}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          View PDF
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Download
        </button>
      </div>
    </div>
  );
}
