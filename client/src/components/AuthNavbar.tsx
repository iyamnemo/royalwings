import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthNavbarProps {
  onNavigateToSection?: (sectionId: string) => void;
}

const AuthNavbar: React.FC<AuthNavbarProps> = ({ onNavigateToSection }) => {
  const navigate = useNavigate();

  const handleSectionClick = (sectionId: string) => {
    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-slate-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex justify-between h-16 items-center">
          {/* LOGO + BRAND */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="RoyalWings Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                RoyalWings
              </span>
            </div>

            {/* NAVIGATION LINKS */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleSectionClick('home-section')}
                className="text-slate-600 hover:text-cyan-600 font-medium text-sm transition-colors duration-200"
              >
                Home
              </button>
              <button
                onClick={() => handleSectionClick('menu-section')}
                className="text-slate-600 hover:text-cyan-600 font-medium text-sm transition-colors duration-200"
              >
                Menu
              </button>
              <button
                onClick={() => handleSectionClick('about-section')}
                className="text-slate-600 hover:text-cyan-600 font-medium text-sm transition-colors duration-200"
              >
                About Us
              </button>
            </div>
          </div>

          
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;