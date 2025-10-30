import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CarouselItem {
  before: string;
  after: string;
  description: string;
}

interface CarouselProps {
  items: CarouselItem[];
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // a percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset slider when the slide changes
  useEffect(() => {
    setSliderPosition(50);
  }, [currentIndex]);
  
  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    
    // Clamp between 0 and 100
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach/detach global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  const goToPrev = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === items.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full max-w-4xl mx-auto select-none group">
        <div 
            ref={containerRef}
            className="relative w-full h-96 rounded-lg overflow-hidden shadow-2xl"
            onMouseLeave={handleMouseUp}
        >
            {/* Before Image (base) */}
            <img 
                src={currentItem.before} 
                alt="Avant" 
                className="absolute w-full h-full object-cover pointer-events-none"
            />
            
            {/* After Image (clipped) */}
            <div 
                className="absolute w-full h-full overflow-hidden pointer-events-none" 
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                <img 
                    src={currentItem.after} 
                    alt="Après" 
                    className="absolute w-full h-full object-cover pointer-events-none"
                />
            </div>
            
            {/* Slider Handle */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white/70 cursor-ew-resize"
                style={{ left: `calc(${sliderPosition}% - 2px)` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm cursor-ew-resize">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5 5-5m7 10l5-5-5-5" /></svg>
                </div>
            </div>

            {/* Labels and Description */}
            <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full">AVANT</span>
                <span 
                    className="absolute top-4 right-4 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full transition-opacity"
                    style={{ opacity: sliderPosition > 70 ? 1 : 0 }}
                >
                    APRÈS
                </span>
                <div className="absolute bottom-0 left-0 p-6 text-white bg-gradient-to-t from-black/70 to-transparent w-full">
                    <p className="text-lg font-semibold">{currentItem.description}</p>
                </div>
            </div>
        </div>

      {/* Navigation Arrows */}
      <button onClick={goToPrev} className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 bg-gray-800/80 hover:bg-brand-primary text-white p-2 rounded-full focus:outline-none z-10 transition-all opacity-0 group-hover:opacity-100" aria-label="Précédent">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={goToNext} className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 bg-gray-800/80 hover:bg-brand-primary text-white p-2 rounded-full focus:outline-none z-10 transition-all opacity-0 group-hover:opacity-100" aria-label="Suivant">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Dots */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {items.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`w-3 h-3 rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-brand-primary' : 'bg-gray-600 hover:bg-gray-500'}`}
            aria-label={`Aller à la diapositive ${slideIndex + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;