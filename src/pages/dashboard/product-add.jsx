import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddProductMutation, useUpdateProductMutation, useGetProductByIdQuery, useGetAllCategoriesQuery } from '@/store/api/product/productApi';
import { useUploadMultipleImagesMutation, useUploadSingleImageMutation } from '@/store/api/image/imageApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import Card from '@/components/ui/Card';

// Component for managing product detail attributes dynamically
const ProductDetailItem = ({ detail, index, onUpdateDetail, onRemove }) => {
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  const handleTypeChange = (value) => {
    onUpdateDetail({ ...detail, type: value });
  };

  const handleAttributeChange = (key, value) => {
    const updatedAttributes = { ...detail.attributes, [key]: value };
    onUpdateDetail({ ...detail, attributes: updatedAttributes });
  };

  const addAttribute = () => {
    if (newAttrKey.trim()) {
      const updatedAttributes = { ...detail.attributes, [newAttrKey]: newAttrValue };
      onUpdateDetail({ ...detail, attributes: updatedAttributes });
      setNewAttrKey('');
      setNewAttrValue('');
    }
  };

  const removeAttribute = (key) => {
    const updatedAttributes = { ...detail.attributes };
    delete updatedAttributes[key];
    onUpdateDetail({ ...detail, attributes: updatedAttributes });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type (e.g., Metal, Stone)
        </label>
        <input
          type="text"
          value={detail.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          placeholder="e.g., Metal, Stone"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Attributes
          </label>
          <span className="text-xs text-gray-500">
            {Object.keys(detail.attributes || {}).length} attributes
          </span>
        </div>
        
        {/* Display existing attributes */}
        <div className="space-y-2 mb-3">
          {Object.entries(detail.attributes || {}).map(([key, value]) => (
            <div key={key} className="flex gap-2 items-center bg-gray-50 dark:bg-slate-800 p-2 rounded">
              <input
                type="text"
                value={key}
                readOnly
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-slate-700 dark:text-white"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => removeAttribute(key)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Icon icon="ph:x" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new attribute */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newAttrKey}
            onChange={(e) => setNewAttrKey(e.target.value)}
            placeholder="Attribute name (e.g., karatage, name)"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
          <input
            type="text"
            value={newAttrValue}
            onChange={(e) => setNewAttrValue(e.target.value)}
            placeholder="Value"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
          <button
            type="button"
            onClick={addAttribute}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Icon icon="ph:plus" />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onRemove}
          className="btn btn-sm btn-outline-danger"
        >
          <Icon icon="ph:trash" className="mr-2" />
          Remove Detail
        </Button>
      </div>
    </div>
  );
};

const ProductAdd = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    active: true,
    stock: 0,
    CurrentlyNotavaiable: false,
    categories: '',
    popular: false,
    trending: false,
    categoryId: '',
    skuId: '',
    rating: {
      value: 0,
      count: 0
    },
    selectedCaret: '',
    productDetails: [],
    priceDetails: [],
    subtotal: {
      weight: ''
    },
    Discount: 0,
    isDiscountAvaiable: false,
    gst: 0,
    images: []
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadMultipleImages, { isLoading: isUploadingImage }] = useUploadMultipleImagesMutation();
  const [uploadSingleImage] = useUploadSingleImageMutation();
  const { data: productResponse, isLoading: isLoadingProduct, error: productError } = useGetProductByIdQuery(id, { skip: !isEdit });
  const { data: categoriesResponse } = useGetAllCategoriesQuery();

  const categories = categoriesResponse?.data?.categories ?? categoriesResponse?.categories ?? categoriesResponse?.data ?? [];

  // Extract product from API response - handle different response structures
  const product = React.useMemo(() => {
    if (!productResponse) return null;
    
    // Handle different possible response structures
    if (productResponse?.products && Array.isArray(productResponse.products)) {
      return productResponse.products[0]; // If it's an array, take the first item
    } else if (productResponse?.product) {
      return productResponse.product; // If it's a single product object
    } else if (productResponse?.data) {
      return productResponse.data; // If it's nested in data
    } else if (productResponse && typeof productResponse === 'object') {
      return productResponse; // If the response is the product itself
    }
    return null;
  }, [productResponse]);

  // Debug logging
  useEffect(() => {
    if (isEdit) {
      console.log('Edit Mode Debug:', {
        id,
        isLoadingProduct,
        productError,
        productResponse,
        extractedProduct: product
      });
    }
  }, [isEdit, id, isLoadingProduct, productError, productResponse, product]);

  useEffect(() => {
    if (isEdit && product) {
      console.log('Prefilling form with product data:', product);
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        description: product.description || '',
        active: product.active ?? true,
        stock: product.stock || 0,
        CurrentlyNotavaiable: product.CurrentlyNotavaiable || false,
        categories: product.categories || '',
        popular: product.popular || false,
        trending: product.trending || false,
        categoryId: product.categoryId || '',
        skuId: product.skuId || '',
        rating: product.rating || { value: 0, count: 0 },
        selectedCaret: product.selectedCaret || '',
        productDetails: product.productDetails || [],
        priceDetails: product.priceDetails || [],
        subtotal: product.subtotal || { weight: '' },
        Discount: product.Discount || 0,
        isDiscountAvaiable: product.isDiscountAvaiable || false,
        gst: product.gst || 0,
        images: product.images || []
      });
      setUploadedImages(product.images || []);
    }
  }, [isEdit, product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log('Files selected:', files.length, files);
    setIsUploading(true);

    try {
      // Try multiple images upload first
      try {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`images`, file);
        });
        
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        const response = await uploadMultipleImages(formData).unwrap();
        console.log('Multiple upload response:', response);
        
        // Handle different response formats
        let imageUrls = [];
        
        if (response.urls && Array.isArray(response.urls)) {
          imageUrls = response.urls;
        } else if (response.data && Array.isArray(response.data)) {
          imageUrls = response.data;
        } else if (response.images && Array.isArray(response.images)) {
          imageUrls = response.images;
        } else if (Array.isArray(response)) {
          imageUrls = response;
        } else if (response.url) {
          imageUrls = [response.url];
        } else {
          throw new Error('Unexpected response format from multiple upload');
        }
        
        if (imageUrls.length > 0) {
          // Extract URLs from objects if they have url property
          const extractedUrls = imageUrls.map(img => {
            if (typeof img === 'string') {
              return img;
            } else if (img && img.url) {
              return img.url;
            }
            return img;
          });
          
          setUploadedImages(prev => [...prev, ...extractedUrls]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...extractedUrls]
          }));
          
          toast.success(`${extractedUrls.length} image(s) uploaded successfully`);
          return;
        }
      } catch (multipleError) {
        console.log('Multiple upload failed, trying single uploads:', multipleError);
        
        // Fallback to single image uploads
        const uploadedUrls = [];
        for (const file of files) {
          try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await uploadSingleImage(formData).unwrap();
            console.log('Single upload response:', response);
            
            if (response.url) {
              uploadedUrls.push(response.url);
            } else if (response.data && response.data.url) {
              uploadedUrls.push(response.data.url);
            } else if (response.imageUrl) {
              uploadedUrls.push(response.imageUrl);
            } else if (response.data && typeof response.data === 'string') {
              uploadedUrls.push(response.data);
            }
          } catch (singleError) {
            console.error(`Failed to upload ${file.name}:`, singleError);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
        
        if (uploadedUrls.length > 0) {
          setUploadedImages(prev => [...prev, ...uploadedUrls]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
          }));
          
          toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
        } else {
          toast.error('Failed to upload any images');
        }
      }
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Add handlers for dynamic fields
  const addProductDetail = () => {
    setFormData(prev => ({
      ...prev,
      productDetails: [...prev.productDetails, { type: '', attributes: {} }]
    }));
  };

  const removeProductDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      productDetails: prev.productDetails.filter((_, i) => i !== index)
    }));
  };

  const addPriceDetail = () => {
    setFormData(prev => ({
      ...prev,
      priceDetails: [...prev.priceDetails, { name: '', weight: '', value: '' }]
    }));
  };

  const removePriceDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      priceDetails: prev.priceDetails.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        stock: parseInt(formData.stock) || 0,
        rating: {
          value: parseFloat(formData.rating.value) || 0,
          count: parseInt(formData.rating.count) || 0
        },
        subtotal: {
          weight: formData.subtotal.weight
        },
        Discount: parseFloat(formData.Discount) || 0,
        gst: parseFloat(formData.gst) || 0
      };
      
      console.log('Submitting product data:', submitData);
      console.log('Images array:', submitData.images);
      
      // Ensure all images are strings
      submitData.images = submitData.images.map(img => {
        if (typeof img === 'string') {
          return img;
        } else if (img && img.url) {
          return img.url;
        }
        return String(img);
      });
      
      console.log('Processed images:', submitData.images);

      if (isEdit) {
        await updateProduct({ id, ...submitData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await addProduct(submitData).unwrap();
        toast.success('Product added successfully');
      }
      
      navigate('/products');
    } catch (error) {
      console.log('Submit error:', error);
      toast.error(error.data?.message || 'Failed to save product');
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading product...</p>
      </div>
    );
  }

  if (isEdit && productError) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Icon icon="ph:warning-circle" className="text-4xl text-red-500 mb-4" />
        <p className="text-red-500 text-lg mb-2">Failed to load product</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{productError?.data?.message || 'Product not found'}</p>
        <Button onClick={() => navigate('/products')} className="btn btn-outline">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  if (isEdit && !product) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Icon icon="ph:magnifying-glass" className="text-4xl text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">Product not found</p>
        <Button onClick={() => navigate('/products')} className="btn btn-outline">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update product information' : 'Create a new product'}
          </p>
        </div>
        <Button
          onClick={() => navigate('/products')}
          className="btn btn-outline"
        >
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Products
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card title="Product Information">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU ID *
                  </label>
                  <input
                    type="text"
                    name="skuId"
                    value={formData.skuId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="categories"
                    value={formData.categories}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Id *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                        categories: categories.find(c => c._id === e.target.value)?.name || ''
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select Category Id</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Status and Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="CurrentlyNotavaiable"
                      checked={formData.CurrentlyNotavaiable}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Currently Not Available
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={formData.popular}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Popular
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="trending"
                      checked={formData.trending}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Trending
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating Value
                    </label>
                    <input
                      type="number"
                      name="rating.value"
                      value={formData.rating.value}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating Count
                    </label>
                    <input
                      type="number"
                      name="rating.count"
                      value={formData.rating.count}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Selected Caret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Caret
                </label>
                <input
                  type="text"
                  name="selectedCaret"
                  value={formData.selectedCaret}
                  onChange={handleInputChange}
                  placeholder="e.g., 24K"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Pricing Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pricing & Discount</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subtotal Weight
                    </label>
                    <input
                      type="text"
                      name="subtotal.weight"
                      value={formData.subtotal.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.96g"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="Discount"
                      value={formData.Discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GST (%)
                    </label>
                    <input
                      type="number"
                      name="gst"
                      value={formData.gst}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDiscountAvaiable"
                      checked={formData.isDiscountAvaiable}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Discount Available
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Details</h3>
                  <Button
                    type="button"
                    onClick={addProductDetail}
                    className="btn btn-sm btn-outline"
                  >
                    <Icon icon="ph:plus" className="mr-2" />
                    Add Product Detail
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.productDetails.map((detail, index) => (
                    <ProductDetailItem
                      key={index}
                      detail={detail}
                      index={index}
                      onUpdateDetail={(updatedDetail) => {
                        const newDetails = [...formData.productDetails];
                        newDetails[index] = updatedDetail;
                        setFormData(prev => ({ ...prev, productDetails: newDetails }));
                      }}
                      onRemove={() => removeProductDetail(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Price Details */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Price Details</h3>
                  <Button
                    type="button"
                    onClick={addPriceDetail}
                    className="btn btn-sm btn-outline"
                  >
                    <Icon icon="ph:plus" className="mr-2" />
                    Add Price Detail
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.priceDetails.map((detail, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={detail.name}
                        onChange={(e) => {
                          const newDetails = [...formData.priceDetails];
                          newDetails[index] = { ...detail, name: e.target.value };
                          setFormData(prev => ({ ...prev, priceDetails: newDetails }));
                        }}
                        placeholder="Name (e.g., Gold, Stone, Making Charges)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                      <input
                        type="text"
                        value={detail.weight || ''}
                        onChange={(e) => {
                          const newDetails = [...formData.priceDetails];
                          newDetails[index] = { ...detail, weight: e.target.value };
                          setFormData(prev => ({ ...prev, priceDetails: newDetails }));
                        }}
                        placeholder="Weight (e.g., 2.903g)"
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                      <input
                        type="number"
                        value={detail.value || ''}
                        onChange={(e) => {
                          const newDetails = [...formData.priceDetails];
                          newDetails[index] = { ...detail, value: e.target.value };
                          setFormData(prev => ({ ...prev, priceDetails: newDetails }));
                        }}
                        placeholder="Value"
                        min="0"
                        step="0.01"
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                      <Button
                        type="button"
                        onClick={() => removePriceDetail(index)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <Icon icon="ph:trash" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="btn btn-outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAdding || isUpdating || isUploading}
                  className="btn btn-primary"
                >
                  {isAdding || isUpdating || isUploading ? (
                    <>
                      <Icon icon="ph:spinner" className="animate-spin mr-2" />
                      {isEdit ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Icon icon="ph:check" className="mr-2" />
                      {isEdit ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Image Upload & Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card title="Product Images">
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon icon="ph:cloud-arrow-up" className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isUploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </label>
              </div>

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Uploaded Images ({uploadedImages.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={typeof image === 'string' ? image : image.url || image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                        <Button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 btn btn-sm btn-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icon icon="ph:x" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Preview */}
              {formData.name && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Product Preview
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-gray-900 dark:text-white">{formData.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">{formData.brand}</p>
                      <p className="text-gray-600 dark:text-gray-400">SKU: {formData.skuId}</p>
                      {formData.stock > 0 && (
                        <p className="text-gray-600 dark:text-gray-400">Stock: {formData.stock}</p>
                      )}
                      {formData.selectedCaret && (
                        <p className="text-gray-600 dark:text-gray-400">Carat: {formData.selectedCaret}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.active && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                        )}
                        {formData.CurrentlyNotavaiable && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Not Available</span>
                        )}
                        {formData.popular && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Popular</span>
                        )}
                        {formData.trending && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Trending</span>
                        )}
                        {formData.isDiscountAvaiable && formData.Discount > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">{formData.Discount}% Off</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;
