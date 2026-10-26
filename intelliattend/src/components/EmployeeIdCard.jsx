import { useState, useRef } from 'react';
import { Download, Printer, RotateCw, QrCode, User } from 'lucide-react';

export default function EmployeeIdCard({
  employee = {
    name: 'BARIKI RAHUL',
    designation: 'INTERN – SOFTWARE DEVELOPMENT ENGINEER – INFORMATION TECHNOLOGY',
    employeeId: 'SI0121',
    email: 'bariki@shnoor.com',
    phone: '6281769923',
    emergencyPhone: '8374273126',
    doj: '05-10-2026',
    bloodGroup: 'O+',
    avatar: '/avatar_rahul.png',
    company: 'SHNOOR INTERNATIONAL',
  },
  showActions = true,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const cardRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official ID Card - ${employee.name || 'Employee'}</title>
          <meta charset="utf-8" />
          <style>
            body {
              margin: 0;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f1f5f9;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body { background: transparent; padding: 0; }
              @page { size: auto; margin: 10mm; }
            }
          </style>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
        </head>
        <body>
          <div style="display: flex; justify-content: center;">
            ${cardEl.outerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Format designation into lines if it has separators
  const formatDesignation = (desig = '') => {
    if (!desig) return ['SOFTWARE ENGINEER'];
    const normalized = desig.replace(/ - /g, ' – ');
    if (normalized.includes(' – ') && normalized.length > 30) {
      const parts = normalized.split(' – ');
      if (parts.length >= 3) {
        return [
          `${parts[0]} – ${parts[1]}`,
          parts.slice(2).join(' – '),
        ];
      } else if (parts.length === 2) {
        return [parts[0], parts[1]];
      }
    }
    return [normalized];
  };

  const designationLines = formatDesignation(employee.designation);

  return (
    <div className="flex flex-col items-center">
      {/* Action buttons if enabled */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer shadow-2xs"
            title="Flip to view back side"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            <span>{isFlipped ? 'Show Front' : 'Flip to Back'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            title="Download or save official ID card"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ID Card</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer shadow-2xs"
            title="Print ID Card"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      )}

      {/* The Physical ID Card Container - 390px x 620px matching 648x1024 CR80 vertical badge */}
      <div
        ref={cardRef}
        className="w-[360px] sm:w-[390px] min-h-[615px] bg-white rounded-[36px] border border-slate-200 shadow-2xl overflow-hidden relative select-none flex flex-col justify-between transition-all duration-300"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        }}
      >
        {!isFlipped ? (
          /* FRONT OF CARD matching User's exact reference */
          <div className="flex flex-col h-full justify-between relative bg-white">
            {/* Top Amber Wave Header & Circular Photo */}
            <div className="relative">
              {/* Rich Warm Caramel Amber Header */}
              <div
                className="h-44 w-full relative overflow-hidden"
                style={{ backgroundColor: '#cb6b03' }}
              >
                {/* Flowing Organic Wave at bottom */}
                <svg
                  className="absolute bottom-0 left-0 right-0 w-full"
                  viewBox="0 0 400 65"
                  preserveAspectRatio="none"
                  fill="#ffffff"
                >
                  <path d="M 0,26 C 70,48 140,12 210,26 C 280,40 340,16 400,24 L 400,65 L 0,65 Z" />
                </svg>
              </div>

              {/* Centered Circular Portrait overlapping the wave */}
              <div className="absolute left-1/2 -bottom-20 -translate-x-1/2 z-20">
                <div
                  className="w-44 h-44 rounded-full p-[4px] shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: '#cb6b03' }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-[4px] border-white bg-[#8ec5fc] flex items-center justify-center">
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-20 h-20 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Name, Role Pill, Aligned Key-Value Table, Watermark */}
            <div className="pt-24 px-6 pb-4 flex flex-col items-center text-center relative flex-1">
              {/* Authentic Watermark in Background */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 mt-20">
                {/* Circular Emblem with translucent amber & blue arcs */}
                <div className="w-28 h-28 opacity-15 mb-1 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                    {/* Amber top-left arc */}
                    <path
                      d="M 50 10 A 40 40 0 0 1 90 50"
                      stroke="#cb6b03"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    {/* Blue bottom-right arc */}
                    <path
                      d="M 50 90 A 40 40 0 0 1 10 50"
                      stroke="#3b82f6"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    {/* Central node dots */}
                    <circle cx="50" cy="50" r="12" fill="#cb6b03" opacity="0.6" />
                  </svg>
                </div>
                {/* SHNOOR */}
                <span
                  className="font-extrabold text-[28px] tracking-[0.14em] text-slate-400 opacity-20 uppercase font-sans select-none leading-none"
                >
                  SHNOOR
                </span>
                {/* INTERNATIONAL */}
                <span
                  className="font-bold text-[10px] tracking-[0.35em] text-slate-400 opacity-20 uppercase font-sans select-none mt-1"
                >
                  INTERNATIONAL
                </span>
              </div>

              {/* Employee Full Name */}
              <h2 className="font-extrabold text-[24px] sm:text-[26px] tracking-wide text-[#0f172a] uppercase leading-tight font-sans relative z-10">
                {employee.name || 'BARIKI RAHUL'}
              </h2>

              {/* Designation Pill */}
              <div className="mt-3.5 mb-6 w-full max-w-[340px] relative z-10">
                <div
                  className="text-white font-extrabold text-[11px] sm:text-[11.5px] px-5 py-2.5 rounded-full uppercase tracking-wider leading-snug shadow-xs text-center"
                  style={{ backgroundColor: '#cb6b03' }}
                >
                  {designationLines.map((line, idx) => (
                    <div key={idx} className={idx > 0 ? 'mt-0.5' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Details List (Strictly Aligned Key : Value) */}
              <div className="w-full max-w-[310px] space-y-2.5 text-xs text-left relative z-10">
                {/* ID NO */}
                <div className="flex items-center">
                  <span className="w-24 font-bold tracking-wider text-slate-500 text-[11px]">ID NO</span>
                  <span className="font-bold text-slate-400 mr-2.5">:</span>
                  <span className="font-extrabold text-[#0f172a] tracking-wide text-sm font-sans">
                    {employee.employeeId || 'SI0121'}
                  </span>
                </div>

                {/* E-MAIL */}
                <div className="flex items-center">
                  <span className="w-24 font-bold tracking-wider text-slate-500 text-[11px]">E-MAIL</span>
                  <span className="font-bold text-slate-400 mr-2.5">:</span>
                  <span className="font-extrabold text-[#0f172a] tracking-normal text-xs font-sans truncate">
                    {employee.email || 'bariki@shnoor.com'}
                  </span>
                </div>

                {/* PHONE */}
                <div className="flex items-center">
                  <span className="w-24 font-bold tracking-wider text-slate-500 text-[11px]">PHONE</span>
                  <span className="font-bold text-slate-400 mr-2.5">:</span>
                  <span className="font-extrabold text-[#0f172a] tracking-wide text-xs sm:text-[13px] font-sans">
                    {employee.phone || '6281769923'}
                  </span>
                </div>

                {/* EMG.NO. */}
                <div className="flex items-center">
                  <span className="w-24 font-bold tracking-wider text-slate-500 text-[11px]">EMG.NO.</span>
                  <span className="font-bold text-slate-400 mr-2.5">:</span>
                  <span className="font-extrabold text-[#0f172a] tracking-wide text-xs sm:text-[13px] font-sans">
                    {employee.emergencyPhone || '8374273126'}
                  </span>
                </div>

                {/* DOJ */}
                <div className="flex items-center">
                  <span className="w-24 font-bold tracking-wider text-slate-500 text-[11px]">DOJ</span>
                  <span className="font-bold text-slate-400 mr-2.5">:</span>
                  <span className="font-extrabold text-[#0f172a] tracking-wide text-xs sm:text-[13px] font-sans">
                    {employee.doj || '05-10-2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Barcode on Left, Signature on Right */}
            <div className="border-t border-slate-200/90 px-6 py-4 flex items-end justify-between bg-white relative z-10">
              {/* Left: Barcode & ID text */}
              <div className="flex flex-col items-center">
                <svg className="w-28 h-9 text-slate-900" viewBox="0 0 140 40" fill="currentColor">
                  {/* Crisp Code-128 barcode bars */}
                  <rect x="0" y="0" width="3.5" height="40" />
                  <rect x="6" y="0" width="2" height="40" />
                  <rect x="11" y="0" width="5.5" height="40" />
                  <rect x="19" y="0" width="2" height="40" />
                  <rect x="24" y="0" width="4.5" height="40" />
                  <rect x="31" y="0" width="2" height="40" />
                  <rect x="36" y="0" width="6.5" height="40" />
                  <rect x="46" y="0" width="3" height="40" />
                  <rect x="52" y="0" width="2" height="40" />
                  <rect x="57" y="0" width="5.5" height="40" />
                  <rect x="65" y="0" width="2" height="40" />
                  <rect x="70" y="0" width="4.5" height="40" />
                  <rect x="77" y="0" width="3" height="40" />
                  <rect x="83" y="0" width="5" height="40" />
                  <rect x="91" y="0" width="2" height="40" />
                  <rect x="96" y="0" width="4.5" height="40" />
                  <rect x="103" y="0" width="3" height="40" />
                  <rect x="109" y="0" width="5.5" height="40" />
                  <rect x="117" y="0" width="2" height="40" />
                  <rect x="122" y="0" width="4" height="40" />
                  <rect x="129" y="0" width="2" height="40" />
                  <rect x="134" y="0" width="4.5" height="40" />
                </svg>
                <span className="font-mono font-extrabold text-[11px] tracking-[0.2em] text-[#0f172a] mt-1.5">
                  {employee.employeeId || 'SI0121'}
                </span>
              </div>

              {/* Right: Signature & AUTH. SIGN. */}
              <div className="flex flex-col items-center">
                {!signatureError ? (
                  <img
                    src="/signature_auth.png"
                    alt="Authorized Signature"
                    className="h-9 w-auto max-w-[125px] object-contain"
                    onError={() => setSignatureError(true)}
                  />
                ) : (
                  <svg className="w-28 h-9 text-slate-800" viewBox="0 0 140 40" fill="none" stroke="currentColor">
                    <path
                      d="M10 28 C30 5, 25 38, 45 15 C55 2, 50 35, 70 20 C85 10, 95 32, 110 18 C120 12, 130 25, 138 22"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <span className="font-sans font-extrabold text-[10px] tracking-[0.16em] text-[#0f172a] mt-1 uppercase">
                  AUTH. SIGN.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* BACK OF CARD */
          <div className="p-7 flex flex-col justify-between h-full space-y-6 bg-white">
            {/* Back Header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
                <span className="font-display font-bold text-sm text-[#0f172a] tracking-tight uppercase">
                  {employee.company || 'SHNOOR INTERNATIONAL LLC'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Authorized Personnel Identity Credential
              </p>
            </div>

            {/* Terms & Emergency Details */}
            <div className="space-y-3.5 text-xs text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="font-bold text-slate-500">Blood Group</span>
                <span className="font-extrabold text-rose-600 font-mono text-sm">
                  {employee.bloodGroup || 'O+'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="font-bold text-slate-500">Card Validity</span>
                <span className="font-bold text-slate-800">Permanent / Full-Time</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="font-bold text-slate-500">Issuing Authority</span>
                <span className="font-bold text-slate-800">People & HR Operations</span>
              </div>
              <div className="pt-1">
                <p className="font-bold text-slate-700 text-[11px] mb-1">Company Registered Office:</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Cyber Towers, Suite 402, Hitec City, Madhapur, Hyderabad, Telangana 500081, India.
                </p>
              </div>
            </div>

            {/* Return Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10px] text-amber-900 text-center leading-relaxed">
              <strong>Notice:</strong> This identity card is property of {employee.company || 'IntelliAttend LLC'}. If found, please return to the nearest company facility or mail to hr@shnoor.com.
            </div>

            {/* Back Footer with QR Code */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-left text-[10px] text-slate-400">
                <p className="font-bold text-slate-700 font-sans">Verification QR</p>
                <p>Scan to verify employee status</p>
              </div>
              <div className="p-1 rounded-lg border border-slate-200 bg-white shadow-2xs">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
