import React, { useState, useEffect, useRef } from 'react';

interface CarouselProps {
    images: Array<{ url: string; caption?: string }>;
    autoplay?: boolean;
    interval?: number;
    showDots?: boolean;
    showArrows?: boolean;
    height?: string;
    transition?: 'slide' | 'fade';
    showCaptions?: boolean;
    captionFontSize?: string;
    captionColor?: string;
    captionAlign?: 'left' | 'center' | 'right';
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
    images,
    autoplay = true,
    interval = 5000,
    showDots = true,
    showArrows = true,
    height = '400px',
    transition = 'slide',
    showCaptions = true,
    captionFontSize = 'text-base',
    captionColor = '#ffffff',
    captionAlign = 'center',
    marginTop = '0px',
    marginBottom = '0px',
    marginLeft = '0px',
    marginRight = '0px',
    paddingTop = '0px',
    paddingBottom = '0px',
    paddingLeft = '0px',
    paddingRight = '0px',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (autoplay && images.length > 1) {
            intervalRef.current = setInterval(nextSlide, interval);
            
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [autoplay, interval, images.length]);

    const handleManualChange = (callback: () => void) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        callback();
        if (autoplay && images.length > 1) {
            intervalRef.current = setInterval(nextSlide, interval);
        }
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div 
            className="carousel-container relative w-full overflow-hidden rounded-lg box-border"
            style={{
                height,
                marginTop,
                marginBottom,
                marginLeft,
                marginRight,
                paddingTop,
                paddingBottom,
                paddingLeft,
                paddingRight,
                maxWidth: '100%',
                minWidth: 0,
            }}
        >
            <div className="carousel-slides relative w-full h-full box-border">
                {images.map((img, imgIndex) => (
                    <div
                        key={imgIndex}
                        className={`carousel-slide absolute inset-0 transition-opacity duration-500 box-border ${
                            imgIndex === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        <img
                            src={img.url}
                            alt={img.caption || `Slide ${imgIndex + 1}`}
                            className="w-full h-full object-cover block"
                        />
                        {showCaptions && img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4">
                                <p 
                                    className={captionFontSize}
                                    style={{
                                        color: captionColor,
                                        textAlign: captionAlign,
                                    }}
                                >
                                    {img.caption}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {showArrows && images.length > 1 && (
                <>
                    <button 
                        onClick={() => handleManualChange(prevSlide)}
                        className="carousel-prev absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 hover:scale-110 text-gray-800 hover:text-gray-900 rounded-full p-2 transition-all duration-300 shadow-lg hover:shadow-xl z-20 cursor-pointer"
                        aria-label="Previous slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => handleManualChange(nextSlide)}
                        className="carousel-next absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 hover:scale-110 text-gray-800 hover:text-gray-900 rounded-full p-2 transition-all duration-300 shadow-lg hover:shadow-xl z-20 cursor-pointer"
                        aria-label="Next slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}
            
            {showDots && images.length > 1 && (
                <div className="carousel-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {images.map((_, dotIndex) => (
                        <button
                            key={dotIndex}
                            onClick={() => handleManualChange(() => goToSlide(dotIndex))}
                            className={`carousel-dot w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer ${
                                dotIndex === currentIndex 
                                    ? 'bg-white shadow-lg' 
                                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                            }`}
                            aria-label={`Go to slide ${dotIndex + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Carousel;
