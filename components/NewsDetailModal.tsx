import React, { useState } from 'react';

interface NewsDetailModalProps {
  news: any | null;
  onClose: () => void;
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ news, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!news) return null;

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?news=${news.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareText = encodeURIComponent(news.title);
  const shareUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}?news=${news.id}`);

  const handleCloseClick = () => {
    onClose();
    // Attempt to clear news ID from URL, with error handling
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    try {
      window.history.replaceState({ path: newUrl }, '', newUrl);
    } catch (error) {
      console.warn("Could not update URL using history.replaceState (on close):", error);
      // Fallback or just ignore if history manipulation is blocked
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        {/* Close Button - Sticky */}
        <div className="absolute top-4 right-4 z-20">
            <button 
            onClick={handleCloseClick}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-md"
            >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-grow">
            {/* Feature Photo - Now clearly visible at the top */}
            {news.imageUrl && (
                <div className="w-full bg-gray-100 flex items-center justify-center border-b border-gray-100">
                    <img 
                    src={news.imageUrl} 
                    alt={news.title} 
                    className="w-full h-auto max-h-[60vh] object-contain" 
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6">
                
                {/* Header Info */}
                <div className="border-b border-gray-100 pb-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            {news.category}
                        </span>
                        {/* Optional Status Badge if needed */}
                        {news.status === 'प्रकाशित' && (
                             <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                                प्रकाशित
                             </span>
                        )}
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                        {news.title}
                    </h2>
                    
                    <div className="flex items-center text-sm text-gray-500 font-medium space-x-4 mt-4">
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {news.date || '२०८१ फागुन २३'}
                        </span>
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            {news.showAuthor ? news.author : 'दृष्टि खबर ब्युरो'}
                        </span>
                    </div>
                </div>
                
                {/* Body Text */}
                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-serif">
                    <p className="whitespace-pre-wrap">{news.description || 'यो समाचारको थप विवरण अहिले उपलब्ध छैन। कृपया प्रतीक्षा गर्नुहोस्।'}</p>
                    <p className="mt-6 border-l-4 border-red-600 pl-4 italic text-gray-500 font-sans text-base">
                        दृष्टि खबर सधैं सत्य, तथ्य र निष्पक्ष समाचारको संवाहकका रूपमा रहँदै आएको छ । हामी समाजका विविध आयामहरूलाई समेटेर सत्यलाई बाहिर ल्याउन प्रतिबद्ध छौं । 
                    </p>
                </div>
            </div>
        </div>

        {/* Footer Actions (Sticky Bottom) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <button 
                onClick={handleCloseClick}
                className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
            >
                बन्द गर्नुहोस्
            </button>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-end">
                <span className="text-xs font-bold text-gray-400 uppercase hidden sm:inline">शेयर गर्नुहोस्:</span>
                <div className="flex space-x-2">
                {/* FB */}
                <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                {/* Twitter */}
                <a 
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.25 2.25h6.634l4.717 6.175 5.643-6.175Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
                </a>
                {/* Copy Link */}
                <button 
                    onClick={handleCopyLink}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all shadow-sm ${copied ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                >
                    {copied ? (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>कपि भयो</span>
                    </>
                    ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        <span>लिंक</span>
                    </>
                    )}
                </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailModal;