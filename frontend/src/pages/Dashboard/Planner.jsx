 // src/pages/Dashboard/Planner.jsx
import { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, RotateCcw, Train, Hotel, Utensils,
  CalendarDays, Lightbulb, RefreshCw, Lock, Unlock, Layers, Save,
  Trash2, Download, Backpack, MapPin, Navigation, Clock,
  Users, Plane, Bus, Sun, Moon, Sunrise, Package, AlertTriangle
} from 'lucide-react'
import {
  selectPlanner, selectPlan, selectPlannerForm, selectPlannerLoading,
  selectLiveBudget, selectBudgetStatus,
  updateForm, generatePlan, resetPlan, setPlan, setGenerationFailed, selectTransport, selectHotel, selectFood,
  setActiveDay, toggleDayLock, toggleActivity, regenerateDay,
  setActiveTab, fetchDrafts, saveDraft, loadDraft, deleteDraft
} from '@/features/planner/plannerSlice'
import { useSocket } from '@/hooks/useSocket'
import BudgetBar from './components/Planner/BudgetBar'
import TripForm from './components/Planner/TripForm'
import TripAssistant from './components/Planner/TripAssistant'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Loader from '@/components/common/Loader'
import Modal from '@/components/common/Modal'
import TripSummaryHero from './components/Planner/TripSummaryHero'
import ResultsTabs from './components/Planner/ResultsTabs'
import TransportTab from './components/Planner/TransportTab'
import HotelsTab from './components/Planner/HotelsTab'
import FoodTab from './components/Planner/FoodTab'
import ItineraryTab from './components/Planner/ItineraryTab'
import EssentialsTab from './components/Planner/EssentialsTab'
import SuggestionsTab from './components/Planner/SuggestionsTab'
import DraftsTab from './components/Planner/DraftsTab'
import MapPreview from '../TripDetail/components/MapPreview'
import AIInsights from './components/Planner/AIInsights'
import QuickActions from './components/Planner/QuickActions'

/* ─── Tailwind Utility Classes ─── */
const plannerGlassPanelClass = 'bg-[rgba(26,31,47,0.7)] backdrop-blur-[40px] border border-solid border-[rgba(255,255,255,0.08)] border-t-[rgba(255,255,255,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'

