import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { apiSlice } from "./api/apiSlice";
import { maintenanceApi } from "./api/maintenance/maintenanceApi";
import { invoiceApi } from "./api/invoices/invoiceApi";

const store = configureStore({
  reducer: {
    ...rootReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(apiSlice.middleware, maintenanceApi.middleware, invoiceApi.middleware),
});

export default store;
