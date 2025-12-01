import React from "react";
import { useParams } from "react-router-dom";
import { useGetAllProductOrdersAdminQuery } from "@/store/api/order/orderApi";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import LoadingIcon from "@/components/LoadingIcon";
import Button from "@/components/ui/Button";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n);

const OrderDetails = () => {
  const { id } = useParams();
  
  // Fetch all orders to find the specific one
  const { data: ordersResponse, isLoading, error } = useGetAllProductOrdersAdminQuery({
    page: 1,
    limit: 1000, // Get all orders to find the specific one
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading order details: {error.message}</p>
      </div>
    );
  }

  const orders = ordersResponse?.data?.orders || [];
  const order = orders.find(o => o._id === id);

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Order not found</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'processing': { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      'shipped': { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
      'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      'refunded': { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const paymentConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'paid': { color: 'bg-green-100 text-green-800', label: 'Paid' },
      'failed': { color: 'bg-red-100 text-red-800', label: 'Failed' },
      'refunded': { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };
    
    const config = paymentConfig[paymentStatus] || { color: 'bg-gray-100 text-gray-800', label: paymentStatus };
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Order ID: {order.orderCode}</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(order.status)}
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">
          <Card title="Products ordered" bodyClass="p-0">
            <div className="divide-y">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.productDataid?.images?.[0] || '/placeholder-product.jpg'}
                      alt={item.productDataid?.name || 'Product'}
                      className="w-14 h-14 rounded-md object-cover ring-1 ring-gray-200"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.productDataid?.name || 'Product'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Brand: {item.productDataid?.brand || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {currency(item.price || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity || 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <span>Payment</span>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
            }
            bodyClass="p-0"
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{currency(order.totalAmount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{currency(order.shippingCost || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{currency(order.tax || 0)}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">{currency(order.totalAmount || 0)}</span>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer payment</span>
              <span className="font-semibold">{currency(order.totalAmount || 0)}</span>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card title="Customer" bodyClass="p-0">
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                {/* <Avatar 
                  src={order.user?.avatar || '/placeholder-avatar.jpg'} 
                  className="h-12 w-12" 
                /> */}
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {order.user?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.user?.id || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="divide-y">
                <div className="py-4 flex items-center gap-3">
                  <Icon icon="solar:inbox-line-duotone" className="text-xl text-gray-500" />
                  <span className="text-sm">{order.user?.email || 'N/A'}</span>
                </div>
                <div className="py-4 flex items-center gap-3">
                  <Icon icon="solar:phone-linear" className="text-xl text-gray-500" />
                  <span className="text-sm">{order.user?.phone || 'N/A'}</span>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="pt-2">
                  <div className="text-sm font-semibold mb-2">Shipping Address</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{order.shippingAddress.street || ''}</div>
                    <div>{order.shippingAddress.city || ''}, {order.shippingAddress.state || ''}</div>
                    <div>{order.shippingAddress.zipCode || ''}</div>
                    <div>{order.shippingAddress.country || ''}</div>
                  </div>
                </div>
              )}

              {order.billingAddress && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-semibold mb-2">Billing Address</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{order.billingAddress.street || ''}</div>
                    <div>{order.billingAddress.city || ''}, {order.billingAddress.state || ''}</div>
                    <div>{order.billingAddress.zipCode || ''}</div>
                    <div>{order.billingAddress.country || ''}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Order Information">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="text-sm font-medium">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Updated</span>
                <span className="text-sm font-medium">
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Items</span>
                <span className="text-sm font-medium">{order.items?.length || 0}</span>
              </div>
            </div>
          </Card>

          <Card title="Actions">
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/invoice/product/${id}`)}
                className="btn btn-primary w-full"
              >
                <Icon icon="ph:file-text" className="mr-2" />
                View Invoice
              </Button>
              <Button
                onClick={() => window.print()}
                className="btn btn-outline w-full"
              >
                <Icon icon="ph:printer" className="mr-2" />
                Print Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;