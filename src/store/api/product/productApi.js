
import { apiSlice } from '../apiSlice';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Products
    getAllProducts: builder.query({
      query: () => '/commerce/getAllProducts',
      providesTags: ['Product'],
    }),

    // Get Product by ID
    getProductById: builder.query({
      query: (id) => `/commerce/singleProduct/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Add Product
    addProduct: builder.mutation({
      query: (productData) => ({
        url: '/commerce/addProduct',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    // Update Product
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/commerce/updateProduct/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        'Product',
      ],
    }),

    // Delete Product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/commerce/deleteProduct/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Bulk Upload Products
    bulkUploadProducts: builder.mutation({
      query: (formData) => ({
        url: '/commerce/bulk-add',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),

    // Get All Categories
    getAllCategories: builder.query({
      query: () => '/commerce/getAllCategories',
      providesTags: ['Category'],
    }),

    // Get Category by ID
    getCategoryById: builder.query({
      query: (id) => `/commerce/getCategoryById/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Create Category
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/commerce/createCategory',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),

    // Update Category
    updateCategory: builder.mutation({
      query: ({ id, ...categoryData }) => ({
        url: `/commerce/updateCategory/${id}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),

    // Delete Category
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/commerce/deleteCategory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Get Category with Products
    getCategoryWithProducts: builder.query({
      query: (id) => `/commerce/categories/${id}/products`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Add to Cart
    addToCart: builder.mutation({
      query: (cartData) => ({
        url: '/commerce/addcart',
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Product'],
    }),

    // Get Cart
    getCart: builder.query({
      query: () => '/commerce/cart',
      providesTags: ['Product'],
    }),

    // Remove from Cart
    removeFromCart: builder.mutation({
      query: (cartData) => ({
        url: '/commerce/removecart',
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Product'],
    }),

    // Checkout
    checkout: builder.mutation({
      query: (checkoutData) => ({
        url: '/commerce/cart/checkout',
        method: 'POST',
        body: checkoutData,
      }),
      invalidatesTags: ['Product', 'Order'],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useBulkUploadProductsMutation,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryWithProductsQuery,
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useCheckoutMutation,
} = productApi;
