import { apiSlice } from '../apiSlice';

export const imageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Upload Single Image
    uploadSingleImage: builder.mutation({
      query: (formData) => ({
        url: '/images/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),

    // Upload Multiple Images
    uploadMultipleImages: builder.mutation({
      query: (formData) => ({
        url: '/images/upload-multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),

    // Delete Image
    deleteImage: builder.mutation({
      query: (publicId) => ({
        url: `/images/delete/${publicId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Get Image Details
    getImageDetails: builder.query({
      query: (publicId) => `/images/details/${publicId}`,
      providesTags: (result, error, publicId) => [{ type: 'Product', id: publicId }],
    }),

    // Upload Image (Utils endpoint)
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/utils/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useUploadSingleImageMutation,
  useUploadMultipleImagesMutation,
  useDeleteImageMutation,
  useGetImageDetailsQuery,
  useUploadImageMutation,
} = imageApi;
