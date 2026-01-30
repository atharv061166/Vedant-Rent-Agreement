"use client"

import Image from "next/image"
import { useEffect, useState, useRef } from "react"

// --- Helper Component: Animated Counter (Moved here) ---
interface CounterProps {
  end: number
  duration?: number
  suffix?: string
}

function AnimatedCounter({ end, duration = 2000, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTime: number
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 },
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return (
    <div ref={countRef} className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
      {count.toLocaleString()}
      {suffix}
    </div>
  )
}

// --- Main Team Section ---
export function TeamSection() {
  return (
    <section className="py-18 px-6 bg-transparent border-t border-border">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Meet Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dedicated professionals committed to providing you with the best rent agreement services.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 items-start mb-24">
          
          {/* Member 1: Ram Fuke */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-5/12 shrink-0">
              <div className="aspect-[4/5] relative overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="/ram sir.jpeg"
                  alt="Ram Fuke - Owner"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-7/12 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Ram Fuke</h3>
              <p className="text-purple-600 font-medium text-base mb-4">Owner & Founder</p>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  With a vision to simplify legal documentation for everyone, Ram founded 
                  Vedant Enterprise to bring transparency and speed to the rent agreement process.
                </p>
                <p>
                  He oversees the strategic direction, ensuring every 
                  agreement meets strict legal standards while maintaining 
                  affordability.
                </p>
              </div>
            </div>
          </div>

          {/* Member 2: Dhruv Ingale */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-5/12 shrink-0">
              <div className="aspect-[4/5] relative overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="/professional-indian-man-in-formal-attire-office-se.jpg"
                  alt="Dhruv Ingale"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-7/12 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Dhruv Ingale</h3>
              <p className="text-purple-600 font-medium text-base mb-4">Client Relations & Doc. Executive</p>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Dhruv is the friendly voice behind our client operations. 
                  He specializes in handling the documentation process from start to finish.
                </p>
                <p>
                  With an eye for detail, Dhruv ensures that your 
                  biometrics are scheduled conveniently and documents are 
                  delivered on time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- MOVED STATS SECTION --- */}
        <div className="pt-10 border-t border-gray-200">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <AnimatedCounter end={14673} suffix="+" />
              <p className="text-muted-foreground font-medium">Agreements Completed</p>
            </div>
            <div className="space-y-2">
              <AnimatedCounter end={9503} suffix="+" />
              <p className="text-muted-foreground font-medium">Happy Clients</p>
            </div>
            <div className="space-y-2">
              <AnimatedCounter end={12} suffix=" Years" />
              <p className="text-muted-foreground font-medium">Of Trusted Service</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}