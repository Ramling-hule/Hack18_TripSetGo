// src/components/common/Card.jsx
// Aurora Design System — Base card surface
// Variants: default (flat), raised (elevated), interactive (hoverable)

import { forwardRef } from 'react'

const variantStyles = {
  default: [
    'bg-[var(--color-surface-default)]',
    'border border-[var(--color-border-default)]',
    'rounded-[var(--radius-lg)]',
  ].join(' '),

  raised: [
    'bg-[var(--color-surface-raised)]',
    'border border-[var(--color-border-default)]',
    'rounded-[var(--radius-lg)]',
    'shadow-[var(--shadow-sm)]',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  ].join(' '),

  interactive: [
    'bg-[var(--color-surface-default)]',
    'border border-[var(--color-border-default)]',
    'rounded-[var(--radius-lg)]',
    'transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]',
    'hover:border-[var(--color-border-interactive)]',
    'hover:shadow-[var(--shadow-md)]',
    'hover:-translate-y-0.5',
    'cursor-pointer',
  ].join(' '),

  glass: [
    'bg-[var(--color-surface-glass)]',
    'backdrop-blur-[16px]',
    'border border-[var(--color-border-default)]',
    'rounded-[var(--radius-lg)]',
    'shadow-[var(--shadow-md)]',
  ].join(' '),
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
}

const Card = forwardRef(function Card(
  { variant = 'default', padding = 'md', className = '', children, onClick, ...props },
  ref
) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      ref={ref}
      onClick={onClick}
      className={`
        ${variantStyles[variant] || variantStyles.default}
        ${paddingMap[padding] || paddingMap.md}
        ${onClick ? 'text-left w-full' : ''}
        ${className}
      `}
      {...(Tag === 'button' ? { type: 'button' } : {})}
      {...props}
    >
      {children}
    </Tag>
  )
})

export default Card
