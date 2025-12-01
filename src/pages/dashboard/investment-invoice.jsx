import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/axios';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import Badge from '@/components/ui/Badge';
import * as XLSX from 'xlsx';

const InvestmentInvoice = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const itemsPerPage = 10;

  // Fetch invoices
  useEffect(() => {
    fetchInvoices();
  }, [currentPage, statusFilter, typeFilter, orderTypeFilter, searchTerm, startDate, endDate]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('transactionType', typeFilter);
      if (orderTypeFilter) params.append('orderType', orderTypeFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/investment-invoices/all?${params.toString()}`);
      
      if (response.data.success) {
        setInvoices(response.data.data || []);
      } else {
        toast.error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setOrderTypeFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Download single invoice
  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      toast.info('Preparing invoice for download...');
      
      const response = await api.get(`/investment-invoices/download/${invoiceId}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  // Download by order ID
  const handleDownloadByOrderId = async (orderId) => {
    try {
      toast.info('Preparing invoice for download...');
      
      const response = await api.get(`/investment-invoices/download-by-order/${orderId}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  // Bulk download invoices
  const handleBulkDownload = async () => {
    if (selectedInvoices.length === 0) {
      toast.warning('Please select invoices to download');
      return;
    }

    setDownloading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const invoiceId of selectedInvoices) {
        const invoice = invoices.find(inv => inv._id === invoiceId);
        if (!invoice) continue;

        try {
          const response = await api.get(`/investment-invoices/download/${invoiceId}`, {
            responseType: 'blob',
          });

          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${invoice.invoiceNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          successCount++;
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error downloading invoice ${invoice.invoiceNumber}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully downloaded ${successCount} invoice(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to download ${failCount} invoice(s)`);
      }

      setSelectedInvoices([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error in bulk download:', error);
      toast.error('Bulk download failed');
    } finally {
      setDownloading(false);
    }
  };

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      const excelData = invoices.map((invoice, index) => ({
        'S.No': index + 1,
        'Invoice Number': invoice.invoiceNumber || 'N/A',
        'Order ID': invoice.orderId || 'N/A',
        'Customer Name': invoice.customerName || 'N/A',
        'Customer Email': invoice.customerEmail || 'N/A',
        'Customer Phone': invoice.customerPhone || 'N/A',
        'Order Type': invoice.orderType?.toUpperCase() || 'N/A',
        'Transaction Type': invoice.transactionType || 'N/A',
        'Product': invoice.product || 'N/A',
        'Quantity (grams)': invoice.quantity || 0,
        'Rate Per Gram': invoice.ratePerGram || 0,
        'Amount': invoice.amount || 0,
        'GST Rate (%)': invoice.gstRate || 0,
        'GST Amount': invoice.gstAmount || 0,
        'Total Invoice Value': invoice.totalInvoiceValue || 0,
        'Payment Method': invoice.paymentMethod || 'N/A',
        'Status': invoice.status || 'N/A',
        'Invoice Date': invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A',
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Investment Invoices');

      const colWidths = [
        { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
        { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
        { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
        { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 15 },
        { wch: 12 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `Investment_Invoices_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual checkbox
  const handleCheckboxChange = (invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'secondary', text: 'Draft' },
      issued: { color: 'success', text: 'Issued' },
      paid: { color: 'info', text: 'Paid' },
      cancelled: { color: 'danger', text: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <Badge className={`badge-${config.color}`}>{config.text}</Badge>;
  };

  // Get order type badge
  const getOrderTypeBadge = (type) => {
    const typeConfig = {
      buy: { color: 'success', text: 'BUY' },
      sell: { color: 'warning', text: 'SELL' },
    };

    const config = typeConfig[type] || { color: 'secondary', text: type };
    return <Badge className={`badge-${config.color}`}>{config.text}</Badge>;
  };

  // Get transaction type badge
  const getTransactionTypeBadge = (type) => {
    const typeConfig = {
      GOLD: { color: 'warning', text: 'GOLD', icon: '🥇' },
      SILVER: { color: 'secondary', text: 'SILVER', icon: '🥈' },
    };

    const config = typeConfig[type] || { color: 'info', text: type, icon: '' };
    return (
      <Badge className={`badge-${config.color}`}>
        {config.icon} {config.text}
      </Badge>
    );
  };

  // Pagination
  const totalPages = Math.ceil(invoices.length / itemsPerPage);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
            Investment Invoices
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage and download investment transaction invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon="heroicons-outline:download"
            text="Export to Excel"
            className="btn-success"
            onClick={handleExportToExcel}
            disabled={loading || invoices.length === 0}
          />
          {selectedInvoices.length > 0 && (
            <Button
              icon="heroicons-outline:download"
              text={`Download Selected (${selectedInvoices.length})`}
              className="btn-primary"
              onClick={handleBulkDownload}
              disabled={downloading}
              isLoading={downloading}
            />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {/* Search */}
            <div>
              <label className="form-label">Search</label>
              <div className="relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Invoice No, Order ID, Customer..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Icon
                  icon="heroicons-outline:search"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <label className="form-label">Asset Type</label>
              <select
                className="form-control"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Assets</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
              </select>
            </div>

            {/* Order Type Filter */}
            <div>
              <label className="form-label">Order Type</label>
              <select
                className="form-control"
                value={orderTypeFilter}
                onChange={(e) => {
                  setOrderTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                text="Clear Filters"
                className="btn-outline-secondary w-full"
                onClick={clearFilters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="card">
        <div className="card-body px-0 pb-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingIcon />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20">
              <Icon
                icon="heroicons-outline:document-text"
                className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
                width="64"
              />
              <p className="text-slate-500 dark:text-slate-400">No invoices found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="form-checkbox"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Invoice Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice._id)}
                            onChange={() => handleCheckboxChange(invoice._id)}
                            className="form-checkbox"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {invoice.invoiceNumber}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Order: {invoice.orderId}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {invoice.customerName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {invoice.customerEmail}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {invoice.customerPhone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex gap-2">
                              {getOrderTypeBadge(invoice.orderType)}
                              {getTransactionTypeBadge(invoice.transactionType)}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {invoice.quantity}g @ ₹{invoice.ratePerGram}/g
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              {invoice.paymentMethod}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              ₹{invoice.totalInvoiceValue?.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Base: ₹{invoice.amount?.toLocaleString('en-IN')}
                            </div>
                            {invoice.gstAmount > 0 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                GST ({invoice.gstRate}%): ₹{invoice.gstAmount?.toLocaleString('en-IN')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <Button
                              icon="heroicons-outline:download"
                              className="btn-sm btn-primary"
                              onClick={() => handleDownloadInvoice(invoice._id, invoice.invoiceNumber)}
                              title="Download Invoice"
                            />
                            {/* <Button
                              icon="heroicons-outline:eye"
                              className="btn-sm btn-outline-secondary"
                              onClick={() => navigate(`/investment-orders/${invoice.orderId}`)}
                              title="View Order"
                            /> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Invoices</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {invoices.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Amount</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      ₹{invoices.reduce((sum, inv) => sum + (inv.totalInvoiceValue || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total GST</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      ₹{invoices.reduce((sum, inv) => sum + (inv.gstAmount || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Selected</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedInvoices.length}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentInvoice;
