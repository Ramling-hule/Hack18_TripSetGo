// DraftsTab.jsx
// Aurora Design System — Drafts management list & Side-by-Side comparison layout.
// Collapses comparison columns into clean card lists under small screens.
import { Fragment } from 'react'
import { Save, Layers, Download, Trash2 } from 'lucide-react'
import Loader from '@/components/common/Loader'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function DraftsTab({
  drafts = [],
  draftsLoading,
  savingDraft,
  compareIds = [],
  liveBudget,
  onSaveDraftTrigger,
  onLoadDraft,
  onDeleteDraft,
  onToggleCompare,
}) {
  const draftSummary = (d) => {
    const t = d.selections?.transport?.mode || 'None'
    const h = d.selections?.hotel?.name || 'None'
    const f = d.selections?.food?.name || 'None'
    const a = d.selections?.activities?.length || 0
    return { transport: t, hotel: h, food: f, activities: a, total: d.totalCost || 0 }
  }

  return (
    <div
      id="tabpanel-drafts"
      role="tabpanel"
      aria-label="Saved drafts and comparisons"
    >
      {/* ── Save Draft Row ── */}
      <div
        className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
        style={{
          padding: '1.125rem 1.5rem',
          borderRadius: 14,
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 700,
              fontFamily: 'var(--font-family-display)',
              color: '#ffffff',
              margin: '0 0 0.25rem 0',
            }}
          >
            Save current itinerary combo as draft
          </p>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.78rem',
              margin: 0,
            }}
          >
            Current total cost: {inr(liveBudget)} · Compare different setups side-by-side
          </p>
        </div>
        <button
          onClick={onSaveDraftTrigger}
          disabled={savingDraft}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.125rem',
            background: 'linear-gradient(135deg, var(--color-indigo-700), var(--color-sky-500))',
            border: 'none',
            borderRadius: 10,
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: savingDraft ? 'not-allowed' : 'pointer',
            opacity: savingDraft ? 0.6 : 1,
            transition: 'all 0.2s',
            boxShadow: 'var(--shadow-primary)',
            outline: 'none',
          }}
          className="hover:shadow-primary focus:ring-2 focus:ring-indigo-500"
        >
          <Save size={14} aria-hidden="true" />
          <span>{savingDraft ? 'Saving…' : 'Save Draft'}</span>
        </button>
      </div>

      {/* ── Drafts List or Loader ── */}
      {draftsLoading ? (
        <Loader text="Loading drafts..." />
      ) : drafts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Layers size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
          <p
            style={{
              fontWeight: 600,
              fontFamily: 'var(--font-family-display)',
              color: '#ffffff',
              margin: '0 0 0.25rem 0',
            }}
          >
            No saved drafts yet
          </p>
          <p style={{ fontSize: '0.8125rem', maxWidth: 320, margin: '0 auto' }}>
            Save a version above, toggle choices in other tabs, and compare them.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {drafts.map((d) => {
              const s = draftSummary(d)
              const isComparing = compareIds.includes(d._id)
              return (
                <div
                  key={d._id}
                  className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
                  style={{
                    borderRadius: 14,
                    padding: '1.25rem',
                    borderColor: isComparing ? 'var(--color-indigo-500)' : undefined,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-family-display)',
                        color: '#ffffff',
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {d.name}
                    </p>
                    <span
                      style={{
                        fontWeight: 800,
                        color: 'var(--color-indigo-400)',
                        flexShrink: 0,
                        marginLeft: '0.5rem',
                      }}
                    >
                      {inr(s.total)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <span>🚆 {s.transport}</span>
                    <span>🏨 {s.hotel}</span>
                    <span>🍽️ {s.food}</span>
                    <span>
                      📍 {s.activities} activit{s.activities === 1 ? 'y' : 'ies'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: '0.75rem',
                    }}
                  >
                    <button
                      onClick={() => onLoadDraft(d)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.3rem 0.75rem',
                        background: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 8,
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        outline: 'none',
                      }}
                      className="hover:border-border-interactive focus:border-border-focus"
                    >
                      <Download size={12} aria-hidden="true" />
                      <span>Load</span>
                    </button>

                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        userSelect: 'none',
                        margin: 0,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isComparing}
                        onChange={() => onToggleCompare(d._id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Compare</span>
                    </label>

                    <button
                      onClick={() => onDeleteDraft(d._id)}
                      aria-label={`Delete draft ${d.name}`}
                      style={{
                        marginLeft: 'auto',
                        padding: '0.35rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s',
                        outline: 'none',
                      }}
                      className="hover:text-rose-500 focus:text-rose-500"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Comparison details (only if exactly 2 selected) ── */}
          {compareIds.length === 2 && (() => {
            const a = drafts.find((d) => d._id === compareIds[0])
            const b = drafts.find((d) => d._id === compareIds[1])
            if (!a || !b) return null

            const sa = draftSummary(a)
            const sb = draftSummary(b)
            const rows = [
              ['Transport', sa.transport, sb.transport],
              ['Accommodation', sa.hotel, sb.hotel],
              ['Food Plan', sa.food, sb.food],
              ['Activities Count', `${sa.activities} items`, `${sb.activities} items`],
            ]

            return (
              <div
                className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
                style={{ borderRadius: 14, padding: '1.5rem', marginTop: '1.5rem' }}
              >
                <h3
                  style={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-family-display)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#ffffff',
                    margin: '0 0 1.25rem 0',
                    fontSize: '1rem',
                  }}
                >
                  <Layers size={16} style={{ color: 'var(--color-indigo-400)' }} />
                  <span>Draft Comparison</span>
                </h3>

                {/* Desktop comparison view (3 cols) */}
                <div
                  className="hidden md:grid"
                  style={{
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.625rem 1.25rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <span />
                  <span style={{ fontWeight: 700, color: 'var(--color-indigo-300)' }}>
                    {a.name}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--color-emerald-300)' }}>
                    {b.name}
                  </span>

                  {rows.map(([label, valA, valB]) => (
                    <Fragment key={label}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{valA}</span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{valB}</span>
                    </Fragment>
                  ))}

                  <span
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontWeight: 700,
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: '0.5rem',
                    }}
                  >
                    Total Cost
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: '0.5rem',
                      color:
                        sa.total <= sb.total
                          ? 'var(--color-emerald-400)'
                          : 'var(--color-text-primary)',
                    }}
                  >
                    {inr(sa.total)}
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: '0.5rem',
                      color:
                        sb.total < sa.total
                          ? 'var(--color-emerald-400)'
                          : 'var(--color-text-primary)',
                    }}
                  >
                    {inr(sb.total)}
                  </span>
                </div>

                {/* Mobile stacked comparison view */}
                <div className="grid md:hidden gap-4">
                  {[
                    { name: a.name, summary: sa, color: 'var(--color-indigo-400)' },
                    { name: b.name, summary: sb, color: 'var(--color-emerald-400)' },
                  ].map((dObj, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.875rem',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <p style={{ fontWeight: 700, color: dObj.color, margin: '0 0 0.5rem 0' }}>
                        {dObj.name}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          fontSize: '0.78rem',
                          color: 'var(--color-text-secondary)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span>🚆 Transport: {dObj.summary.transport}</span>
                        <span>🏨 Hotel: {dObj.summary.hotel}</span>
                        <span>🍽️ Food: {dObj.summary.food}</span>
                        <span>📍 Activities: {dObj.summary.activities} items</span>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0, color: '#fff' }}>
                        Total: {inr(dObj.summary.total)}
                      </p>
                    </div>
                  ))}
                </div>

                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: '1rem',
                    borderTop: '1px solid var(--color-border-subtle)',
                    paddingTop: '0.75rem',
                    margin: '1rem 0 0 0',
                  }}
                >
                  {sa.total === sb.total
                    ? 'Both drafts have the exact same total cost.'
                    : `"${sa.total < sb.total ? a.name : b.name}" is more cost-efficient by ${inr(Math.abs(sa.total - sb.total))}.`}
                </p>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
