import React, { useState, useEffect, useMemo } from 'react';
import { NEWS_STATUS } from '../constants.ts';
import { getExactNepaliDate } from '../utils/nepaliDate.ts';

interface NewsDetailModalProps {
  news: any | null;
  onClose: () => void;
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ news, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  // Logic: 
  // If news is PUBLISHED, show the fixed date stored in the DB.
  // If news is PENDING (or draft), show the CURRENT dynamic date (matching homepage), 
  // because when it gets published, it will seize the current date.
  const displayDate = useMemo(() => {
      if (!news) return '';
      if (news.status === NEWS_STATUS.PUBLISHED && news.date) {
          return news.date;
      }
      return getExactNepaliDate();
  }, [news]);

  // Dynamic Meta Tags for Social Sharing
  useEffect(() => {
    if (!news) return;

    // Save previous title
    const prevTitle = document.title;
    const currentUrl = `${window.location.origin}${window.location.pathname}?news=${news.id}`;
    
    // 1. Update Title
    document.title = `${news.title} | दृष्टि खबर`;

    // 2. Helper to set meta tags
    const setMeta = (selector: string, content: string) => {
        let element = document.querySelector(selector);
        if (!element) {
            element = document.createElement('meta');
            const parts = selector.match(/\[(.*?)=["'](.*?)["']\]/);
            if (parts) {
                element.setAttribute(parts[1], parts[2]);
            }
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    // 3. Set Open Graph (Facebook) Tags
    setMeta('meta[property="og:type"]', 'article');
    setMeta('meta[property="og:title"]', news.title);
    setMeta('meta[property="og:description"]', news.description ? news.description.substring(0, 150) + '...' : '');
    setMeta('meta[property="og:image"]', news.imageUrl);
    setMeta('meta[property="og:url"]', currentUrl);
    setMeta('meta[property="og:site_name"]', 'दृष्टि खबर');

    // 4. Set Twitter Card Tags
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', news.title);
    setMeta('meta[name="twitter:description"]', news.description ? news.description.substring(0, 150) + '...' : '');
    setMeta('meta[name="twitter:image"]', news.imageUrl);

    // Scroll to top when loaded
    window.scrollTo(0, 0);

    return () => {
        document.title = prevTitle;
    };
  }, [news]);

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
    // Attempt to clear news ID from URL
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    try {
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (error) {
      console.warn("Could not update URL using history.pushState (on close):", error);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button and Title Bar */}
      <div className="mb-6 flex items-center justify-between">
         <button 
            onClick={handleCloseClick}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 font-bold transition-colors group"
         >
            <div className="p-2 bg-white border border-gray-200 rounded-full group-hover:border-red-200 group-hover:bg-red-50 shadow-sm">
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </div>
            <span>मुख्य पृष्ठमा फर्कनुहोस्</span>
         </button>
      </div>

      <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Feature Photo - Displayed prominently */}
        {news.imageUrl && (
            <div className="w-full relative">
                <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="w-full h-auto max-h-[70vh] object-contain bg-gray-50" 
                />
            </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
            
            {/* Header Info */}
            <div className="border-b border-gray-100 pb-8 text-center md:text-left">
                <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
                    <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                        {news.category}
                    </span>
                    {news.status === 'प्रकाशित' && (
                         <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1.5 rounded-full border border-green-200">
                            प्रकाशित
                         </span>
                    )}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
                    {news.title}
                </h1>
                
                <div className="flex flex-col md:flex-row items-center md:justify-between text-gray-500 font-medium text-sm md:text-base gap-4">
                     <div className="flex items-center space-x-6">
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            {news.showAuthor ? news.author : 'दृष्टि खबर ब्युरो'}
                        </span>
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {displayDate}
                        </span>
                     </div>
                </div>
            </div>
            
            {/* Body Text */}
            <div className="prose prose-lg md:prose-xl max-w-none text-gray-800 leading-relaxed font-serif">
                <p className="whitespace-pre-wrap">{news.description || 'यो समाचारको थप विवरण अहिले उपलब्ध छैन। कृपया प्रतीक्षा गर्नुहोस्।'}</p>
                
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border-l-4 border-red-600">
                    <p className="italic text-gray-600 font-sans text-base m-0">
                        दृष्टि खबर सधैं सत्य, तथ्य र निष्पक्ष समाचारको संवाहकका रूपमा रहँदै आएको छ । हामी समाजका विविध आयामहरूलाई समेटेर सत्यलाई बाहिर ल्याउन प्रतिबद्ध छौं । 
                    </p>
                </div>
            </div>

             {/* Footer Actions */}
            <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-2 text-gray-500 font-bold">
                    <span>शेयर गर्नुहोस्:</span>
                </div>
                
                <div className="flex items-center space-x-3">
                    {/* FB */}
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:-translate-y-1 transform duration-200">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    {/* Twitter */}
                    <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm hover:-translate-y-1 transform duration-200">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.25 2.25h6.634l4.717 6.175 5.643-6.175Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
                    </a>
                    {/* Copy Link */}
                    <button onClick={handleCopyLink} className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-bold transition-all shadow-sm hover:-translate-y-1 transform duration-200 ${copied ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                        {copied ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <span>कपि भयो</span>
                        </>
                        ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            <span>लिंक कपि</span>
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