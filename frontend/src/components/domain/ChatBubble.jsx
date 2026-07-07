// src/components/domain/ChatBubble.jsx
// Aurora Design System — Chat bubble with Markdown + Rich Cards parsing for AI Copilot
import { useState } from 'react'
import { 
  Star, MapPin, DollarSign, Plane, CloudRain, Cloud, Sun, 
  Utensils, Building, Calendar, ArrowRight, HelpCircle, CheckCircle
} from 'lucide-react'
import Avatar from '@/components/common/Avatar'

// Safe lightweight Markdown regex parser
function parseMarkdown(text) {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300 mt-3 mb-1.5 font-display">$1</h4>')
  html = html.replace(/^## (.*?)$/gm, '<h3 class="text-sm font-bold text-text-primary mt-4 mb-2 border-b border-border/10 pb-1 font-display">$1</h3>')
  html = html.replace(/^# (.*?)$/gm, '<h2 class="text-base font-extrabold text-text-primary mt-5 mb-3 font-display">$2</h2>')

  // Bold / Strong
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>')
  
  // Italic / Em
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

  // Bullet items
  const lines = html.split('\n')
  let inList = false
  const processed = lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.slice(2)
      let prefix = ''
      if (!inList) {
        inList = true
        prefix = '<ul class="list-disc pl-5 my-2 space-y-1 text-text-secondary text-xs">'
      }
      return `${prefix}<li>${content}</li>`
    } else {
      let suffix = ''
      if (inList) {
        inList = false
        suffix = '</ul>'
      }
      return `${suffix}${line}`
    }
  })
  if (inList) {
    processed.push('</ul>')
  }
  html = processed.join('\n')

  // Double newlines into Paragraphs
  html = html.split('\n\n').map(p => {
    const trimmed = p.trim()
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li') || trimmed.startsWith('</ul')) {
      return p
    }
    if (!trimmed) return ''
    return `<p class="mb-2 leading-relaxed text-text-secondary text-xs">${p}</p>`
  }).join('\n')

  return html
}

