import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import History from "@/components/partials/widget/chart/history";
import RadarChart from "@/components/partials/widget/chart/radar-chart";
import { useGetAllUsersQuery } from "@/store/api/user/userApi";
import { useGetAllProductsQuery } from "@/store/api/product/productApi";
import { useGetAllOrdersQuery, useGetTotalRevenueQuery } from "@/store/api/order/orderApi";
import { useGetAllCategoriesQuery } from "@/store/api/product/productApi";
import LoadingIcon from "@/components/LoadingIcon";
import { useNavigate } from "react-router-dom";
import Earnings from "@/components/partials/widget/chart/Earnings";
import RecentOrderTable from "@/components/partials/Table/order-table";
import { useGetAllTicketsQuery } from '@/store/api/ticket/ticketApi';

const Dashboard = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    limit: 10
  });

  // API queries
  const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets } = useGetAllTicketsQuery(filters);
  const { data: users, isLoading: usersLoading, error: usersError } = useGetAllUsersQuery();

  // const { data: usersData2, isLoading: isLoadingUsers, error: usersError2 } = useGetAllUsersQuery();
  
  // // Debug logging
  // console.log('Users data:', usersData2);

  const { data: products, isLoading: productsLoading } = useGetAllProductsQuery();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrdersQuery();
  const { data: categories, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { data: revenueData, isLoading: revenueLoading } = useGetTotalRevenueQuery();
  
  // Debug: Log users query state
  console.log("Users Query State:", { users, usersLoading, usersError });

  // Don't include revenueLoading in main loading state to avoid blocking users display
  const isLoading = usersLoading || productsLoading || ordersLoading || categoriesLoading;

  // Extract data from API responses with robust handling
  const extractArrayData = (response, possibleKeys = ['details', 'data', 'users', 'products', 'orders', 'categories']) => {
    if (!response) {
      console.log('extractArrayData: response is null/undefined');
      return [];
    }
    
    if (Array.isArray(response)) {
      console.log('extractArrayData: response is already an array', response.length);
      return response;
    }

    // RTK Query returns the response body directly
    // Backend returns { status: true, details: [...] }
    // So response should be { status: true, details: [...] }
    
    console.log('extractArrayData: response structure', {
      response,
      type: typeof response,
      keys: Object.keys(response || {}),
      hasDetails: response?.details,
      detailsIsArray: Array.isArray(response?.details)
    });

    // Check for keys in the response object
    for (const key of possibleKeys) {
      if (response[key] && Array.isArray(response[key])) {
        console.log(`extractArrayData: Found array in key "${key}"`, response[key].length);
        return response[key];
      }
    }

    console.log('extractArrayData: No array found, returning empty array');
    return [];
  };

  const usersData = extractArrayData(users, ['details', 'data', 'users']);
  const productsData = extractArrayData(products, ['details', 'data', 'products']);
  const ordersData = extractArrayData(orders, ['details', 'data', 'orders']);
  const categoriesData = extractArrayData(categories, ['details', 'data', 'categories']);

  console.log("usersData?.length",usersData?.length,users)
  // // Debug: Log users response to check structure (only in development)
  // if (process.env.NODE_ENV === 'development' && users && !usersData?.length && !usersLoading) {
  //   console.log('Users API Response:', users);
  //   console.log('Extracted Users Data:', usersData);
  //   console.log('Users Data Type:', typeof users);
  //   console.log('Users Data Keys:', users ? Object.keys(users) : 'null');
  // }

  // Calculate statistics
  const totalUsers = usersData?.length || 0;
  const totalProducts = productsData?.length || 0;
  const totalOrders = ordersData?.length || 0;
  const totalCategories = categoriesData?.length || 0;

  console.log('Ticket:', ticketsData?.data.tickets);
  // Get total revenue from API (commerce orders excluding returns/refunds)
  const totalRevenue = revenueData?.data?.netRevenue || revenueData?.data?.totalRevenue || 0;

  // Calculate recent orders (last 5)
  const recentOrders = ordersData?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className=" space-y-5">
      <div className="grid xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-5">
        <Card>
          <div>
            <div className="flex">
              <div className="flex-1 text-base font-medium">Total Orders</div>
              <div className="flex-none">
                <div className="h-10 w-10  rounded-full bg-indigo-500 text-white text-2xl flex items-center justify-center">
                  <Icon icon="ph:shopping-cart" />
                </div>
              </div>
            </div>
            <div>
              <span className=" text-2xl font-medium text-gray-800  dark:text-white">
                {totalOrders}
              </span>
              <span className="  space-x-2 block mt-4 ">
                <span className="badge bg-indigo-500/10 text-indigo-500 ">
                  {totalOrders > 0 ? 'Active' : 'No Orders'}
                </span>
                <span className=" text-sm text-gray-500 dark:text-gray-400">
                  Total orders
                </span>
              </span>
            </div>
          </div>
        </Card>
        <Card>
          <div>
            <div className="flex">
              <div className="flex-1 text-base font-medium">Total Revenue</div>
              <div className="flex-none">
                <div className="h-10 w-10  rounded-full bg-yellow-500 text-white text-2xl flex items-center justify-center">
                  <Icon icon="ph:currency-inr" />
                </div>
              </div>
            </div>
            <div>
              <span className=" text-2xl font-medium text-gray-800  dark:text-white">
                ₹ {totalRevenue.toLocaleString('en-IN',).trim()}
              </span>
              <span className="  space-x-2 block mt-4 ">
                <span className="badge bg-yellow-500/10 text-yellow-500 ">
                  {totalOrders} orders
                </span>
                <span className=" text-sm text-gray-500 dark:text-gray-400">
                  Total revenue
                </span>
              </span>
            </div>
          </div>
        </Card>
        <Card>
          <div>
            <div className="flex">
              <div className="flex-1 text-base font-medium">Total Users</div>
              <div className="flex-none">
                <div className="h-10 w-10  rounded-full bg-red-500 text-white text-2xl flex items-center justify-center">
                  <Icon icon="ph:users" />
                </div>
              </div>
            </div>
            <div>
              <span className=" text-2xl font-medium text-gray-800  dark:text-white">
                {totalUsers}
              </span>
              <span className="  space-x-2 block mt-4 ">
                <span className="badge bg-red-500/10 text-red-500 ">Active</span>
                <span className=" text-sm text-gray-500 dark:text-gray-400">
                  Registered users
                </span>
              </span>
            </div>
          </div>
        </Card>
        <Card>
          <div>
            <div className="flex">
              <div className="flex-1 text-base font-medium">Products</div>
              <div className="flex-none">
                <div className="h-10 w-10  rounded-full bg-green-500 text-white text-2xl flex items-center justify-center">
                  <Icon icon="ph:package" />
                </div>
              </div>
            </div>
            <div>
              <span className=" text-2xl font-medium text-gray-800  dark:text-white">
                {totalProducts}
              </span>
              <span className="  space-x-2 block mt-4 ">
                <span className="badge bg-green-500/10 text-green-500 ">
                  {totalCategories} categories
                </span>
                <span className=" text-sm text-gray-500 dark:text-gray-400">
                  Total products
                </span>
              </span>
            </div>
          </div>
        </Card>
      </div>
      {/* end grid */}
      <div className="grid   grid-cols-12 gap-5">
        <div className="xl:col-span-7 col-span-12">
          <Card
            className="!bg-indigo-500 "
            title="Investment History"
            titleClass="!text-white"
            noborder
          >
            <History />
          </Card>
        </div>
        <div className="xl:col-span-5 col-span-12">
          <Card title="Support Tracker" subscribe>
            <RadarChart />

            <div className="grid  grid-cols-3 gap-2 py-4">
              <div className=" text-center">
                <div>
                  <div className="h-10 w-10 mb-2 mx-auto rounded-md bg-indigo-500/10 text-indigo-500 text-xl flex items-center justify-center">
                    <Icon icon="ph:ticket" />
                  </div>
                </div>
                <div>
                  <div className=" font-medium text-gray-800 dark:text-white text-sm truncate mb-[2px]">
                    All Tickets
                  </div>
                  <div className=" text-xs text-gray-400">{ticketsData?.data.tickets.length}</div>
                </div>
              </div>
              {/* end single */}
              <div className=" text-center">
                <div>
                  <div className="h-10 w-10 mb-2 mx-auto rounded-md bg-green-500/10 text-green-500 text-xl flex items-center justify-center">

                    <Icon icon="ph:clock-countdown" />

                  </div>
                </div>
                <div>
                  <div className=" font-medium text-gray-800 dark:text-white text-sm truncate mb-[2px]">
                    Open Tickets
                  </div>
                  <div className=" text-xs text-gray-400">{ticketsData?.data.tickets.filter((p) => p.status === 'open').length}</div>
                </div>
              </div>
              {/* end single */}
              <div className=" text-center">
                <div>
                  <div className="h-10 w-10 mb-2 mx-auto rounded-md bg-yellow-500/10 text-yellow-500 text-xl flex items-center justify-center">
                    <Icon icon="ph:check" />
                  </div>
                </div>
                <div>
                  <div className=" font-medium text-gray-800 dark:text-white text-sm truncate mb-[2px]">
                    Resolved Tickets
                  </div>
                  <div className=" text-xs text-gray-400">{ticketsData?.data.tickets.filter((p) => p.status === 'resolved').length}</div>
                </div>
              </div>
              {/* end single */}
            </div>
            {/* end support ticket */}
          </Card>
        </div>
      </div>
      {/* end grid */}
      <div className="grid xl:grid-cols-3 gap-5 ">
        <Card title="Trending Products" subtitle="Trending products Overview">
          <ul className=" space-y-4">
            {productsData
              ?.filter((p) => p.trending === true)
              ?.slice(0, productsData.filter((p) => p.popular === true).length <= 5 ? undefined : 5)
              ?.map((item, i) => (
                <li key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse" onClick={() => navigate(`/products/${item._id}`)}>
                    <div className="flex-none" >
                      <div className="h-[34px] w-[34px] rounded-full">
                        {/* <img
                        src={item.flag}
                        alt=""
                        className=" w-full h-full object-cover object-center"
                      /> */}
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon icon="ph:image" className="text-4xl text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className=" text-sm ">{item.name}</div>
                    </div>
                  </div>
                  <div className="text-gray-800 dark:text-white   flex items-center space-x-[2px] rtl:space-x-reverse">
                    <span className=" text-sm  ">{item.rating.value}</span>
                    <Icon
                      icon={item.icon}
                      className={`${item.icon === "heroicons:arrow-small-up"
                        ? " text-green-500 "
                        : " text-red-500"
                        }  text-lg`}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </Card>
        <Card title="Popular Products" subtitle="Most popular products">
          <ul className=" space-y-4">
            {productsData
              ?.filter((p) => p.popular === true)
              ?.slice(0, productsData.filter((p) => p.popular === true).length <= 5 ? undefined : 5)
              ?.map((item, i) => (
                <li key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse" onClick={() => navigate(`/products/${item._id}`)}>
                    <div className="flex-none">
                      <div className="h-[34px] w-[34px] bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300 flex  items-center justify-center rounded-full">
                        {/* <Icon icon={item.flag} className="text-xl" /> */}
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon icon="ph:image" className="text-4xl text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className=" text-sm ">{item.name}</div>
                    </div>
                  </div>
                  <div className="text-gray-800 dark:text-white   flex items-center space-x-[2px] rtl:space-x-reverse">
                    <span className=" text-sm  ">{item.rating.value}</span>
                    <Icon
                      icon={item.icon}
                      className={`${item.icon === "heroicons:arrow-small-up"
                        ? " text-green-500 "
                        : " text-red-500"
                        }  text-lg`}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </Card>
        <Card title="Total Earning">
          <Earnings />
        </Card>
      </div>
      {/* end grid */}
      <div>
        <div className="card-title mb-5">Latest Order</div>
        <RecentOrderTable />
      </div>
    </div>
  );
};

export default Dashboard;
