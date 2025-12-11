import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Receipt from '../components/Receipt';
import { orderService } from '../services/orderService';
import { Order } from '../types/order';
import { formatPriceInPHP } from '../utils/formatters';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ type: 'cancel' | 'complete', orderId: string } | null>(null);
  const [completedPage, setCompletedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [preparingPage, setPreparingPage] = useState(1);
  const [readyPage, setReadyPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await orderService.getAllOrders();
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (newStatus === 'completed') {
        toast.success('Order completed successfully!');
      }
    } catch (err) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId, true);
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ));
      toast.success('Order cancelled successfully!');
      setConfirmModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel order');
      console.error('Error cancelling order:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const getPendingOrders = () => {
    return orders.filter(o => o.status === 'pending').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getPreparingOrders = () => {
    return orders.filter(o => o.status === 'preparing').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getReadyOrders = () => {
    return orders.filter(o => o.status === 'ready').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getCompletedOrders = () => {
    return orders.filter(o => o.status === 'completed' || o.status === 'cancelled').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Filter orders by search query
  const filterOrdersBySearch = (ordersToFilter: Order[]) => {
    if (!searchQuery.trim()) return ordersToFilter;
    
    return ordersToFilter.filter(order => 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickupCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get filtered orders for each status
  const getFilteredPendingOrders = () => filterOrdersBySearch(getPendingOrders());
  const getFilteredPreparingOrders = () => filterOrdersBySearch(getPreparingOrders());
  const getFilteredReadyOrders = () => filterOrdersBySearch(getReadyOrders());
  const getFilteredCompletedOrders = () => filterOrdersBySearch(getCompletedOrders());

  // Update pagination functions to use filtered data
  const getTotalFilteredPendingPages = () => Math.ceil(getFilteredPendingOrders().length / ITEMS_PER_PAGE);
  const getPaginatedFilteredPendingOrders = () => {
    const filtered = getFilteredPendingOrders();
    const startIndex = (pendingPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalFilteredPreparingPages = () => Math.ceil(getFilteredPreparingOrders().length / ITEMS_PER_PAGE);
  const getPaginatedFilteredPreparingOrders = () => {
    const filtered = getFilteredPreparingOrders();
    const startIndex = (preparingPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalFilteredReadyPages = () => Math.ceil(getFilteredReadyOrders().length / ITEMS_PER_PAGE);
  const getPaginatedFilteredReadyOrders = () => {
    const filtered = getFilteredReadyOrders();
    const startIndex = (readyPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalFilteredCompletedPages = () => Math.ceil(getFilteredCompletedOrders().length / ITEMS_PER_PAGE);
  const getPaginatedFilteredCompletedOrders = () => {
    const filtered = getFilteredCompletedOrders();
    const startIndex = (completedPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <div className="p-6 border-b last:border-b-0">

      {/* HEADER */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">
            Order #{order.id}
          </h2>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-500">{order.userEmail}</p>
        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
      </div>

      {/* ITEMS */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-900 mb-2">Items</h3>
        <div className="space-y-1 text-sm">
          {order.items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span>{item.quantity}x {item.menuItem.name}</span>
                <span className="font-medium">{formatPriceInPHP(item.menuItem.price * item.quantity)}</span>
              </div>
              {item.selectedFlavor && (
                <div className="text-xs text-gray-500 ml-2">Flavor: {item.selectedFlavor}</div>
              )}
              {item.notes && (
                <div className="text-xs text-gray-500 ml-2">Notes: {item.notes}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TOTAL */}
      <div className="mb-4 pt-3 border-t">
        <div className="flex justify-between text-sm font-medium">
          <span>Total:</span>
          <span>{formatPriceInPHP(order.total)}</span>
        </div>
      </div>

      {/* ACTION BUTTONS (MODERN) */}
      <div className="flex flex-col space-y-2">

        {/* Modern "View Receipt" button */}
        <button
          onClick={() => setSelectedOrder(order)}
          className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm
                     shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          View Receipt
        </button>

        {/* Dropdowns */}
        {(order.status === 'pending' || order.status === 'preparing') && (
          <select
            value={order.status}
            onChange={(e) =>
              handleStatusUpdate(order.id, e.target.value as Order['status'])
            }
            className="w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 text-sm
                       focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            {order.status === 'pending' && <>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
            </>}

            {order.status === 'preparing' && <>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
            </>}
          </select>
        )}

        {/* Modern green "Complete Order" button */}
        {order.status === 'ready' && (
          <button
            onClick={() => setConfirmModal({ type: 'complete', orderId: order.id })}
            className="w-full px-4 py-2 rounded-xl bg-green-600 text-white font-medium text-sm
                       shadow-sm hover:bg-green-700 active:scale-95 transition-all"
          >
            Complete Order
          </button>
        )}

        {/* Modern red "Cancel Order" button */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <button
            onClick={() => setConfirmModal({ type: 'cancel', orderId: order.id })}
            className="w-full px-4 py-2 rounded-xl bg-red-600 text-white font-medium text-sm
                       shadow-sm hover:bg-red-700 active:scale-95 transition-all"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Monitoring</h1>
          
          {/* Search Filter */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Order ID or Pickup Code
            </label>
            <input
              type="text"
              placeholder="Enter Order ID or Pickup Code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPendingPage(1);
                setPreparingPage(1);
                setReadyPage(1);
                setCompletedPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pending Orders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
              Pending/Unpaid {getFilteredPendingOrders().length > 0 && <span className="ml-2 text-lg text-yellow-600">({getFilteredPendingOrders().length})</span>}
            </h2>
            {getFilteredPendingOrders().length > 0 ? (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="divide-y divide-gray-200">
                    {getPaginatedFilteredPendingOrders().map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
                
                {getTotalFilteredPendingPages() > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setPendingPage(prev => Math.max(1, prev - 1))}
                      disabled={pendingPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pendingPage} of {getTotalFilteredPendingPages()}
                    </span>
                    <button
                      onClick={() => setPendingPage(prev => Math.min(getTotalFilteredPendingPages(), prev + 1))}
                      disabled={pendingPage === getTotalFilteredPendingPages()}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
                No pending orders
              </div>
            )}
          </div>

          {/* Preparing Orders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
              Preparing {getFilteredPreparingOrders().length > 0 && <span className="ml-2 text-lg text-blue-600">({getFilteredPreparingOrders().length})</span>}
            </h2>
            {getFilteredPreparingOrders().length > 0 ? (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="divide-y divide-gray-200">
                    {getPaginatedFilteredPreparingOrders().map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
                
                {getTotalFilteredPreparingPages() > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setPreparingPage(prev => Math.max(1, prev - 1))}
                      disabled={preparingPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {preparingPage} of {getTotalFilteredPreparingPages()}
                    </span>
                    <button
                      onClick={() => setPreparingPage(prev => Math.min(getTotalFilteredPreparingPages(), prev + 1))}
                      disabled={preparingPage === getTotalFilteredPreparingPages()}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
                No orders preparing
              </div>
            )}
          </div>

          {/* Ready Orders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              Ready {getFilteredReadyOrders().length > 0 && <span className="ml-2 text-lg text-green-600">({getFilteredReadyOrders().length})</span>}
            </h2>
            {getFilteredReadyOrders().length > 0 ? (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="divide-y divide-gray-200">
                    {getPaginatedFilteredReadyOrders().map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
                
                {getTotalFilteredReadyPages() > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setReadyPage(prev => Math.max(1, prev - 1))}
                      disabled={readyPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {readyPage} of {getTotalFilteredReadyPages()}
                    </span>
                    <button
                      onClick={() => setReadyPage(prev => Math.min(getTotalFilteredReadyPages(), prev + 1))}
                      disabled={readyPage === getTotalFilteredReadyPages()}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
                No ready orders
              </div>
            )}
          </div>

          {/* Completed/Cancelled Orders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-4 h-4 bg-gray-500 rounded-full mr-3"></span>
              Completed/Cancelled {getFilteredCompletedOrders().length > 0 && <span className="ml-2 text-lg text-gray-600">({getFilteredCompletedOrders().length})</span>}
            </h2>
            {getFilteredCompletedOrders().length > 0 ? (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="divide-y divide-gray-200">
                    {getPaginatedFilteredCompletedOrders().map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
                
                {getTotalFilteredCompletedPages() > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setCompletedPage(prev => Math.max(1, prev - 1))}
                      disabled={completedPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {completedPage} of {getTotalFilteredCompletedPages()}
                    </span>
                    <button
                      onClick={() => setCompletedPage(prev => Math.min(getTotalFilteredCompletedPages(), prev + 1))}
                      disabled={completedPage === getTotalFilteredCompletedPages()}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
                No completed or cancelled orders
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modals */}
        {confirmModal?.type === 'complete' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 animate-slideUp">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Complete Order</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to mark this order as completed? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(confirmModal.orderId, 'completed');
                    setConfirmModal(null);
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:shadow-md transition-all"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal?.type === 'cancel' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 animate-slideUp">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Cancel Order</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Don't Cancel
                </button>
                <button
                  onClick={() => handleCancelOrder(confirmModal.orderId)}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:shadow-md transition-all"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedOrder && (
          <Receipt
            order={selectedOrder}
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
