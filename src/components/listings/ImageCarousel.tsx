import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  title: string
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const displayImages = images.length > 0 ? images : ['/placeholder-room.jpg']

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  return (
    <div className="relative">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={displayImages[currentImage]}
          alt={`${title} - Image ${currentImage + 1}`}
          className="w-full h-96 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-room.jpg'
          }}
        />
      </div>

      {displayImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentImage ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}