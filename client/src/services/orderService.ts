import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order, OrderFormData, OrderStatus, PaymentStatus } from '../types/order';

const ORDERS_COLLECTION = 'orders';

interface OrderService {
  cancelOrder(orderId: string, isAdmin?: boolean): Promise<void>;
  createOrder(orderData: OrderFormData, userId: string, userEmail: string, paymentIntentId: string): Promise<string>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void>;
  getOrder(orderId: string): Promise<Order>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  subscribeToOrderUpdates(orderId: string, callback: (order: Order) => void): () => void;
}

export const orderService: OrderService = {
  async createOrder(orderData: OrderFormData, userId: string, userEmail: string, paymentIntentId: string): Promise<string> {
    try {
      const pickupCode = 'RW-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      const cleanedItems = orderData.items.map(item => {
        const cleanedItem: any = {
          id: item.id,
          menuItem: {
            id: item.menuItem.id,
            name: item.menuItem.name,
            description: item.menuItem.description,
            price: item.menuItem.price,
            category: item.menuItem.category,
            available: item.menuItem.available,
          },
          quantity: item.quantity,
          notes: item.notes || '',
        };
        
        if (item.selectedFlavor) {
          cleanedItem.selectedFlavor = item.selectedFlavor;
        }
        
        return cleanedItem;
      });
      
      const order: Omit<Order, 'id'> = {
        ...orderData,
        items: cleanedItems as any,
        userId,
        userEmail,
        pickupCode,
        status: 'pending',
        notes: orderData.notes || '',
        payment: {
          paymentIntentId,
          status: 'unpaid',
          amount: orderData.total,
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...order,
        createdAt: Timestamp.fromDate(order.createdAt),
        updatedAt: Timestamp.fromDate(order.updatedAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentIntentId?: string): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const updateData: any = {
        'payment.status': paymentStatus,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Update with the actual payment intent ID from Stripe if provided
      if (paymentIntentId) {
        updateData['payment.paymentIntentId'] = paymentIntentId;
      }

      if (paymentStatus === 'paid') {
        updateData['payment.paidAt'] = Timestamp.fromDate(new Date());
        updateData['status'] = 'preparing';
      }

      await updateDoc(orderRef, updateData);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  async getOrder(orderId: string): Promise<Order> {
    try {
      const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      const data = orderDoc.data();
      return {
        id: orderDoc.id,
        ...data,
        createdAt: (data?.createdAt as Timestamp).toDate(),
        updatedAt: (data?.updatedAt as Timestamp).toDate()
      } as Order;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    if (!userId) {
      throw new Error('UserId is required to fetch orders');
    }

    try {
      console.log('Fetching orders for user:', userId);
      
      let querySnapshot;
      
      try {
        const q = query(
          collection(db, ORDERS_COLLECTION),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        querySnapshot = await getDocs(q);
        console.log('Successfully queried with index');
      } catch (indexError) {
        console.warn('Index not yet ready, falling back to basic query:', indexError);
        const basicQuery = query(
          collection(db, ORDERS_COLLECTION),
          where('userId', '==', userId)
        );
        
        querySnapshot = await getDocs(basicQuery);
        querySnapshot.docs.sort((a, b) => {
          const dateA = (a.data().createdAt as Timestamp).toDate();
          const dateB = (b.data().createdAt as Timestamp).toDate();
          return dateB.getTime() - dateA.getTime();
        });
      }
      
      console.log('Found', querySnapshot.size, 'orders');
      
      const orders = querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        if (!data) {
          console.warn(`Order ${doc.id} has no data`);
          return null;
        }

        console.log('Processing order:', doc.id, data);
        
        try {
          if (!data.items || !Array.isArray(data.items)) {
            console.warn(`Order ${doc.id} has invalid items`);
            return null;
          }

          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? 
              data.createdAt.toDate() : 
              new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? 
              data.updatedAt.toDate() : 
              new Date(data.updatedAt)
          } as Order;
        } catch (parseError) {
          console.error(`Error processing order ${doc.id}:`, parseError);
          return null;
        }
      })
      .filter((order): order is Order => order !== null);
      
      console.log('Successfully processed orders:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to load orders: ${error.message}`);
      }
      throw new Error('Failed to load orders: Unknown error');
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate()
      })) as Order[];
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  },

  async cancelOrder(orderId: string, isAdmin = false): Promise<void> {
    try {
      const order = await this.getOrder(orderId);
      
      if (!isAdmin && order.status !== 'pending') {
        throw new Error('Only pending orders can be cancelled by users');
      }

      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  subscribeToOrderUpdates(orderId: string, callback: (order: Order) => void): () => void {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const order: Order = {
          id: doc.id,
          ...data,
          createdAt: (data?.createdAt as Timestamp).toDate(),
          updatedAt: (data?.updatedAt as Timestamp).toDate()
        } as Order;
        callback(order);
      }
    }, (error) => {
      console.error('Error subscribing to order updates:', error);
    });

    return unsubscribe;
  }
};