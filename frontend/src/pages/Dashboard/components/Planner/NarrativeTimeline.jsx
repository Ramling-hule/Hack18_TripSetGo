// NarrativeTimeline.jsx
// Aurora Design System — Vertical AI work stage sequence (5 stages).
// Renders as an <ol> (ordered list) for correct semantics.
// Children enter with staggerContainer / staggerItem (40ms, Aurora compliant).
import { motion } from 'framer-motion'
import { Search, Map, Hotel, Sparkles, CheckCircle } from 'lucide-react'
import NarrativeStageRow from './NarrativeStageRow'
import { staggerContainer } from '@/components/landing/animations/variants'

const STAGES = [
  { id: 0, icon: Search,       label: 'Researching destination'    },
  { id: 1, icon: Map,          label: 'Planning your route'        },
  { id: 2, icon: Hotel,        label: 'Sourcing stays & transport' },
  { id: 3, icon: Sparkles,     label: 'Personalising experience'   },
  { id: 4, icon: CheckCircle,  label: 'Finalising your itinerary'  },
]

export default function NarrativeTimeline({ stageIndex }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        aria-label="AI generation stages"
        style={{
          margin: 0,
          padding: '0.75rem 1rem',
          listStyle: 'none',
          background: 'rgba(14,17,23,0.55)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius-lg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {STAGES.map((stage) => (
          <NarrativeStageRow
            key={stage.id}
            icon={stage.icon}
            label={stage.label}
            status={
              stage.id < stageIndex
                ? 'completed'
                : stage.id === stageIndex
                ? 'active'
                : 'pending'
            }
          />
        ))}
      </motion.ol>
    </div>
  )
}
