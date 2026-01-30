import Link from "next/link"
import { FileText, Linkedin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">

          {/* Developer Branding */}
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-foreground" />
            <span className="font-semibold">Designed & Developed by Atharv Suryavanshi</span>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-muted-foreground">

            <a
              href="https://www.linkedin.com/in/atharv0604/"
              target="_blank"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>

            <a
              href="mailto:atharvsuryavanshi35@gmail.com"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              Gmail
            </a>

            <a
              href="tel:9371110123"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4" />
              9371110123
            </a>

          </div>

          {/* Copyright */}
          <p className="text-muted-foreground">
            © 2026 RentSecure
          </p>

        </div>
      </div>
    </footer>
  )
}
