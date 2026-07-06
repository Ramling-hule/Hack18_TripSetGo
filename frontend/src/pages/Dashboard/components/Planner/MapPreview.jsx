// MapPreview.jsx
// Aurora Design System — Mapbox interactive preview for active day routing.
// Reuses useMapbox hook + MapContainer + MapMarker + RouteLayer.
// Renders inside the sidebar column.
import { useMemo, useEffect } from 'react'
import { useMapbox } from '@/hooks/useMapbox'
import mapboxgl from 'mapbox-gl'
import MapContainer from '@/components/map/MapContainer'
import MapMarker from '@/components/map/MapMarker'
import RouteLayer from '@/components/map/RouteLayer'

export default function MapPreview({ dayData, destination }) {
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

  // Fit map viewport bounds to route coordinates or fallback destination
  useEffect(() => {
    if (!map) return

    if (routeCoords && routeCoords.length > 0) {
      if (routeCoords.length === 1) {
        map.easeTo({
          center: routeCoords[0],
          zoom: 13,
          duration: 800
        })
      } else {
        const bounds = new mapboxgl.LngLatBounds()
        routeCoords.forEach((coord) => {
          bounds.extend(coord)
        })
        map.fitBounds(bounds, {
          padding: 40,
          maxZoom: 14,
          duration: 800
        })
      }
    } else if (destination) {
      const dest = destination.toLowerCase()
      const coordsMap = {
        goa: [73.818, 15.2993],
        mumbai: [72.8777, 19.076],
        delhi: [77.1025, 28.7041],
        kolkata: [88.3639, 22.5726],
        calcutta: [88.3639, 22.5726],
        bangalore: [77.5946, 12.9716],
        bengaluru: [77.5946, 12.9716],
        chennai: [80.2707, 13.0827],
        madras: [80.2707, 13.0827],
        hyderabad: [78.4867, 17.3850],
        jaipur: [75.7873, 26.9124],
        agra: [78.0081, 27.1767],
        kyoto: [135.7681, 35.0116],
        tokyo: [139.6503, 35.6762],
        singapore: [103.8519, 1.29025],
        dubai: [55.2708, 25.2048],
        bali: [115.1889, -8.4095],
        paris: [2.3522, 48.8566],
        london: [-0.1278, 51.5074],
        newyork: [-74.006, 40.7128],
        manali: [77.1887, 32.2396],
        kerala: [76.2711, 9.9312],
      }

      let center = [78.9629, 20.5937]
      let zoom = 3
      Object.keys(coordsMap).forEach(key => {
        if (dest.includes(key)) {
          center = coordsMap[key]
          zoom = 11
        }
      })

      map.easeTo({
        center: center,
        zoom: zoom,
        duration: 800
      })
    }
  }, [map, routeCoords, destination])

  // Resize map after a short duration to solve hidden tab layout width constraints
  useEffect(() => {
    if (!map) return
    const timer = setTimeout(() => {
      map.resize()
    }, 400)
    return () => clearTimeout(timer)
  }, [map])

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
