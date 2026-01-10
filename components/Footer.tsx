import React from 'react';
import { FOOTER_TEXT } from '../constants.ts';

interface FooterProps {
  facebookLink: string;
  twitterLink: string;
  youtubeLink: string;
}

const Footer: React.FC<FooterProps> = ({ facebookLink, twitterLink, youtubeLink }) => {
  // Helper to ensure valid URL
  const getSafeUrl = (url: string) => {
    if (!url) return '#';
    // If it starts with http:// or https://, return as is.
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise prepend https://
    return `https://${url}`;
  };

  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between mb-4 border-b border-gray-700 pb-4">
          <span className="text-sm font-bold text-gray-400 uppercase mb-2 md:mb-0">हामीलाई पछ्याउनुहोस्:</span>
          <div className="flex space-x-4">
            <a 
              href={getSafeUrl(facebookLink)} 
              target={facebookLink ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="Facebook" 
              className={`text-gray-400 hover:text-blue-600 transition-colors ${!facebookLink ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={(e) => !facebookLink && e.preventDefault()}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            
            <a 
              href={getSafeUrl(youtubeLink)} 
              target={youtubeLink ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="YouTube" 
              className={`text-gray-400 hover:text-red-600 transition-colors ${!youtubeLink ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={(e) => !youtubeLink && e.preventDefault()}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.018 3.018 0 0 0-2.122-2.136c-1.547-.417-7.734-.417-7.734-.417H9.358s-6.187 0-7.734.417a3.018 3.018 0 0 0-2.122 2.136C-.417 7.734-.417 12 0 12c-.417 4.266 0 7.734.417 7.734a3.018 3.018 0 0 0 2.122 2.136c1.547.417 7.734.417 7.734.417h6.284s6.187 0 7.734-.417a3.018 3.018 0 0 0 2.122-2.136C24 16.266 24 12 23.498 12c0-4.266 0-7.734-.417-5.814zM9.993 15.341V8.659L15.656 12l-5.663 3.341z"/></svg>
            </a>
            
            <a 
              href={getSafeUrl(twitterLink)} 
              target={twitterLink ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="Twitter" 
              className={`text-gray-400 hover:text-blue-400 transition-colors ${!twitterLink ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={(e) => !twitterLink && e.preventDefault()}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.25 2.25h6.634l4.717 6.175 5.643-6.175Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
            </a>
          </div>
        </div>
        <div className="text-sm md:text-base text-gray-500">
          <p>{FOOTER_TEXT}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;