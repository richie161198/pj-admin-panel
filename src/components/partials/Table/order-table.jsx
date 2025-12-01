import React, { useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import { useGetAllProductOrdersAdminQuery } from "@/store/api/order/orderApi";
import { useNavigate } from "react-router-dom";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          className="table-checkbox"
        />
      </>
    );
  }
);

const RecentOrderTable = () => {
  const navigate = useNavigate();
  const { data: ordersResponse, isLoading, error } = useGetAllProductOrdersAdminQuery();
console.log("Orders response:", ordersResponse, "Loading:", isLoading, "Error:", error);
  // Extract orders from response
  const orders = useMemo(() => {
    if (!ordersResponse) return [];
    
    // Handle different response structures
    const ordersList = ordersResponse?.orders || 
                      ordersResponse?.details || 
                      ordersResponse?.data?.orders ||
                      ordersResponse?.data?.details ||
                      (Array.isArray(ordersResponse?.data) ? ordersResponse.data : null) ||
                      (Array.isArray(ordersResponse) ? ordersResponse : []);
    
    // Get last 10 orders (most recent)
    return Array.isArray(ordersList) ? ordersList.slice(0, 10) : [];
  }, [ordersResponse]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format price helper
  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹0.00';
    return `₹${parseFloat(price).toLocaleString('en-IN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'delivered':
        return 'bg-green-500 text-green-500';
      case 'shipped':
        return 'bg-blue-500 text-blue-500';
      case 'placed':
        return 'bg-yellow-500 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500 text-red-500';
      default:
        return 'bg-gray-500 text-gray-500';
    }
  };

  const COLUMNS = [
    {
      Header: "Order ID",
      accessor: "_id",
      Cell: ({ row }) => {
        const orderId = row?.original?._id || '';
        const shortId = orderId.slice(-8).toUpperCase();
        return (
          <span 
            className="text-sm text-indigo-500 font-medium cursor-pointer hover:underline"
            // onClick={() => navigate(`/order-details/${orderId}`)}
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            #{shortId}
          </span>
        );
      },
    },
    {
      Header: "Customer",
      accessor: "userId",
      Cell: ({ row }) => {
        const user = row?.original?.userId;
        const userName = row?.original.user?.name || 'Guest User';
        const userEmail = row?.original.user?.email || 'N/A';
        return (
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-300 capitalize block">
              {userName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-light mt-[1px] block lowercase">
              {userEmail}
            </span>
          </div>
        );
      },
    },
    {
      Header: "Date",
      accessor: "createdAt",
      Cell: ({ row }) => {
        return (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {formatDate(row?.original?.createdAt)}
          </div>
        );
      },
    },
    {
      Header: "Items",
      accessor: "products",
      Cell: ({ row }) => {
        const products = row?.original?.products || [];
        const totalItems = products.reduce((sum, item) => sum + (item.quantity || 0), 0);
        return (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {/* {totalItems} {totalItems === 1 ? 'item' : 'items'} */}
            {row?.original?.items?.length || 0} {row?.original?.items?.length === 1 ? 'item' : 'items'}
          </div>
        );
      },
    },
    {
      Header: "Amount",
      accessor: "totalAmount",
      Cell: ({ row }) => {
        return (
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPrice(row?.original?.totalAmount)}
          </div>
        );
      },
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ row }) => {
        const status = row?.original?.status || 'pending';
        const statusColor = getStatusColor(status);
        return (
          <span className="flex items-center space-x-2">
            <span className={`h-2 w-2 rounded-full inline-block ${statusColor.split(' ')[0]}`}></span>
            <span className={`text-sm capitalize ${statusColor.split(' ')[1]}`}>
              {status}
            </span>
          </span>
        );
      },
    },
  ];

  const columns = useMemo(() => COLUMNS, [navigate]);
  const data = useMemo(() => orders, [orders]);

  const tableInstance = useTable(
    {
      columns,
      data,
    },

    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;

  // Loading state
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading recent orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Icon icon="heroicons-outline:exclamation-circle" className="text-red-500 text-5xl mb-4 mx-auto" />
            <p className="text-red-500 font-semibold mb-2">Failed to load orders</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{error?.message || 'Something went wrong'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Icon icon="heroicons-outline:shopping-bag" className="text-gray-400 text-5xl mb-4 mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 font-semibold mb-2">No orders yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Recent product orders will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-gray-100 table-fixed dark:divide-gray-700"
                {...getTableProps}
              >
                <thead className="bg-gray-100 dark:bg-gray-700">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          scope="col"
                          className="table-th"
                        >
                          <div className="flex items-center justify-between">
                            {column.render("Header")}
                            <span>
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <Icon icon="ph:caret-up-fill" />
                                ) : (
                                  <Icon icon="ph:caret-down-fill" />
                                )
                              ) : (
                                <Icon
                                  icon="ri:expand-up-down-fill"
                                  className="text-[15px] text-gray-400"
                                />
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700"
                  {...getTableBodyProps}
                >
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:bg-opacity-30 transition-all duration-200 cursor-pointer"
                        onClick={() => navigate(`/orders/${row.original._id}`)}
                      >
                        {row.cells.map((cell) => {
                          return (
                            <td {...cell.getCellProps()} className="table-td">
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {pageOptions.length > 1 && (
          <div className="p-6">
            <ul className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
              <li className="text-xl leading-4 text-gray-900 dark:text-white rtl:rotate-180">
                <button
                  className={`${
                    !canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                >
                  <Icon icon="heroicons-outline:chevron-left" />
                </button>
              </li>
              {pageOptions.map((page, pageIdx) => (
                <li key={pageIdx}>
                  <button
                    aria-current="page"
                    className={`${
                      pageIdx === pageIndex
                        ? "bg-indigo-500 text-white font-medium"
                        : "bg-gray-100 dark:bg-gray-700 dark:text-gray-400 text-gray-900 font-normal"
                    } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                    onClick={() => gotoPage(pageIdx)}
                  >
                    {page + 1}
                  </button>
                </li>
              ))}
              <li className="text-xl leading-4 text-gray-900 dark:text-white rtl:rotate-180">
                <button
                  className={`${
                    !canNextPage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                >
                  <Icon icon="heroicons-outline:chevron-right" />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default RecentOrderTable;
