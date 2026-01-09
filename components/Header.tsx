import React, { useMemo } from 'react';
import { LIVE_TEXT, LOGIN_TEXT, LOGOUT_TEXT } from '../constants.ts';
import { getExactNepaliDate } from '../utils/nepaliDate.ts';

interface HeaderProps {
  user: any | null;
  onLoginClick: () => void;
  onLogout: () => void;
  logoUrl?: string | null;
  adsenseCode?: string;
  siteTitle: string; 
  siteSlogan: string; 
  isSettingsLoaded: boolean; // New prop for loading state
}

const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout, logoUrl, adsenseCode, siteTitle, siteSlogan, isSettingsLoaded }) => {
  const nepaliDate = useMemo(() => getExactNepaliDate(), []);

  return (
    <header className="bg-white shadow-sm z-30">
      <div className="container mx-auto px-4 py-2">
        {/* Top bar: Live, Date, Login */}
        <div className="flex items-center justify-between text-[10px] md:text-sm text-gray-600 pb-2 border-b border-gray-200">
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="bg-red-600 text-white px-1.5 py-0.5 md:py-1 rounded-sm font-bold text-[9px] md:text-xs animate-pulse shrink-0">{LIVE_TEXT}</span>
            <span className="font-medium whitespace-nowrap truncate">{nepaliDate}</span>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
            {user ? (
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-gray-900 leading-none text-xs md:text-sm">{user.name}</p>
                  <p className="text-[8px] md:text-[10px] text-red-600 font-bold uppercase">{user.role}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-gray-200 text-gray-700 px-2 py-0.5 md:px-3 md:py-1 rounded-sm hover:bg-gray-300 transition-colors duration-200 font-bold text-xs"
                >
                  {LOGOUT_TEXT}
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-blue-700 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-sm hover:bg-blue-800 transition-colors duration-200 font-bold text-xs"
              >
                {LOGIN_TEXT}
              </button>
            )}
          </div>
        </div>

        {/* Banner Area (Logo + Ad) */}
        <div className="flex flex-col lg:flex-row items-center justify-between py-4 md:py-6 gap-4">
          <div className="flex items-center w-full lg:w-auto">
            <div className="w-full h-16 sm:h-24 md:h-32 flex items-center justify-start">
              {!isSettingsLoaded ? (
                // Loading Placeholder for Logo and Title
                <div className="flex items-center space-x-3 w-48 animate-pulse">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-gray-200 rounded-full shrink-0"></div>
                    <div className="space-y-2 flex-grow">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
              ) : logoUrl ? (
                <img src={logoUrl} alt={siteTitle} className="max-w-full h-full object-contain" />
              ) : (
                <div className="flex items-center">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform shrink-0">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <div className="ml-3 md:ml-4">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 italic tracking-tighter leading-none">{siteTitle}</h1>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-bold tracking-widest uppercase mt-1">{siteSlogan}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advertisement Placeholder / AdSense Slot */}
          <div className="w-full lg:w-auto flex justify-center">
            {adsenseCode ? (
               <div 
                 className="w-full max-w-md lg:w-96 h-20 md:h-24 overflow-hidden flex items-center justify-center"
                 dangerouslySetInnerHTML={{ __html: adsenseCode }}
               />
            ) : (
               <div className="w-full max-w-md lg:w-96 h-20 md:h-24 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-[10px] md:text-xs border border-dashed border-gray-300">
                 क्षेत्र विज्ञापनको लागि सुरक्षित छ (९७०x९०)
               </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;