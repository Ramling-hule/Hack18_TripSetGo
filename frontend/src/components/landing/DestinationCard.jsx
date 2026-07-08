// src/components/landing/DestinationCard.jsx
// Wraps PhotographyCard and overlays a Badge component absolute top-left.
// Props map directly to both PhotographyCard and Badge.
import PhotographyCard from '@/components/domain/PhotographyCard'
import Badge from '@/components/common/Badge'

export default function DestinationCard({
  imageUrl,
  title,
  subtitle,
  badgeLabel,
  badgeVariant = 'primary',
  onClick,
  className = '',
}) {
  return (
    <div
      style={{ position: 'relative' }}
      className={`group ${className}`}
    >
      <PhotographyCard
        imageUrl={imageUrl}
        title={title}
        subtitle={subtitle}
        aspectRatio="4/3"
        onClick={onClick}
      />

      {badgeLabel && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--spacing-4)',
            left: 'var(--spacing-4)',
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          <Badge label={badgeLabel} variant={badgeVariant} />
        </div>
      )}
    </div>
  )
}
