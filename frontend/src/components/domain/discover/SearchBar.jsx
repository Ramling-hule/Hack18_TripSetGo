import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin } from 'lucide-react'
import Input from '@/components/common/Input'

export default function SearchBar({
  value,
  onChange,
  onFocusChange,
  suggestions = ['Goa', 'Mumbai', 'Paris', 'New York', 'Tokyo', 'London', 'Sydney'],
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef(null)

  const handleFocus = () => {
    setIsFocused(true)
    setShowSuggestions(true)
    if (onFocusChange) onFocusChange(true)
  }

  const handleBlur = () => {
    // Small timeout to allow clicking suggestion items
    setTimeout(() => {
      setIsFocused(false)
      setShowSuggestions(false)
      if (onFocusChange) onFocusChange(false)
    }, 200)
  }

  const handleSuggestionClick = (val) => {
    onChange({ target: { value: val } })
    setShowSuggestions(false)
  }

  const handleClear = () => {
    onChange({ target: { value: '' } })
  }

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes((value || '').toLowerCase()) &&
    s.toLowerCase() !== (value || '').toLowerCase()
  )

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 580,
        zIndex: 50,
      }}
    >
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1.0,
          boxShadow: isFocused
            ? '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(98, 119, 204, 0.2)'
            : '0 4px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        style={{
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          width: '100%',
          backgroundColor: 'var(--color-surface-raised)',
        }}
      >
        <Input
          placeholder="Search destinations, tags..."
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          icon={<Search size={18} style={{ color: isFocused ? 'var(--color-indigo-400)' : 'var(--color-text-muted)' }} />}
          iconRight={
            value ? (
              <button
                onClick={handleClear}
                aria-label="Clear search"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            ) : null
          }
          className="border-none hover:border-none focus:border-none focus:shadow-none bg-transparent"
          style={{
            paddingLeft: '2.75rem',
            paddingRight: value ? '2.75rem' : '1.25rem',
            border: 'none',
            outline: 'none',
          }}
        />
      </motion.div>

      {/* Backdrop overlay managed within page or locally */}
      {isFocused && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(8, 17, 34, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && value && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 8,
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 12,
              boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
              maxHeight: 280,
              overflowY: 'auto',
              zIndex: 999,
            }}
          >
            <div style={{ padding: '0.5rem 0' }}>
              {filteredSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-body)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background-color 0.15s',
                  }}
                  className="hover:bg-surface-hover"
                >
                  <MapPin size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
