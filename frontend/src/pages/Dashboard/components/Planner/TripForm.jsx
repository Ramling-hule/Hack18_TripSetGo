import { useState, useEffect, useRef } from 'react'
import { Sparkles, Navigation, MapPin, Plane, CalendarDays, DollarSign, Users, ChevronRight, Compass } from 'lucide-react'
import { motion } from 'framer-motion'

const plannerGlassPanelClass = 'bg-surface-glass/85 border border-border-default backdrop-blur-2xl shadow-lg'
const plannerSectionHeaderClass = 'flex items-center gap-2 mb-4 font-bold text-xs uppercase tracking-wider font-display'
const plannerSectionNumClass = 'flex items-center justify-center w-6 h-6 rounded-md text-[0.7rem] font-bold border border-border-subtle'
const plannerInputGroupClass = 'flex flex-col gap-1.5 relative'
const plannerInputClass = 'w-full bg-surface-base/40 border border-border-default rounded-[var(--radius-md)] px-4 py-3 pl-10 text-[0.875rem] text-text-primary transition-all duration-200 outline-none hover:border-border-interactive focus:border-border-focus focus:bg-indigo-950/15 focus:shadow-primary placeholder:text-text-muted'
const plannerInputIconClass = 'absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none'
const plannerChipLabelClass = 'text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 ml-1'

const plannerChipClass = (active) => `px-4 py-2 rounded-[var(--radius-md)] text-[0.8125rem] font-semibold transition-all duration-200 cursor-pointer border ${
  active
    ? 'bg-indigo-dim text-indigo-300 border-indigo-500 shadow-primary scale-[1.01]'
    : 'bg-surface-base/40 text-text-secondary border-border-default hover:bg-surface-hover hover:border-border-interactive hover:text-text-primary'
}`

const plannerPrefChipClass = (active) => `flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[var(--radius-md)] text-[0.8rem] font-medium transition-all duration-200 cursor-pointer border ${
  active
    ? 'bg-indigo-dim text-indigo-300 border-indigo-500 shadow-primary scale-[1.01]'
    : 'bg-surface-base/40 text-text-secondary border-border-default hover:bg-surface-hover hover:border-border-interactive hover:text-text-primary'
}`

const plannerGenerateBtnClass = 'mt-4 w-full inline-flex items-center justify-center gap-2 bg-indigo-700 text-white px-8 py-3.5 rounded-[var(--radius-md)] font-bold text-[0.95rem] transition-all duration-300 hover:bg-indigo-600 hover:shadow-primary hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'


const GROUP_TYPES = [
  { value: 'solo',   label: 'Solo' },
  { value: 'couple', label: 'Couple' },
  { value: 'family', label: 'Family' },
  { value: 'friends',label: 'Friends' },
]

const PACE_OPTIONS = [
  { value: 'relaxed',  label: 'Relaxed (1-2 places/day)' },
  { value: 'balanced', label: 'Balanced (3-4 places/day)' },
  { value: 'packed',   label: 'Packed (5+ places/day)' },
]

const PREFERENCES = [
  { value: 'beach',       label: '🏖️ Beach' },
  { value: 'mountains',   label: '⛰️ Mountains' },
  { value: 'culture',     label: '🏛️ Culture' },
  { value: 'food',        label: '🍜 Food' },
  { value: 'adventure',   label: '🪂 Adventure' },
  { value: 'nightlife',   label: '🎉 Nightlife' },
  { value: 'wildlife',    label: '🦁 Wildlife' },
  { value: 'relaxation',  label: '🧘 Relaxation' },
  { value: 'shopping',    label: '🛍️ Shopping' },
  { value: 'history',     label: '🏰 History' },
]

const POPULAR_CITIES = [
  // India
  'Delhi', 'Mumbai', 'Bengaluru', 'Goa', 'Jaipur', 'Hyderabad',
  'Srinagar', 'Kochi', 'Varanasi', 'Chennai', 'Kolkata', 'Pune',
  'Ahmedabad', 'Udaipur', 'Agra', 'Amritsar', 'Dehradun', 'Shimla',
  // Asia & Middle East
  'Dubai', 'Singapore', 'Bangkok', 'Tokyo', 'Bali', 'Maldives',
  'Kuala Lumpur', 'Hong Kong', 'Kathmandu', 'Colombo',
  // Europe & Americas
  'London', 'Paris', 'New York', 'Rome', 'Amsterdam', 'Barcelona',
  'Sydney', 'Melbourne', 'Toronto', 'Los Angeles', 'San Francisco'
];

