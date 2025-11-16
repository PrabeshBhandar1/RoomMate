import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { User, Message, ChatRoom } from '../../types/database'
import { Send, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'

export default function Chat() {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages()
      subscribeToMessages()
    }
  }, [selectedRoom])

  const fetchChatRooms = async () => {
    try {
      // Get all messages where user is either sender or receiver
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, name, email, phone, role, created_at),
          receiver:users!receiver_id(id, name, email, phone, role, created_at)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages by listing and get the other user
      const roomsMap = new Map<string, ChatRoom>()
      
      messagesData?.forEach((message: any) => {
        const isSender = message.sender_id === user?.id
        const otherUser = isSender ? message.receiver : message.sender
        const roomKey = `${message.listing_id}_${otherUser.id}`

        if (!roomsMap.has(roomKey)) {
          roomsMap.set(roomKey, {
            listing_id: message.listing_id,
            other_user: otherUser as User,
            last_message: message as Message,
            unread_count: 0,
          })
        }
      })

      setChatRooms(Array.from(roomsMap.values()))
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedRoom) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, name, email, phone, role, created_at),
          receiver:users!receiver_id(id, name, email, phone, role, created_at)
        `)
        .eq('listing_id', selectedRoom.listing_id)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .or(`sender_id.eq.${selectedRoom.other_user.id},receiver_id.eq.${selectedRoom.other_user.id}`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      scrollToBottom()
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const subscribeToMessages = () => {
    if (!selectedRoom) return

    const subscription = supabase
      .channel(`messages:${selectedRoom.listing_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `listing_id=eq.${selectedRoom.listing_id}`,
      }, (payload) => {
        if (payload.new) {
          // Fetch the complete message with user data
          fetchMessageWithUser(payload.new.id as string)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const fetchMessageWithUser = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, name, email, phone, role, created_at),
          receiver:users!receiver_id(id, name, email, phone, role, created_at)
        `)
        .eq('id', messageId)
        .single()

      if (error) throw error
      if (data) {
        setMessages(prev => [...prev, data as Message])
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error fetching message with user:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          listing_id: selectedRoom.listing_id,
          sender_id: user.id,
          receiver_id: selectedRoom.other_user.id,
          message: newMessage.trim(),
        })

      if (error) throw error

      setNewMessage('')
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Chat Rooms List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              </div>
              {chatRooms.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {chatRooms.map((room) => (
                    <button
                      key={`${room.listing_id}_${room.other_user.id}`}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full p-4 text-left hover:bg-gray-50 ${
                        selectedRoom?.listing_id === room.listing_id &&
                        selectedRoom?.other_user.id === room.other_user.id
                          ? 'bg-gray-100'
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {room.other_user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {room.last_message?.message || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedRoom.other_user.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-primary-100' : 'text-gray-500'
                              }`}
                            >
                              {format(new Date(message.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={sendMessage}
                        className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}