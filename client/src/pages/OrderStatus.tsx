import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { formatPriceInPHP } from '../utils/formatters';
import { Order } from '../types/order';

const OrderStatus: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          throw new Error('Order ID not found');
        }

        const orderData = await orderService.getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Set up real-time listener for order updates
    const unsubscribe = orderService.subscribeToOrderUpdates(orderId || '', (updatedOrder) => {
      setOrder(updatedOrder);
    });

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            {error || 'Order not found'}
          </h2>
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            {/* Order Items */}
            <div className="border-b pb-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.menuItem.name}
                    {item.notes && (
                      <p className="text-sm text-gray-500">Note: {item.notes}</p>
                    )}
                  </div>
                  <div className="font-medium">
                    {formatPriceInPHP(item.menuItem.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Details */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pickup Code</p>
                  <p className="font-medium text-indigo-600">{order.pickupCode}</p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Additional Notes</p>
                    <p className="font-medium">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPriceInPHP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPriceInPHP(order.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPriceInPHP(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          {order.status === 'pending' && (
            <button
              onClick={async () => {
                try {
                  await orderService.cancelOrder(order.id);
                  // The real-time listener will update the UI
                } catch (err) {
                  console.error('Error cancelling order:', err);
                  setError(err instanceof Error ? err.message : 'Failed to cancel order');
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Order More Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;