import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionRoute from "@/components/PermissionRoute";
import "@/utils/testAuth"; // Import test utility for debugging

// home pages  & dashboard
//import Dashboard from "./pages/dashboard";
const Dashboard = lazy(() => import("./pages/dashboard"));
const Ecommerce = lazy(() => import("./pages/dashboard/ecommerce"));
const Orders = lazy(() => import("./pages/dashboard/orders"));
const ReturnRefunds = lazy(() => import("./pages/dashboard/return-refunds"));
const InvestmentOrders = lazy(() => import("./pages/dashboard/investment-orders"));
const InvestmentInvoices = lazy(() => import("./pages/dashboard/investment-invoice"));
const InvestmentOrderDetails = lazy(() => import("./pages/dashboard/investment-order-details"));
const OrderDetails = lazy(() => import("./pages/dashboard/orderDetails"));
const Invoice = lazy(() => import("./pages/dashboard/invoice"));
const Invoices = lazy(() => import("./pages/dashboard/invoices"));
const Customers = lazy(() => import("./pages/dashboard/customers"));
const CustomerDetails = lazy(() => import("./pages/dashboard/customersDetailspage"));
const Products = lazy(() => import("./pages/dashboard/products"));
const ProductAdd = lazy(() => import("./pages/dashboard/product-add"));
const ProductDetails = lazy(() => import("./pages/dashboard/productsDetailspage"));
const Categories = lazy(() => import("./pages/dashboard/categories"));
const CategoryDetails = lazy(() => import("./pages/dashboard/categoriesDetailspage"));
const AdminprofilePage = lazy(() => import("./pages/dashboard/adminprofilePage"));
const Privacypolicy = lazy(() => import("./pages/dashboard/privacypolicy"));
const GrievancePolicy = lazy(() => import("./pages/dashboard/grievance-policy"));
const DigiGoldRedemptionPolicy = lazy(() => import("./pages/dashboard/digi-gold-redemption-policy"));
const ShippingPolicy = lazy(() => import("./pages/dashboard/shipping-policy"));
const TermsAndConditions = lazy(() => import("./pages/dashboard/terms-and-conditions"));
const CancellationPolicy = lazy(() => import("./pages/dashboard/cancellation-policy"));
const Withdrawpolicy = lazy(() => import("./pages/dashboard/withdrawpolicy"));
const Refundpolicy = lazy(() => import("./pages/dashboard/refundpolicy"));
const Investmentsettings = lazy(() => import("./pages/dashboard/investment-settings"));
const AutopaySubscriptions = lazy(() => import("./pages/dashboard/autopay-subscriptions"));
const ShipmentSettings = lazy(() => import("./pages/dashboard/shipment-settings"));
const Maintenance = lazy(() => import("./pages/dashboard/maintenance"));
const ChatPage = lazy(() => import("./pages/dashboard/chat"));
const SupportTickets = lazy(() => import("./pages/dashboard/support-tickets"));
const AdminList = lazy(() => import("./pages/dashboard/admin-list"));
const AdminDetails = lazy(() => import("./pages/dashboard/admin-details"));
const Banners = lazy(() => import("./pages/dashboard/banners"));
const ReferredUsers = lazy(() => import("./pages/dashboard/referred-users"));
const AppointmentsPage = lazy(() => import("./pages/dashboard/appointments"));
const Reviews = lazy(() => import("./pages/dashboard/reviews"));
const TokenDebug = lazy(() => import("./pages/debug/token-debug"));

const Login = lazy(() => import("./pages/auth/login"));
const Login2 = lazy(() => import("./pages/auth/login2"));
const Register = lazy(() => import("./pages/auth/register"));
const Register2 = lazy(() => import("./pages/auth/register2"));
const ForgotPass = lazy(() => import("./pages/auth/forgot-password"));
const ForgotPass2 = lazy(() => import("./pages/auth/forgot-password2"));
const Error = lazy(() => import("./pages/404"));

