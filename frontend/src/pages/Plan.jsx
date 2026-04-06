import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import planPdf from '../assets/Plan.pdf';

// Initialize PDF.js worker using Vite compatible path
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function Plan() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageHeight, setPageHeight] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      // Calculate a height that fits perfectly with the new minimal UI
      // leaving a small gap for the bottom controls and navbar.
      const availableHeight = window.innerHeight - 150;
      setPageHeight(Math.max(availableHeight, 400));
    };
    
    // Initial size calculation
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[80vh] pb-6 fade-in">
      <div className="flex flex-col items-center relative transition-all">
        {/* PDF Document Viewer (Height constrained to fit, making it taller and wider) */}
        <div className="flex justify-center bg-slate-800/20 p-2 sm:p-4 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden mb-3">
          <Document
            file={planPdf}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex justify-center shrink-0 drop-shadow-2xl"
            loading={
              <div className="flex flex-col items-center justify-center py-40 h-[600px] w-[400px]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-blue-300 font-medium animate-pulse">Loading...</p>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              height={pageHeight}
              className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-600/30"
            />
          </Document>
        </div>

        {/* Small Bottom Controls (On both sides of the PDF) */}
        <div className="flex items-center justify-between w-full px-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 shadow-md border border-slate-700/70"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Prev</span>
          </button>
          
          <div className="text-slate-400 text-xs font-medium tracking-wide bg-slate-800/40 px-3 py-1 rounded-full border border-slate-700/50">
            {numPages ? `Page ${pageNumber} of ${numPages}` : '...'}
          </div>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages && numPages !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300 shadow shadow-blue-900/50 border border-blue-500/50"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
