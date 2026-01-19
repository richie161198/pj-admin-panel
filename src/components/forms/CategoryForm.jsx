import React, { useState, useEffect } from 'react';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '@/store/api/product/productApi';
import { useUploadSingleImageMutation } from '@/store/api/image/imageApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';

const CategoryForm = ({ category, onClose, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    newTag: false
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadSingleImageMutation();

  useEffect(() => {
    if (isEdit && category) {
      setFormData({
        name: category.name || '',
        image: category.image || null,
        newTag: category.newTag || false
      });
      if (category.image) {
        setImagePreview(category.image);
      }
    }
  }, [isEdit, category]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    // Validate image is provided
    if (!imageFile && !formData.image) {
      toast.error('Category image is required');
      return;
    }

    try {
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);
        
        try {
          const uploadResponse = await uploadImage(formDataUpload).unwrap();
          imageUrl = uploadResponse.data?.url || uploadResponse.url || uploadResponse;
        } catch (uploadError) {
          toast.error('Failed to upload image');
          return;
        }
      }

      // Ensure image URL exists
      if (!imageUrl) {
        toast.error('Category image is required');
        return;
      }

      const submitData = {
        name: formData.name.trim(),
        image: imageUrl,
        newTag: formData.newTag || false
      };

      if (isEdit) {
        await updateCategory({ id: category._id, ...submitData }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory(submitData).unwrap();
        toast.success('Category created successfully');
      }
      
      onClose();
    } catch (error) {
      toast.error(error.data?.message || error.message || 'Failed to save category');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Category' : 'Add New Category'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Enter category name"
              />
            </div>

            {/* Category Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!isEdit || !formData.image}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              {!imagePreview && !formData.image && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  Please upload a category image
                </p>
              )}
              {(imagePreview || formData.image) && (
                <div className="mt-4">
                  <img
                    src={imagePreview || formData.image}
                    alt="Category preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* New Tag */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="newTag"
                checked={formData.newTag}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Mark as New Category
              </label>
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
                disabled={isCreating || isUpdating || isUploading}
                className="btn btn-primary"
              >
                {(isCreating || isUpdating || isUploading) ? (
                  <>
                    <Icon icon="ph:spinner" className="animate-spin mr-2" />
                    {isUploading ? 'Uploading...' : (isEdit ? 'Updating...' : 'Creating...')}
                  </>
                ) : (
                  <>
                    <Icon icon="ph:check" className="mr-2" />
                    {isEdit ? 'Update Category' : 'Create Category'}
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

export default CategoryForm;