// components and elements pages
const Button = lazy(() => import("./pages/elements/button"));
const Dropdown = lazy(() => import("./pages/components/dropdown"));
const Badges = lazy(() => import("./pages/elements/badges"));
const Alert = lazy(() => import("./pages/elements/alert"));
const Progressbar = lazy(() => import("./pages/elements/progress"));
const Card = lazy(() => import("./pages/elements/card"));
const AvatarPage = lazy(() => import("./pages/elements/avatar"));
const Tooltip = lazy(() => import("./pages/elements/tooltip-popover"));
const Modal = lazy(() => import("./pages/components/modal"));
const Pagination = lazy(() => import("./pages/components/pagination"));
const AccrodainPage = lazy(() => import("./pages/components/accordion"));
const TabPage = lazy(() => import("./pages/components/tab"));
const Video = lazy(() => import("./pages/components/video"));
const SpinierPage = lazy(() => import("./pages/elements/spinier"));
const TimelinePage = lazy(() => import("./pages/components/timeline"));

// forms components
const InputPage = lazy(() => import("./pages/forms/input"));
const TextareaPage = lazy(() => import("./pages/forms/textarea"));
const CheckboxPage = lazy(() => import("./pages/forms/checkbox"));
const RadioPage = lazy(() => import("./pages/forms/radio-button"));
const SwitchPage = lazy(() => import("./pages/forms/switch"));
const InputGroupPage = lazy(() => import("./pages/forms/input-group"));
const InputMask = lazy(() => import("./pages/forms/input-mask"));
const FormValidation = lazy(() => import("./pages/forms/form-validation"));
const FileInput = lazy(() => import("./pages/forms/file-input"));
const FormRepeater = lazy(() => import("./pages/forms/form-repeater"));
const SelectPage = lazy(() => import("./pages/forms/select"));
const ReactSelectPage = lazy(() => import("./pages/forms/select/react-select"));
const Flatpicker = lazy(() => import("./pages/forms/date-time-picker"));

// chart page
const AppexLineChartPage = lazy(() => import("./pages/chart/appex-chart"));
const ChartJs = lazy(() => import("./pages/chart/chartjs"));
const Recharts = lazy(() => import("./pages/chart/recharts"));
const CalendarPage = lazy(() => import("./pages/app/calendar"));

// map page
const MapPage = lazy(() => import("./pages/map"));

// table pages
const BasicTablePage = lazy(() => import("./pages/table/table-basic"));
const TanstackTable = lazy(() => import("./pages/table/react-table"));

// utility pages
const InvoicePage = lazy(() => import("./pages/utility/invoice"));
const InvoiceAddPage = lazy(() => import("./pages/utility/add-invoice"));
const InvoicePreviewPage = lazy(() =>
  import("./pages/utility/invoice-preview")
);
const InvoiceEditPage = lazy(() => import("./pages/utility/edit-invoice"));
const PricingPage = lazy(() => import("./pages/utility/pricing"));
const BlankPage = lazy(() => import("./pages/utility/blank-page"));

const FaqPage = lazy(() => import("./pages/utility/faq"));
const Profile = lazy(() => import("./pages/utility/profile"));
const IconPage = lazy(() => import("./pages/icons"));
const NotificationPage = lazy(() => import("./pages/dashboard/notifications"));


