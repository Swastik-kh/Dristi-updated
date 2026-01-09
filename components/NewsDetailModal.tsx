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
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button 
          onClick={handleCloseClick}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="flex flex-col">
          {/* Header Image */}
          <div className="w-full h-64 md:h-96 relative flex items-center justify-center bg-gray-100"> {/* Added flex, items-center, justify-center, bg-gray-100 */}
            <img 
              src={news.imageUrl} 
              alt={news.title} 
              className="max-w-full max-h-full object-contain" // Changed to object-contain, using max-w/h-full to ensure it fits
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {news.category}
              </span>
              <h2 className="text-white text-2xl md:text-3xl font-black mt-2 leading-tight">
                {news.title}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center text-sm text-gray-500 font-medium space-x-4">
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
            
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-medium">
              <p className="whitespace-pre-wrap">{news.description || 'यो समाचारको थप विवरण अहिले उपलब्ध छैन। कृपया प्रतीक्षा गर्नुहोस्।'}</p>
              <p className="mt-4 border-l-4 border-red-600 pl-4 italic text-gray-500">
                दृष्टि खबर सधैं सत्य, तथ्य र निष्पक्ष समाचारको संवाहकका रूपमा रहँदै आएको छ । हामी समाजका विविध आयामहरूलाई समेटेर सत्यलाई बाहिर ल्याउन प्रतिबद्ध छौं । 
              </p>
            </div>

            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
               <button 
                 onClick={handleCloseClick}
                 className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2 rounded-lg transition-all"
               >
                 बन्द गर्नुहोस्
               </button>
               
               <div className="flex items-center space-x-3">
                 <span className="text-xs font-bold text-gray-400 uppercase">शेयर गर्नुहोस्:</span>
                 <div className="flex space-x-2">
                   {/* FB */}
                   <a 
                     href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="p-2 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform"
                   >
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                   </a>
                   {/* Twitter */}
                   <a 
                     href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="p-2 bg-black text-white rounded-full hover:scale-110 transition-transform"
                   >
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.25 2.25h6.634l4.717 6.175 5.643-6.175Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
                   </a>
                   {/* Copy Link */}
                   <button 
                     onClick={handleCopyLink}
                     className={`flex items-center space-x-1 px-3 py-2 rounded-full font-bold text-xs transition-all ${copied ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                   >
                     {copied ? (
                       <>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                         <span>कपि भयो</span>
                       </>
                     ) : (
                       <>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                         <span>लिंक कपि</span>
                       </>
                     )}
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailModal;