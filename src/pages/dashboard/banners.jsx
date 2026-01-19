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
    title: '',
    position: 0,
    isActive: true,
    category: ''
  });

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

  // Pick file & preview (upload happens on submit)
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert('Please choose an image');
      return;
    }
    setUploading(true);
    try {
      // 1) upload image
      const fd = new FormData();
      fd.append('image', imageFile);
      const uploadRes = await api.post('/images/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!uploadRes.data?.success) throw new Error('Image upload failed');
      const img = uploadRes.data.data;

      // 2) save banner
      const payload = {
        title: formData.title,
        position: Number(formData.position) || 0,
        isActive: !!formData.isActive,
        category: formData.category || undefined,
        imageUrl: img.url,
        publicId: img.public_id,
        imageWidth: img.width,
        imageHeight: img.height,
        imageFormat: img.format,
        imageBytes: img.bytes
      };
      const createRes = await api.post('/banners', payload);
      if (!createRes.data?.success) throw new Error('Banner save failed');

      resetForm();
      setUploaderOpen(false);
      await fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert(error?.response?.data?.message || error.message || 'Failed to save');
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      position: 0,
      isActive: true,
      category: ''
    });
    setImagePreview(null);
    setImageFile(null);
    setEditingBanner(null);
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
      title: banner.title,
      description: banner.description || '',
      link: banner.link || '',
      linkText: banner.linkText || '',
      position: banner.position,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      targetAudience: banner.targetAudience,
      category: banner.category || '',
      tags: banner.tags ? banner.tags.join(', ') : '',
      imageUrl: banner.imageUrl || '',
      publicId: banner.publicId || '',
      imageWidth: banner.imageWidth || '',
      imageHeight: banner.imageHeight || '',
      imageFormat: banner.imageFormat || '',
      imageBytes: banner.imageBytes || ''
    });
    setImagePreview(banner.imageUrl);
    setShowModal(true);
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
              <label className="block text-sm mb-1">Title (optional)</label>
              <Textinput name="title" value={formData.title} onChange={handleInputChange} placeholder="Banner title" />
            </div>
            <div>
              <label className="block text-sm mb-1">Position</label>
              <Textinput type="number" name="position" value={formData.position} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm mb-1">Category</label>
              <Textinput 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange}
                placeholder="Enter category name (e.g., main, top-collections, ecommerce)"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {bannerCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
                <option value="main" />
                <option value="top-collections" />
                <option value="ecommerce" />
                <option value="offer&deals" />
                <option value="home" />
                <option value="featured" />
              </datalist>
            </div>
            <div className="flex items-center gap-2">
              <Switch name="isActive" checked={formData.isActive} onChange={handleInputChange} />
              <span className="text-sm">Active</span>
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleFilePick} />
              {imagePreview && <img src={imagePreview} alt="preview" className="mt-3 h-40 object-cover rounded" />}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={()=>{resetForm(); setUploaderOpen(false);}}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 text-white" disabled={uploading || !imageFile}>{uploading ? 'Saving...' : 'Save Banner'}</Button>
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
                    <h2 className="text-xl font-bold text-gray-900">
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
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
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
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">{banner.title || 'Untitled'}</h3>
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
                  <div className="flex justify-between">
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
                </div>
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
