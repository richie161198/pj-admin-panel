import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllProductOrdersAdminQuery } from '@/store/api/order/orderApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import Badge from '@/components/ui/Badge';
import * as XLSX from 'xlsx';

const Orders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 10;

  // Build query parameters for the API
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...(statusFilter && { status: statusFilter }),
    ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
    ...(searchTerm && { search: searchTerm }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: ordersResponse, isLoading, error, refetch } = useGetAllProductOrdersAdminQuery(queryParams);

  // Extract data from API response
  const orders = ordersResponse?.data?.orders || [];
  const pagination = ordersResponse?.data?.pagination || {};
  const summary = ordersResponse?.data?.summary || {};
  const breakdown = ordersResponse?.data?.breakdown || {};

  console.log('Orders Response:', ordersResponse);
  console.log('Orders:', orders);
  console.log('Pagination:', pagination);
  console.log('Summary:', summary);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // await updateOrder({ orderId, status: newStatus }).unwrap();
      toast.success('Order status updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleViewOrder = (id) => {
    navigate(`/orders/${id}`);
  };

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

  // Get unique statuses for filter from breakdown data
  const statuses = breakdown.status?.map(item => item._id) || [];
  const paymentStatuses = breakdown.paymentStatus?.map(item => item._id) || [];

  const handleDownloadExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = orders.map((order, index) => ({
        'S.No': index + 1,
        'Order ID': order.orderCode || 'N/A',
        'Customer Name': order.user?.name || 'N/A',
        'Customer Email': order.user?.email || 'N/A',
        'Customer Phone': order.user?.phone || 'N/A',
        'Status': order.status || 'N/A',
        'Payment Status': order.paymentStatus || 'N/A',
        'Total Amount': order.totalAmount || 0,
        'Items Count': order.items?.length || 0,
        'Created At': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
        'Updated At': order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A'
      }));

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create a worksheet from the data
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [
        { wch: 5 },   // S.No
        { wch: 20 },  // Order ID
        { wch: 25 },  // User ID
        { wch: 15 },  // Status
        { wch: 15 },  // Payment Method
        { wch: 12 },  // Subtotal
        { wch: 12 },  // Shipping
        { wch: 10 },  // Tax
        { wch: 12 },  // Discount
        { wch: 15 },  // Grand Total
        { wch: 10 },  // Currency
        { wch: 12 },  // Items Count
        { wch: 15 },  // Created At
        { wch: 15 }   // Updated At
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Order data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export order data');
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
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading orders: {error.message}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer product orders</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleDownloadExcel}
            className="btn btn-outline-success"
            disabled={!orders || orders.length === 0}
          >
            <Icon icon="ph:download" className="mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

{/* // 9384524137 */}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon icon="ph:shopping-cart" className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalOrders || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon icon="ph:currency-dollar" className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹ {summary.totalAmount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon icon="ph:chart-line" className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹ {summary.averageOrderValue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers, or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                  {/* {status.charAt(0).toUpperCase() + status.slice(1)} */}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Payment Status</option>
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {/* {status.charAt(0).toUpperCase() + status.slice(1)} */}
                                    {status}

                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                // console.log(order,"sdsds"),
                <tr                        onClick={() => handleViewOrder(order._id)}
 key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.orderCode || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.items?.length || 0} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.user?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.user?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="truncate max-w-32">
                          {item.productDataid?.name || 'Product'}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{order.items.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{order.totalAmount?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleViewOrder(order._id)}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <Icon icon="ph:eye" />
                      </Button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="btn btn-sm btn-outline"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNextPage}
                className="btn btn-sm btn-outline"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalOrders)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalOrders}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.hasPrevPage}
                    className="btn btn-sm btn-outline rounded-l-md"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn btn-sm ${
                        pagination.currentPage === page
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={!pagination.hasNextPage}
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
    </div>
  );
};

export default Orders;
