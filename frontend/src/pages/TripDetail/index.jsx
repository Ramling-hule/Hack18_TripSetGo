// src/pages/TripDetail/index.jsx — Collaborative, real-time trip view & editor
import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { selectUser } from '@/features/auth/authSlice'
import { likeTrip, cloneTrip } from '@/features/trips/tripsSlice'
import { useTripCollaboration } from '@/hooks/useTripCollaboration'
import api from '@/services/api'

// Common & Layout components
import Navbar from '@/components/layout/Navbar'
import LandingFooter from '@/components/landing/LandingFooter'

// Domain-specific components
import HeroStrip from './components/HeroStrip'
import MetadataBar from './components/MetadataBar'
import SocialSidebar from './components/SocialSidebar'
import FloatingActionBar from './components/FloatingActionBar'
import TripItinerary from './components/TripItinerary'
import MapPreview from './components/MapPreview'
import ImageGallery from './components/ImageGallery'
import InviteModal from './components/InviteModal'
import TripSkeletons from './components/TripSkeletons'
import { CollaboratorsList, BudgetBreakdown, LiveWeather, LiveHotels, TopAttractions, AITips } from './components/TripWidgets'

export default function TripDetail() {
  const { id }            = useParams()
  const currentUser       = useSelector(selectUser)
  const dispatch          = useDispatch()

  const [trip, setTrip]   = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)

  // Edit Mode states
  const [editMode, setEditMode] = useState(false)
  const [newActivityDay, setNewActivityDay] = useState(null)
  const [activityForm, setActivityForm] = useState({ name: '', notes: '', cost: '', startTime: '' })

  // Invite Modal states
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole]   = useState('editor')
  const [inviting, setInviting]       = useState(false)

  const fetchTripData = useCallback(() => {
    api.get(`/api/v1/trips/${id}`)
      .then(res => setTrip(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Trip not found or is private'))
      .finally(() => setLoading(false))
  }, [id])

  // Load trip details
  useEffect(() => {
    fetchTripData()
  }, [fetchTripData])

  // Real-time socket collaboration
  const { presence } = useTripCollaboration(id, fetchTripData)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Itinerary link copied to clipboard!' } }))
  }

  // Like & Clone Actions
  const handleLike = async () => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message: 'Please log in to like itineraries!' } }))
      return
    }
    try {
      const res = await dispatch(likeTrip(id)).unwrap()
      const data = res.data || res
      setTrip(prev => ({
        ...prev,
        isLiked: data.isLiked,
        likesCount: data.likesCount
      }))
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: data.isLiked ? 'Trip added to your favorites!' : 'Trip removed from favorites' } }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: err.message || 'Failed to update like' } }))
    }
  }

  const handleClone = async () => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message: 'Please log in to clone itineraries!' } }))
      return
    }
    try {
      await dispatch(cloneTrip(id)).unwrap()
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Itinerary cloned successfully to your trips!' } }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: err.message || 'Failed to clone trip' } }))
    }
  }

  // Permissions check
  const isOwner = currentUser && trip && (trip.userId?._id === currentUser._id || trip.userId === currentUser._id)
  const isEditor = currentUser && trip && trip.collaborators?.some(c => 
    (c.userId?._id === currentUser._id || c.userId === currentUser._id) && c.status === 'accepted' && c.role === 'editor'
  )
  const canEdit = isOwner || isEditor

  // Convert static AI itinerary to database format
  const handleInitializeItinerary = async () => {
    if (!trip || !trip.planData?.itinerary) return
    const plan = trip.planData
    const converted = plan.itinerary.map(d => {
      const dayActivities = []
      const slots = ['morning', 'afternoon', 'evening']
      slots.forEach(slot => {
        if (d[slot]?.activities) {
          d[slot].activities.forEach(act => {
            dayActivities.push({
              targetType: 'Custom',
              name: act.name,
              notes: act.description || '',
              cost: act.cost || 0
            })
          })
        }
      })
      return {
        day: d.day,
        date: trip.startDate ? new Date(new Date(trip.startDate).getTime() + (d.day - 1) * 24 * 60 * 60 * 1000) : new Date(),
        activities: dayActivities
      }
    })

    try {
      setLoading(true)
      const res = await api.put(`/api/v1/trips/${id}/itinerary`, { itinerary: converted })
      setTrip(res.data.data)
      setEditMode(true)
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Itinerary unlocked for editing!' } }))
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Failed to initialize itinerary' } }))
    } finally {
      setLoading(false)
    }
  }

  // Itinerary API Calls
  const handleAddDay = async () => {
    const nextDay = (trip.itinerary?.length || 0) + 1
    const nextDate = trip.startDate ? new Date(new Date(trip.startDate).getTime() + (nextDay - 1) * 24 * 60 * 60 * 1000) : new Date()
    try {
      const res = await api.post(`/api/v1/trips/${id}/itinerary/day`, { day: nextDay, date: nextDate, activities: [] })
      setTrip(res.data.data)
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: `Day ${nextDay} added` } }))
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Failed to add day' } }))
    }
  }

  const handleDeleteDay = async (dayNum) => {
    try {
      const res = await api.delete(`/api/v1/trips/${id}/itinerary/day/${dayNum}`)
      setTrip(res.data.data)
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: `Day ${dayNum} removed` } }))
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Failed to delete day' } }))
    }
  }

  const handleAddActivity = async (dayNum) => {
    if (!activityForm.name.trim()) return
    const dayEntry = trip.itinerary?.find(d => d.day === dayNum)
    if (!dayEntry) return

    const updatedActivities = [...(dayEntry.activities || []), {
      targetType: 'Custom',
      name: activityForm.name,
      notes: activityForm.notes,
      cost: Number(activityForm.cost) || 0,
      startTime: activityForm.startTime ? new Date(activityForm.startTime) : undefined
    }]

    try {
      const res = await api.put(`/api/v1/trips/${id}/itinerary/day/${dayNum}`, { activities: updatedActivities })
      setTrip(res.data.data)
      setActivityForm({ name: '', notes: '', cost: '', startTime: '' })
      setNewActivityDay(null)
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Activity added successfully!' } }))
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Failed to add activity' } }))
    }
  }

  const handleDeleteActivity = async (dayNum, activityIdx) => {
    const dayEntry = trip.itinerary?.find(d => d.day === dayNum)
    if (!dayEntry) return

    const updatedActivities = dayEntry.activities.filter((_, idx) => idx !== activityIdx)

    try {
      const res = await api.put(`/api/v1/trips/${id}/itinerary/day/${dayNum}`, { activities: updatedActivities })
      setTrip(res.data.data)
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Activity deleted' } }))
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Failed to delete activity' } }))
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const res = await api.post(`/api/v1/trips/${id}/collaborators`, { email: inviteEmail, role: inviteRole })
      setTrip(prev => ({ ...prev, collaborators: res.data.data }))
      setInviteEmail('')
      setInviteModal(false)
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Collaborator invited successfully!' } }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { type: 'error', message: err.response?.data?.message || 'Failed to send invitation' } 
      }))
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveCollaborator = async (userId) => {
    try {
      await api.delete(`/api/v1/trips/${id}/collaborators/${userId}`)
      setTrip(prev => ({ 
        ...prev, 
        collaborators: prev.collaborators.filter(c => c.userId?._id !== userId) 
      }))
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Collaborator removed' } }))
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Failed to remove collaborator' } }))
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
        <Navbar />
        <TripSkeletons />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: 'var(--color-surface-glass)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(20px)' }}>
            <div style={{ fontSize: 56, marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(129,140,248,0.2))' }}>🔒</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', fontFamily: 'var(--font-family-display)' }} className="text-text-primary">Trip Unavailable</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2.5rem', fontSize: '0.875rem', lineHeight: 1.5 }}>{error}</p>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', background: 'var(--color-indigo-600)', color: '#ffffff', textDecoration: 'none', borderRadius: 'var(--radius-lg)', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.15s ease-out' }} className="hover:bg-indigo-500">Go Home</Link>
          </div>
        </div>
      </div>
    )
  }

  const plan      = trip.planData || {}
  const meta      = plan.meta || {}
  const breakdown = plan.budget_breakdown_estimate || {}
  const isCustomized = trip.itinerary && trip.itinerary.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', paddingBottom: '6rem' }}>
      <Navbar />
      
      {/* 1. Hero Strip */}
      <HeroStrip trip={trip} />

      {/* 2. Metadata Bar */}
      <MetadataBar trip={trip} />

      {/* 3. Main Reading Area (Centered Layout split) */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '2rem auto 0',
          padding: '0 1.5rem',
          display: 'grid',
          gap: '2.5rem',
        }}
        className="px-6 md:px-10 grid-cols-1 lg:grid-cols-[1fr_260px]"
      >
        {/* Left Column (700px reading width content) */}
        <div style={{ minWidth: 0 }}>
          {/* Active Collaboration Banner */}
          {presence.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(52, 211, 153, 0.08)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(52, 211, 153, 0.2)', marginBottom: '1.5rem', width: 'fit-content' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }}></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34d399' }}>Active Planners:</span>
              <div style={{ display: 'flex', gap: '-0.25rem', marginLeft: '0.25rem' }}>
                {presence.map((u, idx) => (
                  <div key={idx} style={{ position: 'relative', marginLeft: idx > 0 ? '-8px' : '0' }}>
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} title={u.name}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--color-bg-primary)', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destination Curved Image Gallery */}
          <ImageGallery trip={trip} />

          {/* Interactive map visualization */}
          <MapPreview trip={trip} />

          {/* Itinerary Day Panels */}
          <TripItinerary
            trip={trip} plan={plan} editMode={editMode} handleAddDay={handleAddDay} handleDeleteDay={handleDeleteDay}
            newActivityDay={newActivityDay} setNewActivityDay={setNewActivityDay}
            activityForm={activityForm} setActivityForm={setActivityForm}
            handleAddActivity={handleAddActivity} handleDeleteActivity={handleDeleteActivity}
          />

          {/* Curated destination attractions */}
          <TopAttractions attractions={plan.attractions} />

          {/* Stays & Hotels section */}
          <LiveHotels hotels={plan.hotelResult?.options} />

          {/* Local weather widgets */}
          <LiveWeather weather={plan.weather} />

          {/* AI Tips and insights */}
          <AITips suggestions={plan.ai_suggestions} />
        </div>

        {/* Right Column (Sticky sidebar on Desktop viewports) */}
        <div className="hidden lg:block">
          <SocialSidebar
            trip={trip}
            currentUser={currentUser}
            onLike={handleLike}
            onClone={handleClone}
            onShare={handleShare}
            copied={copied}
            canEdit={canEdit}
            isOwner={isOwner}
            editMode={editMode}
            setEditMode={setEditMode}
            setInviteModal={setInviteModal}
            isCustomized={isCustomized}
            handleInitializeItinerary={handleInitializeItinerary}
          />
        </div>
      </div>

      {/* Collaborators List (outside layout grid, full-width details at bottom) */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto 0', padding: '0 1.5rem' }} className="px-6 md:px-10">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <CollaboratorsList trip={trip} isOwner={isOwner} handleRemoveCollaborator={handleRemoveCollaborator} />
          <BudgetBreakdown breakdown={breakdown} />
        </div>
      </div>

      {/* Floating Bottom action bar for Mobile viewports */}
      <FloatingActionBar
        trip={trip}
        onLike={handleLike}
        onClone={handleClone}
        onShare={handleShare}
        copied={copied}
      />

      {/* Shared Footer */}
      <div style={{ maxWidth: '1200px', margin: '3rem auto 0', padding: '0 1.5rem border-t border-border-subtle' }} className="px-6 md:px-10">
        <LandingFooter />
      </div>

      <InviteModal
        inviteModal={inviteModal} setInviteModal={setInviteModal}
        handleInvite={handleInvite} inviteEmail={inviteEmail} setInviteEmail={setInviteEmail}
        inviteRole={inviteRole} setInviteRole={setInviteRole} inviting={inviting}
      />
    </div>
  )
}
