import React, { useState, useEffect } from 'react'
import { Search, MapPin, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Listing } from '../../types/database'
import RoomCard from '../../components/listings/RoomCard'
import FilterModal from '../../components/listings/FilterModel'

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minRent: 0,
    maxRent: 50000,
    facilities: [] as string[],
    available: true,
  })

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          owner:users!owner_id(name, phone, email)
        `)
        .eq('available', true)

      if (searchTerm) {
        query = query.ilike('location', `%${searchTerm}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    if (listing.rent < filters.minRent || listing.rent > filters.maxRent) return false
    if (filters.facilities.length > 0) {
      const hasAllFacilities = filters.facilities.every(facility => 
        listing.facilities.includes(facility)
      )
      if (!hasAllFacilities) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Room in Nepal
          </h1>
          <p className="text-xl text-gray-600">
            Discover affordable rooms and connect with verified house owners
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchListings()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchListings}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(true)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <RoomCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <FilterModal
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}
