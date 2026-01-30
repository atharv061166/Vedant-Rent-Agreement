"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

// Added ShieldCheck, Lock, Headphones for the new cards
import { FileText, ShieldCheck, Clock, Star, Lock, Headphones } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { UiverseButton } from "@/components/ui/uiverse-button"

export function HeroSection() {
  const router = useRouter()

  const handleAdminClick = () => {
    router.push("/admin/login")
  }

  // Feature card data for cleaner JSX
  const features = [
    {
      icon: ShieldCheck,
      color: "text-purple-600",
      title: "Legally Compliant",
      desc: "All agreements are legally compliant and meticulously crafted to protect your interests."
    },
    {
      icon: Clock,
      color: "text-orange-500",
      title: "Fast Turnaround",
      desc: "Agreements delivered within 24-48 hours. Quick and efficient service to save your time."
    },
    {
      icon: Lock,
      color: "text-blue-600",
      title: "Secure & Confidential",
      desc: "Your personal information is safe. All documents are stored and handled confidentially."
    },
    {
      icon: Headphones,
      color: "text-indigo-600",
      title: "Expert Support",
      desc: "Receive expert assistance from our knowledgeable team at every step of the process."
    }
  ]

  return (
    // 1. OUTER CONTAINER: Creates the white border effect using padding (p-4)
    <section 
      // Change 'p-2' to 'p-1' if you want it even thinner
      className="min-h-screen p-2 md:p-3" 
      style={{
        background: `
          radial-gradient(circle at 12% 18%, #f1e7ff 0%, transparent 60%),
          radial-gradient(circle at 60% 8%,  #cfeee6 0%, transparent 55%),
          radial-gradient(circle at 92% 15%, #fff2c9 0%, transparent 60%),
          radial-gradient(circle at 18% 85%, #ffe1ea 0%, transparent 65%),
          radial-gradient(circle at 5% 70%,  #ffe6c9 0%, transparent 65%),
          #ffffff
        `
      }}
    >
      
      {/* 2. INNER CONTAINER: Holds the image, rounds the corners, and handles the layout */}
      <div 
        className="relative w-full min-h-[calc(100vh-2rem)] rounded-[2.5rem] overflow-hidden bg-cover bg-center shadow-2xl"
        style={{
          // REPLACE THIS with the actual path to your Image 1
          backgroundImage: "url('/image_1.png')", 
        }}
      >
        
        {/* 3. OVERLAY: Adds a dark tint so white text is readable on the city background */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10">

          {/* ================= NAVBAR ================= */}
          <nav className="flex items-center justify-between px-6 py-8 md:px-16 lg:px-24">
            <div className="flex items-center gap-2">
              <FileText className="h-7 w-7 text-white" />
              <span className="text-2xl font-semibold text-white">
                RentSecure
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-12">
            <Link href="#contact" className="text-white/90 hover:text-white hover:scale-105 transition-transform">
                Contact Us
              </Link>
              <button 
                onClick={handleAdminClick}
                className="text-white/90 hover:text-white hover:underline transition-all"
              >
                Admin
              </button>

              
            </div>
          </nav>

          {/* ================= HERO ================= */}
          <div className="flex flex-col items-center text-center px-4 mt-4 max-w-7xl mx-auto">

            {/* Trusted Badge - Made translucent for better blend */}
            <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-10 shadow-lg">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-white">Trusted by 10,000+ property owners</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              Vedant Enterprise
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Rent Agreement Services
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-100 max-w-3xl mb-14 leading-relaxed drop-shadow-md">
              Fast, reliable, and legally compliant rent agreements.
              We handle the paperwork so you can focus on what matters most.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 mb-20">
              <Link href="/contact">
                <UiverseButton text="Submit Details" />
              </Link>

              <Link href="/calculator">
                <UiverseButton text="Calculate Rent Agreement Cost" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <UiverseButton text="Sample Draft" />
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg">
                  <DropdownMenuItem asChild>
                    <a href="/residentialdraft.pdf" target="_blank">
                      Residential
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <a href="/nonresidentialdraft.pdf" target="_blank">
                      Non-Residential
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ================= KEY FEATURES SECTION ================= */}
            <div className="w-full pb-16">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    // Changed to solid white cards to match Image 2 style and pop against the dark background
                    className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col items-center"
                  >
                    <div className={`p-3 rounded-full bg-gray-50 shadow-sm mb-4 ${feature.color}`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}