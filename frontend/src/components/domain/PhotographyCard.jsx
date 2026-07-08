// src/components/domain/PhotographyCard.jsx
// Aurora Design System — Full-bleed destination photo card
// Per Aurora Section 20: Photography Treatment — scrim formula, aspect ratios.

export default function PhotographyCard({
  imageUrl,
  title,
  subtitle,
  aspectRatio = '4/3', // '4/3' or '16/9'
  onClick,
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden
        rounded-[var(--radius-lg)]
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
        hover:shadow-[var(--shadow-md)]
        ${className}
      `}
      style={{ aspectRatio }}
    >
      {/* Photo */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title || ''}
          className="w-full h-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--easing-standard)] group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ background: 'var(--color-surface-raised)' }}
        />
      )}

      {/* Scrim */}
      <div className="scrim-bottom absolute inset-0" />

      {/* Text overlay */}
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {title && (
            <h3
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--font-size-h3)',
                fontWeight: 700,
                color: 'white',
                margin: 0,
                marginBottom: subtitle ? 4 : 0,
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              fontSize: 'var(--font-size-caption)',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
