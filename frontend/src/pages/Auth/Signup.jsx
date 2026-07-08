// src/pages/Auth/Signup.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Sparkles, Compass } from 'lucide-react'
import { signup, selectAuthLoading, selectAuthError, clearError, setPendingEmail } from '@/features/auth/authSlice'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { getDestinationImage } from '@/utils/imageUtils'

const FLOATING_DESTINATIONS = ['Tokyo, Japan', 'Swiss Alps, Switzerland', 'Machu Picchu, Peru', 'Amalfi Coast, Italy']

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading  = useSelector(selectAuthLoading)
  const error    = useSelector(selectAuthError)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [localErr, setLocalErr] = useState('')
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
    setLocalErr('')
    if (form.password !== form.confirmPassword) { setLocalErr('Passwords do not match'); return }
    if (form.password.length < 8) { setLocalErr('Password must be at least 8 characters'); return }
    const res = await dispatch(signup({ name: form.name, email: form.email, password: form.password }))
    if (!res.error) {
      dispatch(setPendingEmail(form.email))
      navigate('/auth/verify-otp')
    }
  }

  const displayError = localErr || error

  return (
    <div className="min-h-screen flex flex-row-reverse bg-bg-primary overflow-hidden">
      {/* Right Panel: Form (Reversed layout for variety compared to login) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center relative z-10 px-6 sm:px-12 xl:px-20 py-12">
        {/* Animated background blobs */}
        <div className="absolute top-[10%] right-[-10%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[250px] h-[250px] bg-accent/20 rounded-full blur-[80px] -z-10 animate-float" />
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[420px] mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-10 text-decoration-none group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <img src="/favicon.svg" className="w-6 h-6 object-contain filter invert brightness-0" alt="Logo" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-text-primary">
              Trip<span className="bg-gradient-primary bg-clip-text text-transparent">SetGo</span>
            </span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-text-secondary text-sm">Join thousands of travelers planning smarter with AI.</p>
          </div>

          {displayError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              icon={<User size={16} />}
            />
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
              type="password"
              required
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              icon={<Lock size={16} />}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              icon={<Lock size={16} />}
            />
            <Button type="submit" loading={loading} size="lg" className="w-full py-3.5 text-base mt-4 shadow-glow">
              Create Account
            </Button>
          </form>

          <p className="text-center mt-8 text-text-secondary text-sm">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Left Panel: Visual Display (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative p-6">
        <div className="w-full h-full rounded-3xl overflow-hidden relative shadow-2xl shadow-secondary/20 border border-white/10 group">
          
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
          <div className="absolute inset-0 bg-gradient-to-l from-bg-primary/80 to-transparent" />

          {/* Floating UI Elements */}
          <div className="absolute bottom-16 right-16 left-16 text-right">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="flex flex-col items-end">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-4 shadow-lg">
                <Sparkles size={14} className="text-accent-secondary" /> Smart Planning
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight tracking-tight shadow-black/50 drop-shadow-lg text-right">
                Your journey <br /> starts here.
              </h2>
              <p className="text-white/80 text-lg max-w-md drop-shadow-md text-right">
                Collaborate with friends, track budgets, and explore the world with your AI copilot.
              </p>
            </motion.div>
          </div>
          
          {/* Destination Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
            className="absolute top-8 left-8 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Discovering</p>
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
