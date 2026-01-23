import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetProductByIdQuery, 
  useUpdateProductMutation, 
  useDeleteProductMutation,
  useGetProductReviewsQuery,
  useDeleteReviewMutation
} from '@/store/api/auth/authApiSlice';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { data: productResponse, isLoading, error, refetch } = useGetProductByIdQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const { data: reviewsResponse, isLoading: isLoadingReviews, refetch: refetchReviews } = useGetProductReviewsQuery(
    { productId: id, page: 1, limit: 20, sort: 'newest' },
    { skip: !id }
  );
  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewMutation();

  // Helper function to check if URL is a video
  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') ||
           lowerUrl.includes('.webm') ||
           lowerUrl.includes('.mov') ||
           lowerUrl.includes('/video/') ||
           lowerUrl.includes('video/upload');
  };

  // Debug API call
  console.log('API Call Debug:', {
    id,
    isLoading,
    error,
    productResponse,
    url: `/commerce/singleProduct/${id}`
  });

  // Extract product from API response
  // Handle different possible response structures
  let product = null;
  if (productResponse?.products && Array.isArray(productResponse.products)) {
    product = productResponse.products[0]; // If it's an array, take the first item
  } else if (productResponse?.product) {
    product = productResponse.product; // If it's a single product object
  } else if (productResponse && !productResponse.products) {
    product = productResponse; // If the response is the product itself
  }

  console.log('Product Details:', product);
  console.log('Product Response:', productResponse);

  const handleDeleteProduct = async () => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted successfully');
        navigate('/products');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleTrendingToggle = async () => {
    try {
      await updateProduct({
        id,
        trending: !product.trending
      }).unwrap();
      toast.success(`Product ${product.trending ? 'removed from' : 'added to'} trending`);
      refetch();
    } catch (error) {
      toast.error('Failed to update trending status');
    }
  };

  const handlePopularToggle = async () => {
    try {
      await updateProduct({
        id,
        popular: !product.popular
      }).unwrap();
      toast.success(`Product ${product.popular ? 'removed from' : 'added to'} popular`);
      refetch();
    } catch (error) {
      toast.error('Failed to update popular status');
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
    console.error('Product Details Error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading product: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Product ID: {id}</p>
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
          <Button onClick={() => navigate('/products')} className="btn btn-outline">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Product not found</p>
        <p className="text-sm text-gray-400 mt-2">Product ID: {id}</p>
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
          <p className="text-sm text-gray-600 dark:text-gray-400">Debug Info:</p>
          <pre className="text-xs text-gray-500 dark:text-gray-500 mt-2 overflow-auto">
            {JSON.stringify(productResponse, null, 2)}
          </pre>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button onClick={() => navigate('/products')} className="btn btn-outline">
            Back to Products
          </Button>
          <Button onClick={() => refetch()} className="btn btn-primary">
            Test API Call
          </Button>
        </div>
      </div>
    );
  }

  // Add a simple test to see if we can access the product data
  console.log('Final Product Check:', {
    product,
    hasProduct: !!product,
    productKeys: product ? Object.keys(product) : [],
    productId: product?._id,
    productName: product?.name
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/products')}
            className="btn btn-outline"
          >
            <Icon icon="ph:arrow-left" className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Product Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage product information
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate(`/products/${id}/edit`)}
            className="btn btn-outline-secondary"
          >
            <Icon icon="ph:pencil" className="mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDeleteProduct}
            disabled={isDeleting}
            className="btn btn-outline-danger"
          >
            <Icon icon="ph:trash" className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Product Images
            </h3>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image/Video */}
                <div className="aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  {isVideoUrl(product.images[selectedImageIndex]) ? (
                    <video
                      src={product.images[selectedImageIndex]}
                      controls
                      className="w-full h-full object-cover"
                      playsInline
                    />
                  ) : (
                    <img
                      src={product.images[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Thumbnail Images/Videos */}
                {product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((media, index) => {
                      const isVideo = isVideoUrl(media);
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 relative ${
                            selectedImageIndex === index
                              ? 'border-blue-500'
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {isVideo ? (
                            <>
                              <video
                                src={media}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                <Icon icon="ph:play-fill" className="text-white text-2xl" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={media}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Icon icon="ph:image" className="text-6xl text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {product.brand}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  SKU: {product.skuId}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  product.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {product.active ? 'Active' : 'Inactive'}
                </span>
                {product.trending && (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    Trending
                  </span>
                )}
                {product.popular && (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Popular
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    icon="ph:star-fill"
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating?.value || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                {product.rating?.value || 0} ({product.rating?.count || 0} reviews)
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Description
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.categories || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Stock
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.stock || 0} units
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Selected Carat
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.selectedCaret || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Carat Options
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.caretOptions?.join(', ') || 'N/A'}
                </p>
              </div>
            </div>

            {/* Product Details Array */}
            {product.productDetails && product.productDetails.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Product Specifications
                </h4>
                <div className="space-y-3">
                  {product.productDetails.map((detail, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {detail.type}: {detail.name}
                      </h5>
                      {detail.attributes && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {Object.entries(detail.attributes).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white ml-1">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Pricing Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Selling Price</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{product.sellingprice?.toLocaleString() || 0}
                </span>
              </div>
              {product.total && product.total !== product.sellingprice && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Price</span>
                  <span className="text-sm text-gray-900 dark:text-white line-through">
                    ₹ {product.total.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">GST</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {product.gst || 0} %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Weight</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {product.subtotal?.weight || 'N/A'}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            {product.priceDetails && product.priceDetails.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Price Breakdown
                </h4>
                <div className="space-y-2">
                  {product.priceDetails.map((price, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {price.name} {price.weight && `(${price.weight})`}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ₹ {price.value?.toLocaleString() || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={handleTrendingToggle}
                disabled={isUpdating}
                className={`btn w-full justify-start ${
                  product.trending ? 'btn-outline-warning' : 'btn-outline'
                }`}
              >
                <Icon icon={product.trending ? 'ph:fire' : 'ph:fire-simple'} className="mr-2" />
                {product.trending ? 'Remove from Trending' : 'Add to Trending'}
              </Button>
              <Button
                onClick={handlePopularToggle}
                disabled={isUpdating}
                className={`btn w-full justify-start ${
                  product.popular ? 'btn-outline-success' : 'btn-outline'
                }`}
              >
                <Icon icon={product.popular ? 'ph:heart-fill' : 'ph:heart'} className="mr-2" />
                {product.popular ? 'Remove from Popular' : 'Add to Popular'}
              </Button>
              <Button
                onClick={() => navigate(`/products/${id}/edit`)}
                className="btn btn-outline w-full justify-start"
              >
                <Icon icon="ph:pencil" className="mr-2" />
                Edit Product
              </Button>
            </div>
          </div>

          {/* Product Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Product Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Rating</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {product.rating?.value || 0}/5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Reviews</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {product.rating?.count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Product Reviews ({reviewsResponse?.pagination?.totalReviews || product.rating?.count || 0})
          </h3>
        </div>

        {isLoadingReviews ? (
          <div className="flex justify-center py-8">
            <LoadingIcon />
          </div>
        ) : reviewsResponse?.reviews && reviewsResponse.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviewsResponse.reviews.map((review) => (
              <div
                key={review._id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {review.userName?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {review.userName || 'Anonymous'}
                        </p>
                        {review.isVerified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              icon="ph:star-fill"
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this review?')) {
                        try {
                          await deleteReview(review._id).unwrap();
                          toast.success('Review deleted successfully');
                          refetchReviews();
                          refetch(); // Refresh product to update rating
                        } catch (error) {
                          toast.error('Failed to delete review');
                        }
                      }
                    }}
                    disabled={isDeletingReview}
                    className="btn btn-outline-danger btn-sm"
                  >
                    <Icon icon="ph:trash" className="w-4 h-4" />
                  </Button>
                </div>
                {review.title && (
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {review.title}
                  </h4>
                )}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {review.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon icon="ph:chat-circle-dots" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