export default function ChatBubble({
  message,
  sender = 'ai',
  timestamp,
  isStreaming = false,
  avatar,
  name,
  className = '',
  onAddStop, // fn(entityData) -> adds recommendation to active trip
}) {
  const isAi = sender === 'ai'

  // Extract custom bracket rich cards protocols from the message body
  // Formats:
  // [Hotel: Name | Location | Rating]
  // [Restaurant: Name | Cuisine | Cost]
  // [Budget: Target | Current]
  // [Flight: Carrier | Route | Time]
  // [Weather: Destination | Temp | Condition]
  
  const cards = []
  let cleanText = message || ''

  if (isAi && message) {
    // 1. Hotel cards extraction
    const hotelRegex = /\[Hotel:\s*([^|]+)\|\s*([^|]+)\|\s*([^|\]]+)\]/gi
    let match
    while ((match = hotelRegex.exec(message)) !== null) {
      cards.push({
        type: 'Hotel',
        name: match[1].trim(),
        location: match[2].trim(),
        rating: Number(match[3].trim()) || 4.5,
      })
    }
    cleanText = cleanText.replace(hotelRegex, '')

    // 2. Restaurant cards extraction
    const restRegex = /\[Restaurant:\s*([^|]+)\|\s*([^|]+)\|\s*([^|\]]+)\]/gi
    while ((match = restRegex.exec(message)) !== null) {
      cards.push({
        type: 'Restaurant',
        name: match[1].trim(),
        cuisine: match[2].trim(),
        cost: match[3].trim(),
      })
    }
    cleanText = cleanText.replace(restRegex, '')

    // 3. Budget cards extraction
    const budgetRegex = /\[Budget:\s*([^|]+)\|\s*([^|\]]+)\]/gi
    while ((match = budgetRegex.exec(message)) !== null) {
      cards.push({
        type: 'Budget',
        target: Number(match[1].trim()) || 0,
        current: Number(match[2].trim()) || 0,
      })
    }
    cleanText = cleanText.replace(budgetRegex, '')

    // 4. Flight cards extraction
    const flightRegex = /\[Flight:\s*([^|]+)\|\s*([^|]+)\|\s*([^|\]]+)\]/gi
    while ((match = flightRegex.exec(message)) !== null) {
      cards.push({
        type: 'Flight',
        carrier: match[1].trim(),
        route: match[2].trim(),
        time: match[3].trim(),
      })
    }
    cleanText = cleanText.replace(flightRegex, '')

    // 5. Weather cards extraction
    const weatherRegex = /\[Weather:\s*([^|]+)\|\s*([^|]+)\|\s*([^|\]]+)\]/gi
    while ((match = weatherRegex.exec(message)) !== null) {
      cards.push({
        type: 'Weather',
        destination: match[1].trim(),
        temp: match[2].trim(),
        condition: match[3].trim(),
      })
    }
    cleanText = cleanText.replace(weatherRegex, '')
  }

  const htmlContent = parseMarkdown(cleanText.trim())

  return (
    <div
      className={`
        flex gap-3 max-w-[88%] md:max-w-[80%]
        ${isAi ? 'self-start flex-row' : 'self-end flex-row-reverse ml-auto'}
        ${className}
      `}
      role="log"
      aria-live={isAi ? 'polite' : 'off'}
    >
      {/* Avatar */}
      <Avatar
        src={isAi ? '/favicon.svg' : avatar}
        name={isAi ? 'Copilot' : name}
        size="sm"
        className="shrink-0 shadow-sm border border-border/20"
      />

      <div className="flex flex-col gap-1.5 min-w-0">
        {/* Chat bubble body */}
        <div
          className="px-4 py-3 border border-solid shadow-sm transition-all duration-200"
          style={{
            background: isAi ? 'var(--color-surface-default)' : 'var(--color-indigo-600)',
            color: isAi ? 'var(--color-text-primary)' : '#ffffff',
            borderColor: isAi ? 'var(--color-border-subtle)' : 'transparent',
            borderRadius: isAi
              ? '0px var(--radius-xl) var(--radius-xl) var(--radius-xl)'
              : 'var(--radius-xl) 0px var(--radius-xl) var(--radius-xl)',
          }}
        >
          {isStreaming && !cleanText.trim() ? (
            <div className="flex items-center gap-1.5 py-1.5" aria-label="Copilot is typing">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.8s' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.8s' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.8s' }} />
            </div>
          ) : (
            <div 
              className="prose prose-invert max-w-none text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>

        {/* Dynamic Rich Cards container */}
        {isAi && cards.length > 0 && (
          <div className="flex flex-col gap-2 mt-1.5">
            {cards.map((card, idx) => (
              <div 
                key={idx} 
                className="bg-surface-raised border border-border/40 rounded-xl p-3 shadow-md flex flex-col gap-2.5 animate-fadeIn max-w-sm"
              >
                {/* ── HOTEL CARD ── */}
                {card.type === 'Hotel' && (
                  <>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                          <Building size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary truncate">{card.name}</h4>
                          <p className="text-[10px] text-text-muted flex items-center gap-0.5 truncate mt-0.5">
                            <MapPin size={10} /> {card.location}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 shrink-0 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
                        ★ {card.rating}
                      </span>
                    </div>
                    {onAddStop && (
                      <button
                        onClick={() => onAddStop({ name: card.name, address: card.location, targetType: 'Hotel' })}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        🏨 Add Hotel to Itinerary
                      </button>
                    )}
                  </>
                )}

                {/* ── RESTAURANT CARD ── */}
                {card.type === 'Restaurant' && (
                  <>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <Utensils size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary truncate">{card.name}</h4>
                          <p className="text-[10px] text-text-muted truncate mt-0.5">
                            🍴 {card.cuisine}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 shrink-0 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                        {card.cost}
                      </span>
                    </div>
                    {onAddStop && (
                      <button
                        onClick={() => onAddStop({ name: card.name, address: card.cuisine, targetType: 'Restaurant' })}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        🍽️ Add Restaurant to Itinerary
                      </button>
                    )}
                  </>
                )}

                {/* ── BUDGET PROGRESS CARD ── */}
                {card.type === 'Budget' && (() => {
                  const ratio = card.target > 0 ? (card.current / card.target) : 0
                  const isOver = ratio > 1.0
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-text-secondary">Spend Status</span>
                        <span className={isOver ? 'text-rose-400' : 'text-text-primary'}>
                          ₹{card.current.toLocaleString()} / ₹{card.target.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-base border border-border/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-rose-500' : ratio > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(100, ratio * 100)}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-text-muted">
                        {isOver 
                          ? '⚠️ You have exceeded the target budget for this segment.' 
                          : `Spend ratio is at ${(ratio * 100).toFixed(0)}% of segment limits.`}
                      </p>
                    </div>
                  )
                })()}

                {/* ── FLIGHT SUMMARY CARD ── */}
                {card.type === 'Flight' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-text-muted border-b border-border/20 pb-1.5">
                      <span className="flex items-center gap-1"><Plane size={12} /> Flight Summary</span>
                      <span className="text-indigo-400 uppercase">{card.carrier}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-xs font-semibold text-text-primary py-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted font-bold">Departure</span>
                        <span>{card.route.split('->')[0]?.trim()}</span>
                      </div>
                      <ArrowRight size={14} className="text-text-muted mt-3" />
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-text-muted font-bold">Arrival</span>
                        <span>{card.route.split('->')[1]?.trim()}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-text-secondary flex items-center justify-between mt-1 pt-1.5 border-t border-border/20">
                      <span>Schedule:</span>
                      <span className="font-bold text-text-primary">{card.time}</span>
                    </div>
                  </div>
                )}

                {/* ── WEATHER OVERLAY CARD ── */}
                {card.type === 'Weather' && (
                  <div className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2">
                      {card.condition.toLowerCase().includes('rain') ? (
                        <CloudRain size={16} className="text-indigo-300" />
                      ) : card.condition.toLowerCase().includes('cloud') ? (
                        <Cloud size={16} className="text-sky-300" />
                      ) : (
                        <Sun size={16} className="text-amber-400" />
                      )}
                      <div>
                        <h4 className="font-bold text-text-primary text-[11px] truncate max-w-[120px]">{card.destination}</h4>
                        <p className="text-[9px] text-text-secondary capitalize">{card.condition}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-text-primary">{card.temp}°C</span>
                      <p className="text-[9px] text-text-muted">Live Forecast</p>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span
            className={`text-[0.65rem] text-[var(--color-text-muted)] ${isAi ? 'text-left' : 'text-right'}`}
          >
            {timestamp}
          </span>
        )}
      </div>
    </div>
  )
}
