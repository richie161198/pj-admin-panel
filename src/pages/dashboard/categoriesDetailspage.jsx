import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCategoryByIdQuery, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/store/api/auth/authApiSlice';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import InputGroup from '@/components/ui/InputGroup';
import { useForm } from 'react-hook-form';

const CategoryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const { data: categoryResponse, isLoading, error, refetch } = useGetCategoryByIdQuery(id);
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Extract category from API response
  // Handle different possible response structures
  let category = null;
  if (categoryResponse?.categories && Array.isArray(categoryResponse.categories)) {
    category = categoryResponse.categories[0]; // If it's an array, take the first item
  } else if (categoryResponse?.category) {
    category = categoryResponse.category; // If it's a single category object
  } else if (categoryResponse && !categoryResponse.categories) {
    category = categoryResponse; // If the response is the category itself
  }

  console.log('Category Details:', category);
  console.log('Category Response:', categoryResponse);

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deleted successfully');
      navigate('/categories');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('newTag', data.newTag);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await updateCategory({
        id,
        ...data,
        image: selectedImage
      }).unwrap();
      toast.success('Category updated successfully');
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
      refetch();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewTagToggle = async () => {
    try {
      await updateCategory({
        id,
        newTag: !category.newTag
      }).unwrap();
      toast.success(`Category ${category.newTag ? 'removed from' : 'added to'} new tag`);
      refetch();
    } catch (error) {
      toast.error('Failed to update new tag status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  if (error) {
    console.error('Category Details Error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading category: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Category ID: {id}</p>
        <p className="text-sm text-gray-500">Status: {error.status}</p>
        <p className="text-sm text-gray-500">Data: {JSON.stringify(error.data)}</p>
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
          <p className="text-sm text-gray-600 dark:text-gray-400">Full Error:</p>
          <pre className="text-xs text-gray-500 dark:text-gray-500 mt-2 overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button onClick={() => refetch()} className="btn btn-primary">
            Retry
          </Button>
          <Button onClick={() => navigate('/categories')} className="btn btn-outline">
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Category not found</p>
        <p className="text-sm text-gray-400 mt-2">Category ID: {id}</p>
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
          <p className="text-sm text-gray-600 dark:text-gray-400">Debug Info:</p>
          <pre className="text-xs text-gray-500 dark:text-gray-500 mt-2 overflow-auto">
            {JSON.stringify(categoryResponse, null, 2)}
          </pre>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button onClick={() => navigate('/categories')} className="btn btn-outline">
            Back to Categories
          </Button>
          <Button onClick={() => refetch()} className="btn btn-primary">
            Test API Call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/categories')}
            className="btn btn-outline"
          >
            <Icon icon="ph:arrow-left" className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Category Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage category information
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isUpdating}
                className="btn btn-success"
              >
                <Icon icon="ph:check" className="mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleEditToggle}
                className="btn btn-outline"
              >
                <Icon icon="ph:x" className="mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleEditToggle}
                className="btn btn-outline-secondary"
              >
                <Icon icon="ph:pencil" className="mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleNewTagToggle}
                disabled={isUpdating}
                className={`btn ${category.newTag ? 'btn-outline-warning' : 'btn-outline-success'}`}
              >
                <Icon icon={category.newTag ? 'ph:tag-slash' : 'ph:tag'} className="mr-2" />
                {category.newTag ? 'Remove New Tag' : 'Add New Tag'}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="btn btn-outline-danger"
              >
                <Icon icon="ph:trash" className="mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Category Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Category Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Image */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Category Image
              </h3>
              {isEditing && (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleImageUpload}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <Icon icon="ph:upload" className="mr-2" />
                    Upload Image
                  </Button>
                  {(selectedImage || imagePreview) && (
                    <Button
                      onClick={removeSelectedImage}
                      className="btn btn-outline-danger btn-sm"
                    >
                      <Icon icon="ph:trash" className="mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {/* Image Display */}
            {imagePreview ? (
              <div className="aspect-video bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  New Image
                </div>
              </div>
            ) : category.image ? (
              <div className="aspect-video bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Icon icon="ph:image" className="text-6xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No image uploaded</p>
                  {isEditing && (
                    <Button
                      onClick={handleImageUpload}
                      className="btn btn-outline-primary btn-sm mt-2"
                    >
                      <Icon icon="ph:upload" className="mr-2" />
                      Upload Image
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Image Info */}
            {selectedImage && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                  <Icon icon="ph:info" className="mr-2" />
                  <span>Selected: {selectedImage.name}</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
          </div>

          {/* Category Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  {isEditing ? (
                    <InputGroup
                      name="name"
                      label="Category Name"
                      placeholder="Enter category name"
                      defaultValue={category.name}
                      register={register}
                      error={errors.name}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h2>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    Category ID: {category._id}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    category.newTag 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {category.newTag ? 'New Tag' : 'Regular'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h4>
                {isEditing ? (
                  <InputGroup
                    name="description"
                    label="Description"
                    placeholder="Enter category description"
                    defaultValue={category.description}
                    register={register}
                    error={errors.description}
                    type="textarea"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {category.description || 'No description available'}
                  </p>
                )}
              </div>

              {/* Category Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category Name
                  </label>
                  {isEditing ? (
                    <InputGroup
                      name="name"
                      placeholder="Enter category name"
                      defaultValue={category.name}
                      register={register}
                      error={errors.name}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {category.name || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    New Tag Status
                  </label>
                  {isEditing ? (
                    <select
                      {...register('newTag')}
                      defaultValue={category.newTag}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value={false}>Regular</option>
                      <option value={true}>New Tag</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {category.newTag ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created At
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {!isEditing && (
                <Button
                  onClick={handleNewTagToggle}
                  disabled={isUpdating}
                  className={`btn w-full justify-start ${
                    category.newTag ? 'btn-outline-warning' : 'btn-outline-success'
                  }`}
                >
                  <Icon icon={category.newTag ? 'ph:tag-slash' : 'ph:tag'} className="mr-2" />
                  {category.newTag ? 'Remove New Tag' : 'Add New Tag'}
                </Button>
              )}
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="btn btn-outline-danger w-full justify-start"
              >
                <Icon icon="ph:trash" className="mr-2" />
                Delete Category
              </Button>
            </div>
          </div>

          {/* Category Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Category Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">New Tag</span>
                <span className={`text-sm font-medium ${
                  category.newTag 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {category.newTag ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Has Image</span>
                <span className={`text-sm font-medium ${
                  category.image 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {category.image ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {(category.image || imagePreview) && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Image Preview
              </h3>
              <div className="aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                <img
                  src={imagePreview || category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                {imagePreview && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                    New
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Icon icon="ph:warning" className="text-red-500 text-2xl mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Category
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the category "{category.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                className="btn btn-danger flex-1"
              >
                <Icon icon="ph:trash" className="mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailsPage;