const planTabBtnClass = (active) =>
  `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.8rem] font-semibold border border-solid cursor-pointer transition-all duration-200 font-sans whitespace-nowrap ` +
  (active
    ? 'bg-gradient-to-r from-primary to-secondary border-transparent text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]'
    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-text-muted hover:bg-[rgba(255,255,255,0.07)] hover:text-text-primary')

const planOptionCardClass = (selected) =>
  `border border-solid rounded-[14px] p-5 cursor-pointer transition-all duration-250 relative overflow-hidden ` +
  (selected
    ? 'border-[rgba(14,165,233,0.5)] bg-[rgba(14,165,233,0.07)] shadow-[0_0_20px_rgba(14,165,233,0.15),0_8px_24px_rgba(0,0,0,0.3)] after:content-[\'\'] after:absolute after:inset-0 after:bg-gradient-to-r after:from-[rgba(14,165,233,0.04)] after:to-transparent after:pointer-events-none'
    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:bg-[rgba(255,255,255,0.05)]')

const daySlotCardClass = (selected) =>
  `border border-solid rounded-xl p-4 cursor-pointer transition-all duration-200 ` +
  (selected
    ? 'border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.07)]'
    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.05)]')

/* ─── Data constants ─── */

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

function draftSummary(d) {
  const s = d.selections || {}
  return {
    transport:  s.transport?.mode || '—',
    hotel:      s.hotel?.name || '—',
    food:       s.food?.name || '—',
    activities: Array.isArray(s.activities) ? s.activities.length : 0,
    total:      d.liveBudget || 0,
  }
}

// Components extracted to ./components/Planner

/* ─── Transport Icon helper ─── */
function TransportIcon({ mode }) {
  const m = (mode || '').toLowerCase()
  if (m.includes('flight') || m.includes('air') || m.includes('plane')) return <Plane size={20} />
  if (m.includes('train') || m.includes('rail')) return <Train size={20} />
  if (m.includes('bus') || m.includes('road')) return <Bus size={20} />
  return <Navigation size={20} />
}

/* ─── Main Planner Component ─── */
export default function Planner() {
  const dispatch   = useDispatch()
  const plan       = useSelector(selectPlan)
  const form       = useSelector(selectPlannerForm)
  const loading    = useSelector(selectPlannerLoading)
  const liveBudget = useSelector(selectLiveBudget)
  const status     = useSelector(selectBudgetStatus)
  const { selections, activeDay, activeTab, lockedDays, regeneratingDay, tripId, drafts, draftsLoading, savingDraft, copilotConversationId } = useSelector(selectPlanner)
  const error      = useSelector(s => s.planner.error)

  const [compareIds, setCompareIds]     = useState([])
  const [saveDraftOpen, setSaveDraftOpen] = useState(false)
  const [draftName, setDraftName]         = useState('')
  const socket = useSocket()

  useEffect(() => {
    if (activeTab === 'drafts' && tripId) dispatch(fetchDrafts(tripId))
  }, [activeTab, tripId, dispatch])

  useEffect(() => {
    if (!socket) return;
    
    const handleCompleted = (data) => {
      if (data.success && data.planData) {
        dispatch(setPlan({ plan: data.planData, tripId: data.tripId }))
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Your AI itinerary is ready!' } }))
      }
    }
    
    const handleFailed = (data) => {
      dispatch(setGenerationFailed(data.error))
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: `Failed: ${data.error}` } }))
    }

    socket.on('itinerary:completed', handleCompleted)
    socket.on('itinerary:failed', handleFailed)
    
    return () => {
      socket.off('itinerary:completed', handleCompleted)
      socket.off('itinerary:failed', handleFailed)
    }
  }, [socket, dispatch])

  const handleFormChange = (updates) => dispatch(updateForm(updates))
  const handleSubmit = async (e) => { e.preventDefault(); await dispatch(generatePlan({ ...form, copilotConversationId })) }

  const handleRegenerate = async () => {
    try {
      const r = await dispatch(regenerateDay({ dayIndex: activeDay })).unwrap()
      window.dispatchEvent(new CustomEvent('toast', { detail: {
        type: 'success',
        message: r.usedFallback ? 'Day refreshed (offline mode)' : 'Day regenerated with AI ✨',
      } }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', { detail: {
        type: 'error',
        message: typeof err === 'string' ? err : 'Failed to regenerate day',
      } }))
    }
  }

  const toast = (type, message) => window.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }))

  const handleSaveDraft = () => {
    if (!tripId) return toast('error', 'Generate a plan before saving a draft')
    setDraftName(`Draft ${drafts.length + 1}`)
    setSaveDraftOpen(true)
  }

  const confirmSaveDraft = async (e) => {
    e.preventDefault()
    try {
      await dispatch(saveDraft({
        tripId, name: draftName.trim() || `Draft ${drafts.length + 1}`,
        selections, liveBudget, lockedDays,
      })).unwrap()
      setSaveDraftOpen(false)
      toast('success', 'Draft saved')
    } catch (err) {
      toast('error', typeof err === 'string' ? err : 'Failed to save draft')
    }
  }

  const handleLoadDraft = (d) => {
    dispatch(loadDraft(d))
    dispatch(setActiveTab('transport'))
    toast('success', `Loaded "${d.name}"`)
  }

  const handleDeleteDraft = async (id) => {
    try {
      await dispatch(deleteDraft({ tripId, draftId: id })).unwrap()
      setCompareIds(prev => prev.filter(x => x !== id))
    } catch (err) {
      toast('error', typeof err === 'string' ? err : 'Failed to delete draft')
    }
  }

  const toggleCompare = (id) => setCompareIds(prev => {
    if (prev.includes(id)) return prev.filter(x => x !== id)
    if (prev.length >= 2) return [prev[1], id]
    return [...prev, id]
  })

  const tabs = [
    { id: 'transport',   label: 'Transport',  icon: <Train size={14} /> },
    { id: 'hotels',      label: 'Hotels',     icon: <Hotel size={14} /> },
    { id: 'food',        label: 'Food',       icon: <Utensils size={14} /> },
    { id: 'itinerary',   label: 'Itinerary',  icon: <CalendarDays size={14} /> },
    { id: 'essentials',  label: 'Essentials', icon: <Backpack size={14} /> },
    { id: 'suggestions', label: 'AI Tips',    icon: <Lightbulb size={14} /> },
    { id: 'drafts',      label: 'Drafts',     icon: <Layers size={14} /> },
  ]

  return (
    <div className="page-enter">


      {/* Page header */}
      {!plan && (
        <div style={{
          marginBottom: '2rem',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.375rem',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              AI Trip <span className="bg-gradient-primary bg-clip-text text-transparent">Planner</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Describe your dream trip — Gemini crafts your perfect itinerary
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12, padding: '0.875rem 1.25rem',
          marginBottom: '1.5rem', color: '#f87171',
          fontSize: '0.875rem',
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Loader text="Gemini AI is crafting your perfect trip..." />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── STATE 1: Form + Assistant ── */}
        {!plan && !loading ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: '1.5rem',
              alignItems: 'stretch',
            }}
          >
            <TripForm form={form} onSubmit={handleSubmit} onChange={handleFormChange} loading={loading} />
            <TripAssistant />
          </motion.div>
        ) : plan ? (
          /* ── STATE 2: Generated Plan ── */
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
              gap: '1.5rem',
              alignItems: 'stretch',
            }}
            className="grid-cols-1 lg:grid-cols-[2fr_1fr]"
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Trip Summary Header */}
              <TripSummaryHero
                destination={plan.meta?.destination || form.destination}
                startDate={form.startDate}
                endDate={form.endDate}
                theme={plan.meta?.theme}
                numTravelers={form.numTravelers}
                groupType={form.groupType}
                onNewPlan={() => dispatch(resetPlan())}
              />

              {/* Budget Tracker */}
              <BudgetBar liveBudget={liveBudget} totalBudget={Number(form.budget)} status={status} />

              {/* Quick Actions (Print, Share, Save) */}
              <QuickActions
                onSaveDraftTrigger={() => setSaveDraftOpen(true)}
                liveBudget={liveBudget}
              />

              {/* Category Tabs */}
              <ResultsTabs
                activeTab={activeTab}
                onTabChange={(tabId) => dispatch(setActiveTab(tabId))}
              />

              {/* Tab Panels */}
              <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                <AnimatePresence mode="wait">
                  {activeTab === 'itinerary' && plan.itinerary && (
                    <motion.div key="itinerary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <ItineraryTab
                        itinerary={plan.itinerary}
                        activeDay={activeDay}
                        lockedDays={lockedDays}
                        regeneratingDay={regeneratingDay}
                        selections={selections.activities}
                        onDayChange={(idx) => dispatch(setActiveDay(idx))}
                        onToggleLock={(idx) => dispatch(toggleDayLock(idx))}
                        onRegenerate={handleRegenerate}
                        onToggleActivity={(args) => dispatch(toggleActivity(args))}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'transport' && plan.transport_options && (
                    <motion.div key="transport" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <TransportTab
                        options={plan.transport_options}
                        selectedOption={selections.transport}
                        onSelect={(t) => dispatch(selectTransport(t))}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'hotels' && plan.hotel_options && (
                    <motion.div key="hotels" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <HotelsTab
                        options={plan.hotel_options}
                        selectedOption={selections.hotel}
                        onSelect={(h) => dispatch(selectHotel(h))}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'food' && plan.food_plans && (
                    <motion.div key="food" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FoodTab
                        options={plan.food_plans}
                        selectedOption={selections.food}
                        onSelect={(f) => dispatch(selectFood(f))}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'essentials' && (
                    <motion.div key="essentials" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <EssentialsTab
                        weather={plan.weather}
                        packingList={plan.packing_list}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'suggestions' && plan.ai_suggestions && (
                    <motion.div key="suggestions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <SuggestionsTab suggestions={plan.ai_suggestions} />
                    </motion.div>
                  )}

                  {activeTab === 'drafts' && (
                    <motion.div key="drafts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <DraftsTab
                        drafts={drafts}
                        draftsLoading={draftsLoading}
                        savingDraft={savingDraft}
                        compareIds={compareIds}
                        liveBudget={liveBudget}
                        onSaveDraftTrigger={() => setSaveDraftOpen(true)}
                        onLoadDraft={handleLoadDraft}
                        onDeleteDraft={handleDeleteDraft}
                        onToggleCompare={toggleCompare}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expandable AI Insights Section */}
              <AIInsights
                destination={plan.meta?.destination || form.destination}
                theme={plan.meta?.theme}
              />
            </div>

            {/* Sidebar (Map Preview & Trip Copilot Assistant) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <MapPreview trip={{ destination: plan.meta?.destination || form.destination }} />
              <TripAssistant />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Save-draft modal */}
      <Modal isOpen={saveDraftOpen} onClose={() => setSaveDraftOpen(false)} title="Save draft" size="sm">
        <form onSubmit={confirmSaveDraft} className="flex flex-col gap-5">
          <Input label="Draft name" value={draftName} onChange={e => setDraftName(e.target.value)} placeholder="e.g. Budget option" autoFocus />
          <Button type="submit" loading={savingDraft} className="self-start">Save draft</Button>
        </form>
      </Modal>
    </div>
  )
}
