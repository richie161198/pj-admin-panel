import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAllOrdersAdminQuery } from "@/store/api/order/orderApi";
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

const InvestmentOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ordersResponse, isLoading, error } = useGetAllOrdersAdminQuery({
    page: 1,
    limit: 1000, // Fetch all orders to find the specific one
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
      <div className="text-center py-12">
        <Icon icon="ph:warning-circle" className="text-6xl text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Order</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        <Button onClick={() => navigate('/investment-orders')} className="btn btn-primary">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const orders = ordersResponse?.data?.orders || [];
  const order = orders.find(o => o._id === id);

  if (!order) {
    return (
      <div className="text-center py-12">
        <Icon icon="ph:shopping-cart" className="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Order Not Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The order you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/investment-orders')} className="btn btn-primary">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending' },
      processing: { color: 'info', text: 'Processing' },
      completed: { color: 'success', text: 'Completed' },
      failed: { color: 'danger', text: 'Failed' },
      cancelled: { color: 'secondary', text: 'Cancelled' },
      refunded: { color: 'warning', text: 'Refunded' }
    };

    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <Badge className={`badge-${config.color}`}>{config.text}</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      deposit: { color: 'success', text: 'Deposit' },
      withdrawal: { color: 'warning', text: 'Withdrawal' },
      gold_purchase: { color: 'info', text: 'Gold Purchase' },
      silver_purchase: { color: 'secondary', text: 'Silver Purchase' },
      gold_sale: { color: 'danger', text: 'Gold Sale' },
      silver_sale: { color: 'secondary', text: 'Silver Sale' }
    };

    const config = typeConfig[type] || { color: 'secondary', text: type };
    return <Badge className={`badge-${config.color}`}>{config.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Order Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Order ID: {order.orderId}</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(order.status)}
          {getTypeBadge(order.orderType)}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Transaction Details */}
          <Card title="Transaction Details" bodyClass="p-0">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order ID</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.orderId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type</label>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(order.orderType)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <p className="text-sm text-gray-900 dark:text-white font-semibold">
                    {currency(order.inramount || 0)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.currency || 'INR'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.transactionType || 'N/A'}</p>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gold Price </label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.goldCurrentPrice || 'INR'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.Payment_method || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>

              {order.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.description}</p>
                </div>
              )}

              {order.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Investment Details */}
          {(order.type === 'gold_purchase' || order.type === 'silver_purchase' || order.type === 'gold_sale' || order.type === 'silver_sale') && (
            <Card title="Investment Details" bodyClass="p-0">
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metal Type</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {order.type?.includes('gold') ? 'Gold' : 'Silver'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                    <p className="text-sm text-gray-900 dark:text-white">{order.quantity || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price per Unit</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {order.pricePerUnit ? currency(order.pricePerUnit) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Value</label>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {currency(order.amount || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Details */}
          <Card title="Payment Information" bodyClass="p-0">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.Payment_method || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.status || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.orderId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <p className="text-sm text-gray-900 dark:text-white">{order.orderType || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card title="Customer Information" bodyClass="p-0">
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <Avatar
                  // src={order.user?.avatar || '/placeholder-avatar.jpg'}
                  src={'/placeholder-avatar.jpg'}
                  className="h-12 w-12"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {order.userId?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.userId?.email || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="divide-y">
                <div className="py-4 flex items-center gap-3">
                  <Icon icon="solar:inbox-line-duotone" className="text-xl text-gray-500" />
                  <span className="text-sm">{order.userId?.email || 'N/A'}</span>
                </div>
                <div className="py-4 flex items-center gap-3">
                  <Icon icon="solar:phone-linear" className="text-xl text-gray-500" />
                  <span className="text-sm">{order.userId?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Information */}
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
              {/* <div className="flex justify-between">
                <span className="text-sm text-gray-600">Updated</span>
                <span className="text-sm font-medium">
                  {order.updatedAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium">{order.orderType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium">{order.status || 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card title="Actions">
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/invoice/investment/${id}`)}
                className="btn btn-primary w-full"
              >
                <Icon icon="ph:file-text" className="mr-2" />
                View Invoice
              </Button>
              <Button
                onClick={() => navigate('/investment-orders')}
                className="btn btn-outline w-full"
              >
                <Icon icon="ph:arrow-left" className="mr-2" />
                Back to Orders
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

export default InvestmentOrderDetails;
