import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BannerDisplay = ({ 
  targetAudience = 'all', 
  category = null, 
  limit = null,
  showIndicators = true,
  autoPlay = true,
  autoPlayInterval = 5000,
  className = ''
}) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (targetAudience) params.append('targetAudience', targetAudience);
        if (category) params.append('category', category);
        if (limit) params.append('limit', limit);

        const response = await axios.get(`/api/v0/banners/active?${params.toString()}`);
        
        if (response.data.success) {
          setBanners(response.data.data);
        } else {
          setError('Failed to load banners');
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError('Failed to load banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [targetAudience, category, limit]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoPlay, autoPlayInterval]);

  // Handle banner click
  const handleBannerClick = (banner) => {
    if (banner.link) {
      // Track click
      trackBannerClick(banner._id);
      window.open(banner.link, '_blank');
    }
  };

  // Track banner click
  const trackBannerClick = async (bannerId) => {
    try {
      await axios.post(`/api/v0/banners/${bannerId}/click`);
    } catch (error) {
      console.error('Error tracking banner click:', error);
    }
  };

  // Track banner view
  const trackBannerView = async (bannerId) => {
    try {
      await axios.post(`/api/v0/banners/${bannerId}/view`);
    } catch (error) {
      console.error('Error tracking banner view:', error);
    }
  };

  // Track view when banner becomes visible
  useEffect(() => {
    if (banners.length > 0 && currentIndex < banners.length) {
      trackBannerView(banners[currentIndex]._id);
    }
  }, [currentIndex, banners]);

  // Handle indicator click
  const handleIndicatorClick = (index) => {
    setCurrentIndex(index);
  };

  // Handle previous/next navigation
  const handlePrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null; // Don't render anything if no banners or error
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Banner Container */}
      <div className="relative">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          >
            <div
              className="relative cursor-pointer group"
              onClick={() => handleBannerClick(banner)}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Banner Overlay with Content */}
              {(banner.title || banner.description || banner.linkText) && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    {banner.title && (
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        {banner.title}
                      </h2>
                    )}
                    {banner.description && (
                      <p className="text-lg mb-4 max-w-2xl">
                        {banner.description}
                      </p>
                    )}
                    {banner.linkText && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                        {banner.linkText}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
            aria-label="Previous banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
            aria-label="Next banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Banner Info (for debugging - remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Position: {banners[currentIndex]?.position}</div>
          <div>Target: {banners[currentIndex]?.targetAudience}</div>
          <div>Views: {banners[currentIndex]?.views || 0}</div>
          <div>Clicks: {banners[currentIndex]?.clicks || 0}</div>
        </div>
      )}
    </div>
  );
};

export default BannerDisplay;
