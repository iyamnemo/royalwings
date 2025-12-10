import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types/menu';
import { formatPriceInPHP } from '../utils/formatters';

interface MenuCarouselProps {
  items: MenuItem[];
}

const MenuCarousel: React.FC<MenuCarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Filter items that have images for carousel
  const carouselItems = items.filter(item => item.imageUrl && item.available);
  const displayItems = carouselItems.length > 0 ? carouselItems : items;

  useEffect(() => {
    if (!isAutoPlay || displayItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, 5000); // Change slide every 5 sencods

    return () => clearInterval(interval);
  }, [isAutoPlay, displayItems.length]);

  if (displayItems.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const goToNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlay(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  return (
    <div className="mb-12">
      {/* Main Carousel Container */}
      <div className="relative h-96 md:h-96 rounded-xl overflow-hidden shadow-2xl group bg-gray-900">
        {/* Slides */}
        {displayItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Image Background */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-4xl font-bold text-white flex-1">{item.name}</h2>
                <div className="bg-cyan-500 bg-opacity-80 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                  {item.category}
                </div>
              </div>
              <p className="text-gray-200 mb-4 line-clamp-2 overflow-hidden text-ellipsis">{item.description}</p>
              
              <span className="text-3xl font-bold text-cyan-400">{formatPriceInPHP(item.price)}</span>
            </div>
          </div>
        ))}

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-transparent hover:bg-white hover:bg-opacity-20 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <i className="fas fa-chevron-left text-xl"></i>
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-transparent hover:bg-white hover:bg-opacity-20 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <i className="fas fa-chevron-right text-xl"></i>
        </button>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold">
          {currentIndex + 1} / {displayItems.length}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {displayItems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-cyan-600 w-8'
                : 'bg-gray-400 w-3 hover:bg-gray-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Information */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          <span className="font-semibold text-gray-900">{displayItems[currentIndex].name}</span> 
         {' '} 
        </p>
      </div>
    </div>
  );
};

export default MenuCarousel;
