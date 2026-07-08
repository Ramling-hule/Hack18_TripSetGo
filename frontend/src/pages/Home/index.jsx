// src/pages/Home/index.jsx
// Orchestrator for the TripSetGo Aurora Landing Page.
// This is a thin wrapper that imports and organizes landing-specific layout components.
import Navbar from '@/components/layout/Navbar'
import HeroCarousel from '@/components/landing/HeroCarousel'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DestinationGrid from '@/components/landing/DestinationGrid'
import TestimonialSection from '@/components/landing/TestimonialSection'
import CTASection from '@/components/landing/CTASection'
import LandingFooter from '@/components/landing/LandingFooter'

export default function Home() {
  return (
    <div style={{ backgroundColor: 'var(--color-surface-base)', overflowX: 'hidden' }}>
      {/* Skip Navigation Link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--color-indigo-700)] focus:text-white focus:rounded-md focus:shadow-md focus:no-underline"
      >
        Skip to content
      </a>

      {/* Landing Navbar Variant */}
      <Navbar variant="landing" />

      {/* Main Content Area */}
      <main id="main-content">
        <HeroCarousel />
        <FeaturesSection />
        <DestinationGrid />
        <TestimonialSection />
        <CTASection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}