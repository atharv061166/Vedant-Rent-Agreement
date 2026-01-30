import { HeroSection } from "@/components/homepage/hero-section"
import { TeamSection } from "@/components/homepage/team-section"
// 👇 CHANGE 1: Import HowItWorksSection here
import { HowItWorksSection } from "@/components/homepage/stats-section"

import { LocationSection } from "@/components/homepage/location-section"
import { Footer } from "@/components/homepage/footer"

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 12% 18%, #f1e7ff 0%, transparent 60%),
          radial-gradient(circle at 60% 8%,  #cfeee6 0%, transparent 55%),
          radial-gradient(circle at 92% 15%, #fff2c9 0%, transparent 60%),
          radial-gradient(circle at 18% 85%, #ffe1ea 0%, transparent 65%),
          radial-gradient(circle at 5% 70%,  #ffe6c9 0%, transparent 65%),
          #ffffff
        `,
      }}
    >
      <HeroSection />
      
      {/* 👇 CHANGE 2: Add the component here */}
      <HowItWorksSection />
      
      <TeamSection />
      <LocationSection />

      <Footer />
    </main>
  )
}