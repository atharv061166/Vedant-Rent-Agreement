"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Share2, RotateCcw, Info, Check, Calculator, Copy, MessageCircle, X, Smartphone, ArrowLeft } from "lucide-react"

// --- Types ---

interface RentRow {
  id: number
  from: number
  to: number
  percent: number
  amount: number
}

interface CalculatorState {
  propertyType: "residential" | "non-residential"
  locationType: "urban" | "rural"
  duration: number
  deposit: number
  rentType: "fixed" | "varying"
  startRent: number 
  outOfPune: boolean
  outOfMaharashtra: boolean
  includePoliceIntimation: boolean
  puneVisit: boolean // <--- NEW STATE
}

const PriceCalculator = () => {
  /* ---------------- STATE ---------------- */
  const [formState, setFormState] = useState<CalculatorState>({
    propertyType: "residential",
    locationType: "urban",
    duration: 11,
    deposit: 0,
    rentType: "fixed",
    startRent: 0,
    outOfPune: false,
    outOfMaharashtra: false,
    includePoliceIntimation: false,
    puneVisit: false, // <--- Default false
  })

  const [rentRows, setRentRows] = useState<RentRow[]>([])
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  /* ---------------- CONSTANTS ---------------- */
  const PRICING = {
    registrationFee: 1000,
    dhcFee: 300,
    serviceBase: 1000,
    policeIntimationFixed: 500,
    outOfPuneCost: 500,
    outOfMaharashtraCost: 1000,
    puneVisitCost: 300, // <--- Cost for Pune Visit (Adjust if needed)
  }

  /* ---------------- LOGIC ---------------- */
  useEffect(() => {
    const totalMonths = Number(formState.duration) || 0
    if (totalMonths === 0) {
      setRentRows([])
      return
    }

    const blockSize = totalMonths % 12 === 0 ? 12 : 11
    const numberOfBlocks = Math.ceil(totalMonths / blockSize)
    
    const newRows: RentRow[] = []
    let currentAmount = Number(formState.startRent) || 0

    for (let i = 0; i < numberOfBlocks; i++) {
      const from = i * blockSize + 1
      let to = (i + 1) * blockSize
      if (to > totalMonths) to = totalMonths
      const percent = i === 0 ? 0 : 5 
      
      if (i > 0) {
        const prevAmount = newRows[i-1].amount
        currentAmount = prevAmount + (prevAmount * percent) / 100
      }

      newRows.push({ id: i, from, to, percent, amount: currentAmount })
    }
    setRentRows(newRows)
  }, [formState.duration, formState.startRent])

  const handleRowChange = (index: number, field: keyof RentRow, value: number) => {
    const updatedRows = [...rentRows]
    updatedRows[index] = { ...updatedRows[index], [field]: value }

    if (field === 'percent' || field === 'amount') {
      for (let i = index; i < updatedRows.length; i++) {
         if (i === 0) continue;
         const prevAmount = updatedRows[i-1].amount
         const currentPercent = updatedRows[i].percent
         updatedRows[i].amount = prevAmount + (prevAmount * currentPercent / 100)
      }
    }
    setRentRows(updatedRows)
  }

  const totals = useMemo(() => {
    const { duration, deposit, rentType, startRent, outOfPune, outOfMaharashtra, includePoliceIntimation, puneVisit } = formState
    
    let totalRentReceived = 0
    if (rentType === 'fixed') {
      totalRentReceived = (Number(startRent) || 0) * (Number(duration) || 0)
    } else {
      rentRows.forEach(row => {
        const monthsInRow = (row.to - row.from) + 1
        totalRentReceived += row.amount * monthsInRow
      })
    }

    const years = (Number(duration) || 0) / 12
    const refundableDepositInterest = (Number(deposit) || 0) * 0.10 * years
    const taxableAmount = totalRentReceived + refundableDepositInterest
    let stampDuty = Math.round(taxableAmount * 0.0025)
    
    if (!duration || (!startRent && rentType === 'fixed')) stampDuty = 0

    let serviceCharges = PRICING.serviceBase
    let extraCharges = 0
    
    let policeIntimationCost = 0
    if (includePoliceIntimation) policeIntimationCost = PRICING.policeIntimationFixed

    // --- ADD-ONS CALCULATION ---
    if (outOfPune) extraCharges += PRICING.outOfPuneCost
    if (outOfMaharashtra) extraCharges += PRICING.outOfMaharashtraCost
    if (puneVisit) extraCharges += PRICING.puneVisitCost // Add Pune Visit cost

    const totalAmount = 
      stampDuty + 
      PRICING.registrationFee + 
      policeIntimationCost +
      PRICING.dhcFee + 
      serviceCharges + 
      extraCharges

    return {
      stampDuty,
      registrationFee: PRICING.registrationFee,
      policeIntimation: policeIntimationCost,
      dhcFee: PRICING.dhcFee,
      serviceCharges,
      extraCharges,
      totalAmount
    }
  }, [formState, rentRows, PRICING])

  const handleInputChange = (field: keyof CalculatorState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  /* ---------------- SHARE HELPERS ---------------- */
  
  const generateShareText = () => {
    const date = new Date().toLocaleDateString()
    let rentDetails = ""
    
    if (formState.rentType === 'fixed') {
        rentDetails = `Monthly Rent: ₹ ${formState.startRent}`
    } else {
        rentDetails = "Varying Rent Structure:"
        rentRows.forEach(row => {
            rentDetails += `\n   • Month ${row.from}-${row.to}: ₹ ${Math.round(row.amount)}`
        })
    }

    const policeLine = formState.includePoliceIntimation 
      ? `• Police Verification: ₹ ${PRICING.policeIntimationFixed}\n` 
      : ''

    const outPuneLine = formState.outOfPune ? `• Outside Pune: ₹ ${PRICING.outOfPuneCost}\n` : ''
    const outMhLine = formState.outOfMaharashtra ? `• Outside MH: ₹ ${PRICING.outOfMaharashtraCost}\n` : ''
    // Share line for Pune Visit
    const puneVisitLine = formState.puneVisit ? `• Pune Visiting Charges: ₹ ${PRICING.puneVisitCost}\n` : ''

    return `*Vedant Enterprise*\nDate: ${date}\n\n• Type: ${formState.propertyType}\n• Duration: ${formState.duration} Months\n• Deposit: ₹ ${formState.deposit}\n\n*RENT*\n${rentDetails}\n\n*BREAKDOWN*\n• Stamp Duty: ₹ ${totals.stampDuty}\n• Registration: ₹ ${totals.registrationFee}\n${policeLine}• DHC Fee: ₹ ${totals.dhcFee}\n• Service Charges: ₹ ${totals.serviceCharges}\n${outPuneLine}${outMhLine}${puneVisitLine}\n*GRAND TOTAL: ₹ ${totals.totalAmount}*\n_`
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText())
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleCopyToClipboard = () => {
    const text = generateShareText()

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        })
        .catch(() => {
          fallbackCopyTextToClipboard(text)
        })
    } else {
      fallbackCopyTextToClipboard(text)
    }
  }

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    
    textArea.style.position = "fixed"
    textArea.style.left = "-9999px"
    textArea.style.top = "0"
    document.body.appendChild(textArea)
    
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } else {
        alert("Copy failed. Please manually select the text.")
      }
    } catch (err) {
      console.error('Fallback copy failed', err)
    }

    document.body.removeChild(textArea)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vedant Enterprises Quote',
          text: generateShareText(),
        })
      } catch (err) {
        console.log('Error sharing', err)
      }
    } else {
      handleCopyToClipboard() 
      alert("System sharing not supported on this device. Copied to clipboard instead.")
    }
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div
      className="min-h-screen text-gray-900 font-sans selection:bg-orange-200"
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
      {/* NAVBAR */}
      <nav className="border-b-2 border-white/60 bg-white/70 backdrop-blur-xl sticky top-0 z-20 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              {/* BACK BUTTON */}
              <a 
                href="/" 
               className="p-2 rounded-xl bg-white/50 hover:bg-white border-2 border-transparent hover:border-orange-500 text-gray-500 hover:text-orange-600 transition-all shadow-sm hover:shadow-md active:scale-95 group/back"
                aria-label="Back to Homepage"
              >
                <ArrowLeft size={20} className="group-hover/back:-translate-x-1 transition-transform duration-300" />
              </a>

              {/* LOGO & TITLE */}
              <div className="flex items-center gap-2 group cursor-default">
                 <div className="text-orange-500 text-3xl font-bold leading-none select-none drop-shadow-sm">¬</div>
                 <div className="text-xl font-bold tracking-tight text-gray-900">
                   Vedant Enterprises
                 </div>
              </div>
           </div>
           
           <div className="hidden md:flex text-sm text-gray-700 font-bold bg-white/80 px-4 py-2 rounded-full border-2 border-gray-300 shadow-sm items-center gap-2">
              <Calculator size={14} className="text-orange-600" />
              <span>Instant Quote Engine</span>
           </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Agreement Details Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/80 ring-1 ring-gray-900/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-sm"></div>
                    <h2 className="text-xl font-bold text-gray-900">Agreement Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <SectionLabel>Property Type</SectionLabel>
                        <div className="flex gap-2">
                            <SelectionCardCompact 
                                label="Residential" 
                                selected={formState.propertyType === 'residential'} 
                                onClick={() => handleInputChange('propertyType', 'residential')}
                            />
                            <SelectionCardCompact 
                                label="Commercial" 
                                selected={formState.propertyType === 'non-residential'} 
                                onClick={() => handleInputChange('propertyType', 'non-residential')}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <SectionLabel>Duration (Months)</SectionLabel>
                        <input 
                            type="number" 
                            value={formState.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                            className="w-full bg-white/80 border-2 border-gray-300 hover:border-gray-400 focus:border-orange-500 rounded-xl p-3 text-gray-900 text-lg outline-none transition-all shadow-sm font-semibold"
                        />
                    </div>
                    <div className="space-y-2">
                        <SectionLabel>Refundable Deposit</SectionLabel>
                        <CurrencyInput 
                            value={formState.deposit} 
                            onChange={(v) => handleInputChange('deposit', v)} 
                        />
                    </div>
                </div>
            </div>

            {/* RENT SECTION */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/80 ring-1 ring-gray-900/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-sm"></div>
                        <h2 className="text-xl font-bold text-gray-900">Rent Structure</h2>
                    </div>
                    <div className="bg-gray-100/80 p-1.5 rounded-xl flex border-2 border-gray-300">
                        <TabButton 
                            label="Fixed" 
                            active={formState.rentType === 'fixed'} 
                            onClick={() => handleInputChange('rentType', 'fixed')} 
                        />
                        <TabButton 
                            label="Varying" 
                            active={formState.rentType === 'varying'} 
                            onClick={() => handleInputChange('rentType', 'varying')} 
                        />
                    </div>
                 </div>

                 {formState.rentType === 'fixed' ? (
                     <div className="space-y-2 max-w-sm">
                        <SectionLabel>Monthly Rent Amount</SectionLabel>
                        <CurrencyInput 
                           value={formState.startRent}
                           onChange={(v) => handleInputChange('startRent', v)}
                        />
                     </div>
                 ) : (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2 max-w-sm">
                            <SectionLabel>Base Rent (Month 1)</SectionLabel>
                            <CurrencyInput 
                                value={formState.startRent}
                                onChange={(v) => handleInputChange('startRent', v)}
                            />
                        </div>
                        <div className="rounded-xl border-2 border-gray-300 overflow-hidden bg-white/80 shadow-sm">
                           <div className="grid grid-cols-4 bg-gray-100 py-3 text-[11px] font-bold text-gray-600 text-center uppercase tracking-wider border-b-2 border-gray-300">
                              <div>From</div>
                              <div>To</div>
                              <div>%increment</div>
                              <div>Amount</div>
                           </div>
                           <div className="divide-y-2 divide-gray-100">
                              {rentRows.map((row, idx) => (
                                 <div key={row.id} className="grid grid-cols-4 text-sm relative group">
                                    <div className="p-3 flex items-center justify-center text-gray-700 font-medium border-r-2 border-gray-100">{row.from}</div>
                                    <div className="p-3 flex items-center justify-center text-gray-700 font-medium border-r-2 border-gray-100">{row.to}</div>
                                    <div className="p-1.5 border-r-2 border-gray-100">
                                       <div className="h-full flex items-center bg-gray-50 rounded-lg px-2 focus-within:ring-2 ring-orange-500/30 border border-transparent focus-within:border-orange-500 transition-all">
                                          <input 
                                             type="number"
                                             value={row.percent}
                                             onChange={(e) => handleRowChange(idx, 'percent', Number(e.target.value))}
                                             className="w-full bg-transparent text-center outline-none text-gray-900 font-bold text-sm"
                                          />
                                          <span className="text-gray-400 text-[10px] font-bold">%</span>
                                       </div>
                                     </div>
                                     <div className="p-1.5">
                                       <div className="h-full flex items-center bg-gray-50 rounded-lg px-2 focus-within:ring-2 ring-orange-500/30 border border-transparent focus-within:border-orange-500 transition-all">
                                          <span className="text-gray-400 text-[10px] mr-1 font-bold">₹</span>
                                          <input 
                                             type="number"
                                             value={Math.round(row.amount)}
                                             onChange={(e) => handleRowChange(idx, 'amount', Number(e.target.value))}
                                             className="w-full bg-transparent text-left outline-none text-gray-900 font-bold text-sm"
                                          />
                                       </div>
                                     </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                 )}
            </div>

            {/* Add-ons Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/80 ring-1 ring-gray-900/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-sm"></div>
                    <h2 className="text-xl font-bold text-gray-900">Add-ons</h2>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <ModernCheckbox 
                      label="Police Verification"
                      subtext={`+ ₹${PRICING.policeIntimationFixed}`}
                      checked={formState.includePoliceIntimation}
                      onChange={(v) => handleInputChange('includePoliceIntimation', v)}
                   />
                   <ModernCheckbox 
                      label="Outside Pune" 
                      subtext="+ ₹500"
                      checked={formState.outOfPune}
                      onChange={(v) => handleInputChange('outOfPune', v)}
                   />
                   <ModernCheckbox 
                      label="Outside Maharashtra"
                      subtext="+ ₹1000"
                      checked={formState.outOfMaharashtra}
                      onChange={(v) => handleInputChange('outOfMaharashtra', v)}
                   />
                   {/* NEW ADDON: PUNE VISIT */}
                   <ModernCheckbox 
                      label="Pune Visit"
                      subtext={`+ ₹${PRICING.puneVisitCost}`}
                      checked={formState.puneVisit}
                      onChange={(v) => handleInputChange('puneVisit', v)}
                      info="If more that 7-10km from hadapsar" // Tooltip text
                   />
                </div>
            </div>
          </div>

          {/* RIGHT PANEL: SUMMARY */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-[0_20px_50px_rgb(0,0,0,0.1)] p-6 md:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-orange-300"></div>

                    <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                       <span className="bg-orange-100 p-2.5 rounded-xl text-orange-600 border border-orange-200"><Calculator size={22} /></span>
                       Payment Estimate
                    </h3>

                    <div className="space-y-4">
                       <SummaryRow label="Stamp Duty" value={totals.stampDuty} />
                       <SummaryRow label="Registration Fee" value={totals.registrationFee} />
                       <SummaryRow label="DHC Fee" value={totals.dhcFee} hasInfo />
                       <SummaryRow label="Service Charges" value={totals.serviceCharges} />
                       
                       {(formState.outOfPune || formState.outOfMaharashtra || formState.includePoliceIntimation || formState.puneVisit) && (
                         <div className="pt-3 pb-3 border-t-2 border-dashed border-gray-200 space-y-3">
                           {formState.includePoliceIntimation && <SummaryRow label="Police Verification" value={PRICING.policeIntimationFixed} highlight />}
                           {formState.outOfPune && <SummaryRow label="Outside Pune" value={PRICING.outOfPuneCost} highlight />}
                           {formState.outOfMaharashtra && <SummaryRow label="Outside MH" value={PRICING.outOfMaharashtraCost} highlight />}
                           {/* Add Pune Visit to Summary */}
                           {formState.puneVisit && <SummaryRow label="Pune Visiting Charges" value={PRICING.puneVisitCost} highlight />}
                         </div>
                       )}
                    </div>

                    <div className="border-t-2 border-dashed border-gray-300 my-2"></div>

                    <div className="flex justify-between items-end">
                       <div className="text-gray-500 font-bold text-sm uppercase tracking-wide">Grand Total</div>
                       <div className="text-4xl font-black text-gray-900 tracking-tight">
                          <span className="text-orange-500 mr-1 text-2xl font-bold">₹</span>
                          {totals.totalAmount.toLocaleString()}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button 
                          onClick={() => setFormState(prev => ({ 
                            ...prev, 
                            duration: 0, 
                            deposit: 0, 
                            startRent: 0, 
                            outOfPune: false, 
                            outOfMaharashtra: false, 
                            includePoliceIntimation: false,
                            puneVisit: false // Reset
                          }))}
                          className="flex items-center justify-center gap-2 py-4 bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 text-gray-700 font-bold rounded-xl transition-all active:scale-[0.98]"
                        >
                          <RotateCcw size={18} />
                          Reset
                        </button>
                        <button 
                          onClick={() => setIsShareModalOpen(true)}
                          className="flex items-center justify-center gap-2 py-4 bg-orange-600 hover:bg-orange-500 border-2 border-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                        >
                          <Share2 size={18} />
                          Share
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- SHARE MODAL --- */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-3xl border-2 border-white/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
              
              <div className="p-5 border-b-2 border-gray-100 flex justify-between items-center bg-gray-50/80">
                 <h3 className="text-gray-900 font-bold text-lg">Share Quote</h3>
                 <button onClick={() => setIsShareModalOpen(false)} className="bg-gray-200/50 p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all">
                    <X size={20} />
                 </button>
              </div>

              <div className="p-6 space-y-4">
                 
                 {/* Option 1: WhatsApp */}
                 <button 
                   onClick={handleWhatsAppShare}
                   className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/5 border-2 border-[#25D366]/20 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 transition-all group"
                 >
                    <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm">
                       <MessageCircle size={24} fill="white" className="border-none" />
                    </div>
                    <div className="text-left">
                       <div className="text-gray-900 font-bold text-lg">WhatsApp</div>
                       <div className="text-xs text-gray-600 font-medium">Share directly to chat</div>
                    </div>
                 </button>

                 {/* Option 2: Copy */}
                 <button 
                    onClick={handleCopyToClipboard}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 hover:bg-blue-100/50 hover:border-blue-300 transition-all group"
                 >
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                       {copySuccess ? <Check size={24} /> : <Copy size={24} />}
                    </div>
                    <div className="text-left">
                       <div className="text-gray-900 font-bold text-lg">{copySuccess ? "Copied!" : "Copy Details"}</div>
                       <div className="text-xs text-gray-600 font-medium">Copy text to clipboard</div>
                    </div>
                 </button>

                 {/* Option 3: Native Share (System) */}
                 <button 
                    onClick={handleNativeShare}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all group"
                 >
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white shrink-0 shadow-sm">
                       <Smartphone size={24} />
                    </div>
                    <div className="text-left">
                       <div className="text-gray-900 font-bold text-lg">Other Apps</div>
                       <div className="text-xs text-gray-600 font-medium">SMS, Email, Telegram, etc.</div>
                    </div>
                 </button>

              </div>
           </div>
        </div>
      )}

    </div>
  )
}


/* --- PRESENTATIONAL COMPONENTS --- */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2 ml-1">
    {children}
  </label>
)

const SelectionCardCompact = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
  <div onClick={onClick} className={`flex-1 cursor-pointer rounded-xl border-2 px-3 py-3.5 flex items-center justify-center gap-2 transition-all duration-200 ${selected ? 'bg-orange-50 border-orange-500 text-orange-900 shadow-md ring-1 ring-orange-200' : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 shadow-sm'}`}>
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
       {selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
    </div>
    <span className="font-bold text-sm">{label}</span>
  </div>
)

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${active ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800'}`}>
    {label}
  </button>
)

const CurrencyInput = ({ value, onChange }: { value: number | string, onChange: (v: string) => void }) => (
  <div className="flex items-center w-full bg-white/80 border-2 border-gray-300 rounded-xl overflow-hidden transition-all focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 shadow-sm hover:border-gray-400">
    <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300">
      <span className="text-gray-500 font-extrabold text-sm">₹</span>
    </div>
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full bg-transparent border-none py-3 px-4 text-gray-900 font-mono text-lg font-bold outline-none placeholder:text-gray-400"
    />
  </div>
)

/* UPDATED ModernCheckbox to support Info Icon Tooltip */
const ModernCheckbox = ({ label, subtext, checked, onChange, info }: { label: string, subtext?: string, checked: boolean, onChange: (v: boolean) => void, info?: string }) => (
  <div onClick={() => onChange(!checked)} className={`cursor-pointer flex items-center justify-between p-3.5 rounded-xl border-2 transition-all select-none shadow-sm ${checked ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}>
    <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
            <span className={`font-bold text-sm ${checked ? 'text-orange-900' : 'text-gray-700'}`}>{label}</span>
            {info && (
                <div className="relative group/info flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    {/* The Info Icon */}
                    <Info size={13} className="text-gray-400 hover:text-orange-500 transition-colors" />
                    
                    {/* The Tooltip (Custom styling for the new button) */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-tight">
                       {info}
                       <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
        {subtext && <span className="text-[11px] text-orange-600 font-bold font-mono">{subtext}</span>}
    </div>
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-gray-50'}`}>{checked && <Check size={14} className="text-white" />}</div>
  </div>
)

const SummaryRow = ({ label, value, hasInfo, highlight }: { label: string, value: number, hasInfo?: boolean, highlight?: boolean }) => (
  <div className="flex justify-between items-center group text-sm">
    <div className="flex items-center gap-2">
      <span className={highlight ? "text-orange-700 font-bold" : "text-gray-600 font-medium group-hover:text-gray-900 transition-colors"}>
        {label}
      </span>
      
      {hasInfo && (
        <div className="relative group/info flex items-center cursor-pointer">
           <Info size={14} className="text-gray-400 hover:text-orange-500 transition-colors" />
           {/* Custom Tooltip */}
           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50">
              Document Handling Charges
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
           </div>
        </div>
      )}
      
    </div>
    <div className={`font-mono font-bold ${highlight ? 'text-orange-600' : 'text-gray-800'}`}>₹ {value.toLocaleString()}</div>
  </div>
)

export default PriceCalculator