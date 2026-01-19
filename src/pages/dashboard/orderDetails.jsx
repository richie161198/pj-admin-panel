import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAllProductOrdersAdminQuery, useUpdateOrderItemHUIDsMutation } from "@/store/api/order/orderApi";
import { toast } from "react-toastify";
import { getToken } from "@/utils/auth";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import LoadingIcon from "@/components/LoadingIcon";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n);

const OrderDetails = () => {
  const { id } = useParams();
    const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [showHUIDModal, setShowHUIDModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [huids, setHuids] = useState([]);
  
  const [updateOrderItemHUIDs, { isLoading: isUpdatingHUIDs }] = useUpdateOrderItemHUIDsMutation();

  // Fetch all orders to find the specific one
  const { data: ordersResponse, isLoading, error, refetch } = useGetAllProductOrdersAdminQuery({
    page: 1,
    limit: 1000, // Get all orders to find the specific one
  });

  const orders = ordersResponse?.data?.orders || [];
  const order = orders.find(o => o._id === id);

  // Fetch invoice data
  useEffect(() => {
    if (order?._id && order?.orderCode) {
      fetchInvoiceData();
      fetchTrackingData();
    }
  }, [order?._id, order?.orderCode]);

  const fetchInvoiceData = async () => {
    if (!order?._id) return;
    
    setIsLoadingInvoice(true);
    try {
      const token = getToken();
      // Query all invoices and find the one matching this order
      const response = await fetch(
        `http://localhost:4000/api/v0/invoices?limit=1000`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data && Array.isArray(data.data)) {
          // Find invoice by orderId
          const invoice = data.data.find(inv => 
            inv.orderId && (
              inv.orderId._id === order._id || 
              inv.orderId === order._id ||
              (typeof inv.orderId === 'string' && inv.orderId === order._id.toString())
            )
          );
          if (invoice) {
            setInvoiceData(invoice);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const fetchTrackingData = async () => {
    if (!order?.orderCode) return;
    
    setIsLoadingTracking(true);
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:4000/api/v0/shipments/bvc/track/order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({ orderCode: order.orderCode }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTrackingData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setIsLoadingTracking(false);
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
        <p className="text-red-500">Error loading order details: {error.message}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Order not found</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

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

  // Check if address is in Tamil Nadu
  const isTamilNadu = (invoice) => {
    if (!invoice) return false;
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
    if (!invoice || !invoice.pricing) {
      return { type: 'N/A', amount: 0, cgst: 0, sgst: 0, igst: 0, roundedGST: 0, roundOff: 0, isTamilNadu: false };
    }
    
    const totalGST = invoice.pricing?.totalGST || 0;
    if (totalGST === 0) {
      return { type: 'N/A', amount: 0, cgst: 0, sgst: 0, igst: 0, roundedGST: 0, roundOff: 0, isTamilNadu: false };
    }
    
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

  // Download invoice by order code
  const handleDownloadInvoice = async () => {
    if (!order?.orderCode) {
      toast.error('Order code not found');
      return;
    }

    try {
      toast.info('Preparing invoice for download...');

      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `http://localhost:4000/api/v0/invoices/order/${order.orderCode}/download`,
        {
          method: 'GET',
          headers: headers,
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${order.orderCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Invoice downloaded successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to download invoice');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Order ID: {order.orderCode}</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(order.status)}
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">
          <Card title="Products ordered" bodyClass="p-0">
            <div className="divide-y">
              {order.items?.map((item, index) => {
                // Find matching invoice product to get the actual price at order time
                const invoiceProduct = invoiceData?.products?.find(invProd => {
                  const orderProductId = item.productDataid?._id || item.productDataid;
                  const invProductId = invProd.productId?._id || invProd.productId;
                  return (
                    (typeof orderProductId === 'string' && orderProductId === invProductId?.toString()) ||
                    (typeof invProductId === 'string' && invProductId === orderProductId?.toString()) ||
                    (orderProductId?.toString() === invProductId?.toString())
                  );
                });

                // Use invoice product price (accurate at order time) if available, otherwise fallback to order item price
                const displayPrice = invoiceProduct?.finalPrice || invoiceProduct?.totalPrice || item.price || 0;
                const unitPrice = invoiceProduct?.unitPrice || (item.price && item.quantity ? item.price / item.quantity : 0);

                return (
                <div
                  key={index}
                  className="p-5 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.productDataid?.images?.[0] || '/placeholder-product.jpg'}
                      alt={item.productDataid?.name || invoiceProduct?.name || 'Product'}
                      className="w-14 h-14 rounded-md object-cover ring-1 ring-gray-200"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.productDataid?.name || invoiceProduct?.name || 'Product'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Brand: {item.productDataid?.brand || invoiceProduct?.brand || 'N/A'}
                      </div>
                      {invoiceProduct && (
                        <div className="text-xs text-gray-400 mt-1">
                          Unit Price: {currency(unitPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {currency(displayPrice)}
                    </div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity || invoiceProduct?.quantity || 1}</div>
                    {invoiceProduct && invoiceProduct.quantity > 1 && (
                      <div className="text-xs text-gray-400">
                        ({currency(unitPrice)} × {invoiceProduct.quantity})
                      </div>
                    )}
                  </div>
                  </div>
                  
                  {/* HUID Section - Only show for CONFIRMED orders */}
                  {order.status === 'CONFIRMED' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          HUID (Hallmark Unique ID)
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedItemIndex(index);
                            setHuids(item.huids && item.huids.length > 0 
                              ? [...item.huids] 
                              : Array(item.quantity || 1).fill(''));
                            setShowHUIDModal(true);
                          }}
                          className="btn btn-sm btn-outline-primary"
                          size="sm"
                        >
                          <Icon icon="ph:pencil" className="mr-1" />
                          {item.huids && item.huids.length > 0 ? 'Edit' : 'Add'} HUID
                        </Button>
                      </div>
                      {item.huids && item.huids.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.huids.map((huid, huidIndex) => (
                            <Badge key={huidIndex} className="bg-blue-100 text-blue-800 border-0">
                              {huid}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">
                          No HUIDs added yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <span>Payment</span>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
            }
            bodyClass="p-0"
          >
            <div className="p-5 space-y-3">
              {/* Subtotal */}
              {/* <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currency(invoiceData?.pricing?.subtotal || order.pricing?.subtotal || order.totalAmount || 0)}
                </span>
              </div> */}

              {/* GST Value */}
              {(() => {
                const gstBreakdown = getGSTBreakdown(invoiceData || order);
                const isTN = gstBreakdown.isTamilNadu;
                const totalGST = gstBreakdown.roundedGST;

                if (totalGST > 0) {
                  return (
                    <>
                      {isTN ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">CGST (1.5%)</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {currency(gstBreakdown.cgst)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">SGST (1.5%)</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {currency(gstBreakdown.sgst)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">IGST (3%)</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {currency(gstBreakdown.igst)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Total GST</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {currency(totalGST)}
                        </span>
                      </div>
                    </>
                  );
                }
                return (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">GST</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currency(0)}
                    </span>
                  </div>
                );
              })()}

              {/* Total (Grand Total from invoice/order) */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currency(
                    invoiceData?.pricing?.grandTotal || 
                    order.pricing?.grandTotal || 
                    order.totalAmount || 
                    0
                  )}
                </span>
              </div>

              {/* Shipping Charges */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping Charges</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currency(
                    invoiceData?.shippingDetails?.shippingPrice || 
                    invoiceData?.shippingDetails?.shippingAmount || 
                    order.shippingDetails?.shippingPrice || 
                    order.shippingDetails?.shippingAmount || 
                    0
                  )}
                </span>
              </div>

              {/* Total Amount (Total + Shipping, rounded up) */}
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Total Amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(() => {
                    const grandTotal = invoiceData?.pricing?.grandTotal || order.pricing?.grandTotal || order.totalAmount || 0;
                    const shippingCharges = invoiceData?.shippingDetails?.shippingPrice || 
                                          invoiceData?.shippingDetails?.shippingAmount || 
                                          order.shippingDetails?.shippingPrice || 
                                          order.shippingDetails?.shippingAmount || 
                                          0;
                    const totalAmount = grandTotal + shippingCharges;
                    const totalAmountCeil = Math.ceil(totalAmount);
                    return currency(totalAmountCeil);
                  })()}
                </span>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Customer payment</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {(() => {
                  const grandTotal = invoiceData?.pricing?.grandTotal || order.pricing?.grandTotal || order.totalAmount || 0;
                  const shippingCharges = invoiceData?.shippingDetails?.shippingPrice || 
                                        invoiceData?.shippingDetails?.shippingAmount || 
                                        order.shippingDetails?.shippingPrice || 
                                        order.shippingDetails?.shippingAmount || 
                                        0;
                  const totalAmount = grandTotal + shippingCharges;
                  const totalAmountCeil = Math.ceil(totalAmount);
                  return currency(totalAmountCeil);
                })()}
              </span>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card title="Customer" bodyClass="p-0">
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                {/* <Avatar 
                  src={order.user?.avatar || '/placeholder-avatar.jpg'} 
                  className="h-12 w-12" 
                /> */}
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {order.user?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.user?.id || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="divide-y">
                <div className="py-4 flex items-center gap-3">
                  <Icon icon="solar:inbox-line-duotone" className="text-xl text-gray-500" />
                  <span className="text-sm">{order.user?.email || 'N/A'}</span>
                </div>
                <div className="py-4 flex items-center gap-3">
                  <Icon icon="solar:phone-linear" className="text-xl text-gray-500" />
                  <span className="text-sm">{order.user?.phone || 'N/A'}</span>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="pt-2">
                  <div className="text-sm font-semibold mb-2">Shipping Address</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{order.shippingAddress.street || ''}</div>
                    <div>{order.shippingAddress.city || ''}, {order.shippingAddress.state || ''}</div>
                    <div>{order.shippingAddress.zipCode || ''}</div>
                    <div>{order.shippingAddress.country || ''}</div>
                  </div>
                </div>
              )}

              {order.billingAddress && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-semibold mb-2">Billing Address</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{order.billingAddress.street || ''}</div>
                    <div>{order.billingAddress.city || ''}, {order.billingAddress.state || ''}</div>
                    <div>{order.billingAddress.zipCode || ''}</div>
                    <div>{order.billingAddress.country || ''}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Order Information">
            <div className="space-y-3">
              {/* <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoice No.</span>
                <span className="text-sm font-medium">
                  {isLoadingInvoice ? 'Loading...' : (invoiceData?.invoiceNumber || 'N/A')}
                </span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Updated</span>
                <span className="text-sm font-medium">
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Items</span>
                <span className="text-sm font-medium">{order.items?.length || 0}</span>
              </div>
              {invoiceData?.customerDetails?.address && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600 mb-1">Billing Address:</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {invoiceData.customerDetails.address.street && (
                      <div>{invoiceData.customerDetails.address.street}</div>
                    )}
                    {invoiceData.customerDetails.address.city && (
                      <div>
                        {invoiceData.customerDetails.address.city}
                        {invoiceData.customerDetails.address.state && `, ${invoiceData.customerDetails.address.state}`}
                        {invoiceData.customerDetails.address.pincode && ` - ${invoiceData.customerDetails.address.pincode}`}
                      </div>
                    )}
                    {!invoiceData.customerDetails.address.street && !invoiceData.customerDetails.address.city && 'N/A'}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Actions">
            <div className="space-y-3">
              <Button
                onClick={handleDownloadInvoice}
                className="btn btn-primary w-full"
              >
                <Icon icon="ph:file-text" className="mr-2" />
                Download Invoice
              </Button>
              {/* <Button
                onClick={() => window.print()}
                className="btn btn-outline w-full"
              >
                <Icon icon="ph:printer" className="mr-2" />
                Print Order
              </Button> */}
            </div>
          </Card>
        </div>
      </div>

      {/* Shipment Tracking Section */}
      {order && (
        <Card title="Shipment Tracking">
          {isLoadingTracking ? (
            <div className="flex justify-center items-center py-8">
              <LoadingIcon />
            </div>
          ) : trackingData?.trackingHistory && trackingData.trackingHistory.length > 0 ? (
            <TrackingTimeline
              trackingHistory={trackingData.trackingHistory}
              statusLabel={trackingData.statusLabel || trackingData.status}
              docketNo={trackingData.docketNo}
              orderDate={order.createdAt}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="solar:box-line-duotone" className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No tracking information available</p>
            </div>
          )}
        </Card>
      )}

      {/* HUID Management Modal */}
      <Modal
        title="Manage HUIDs"
        label="huid-modal"
        activeModal={showHUIDModal}
        onClose={() => {
          setShowHUIDModal(false);
          setSelectedItemIndex(null);
          setHuids([]);
        }}
      >
        {selectedItemIndex !== null && order.items[selectedItemIndex] && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {order.items[selectedItemIndex].productDataid?.name || 'Product'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Quantity: {order.items[selectedItemIndex].quantity || 1}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter HUIDs (one per quantity):
              </label>
              {huids.map((huid, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    #{index + 1}:
                  </span>
                  <Textinput
                    type="text"
                    value={huid}
                    onChange={(e) => {
                      const newHuids = [...huids];
                      newHuids[index] = e.target.value.toUpperCase().trim();
                      setHuids(newHuids);
                    }}
                    placeholder={`HUID ${index + 1}`}
                    className="flex-1"
                    maxLength={16}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                onClick={() => {
                  setShowHUIDModal(false);
                  setSelectedItemIndex(null);
                  setHuids([]);
                }}
                className="btn btn-outline-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await updateOrderItemHUIDs({
                      orderId: order._id,
                      itemIndex: selectedItemIndex,
                      huids: huids,
                    }).unwrap();
                    toast.success('HUIDs updated successfully');
                    setShowHUIDModal(false);
                    setSelectedItemIndex(null);
                    setHuids([]);
                    // Refetch orders to get updated data
                    refetch();
                  } catch (error) {
                    console.error('Failed to update HUIDs:', error);
                    toast.error(error?.data?.error || 'Failed to update HUIDs');
                  }
                }}
                disabled={isUpdatingHUIDs}
                className="btn btn-primary"
              >
                {isUpdatingHUIDs ? (
                  <>
                    <LoadingIcon />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="ph:floppy-disk" className="mr-2" />
                    Save HUIDs
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Tracking Timeline Component
const TrackingTimeline = ({ trackingHistory, statusLabel, docketNo, orderDate }) => {
  // Sort tracking history by timestamp (oldest first)
  const sortedHistory = [...trackingHistory].sort((a, b) => {
    const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timestampA - timestampB;
  });

  // Build timeline steps
  const allSteps = [];
  
  // Add "Ordered" as first step
  if (orderDate) {
    allSteps.push({
      status: 'Ordered',
      statusCode: 'ORDERED',
      date: new Date(orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date(orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      city: '',
      isOrdered: true,
    });
  }

  // Add tracking history entries
  sortedHistory.forEach((entry) => {
    allSteps.push({
      status: entry.status || 'Unknown',
      statusCode: entry.statusCode || '',
      date: entry.date || '',
      time: entry.time || '',
      city: entry.city || '',
      timestamp: entry.timestamp,
    });
  });

  const getIconForStatusCode = (statusCode) => {
    if (!statusCode) return 'solar:info-circle-line-duotone';
    const code = statusCode.toUpperCase();
    switch (code) {
      case 'AP': return 'solar:box-line-duotone';
      case 'OP': return 'solar:delivery-line-duotone';
      case 'NP': return 'solar:danger-triangle-line-duotone';
      case 'CP': return 'solar:close-circle-line-duotone';
      case 'IT': return 'solar:delivery-line-duotone';
      case 'OFD': return 'solar:delivery-line-duotone';
      case 'DL': return 'solar:check-circle-line-duotone';
      case 'ORDERED': return 'solar:cart-line-duotone';
      default: return 'solar:info-circle-line-duotone';
    }
  };

  const getColorForStatusCode = (statusCode, isLatest) => {
    if (!statusCode) return 'text-blue-500';
    const code = statusCode.toUpperCase();
    if (isLatest) {
      switch (code) {
        case 'DL': return 'text-green-500';
        case 'CP':
        case 'NP': return 'text-red-500';
        case 'OFD': return 'text-orange-500';
        default: return 'text-blue-500';
      }
    }
    return 'text-blue-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Track Order</h3>
          {docketNo && (
            <p className="text-sm text-gray-500 mt-1">Docket: {docketNo}</p>
          )}
        </div>
        <Badge className="bg-blue-100 text-blue-800 border-0">
          {statusLabel}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative">
        {allSteps.map((step, index) => {
          const isLatest = index === allSteps.length - 1;
          const isCompleted = index < allSteps.length - 1;
          const iconColor = getColorForStatusCode(step.statusCode, isLatest);

          return (
            <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Timeline line */}
              {index < allSteps.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Icon */}
              <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted || isLatest
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                <Icon
                  icon={getIconForStatusCode(step.statusCode)}
                  className={`text-lg ${isCompleted || isLatest ? 'text-white' : iconColor}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-medium ${
                      isLatest
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {step.status}
                    </p>
                    {step.city && (
                      <p className="text-sm text-gray-500 mt-0.5">{step.city}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {step.date && <div>{step.date}</div>}
                    {step.time && <div>{step.time}</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderDetails;