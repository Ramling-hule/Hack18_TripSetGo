import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function MapPreview({ trip }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapboxgl.supported() || !mapContainerRef.current) return

    // Simple default coordinates (India center)
    let center = [78.9629, 20.5937]
    let zoom = 3

    // Fallback coords mapping for common destinations to make the preview map look beautiful!
    const dest = (trip.destination || '').toLowerCase()
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
      shimla: [77.1734, 31.1048],
      udaipur: [73.7125, 24.5854],
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

    Object.keys(coordsMap).forEach(key => {
      if (dest.includes(key)) {
        center = coordsMap[key]
        zoom = 11
      }
    })

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
      interactive: true,
      attributionControl: false,
    })

    mapRef.current = map

    // Trigger resize once after load
    const resizeTimer = setTimeout(() => {
      map.resize()
    }, 400)

    // Add marker
    new mapboxgl.Marker({ color: 'var(--color-indigo-500)' })
      .setLngLat(center)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4 style="color:var(--color-text-primary);font-weight:600;font-size:0.875rem;">${trip.destination}</h4>`))
      .addTo(map)

    return () => {
      clearTimeout(resizeTimer)
      map.remove()
      mapRef.current = null
    }
  }, [trip.destination])

  return (
    <div
      role="application"
      aria-label="Trip daily route map preview"
      style={{
        marginTop: '2rem',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }} className="text-text-primary">
          Route Map
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0, marginTop: '0.25rem' }}>
          Visual route map for your trip to {trip.destination}
        </p>
      </div>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '300px',
        }}
      />
    </div>
  )
}
