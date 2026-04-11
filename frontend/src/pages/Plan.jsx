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
  const [searchPage, setSearchPage] = useState('');
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

  const handleSearch = (e) => {
    e.preventDefault();
    const pageNum = parseInt(searchPage);
    if (pageNum > 0 && pageNum <= numPages) {
       const el = document.getElementById(`pdf-page-${pageNum}`);
       if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
       }
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[80vh] pb-6 fade-in">
      <div className="flex flex-col items-center relative transition-all w-full md:w-[85%] lg:w-[70%] gap-4">
        
        {/* Search Bar */}
        <div className="w-full flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-md shadow-lg">
           <div className="font-semibold text-slate-200">
             Plan Viewer {numPages && <span className="text-sm text-slate-400 font-normal ml-2">({numPages} pages total)</span>}
           </div>
           <form onSubmit={handleSearch} className="flex gap-2">
             <input
               type="number"
               min="1"
               max={numPages || 1}
               value={searchPage}
               onChange={(e) => setSearchPage(e.target.value)}
               placeholder="Page #"
               className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
             />
             <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 active:scale-95">
                Go
             </button>
           </form>
        </div>

        {/* Scrollable PDF Document Viewer */}
        <div 
          ref={containerRef}
          className="flex flex-col items-center bg-slate-800/20 p-2 sm:p-4 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-y-auto w-full custom-scrollbar"
          style={{ height: 'calc(100vh - 200px)', WebkitOverflowScrolling: 'touch' }}
        >
          <Document
            file={planPdf}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center gap-6 shrink-0 drop-shadow-2xl w-full"
            loading={
              <div className="flex flex-col items-center justify-center py-40 h-full w-full">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-300 font-medium animate-pulse">Loading...</p>
              </div>
            }
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div id={`pdf-page-${index + 1}`} key={`page_${index + 1}`} className="w-full flex justify-center scroll-mt-4">
                <Page 
                  pageNumber={index + 1} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={containerWidth}
                  className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-600/30"
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
