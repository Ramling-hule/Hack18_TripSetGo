// src/pages/Dashboard/Profile.jsx
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { MapPin, Star, Award, Compass, Heart, CheckCircle2 } from 'lucide-react'
import { selectUser, updateUser } from '@/features/auth/authSlice'
import Avatar from '@/components/common/Avatar'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { selectTrips } from '@/features/trips/tripsSlice'
import api from '@/services/api'

export default function Profile() {
  const dispatch = useDispatch()
  const user   = useSelector(selectUser)
  const trips  = useSelector(selectTrips)
  
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    bio: user?.bio || '',
    location: user?.location || '',
    travelInterests: user?.travelInterests?.join(', ') || '',
    favoriteDestinations: user?.favoriteDestinations?.join(', ') || ''
  })
  
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    
    // Convert comma-separated strings back to arrays, stripping whitespace
    const travelInterests = form.travelInterests.split(',').map(s => s.trim()).filter(Boolean)
    const favoriteDestinations = form.favoriteDestinations.split(',').map(s => s.trim()).filter(Boolean)

    try {
      const res = await api.put('/api/v1/users/me', { 
        name: form.name, 
        bio: form.bio,
        location: form.location,
        travelInterests,
        favoriteDestinations
      })
      dispatch(updateUser(res.data.data))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const isPro = user?.plan === 'pro'

  return (
    <div className="animate-fadeIn pb-12">
      <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '2rem' }}>
        My <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Profile</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Identity & Stats */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          {/* Identity Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} 
            className="bg-bg-card border border-border rounded-xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden text-center">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

            <div className="flex justify-center mb-4 relative z-10">
              <div className="relative">
                <Avatar src={user?.avatar} name={user?.name} size="xl" />
                {isPro && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full border-2 border-bg-card shadow-lg flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> PRO
                  </div>
                )}
              </div>
            </div>
            
            <h2 className="font-bold text-xl mb-1 flex items-center justify-center gap-2 relative z-10">
              {user?.name}
              {user?.isEmailVerified && <CheckCircle2 size={16} className="text-emerald-400" />}
            </h2>
            
            <p className="text-text-secondary text-sm mb-2">{user?.email}</p>
            
            {user?.location && (
              <p className="flex items-center justify-center gap-1 text-sm text-text-muted mb-4">
                <MapPin size={14} /> {user?.location}
              </p>
            )}

            {!isPro && (
              <div className="inline-block bg-surface border border-border px-3 py-1 rounded-full text-xs font-semibold text-text-secondary mb-4">
                Free Plan
              </div>
            )}

            <div className="flex justify-around pt-4 border-t border-border mt-2">
              <div className="text-center">
                <p className="font-bold text-xl text-primary">{trips.length}</p>
                <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">Trips</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl">{user?.followersCount || 0}</p>
                <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl">{user?.followingCount || 0}</p>
                <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">Following</p>
              </div>
            </div>
          </motion.div>

          {/* Gamification & Reputation Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-bg-card border border-border rounded-xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Award className="text-primary" size={20} /> Reputation & Badges
            </h3>
            
            <div className="bg-surface rounded-lg p-4 flex items-center justify-between mb-4 border border-border">
              <span className="text-sm font-semibold text-text-secondary">Global Score</span>
              <span className="font-bold text-xl text-accent">{user?.reputationScore || 0}</span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Earned Badges</p>
              {user?.badges?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.badges.map(b => (
                    <span key={b} className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {b}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">Plan more trips to earn badges!</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Travel Profile & Edit Form */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          
          {/* Public Showcase */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} 
            className="bg-bg-card border border-border rounded-xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">About My Travel Style</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {user?.bio || "This traveler hasn't written a bio yet. They prefer to let their adventures speak for themselves."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-text-secondary">
                  <Compass size={16} /> Travel Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user?.travelInterests?.length > 0 ? user.travelInterests.map(i => (
                    <span key={i} className="bg-surface border border-border text-text-primary text-xs px-3 py-1 rounded-full shadow-sm">
                      {i}
                    </span>
                  )) : (
                    <span className="text-xs text-text-muted italic">Not specified</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-text-secondary">
                  <Heart size={16} /> Favorite Destinations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user?.favoriteDestinations?.length > 0 ? user.favoriteDestinations.map(d => (
                    <span key={d} className="bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium px-3 py-1 rounded-full">
                      {d}
                    </span>
                  )) : (
                    <span className="text-xs text-text-muted italic">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Edit Form */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-bg-card border border-border rounded-xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <h3 className="font-bold text-lg mb-6">Profile Settings</h3>
            
            {saved && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
                <CheckCircle2 size={16} /> Profile updated successfully!
              </div>
            )}
            
            {saveError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6">
                ⚠️ {saveError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                <Input label="Location" placeholder="E.g. Paris, France" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1.5">Bio</label>
                <textarea
                  className="w-full bg-surface border border-border rounded-md text-text-primary text-[0.9375rem] px-4 py-3 transition-all outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(14,165,233,0.2)] resize-y"
                  rows={3}
                  placeholder="Tell others about your travel style..."
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input 
                  label="Travel Interests (comma separated)" 
                  placeholder="e.g. Hiking, Food, Luxury" 
                  value={form.travelInterests} 
                  onChange={e => setForm(p => ({ ...p, travelInterests: e.target.value }))} 
                />
                <Input 
                  label="Favorite Destinations (comma separated)" 
                  placeholder="e.g. Tokyo, Swiss Alps" 
                  value={form.favoriteDestinations} 
                  onChange={e => setForm(p => ({ ...p, favoriteDestinations: e.target.value }))} 
                />
              </div>

              <div className="pt-2">
                <Input label="Account Email" value={user?.email || ''} disabled helperText="Email cannot be changed" />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={saving} size="lg">Save Changes</Button>
              </div>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  )
}