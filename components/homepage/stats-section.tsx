"use client"

import { FileText, ClipboardCheck, ShieldCheck, Handshake } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      id: "01",
      title: "1. Submit Your Details",
      description: "Fill out our simple form with the necessary landlord and tenant details to get the process started immediately.",
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "02",
      title: "2. We Prepare the Agreement",
      description: "Our legal experts draft a comprehensive agreement tailored to local laws and your specific requirements.",
      icon: ClipboardCheck,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "03",
      title: "3. Secure Documentation",
      description: "We handle the printing, biometric verification, and secure processing of all your sensitive documents.",
      icon: ShieldCheck,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "04",
      title: "4. Get Your Agreement",
      description: "Receive the legally binding, registered rent agreement delivered directly to your doorstep or email.",
      icon: Handshake,
      color: "bg-pink-100 text-pink-600",
    },
  ]

  return (
    <section className="py-5 px-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
          <p className="text-lg text-gray-600">
            Get ready to experience a seamless process. We handle the complexities 
            while you sit back and relax. Here is how we get it done:
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-white/40 flex flex-col items-center text-center group"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}