import React, { useState, useEffect } from 'react';
import api from '@/utils/axios';
import { useGetAllCategoriesQuery } from '@/store/api/product/productApi';

// Local minimal UI primitives to avoid external dependencies
const Card = ({ children, className = '' }) => (
  <div className={`border rounded bg-white ${className}`}>{children}</div>
);

const Button = ({ children, className = '', onClick, type = 'button', disabled }) => (
  <button type={type} disabled={disabled} onClick={onClick} className={`px-4 py-2 border rounded ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}>
    {children}
  </button>
);

const Icon = ({ className = '' }) => <span className={className} aria-hidden />;

const Textinput = (props) => (
  <input {...props} className={`w-full border rounded px-3 py-2 ${props.className || ''}`} />
);

const Textarea = ({ rows = 3, ...props }) => (
  <textarea {...props} rows={rows} className={`w-full border rounded px-3 py-2 ${props.className || ''}`} />
);

const Select = ({ children, ...props }) => (
  <select {...props} className={`w-full border rounded px-3 py-2 ${props.className || ''}`}>
    {children}
  </select>
);

const Switch = ({ checked, onChange, name }) => (
  <input type="checkbox" name={name} checked={checked} onChange={onChange} />
);

const Modal = ({ activeModal, onClose, title, className = '', children }) => {
  if (!activeModal) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white w-full max-w-3xl rounded p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 border rounded">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique banner categories from existing banners
  const getBannerCategories = () => {
    const categorySet = new Set();
    banners.forEach(banner => {
      if (banner.category && banner.category.trim()) {
        categorySet.add(banner.category.trim());
      }
    });
    return Array.from(categorySet).sort();
  };

  const bannerCategories = getBannerCategories();

  // Form state
  const [formData, setFormData] = useState({
    position: 0,
    isActive: true,
    category: '',
    bannerType: 'image' // 'image' or 'video'
  });
  
  const [positionError, setPositionError] = useState('');

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/banners', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
        }
      });
      if (response.data.success) {
        setBanners(response.data.data.banners || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage, searchTerm, filterStatus]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Pick image file & preview (upload happens on submit)
  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Image size should be less than 8MB');
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  // Pick video file & preview
  const handleVideoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('Video size should be less than 100MB');
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  // Check if position is already taken for the category
  const checkPositionExists = (category, position) => {
    if (!category || !position) return false;
    return banners.some(banner => 
      banner.category === category && 
      banner.position === Number(position) &&
      banner._id !== editingBanner?._id
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isVideoBanner = formData.category === 'video-banner';
    
    if (isVideoBanner) {
      if (!videoFile) {
        alert('Please choose a video file');
        return;
      }
      if (!imageFile) {
        alert('Please choose a thumbnail image for the video');
        return;
      }
    } else {
      if (!imageFile) {
        alert('Please choose an image');
        return;
      }
    }
    
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    
    // Check if position is already taken
    if (checkPositionExists(formData.category, formData.position)) {
      setPositionError(`Position ${formData.position} is already set for category "${formData.category}". Please change the position.`);
      return;
    }
    
    setPositionError('');
    setUploading(true);
    try {
      // 1) upload image (thumbnail for video banners)
      const fd = new FormData();
      fd.append('image', imageFile);
      const uploadRes = await api.post('/images/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!uploadRes.data?.success) throw new Error('Image upload failed');
      const img = uploadRes.data.data;

      let videoData = null;
      
      // 2) upload video if it's a video banner
      if (isVideoBanner && videoFile) {
        const videoFd = new FormData();
        videoFd.append('video', videoFile);
        const videoUploadRes = await api.post('/images/upload-video', videoFd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 300000, // 5 minute timeout for video uploads
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Video upload progress: ${percentCompleted}%`);
          }
        });
        if (!videoUploadRes.data?.success) throw new Error('Video upload failed');
        videoData = videoUploadRes.data.data;
      }

      // 3) save banner
      const payload = {
        position: Number(formData.position) || 0,
        isActive: !!formData.isActive,
        category: formData.category,
        bannerType: isVideoBanner ? 'video' : 'image',
        imageUrl: img.url,
        publicId: img.public_id,
        imageWidth: img.width,
        imageHeight: img.height,
        imageFormat: img.format,
        imageBytes: img.bytes,
        ...(videoData && {
          videoUrl: videoData.url,
          videoPublicId: videoData.public_id,
          videoThumbnail: img.url
        })
      };
      const createRes = await api.post('/banners', payload);
      if (!createRes.data?.success) throw new Error('Banner save failed');

      resetForm();
      setUploaderOpen(false);
      await fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      let errorMessage = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Failed to save';
      
      // Add more context for common errors
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. Please try with a smaller video file.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Maximum video size is 100MB.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during upload. Please try again.';
      }
      
      if (errorMessage.includes('position') || errorMessage.includes('Position')) {
        setPositionError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      position: 0,
      isActive: true,
      category: '',
      bannerType: 'image'
    });
    setImagePreview(null);
    setImageFile(null);
    setVideoPreview(null);
    setVideoFile(null);
    setEditingBanner(null);
    setPositionError('');
  };

  // Group banners by category
  const groupBannersByCategory = () => {
    const grouped = {};
    banners.forEach(banner => {
      const category = banner.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(banner);
    });
    return grouped;
  };

  // Get filtered and grouped banners
  const getFilteredBanners = () => {
    let filtered = banners;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(banner => 
        filterStatus === 'active' ? banner.isActive : !banner.isActive
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(banner => 
        (banner.category || 'Uncategorized') === selectedCategory
      );
    }
    
    return filtered;
  };

  // Open inline uploader for creating new banner
  const openCreateModal = () => {
    resetForm();
    setUploaderOpen(true);
  };

  // Open modal for editing banner
  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      position: banner.position,
      isActive: banner.isActive,
      category: banner.category || '',
    });
    setImagePreview(banner.imageUrl);
    setShowModal(true);
    setPositionError('');
  };

  // Delete banner
  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await api.delete(`/banners/${bannerId}`);

      if (response.data.success) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  // Toggle banner status
  const handleToggleStatus = async (bannerId, currentStatus) => {
    try {
      const response = await api.patch(`/banners/${bannerId}/toggle`);

      if (response.data.success) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      alert('Failed to update banner status');
    }
  };

  // Update banner position
  const handlePositionUpdate = async (bannerId, newPosition) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(`/api/v0/banners/${bannerId}/position`, {
        position: newPosition
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Banner position updated successfully');
        fetchBanners();
      }
    } catch (error) {
      console.error('Error updating banner position:', error);
      toast.error('Failed to update banner position');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600">Manage your website banners and promotional content</p>
        </div>
        <Button 
          onClick={openCreateModal} 
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
          Add New Banner
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {bannerCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Banners</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Inline Uploader */}
      {uploaderOpen && (
        <div className="p-4 border rounded space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Create New Banner</h2>
            <button className="text-sm" onClick={()=>setUploaderOpen(false)}>Close</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Category <span className="text-red-500">*</span></label>
              <Select
                name="category"
                value={formData.category}
                onChange={(e) => {
                  handleInputChange(e);
                  // Reset video file when category changes
                  if (e.target.value !== 'video-banner') {
                    setVideoFile(null);
                    setVideoPreview(null);
                  }
                }}
                required
              >
                <option value="">Select Category</option>
                <option value="main">Main</option>
                <option value="offer&deals">Offer & Deals</option>
                <option value="ecommerce">Ecommerce</option>
                <option value="top-collections">Top Collections</option>
                <option value="video-banner">Video Banner</option>
              </Select>
              {formData.category === 'video-banner' && (
                <p className="text-xs text-blue-600 mt-1">Video banners will be displayed under Top Collections section in the app</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Position <span className="text-red-500">*</span></label>
              <Textinput 
                type="number" 
                name="position" 
                value={formData.position} 
                onChange={(e) => {
                  handleInputChange(e);
                  setPositionError(''); // Clear error when position changes
                }}
                min="0"
                required
              />
              {positionError && (
                <p className="text-red-500 text-xs mt-1">{positionError}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch name="isActive" checked={formData.isActive} onChange={handleInputChange} />
              <span className="text-sm">Active</span>
            </div>
            {formData.category === 'video-banner' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Video File <span className="text-red-500">*</span></label>
                  <input type="file" accept="video/*" onChange={handleVideoPick} />
                  {videoPreview && (
                    <video 
                      src={videoPreview} 
                      controls 
                      className="mt-3 h-40 object-cover rounded w-full"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">Thumbnail Image <span className="text-red-500">*</span></label>
                  <input type="file" accept="image/*" onChange={handleFilePick} />
                  {imagePreview && <img src={imagePreview} alt="thumbnail preview" className="mt-3 h-40 object-cover rounded" />}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm mb-1">Banner Image <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*" onChange={handleFilePick} />
                {imagePreview && <img src={imagePreview} alt="preview" className="mt-3 h-40 object-cover rounded" />}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={()=>{resetForm(); setUploaderOpen(false);}}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-blue-600 text-white" 
                disabled={uploading || !imageFile || (formData.category === 'video-banner' && !videoFile)}
              >
                {uploading ? 'Uploading...' : 'Save Banner'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Banners Grid - Grouped by Category */}
      {(() => {
        const filteredBanners = getFilteredBanners();
        const groupedBanners = groupBannersByCategory();
        const filteredGrouped = {};
        
        // Filter grouped banners based on selected category and status
        Object.keys(groupedBanners).forEach(category => {
          if (selectedCategory === 'all' || category === selectedCategory) {
            filteredGrouped[category] = groupedBanners[category].filter(banner => {
              if (filterStatus === 'all') return true;
              return filterStatus === 'active' ? banner.isActive : !banner.isActive;
            });
            // Only add category if it has banners after filtering
            if (filteredGrouped[category].length === 0) {
              delete filteredGrouped[category];
            }
          }
        });

        if (filteredBanners.length === 0) {
          return (
        <Card className="p-8 text-center">
          <Icon icon="heroicons:photo" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Banners Found</h3>
          <p className="text-gray-600 mb-4">
                {selectedCategory !== 'all' || filterStatus !== 'all'
              ? 'No banners match your current filters.' 
              : 'Get started by creating your first banner.'}
          </p>
              {selectedCategory === 'all' && filterStatus === 'all' && (
            <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
              <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
              Create Your First Banner
            </Button>
          )}
        </Card>
          );
        }

        return (
          <div className="space-y-8">
            {Object.keys(filteredGrouped).map((category) => {
              const categoryBanners = filteredGrouped[category];
              if (categoryBanners.length === 0) return null;
              
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-lg font-bold text-gray-900 uppercase">
  {category}

                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({categoryBanners.length} {categoryBanners.length === 1 ? 'banner' : 'banners'})
                      </span>
                    </h2>
                  </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryBanners.map((banner) => (
          <Card key={banner._id} className="overflow-hidden">
            <div className="relative">
              {banner.bannerType === 'video' && banner.videoUrl ? (
                <video
                  src={banner.videoUrl}
                  poster={banner.videoThumbnail || banner.imageUrl}
                  className="w-full h-48 object-cover"
                  muted
                  loop
                  onMouseOver={(e) => e.target.play()}
                  onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                />
              ) : (
                <img
                  src={banner.imageUrl}
                  alt={banner.category || 'Banner'}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {banner.bannerType === 'video' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Video
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  banner.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
                          {/* <h3 className="font-semibold uppercase text-lg text-gray-900 mb-2">{banner.category || 'Uncategorized'}</h3> */}
              {banner.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{banner.description}</p>
              )}
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span>{banner.position}</span>
                </div>
                            {banner.targetAudience && (
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="capitalize">{banner.targetAudience}</span>
                </div>
                            )}
                  {/* <div className="flex justify-between">
                    <span>Category:</span>
                              <span className="font-medium">{category}</span>
                  </div>
                <div className="flex justify-between">
                  <span>Views:</span>
                  <span>{banner.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clicks:</span>
                  <span>{banner.clicks || 0}</span>
                </div> */}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleToggleStatus(banner._id, banner.isActive)}>
                  {banner.isActive ? 'Set Inactive' : 'Set Active'}
                </Button>
                <Button onClick={() => handleDelete(banner._id)} className="text-red-600">
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Removed modal; using inline uploader above */}
    </div>
  );
};

export default Banners;
