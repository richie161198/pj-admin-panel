import React, { useState, useEffect } from 'react';
import { useAddProductMutation, useUpdateProductMutation, useGetAllCategoriesQuery } from '@/store/api/product/productApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { useUploadMultipleImagesMutation } from '@/store/api/image/imageApi';

const ProductForm = ({ product, onClose, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    sellingprice: '',
    categories: '',
    popular: false,
    trending: false,
    categoryId: '',
    skuId: '',
    rating: {
      value: 0,
      count: 0
    },
    caretOptions: [],
    selectedCaret: '',
    productDetails: [],
    priceDetails: [],
    subtotal: {
      weight: '',
      value: ''
    },
    gst: '',
    total: '',
    images: []
  });

  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadMultipleImagesMutation();
  const { data: categoriesResponse } = useGetAllCategoriesQuery();

  // Extract categories from API response - handle all possible response structures
  const categories = React.useMemo(() => {
    if (!categoriesResponse) return [];
    
    // RTK Query wraps response in 'data', so check categoriesResponse.data first
    if (categoriesResponse.data) {
      // Backend returns: { status: true, count: X, categories: [...] }
      if (Array.isArray(categoriesResponse.data.categories)) {
        return categoriesResponse.data.categories;
      }
      // If data itself is an array
      if (Array.isArray(categoriesResponse.data)) {
        return categoriesResponse.data;
      }
    }
    
    // Direct categories array
    if (Array.isArray(categoriesResponse.categories)) {
      return categoriesResponse.categories;
    }
    
    // Direct array response
    if (Array.isArray(categoriesResponse)) {
      return categoriesResponse;
    }
    
    return [];
  }, [categoriesResponse]);

  useEffect(() => {
    if (isEdit && product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        description: product.description || '',
        sellingprice: product.sellingprice || '',
        categories: product.categories || '',
        popular: product.popular || false,
        trending: product.trending || false,
        categoryId: product.categoryId || '',
        skuId: product.skuId || '',
        rating: product.rating || { value: 0, count: 0 },
        caretOptions: product.caretOptions || [],
        selectedCaret: product.selectedCaret || '',
        productDetails: product.productDetails || [],
        priceDetails: product.priceDetails || [],
        subtotal: product.subtotal || { weight: '', value: '' },
        gst: product.gst || '',
        total: product.total || '',
        images: product.images || []
      });
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

  const handleFeatureChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await uploadImage(formData).unwrap();
        if (response.url) {
          uploadedUrls.push(response.url);
        }
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Add handlers for new fields
  const addCaretOption = () => {
    setFormData(prev => ({
      ...prev,
      caretOptions: [...prev.caretOptions, '']
    }));
  };

  const removeCaretOption = (index) => {
    setFormData(prev => ({
      ...prev,
      caretOptions: prev.caretOptions.filter((_, i) => i !== index)
    }));
  };

  const handleCaretOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      caretOptions: prev.caretOptions.map((option, i) => i === index ? value : option)
    }));
  };

  const addProductDetail = () => {
    setFormData(prev => ({
      ...prev,
      productDetails: [...prev.productDetails, { type: '', name: '', attributes: {} }]
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
      priceDetails: [...prev.priceDetails, { name: '', value: '' }]
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
        sellingprice: parseFloat(formData.sellingprice),
        rating: {
          value: parseFloat(formData.rating.value),
          count: parseInt(formData.rating.count)
        },
        subtotal: {
          weight: formData.subtotal.weight,
          value: parseFloat(formData.subtotal.value)
        },
        gst: parseFloat(formData.gst),
        total: parseFloat(formData.total)
      };

      if (isEdit) {
        await updateProduct({ id: product._id, ...submitData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await addProduct(submitData).unwrap();
        toast.success('Product added successfully');
      }
      
      onClose();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save product');
    }
  };

  return (
    console.log(categories,"isAdding,isUpdating"),
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <Button
              onClick={onClose}
              className="btn btn-sm btn-outline"
            >
              <Icon icon="ph:x" />
            </Button>
          </div>

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
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  name="sellingprice"
                  value={formData.sellingprice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category ID
                </label>
                <input
                  type="text"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
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

            {/* Caret Options */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Caret Options</h3>
                <Button
                  type="button"
                  onClick={addCaretOption}
                  className="btn btn-sm btn-outline"
                >
                  <Icon icon="ph:plus" className="mr-2" />
                  Add Caret Option
                </Button>
              </div>
              <div className="space-y-2">
                {formData.caretOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleCaretOptionChange(index, e.target.value)}
                      placeholder="Enter caret option (e.g., 18K, 22K)"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                    <Button
                      type="button"
                      onClick={() => removeCaretOption(index)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <Icon icon="ph:trash" />
                    </Button>
                  </div>
                ))}
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pricing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GST (₹)
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total (₹)
                  </label>
                  <input
                    type="number"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
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
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtotal Value (₹)
                </label>
                <input
                  type="number"
                  name="subtotal.value"
                  value={formData.subtotal.value}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
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
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Type
                        </label>
                        <input
                          type="text"
                          value={detail.type}
                          onChange={(e) => {
                            const newDetails = [...formData.productDetails];
                            newDetails[index] = { ...detail, type: e.target.value };
                            setFormData(prev => ({ ...prev, productDetails: newDetails }));
                          }}
                          placeholder="e.g., Metal, Stone"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={detail.name}
                          onChange={(e) => {
                            const newDetails = [...formData.productDetails];
                            newDetails[index] = { ...detail, name: e.target.value };
                            setFormData(prev => ({ ...prev, productDetails: newDetails }));
                          }}
                          placeholder="e.g., Gold, Diamond"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Attributes: {Object.keys(detail.attributes || {}).length} properties</span>
                      <Button
                        type="button"
                        onClick={() => removeProductDetail(index)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <Icon icon="ph:trash" />
                      </Button>
                    </div>
                  </div>
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
                      type="number"
                      value={detail.value}
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

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              {isUploading && (
                <div className="mt-2 text-sm text-blue-600">
                  <Icon icon="ph:spinner" className="animate-spin mr-2" />
                  Uploading images...
                </div>
              )}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 btn btn-sm btn-danger rounded-full"
                      >
                        <Icon icon="ph:x" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                onClick={onClose}
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
                    {isUploading ? 'Uploading...' : (isEdit ? 'Updating...' : 'Adding...')}
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
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
