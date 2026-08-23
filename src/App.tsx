import { JOURNEY_VH } from '@/data/journey'
import { useLenis } from '@/hooks/useLenis'
import { useIsMobile, useIsTouch, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { JourneyCanvas } from '@/components/three/JourneyCanvas'
import { Loader } from '@/components/layout/Loader'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { JourneyOverlays } from '@/components/sections/JourneyOverlays'
import { RocketShowcase } from '@/components/showcase/RocketShowcase'
import { Technology } from '@/components/sections/Technology'
import { Stats } from '@/components/sections/Stats'
import { FleetSection } from '@/components/fleet/FleetSection'
import { Timeline } from '@/components/sections/Timeline'
import { CTA } from '@/components/sections/CTA'

export default function App() {
  const isMobile = useIsMobile()
  const isTouch = useIsTouch()
  const reducedMotion = usePrefersReducedMotion()
  useLenis(reducedMotion)

  return (
    <>
      <Loader />
      <Navbar />

      {/* the fixed WebGL stage behind everything */}
      <JourneyCanvas isMobile={isMobile} isTouch={isTouch} />

      <main className="relative z-10">
        {/* scroll runway for the 3D journey — overlays are fixed inside it */}
        <div style={{ height: `${JOURNEY_VH}vh` }} className="relative">
          <Hero />
          <JourneyOverlays />
        </div>

        {/* post-journey content rises out of deep space */}
        <div className="relative bg-[linear-gradient(180deg,rgba(2,4,10,0)_0%,rgba(2,4,10,0.82)_6%,rgba(2,4,10,0.93)_12%,rgba(2,4,10,0.96)_100%)]">
          <RocketShowcase />
          <Technology />
          <Stats />
          <FleetSection />
          <Timeline />
          <CTA />
          <Footer />
        </div>
      </main>

      {/* filmic grain on top of everything */}
      <div className="noise-overlay" aria-hidden />
    </>
  )
}
