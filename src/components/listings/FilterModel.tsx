import React, { useState } from 'react'
import { X } from 'lucide-react'

const FACILITIES = [
  'WiFi',
  'Parking',
  'Kitchen',
  'Laundry',
  'AC',
  'Heater',
  'Furnished',
  'Pet Friendly',
  'Gym',
  'Swimming Pool'
]

interface FilterModalProps {
  filters: {
    minRent: number
    maxRent: number
    facilities: string[]
    available: boolean
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
}

export default function FilterModal({ filters, onFiltersChange, onClose }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFacilityToggle = (facility: string) => {
    setLocalFilters(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }))
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Rent Range */}
          <div>
            <h3 className="text-lg font-medium mb-3">Rent Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rent (Rs)
                </label>
                <input
                  type="number"
                  value={localFilters.minRent}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, minRent: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rent (Rs)
                </label>
                <input
                  type="number"
                  value={localFilters.maxRent}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, maxRent: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div>
            <h3 className="text-lg font-medium mb-3">Facilities</h3>
            <div className="grid grid-cols-2 gap-2">
              {FACILITIES.map(facility => (
                <label key={facility} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="mr-2"
                  />
                  <span className="text-sm">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.available}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, available: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium">Show only available rooms</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}