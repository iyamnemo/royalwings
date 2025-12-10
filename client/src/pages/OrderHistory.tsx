import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { Order } from '../types/order';
import { formatPriceInPHP } from '../utils/formatters';
import { Link } from 'react-router-dom';
import Receipt from '../components/Receipt';

const OrderHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingPage, setPendingPage] = useState(1);
  const [preparingPage, setPreparingPage] = useState(1);
  const [readyPage, setReadyPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (!currentUser) {
        setError('Please log in to view your order history');
        setLoading(false);
        return;
      }

      try {
        setError(null); 
        console.log('Fetching orders for user:', currentUser.uid);
        
        const userOrders = await orderService.getUserOrders(currentUser.uid);
        console.log('Orders received:', userOrders);
        
        if (isMounted) {
          if (!userOrders || userOrders.length === 0) {
            console.log('No orders found for user');
            setOrders([]);
          } else {
            console.log('Setting orders:', userOrders);
            setOrders(userOrders);
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load your order history');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

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

  // Pagination functions
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
      <div className="mb-4">
        <div className="mb-2">
          <h2 className="text-lg font-bold text-gray-900">
            Order #{order.id}
          </h2>
          <p className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-gray-900 mb-2">Items</h3>
        <div className="space-y-1 text-sm">
          {order.items.map((item, index) => (
            <div key={index} className="space-y-0.5">
              <div className="flex justify-between">
                <span>{item.quantity}x {item.menuItem.name}</span>
                <span className="font-medium">{formatPriceInPHP(item.menuItem.price * item.quantity)}</span>
              </div>
              {item.selectedFlavor && (
                <div className="text-xs text-gray-500 pl-4">
                  Flavor: <span className="font-medium">{item.selectedFlavor}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 pt-3 border-t">
        <div className="flex justify-between text-sm font-medium">
          <span>Total:</span>
          <span>{formatPriceInPHP(order.total)}</span>
        </div>
      </div>

      <button
        onClick={() => setSelectedOrder(order)}
        className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm
                     shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
      >
        View Receipt
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Order History</h1>
          
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/menu"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Pending Orders */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
                Pending {getFilteredPendingOrders().length > 0 && <span className="ml-2 text-lg text-yellow-600">({getFilteredPendingOrders().length})</span>}
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

export default OrderHistory;