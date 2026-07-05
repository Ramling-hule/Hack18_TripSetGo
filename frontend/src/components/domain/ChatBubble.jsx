// src/components/domain/ChatBubble.jsx
// Aurora Design System — Chat bubble for AI Copilot/Planner
// Asymmetric borders, user vs AI styles.
import Avatar from '@/components/common/Avatar'

export default function ChatBubble({
  message,
  sender = 'ai', // 'ai' or 'user'
  timestamp,
  isStreaming = false,
  avatar,
  name,
  className = '',
}) {
  const isAi = sender === 'ai'

  return (
    <div
      className={`
        flex gap-3 max-w-[85%]
        ${isAi ? 'self-start flex-row' : 'self-end flex-row-reverse ml-auto'}
        ${className}
      `}
    >
      {/* Avatar */}
      <Avatar
        src={isAi ? '/favicon.svg' : avatar}
        name={isAi ? 'TSG Copilot' : name}
        size="sm"
        className="shrink-0"
      />

      <div className="flex flex-col gap-1">
        {/* Bubble */}
        <div
          className={`
            px-4 py-3 text-[var(--font-size-body-sm)] leading-[var(--line-height-body)]
            border border-solid
          `}
          style={{
            background: isAi ? 'var(--color-surface-default)' : 'var(--color-indigo-700)',
            color: isAi ? 'var(--color-text-primary)' : 'var(--color-text-inverse)',
            borderColor: isAi ? 'var(--color-border-default)' : 'transparent',
            borderRadius: isAi
              ? '0px var(--radius-lg) var(--radius-lg) var(--radius-lg)'
              : 'var(--radius-lg) 0px var(--radius-lg) var(--radius-lg)',
            boxShadow: isAi ? 'var(--shadow-sm)' : 'none',
          }}
        >
          {isStreaming && !message ? (
            <div className="flex items-center gap-1 py-1 px-1">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="margin-0 whitespace-pre-wrap">{message}</p>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span
            className={`text-[0.6875rem] text-[var(--color-text-muted)] ${isAi ? 'text-left' : 'text-right'}`}
          >
            {timestamp}
          </span>
        )}
      </div>
    </div>
  )
}
