import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ProductCarouselProps {
  images: { id: number; imageUrl: string; isPrimary?: boolean }[];
  title: string;
}

export function ProductCarousel({ images, title }: ProductCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToImage = (index: number) => {
    setActiveIndex(index);
    if (carouselRef.current) {
      const scrollAmount = index * carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = () => {
    const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    scrollToImage(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    scrollToImage(prevIndex);
  };

  return (
    <div className="relative">
      <div 
        ref={carouselRef}
        className="carousel-container flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="carousel-item flex-shrink-0 w-full"
          >
            <img 
              src={image.imageUrl} 
              alt={`${title} - Image ${index + 1}`} 
              className="w-full h-96 object-cover"
            />
          </div>
        ))}
      </div>
      
      <div className="absolute top-4 right-4 flex flex-col space-y-3">
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full p-2"
          onClick={() => {
            navigator.share({
              title,
              url: window.location.href
            }).catch(err => console.log('Share failed:', err));
          }}
        >
          <span className="material-icons">share</span>
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full p-2"
        >
          <span className="material-icons text-primary">favorite</span>
        </Button>
      </div>
      
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 flex flex-col space-y-3">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full p-2"
            onClick={handlePrevious}
          >
            <span className="material-icons">chevron_left</span>
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full p-2"
            onClick={handleNext}
          >
            <span className="material-icons">chevron_right</span>
          </Button>
        </div>
      )}
      
      {/* Carousel indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0">
          <div className="flex justify-center space-x-1">
            {images.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${index === activeIndex ? 'bg-primary' : 'bg-white opacity-40'}`}
                onClick={() => scrollToImage(index)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Thumbnail Slider */}
      <div className="flex space-x-2 px-4 mt-3 overflow-x-auto no-scrollbar">
        {images.map((image, index) => (
          <div 
            key={image.id}
            className={`w-16 h-16 border ${index === activeIndex ? 'border-2 border-primary' : 'border-border'} rounded-md overflow-hidden cursor-pointer`}
            onClick={() => scrollToImage(index)}
          >
            <img 
              src={image.imageUrl} 
              alt={`${title} - Thumbnail ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
