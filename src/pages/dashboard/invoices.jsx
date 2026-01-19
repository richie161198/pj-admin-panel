import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllInvoicesQuery, useDeleteInvoiceMutation } from '@/store/api/invoices/invoiceApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import LoadingIcon from '@/components/LoadingIcon';
import Badge from '@/components/ui/Badge';
import * as XLSX from 'xlsx';

const Invoices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const { data: invoicesData, isLoading, error, refetch } = useGetAllInvoicesQuery({
    page: currentPage,
    limit: 25,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    startDate,
    endDate
  });

  const [deleteInvoice] = useDeleteInvoiceMutation();

  const invoices = invoicesData?.data || [];
  const pagination = invoicesData?.pagination || {};

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Download single invoice
  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      toast.info('Preparing invoice for download...');

      const response = await fetch(`http://localhost:4000/api/v0/invoices/${invoiceId}/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceNumber || `invoice-${invoiceId}`}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Invoice downloaded successfully');
      } else {
        toast.error('Failed to download invoice');
      }
    } catch (error) {
      console.error('Download error:', error);
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
          const response = await fetch(`http://localhost:4000/api/v0/invoices/${invoiceId}/download`, {
            method: 'GET',
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            successCount++;

            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            failCount++;
          }
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
      const excelData = invoices.map((invoice, index) => {
        const gstBreakdown = getGSTBreakdown(invoice);
        const isTN = gstBreakdown.isTamilNadu;
        const totalGST = gstBreakdown.roundedGST;
        const shippingCharges = invoice.shippingDetails?.shippingPrice || invoice.shippingDetails?.shippingAmount || 0;

        return {
          'S.No': index + 1,
          'Invoice Number': invoice.invoiceNumber || 'N/A',
          'Customer Name': invoice.customerDetails?.name || 'N/A',
          'Customer Email': invoice.customerDetails?.email || 'N/A',
          'Customer Phone': invoice.customerDetails?.phone || 'N/A',
          'Subtotal': invoice.pricing?.subtotal || 0,
          'Making Charges': invoice.pricing?.totalMakingCharges || 0,
          'GST Type': isTN ? 'CGST + SGST' : 'IGST',
          'CGST (1.5%)': isTN ? gstBreakdown.cgst.toFixed(2) : 'N/A',
          'SGST (1.5%)': isTN ? gstBreakdown.sgst.toFixed(2) : 'N/A',
          'IGST (3%)': !isTN ? gstBreakdown.igst.toFixed(2) : 'N/A',
          'Total GST': totalGST > 0 ? totalGST.toFixed(2) : 0,
          'Shipping Charges': shippingCharges,
          'Discount': invoice.pricing?.totalDiscount || 0,
          'Grand Total': invoice.pricing?.grandTotal || 0,
          'Total Amount (Grand Total + Shipping)': Math.ceil((invoice.pricing?.grandTotal || 0) + shippingCharges),
          'Status': invoice.status || 'N/A',
          'Invoice Date': invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A',
        };
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Commerce Invoices');

      const colWidths = [
        { wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 25 },
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
        { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `Commerce_Invoices_${new Date().toISOString().slice(0, 10)}.xlsx`);
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

  // Handle delete
  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(invoiceId).unwrap();
        toast.success('Invoice deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete invoice');
      }
    }
  };

  // View invoice modal
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Check if address is in Tamil Nadu
  const isTamilNadu = (invoice) => {
    const shippingState = invoice.shippingDetails?.shippingAddress?.state?.toUpperCase() || '';
    const billingState = invoice.customerDetails?.address?.state?.toUpperCase() || '';
    const state = shippingState || billingState;
    return state.includes('TAMIL NADU') || 
           state.includes('TAMILNADU') || 
           state.includes(' TN ') || 
           state.endsWith(' TN');
  };

  // Calculate GST breakdown
  const getGSTBreakdown = (invoice) => {
    const totalGST = invoice.pricing?.totalGST || 0;
    if (totalGST === 0) return { type: 'N/A', amount: 0, cgst: 0, sgst: 0, igst: 0, roundedGST: 0, roundOff: 0, isTamilNadu: false };
    
    const isTN = isTamilNadu(invoice);
    // Use actual GST value without rounding
    const actualGST = totalGST;
    
    if (isTN) {
      const cgst = actualGST / 2;
      const sgst = actualGST / 2;
      return { 
        type: 'CGST + SGST', 
        amount: actualGST, 
        cgst: cgst, 
        sgst: sgst, 
        igst: 0,
        roundedGST: actualGST,
        roundOff: 0,
        isTamilNadu: true
      };
    } else {
      return { 
        type: 'IGST', 
        amount: actualGST, 
        cgst: 0, 
        sgst: 0, 
        igst: actualGST,
        roundedGST: actualGST,
        roundOff: 0,
        isTamilNadu: false
      };
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'secondary', text: 'Draft' },
      sent: { color: 'info', text: 'Sent' },
      paid: { color: 'success', text: 'Paid' },
      overdue: { color: 'danger', text: 'Overdue' },
      cancelled: { color: 'secondary', text: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <Badge className={`badge-${config.color}`}>{config.text}</Badge>;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading invoices</h3>
            <div className="mt-2 text-sm text-red-700">
              {error?.data?.message || error?.message || 'Unknown error occurred'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
            Commerce Invoices
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage and download customer invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon="heroicons-outline:download"
            text="Export to Excel"
            className="btn-success"
            onClick={handleExportToExcel}
            disabled={isLoading || invoices.length === 0}
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
                  placeholder="Invoice No, Customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
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
          {isLoading ? (
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
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        GST
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Shipping
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Total Amount
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
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              {format(new Date(invoice.createdAt), 'dd MMM yyyy, hh:mm a')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {invoice.customerDetails?.name || 'N/A'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {invoice.customerDetails?.email || 'N/A'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {invoice.customerDetails?.phone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {invoice.products?.length || 0} item(s)
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              Total Weight: {invoice.products?.reduce((sum, p) => sum + (p.weight || 0), 0).toFixed(2)}g
                            </div>
                          </div>
                        </td>     <td className="px-6 py-4">
                          {(() => {
                            const gstBreakdown = getGSTBreakdown(invoice);
                            const isTN = gstBreakdown.isTamilNadu;
                            const totalGST = gstBreakdown.roundedGST;

                            if (totalGST === 0) {
                              return <div className="text-xs text-slate-500 dark:text-slate-400">N/A</div>;
                            }

                            return (
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {isTN ? (
                                  <>
                                    <div className="text-xs">CGST (1.5%): {formatCurrency(gstBreakdown.cgst)}</div>
                                    <div className="text-xs">SGST (1.5%): {formatCurrency(gstBreakdown.sgst)}</div>
                                  </>
                                ) : (
                                  <div className="text-xs">IGST (3%): {formatCurrency(gstBreakdown.igst)}</div>
                                )}
                                <div className="font-semibold mt-1">Total: {formatCurrency(totalGST)}</div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              ₹{invoice.pricing?.grandTotal?.toLocaleString('en-IN') || 0}
                            </div>
                            {/* <div className="text-xs text-slate-500 dark:text-slate-400">
                              Subtotal: ₹{invoice.pricing?.subtotal?.toLocaleString('en-IN') || 0}
                            </div> */}
                          </div>
                        </td>
                   
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {formatCurrency(invoice.shippingDetails?.shippingPrice || invoice.shippingDetails?.shippingAmount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {(() => {
                              const grandTotal = invoice.pricing?.grandTotal || 0;
                              const shippingCharges = invoice.shippingDetails?.shippingPrice || invoice.shippingDetails?.shippingAmount || 0;
                              const totalAmount = grandTotal + shippingCharges;
                              const totalAmountCeil = Math.ceil(totalAmount);
                              return formatCurrency(totalAmountCeil);
                            })()}
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
                              onClick={() => handleViewInvoice(invoice)}
                              title="View Details"
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
                      {pagination.total || invoices.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Amount</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      ₹{invoices.reduce((sum, inv) => sum + (inv.pricing?.grandTotal || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total GST</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      ₹{invoices.reduce((sum, inv) => sum + (inv.pricing?.totalGST || 0), 0).toLocaleString('en-IN')}
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

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={pagination.current === 1}
                      className="btn btn-sm btn-outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                      disabled={pagination.current === pagination.pages}
                      className="btn btn-sm btn-outline"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-medium">{((pagination.current - 1) * 25) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.current * 25, pagination.total || 0)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total || 0}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <Button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={pagination.current === 1}
                          className="btn btn-sm btn-outline rounded-l-md"
                        >
                          Previous
                        </Button>
                        {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => {
                          let pageNum;
                          if (pagination.pages <= 10) {
                            pageNum = i + 1;
                          } else if (pagination.current <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.current >= pagination.pages - 4) {
                            pageNum = pagination.pages - 9 + i;
                          } else {
                            pageNum = pagination.current - 5 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`btn btn-sm ${
                                pagination.current === pageNum
                                  ? 'btn-primary'
                                  : 'btn-outline'
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        <Button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                          disabled={pagination.current === pagination.pages}
                          className="btn btn-sm btn-outline rounded-r-md"
                        >
                          Next
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-slate-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Invoice Details - {selectedInvoice.invoiceNumber}
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Customer Information</h4>
                  <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md">
                    <p><strong>Name:</strong> {selectedInvoice.customerDetails?.name}</p>
                    <p><strong>Email:</strong> {selectedInvoice.customerDetails?.email}</p>
                    <p><strong>Phone:</strong> {selectedInvoice.customerDetails?.phone}</p>
                    <p><strong>Address:</strong> {selectedInvoice.customerDetails?.address?.street}, {selectedInvoice.customerDetails?.address?.city}, {selectedInvoice.customerDetails?.address?.state} - {selectedInvoice.customerDetails?.address?.pincode}</p>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Products</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Product</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Qty</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Weight</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Purity</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase">Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {selectedInvoice.products?.map((product, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{product.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{product.quantity}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{product.weight || 0}g</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{product.purity}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{formatCurrency(product.finalPrice || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Pricing Summary</h4>
                  <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedInvoice.pricing?.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Making Charges:</span>
                      <span>{formatCurrency(selectedInvoice.pricing?.totalMakingCharges || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST:</span>
                      <span>{formatCurrency(selectedInvoice.pricing?.totalGST || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>{formatCurrency(selectedInvoice.pricing?.totalDiscount || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-200 dark:border-slate-600 pt-2">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(selectedInvoice.pricing?.grandTotal || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice._id, selectedInvoice.invoiceNumber)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-slate-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