function CityAutocomplete({ value, onChange, placeholder, icon: Icon }) {
  const [query, setQuery] = useState(value || '');
  const [prevValue, setPrevValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value || '');
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = POPULAR_CITIES.filter(c =>
    c.toLowerCase().includes((query || '').toLowerCase())
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <Icon size={14} className={plannerInputIconClass} />
      <input
        className={plannerInputClass}
        placeholder={placeholder}
        required
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          onChange(val);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
      />
      {isOpen && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.4rem',
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border-default)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 999,
          maxHeight: '260px',
          overflowY: 'auto',
          backdropFilter: 'blur(16px)'
        }}>
          {filtered.map(c => (
            <div
              key={c}
              onMouseDown={() => {
                setQuery(c);
                onChange(c);
                setIsOpen(false);
              }}
              style={{
                padding: '0.625rem 1rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                borderBottom: '1px solid var(--color-border-subtle)',
                transition: 'background 0.15s, color 0.15s'
              }}
              onMouseEnter={e => {
                e.target.style.background = 'var(--color-surface-hover)';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--color-text-primary)';
              }}
            >
              📍 {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripForm({ form, onSubmit, onChange, loading }) {
  const [prefs, setPrefs] = useState(form.preferences || [])
  const togglePref = (p) => {
    const next = prefs.includes(p) ? prefs.filter(x => x !== p) : [...prefs, p]
    setPrefs(next)
    onChange({ preferences: next })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate)) {
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { type: 'error', message: 'End Date cannot be before Start Date' } 
      }));
      return;
    }
    onSubmit(e);
  }

  return (
    <div className={plannerGlassPanelClass} style={{
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem 2rem 2rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      height: 680,
    }}>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem', paddingBottom: '0.5rem' }}>

        {/* Section 01: Route & Timeline */}
        <div>
          <div className={plannerSectionHeaderClass} style={{ color: 'var(--color-sky-500)' }}>
            <Navigation size={14} style={{ opacity: 0.7 }} />
            <span>Route &amp; Timeline</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem', position: 'relative', zIndex: 10 }}>
            <div className={plannerInputGroupClass}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: 4 }}>DEPARTURE FROM</label>
              <CityAutocomplete
                value={form.source}
                onChange={(val) => onChange({ source: val })}
                placeholder="Origin"
                icon={MapPin}
              />
            </div>
            <div className={plannerInputGroupClass}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: 4 }}>DESTINATION TO</label>
              <CityAutocomplete
                value={form.destination}
                onChange={(val) => onChange({ destination: val })}
                placeholder="Destination"
                icon={Plane}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className={plannerInputGroupClass}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: 4 }}>START DATE</label>
              <div style={{ position: 'relative' }}>
                <CalendarDays size={14} className={plannerInputIconClass} />
                <input
                  type="date"
                  className={plannerInputClass}
                  required
                  value={form.startDate}
                  onChange={e => onChange({ startDate: e.target.value })}
                />
              </div>
            </div>
            <div className={plannerInputGroupClass}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: 4 }}>END DATE</label>
              <div style={{ position: 'relative' }}>
                <CalendarDays size={14} className={plannerInputIconClass} />
                <input
                  type="date"
                  className={plannerInputClass}
                  required
                  min={form.startDate}
                  value={form.endDate}
                  onChange={e => onChange({ endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 02: Budget & Travelers */}
        <div>
          <div className={plannerSectionHeaderClass} style={{ color: 'var(--color-emerald-500)' }}>
            <DollarSign size={14} style={{ opacity: 0.7 }} />
            <span>Budget &amp; Travelers</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className={plannerInputGroupClass}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: 4 }}>BUDGET LIMIT (₹)</label>
              <div style={{ position: 'relative' }}>
                <span className={plannerInputIconClass} style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-family-body)' }}>₹</span>
                <input
                  type="number"
                  className={plannerInputClass}
                  placeholder="50,000"
                  required
                  value={form.budget}
                  onChange={e => onChange({ budget: e.target.value })}
                />
              </div>
            </div>
            <div className={plannerInputGroupClass}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: 4 }}>NUMBER OF TRAVELERS</label>
              <div style={{ position: 'relative' }}>
                <Users size={14} className={plannerInputIconClass} />
                <input
                  type="number"
                  className={plannerInputClass}
                  min={1}
                  max={30}
                  required
                  value={form.numTravelers}
                  onChange={e => onChange({ numTravelers: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <p className={plannerChipLabelClass}>COMPANION TYPE</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {GROUP_TYPES.map(g => {
                const active = form.groupType === g.value
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => onChange({ groupType: g.value })}
                    className={plannerChipClass(active)}
                  >
                    {g.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className={plannerChipLabelClass}>TRAVEL PACE</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {PACE_OPTIONS.map(p => {
                const active = (form.pace || 'balanced') === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => onChange({ pace: p.value })}
                    className={plannerChipClass(active)}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Section 03: Experience Preferences */}
        <div>
          <div className={plannerSectionHeaderClass} style={{ color: 'var(--color-violet-500)' }}>
            <Compass size={14} style={{ opacity: 0.7 }} />
            <span>Experience Preferences</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
            {PREFERENCES.map(p => {
              const active = prefs.includes(p.value)
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePref(p.value)}
                  className={plannerPrefChipClass(active)}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading}
          className={plannerGenerateBtnClass}
        >
          {loading ? (
            <span style={{
              width: 16, height: 16,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 1s linear infinite',
            }} />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'Building Your Itinerary...' : 'Generate AI Itinerary'}
          {!loading && <ChevronRight size={18} />}
        </button>
      </form>
    </div>
  )
}
