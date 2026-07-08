// src/components/common/SearchInput.jsx
// Aurora Design System — Search input with icon, clear button, optional shortcut hint
import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'

const SearchInput = forwardRef(function SearchInput(
  { value, onChange, placeholder = 'Search…', onClear, shortcut, className = '', ...props },
  ref
) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={16}
        className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none"
        aria-hidden="true"
      />

      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full
          bg-[var(--color-surface-raised)]
          border border-solid border-[var(--color-border-default)]
          rounded-full
          text-[var(--color-text-primary)]
          font-[var(--font-family-body)]
          text-[var(--font-size-body-sm)]
          pl-10 pr-10 py-2
          outline-none
          transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
          placeholder:text-[var(--color-text-muted)]
          hover:border-[var(--color-border-interactive)]
          focus:border-[var(--color-border-focus)]
          focus:shadow-[0_0_0_3px_var(--color-indigo-dim)]
          focus:bg-[var(--color-surface-default)]
        `}
        {...props}
      />

      {/* Right side: clear button or shortcut hint */}
      <div className="absolute right-3 flex items-center gap-1.5">
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors duration-[var(--duration-fast)]"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
        {shortcut && !value && (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)] text-[0.6875rem] font-mono border border-[var(--color-border-subtle)]">
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  )
})

export default SearchInput
