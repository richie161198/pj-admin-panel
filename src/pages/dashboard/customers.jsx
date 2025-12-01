import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCustomersQuery, useDeleteCustomerMutation } from '@/store/api/auth/authApiSlice';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import * as XLSX from 'xlsx';

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const { data: customersResponse, isLoading, error, refetch } = useGetCustomersQuery();

  // Extract customers from API response
  const customers = customersResponse?.details || [];

  // Filter customers based on search term
  const filteredCustomers = customers?.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id).unwrap();
        toast.success('Customer deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const handleViewCustomer = (id) => {
    navigate(`/customers/${id}`);
  };

  const handleDownloadExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = customers.map((customer, index) => ({
        'S.No': index + 1,
        'Customer ID': customer._id,
        'Name': customer.name || 'N/A',
        'Email': customer.email || 'N/A',
        'Phone': customer.phone || 'N/A',
        'Status': customer.active ? 'Active' : 'Inactive',
        'Blocked': customer.isBlocked ? 'Yes' : 'No',
        'Mobile Verified': customer.mobileVerified ? 'Yes' : 'No',
        'Active Account': customer.activeAccount ? 'Yes' : 'No',
        'Balance': customer.balance || '0',
        'Gold Balance': customer.goldBalance || '0',
        'App ID': customer.appId || 'N/A',
        'Referral Code': customer.referralCode || 'N/A',
        'Role': customer.role || 'N/A',
        'Last Login': customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never',
        'Address': customer.address && customer.address.length > 0 
          ? (customer.address.find(addr => addr.isDefault)?.street || customer.address[0]?.street || 'N/A')
          : 'N/A',
        'City': customer.address && customer.address.length > 0 
          ? (customer.address.find(addr => addr.isDefault)?.city || customer.address[0]?.city || 'N/A')
          : 'N/A',
        'State': customer.address && customer.address.length > 0 
          ? (customer.address.find(addr => addr.isDefault)?.state || customer.address[0]?.state || 'N/A')
          : 'N/A',
        'Pincode': customer.address && customer.address.length > 0 
          ? (customer.address.find(addr => addr.isDefault)?.pincode || customer.address[0]?.pincode || 'N/A')
          : 'N/A'
      }));

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create a worksheet from the data
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [
        { wch: 5 },   // S.No
        { wch: 25 }, // Customer ID
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 10 }, // Status
        { wch: 10 }, // Blocked
        { wch: 15 }, // Mobile Verified
        { wch: 15 }, // Active Account
        { wch: 12 }, // Balance
        { wch: 15 }, // Gold Balance
        { wch: 20 }, // App ID
        { wch: 15 }, // Referral Code
        { wch: 10 }, // Role
        { wch: 15 }, // Last Login
        { wch: 30 }, // Address
        { wch: 15 }, // City
        { wch: 10 }, // State
        { wch: 10 }  // Pincode
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Customer data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export customer data');
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
        <p className="text-red-500">Error loading customers: {error.message}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your customer database</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleDownloadExcel}
            className="btn btn-outline-success"
            disabled={!customers || customers.length === 0}
          >
            <Icon icon="ph:download" className="mr-2" />
            Export Excel
          </Button>
          <Button
            onClick={() => navigate('/customers/new')}
            className="btn btn-primary"
          >
            <Icon icon="ph:plus" className="mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {customer.profilePhoto ? (
                          <img 
                            src={customer.profilePhoto} 
                            alt={customer.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {customer._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {customer.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {customer.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {customer.active ? 'Active' : 'Inactive'}
                      </span>
                      {customer.isBlocked && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Blocked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleViewCustomer(customer._id)}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <Icon icon="ph:eye" />
                      </Button>
                      <Button
                        onClick={() => navigate(`/customers/${customer._id}/edit`)}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <Icon icon="ph:pencil" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCustomer(customer._id)}
                        disabled={isDeleting}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <Icon icon="ph:trash" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-sm btn-outline"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-outline"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredCustomers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredCustomers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-sm btn-outline rounded-l-md"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn btn-sm ${
                        currentPage === page
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
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

export default Customers;





