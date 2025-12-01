import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllProductsQuery, useDeleteProductMutation } from '@/store/api/product/productApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import * as XLSX from 'xlsx';

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const itemsPerPage = 12;

  const { data: productsResponse, isLoading, error, refetch } = useGetAllProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Extract products from API response
  let products = [];
  if (productsResponse) {
    if (Array.isArray(productsResponse)) {
      products = productsResponse;
    } else if (productsResponse.details && Array.isArray(productsResponse.details)) {
      products = productsResponse.details;
    } else if (productsResponse.data && Array.isArray(productsResponse.data)) {
      products = productsResponse.data;
    } else if (productsResponse.products && Array.isArray(productsResponse.products)) {
      products = productsResponse.products;
    }
  }

  console.log('Products Response:', productsResponse);
  console.log('Products:', products);

  // Get unique categories for filter
  const categories = Array.isArray(products) ? [...new Set(products.map(product => product.categories))] : [];

  // Filter products based on search term and category
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.skuId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categories?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categories === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleEditProduct = (product) => {
    navigate(`/products/${product._id}/edit`);
  };

  const handleViewProduct = (id) => {
    navigate(`/products/${id}`);
  };

  const handleDownloadExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = products.map((product, index) => ({
        'S.No': index + 1,
        'Product ID': product._id,
        'Name': product.name || 'N/A',
        'Brand': product.brand || 'N/A',
        'SKU ID': product.skuId || 'N/A',
        'Category': product.categories || 'N/A',
        'Selling Price': product.sellingprice || 0,
        'Stock': product.stock || 0,
        'Status': product.active ? 'Active' : 'Inactive',
        'Trending': product.trending ? 'Yes' : 'No',
        'Popular': product.popular ? 'Yes' : 'No',
        'Rating': product.rating?.value || 0,
        'Rating Count': product.rating?.count || 0,
        'Weight': product.subtotal?.weight || 'N/A',
        'Total': product.total || 0,
        'GST': product.gst || 0,
        'Selected Carat': product.selectedCaret || 'N/A',
        'Caret Options': product.caretOptions?.join(', ') || 'N/A',
        'Created At': product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A',
        'Updated At': product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'
      }));

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create a worksheet from the data
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [
        { wch: 5 },   // S.No
        { wch: 25 }, // Product ID
        { wch: 30 }, // Name
        { wch: 20 }, // Brand
        { wch: 20 }, // SKU ID
        { wch: 15 }, // Category
        { wch: 15 }, // Selling Price
        { wch: 10 }, // Stock
        { wch: 10 }, // Status
        { wch: 10 }, // Trending
        { wch: 10 }, // Popular
        { wch: 10 }, // Rating
        { wch: 12 }, // Rating Count
        { wch: 10 }, // Weight
        { wch: 12 }, // Total
        { wch: 10 }, // GST
        { wch: 15 }, // Selected Carat
        { wch: 20 }, // Caret Options
        { wch: 15 }, // Created At
        { wch: 15 }  // Updated At
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Product data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export product data');
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
    console.error('Products Error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading products: {error.message}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your product catalog</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleDownloadExcel}
            className="btn btn-outline-success"
            disabled={!products || products.length === 0}
          >
            <Icon icon="ph:download" className="mr-2" />
            Export Excel
          </Button>
          <Button
            onClick={handleAddProduct}
            className="btn btn-primary"
          >
            <Icon icon="ph:plus" className="mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <div key={product._id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100 dark:bg-slate-700">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon icon="ph:image" className="text-4xl text-gray-400" />
                </div>
              )}
              
              {/* Status Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.trending && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Trending
                  </span>
                )}
                {product.popular && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </div>

              {/* Stock Badge */}
              <div className="absolute top-2 right-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {product.name}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {product.brand}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {product.categories}
              </p>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      icon="ph:star-fill"
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating?.value || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  ({product.rating?.count || 0})
                </span>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{product.sellingprice?.toLocaleString() || 0}
                  </span>
                  {product.total && product.total !== product.sellingprice && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                      ₹{product.total.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.selectedCaret}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleViewProduct(product._id)}
                  className="btn btn-sm btn-outline-primary flex-1"
                >
                  <Icon icon="ph:eye" className="mr-1" />
                  View
                </Button>
                <Button
                  onClick={() => handleEditProduct(product)}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <Icon icon="ph:pencil" />
                </Button>
                <Button
                  onClick={() => handleDeleteProduct(product._id)}
                  disabled={isDeleting}
                  className="btn btn-sm btn-outline-danger"
                >
                  <Icon icon="ph:trash" />
                </Button>
              </div>
            </div>
          </div>
        ))}
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
                  {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                </span>{' '}
                of <span className="font-medium">{filteredProducts.length}</span> results
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
  );
};

export default Products;
