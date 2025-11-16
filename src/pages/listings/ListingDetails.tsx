import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Listing } from '../../types/database'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, MapPin, IndianRupee, Calendar, User, Phone, Mail } from 'lucide-react'
import ImageCarousel from '../../components/listings/ImageCarousel'
import toast from 'react-hot-toast'

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          owner:users!owner_id(name, phone, email)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setListing(data)
    } catch (error) {
      console.error('Error fetching listing:', error)
      toast.error('Error loading listing')
    } finally {
      setLoading(false)
    }
  }

  const handleContactOwner = async () => {
    if (!user) {
      toast.error('Please login to contact the owner')
      navigate('/login')
      return
    }

    if (user.id === listing?.owner_id) {
      toast.error('You cannot contact yourself')
      return
    }

    try {
      // Create or get existing chat
      const { data: existingChat } = await supabase
        .from('messages')
        .select('listing_id')
        .eq('listing_id', id)
        .eq('sender_id', user.id)
        .single()

      if (!existingChat) {
        // Create initial message
        const { error } = await supabase
          .from('messages')
          .insert({
            listing_id: id,
            sender_id: user.id,
            receiver_id: listing?.owner_id,
            message: `Hi, I'm interested in your room: ${listing?.title}`,
          })

        if (error) throw error
      }

      navigate('/chat')
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error('Error starting conversation')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Listing not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Go back to home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Carousel */}
          <ImageCarousel images={listing.images || []} title={listing.title} />

          <div className="p-6">
            {/* Title and Price */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{listing.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-3xl font-bold text-primary-600">
                  <IndianRupee className="h-6 w-6" />
                  <span>{listing.rent.toLocaleString()}</span>
                </div>
                <p className="text-gray-500">per month</p>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                listing.available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {listing.available ? 'Available' : 'Not Available'}
              </span>
            </div>

            {/* Facilities */}
            {listing.facilities && listing.facilities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Facilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posted Date */}
            <div className="flex items-center text-gray-500 mb-6">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Posted on {new Date(listing.created_at).toLocaleDateString()}</span>
            </div>

            {/* Owner Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <User className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="font-medium">{listing.owner?.name}</span>
                </div>
                <div className="flex items-center mb-3">
                  <Phone className="h-5 w-5 text-gray-600 mr-3" />
                  <span>{listing.owner?.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-600 mr-3" />
                  <span>{listing.owner?.email}</span>
                </div>
              </div>

              {user?.id !== listing.owner_id && (
                <button
                  onClick={handleContactOwner}
                  className="mt-4 w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 font-medium"
                >
                  Contact Owner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}