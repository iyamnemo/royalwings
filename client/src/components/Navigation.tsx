import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

const Navigation: React.FC = () => {
  const { logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      toast.success('Logged out successfully', {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
      setTimeout(() => {
        window.location.reload();
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error('Failed to logout', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative font-medium transition-colors duration-200 text-sm ${
      isActive
        ? "text-cyan-600"
        : "text-slate-600 hover:text-cyan-600"
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">

          {/* LOGO + BRAND */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="RoyalWings Logo"
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                RoyalWings
              </span>
            </div>

            {/* USER NAVIGATION */}
            {!isAdmin && (
              <div className="hidden md:flex items-center gap-6">
                <NavLink to="/menu" className={linkClasses}>
                  Menu
                </NavLink>
                <NavLink to="/book" className={linkClasses}>
                  Book Table
                </NavLink>
              </div>
            )}

            {/* ADMIN NAVIGATION */}
            {isAdmin && (
              <div className="hidden md:flex items-center gap-6">
                <NavLink to="/admin" end className={linkClasses}>
                  Menu Admin
                </NavLink>
                <NavLink to="/admin/orders" className={linkClasses}>
                  Orders
                </NavLink>
                <NavLink to="/admin/bookings" className={linkClasses}>
                  Bookings
                </NavLink>
              </div>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-6">

            {!isAdmin && (
              <div className="hidden md:flex items-center gap-6">
                <NavLink to="/orders" className={linkClasses}>
                  Orders
                </NavLink>
                <NavLink to="/bookings" className={linkClasses}>
                  Bookings
                </NavLink>
                <NavLink to="/cart" className={linkClasses}>
                  Cart ({cart.items.length})
                </NavLink>
              </div>
            )}

            {/* PROFILE BADGE + LOGOUT */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex px-3 py-1 text-xs font-semibold bg-gradient-to-r from-cyan-50 to-blue-100 text-cyan-700 rounded-full border border-cyan-200">
                {isAdmin ? "Admin" : "Customer"}
              </span>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg shadow-sm hover:shadow-md hover:from-cyan-700 hover:to-blue-700 active:scale-95 transition transform duration-150"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 animate-slideUp">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLogout}
                className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:shadow-md transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
