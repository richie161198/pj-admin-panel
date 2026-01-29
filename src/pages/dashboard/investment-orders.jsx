import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllOrdersAdminQuery } from '@/store/api/order/orderApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import Badge from '@/components/ui/Badge';
import * as XLSX from 'xlsx';

const InvestmentOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 10;

  // Build query parameters for the API
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...(statusFilter && { status: statusFilter }),
    ...(typeFilter && { type: typeFilter }),
    ...(searchTerm && { search: searchTerm }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: ordersResponse, isLoading, error, refetch } = useGetAllOrdersAdminQuery(queryParams);

  // Extract data from API response
  const orders = ordersResponse?.data?.orders || [];
  const pagination = ordersResponse?.data?.pagination || {};
  const summary = ordersResponse?.data?.summary || {};

  console.log('Investment Orders Response:', ordersResponse);
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
    navigate(`/investment-orders/${id}`);
  };

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

  const handleDownloadExcel = () => {
    try {
      const excelData = orders.map((order, index) => ({
        'S.No': index + 1,
        'Order ID': order.orderId || 'N/A',
        'Customer Name': order.userId?.name || 'N/A',
        'Customer Email': order.userId?.email || 'N/A',
        'Customer Phone': order.userId?.phone || 'N/A',
        'Type': order.orderType || 'N/A',
        'Asset': order.transactionType || 'N/A',
        'Status': order.status || 'N/A',
        'Amount': order.inramount || 0,
        'Currency': order.currency || 'INR',
        'Payment Method': order.Payment_method || 'N/A',
        'Created At': order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
        'Updated At': order.updatedAt ? new Date(order.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Investment Orders');
      
      const fileName = `investment-orders-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel file');
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
      <div className="text-center py-12">
        <Icon icon="ph:warning-circle" className="text-6xl text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        <Button onClick={() => refetch()} className="btn btn-primary">
          <Icon icon="ph:arrow-clockwise" className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage investment transactions and orders</p>
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Icon icon="ph:shopping-cart" className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <Icon icon="ph:currency-circle-dollar" className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{summary.totalAmount?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Icon icon="ph:chart-line" className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{summary.averageOrderValue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="gold_purchase">Gold Purchase</option>
              <option value="silver_purchase">Silver Purchase</option>
              <option value="gold_sale">Gold Sale</option>
              <option value="silver_sale">Silver Sale</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="Start Date"
            />
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Icon icon="ph:shopping-cart" className="text-6xl text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Investment Orders Found</h3>
                      <p className="text-gray-600 dark:text-gray-400">No orders match your current filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr                           onClick={() => handleViewOrder(order._id)}
 key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.orderId || 'N/A'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.currency || 'INR'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.userId?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(order.orderType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(order.transactionType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">₹ {order.inramount?.toLocaleString() || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.Payment_method || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }) : 'N/A'}
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
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </td> */}
                  </tr>
                ))
              )}
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
                className="btn btn-outline"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNextPage}
                className="btn btn-outline"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalOrders)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.totalOrders}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    <Icon icon="ph:caret-left" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.currentPage - 2)) + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === pagination.currentPage
                            ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    <Icon icon="ph:caret-right" />
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

export default InvestmentOrders;
