import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllCategoriesQuery, useDeleteCategoryMutation } from '@/store/api/product/productApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import CategoryForm from '@/components/forms/CategoryForm';
import * as XLSX from 'xlsx';

const Categories = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const itemsPerPage = 10;

  const { data: categoriesResponse, isLoading, error, refetch } = useGetAllCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Extract categories from API response
  let categories = [];
  if (categoriesResponse) {
    if (Array.isArray(categoriesResponse)) {
      categories = categoriesResponse;
    } else if (categoriesResponse.details && Array.isArray(categoriesResponse.details)) {
      categories = categoriesResponse.details;
    } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
      categories = categoriesResponse.data;
    } else if (categoriesResponse.categories && Array.isArray(categoriesResponse.categories)) {
      categories = categoriesResponse.categories;
    }
  }

  console.log('Categories Response:', categoriesResponse);
  console.log('Categories:', categories);

  // Filter categories based on search term
  const filteredCategories = Array.isArray(categories) ? categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Category deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCloseForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    refetch();
  };

  const handleViewCategory = (id) => {
    navigate(`/categories/${id}`);
  };

  const handleDownloadExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = categories.map((category, index) => ({
        'S.No': index + 1,
        'Category ID': category._id,
        'Name': category.name || 'N/A',
        'Description': category.description || 'N/A',
        'New Tag': category.newTag ? 'Yes' : 'No',
        'Created At': category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A',
        'Updated At': category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A',
        'Image URL': category.image || 'N/A'
      }));

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create a worksheet from the data
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [
        { wch: 5 },   // S.No
        { wch: 25 }, // Category ID
        { wch: 20 }, // Name
        { wch: 30 }, // Description
        { wch: 10 }, // New Tag
        { wch: 15 }, // Created At
        { wch: 15 }, // Updated At
        { wch: 50 }  // Image URL
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `categories_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Category data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export category data');
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
    console.error('Categories Error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading categories: {error.message}</p>
        <p className="text-sm text-gray-500">Status: {error.status}</p>
        <p className="text-sm text-gray-500">Data: {JSON.stringify(error.data)}</p>
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
          <p className="text-sm text-gray-600 dark:text-gray-400">Full Error:</p>
          <pre className="text-xs text-gray-500 dark:text-gray-500 mt-2 overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your product categories</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleDownloadExcel}
            className="btn btn-outline-success"
            disabled={!categories || categories.length === 0}
          >
            <Icon icon="ph:download" className="mr-2" />
            Export Excel
          </Button>
          <Button
            onClick={handleAddCategory}
            className="btn btn-primary"
          >
            <Icon icon="ph:plus" className="mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <Icon icon="ph:image" className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {category._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {category.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.newTag 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {category.newTag ? 'New' : 'Regular'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleViewCategory(category._id)}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <Icon icon="ph:eye" />
                      </Button>
                      <Button
                        onClick={() => handleEditCategory(category)}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <Icon icon="ph:pencil" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category._id)}
                        disabled={isDeleting}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <Icon icon="ph:trash" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-sm btn-outline"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-outline"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredCategories.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredCategories.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-sm btn-outline rounded-l-md"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn btn-sm ${
                        currentPage === page
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm btn-outline rounded-r-md"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCloseForm}
          isEdit={!!editingCategory}
        />
      )}
    </div>
  );
};

export default Categories;

