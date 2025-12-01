import { apiSlice } from "../apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (user) => ({
        url: "/auth/register",
        method: "POST",
        body: user,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ['Auth'],
    }),
    getProfile: builder.query({
      query: () => "/auth/profile",
      providesTags: ['Auth'],
    }),
    // Customer endpoints
    getAllCategories: builder.query({
      query: () => "/commerce/getAllCategories",
      providesTags: ['Products'],
    }),
    getCustomers: builder.query({
      query: () => "/users/getAllUser",
      providesTags: ['Customer'],
    }),
    getCustomerById: builder.query({
      query: (id) => `/users/getuserByIds/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation({
      query: (customer) => ({
        url: "/users/createUser",
        method: "POST",
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...customer }) => ({
        url: `/users/updateUser/${id}`,
        method: "PUT",
        body: customer,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/users/deleteUser/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Customer'],
    }),
    // Product endpoints
    getProducts: builder.query({
      query: () => "/commerce/getAllProducts",
      providesTags: ['Product'],
    }),
    getProductById: builder.query({
      query: (id) => `/commerce/singleProduct/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation({
      query: (product) => ({
        url: "/commerce/createProduct",
        method: "POST",
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...product }) => ({
        url: `/commerce/updateProduct/${id}`,
        method: "PUT",
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/commerce/deleteProduct/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Product'],
    }),
    // Category endpoints
    getCategories: builder.query({
      query: () => "/commerce/getAllCategories",
      providesTags: ['Category'],
    }),
    getCategoryById: builder.query({
      query: (id) => `/commerce/getCategoryById/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation({
      query: (category) => ({
        url: "/commerce/createCategory",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...category }) => ({
        url: `/commerce/updateCategory/${id}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/commerce/deleteCategory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const { 
  useRegisterUserMutation, 
  useLoginMutation, 
  useLogoutMutation,
  useGetProfileQuery,
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} = authApi;
