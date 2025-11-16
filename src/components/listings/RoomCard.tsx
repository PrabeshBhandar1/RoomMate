import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, IndianRupee } from 'lucide-react'
import type { Listing } from "../../types/database";
interface RoomCardProps {
  listing: Listing
}

export default function RoomCard({ listing }: RoomCardProps) {
  const mainImage = listing.images?.[0] || '/placeholder-room.jpg'

  return (
    <Link to={`/listings/${listing.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-w-16 aspect-h-12">
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-room.jpg'
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
          <div className="flex items-center mb-2">
            <IndianRupee className="h-4 w-4 text-gray-500" />
            <span className="text-xl font-bold text-primary-600 ml-1">{listing.rent.toLocaleString()}</span>
            <span className="text-gray-500 ml-1">/month</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{listing.location}</span>
          </div>
          {listing.facilities && listing.facilities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {listing.facilities.slice(0, 3).map((facility, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {facility}
                </span>
              ))}
              {listing.facilities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{listing.facilities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}