import Layout from "./layout/Layout";
import Loading from "@/components/Loading";
import AuthLayout from "./layout/AuthLayout";
function App() {
  return (
    <AuthProvider>
      <main className="App  relative">
        <Routes>
        <Route path="/login" element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route path="/*" element={<Layout />}>
          <Route path="dashboard" element={
            <PermissionRoute requiredPermission="dashboard">
              <Dashboard />
            </PermissionRoute>
          } />
          <Route path="ecommerce" element={
            <ProtectedRoute>
              <Ecommerce />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <PermissionRoute requiredPermission="orders">
              <Orders />
            </PermissionRoute>
          } />
          <Route path="return-refunds" element={
            <PermissionRoute requiredPermission="return-refunds">
              <ReturnRefunds />
            </PermissionRoute>
          } />
          <Route path="investment-orders" element={
            <PermissionRoute requiredPermission="investment-orders">
              <InvestmentOrders />
            </PermissionRoute>
          } />
          <Route path="investment-invoices" element={
            <PermissionRoute requiredPermission="investment-invoices">
              <InvestmentInvoices />
            </PermissionRoute>
          } />
          <Route path="investment-orders/:id" element={
            <PermissionRoute requiredPermission="investment-orders">
              <InvestmentOrderDetails />
            </PermissionRoute>
          } />
          <Route path="orders/:id" element={
            <PermissionRoute requiredPermission="orders">
              <OrderDetails />
            </PermissionRoute>
          } />
          <Route path="invoices" element={
            <PermissionRoute requiredPermission="invoices">
              <Invoices />
            </PermissionRoute>
          } />
          <Route path="invoice/:type/:id" element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          } />
          <Route path="products" element={
            <PermissionRoute requiredPermission="products">
              <Products />
            </PermissionRoute>
          } />
          <Route path="products/add" element={
            <PermissionRoute requiredPermission="products">
              <ProductAdd />
            </PermissionRoute>
          } />
          <Route path="products/:id/edit" element={
            <PermissionRoute requiredPermission="products">
              <ProductAdd />
            </PermissionRoute>
          } />
          <Route path="products/:id" element={
            <PermissionRoute requiredPermission="products">
              <ProductDetails />
            </PermissionRoute>
          } />
          <Route path="categories" element={
            <PermissionRoute requiredPermission="categories">
              <Categories />
            </PermissionRoute>
          } />
          <Route path="banners" element={
            <PermissionRoute requiredPermission="banners">
              <Banners />
            </PermissionRoute>
          } />
          <Route path="categories/:id" element={
            <PermissionRoute requiredPermission="categories">
              <CategoryDetails />
            </PermissionRoute>
          } />
          <Route path="customers" element={
            <PermissionRoute requiredPermission="customers">
              <Customers />
            </PermissionRoute>
          } />
          <Route path="customers/:id" element={
            <PermissionRoute requiredPermission="customers">
              <CustomerDetails />
            </PermissionRoute>
          } />
          {/* <Route path="support-page" element={<ChatPage />} /> */}
          <Route path="chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="support-tickets" element={
            <PermissionRoute requiredPermission="support-tickets">
              <SupportTickets />
            </PermissionRoute>
          } />
          {/* <Route path="referred-users" element={
            <PermissionRoute requiredPermission="referred-users">
              <ReferredUsers />
            </PermissionRoute>
          } /> */}
          <Route path="admin-profile" element={
            <PermissionRoute requiredPermission="admin-profile">
              <AdminprofilePage />
            </PermissionRoute>
          } />
          <Route path="privacy-policy" element={
            <ProtectedRoute>
              <Privacypolicy />
            </ProtectedRoute>
          } />
          <Route path="grievance-policy" element={
            <ProtectedRoute>
              <GrievancePolicy />
            </ProtectedRoute>
          } />
          <Route path="digigold-redemption-policy" element={
            <ProtectedRoute>
              <DigiGoldRedemptionPolicy />
            </ProtectedRoute>
          } />
          <Route path="return-policy" element={
            <ProtectedRoute>
              <Refundpolicy />
            </ProtectedRoute>
          } />
          <Route path="withdraw-policy" element={
            <ProtectedRoute>
              <Withdrawpolicy />
            </ProtectedRoute>
          } />
           <Route path="shipping-policy" element={
            <ProtectedRoute>
              <ShippingPolicy />
            </ProtectedRoute>
          } />
           <Route path="cancellation-policy" element={
            <ProtectedRoute>
              <CancellationPolicy />
            </ProtectedRoute>
          } />
          
           <Route path="terms-and-conditions" element={
            <ProtectedRoute>
              <TermsAndConditions />
            </ProtectedRoute>
          } />
          <Route path="investment-settings" element={
            <PermissionRoute requiredPermission="investment-settings">
              <Investmentsettings />
            </PermissionRoute>
          } />
          <Route path="autopay-subscriptions" element={
            <PermissionRoute requiredPermission="autopay-subscriptions">
              <AutopaySubscriptions />
            </PermissionRoute>
          } />
          <Route path="shipment-settings" element={
            <PermissionRoute requiredPermission="shipment-settings">
              <ShipmentSettings />
            </PermissionRoute>
          } />
          <Route path="maintenance" element={
            <PermissionRoute requiredPermission="maintenance">
              <Maintenance />
            </PermissionRoute>
          } />
          <Route path="admin-list" element={
            <PermissionRoute requiredPermission="admin-list">
              <AdminList />
            </PermissionRoute>
          } />
          <Route path="admin-details/:id" element={
            <ProtectedRoute>
              <AdminDetails />
            </ProtectedRoute>
          } />
          <Route path="debug/token" element={
            <ProtectedRoute>
              <TokenDebug />
            </ProtectedRoute>
          } />

       
          <Route path="button" element={<Button />} />
          <Route path="dropdown" element={<Dropdown />} />
          <Route path="badges" element={<Badges />} />
          <Route path="alert" element={<Alert />} />
          <Route path="progress" element={<Progressbar />} />
          <Route path="card" element={<Card />} />
          <Route path="avatar" element={<AvatarPage />} />
          <Route path="tooltip" element={<Tooltip />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="modal" element={<Modal />} />
          <Route path="pagination" element={<Pagination />} />
          <Route path="accordion" element={<AccrodainPage />} />
          <Route path="spinier" element={<SpinierPage />} />
          <Route path="tab" element={<TabPage />} />
          <Route path="video" element={<Video />} />
          <Route path="textfield" element={<InputPage />} />
          <Route path="textarea" element={<TextareaPage />} />
          <Route path="checkbox" element={<CheckboxPage />} />
          <Route path="radio" element={<RadioPage />} />
          <Route path="switch" element={<SwitchPage />} />
          <Route path="input-group" element={<InputGroupPage />} />
          <Route path="input-mask" element={<InputMask />} />
          <Route path="form-validation" element={<FormValidation />} />
          <Route path="file-input" element={<FileInput />} />
          <Route path="form-repeater" element={<FormRepeater />} />
          <Route path="select" element={<SelectPage />} />
          <Route path="react-select" element={<ReactSelectPage />} />
          <Route path="date-time-picker" element={<Flatpicker />} />
          <Route path="appex-chart" element={<AppexLineChartPage />} />
          <Route path="chartjs" element={<ChartJs />} />
          <Route path="recharts" element={<Recharts />} />
          <Route path="map" element={<MapPage />} />
          <Route path="table-basic" element={<BasicTablePage />} />
          <Route path="react_table" element={<TanstackTable />} />
          <Route path="invoice" element={<InvoicePage />} />
          <Route path="add-invoice" element={<InvoiceAddPage />} />
          <Route path="invoice-preview" element={<InvoicePreviewPage />} />
          <Route path="edit-invoice" element={<InvoiceEditPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="blank-page" element={<BlankPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="icons" element={<IconPage />} />
          <Route path="notifications" element={
            <PermissionRoute requiredPermission="notifications">
              <NotificationPage />
            </PermissionRoute>
          } />
          <Route path="appointments" element={
            <PermissionRoute requiredPermission="appointments">
              <AppointmentsPage />
            </PermissionRoute>
          } />
          <Route path="reviews" element={
            <PermissionRoute requiredPermission="reviews">
              <Reviews />
            </PermissionRoute>
          } />
          <Route path="*" element={<Navigate to="/404" />} />
        </Route>
        <Route
          path="/404"
          element={
            <Suspense fallback={<Loading />}>
              <Error />
            </Suspense>
          }
        />
      </Routes>
    </main>
    </AuthProvider>
  );
}

export default App;
