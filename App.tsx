import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import Navbar from './components/Navbar.tsx';
import Advertisement from './components/Advertisement.tsx';
import LatestNewsTicker from './components/LatestNewsTicker.tsx';
import MainNewsSection from './components/MainNewsSection.tsx';
import PopularNewsSidebar from './components/PopularNewsSidebar.tsx';
import Footer from './components/Footer.tsx';
import LoginModal from './components/LoginModal.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import NewsDetailModal from './components/NewsDetailModal.tsx';
import { NEWS_STATUS, MOCK_USERS, NEWS_PORTAL_SLOGAN } from './constants.ts'; // Import NEWS_PORTAL_SLOGAN

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFrJOmRsuP7WwSb1oD1fYSYvBcDJVSNfQ",
  authDomain: "dristi-khabar.firebaseapp.com",
  projectId: "dristi-khabar",
  storageBucket: "dristi-khabar.firebasestorage.app",
  messagingSenderId: "905774533816",
  appId: "1:905774533816:web:bfaf49a1b3bf744f88384d",
  measurementId: "G-HXFJ86GGXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app); // Initialize analytics


function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [adsenseCode, setAdsenseCode] = useState<string>('');
  const [siteTitle, setSiteTitle] = useState('दृष्टि खबर'); // Default site title
  const [siteSlogan, setSiteSlogan] = useState(NEWS_PORTAL_SLOGAN); // Default site slogan
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false); // New state for tracking settings loading
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState('सबै');
  const [allNews, setAllNews] = useState<any[]>([]); // Initialize as empty array
  const [users, setUsers] = useState(MOCK_USERS); // Admin users remain local for now

  // Firebase: Fetch and listen to news updates and app settings
  useEffect(() => {
    // 1. Fetch App Settings
    const settingsDocRef = doc(db, "settings", "app_settings");
    getDoc(settingsDocRef).then(async (docSnap) => {
      if (docSnap.exists()) {
        const settingsData = docSnap.data();
        setLogoUrl(settingsData.logoUrl || null);
        setAdsenseCode(settingsData.adsenseCode || '');
        setSiteTitle(settingsData.siteTitle || 'दृष्टि खबर');
        setSiteSlogan(settingsData.siteSlogan || NEWS_PORTAL_SLOGAN);
        console.log('Firebase App Settings fetched successfully.');
      } else {
        // Doc doesn't exist, create with defaults
        console.log('Firebase app_settings document not found. Creating with default values.');
        try {
          await setDoc(settingsDocRef, {
            logoUrl: null,
            adsenseCode: '',
            siteTitle: 'दृष्टि खबर',
            siteSlogan: NEWS_PORTAL_SLOGAN,
          });
          console.log('Firebase app_settings document created with defaults.');
        } catch (e) {
          console.error('Error creating app_settings document:', e);
        }
      }
      setIsSettingsLoaded(true); // Mark settings as loaded regardless of whether it existed or was created
    }).catch((error) => {
      console.error("Error fetching app settings from Firebase:", error);
      alert("सेटिङहरू लोड गर्न असफल भयो। कृपया आफ्नो Firebase कन्फिगरेसन जाँच गर्नुहोस् वा नेटवर्क जडान हेर्नुहोस्।");
      setIsSettingsLoaded(true); // Still mark as loaded to proceed, even if with error (and default values)
    });


    // 2. Fetch and listen to news updates
    // Order by creationTimestamp to get newest news first
    const q = query(collection(db, "news"), orderBy("creationTimestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id, // Use Firestore's document ID as the primary ID
        ...doc.data() as any // Cast doc.data() to any to include all fields
      }));
      setAllNews(newsData);

      // Log Firebase connection status
      if (snapshot.docs.length > 0) {
        console.log('Firebase Firestore connected and initial news data fetched successfully.');
      } else {
        console.log('Firebase Firestore connected, no news found yet.');
      }

      // After loading news, re-check for deep link
      const params = new URLSearchParams(window.location.search);
      const newsId = params.get('news');
      if (newsId) {
        const news = newsData.find(n => n.id === newsId); // Find by Firestore doc ID (string)
        if (news && news.status === NEWS_STATUS.PUBLISHED) {
          setSelectedNews(news);
        }
      }
    }, (error) => {
      console.error("Error fetching news from Firebase:", error);
      // Optionally, set an error state or display a message to the user
      alert("समाचार लोड गर्न असफल भयो। कृपया आफ्नो Firebase कन्फिगरेसन जाँच गर्नुहोस् वा नेटवर्क जडान हेर्नुहोस्।");
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []); // Empty dependency array to run once on mount

  // Handle Initial Deep Link and Browser Navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get('news');
    if (newsId && allNews.length > 0) { // Ensure allNews is loaded before trying to find news
      const news = allNews.find(n => n.id === newsId); // Find by string ID
      if (news && news.status === NEWS_STATUS.PUBLISHED) {
        setSelectedNews(news);
      }
    }

    const handlePopState = () => {
      const updatedParams = new URLSearchParams(window.location.search);
      const updatedId = updatedParams.get('news');
      if (updatedId) {
        const news = allNews.find(n => n.id === updatedId); // Find by string ID
        setSelectedNews(news || null);
      } else {
        setSelectedNews(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allNews]); // Add allNews to dependency array to re-evaluate when news loads

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Firestore: Update logoUrl
  const handleLogoUpdate = async (newLogoUrl: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { logoUrl: newLogoUrl });
      setLogoUrl(newLogoUrl); // Optimistic update
      console.log('Logo URL updated in Firestore.');
    } catch (e) {
      console.error("Error updating logo URL: ", e);
      alert('लोगो URL अपडेट गर्दा त्रुटि भयो।');
    }
  };

  // Firestore: Update adsenseCode
  const handleAdsenseUpdate = async (code: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { adsenseCode: code });
      setAdsenseCode(code); // Optimistic update
      console.log('Adsense code updated in Firestore.');
    } catch (e) {
      console.error("Error updating adsense code: ", e);
      alert('Adsense कोड अपडेट गर्दा त्रुटि भयो।');
    }
  };

  // Firestore: Update siteTitle
  const handleSiteTitleUpdate = async (newTitle: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { siteTitle: newTitle });
      setSiteTitle(newTitle); // Optimistic update
      console.log('Site Title updated in Firestore.');
    } catch (e) {
      console.error("Error updating site title: ", e);
      alert('साइटको शीर्षक अपडेट गर्दा त्रुटि भयो।');
    }
  };

  // Firestore: Update siteSlogan
  const handleSiteSloganUpdate = async (newSlogan: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { siteSlogan: newSlogan });
      setSiteSlogan(newSlogan); // Optimistic update
      console.log('Site Slogan updated in Firestore.');
    } catch (e) {
      console.error("Error updating site slogan: ", e);
      alert('साइटको स्लोगन अपडेट गर्दा त्रुटि भयो।');
    }
  };


  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleNewsOpen = (news: any) => {
    setSelectedNews(news);
    const newUrl = `${window.location.origin}${window.location.pathname}?news=${news.id}`;
    try {
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (error) {
      console.warn("Could not update URL using history.pushState:", error);
      // Fallback or just ignore if history manipulation is blocked
    }
  };

  const handleNewsClose = () => {
    setSelectedNews(null);
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    try {
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (error) {
      console.warn("Could not update URL using history.pushState (on close):", error);
      // Fallback or just ignore if history manipulation is blocked
    }
  };

  // Firebase: Add new news
  const handleAddNews = async (newsData: any) => {
    try {
      // newsData from AdminDashboard contains a client-generated 'id' (Date.now())
      // We will use this as a 'creationTimestamp' and let Firestore generate the primary ID.
      const { id, ...dataToStore } = newsData; 
      await addDoc(collection(db, "news"), {
        ...dataToStore,
        creationTimestamp: id, // Store the Date.now() as creationTimestamp for ordering
      });
      alert('समाचार सुरक्षित गरियो। सम्पादकले स्वीकृत गरेपछि यो प्रकाशित हुनेछ।');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('समाचार थप्दा त्रुटि भयो।');
    }
  };

  // Firebase: Approve news
  const handleApproveNews = async (newsId: string) => { // newsId is now Firestore doc ID (string)
    try {
      const newsRef = doc(db, "news", newsId);
      await updateDoc(newsRef, { status: NEWS_STATUS.PUBLISHED });
      alert('समाचार स्वीकृत गरियो।');
    } catch (e) {
      console.error("Error approving news: ", e);
      alert('समाचार स्वीकृत गर्दा त्रुटि भयो।');
    }
  };

  // Firebase: Delete news
  const handleDeleteNews = async (newsId: string) => { // newsId is now Firestore doc ID (string)
    if (!window.confirm('के तपाईं पक्का हुनुहुन्छ? यो समाचार स्थायी रूपमा हटाइनेछ।')) {
      return;
    }
    try {
      await deleteDoc(doc(db, "news", newsId));
      alert('समाचार सफलतापूर्वक हटाइयो।');
    } catch (e) {
      console.error("Error deleting news: ", e);
      alert('समाचार हटाउँदा त्रुटि भयो।');
    }
  };

  // User management functions (local state only, not Firebase for now)
  const handleAddUser = (newUser: any) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));
    if (user && user.username === updatedUser.username) {
      setUser(updatedUser);
    }
  };

  const handleDeleteUser = (username: string) => {
    setUsers(prev => prev.filter(u => u.username !== username));
  };

  // Filter published news for public view
  const publishedNews = allNews.filter(news => news.status === NEWS_STATUS.PUBLISHED);
  const tickerNews = publishedNews.filter(news => news.showInTicker);

  if (user) {
    return (
      <AdminDashboard 
        user={user} 
        onLogout={handleLogout} 
        logoUrl={logoUrl} 
        onLogoUpdate={handleLogoUpdate}
        adsenseCode={adsenseCode}
        onAdsenseUpdate={handleAdsenseUpdate}
        siteTitle={siteTitle}
        onSiteTitleUpdate={handleSiteTitleUpdate}
        siteSlogan={siteSlogan}
        onSiteSloganUpdate={handleSiteSloganUpdate}
        allNews={allNews} // All news (published/pending) for admin view
        users={users}
        onAddNews={handleAddNews}
        onApproveNews={handleApproveNews}
        onDeleteNews={handleDeleteNews}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        user={user} 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogout={handleLogout} 
        logoUrl={logoUrl}
        adsenseCode={adsenseCode}
        siteTitle={siteTitle}
        siteSlogan={siteSlogan}
        isSettingsLoaded={isSettingsLoaded} // Pass loading state to Header
      />
      <Navbar 
        logoUrl={logoUrl} 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
        isSettingsLoaded={isSettingsLoaded} // Pass loading state to Navbar
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <Advertisement adsenseCode={adsenseCode} className="mb-8 h-32 md:h-40 lg:h-48" />

        <LatestNewsTicker 
          onNewsClick={handleNewsOpen} 
          newsItems={tickerNews} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="main-news-area">
          <div className="lg:col-span-2">
            <MainNewsSection 
              onNewsClick={handleNewsOpen} 
              activeCategory={activeCategory} 
              newsItems={publishedNews}
            />
            <Advertisement adsenseCode={adsenseCode} className="my-8 h-24 md:h-32" />
          </div>

          <div className="lg:col-span-1">
            <PopularNewsSidebar 
              onNewsClick={handleNewsOpen} 
              newsItems={publishedNews.filter(n => n.isPopular)}
            />
          </div>
        </div>
      </main>

      <Footer />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
        users={users}
      />

      <NewsDetailModal 
        news={selectedNews} 
        onClose={handleNewsClose} 
      />
    </div>
  );
}

export default App;