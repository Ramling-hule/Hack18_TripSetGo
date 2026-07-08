// src/pages/Auth/Login.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Sparkles, MapPin } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { login, selectAuthLoading, selectAuthError, clearError, setGoogleUser } from '@/features/auth/authSlice'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import api from '@/services/api'
import { getDestinationImage } from '@/utils/imageUtils'

const FLOATING_DESTINATIONS = ['Paris, France', 'Kyoto, Japan', 'Santorini, Greece', 'Bali, Indonesia']

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const loading   = useSelector(selectAuthLoading)
  const error     = useSelector(selectAuthError)
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [currentDestIndex, setCurrentDestIndex] = useState(0)

  useEffect(() => { return () => dispatch(clearError()) }, [dispatch])

  // Rotate images for the side panel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestIndex(prev => (prev + 1) % FLOATING_DESTINATIONS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(login(form))
    if (!res.error) navigate('/dashboard')
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/api/v1/auth/google/token', { token: credentialResponse.credential })
      dispatch(setGoogleUser(res.data.data))
      navigate('/dashboard')
    } catch {
      // error handled by interceptor
    }
  }

  return (
    <div className="min-h-screen flex bg-bg-primary overflow-hidden">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center relative z-10 px-6 sm:px-12 xl:px-20 py-12">
        {/* Animated background blobs (visible mainly on mobile when right panel is hidden) */}
        <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[-10%] w-[250px] h-[250px] bg-accent/20 rounded-full blur-[80px] -z-10 animate-float" />
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[420px] mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-12 text-decoration-none group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <img src="/favicon.svg" className="w-6 h-6 object-contain filter invert brightness-0" alt="Logo" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-text-primary">
              Trip<span className="bg-gradient-primary bg-clip-text text-transparent">SetGo</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-text-secondary text-sm">Enter your details to access your AI travel copilot.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              icon={<Mail size={16} />}
            />
            <Input
              label="Password"
              type={showPwd ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              icon={<Lock size={16} />}
              iconRight={
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-text-muted hover:text-text-primary transition-colors focus:outline-none">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">Forgot password?</Link>
            </div>
            <Button type="submit" loading={loading} size="lg" className="w-full py-3.5 text-base mt-2 shadow-glow">
              Sign In
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-border" />
            <span className="text-text-muted text-sm font-medium">OR CONTINUE WITH</span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>

          <div className="flex justify-center w-full [&>div]:w-full [&_iframe]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {}}
              theme="filled_black"
              shape="pill"
              text="signin_with"
              size="large"
              width="100%"
            />
          </div>

          <p className="text-center mt-8 text-text-secondary text-sm">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">Sign up free</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel: Visual Display (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative p-6">
        <div className="w-full h-full rounded-3xl overflow-hidden relative shadow-2xl shadow-primary/20 border border-white/10 group">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDestIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${getDestinationImage(FLOATING_DESTINATIONS[currentDestIndex])})` }}
            />
          </AnimatePresence>

          {/* Gradients to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 to-transparent" />

          {/* Floating UI Elements */}
          <div className="absolute bottom-16 left-16 right-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-4 shadow-lg">
                <Sparkles size={14} className="text-accent-amber" /> AI Copilot
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight tracking-tight shadow-black/50 drop-shadow-lg">
                Plan your perfect <br /> itinerary in seconds.
              </h2>
              <p className="text-white/80 text-lg max-w-md drop-shadow-md">
                Let Gemini 2.5 analyze millions of data points to craft a personalized journey just for you.
              </p>
            </motion.div>
          </div>
          
          {/* Destination Badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
            className="absolute top-8 right-8 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Exploring</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentDestIndex}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="text-white font-bold text-sm"
                >
                  {FLOATING_DESTINATIONS[currentDestIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
