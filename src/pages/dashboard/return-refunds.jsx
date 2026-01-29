import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAllReturnRefundRequestsAdminQuery,
  useAcceptReturnRefundRequestMutation,
  useRejectReturnRefundRequestMutation,
} from '@/store/api/order/orderApi';
import { useCreateReturnShipmentMutation } from '@/store/api/shipment/shipmentApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';

const ReturnRefunds = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const itemsPerPage = 10;

  // Build query parameters for the API
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...(statusFilter && { status: statusFilter }),
    ...(requestTypeFilter && { requestType: requestTypeFilter }),
    ...(searchTerm && { search: searchTerm }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: requestsResponse, isLoading, error, refetch } = useGetAllReturnRefundRequestsAdminQuery(queryParams);
  const [acceptRequest] = useAcceptReturnRefundRequestMutation();
  const [rejectRequest] = useRejectReturnRefundRequestMutation();
  const [createReturnShipment, { isLoading: isCreatingReturnShipment }] = useCreateReturnShipmentMutation();

  // Extract data from API response
  const returnRequests = requestsResponse?.data?.returnRequests || [];
  const pagination = requestsResponse?.data?.pagination || {};
  const summary = requestsResponse?.data?.summary || {};
  const breakdown = requestsResponse?.data?.breakdown || {};

  const handleAccept = async (request) => {
    const requestId = typeof request === 'string' ? request : request._id;
    const orderCode = typeof request === 'object' ? request.orderId?.orderCode : null;
    const requestType = typeof request === 'object' ? request.requestType : null;
    const reason = typeof request === 'object' ? request.reason || request.items?.[0]?.reason : null;

    try {
      // First, accept the return/replacement request
      await acceptRequest({ requestId }).unwrap();
      
      // If it's a return request (not just refund), create return shipment in BVC
      if (requestType === 'return' && orderCode) {
        try {
          await createReturnShipment({
            orderCode: orderCode,
            reason: reason || 'Return approved by admin',
          }).unwrap();
          toast.success('Return/Replacement request approved and return shipment created successfully');
        } catch (shipmentError) {
          // If shipment creation fails, still show success for the approval
          console.error('Failed to create return shipment:', shipmentError);
          toast.warning('Return/Replacement request approved, but return shipment creation failed. Please create manually.');
        }
      } else {
        toast.success('Return/Replacement request approved successfully');
      }
      
      refetch();
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error(error?.data?.error || error?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectionMessage('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionMessage.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectRequest({
        requestId: selectedRequest._id,
        rejectionMessage: rejectionMessage.trim(),
      }).unwrap();
      toast.success('Return/Replacement request rejected successfully');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionMessage('');
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to reject request');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      requested: { color: 'bg-yellow-100 text-yellow-800', label: 'Requested' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      collected: { color: 'bg-blue-100 text-blue-800', label: 'Collected' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getRequestTypeBadge = (type) => {
    const typeConfig = {
      return: { color: 'bg-orange-100 text-orange-800', label: 'Return' },
      replacement: { color: 'bg-purple-100 text-purple-800', label: 'Replacement' },
    };

    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', label: type };
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
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
        <p className="text-red-500">Error loading return/replacement requests: {error.message}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Return & Replacement Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer return and replacement requests</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalRequests || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Icon icon="heroicons:document-text" className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Refund Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.totalRefundAmount)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Icon icon="heroicons:currency-rupee" className="text-2xl text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Refund</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.averageRefundAmount)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Icon icon="heroicons:chart-bar" className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by order code, customer..."
              className="form-control"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">All Status</option>
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="collected">Collected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Request Type
            </label>
            <select
              value={requestTypeFilter}
              onChange={(e) => {
                setRequestTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">All Types</option>
              <option value="return">Return</option>
              <option value="replacement">Replacement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Request ID
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Evidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created 
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {returnRequests.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No return/replacement requests found
                  </td>
                </tr>
              ) : (
                returnRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {request._id.substring(0, 8)}...
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {request.orderId?.orderCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>
                        <div className="font-medium">{request.userId?.name || 'N/A'}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {request.userId?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRequestTypeBadge(request.requestType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white min-w-[280px]">
                      <div className="space-y-2 max-w-md">
                        {request.items?.map((item, idx) => (
                          <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              {item.productId?.images?.[0] && (
                                <img
                                  src={item.productId.images[0]}
                                  alt={item.productId.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <div className="text-xs font-medium">
                                  {item.productId?.name || 'Product'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Qty: {item.qty} | Reason: {item.reason}
                                </div>
                                {item.note && (
                                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                                    Note: {item.note}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    {/* Evidence Column */}
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {(() => {
                        // Collect all media URLs from all items
                        const allMedia = request.items?.flatMap(item => item.mediaUrls || []) || [];
                        
                        if (allMedia.length === 0) {
                          return (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">
                              No evidence
                            </span>
                          );
                        }
                        
                        return (
                          <div className="flex flex-wrap gap-2 max-w-[200px]">
                            {allMedia.map((mediaUrl, mediaIdx) => {
                              const isVideo = mediaUrl.toLowerCase().includes('.mp4') ||
                                mediaUrl.toLowerCase().includes('.mov') ||
                                mediaUrl.toLowerCase().includes('.webm') ||
                                mediaUrl.toLowerCase().includes('/video/');
                              
                              return (
                                <div 
                                  key={mediaIdx} 
                                  className="relative group"
                                  title={isVideo ? 'Click to play video' : 'Click to view image'}
                                >
                                  {isVideo ? (
                                    <div 
                                      className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                      onClick={() => window.open(mediaUrl, '_blank')}
                                    >
                                      <Icon icon="heroicons:play-circle" className="text-3xl text-gray-600 dark:text-gray-300" />
                                    </div>
                                  ) : (
                                    <img
                                      src={mediaUrl}
                                      alt={`Evidence ${mediaIdx + 1}`}
                                      className="w-16 h-16 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-600"
                                      onClick={() => window.open(mediaUrl, '_blank')}
                                    />
                                  )}
                                  {/* Badge for video */}
                                  {isVideo && (
                                    <span className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-[10px] px-1 rounded-tl">
                                      VIDEO
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {/* Show count if more than 4
                            {allMedia.length > 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 w-full">
                                {allMedia.length} file{allMedia.length > 1 ? 's' : ''}
                              </div>
                            )} */}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {request.refundAmount && request.refundAmount > 0 
                        ? formatCurrency(request.refundAmount) 
                        : '₹0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'requested' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleAccept(request)}
                            disabled={isCreatingReturnShipment}
                            className="btn btn-sm btn-success"
                            size="sm"
                          >
                            {isCreatingReturnShipment ? (
                              <>
                                <LoadingIcon />
                                <span className="ml-1">Processing...</span>
                              </>
                            ) : (
                              <>
                                <Icon icon="heroicons:check" className="mr-1" />
                                Accept
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleRejectClick(request)}
                            className="btn btn-sm btn-danger"
                            size="sm"
                          >
                            <Icon icon="heroicons:x-mark" className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status === 'rejected' && request.rejectionMessage && (
                        <div className="text-xs text-red-600 dark:text-red-400 max-w-xs truncate" title={request.rejectionMessage}>
                          {request.rejectionMessage}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="btn btn-sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="btn btn-sm"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, pagination.totalRequests)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalRequests}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="btn btn-sm"
                  >
                    Previous
                  </Button>
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`btn btn-sm ${currentPage === page ? 'btn-primary' : ''}`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-4 py-2">...</span>;
                    }
                    return null;
                  })}
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={!pagination.hasNextPage}
                    className="btn btn-sm"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        title="Reject Return/Replacement Request"
        label="reject-modal"
        activeModal={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionMessage('');
          setSelectedRequest(null);
        }}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Please provide a reason for rejecting this request:
            </p>
            {selectedRequest && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded">
                <p className="text-sm font-medium">Order: {selectedRequest.orderId?.orderCode}</p>
                <p className="text-sm">Customer: {selectedRequest.userId?.name}</p>
              </div>
            )}
          </div>
          <Textarea
            value={rejectionMessage}
            onChange={(e) => setRejectionMessage(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
            className="form-control"
          />
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => {
                setShowRejectModal(false);
                setRejectionMessage('');
                setSelectedRequest(null);
              }}
              className="btn btn-outline-secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleReject} className="btn btn-danger">
              Reject Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReturnRefunds;

