// MapPreview.jsx
// Aurora Design System — Mapbox interactive preview for active day routing.
// Reuses useMapbox hook + MapContainer + MapMarker + RouteLayer.
// Renders inside the sidebar column.
import { useMemo } from 'react'
import { useMapbox } from '@/hooks/useMapbox'
import MapContainer from '@/components/map/MapContainer'
import MapMarker from '@/components/map/MapMarker'
import RouteLayer from '@/components/map/RouteLayer'

export default function MapPreview({ dayData }) {
  const { mapContainerRef, map, mapLoaded, mapError } = useMapbox({
    style: 'mapbox://styles/mapbox/dark-v11', // Dark thematic style
    zoom: 11,
  })

  // Extract all coordinates and activities for the selected day
  const { routeCoords, markers } = useMemo(() => {
    const routeCoords = []
    const markers = []
    if (!dayData) return { routeCoords, markers }

    let idx = 0
    ;['morning', 'afternoon', 'evening'].forEach((slot) => {
      dayData[slot]?.activities?.forEach((act) => {
        if (act.coordinates?.lat && act.coordinates?.lon) {
          const coord = [Number(act.coordinates.lon), Number(act.coordinates.lat)]
          routeCoords.push(coord)
          markers.push({
            id: `marker-${slot}-${idx++}`,
            type: 'Attraction',
            coordinates: coord,
            name: act.name,
            slot,
          })
        }
      })
    })

    return { routeCoords, markers }
  }, [dayData])

  return (
    <div
      role="application"
      aria-label="Trip daily route map preview"
      style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle)',
        marginBottom: '1.5rem',
      }}
    >
      {mapError ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-surface-base)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-body-sm)',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          🗺️ Map rendering not supported or token missing.
        </div>
      ) : (
        <MapContainer ref={mapContainerRef}>
          {mapLoaded && routeCoords.length >= 2 && (
            <RouteLayer
              mapRef={{ current: map }}
              mapLoaded={mapLoaded}
              coordinates={routeCoords}
              color="var(--color-indigo-400)"
            />
          )}
          {mapLoaded &&
            markers.map((m) => (
              <MapMarker
                key={m.id}
                map={map}
                coordinates={m.coordinates}
                type={m.type}
                data={m}
              />
            ))}
        </MapContainer>
      )}
    </div>
  )
}
