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
import { NEWS_STATUS, MOCK_USERS, NEWS_PORTAL_SLOGAN } from './constants.ts';

// Firebase Imports
import { db, analytics } from './firebase.ts'; 
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc } from "firebase/firestore";


function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // App Settings State
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [adsenseCode, setAdsenseCode] = useState<string>('');
  const [siteTitle, setSiteTitle] = useState('दृष्टि खबर');
  const [siteSlogan, setSiteSlogan] = useState(NEWS_PORTAL_SLOGAN);
  
  // Contact & Social State
  const [facebookLink, setFacebookLink] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [instagramLink, setInstagramLink] = useState(''); // Added Instagram
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState('सबै');
  const [allNews, setAllNews] = useState<any[]>([]);
  const [users, setUsers] = useState(MOCK_USERS);

  // Firebase: Fetch and listen to news updates and app settings
  useEffect(() => {
    // 1. Fetch and listen to App Settings in real-time
    const settingsDocRef = doc(db, "settings", "app_settings");
    const unsubscribeSettings = onSnapshot(settingsDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const settingsData = docSnap.data();
        setLogoUrl(settingsData.logoUrl || null);
        setAdsenseCode(settingsData.adsenseCode || '');
        setSiteTitle(settingsData.siteTitle || 'दृष्टि खबर');
        setSiteSlogan(settingsData.siteSlogan || NEWS_PORTAL_SLOGAN);
        setFacebookLink(settingsData.facebookLink || '');
        setTwitterLink(settingsData.twitterLink || '');
        setYoutubeLink(settingsData.youtubeLink || '');
        setInstagramLink(settingsData.instagramLink || '');
        setContactEmail(settingsData.contactEmail || '');
        setContactPhone(settingsData.contactPhone || '');
        console.log('Firebase App Settings fetched successfully (real-time).');
      } else {
        // Doc doesn't exist, create with defaults
        console.log('Firebase app_settings document not found. Creating with default values.');
        try {
          await setDoc(settingsDocRef, {
            logoUrl: null,
            adsenseCode: '',
            siteTitle: 'दृष्टि खबर',
            siteSlogan: NEWS_PORTAL_SLOGAN,
            facebookLink: '',
            twitterLink: '',
            youtubeLink: '',
            instagramLink: '',
            contactEmail: '',
            contactPhone: '',
          });
          console.log('Firebase app_settings document created with defaults.');
        } catch (e) {
          console.error('Error creating app_settings document:', e);
        }
      }
      setIsSettingsLoaded(true);
    }, (error) => {
      console.error("Error fetching app settings from Firebase (real-time):", error);
      alert("सेटिङहरू लोड गर्न असफल भयो। कृपया आफ्नो Firebase कन्फिगरेसन जाँच गर्नुहोस् वा नेटवर्क जडान हेर्नुहोस्।");
      setIsSettingsLoaded(true);
    });


    // 2. Fetch and listen to news updates
    // Order by creationTimestamp to get newest news first
    const q = query(collection(db, "news"), orderBy("creationTimestamp", "desc"));
    const unsubscribeNews = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as any
      }));
      setAllNews(newsData);

      if (snapshot.docs.length > 0) {
        console.log('Firebase Firestore connected and initial news data fetched successfully.');
      } else {
        console.log('Firebase Firestore connected, no news found yet.');
      }

      // After loading news, re-check for deep link
      const params = new URLSearchParams(window.location.search);
      const newsId = params.get('news');
      if (newsId) {
        const news = newsData.find(n => n.id === newsId);
        if (news && news.status === NEWS_STATUS.PUBLISHED) {
          setSelectedNews(news);
        }
      }
    }, (error) => {
      console.error("Error fetching news from Firebase:", error);
      alert("समाचार लोड गर्न असफल भयो। कृपया आफ्नो Firebase कन्फिगरेसन जाँच गर्नुहोस् वा नेटवर्क जडान हेर्नुहोस्।");
    });

    return () => {
      unsubscribeSettings();
      unsubscribeNews();
    };
  }, []);

  // Handle Initial Deep Link and Browser Navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get('news');
    if (newsId && allNews.length > 0) {
      const news = allNews.find(n => n.id === newsId);
      if (news && news.status === NEWS_STATUS.PUBLISHED) {
        setSelectedNews(news);
      }
    }

    const handlePopState = () => {
      const updatedParams = new URLSearchParams(window.location.search);
      const updatedId = updatedParams.get('news');
      if (updatedId) {
        const news = allNews.find(n => n.id === updatedId);
        setSelectedNews(news || null);
      } else {
        setSelectedNews(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allNews]);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Firestore Updates
  const handleLogoUpdate = async (newLogoUrl: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { logoUrl: newLogoUrl });
      setLogoUrl(newLogoUrl);
    } catch (e) {
      console.error("Error updating logo URL: ", e);
      alert('लोगो URL अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleAdsenseUpdate = async (code: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { adsenseCode: code });
      setAdsenseCode(code);
    } catch (e) {
      console.error("Error updating adsense code: ", e);
      alert('Adsense कोड अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleSiteTitleUpdate = async (newTitle: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { siteTitle: newTitle });
      setSiteTitle(newTitle);
    } catch (e) {
      console.error("Error updating site title: ", e);
      alert('साइटको शीर्षक अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleSiteSloganUpdate = async (newSlogan: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { siteSlogan: newSlogan });
      setSiteSlogan(newSlogan);
    } catch (e) {
      console.error("Error updating site slogan: ", e);
      alert('साइटको स्लोगन अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleFacebookLinkUpdate = async (link: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { facebookLink: link });
      setFacebookLink(link);
    } catch (e) {
      console.error("Error updating Facebook link: ", e);
      alert('फेसबुक लिङ्क अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleTwitterLinkUpdate = async (link: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { twitterLink: link });
      setTwitterLink(link);
    } catch (e) {
      console.error("Error updating Twitter link: ", e);
      alert('ट्विटर लिङ्क अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleYoutubeLinkUpdate = async (link: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { youtubeLink: link });
      setYoutubeLink(link);
    } catch (e) {
      console.error("Error updating YouTube link: ", e);
      alert('युट्युब लिङ्क अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleInstagramLinkUpdate = async (link: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { instagramLink: link });
      setInstagramLink(link);
    } catch (e) {
      console.error("Error updating Instagram link: ", e);
      alert('इन्स्टाग्राम लिङ्क अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleContactEmailUpdate = async (email: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { contactEmail: email });
      setContactEmail(email);
    } catch (e) {
      console.error("Error updating contact email: ", e);
      alert('सम्पर्क इमेल अपडेट गर्दा त्रुटि भयो।');
    }
  };

  const handleContactPhoneUpdate = async (phone: string) => {
    try {
      await updateDoc(doc(db, "settings", "app_settings"), { contactPhone: phone });
      setContactPhone(phone);
    } catch (e) {
      console.error("Error updating contact phone: ", e);
      alert('सम्पर्क फोन अपडेट गर्दा त्रुटि भयो।');
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
    }
  };

  const handleNewsClose = () => {
    setSelectedNews(null);
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    try {
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (error) {
      console.warn("Could not update URL using history.pushState (on close):", error);
    }
  };

  const handleAddNews = async (newsData: any) => {
    try {
      const { id, ...dataToStore } = newsData; 
      await addDoc(collection(db, "news"), {
        ...dataToStore,
        creationTimestamp: id,
      });
      alert('समाचार सुरक्षित गरियो। सम्पादकले स्वीकृत गरेपछि यो प्रकाशित हुनेछ।');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('समाचार थप्दा त्रुटि भयो।');
    }
  };

  const handleApproveNews = async (newsId: string) => {
    try {
      const newsRef = doc(db, "news", newsId);
      await updateDoc(newsRef, { status: NEWS_STATUS.PUBLISHED });
      alert('समाचार स्वीकृत गरियो।');
    } catch (e) {
      console.error("Error approving news: ", e);
      alert('समाचार स्वीकृत गर्दा त्रुटि भयो।');
    }
  };

  const handleDeleteNews = async (newsId: string) => {
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
        facebookLink={facebookLink}
        onFacebookLinkUpdate={handleFacebookLinkUpdate}
        twitterLink={twitterLink}
        onTwitterLinkUpdate={handleTwitterLinkUpdate}
        youtubeLink={youtubeLink}
        onYoutubeLinkUpdate={handleYoutubeLinkUpdate}
        instagramLink={instagramLink}
        onInstagramLinkUpdate={handleInstagramLinkUpdate}
        contactEmail={contactEmail}
        onContactEmailUpdate={handleContactEmailUpdate}
        contactPhone={contactPhone}
        onContactPhoneUpdate={handleContactPhoneUpdate}
        allNews={allNews}
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
        facebookLink={facebookLink}
        twitterLink={twitterLink}
        youtubeLink={youtubeLink}
        instagramLink={instagramLink}
        isSettingsLoaded={isSettingsLoaded}
      />
      <Navbar 
        logoUrl={logoUrl} 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
        isSettingsLoaded={isSettingsLoaded}
        siteTitle={siteTitle}
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

      <Footer 
        facebookLink={facebookLink}
        twitterLink={twitterLink}
        youtubeLink={youtubeLink}
        instagramLink={instagramLink}
      />

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