import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAllOrdersAdminQuery, useGetAllProductOrdersAdminQuery } from '@/store/api/order/orderApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import LoadingIcon from '@/components/LoadingIcon';
import Card from '@/components/ui/Card';

const currency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n);

const Invoice = () => {
  const { id, type } = useParams(); // type can be 'product' or 'investment'
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch investment orders
  const { data: investmentOrdersResponse } = useGetAllOrdersAdminQuery({
    page: 1,
    limit: 1000,
  });

  // Fetch product orders
  const { data: productOrdersResponse } = useGetAllProductOrdersAdminQuery({
    page: 1,
    limit: 1000,
  });

  useEffect(() => {
    const findOrder = () => {
      if (type === 'product') {
        const orders = productOrdersResponse?.data?.orders || [];
        const foundOrder = orders.find(o => o._id === id);
        if (foundOrder) {
          setOrder({ ...foundOrder, orderType: 'product' });
        }
      } else {
        const orders = investmentOrdersResponse?.data?.orders || [];
        const foundOrder = orders.find(o => o._id === id);
        if (foundOrder) {
          setOrder({ ...foundOrder, orderType: 'investment' });
        }
      }
      setIsLoading(false);
    };

    if ((type === 'product' && productOrdersResponse) || (type === 'investment' && investmentOrdersResponse)) {
      findOrder();
    }
  }, [id, type, productOrdersResponse, investmentOrdersResponse]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a downloadable PDF-like content
    const printContent = document.getElementById('invoice-content');
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order?.orderId || order?.orderCode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company-info h1 { color: #2563eb; margin: 0; }
            .invoice-info { text-align: right; }
            .invoice-details { margin-bottom: 30px; }
            .billing-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .billing-info { flex: 1; margin-right: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f8f9fa; }
            .totals { text-align: right; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Icon icon="ph:file-text" className="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Invoice Not Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The invoice you're looking for doesn't exist.</p>
        <Button onClick={() => navigate(-1)} className="btn btn-primary">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const isProductOrder = order.orderType === 'product';
  const orderId = isProductOrder ? order.orderCode : order.orderId;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
  const dueDate = order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <Button
            onClick={() => navigate(-1)}
            className="btn btn-outline"
          >
            <Icon icon="ph:arrow-left" className="mr-2" />
            Back
          </Button>
          <div className="flex space-x-3">
            <Button
              onClick={handleDownload}
              className="btn btn-outline"
            >
              <Icon icon="ph:download" className="mr-2" />
              Download
            </Button>
            <Button
              onClick={handlePrint}
              className="btn btn-primary"
            >
              <Icon icon="ph:printer" className="mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Precious Jewels</h1>
              <p className="text-gray-600 dark:text-gray-400">Investment & Jewelry Platform</p>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>123 Business Street</p>
                <p>Mumbai, Maharashtra 400001</p>
                <p>India</p>
                <p>Phone: +91 98765 43210</p>
                <p>Email: info@preciousjewels.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">INVOICE</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Invoice #</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{orderId}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Date: {orderDate}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due: {dueDate}</p>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bill To:</h3>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">{order.user?.name || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">{order.user?.email || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">{order.user?.phone || 'N/A'}</p>
                {order.shippingAddress && (
                  <div className="mt-2">
                    <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.street}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details:</h3>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Order Type:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {isProductOrder ? 'Product Order' : 'Investment Order'}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{order.status}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{order.paymentMethod || 'N/A'}</span>
                </div>
                {!isProductOrder && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Transaction Type:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{order.type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {isProductOrder ? 'Product' : 'Description'}
                    </th>
                    {isProductOrder && (
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Brand
                      </th>
                    )}
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Qty
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Price
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isProductOrder ? (
                    // Product Order Items
                    order.items?.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-600">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                          <div className="flex items-center">
                            {item.productDataid?.images?.[0] && (
                              <img
                                src={item.productDataid.images[0]}
                                alt={item.productDataid.name}
                                className="w-12 h-12 object-cover rounded mr-3"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {item.productDataid?.name || 'Product'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                SKU: {item.productDataid?.skuId || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                          {item.productDataid?.brand || 'N/A'}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-900 dark:text-white">
                          {item.quantity || 1}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-gray-900 dark:text-white">
                          {currency(item.price || 0)}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                          {currency((item.price || 0) * (item.quantity || 1))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Investment Order Items
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {order.type === 'gold_purchase' || order.type === 'gold_sale' ? 'Gold Investment' : 
                             order.type === 'silver_purchase' || order.type === 'silver_sale' ? 'Silver Investment' :
                             order.type === 'deposit' ? 'Account Deposit' : 'Account Withdrawal'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.description || `${order.type} transaction`}
                          </p>
                        </div>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-900 dark:text-white">
                        1
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right text-gray-900 dark:text-white">
                        {currency(order.amount || 0)}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {currency(order.amount || 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-2">
                {isProductOrder && (
                  <>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="text-gray-900 dark:text-white">{currency(order.totalAmount || 0)}</span>
                    </div>
                    {order.shippingCost > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                        <span className="text-gray-900 dark:text-white">{currency(order.shippingCost || 0)}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                        <span className="text-gray-900 dark:text-white">{currency(order.tax || 0)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                  <div className="flex justify-between py-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {currency(order.totalAmount || order.amount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Information</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Method: {order.paymentMethod || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: {order.status}
                </p>
                {order.transactionId && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transaction ID: {order.transactionId}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Thank You!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Thank you for your business. For any questions regarding this invoice, please contact us.
                </p>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>This is a computer-generated invoice and does not require a signature.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
