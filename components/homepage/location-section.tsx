import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LocationSection() {
  return (
    <section id="contact" className="py-28 px-6 bg-transparent border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Visit Our Office</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Located in the heart of the city for your convenience.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            
            {/* Address Section */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <MapPin className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Address</h3>
                <p className="text-muted-foreground">
                  Shop No. H-4 Font of shree Nagari Society, Shop Name Vedant Enterprise, Near DTDC Courier behind Amanora Mall, Tupe corner 411028
                  <br />
                  Business District, Pune - 400001
                </p>
              </div>
            </div>

            {/* Phone Section (Click to Call) */}
            <a 
              href="tel:+918446615658" 
              className="flex gap-4 hover:opacity-75 transition-opacity cursor-pointer"
              title="Call us"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Phone className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-muted-foreground">+91 8446615658</p>
              </div>
            </a>

            {/* WhatsApp Section (Click to Chat) */}
            <a 
              href="https://wa.me/918446615658" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex gap-4 hover:opacity-75 transition-opacity cursor-pointer"
              title="Chat on WhatsApp"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Phone className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">WhatsApp</h3>
                <p className="text-muted-foreground">+91 8446615658</p>
              </div>
            </a>

            {/* --- EMAIL SECTION (Click to Mail) --- */}
            <a 
              href="mailto:Vedantenterprise7772@gmail.com"
              className="flex gap-4 hover:opacity-75 transition-opacity cursor-pointer"
              title="Send us an email"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Mail className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-muted-foreground">vedantenterprise7772@gmail.com</p>
              </div>
            </a>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Working Hours</h3>
                <p className="text-muted-foreground">
                  Mon - Sunday: 10:00 AM - 8:00 PM
                </p>
              </div>
            </div>
            
            <Button asChild className="rounded-full">
              <a href="https://www.google.com/maps/place/Rent+Agreement/@18.5194574,73.9384698,3a,75y,90t/data=!3m8!1e2!3m6!1sCIHM0ogKEICAgIC-hr-v8QE!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAG0ilSxosf0UfGnexbN3vwgOEOlmRbzNuahzTaFsyXxTlaWZZ9FC0tjn6l-gdMay8456KPV0CrKjUsSqJWyRtdnrJWOuzIMaAviaQSwB157kvWg9sU8QInK-3JQ-ye48tGxCJv8LWjR5_g%3Dw86-h152-k-no!7i899!8i1599!4m7!3m6!1s0x3bc2c300dc2c8d39:0x9526aa4d8511dcd8!8m2!3d18.5195469!4d73.9384752!10e5!16s%2Fg%2F11sb5wsgnp!17m2!4m1!1e3!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDExOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4 mr-2" />
                <h2>Open in Google Maps</h2>
              </a>
            </Button>
          </div>

          {/* --- MAP SECTION WITH BORDER --- */}
          {/* Added 'border-2 border-black' here */}
          <div className="aspect-video lg:aspect-square relative rounded-lg overflow-hidden bg-muted border-2 border-black">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.20895094025!2d73.9384698!3d18.5194574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c300dc2c8d39%3A0x9526aa4d8511dcd8!2sRent%20Agreement!5e0!3m2!1sen!2sin!4v1769081128005!5m2!1sen!2sin"
              width="600" 
              height="450" 
              style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>          
          </div>
        </div>
      </div>
    </section>
  )
}