import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import planPdf from '../assets/Plan.pdf';

// Initialize PDF.js worker using Vite compatible path
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function Plan() {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      // Calculate a width that fits well but leaves padding for scrollbar
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 24);
      }
    };
    
    // Initial size calculation
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    // trigger width update once loaded
    setTimeout(() => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 24);
      }
    }, 100);
  }

  return (
    <div className="flex flex-col items-center w-full min-h-[80vh] pb-6 fade-in">
      <div className="flex flex-col items-center relative transition-all w-full md:w-[85%] lg:w-[70%]">
        {/* Scrollable PDF Document Viewer */}
        <div 
          ref={containerRef}
          className="flex flex-col items-center bg-slate-800/20 p-2 sm:p-4 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-y-auto w-full custom-scrollbar"
          style={{ height: 'calc(100vh - 140px)', WebkitOverflowScrolling: 'touch' }}
        >
          <Document
            file={planPdf}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center gap-6 shrink-0 drop-shadow-2xl w-full"
            loading={
              <div className="flex flex-col items-center justify-center py-40 h-full w-full">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-blue-300 font-medium animate-pulse">Loading...</p>
              </div>
            }
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <Page 
                key={`page_${index + 1}`}
                pageNumber={index + 1} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={containerWidth}
                className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-600/30"
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
