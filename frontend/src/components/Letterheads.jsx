import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Eraser,
  FileText,
  Globe,
  Highlighter,
  Info,
  Mail,
  MapPin,
  Pause,
  Phone,
  PhoneCall,
  Play,
  Share2,
  SkipBack,
  Trash2,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";

/* ---------- Shared body block ---------- */
function LetterBody({ letterhead, className = "" }) {
  return (
    <div className={`space-y-2.5 text-[13px] sm:text-sm leading-relaxed text-zinc-900 ${className}`}>
      {letterhead.subject ? (
        <p className="font-semibold">Subject: {letterhead.subject}</p>
      ) : null}
      {letterhead.greeting ? <p>{letterhead.greeting}</p> : null}
      {(letterhead.body || []).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {letterhead.details && letterhead.details.length ? (
        <div>
          {letterhead.details_label ? (
            <p className="mb-0.5">{letterhead.details_label}</p>
          ) : null}
          <ul className="list-disc pl-5 space-y-0.5">
            {letterhead.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {(letterhead.body_after || []).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {(letterhead.sections || []).map((s, i) => (
        <div key={`s${i}`} className="space-y-1.5">
          {s.heading ? <p className="font-semibold pt-1">{s.heading}</p> : null}
          {(s.paragraphs || []).map((p, j) => (
            <p key={`p${j}`}>{p}</p>
          ))}
          {s.bullets && s.bullets.length ? (
            <ul className="list-disc pl-5 space-y-0.5">
              {s.bullets.map((b, j) => (
                <li key={`b${j}`}>{b}</li>
              ))}
            </ul>
          ) : null}
          {(s.paragraphs_after || []).map((p, j) => (
            <p key={`pa${j}`}>{p}</p>
          ))}
        </div>
      ))}
      {letterhead.signoff && letterhead.signoff.length ? (
        <div className="pt-1 space-y-1">
          {letterhead.signoff.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ToBlock({ letterhead, withLabel = true }) {
  return (
    <div className="text-zinc-900 leading-relaxed text-sm sm:text-base">
      {withLabel ? (
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-0.5">
          To:
        </div>
      ) : null}
      {(letterhead.recipient_lines || []).map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
}

/* ---------- Variant: Orion (Letter 1) — kept for backward compat ---------- */
function OrionLogo({ size = 64 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden>
      <path d="M6 40 Q 4 64 26 66 Q 34 67 40 64 L 40 58 Q 28 58 22 52 Q 14 44 14 36 Q 8 36 6 40 Z" fill="#3B82F6" />
      <path d="M74 40 Q 76 64 54 66 Q 46 67 40 64 L 40 58 Q 52 58 58 52 Q 66 44 66 36 Q 72 36 74 40 Z" fill="#3B82F6" />
      <rect x="34" y="6" width="12" height="34" rx="2" fill="#F97316" />
      <rect x="23" y="17" width="34" height="12" rx="2" fill="#F97316" />
    </svg>
  );
}

function OrionLetterhead({ letterhead }) {
  const accent = letterhead.accent_color || "#F97316";
  return (
    <div className="rounded-xl bg-white p-5 sm:p-6 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `1.5px solid ${accent}80` }}>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-4">
          <OrionLogo />
          <div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-zinc-900 leading-tight">{letterhead.clinic_name}</div>
            {letterhead.tagline ? <div className="mt-1.5 text-zinc-700 text-base sm:text-lg">{letterhead.tagline}</div> : null}
          </div>
        </div>
        <div className="text-right text-zinc-700 text-sm leading-relaxed">
          {(letterhead.address_lines || []).map((l, i) => <div key={i}>{l}</div>)}
          {letterhead.phone ? <div>Tel: {letterhead.phone}</div> : null}
          {letterhead.website ? (
            <div className="mt-3 inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white"><Globe className="w-3 h-3" /></span>
              <span>{letterhead.website}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-10 flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mt-1">To</span>
          <ToBlock letterhead={letterhead} withLabel={false} />
        </div>
        {letterhead.date ? <div className="text-zinc-900 text-sm">Date: <span className="font-bold">{letterhead.date}</span></div> : null}
      </div>
      <div className="mt-10"><LetterBody letterhead={letterhead} /></div>
      <div className="absolute bottom-6 left-6 w-32 h-20 opacity-50 pointer-events-none" style={{ backgroundImage: "radial-gradient(#D4D4D8 1.5px, transparent 1.5px)", backgroundSize: "11px 11px" }} aria-hidden />
    </div>
  );
}

/* ---------- Letter 2: Maple St Health Centre ---------- */
function MapleSnowflake({ size = 70 }) {
  // 8-pointed snowflake with diamonds at tips, in dark teal-blue
  const c = "#2C5F7C";
  const tips = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const x1 = 40 + Math.cos(a) * 8;
    const y1 = 40 + Math.sin(a) * 8;
    const x2 = 40 + Math.cos(a) * 30;
    const y2 = 40 + Math.sin(a) * 30;
    tips.push(
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3" strokeLinecap="round" />
        <rect x={x2 - 3} y={y2 - 3} width="6" height="6" transform={`rotate(${(a * 180) / Math.PI + 45} ${x2} ${y2})`} fill={c} />
      </g>
    );
  }
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden>
      <circle cx="40" cy="40" r="6" fill={c} />
      {tips}
    </svg>
  );
}

function CitySkyline({ color = "#CBD5E1" }) {
  return (
    <svg viewBox="0 0 800 100" className="w-full h-20 pointer-events-none" preserveAspectRatio="none" aria-hidden>
      <path d={"M0,100 L0,70 L40,70 L40,55 L70,55 L70,40 L90,40 L90,30 L110,30 L110,55 L150,55 L150,45 L180,45 L180,60 L220,60 L220,30 L250,30 L250,50 L290,50 L290,40 L320,40 L320,25 L345,25 L345,55 L380,55 L380,40 L420,40 L420,55 L460,55 L460,45 L490,45 L490,30 L520,30 L520,55 L560,55 L560,40 L600,40 L600,55 L640,55 L640,30 L680,30 L680,50 L720,50 L720,40 L760,40 L760,60 L800,60 L800,100 Z"} fill={color} opacity="0.55" />
    </svg>
  );
}

function MapleLetterhead({ letterhead }) {
  const c = "#2C5F7C";
  return (
    <div className="rounded-xl bg-[#fbfbfb] p-5 sm:p-7 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <MapleSnowflake />
          <div className="font-display font-extrabold leading-[1.05] text-zinc-900" style={{ fontSize: "30px" }}>
            <div>Maple St</div>
            <div>Health Centre</div>
          </div>
        </div>
        <div className="text-right text-sm leading-relaxed text-zinc-800">
          <div className="font-display font-bold uppercase tracking-wide">MAPLE STREET HEALTH CENTRE</div>
          <div>Maple Street Health Centre</div>
          {(letterhead.address_lines || []).map((l, i) => <div key={i}>{l}</div>)}
          {letterhead.phone ? <div>Tel: {letterhead.phone}</div> : null}
        </div>
      </div>

      {/* Recipient + date */}
      <div className="mt-8 flex items-start justify-between gap-6 flex-wrap">
        <ToBlock letterhead={letterhead} />
        <div className="text-right text-sm">
          {letterhead.date ? <div>Date: <span className="font-semibold">{letterhead.date}</span></div> : null}
          <div className="mt-1 text-zinc-700">Ref: MS/NU/1189</div>
        </div>
      </div>

      <div className="mt-8 relative z-10"><LetterBody letterhead={letterhead} /></div>
      <div className="absolute left-0 right-0 bottom-0 pointer-events-none"><CitySkyline color="#94A3B8" /></div>
    </div>
  );
}

/* ---------- Letter 3: Westside Dental Practice ---------- */
function ToothIcon({ size = 60 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden>
      <circle cx="40" cy="40" r="38" fill="#7DD3FC" />
      <path d="M40 18 C 28 18 22 26 22 36 C 22 46 26 52 28 60 C 30 66 32 64 34 60 C 36 56 36 50 40 50 C 44 50 44 56 46 60 C 48 64 50 66 52 60 C 54 52 58 46 58 36 C 58 26 52 18 40 18 Z" fill="#1E3A8A" />
    </svg>
  );
}

function WestsideLetterhead({ letterhead }) {
  const c = "#2563EB";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      {/* Top-left blue ribbon banner */}
      <div className="relative pt-8 pb-6 px-7 sm:px-10">
        <div className="absolute top-0 left-0 h-24 w-2/3 pointer-events-none" style={{
          clipPath: "polygon(0 0, 95% 0, 100% 60%, 90% 100%, 0 100%)",
          background: "linear-gradient(90deg,#DBEAFE 0%,#3B82F6 100%)",
          opacity: 0.85,
        }} aria-hidden />
        <div className="absolute top-3 right-3 grid grid-cols-4 gap-1.5" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="block w-1 h-1 rounded-full bg-zinc-400" />
          ))}
        </div>
        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="font-display font-extrabold tracking-tight text-zinc-900 max-w-[70%]" style={{ fontSize: "32px", lineHeight: 1.05 }}>
            Westside Dental Practice
          </div>
          <ToothIcon />
        </div>
      </div>

      <div className="px-7 sm:px-10 pb-10 relative flex-1">
        {/* Recipient + date */}
        <div className="mt-2 flex items-start justify-between gap-6 flex-wrap">
          <ToBlock letterhead={letterhead} />
          {letterhead.date ? (
            <div className="text-right text-sm text-zinc-800">Date: <span className="font-semibold">{letterhead.date}</span></div>
          ) : null}
        </div>

        <div className="mt-6"><LetterBody letterhead={letterhead} /></div>

        {/* contact block bottom-right */}
        <div className="mt-10 flex items-end justify-between gap-6 flex-wrap relative z-10">
          <div className="text-sm text-zinc-700">
            <div className="font-display font-bold text-zinc-900">Appointment Coordinator</div>
            <div>Westside Dental Practice</div>
          </div>
          <div className="text-right text-sm text-zinc-800 leading-relaxed">
            <div className="font-display font-bold">Westside Dental Practice</div>
            {(letterhead.address_lines || []).map((l, i) => <div key={i}>{l}</div>)}
            {letterhead.phone ? <div>Tel: {letterhead.phone}</div> : null}
          </div>
        </div>

        {/* bottom-right triangle */}
        <div className="absolute bottom-0 right-0 w-44 h-32 pointer-events-none" style={{
          clipPath: "polygon(40% 100%, 100% 0, 100% 100%)",
          background: "linear-gradient(135deg,#3B82F6 0%,#DBEAFE 100%)",
          opacity: 0.9,
        }} aria-hidden />
        {/* bottom-left dots */}
        <div className="absolute bottom-3 left-3 grid grid-cols-4 gap-1.5" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="block w-1 h-1 rounded-full bg-zinc-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Letter 4: Clearview Opticians ---------- */
function ClearviewLogo({ size = 90 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <polygon points="50,5 92,28 92,72 50,95 8,72 8,28" fill="#FFFFFF" stroke="#F97316" strokeWidth="5" />
      {/* small shop with awning */}
      <rect x="32" y="50" width="36" height="26" fill="#94A3B8" />
      <rect x="44" y="58" width="12" height="18" fill="#3B82F6" />
      <rect x="32" y="44" width="36" height="8" fill="#94A3B8" />
      <circle cx="38" cy="40" r="4" fill="#3B82F6" />
      <circle cx="50" cy="40" r="4" fill="#3B82F6" />
      <circle cx="62" cy="40" r="4" fill="#3B82F6" />
    </svg>
  );
}

function ClearviewLetterhead({ letterhead }) {
  const c = "#F97316";
  const peach = "#FED7AA";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      {/* Top peach band */}
      <div className="relative" style={{ background: peach, paddingTop: "26px", paddingBottom: "20px" }}>
        <div className="px-7 sm:px-10 flex items-center gap-5">
          <ClearviewLogo />
          <div className="font-display font-extrabold tracking-tight" style={{ color: c, fontSize: "36px", letterSpacing: "0.02em" }}>
            CLEARVIEW OPTICIANS
          </div>
        </div>
      </div>

      {/* Contact strip */}
      <div className="bg-white border-b border-zinc-100 px-7 sm:px-10 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-800">
        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-700" />{letterhead.phone}</div>
        <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-700" />hello@clearview.com</div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-zinc-700 mt-0.5" />
          <div>{(letterhead.address_lines || []).join(", ")}</div>
        </div>
        {letterhead.website ? (
          <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-zinc-700" />{letterhead.website}</div>
        ) : null}
      </div>

      <div className="px-7 sm:px-10 pt-7 pb-2 flex-1">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <ToBlock letterhead={letterhead} />
          <div className="text-right text-sm text-zinc-800">
            {letterhead.date ? <div>Date: <span className="font-semibold">{letterhead.date}</span></div> : null}
            <div className="mt-1 text-zinc-700">Ref: GH/CHK/3120</div>
          </div>
        </div>

        <div className="mt-6"><LetterBody letterhead={letterhead} /></div>
      </div>

      {/* Bottom peach band */}
      <div className="mt-auto h-16" style={{ background: peach }} aria-hidden />
    </div>
  );
}

/* ---------- Letter 5: Meadow Physiotherapy Clinic ---------- */
function MeadowLogo({ size = 56 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden>
      <circle cx="40" cy="40" r="32" fill="none" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M40 16 L 56 40 L 44 40 L 44 60 L 36 60 L 36 40 L 24 40 Z" fill="#FFFFFF" transform="rotate(135 40 40)" />
    </svg>
  );
}

function MeadowSquares({ color = "#10B981" }) {
  // scattered squares
  const sq = [];
  const positions = [
    [10, 50, 14, 0.5], [30, 40, 12, 0.7], [50, 60, 16, 0.4], [70, 30, 18, 0.6],
    [90, 70, 14, 0.5], [25, 75, 10, 0.7], [55, 25, 12, 0.6], [80, 80, 14, 0.5],
    [110, 50, 16, 0.4], [40, 90, 12, 0.6],
  ];
  positions.forEach(([x, y, s, o], i) => sq.push(
    <rect key={i} x={x} y={y} width={s} height={s} fill="none" stroke={color} strokeWidth="1.5" opacity={o} />
  ));
  return (
    <svg viewBox="0 0 130 110" className="w-44 h-32 pointer-events-none" aria-hidden>{sq}</svg>
  );
}

function MeadowLetterhead({ letterhead }) {
  const c = "#059669";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `1.5px solid ${c}` }}>
      {/* Top sweeping curve */}
      <div className="relative h-44">
        <svg viewBox="0 0 800 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
          <path d="M0,0 L800,0 L800,140 Q500,200 250,150 Q120,120 0,170 Z" fill="#059669" />
          <path d="M0,0 L800,0 L800,110 Q500,170 250,120 Q120,90 0,130 Z" fill="#7CB69E" />
        </svg>
        <div className="relative h-full flex items-center px-7 sm:px-10 gap-4">
          <MeadowLogo />
          <div className="text-white font-display font-extrabold leading-[1.05]" style={{ fontSize: "26px", letterSpacing: "0.04em" }}>
            <div>MEADOW</div>
            <div>PHYSIOTHERAPY</div>
            <div>CLINIC</div>
          </div>
        </div>
        {/* contact icons stacked top-right */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-sm space-y-1.5">
          <div className="flex items-center justify-end gap-2">Tel: {letterhead.phone}<span className="inline-flex w-6 h-6 items-center justify-center rounded bg-white/15"><Phone className="w-3.5 h-3.5" /></span></div>
          <div className="flex items-center justify-end gap-2">MeadowPhysiotherapy@queries.com<span className="inline-flex w-6 h-6 items-center justify-center rounded bg-white/15"><Mail className="w-3.5 h-3.5" /></span></div>
          <div className="flex items-center justify-end gap-2">{(letterhead.address_lines || []).join(" ")}<span className="inline-flex w-6 h-6 items-center justify-center rounded bg-white/15"><MapPin className="w-3.5 h-3.5" /></span></div>
        </div>
      </div>

      <div className="px-7 sm:px-10 pt-6 pb-12 relative flex-1">
        <ToBlock letterhead={letterhead} withLabel={false} />
        {letterhead.date ? <div className="text-sm mt-2 text-zinc-700">Date: <span className="font-semibold">{letterhead.date}</span></div> : null}
        <div className="mt-6"><LetterBody letterhead={letterhead} /></div>
        <div className="absolute right-3 bottom-3 pointer-events-none"><MeadowSquares color="#10B981" /></div>
      </div>
    </div>
  );
}

/* ---------- Letter 6: Northfield Stroke Clinic ---------- */
function NorthfieldChevrons({ size = 110 }) {
  return (
    <svg viewBox="0 0 200 120" width={size} aria-hidden>
      {[0, 35, 70, 105].map((x, i) => (
        <polygon key={i} points={`${x},10 ${x + 30},60 ${x},110 ${x + 8},110 ${x + 38},60 ${x + 8},10`} fill="none" stroke="#7DD3FC" strokeWidth="3" />
      ))}
    </svg>
  );
}

function NorthfieldMark({ size = 64 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} aria-hidden>
      <path d="M10 25 L 25 25 L 38 55 L 50 25 L 70 25 L 50 70 L 38 70 Z" fill="#0F766E" />
      <path d="M30 12 L 45 12 L 55 35 L 65 12 L 78 12 L 60 50 L 50 50 Z" fill="#0EA5E9" />
    </svg>
  );
}

function NorthfieldCoils() {
  return (
    <svg viewBox="0 0 200 100" className="w-44 h-24 pointer-events-none" aria-hidden>
      {[20, 40, 60, 80].map((y, i) => (
        <ellipse key={i} cx="100" cy={y} rx="60" ry="8" fill="none" stroke="#7DD3FC" strokeWidth="2.5" opacity={0.7} />
      ))}
    </svg>
  );
}

function NorthfieldLetterhead({ letterhead }) {
  const c = "#7C3AED";
  return (
    <div className="rounded-xl bg-white p-5 sm:p-7 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <NorthfieldChevrons />
        <div className="flex-1 text-center font-display font-extrabold tracking-tight" style={{ color: "#0F766E", fontSize: "26px", lineHeight: 1.1 }}>
          NORTHFIELD STROKE<br />CLINIC
        </div>
        <NorthfieldMark />
      </div>

      <div className="mt-10 flex items-start justify-between gap-6 flex-wrap">
        <ToBlock letterhead={letterhead} />
        <div className="text-right text-sm text-zinc-800 leading-relaxed">
          {(letterhead.address_lines || []).map((l, i) => <div key={i}>{l}</div>)}
          {letterhead.phone ? <div>Tel: {letterhead.phone}</div> : null}
          <div className="mt-3">Date: <span className="font-semibold">{letterhead.date}</span></div>
          <div className="text-zinc-700">Ref: BS/GP/4410</div>
        </div>
      </div>

      <div className="mt-10 relative z-10"><LetterBody letterhead={letterhead} /></div>
      <div className="absolute right-4 bottom-4 pointer-events-none"><NorthfieldCoils /></div>
    </div>
  );
}

/* ---------- Letter 7: Lakeside Neurology Clinic ---------- */
function LakesideLetterhead({ letterhead }) {
  const c = "#06B6D4";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      <div className="relative pt-8 pb-6 pr-7 sm:pr-10 min-h-[180px]">
        {/* cyan blob */}
        <svg viewBox="0 0 400 200" className="absolute left-0 top-0 h-44 w-72" preserveAspectRatio="none" aria-hidden>
          <path d="M0,0 L320,0 Q380,30 360,90 Q340,160 260,170 Q150,180 60,140 Q0,120 0,90 Z" fill="#06B6D4" />
        </svg>
        <div className="relative pl-8 sm:pl-10 text-white font-display font-extrabold leading-[1.05]" style={{ fontSize: "30px" }}>
          <div>Lakeside</div>
          <div>Neurology</div>
          <div>Clinic</div>
        </div>
        <div className="absolute right-6 top-7 text-sm text-zinc-800 space-y-1.5">
          <div className="flex items-center justify-end gap-2"><Phone className="w-4 h-4 text-zinc-700" />{letterhead.phone}</div>
          <div className="flex items-center justify-end gap-2"><Mail className="w-4 h-4 text-zinc-700" />hello@neurology.com</div>
          <div className="flex items-start justify-end gap-2 text-right"><MapPin className="w-4 h-4 text-zinc-700 mt-0.5" /><div>{(letterhead.address_lines || []).join(", ")}</div></div>
        </div>
      </div>

      <div className="px-7 sm:px-10 pb-10 relative flex-1">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <ToBlock letterhead={letterhead} />
          <div className="text-right text-sm text-zinc-800">
            {letterhead.date ? <div>Date: <span className="font-semibold">{letterhead.date}</span></div> : null}
          </div>
        </div>
        <div className="mt-6"><LetterBody letterhead={letterhead} /></div>
        {/* bottom-left vertical stripe */}
        <div className="absolute left-0 bottom-0 w-3 h-32" style={{ background: c }} aria-hidden />
        {/* bottom-right leaf wave */}
        <svg viewBox="0 0 200 80" className="absolute right-0 bottom-0 w-56 h-20 pointer-events-none" preserveAspectRatio="none" aria-hidden>
          <path d="M0,80 Q80,30 160,50 Q200,60 200,80 Z" fill="#67E8F9" />
          <path d="M30,80 Q100,40 200,55 L200,80 Z" fill="#06B6D4" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

/* ---------- Letter 8: Soundwell Audiology ---------- */
function EarSoundwaves({ size = 60 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} aria-hidden>
      <path d="M30 20 Q 16 20 14 38 Q 12 52 22 60 Q 28 64 30 70 Q 32 74 38 72 Q 44 70 42 62 Q 40 56 44 50 Q 50 44 50 36 Q 50 22 36 20 Z" fill="#FFFFFF" />
      <path d="M30 20 Q 16 20 14 38 Q 12 52 22 60 Q 28 64 30 70 Q 32 74 38 72 Q 44 70 42 62 Q 40 56 44 50 Q 50 44 50 36 Q 50 22 36 20 Z" fill="none" stroke="#1E3A8A" strokeWidth="2.5" />
      <path d="M58 30 Q 64 36 58 46" stroke="#06B6D4" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M64 24 Q 74 36 64 52" stroke="#06B6D4" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SoundwellLetterhead({ letterhead }) {
  const c = "#7C3AED";
  return (
    <div className="rounded-xl bg-white p-5 sm:p-7 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        {/* cyan blob with white ear icon */}
        <div className="relative">
          <svg viewBox="0 0 300 120" className="w-72 h-28" preserveAspectRatio="none" aria-hidden>
            <path d="M30,10 Q260,10 280,30 Q300,60 270,90 Q240,115 100,110 Q40,108 20,80 Q0,50 30,10 Z" fill="#0EA5E9" />
          </svg>
          <div className="absolute inset-0 flex items-center pl-6 gap-3 text-white font-display font-extrabold" style={{ fontSize: "22px", lineHeight: 1.1 }}>
            <EarSoundwaves size={50} />
            <div>Soundwell<br />Audiology</div>
          </div>
        </div>
        <div className="text-right text-sm text-zinc-800 leading-relaxed">
          {letterhead.date ? <div>Date: <span className="font-semibold">{letterhead.date}</span></div> : null}
          <div className="mt-2">{(letterhead.address_lines || []).join(", ")}</div>
          {letterhead.phone ? <div>Tel: {letterhead.phone}</div> : null}
        </div>
      </div>

      <div className="mt-8"><ToBlock letterhead={letterhead} withLabel={false} /></div>
      <div className="mt-6 relative z-10"><LetterBody letterhead={letterhead} /></div>

      <div className="mt-10 flex items-end justify-between gap-6 flex-wrap relative z-10">
        <EarSoundwaves size={70} />
        <div className="rounded-full bg-zinc-200 px-5 py-3 text-sm leading-tight">
          <div>✓ Personalized Care</div>
          <div>✓ Cutting-Edge Technology</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Letter 9: Willowbank Foot Clinic ---------- */
function WillowKnot({ size = 56 }) {
  const c = "#1E3A8A";
  return (
    <svg viewBox="0 0 80 80" width={size} aria-hidden>
      {[0, 90, 180, 270].map((rot) => (
        <path key={rot} d="M40 14 Q 50 28 40 40 Q 30 28 40 14 Z" fill={c} transform={`rotate(${rot} 40 40)`} />
      ))}
      <circle cx="40" cy="40" r="5" fill={c} />
    </svg>
  );
}

function WillowbankLetterhead({ letterhead }) {
  const c = "#1E3A8A";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      {/* top-left block */}
      <div className="absolute left-0 top-0 w-36 h-12" style={{ background: c }} aria-hidden />

      <div className="px-7 sm:px-10 pt-12 pb-10 relative">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex flex-col items-start gap-2">
            <WillowKnot />
            <div className="font-display font-extrabold tracking-tight uppercase leading-[1.05]" style={{ color: c, fontSize: "20px", letterSpacing: "0.04em" }}>
              <div>Willowbank</div>
              <div>Foot Clinic</div>
            </div>
            <div className="text-[11px] tracking-[0.3em] text-zinc-500 mt-1">CLINIC</div>
          </div>
          <div className="text-sm text-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-700" />{letterhead.phone}</div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-700" />hello@willowbank.com</div>
            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-zinc-700 mt-0.5" /><div>{(letterhead.address_lines || []).join(", ")}</div></div>
          </div>
        </div>

        <div className="mt-8 text-sm">{letterhead.date ? <div>Date: <span className="font-semibold">{letterhead.date}</span></div> : null}</div>
        <div className="mt-3"><ToBlock letterhead={letterhead} /></div>
        <div className="mt-6"><LetterBody letterhead={letterhead} /></div>
      </div>

      {/* bottom-right block */}
      <div className="absolute right-0 bottom-0 w-44 h-12" style={{ background: c }} aria-hidden />
    </div>
  );
}

/* ---------- Letter 10: Greenhill Hospital ---------- */
function GreenhillSwoosh({ size = 90 }) {
  return (
    <svg viewBox="0 0 120 90" width={size} aria-hidden>
      <path d="M0 50 Q 30 10 70 25 Q 100 35 120 30" stroke="#7DD3FC" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M5 65 Q 40 30 80 45 Q 110 55 120 50" stroke="#0284C7" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M10 78 Q 45 50 90 60 Q 110 65 118 65" stroke="#1E3A8A" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function GreenhillWaves() {
  return (
    <svg viewBox="0 0 400 100" className="w-72 h-20 pointer-events-none" preserveAspectRatio="none" aria-hidden>
      <path d="M0,80 Q80,40 160,60 Q260,85 400,55 L400,100 L0,100 Z" fill="#1E3A8A" />
      <path d="M0,90 Q80,55 160,70 Q260,90 400,70 L400,100 L0,100 Z" fill="#0284C7" />
      <path d="M0,95 Q80,75 160,82 Q260,95 400,85 L400,100 L0,100 Z" fill="#7DD3FC" />
    </svg>
  );
}

function GreenhillLetterhead({ letterhead }) {
  const c = "#0D9488";
  return (
    <div className="rounded-xl bg-white p-5 sm:p-7 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <GreenhillSwoosh />
          <div className="font-display font-extrabold leading-[1.05]" style={{ color: "#0F766E", fontSize: "26px" }}>
            <div>GREENHILL</div>
            <div>HOSPITAL</div>
          </div>
        </div>
        <div className="text-sm text-zinc-800 space-y-1.5">
          <div className="flex items-center justify-end gap-2"><Phone className="w-4 h-4 text-zinc-700" />{letterhead.phone}</div>
          <div className="flex items-center justify-end gap-2"><Mail className="w-4 h-4 text-zinc-700" />hello@greenhill.com</div>
          <div className="flex items-start justify-end gap-2 text-right"><MapPin className="w-4 h-4 text-zinc-700 mt-0.5" /><div>{(letterhead.address_lines || []).join(", ")}</div></div>
        </div>
      </div>

      <div className="mt-8 text-sm">{letterhead.date ? <div>Date: <span className="font-semibold">{letterhead.date}</span></div> : null}</div>
      <div className="mt-3"><ToBlock letterhead={letterhead} /></div>
      <div className="mt-6 relative z-10"><LetterBody letterhead={letterhead} /></div>

      <div className="absolute right-0 bottom-0 pointer-events-none"><GreenhillWaves /></div>
    </div>
  );
}

/* ---------- Letter A1: Riverbank Surgery (Intermediate) ---------- */
function RiverbankBuilding({ size = 80 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} aria-hidden>
      {/* small dots */}
      <rect x="6" y="8" width="6" height="6" rx="1" fill="#FFFFFF" opacity="0.7" />
      <rect x="16" y="14" width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.5" />
      <rect x="24" y="6" width="4" height="4" rx="1" fill="#FFFFFF" opacity="0.6" />
      {/* building base */}
      <rect x="20" y="32" width="60" height="58" rx="2" fill="#FFFFFF" />
      {/* windows grid */}
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect key={`w${r}${c}`} x={26 + c * 12} y={40 + r * 12} width="6" height="6" fill="#4F6B8C" />
        ))
      )}
      {/* cross top */}
      <rect x="44" y="14" width="12" height="22" fill="#FFFFFF" />
      <rect x="38" y="20" width="24" height="10" fill="#FFFFFF" />
    </svg>
  );
}

function RiverbankCross({ size = 110 }) {
  return (
    <svg viewBox="0 0 140 110" width={size} aria-hidden>
      {/* striped circle */}
      <defs>
        <pattern id="rb-stripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#FFFFFF" />
        </pattern>
      </defs>
      <ellipse cx="34" cy="34" rx="28" ry="22" fill="url(#rb-stripes)" opacity="0.85" />
      {/* large white cross with blue outline */}
      <rect x="68" y="36" width="34" height="60" rx="3" fill="#FFFFFF" stroke="#1D4E89" strokeWidth="3" />
      <rect x="55" y="50" width="60" height="32" rx="3" fill="#FFFFFF" stroke="#1D4E89" strokeWidth="3" />
    </svg>
  );
}

function RiverbankLetterhead({ letterhead }) {
  const c = "#4A6B8A";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      {/* slate-blue header band */}
      <div className="relative px-6 sm:px-7 py-5" style={{ background: c }}>
        <div className="flex items-start gap-4">
          <RiverbankBuilding />
          <div className="flex-1 min-w-0 mt-1">
            <div className="font-display font-extrabold tracking-wide text-white" style={{ fontSize: "26px", letterSpacing: "0.06em" }}>
              RIVERBANK SURGERY
            </div>
            <div className="mt-2 text-white text-[12px] sm:text-[13px] space-y-1">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{(letterhead.address_lines || []).join(", ")}</div>
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />Tel: {letterhead.phone}</div>
              {letterhead.website ? (
                <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" />{letterhead.website}</div>
              ) : null}
            </div>
          </div>
          <div className="hidden sm:block shrink-0"><RiverbankCross size={90} /></div>
        </div>
      </div>

      <div className="px-6 sm:px-8 pt-4 pb-6 flex-1 flex flex-col">
        <div className="text-[12px] text-zinc-700 leading-relaxed">
          <div>Date: <span className="font-semibold">{letterhead.date}</span></div>
          {letterhead.ref ? <div>Ref: {letterhead.ref}</div> : null}
        </div>
        <div className="mt-3 text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
          <div>To: {(letterhead.recipient_lines || [])[0]}</div>
          {(letterhead.recipient_lines || []).slice(1).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="mt-3"><LetterBody letterhead={letterhead} /></div>
      </div>
    </div>
  );
}

/* ---------- Letter A3: Clearview Opticians (Intermediate teal-wave variant) ---------- */
function ClearviewAmberEye({ size = 90 }) {
  return (
    <svg viewBox="0 0 120 60" width={size} aria-hidden>
      <path d="M5 30 Q 60 -10 115 30" stroke="#0F766E" strokeWidth="2.5" fill="none" />
      <path d="M5 30 Q 60 70 115 30" stroke="#0F766E" strokeWidth="2.5" fill="none" />
      <ellipse cx="60" cy="30" rx="14" ry="12" fill="none" stroke="#0F766E" strokeWidth="2" />
      <circle cx="60" cy="30" r="6" fill="#0F766E" />
      <circle cx="62" cy="28" r="2" fill="#FFFFFF" />
    </svg>
  );
}

function ClearviewAmberLetterhead({ letterhead }) {
  const c = "#0F766E";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      {/* layered teal waves */}
      <div className="relative h-32">
        <svg viewBox="0 0 800 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
          <path d="M0,0 L800,0 L800,80 Q500,150 250,120 Q120,100 0,140 Z" fill="#5EEAD4" opacity="0.55" />
          <path d="M0,0 L800,0 L800,60 Q500,120 250,90 Q120,70 0,110 Z" fill="#0D9488" opacity="0.85" />
          <path d="M0,0 L800,0 L800,40 Q500,90 250,60 Q120,40 0,80 Z" fill="#0F766E" />
        </svg>
        <div className="absolute right-5 top-3"><ClearviewAmberEye size={70} /></div>
        <div className="absolute right-5 top-16 text-right font-display italic font-extrabold leading-[1.05]" style={{ color: c, fontSize: "22px" }}>
          <div>Clearview</div>
          <div>Opticians</div>
        </div>
      </div>

      {/* contact strip */}
      <div className="px-6 sm:px-8 pt-3 pb-2 text-[12px] sm:text-[13px] text-zinc-800 space-y-1.5">
        <div className="flex items-center gap-2"><span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Phone className="w-3 h-3" /></span>{letterhead.phone}</div>
        {letterhead.website ? (
          <div className="flex items-center gap-2"><span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Globe className="w-3 h-3" /></span>{letterhead.website}</div>
        ) : null}
        <div className="flex items-start gap-2"><span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-emerald-500 text-white mt-0.5"><MapPin className="w-3 h-3" /></span><span>{(letterhead.address_lines || []).join(" ")}</span></div>
      </div>

      <div className="px-6 sm:px-8 pt-3 pb-6 flex-1 flex flex-col">
        <div className="text-[12px] text-zinc-700 leading-relaxed">
          <div>Date: <span className="font-semibold">{letterhead.date}</span></div>
          {letterhead.ref ? <div>Ref: {letterhead.ref}</div> : null}
        </div>
        <div className="mt-3 text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
          <div>To: {(letterhead.recipient_lines || [])[0]}</div>
          {(letterhead.recipient_lines || []).slice(1).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="mt-3"><LetterBody letterhead={letterhead} /></div>
      </div>
    </div>
  );
}

/* ---------- Letter A5: Oakwood Medical Practice ---------- */
function OakwoodLogo({ size = 70 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} aria-hidden>
      {/* house outline */}
      <path d="M14 38 L 40 16 L 66 38 L 66 64 L 14 64 Z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M40 16 L 70 40" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* stethoscope inside */}
      <circle cx="32" cy="48" r="4" fill="none" stroke="#A3E635" strokeWidth="2" />
      <circle cx="46" cy="48" r="4" fill="none" stroke="#A3E635" strokeWidth="2" />
      <path d="M32 52 Q 32 60 39 60 Q 46 60 46 52" stroke="#A3E635" strokeWidth="2" fill="none" />
      <circle cx="39" cy="60" r="2" fill="#A3E635" />
    </svg>
  );
}

function OakwoodLetterhead({ letterhead }) {
  const c = "#15803D";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      {/* green chevron header */}
      <div className="relative h-32">
        <div className="absolute inset-0" style={{ background: c }} aria-hidden />
        <div className="absolute inset-y-0 right-0 w-2/5" style={{ background: "#FFFFFF", clipPath: "polygon(0 0, 100% 0, 100% 100%, 18% 100%, 0 50%)" }} aria-hidden />
        <div className="absolute inset-y-0 right-0 w-1/3" style={{ background: "#A3E635", clipPath: "polygon(0 0, 100% 0, 100% 100%, 22% 100%, 0 50%)" }} aria-hidden />
        <div className="absolute inset-y-0 right-0 w-[28%]" style={{ background: c, clipPath: "polygon(0 0, 100% 0, 100% 100%, 22% 100%, 0 50%)" }} aria-hidden />

        <div className="relative h-full flex items-center px-5 sm:px-7 gap-3">
          <OakwoodLogo />
          <div className="text-white font-display font-extrabold leading-[1.05]" style={{ fontSize: "20px" }}>
            <div>Oakwood</div>
            <div>Medical</div>
            <div>Practice</div>
          </div>
        </div>

        {/* contact details on right side */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800 text-[12px] sm:text-[13px] space-y-1.5 z-10">
          <div className="flex items-center gap-2"><span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-green-700 text-white"><Phone className="w-3 h-3" /></span>{letterhead.phone}</div>
          {letterhead.website ? (
            <div className="flex items-center gap-2"><span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-green-700 text-white"><Globe className="w-3 h-3" /></span>{letterhead.website}</div>
          ) : null}
          <div className="flex items-start gap-2"><span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-green-700 text-white mt-0.5"><MapPin className="w-3 h-3" /></span><span>{(letterhead.address_lines || []).join(", ")}</span></div>
        </div>
      </div>

      <div className="px-6 sm:px-8 pt-4 pb-6 flex-1 flex flex-col">
        <div className="text-[12px] text-zinc-700 leading-relaxed">
          <div>Date: <span className="font-semibold">{letterhead.date}</span></div>
          {letterhead.ref ? <div>Ref: {letterhead.ref}</div> : null}
        </div>
        <div className="mt-3 text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
          <div>To: {(letterhead.recipient_lines || [])[0]}</div>
          {(letterhead.recipient_lines || []).slice(1).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="mt-3"><LetterBody letterhead={letterhead} /></div>
      </div>
    </div>
  );
}

/* ---------- Letter A6: Highfield Cardiology Unit ---------- */
function HighfieldBuilding({ size = 50 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <rect x="6" y="20" width="20" height="36" fill="#FACC15" />
      <rect x="22" y="10" width="28" height="46" fill="#1D4ED8" />
      {[0,1,2,3].map((r) => [0,1,2].map((col) => (
        <rect key={`hf${r}${col}`} x={26 + col * 7} y={18 + r * 9} width="4" height="5" fill="#FFFFFF" />
      )))}
    </svg>
  );
}

function HighfieldLetterhead({ letterhead }) {
  const c = "#EAB308";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      {/* top swoosh */}
      <div className="relative px-5 sm:px-7 py-4">
        <svg viewBox="0 0 800 90" className="absolute inset-x-0 top-0 w-full h-20 pointer-events-none" preserveAspectRatio="none" aria-hidden>
          <path d="M0,30 Q300,5 800,40 L800,0 L0,0 Z" fill="#FACC15" />
          <path d="M150,40 Q400,15 800,50 L800,0 L150,0 Z" fill="#1D4ED8" opacity="0.85" />
        </svg>
        <div className="relative flex items-center gap-3">
          <HighfieldBuilding />
          <div className="font-display font-extrabold tracking-tight" style={{ color: "#1D4ED8", fontSize: "22px" }}>
            Highfield Cardiology Unit
          </div>
        </div>
        <div className="relative mt-3 h-2 rounded-full" style={{ background: "linear-gradient(90deg,#1D4ED8 0%,#1D4ED8 70%,#FACC15 70%,#FACC15 100%)" }} />
      </div>

      <div className="px-5 sm:px-7 pt-2 pb-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[12px] text-zinc-700 leading-relaxed">
              <div>Date: <span className="font-semibold">{letterhead.date}</span></div>
              {letterhead.ref ? <div>Ref: {letterhead.ref}</div> : null}
            </div>
            <div className="mt-3 text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
              <div>To: {(letterhead.recipient_lines || [])[0]}</div>
              {(letterhead.recipient_lines || []).slice(1).map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
          <div className="text-[12px] sm:text-[13px] text-zinc-800 space-y-1.5 min-w-[170px]">
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-700" />{letterhead.phone}</div>
            {letterhead.website ? <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-700" />{letterhead.website}</div> : null}
            <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-blue-700 mt-0.5" /><span>{(letterhead.address_lines || []).join(", ")}</span></div>
          </div>
        </div>
        <div className="mt-3"><LetterBody letterhead={letterhead} /></div>
      </div>

      {/* bottom stripe */}
      <div className="h-3 mt-auto" style={{ background: "linear-gradient(90deg,#1D4ED8 0%,#1D4ED8 70%,#FACC15 70%,#FACC15 100%)" }} aria-hidden />
    </div>
  );
}

/* ---------- Letter A9: Parkview Physiotherapy Clinic ---------- */
function ParkviewLogo({ size = 60 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} aria-hidden>
      <circle cx="40" cy="40" r="32" fill="none" stroke="#0F172A" strokeWidth="6" />
      <path d="M40 8 A 32 32 0 0 1 72 40 L 56 40 A 16 16 0 0 0 40 24 Z" fill="#16A34A" />
      <polygon points="40,28 58,40 40,52" fill="#0F172A" />
      <circle cx="40" cy="40" r="5" fill="#FFFFFF" />
    </svg>
  );
}

function ParkviewSquaresBg() {
  const positions = [
    [40, 30, 18], [70, 50, 14], [100, 30, 16], [130, 60, 12],
    [50, 70, 14], [85, 80, 16], [115, 75, 12], [145, 35, 14],
    [60, 100, 18], [95, 105, 12],
  ];
  return (
    <svg viewBox="0 0 200 130" className="w-56 h-40 pointer-events-none" aria-hidden>
      {positions.map(([x, y, s], i) => (
        <rect key={i} x={x} y={y} width={s} height={s} fill="none" stroke="#9CA3AF" strokeWidth="1.2" opacity="0.5" transform={`rotate(45 ${x + s / 2} ${y + s / 2})`} />
      ))}
    </svg>
  );
}

function ParkviewLetterhead({ letterhead }) {
  const c = "#16A34A";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2px solid ${c}` }}>
      <div className="relative h-32">
        <svg viewBox="0 0 800 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
          <path d="M0,0 L800,0 L800,150 Q500,90 200,140 Q90,160 0,130 Z" fill="#A7B58E" opacity="0.7" />
          <path d="M0,0 L800,0 L800,90 Q500,40 200,90 Q90,110 0,80 Z" fill="#16A34A" />
        </svg>
        <div className="relative h-full flex items-center px-5 sm:px-7 gap-3">
          <ParkviewLogo />
          <div className="text-zinc-900 font-display font-extrabold leading-[1.05] uppercase" style={{ fontSize: "16px", letterSpacing: "0.04em" }}>
            <div>Parkview</div>
            <div>Physiotherapy</div>
            <div>Clinic</div>
          </div>
        </div>
        <div className="absolute right-4 top-3 text-white text-[11px] sm:text-[12px] space-y-1.5">
          <div className="flex items-center justify-end gap-2">Tel: {letterhead.phone}<span className="inline-flex w-5 h-5 items-center justify-center rounded bg-blue-700"><Phone className="w-3 h-3" /></span></div>
          {letterhead.email ? (
            <div className="flex items-center justify-end gap-2">{letterhead.email}<span className="inline-flex w-5 h-5 items-center justify-center rounded bg-blue-700"><Mail className="w-3 h-3" /></span></div>
          ) : null}
          <div className="flex items-start justify-end gap-2 text-right">{(letterhead.address_lines || []).join(" ")}<span className="inline-flex w-5 h-5 items-center justify-center rounded bg-blue-700 mt-0.5"><MapPin className="w-3 h-3" /></span></div>
        </div>
      </div>

      <div className="px-5 sm:px-7 pt-4 pb-5 flex-1 flex flex-col relative">
        <div className="text-[12px] text-zinc-700 leading-relaxed">
          <div>Date: <span className="font-semibold">{letterhead.date}</span></div>
          {letterhead.ref ? <div>Ref: {letterhead.ref}</div> : null}
        </div>
        <div className="mt-3 text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
          <div>To: {(letterhead.recipient_lines || [])[0]}</div>
          {(letterhead.recipient_lines || []).slice(1).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="mt-3"><LetterBody letterhead={letterhead} /></div>
        <div className="absolute right-2 bottom-2 pointer-events-none"><ParkviewSquaresBg /></div>
      </div>
    </div>
  );
}

/* ---------- Letter A10: Elmtree Clinic Phlebotomy ---------- */
function PhlebotomyShield({ size = 70 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} aria-hidden>
      <path d="M40 8 L 70 18 L 70 40 Q 70 64 40 74 Q 10 64 10 40 L 10 18 Z" fill="#0EA5A4" />
      <path d="M50 28 Q 50 22 42 22 L 32 22 Q 24 22 24 30 Q 24 38 32 38 L 42 38 Q 50 38 50 46 Q 50 54 42 54 L 32 54 Q 24 54 24 50" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ElmtreeLetterhead({ letterhead }) {
  const c = "#1D4ED8";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2.5px solid ${c}` }}>
      <div className="absolute left-0 top-0 w-3 h-2/3" style={{ background: "#3B82F6" }} aria-hidden />
      <div className="absolute left-0 bottom-0 w-3 h-1/4" style={{ background: "#0EA5A4" }} aria-hidden />

      <div className="pl-7 pr-5 sm:pl-9 sm:pr-7 pt-6 pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <PhlebotomyShield />
            <div className="font-display font-extrabold tracking-tight leading-[1.05] text-zinc-900" style={{ fontSize: "22px" }}>
              <div>Phlebotomy</div>
              <div>Clinic</div>
            </div>
          </div>
          <div className="text-right text-[12px] sm:text-[13px] text-zinc-800 leading-relaxed">
            <div className="font-display font-bold">Elmtree Clinic</div>
            <div>Phlebotomy Department</div>
            {(letterhead.address_lines || []).map((l, i) => <div key={i}>{l}</div>)}
            {letterhead.phone ? <div>Tel: {letterhead.phone}</div> : null}
          </div>
        </div>
      </div>

      <div className="pl-7 pr-5 sm:pl-9 sm:pr-7 pb-6 flex-1 flex flex-col">
        <div className="text-[12px] text-zinc-700 leading-relaxed">
          <div>Date: <span className="font-semibold">{letterhead.date}</span></div>
          {letterhead.ref ? <div>Ref: {letterhead.ref}</div> : null}
        </div>
        <div className="mt-3 text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
          <div>To: {(letterhead.recipient_lines || [])[0]}</div>
          {(letterhead.recipient_lines || []).slice(1).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="mt-3"><LetterBody letterhead={letterhead} /></div>
      </div>
    </div>
  );
}

/* ---------- Letter R3: Riverbank Surgery (Complex variant) ---------- */
function RiverbankCompass({ size = 70 }) {
  const c = "#3F5872";
  const arms = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    const x1 = 40 + Math.cos(a) * 8;
    const y1 = 40 + Math.sin(a) * 8;
    const x2 = 40 + Math.cos(a) * 30;
    const y2 = 40 + Math.sin(a) * 30;
    const px1 = 40 + Math.cos(a + 0.35) * 22;
    const py1 = 40 + Math.sin(a + 0.35) * 22;
    const px2 = 40 + Math.cos(a - 0.35) * 22;
    const py2 = 40 + Math.sin(a - 0.35) * 22;
    arms.push(
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="6" strokeLinecap="round" />
        <line x1={px1} y1={py1} x2={x2} y2={y2} stroke={c} strokeWidth="3" strokeLinecap="round" />
        <line x1={px2} y1={py2} x2={x2} y2={y2} stroke={c} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <svg viewBox="0 0 80 80" width={size} aria-hidden>
      <circle cx="40" cy="40" r="6" fill={c} />
      {arms}
    </svg>
  );
}

function RiverbankRedLetterhead({ letterhead }) {
  const c = "#3F5872";
  return (
    <div className="rounded-xl bg-white p-0 relative overflow-hidden min-h-full w-full flex flex-col" style={{ border: `2.5px solid ${c}` }}>
      <div className="px-6 sm:px-8 pt-6 pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <RiverbankCompass />
            <div className="font-display font-extrabold tracking-tight leading-[1.05] text-zinc-900" style={{ fontSize: "26px" }}>
              <div>Riverbank</div>
              <div>Surgery</div>
            </div>
          </div>
          <div className="text-right text-[12px] sm:text-[13px] text-zinc-800 leading-relaxed">
            <div className="font-display font-bold uppercase tracking-wide" style={{ color: c }}>Riverbank Surgery</div>
            {(letterhead.address_lines || []).map((l, i) => <div key={i}>{l}</div>)}
            {letterhead.phone ? <div>Tel: {letterhead.phone}</div> : null}
            {letterhead.email ? <div>Email: <span className="underline">{letterhead.email}</span></div> : null}
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-wrap text-[12px] sm:text-[13px] leading-relaxed">
          <div className="text-zinc-900">
            <div>To: {(letterhead.recipient_lines || [])[0]}</div>
            {(letterhead.recipient_lines || []).slice(1).map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <div className="text-right text-zinc-700">
            <div>Date: <span className="font-semibold">{letterhead.date}</span></div>
            {letterhead.ref ? <div>Ref: {letterhead.ref}</div> : null}
          </div>
        </div>
        <div className="mt-3"><LetterBody letterhead={letterhead} /></div>
      </div>
    </div>
  );
}

/* ---------- Medication label variants ---------- */
function MedLabelShell({ letterhead, accent, bg, logo, logoPos = "left", rxRight = false, barcode = true }) {
  const c = accent;
  const med = letterhead.medication || {};
  return (
    <div
      className="rounded-xl p-5 sm:p-6 relative overflow-hidden w-full flex flex-col"
      style={{ background: bg, border: `1.5px solid ${c}` }}
    >
      {/* Header: logo + name (left) + address/phone (right) — or swapped */}
      <div className="flex items-start justify-between gap-4">
        {logoPos === "left" ? (
          <div className="flex items-start gap-3 max-w-[60%]">
            {logo}
            {letterhead.clinic_name ? (
              <div className="font-display font-extrabold leading-[1.05] text-zinc-900" style={{ fontSize: "18px", color: letterhead.brand_color || c }}>
                {letterhead.clinic_name.split(" ").map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <div className="font-display font-extrabold text-zinc-800 leading-none" style={{ fontSize: "32px", fontFamily: "Georgia, serif" }}>R<sub style={{ fontSize: "18px" }}>x</sub></div>
          </div>
        )}
        <div className="text-right text-[11px] sm:text-[12px] text-zinc-800 leading-relaxed">
          {(letterhead.address_lines || []).map((l, i) => <div key={i}>{l}</div>)}
          {letterhead.phone ? <div>Tel: {letterhead.phone}</div> : null}
        </div>
        {logoPos === "right" ? (
          <div className="flex items-start gap-2 max-w-[35%]">
            {logo}
            {letterhead.clinic_name ? (
              <div className="font-display font-extrabold leading-[1.05] uppercase tracking-tight" style={{ fontSize: "16px", color: letterhead.brand_color || c }}>
                {letterhead.clinic_name.split(" ").map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Patient block */}
      <div className="mt-3 text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
        {med.rx_number ? <div>Rx No: {med.rx_number}</div> : null}
        {(letterhead.recipient_lines || []).map((l, i) => (
          <div key={i}>{i === 0 ? <>Patient: {l}</> : l}</div>
        ))}
      </div>

      {/* Medication block + quantity (two-column inside) */}
      <div className="mt-3 flex items-start justify-between gap-6 flex-wrap">
        <div className="text-zinc-900 max-w-[60%]">
          {med.name ? <div className="font-display font-extrabold uppercase text-[14px] sm:text-[15px]">{med.name}</div> : null}
          {med.instruction ? (
            <div className={`text-[12px] sm:text-[13px] mt-0.5 ${med.instruction_uppercase ? "uppercase font-display font-bold" : ""}`}>
              {med.instruction}
            </div>
          ) : null}
        </div>
        {med.quantity ? (
          <div className="font-display font-extrabold uppercase text-[13px] sm:text-[14px] text-zinc-900">
            QUANTITY: {med.quantity}
          </div>
        ) : null}
      </div>

      {/* Warning row (optional) */}
      {med.warning ? (
        <div className="mt-3 flex items-start gap-2 text-[12px] sm:text-[13px] text-zinc-900">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="flex-shrink-0 mt-[1px]">
            <path d="M12 2 L 22 20 L 2 20 Z" fill="#FBBF24" stroke="#92400E" strokeWidth="1.2" strokeLinejoin="round" />
            <rect x="11.1" y="9" width="1.8" height="6" rx="0.9" fill="#1F2937" />
            <circle cx="12" cy="17.4" r="1" fill="#1F2937" />
          </svg>
          <div><span className="font-semibold">Warning:</span> {med.warning}</div>
        </div>
      ) : null}

      {/* Footer: date / prescriber */}
      <div className="mt-auto pt-3 flex items-end justify-between gap-3 flex-wrap">
        <div className="text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
          {med.date_dispensed ? <div>Date dispensed: {med.date_dispensed}</div> : null}
          {med.prescriber ? <div>Prescriber: {med.prescriber}</div> : null}
        </div>
        <div className="flex items-end gap-3">
          {rxRight ? (
            <div className="font-display font-extrabold text-zinc-300 leading-none" style={{ fontSize: "44px", fontFamily: "Georgia, serif" }}>R<sub style={{ fontSize: "22px" }}>x</sub></div>
          ) : null}
          {barcode ? (
            <svg viewBox="0 0 100 50" width="84" height="42" aria-hidden>
              {Array.from({ length: 22 }).map((_, i) => {
                const w = (i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1);
                return <rect key={i} x={i * 4 + 2} y="2" width={w} height="46" fill="#0f172a" />;
              })}
            </svg>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MeadowShield({ size = 50 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <path d="M30 4 L 54 12 L 54 30 Q 54 50 30 58 Q 6 50 6 30 L 6 12 Z" fill="#1FA8A3" />
      <path d="M40 22 Q 40 17 34 17 L 26 17 Q 20 17 20 24 Q 20 30 26 30 L 34 30 Q 40 30 40 36 Q 40 42 34 42 L 26 42 Q 20 42 20 38" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MeadowRxLabel({ letterhead }) {
  return (
    <MedLabelShell
      letterhead={letterhead}
      accent="#1FA8A3"
      bg="#E8F4F0"
      logo={<MeadowShield />}
      logoPos="left"
      rxRight={true}
      barcode={true}
    />
  );
}

function OakwoodSwirl({ size = 44 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <path d="M10 30 Q 10 12 30 12 Q 50 12 50 30 Q 50 42 38 44 Q 30 44 28 38 Q 28 30 36 30" stroke="#0F4C9F" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M52 30 Q 52 48 32 48 Q 16 48 14 36" stroke="#7BA7D9" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function OakwoodRxLabel({ letterhead }) {
  return (
    <MedLabelShell
      letterhead={letterhead}
      accent="#0F4C9F"
      bg="#FCEEDF"
      logo={<OakwoodSwirl />}
      logoPos="right"
      rxRight={false}
      barcode={true}
    />
  );
}

function BrightsideBuilding({ size = 44 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <rect x="6" y="22" width="20" height="34" fill="#1D4ED8" />
      <rect x="22" y="14" width="22" height="42" fill="#FACC15" />
      <rect x="40" y="26" width="14" height="30" fill="#1D4ED8" />
      {[0,1,2].map((r) => [0,1].map((co) => (
        <rect key={`bs${r}${co}`} x={26 + co * 7} y={20 + r * 9} width="4" height="5" fill="#FFFFFF" />
      )))}
    </svg>
  );
}

function BrightsideRxLabel({ letterhead }) {
  return (
    <MedLabelShell
      letterhead={letterhead}
      accent="#1D4ED8"
      bg="#E6F2DD"
      logo={<BrightsideBuilding />}
      logoPos="left"
      rxRight={false}
      barcode={true}
    />
  );
}

function MapleSnowflakeRx({ size = 46 }) {
  const c = "#0F766E";
  const tips = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const x1 = 30 + Math.cos(a) * 6;
    const y1 = 30 + Math.sin(a) * 6;
    const x2 = 30 + Math.cos(a) * 22;
    const y2 = 30 + Math.sin(a) * 22;
    tips.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3.5" strokeLinecap="round" />);
  }
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <circle cx="30" cy="30" r="4" fill={c} />
      {tips}
    </svg>
  );
}

function MapleRxLabel({ letterhead }) {
  return (
    <MedLabelShell
      letterhead={letterhead}
      accent="#0F766E"
      bg="#FBF6D7"
      logo={<MapleSnowflakeRx />}
      logoPos="left"
      rxRight={true}
      barcode={true}
    />
  );
}

function ClearviewEyeRx({ size = 46 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <circle cx="30" cy="30" r="22" fill="none" stroke="#0EA5A4" strokeWidth="3" />
      <circle cx="30" cy="30" r="14" fill="none" stroke="#15803D" strokeWidth="3" />
      <circle cx="30" cy="30" r="6" fill="#15803D" />
      <circle cx="32" cy="28" r="2" fill="#FFFFFF" />
    </svg>
  );
}

function ClearviewRxLabel({ letterhead }) {
  return (
    <MedLabelShell
      letterhead={letterhead}
      accent="#0F766E"
      bg="#E6F2DD"
      logo={<ClearviewEyeRx />}
      logoPos="left"
      rxRight={true}
      barcode={true}
    />
  );
}

function ParkviewFlower({ size = 50 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      {[0, 90, 180, 270].map((rot, i) => (
        <path key={i} d="M30 12 Q 38 22 30 32 Q 22 22 30 12 Z" fill="#1E3A8A" transform={`rotate(${rot} 30 30)`} />
      ))}
      <circle cx="30" cy="30" r="4" fill="#1E3A8A" />
    </svg>
  );
}
function ParkviewRxLabel({ letterhead }) {
  return <MedLabelShell letterhead={letterhead} accent="#1E3A8A" bg="#EFE9F7" logo={<ParkviewFlower />} logoPos="left" rxRight={true} barcode={true} />;
}

function NorthfieldS({ size = 46 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <path d="M14 18 Q 30 4 46 14 Q 30 22 22 30 Q 14 38 26 46 Q 42 56 50 42" stroke="#0EA5E9" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function NorthfieldRxLabel({ letterhead }) {
  return <MedLabelShell letterhead={letterhead} accent="#0EA5E9" bg="#FCEAE6" logo={<NorthfieldS />} logoPos="left" rxRight={true} barcode={true} />;
}

function HighfieldHouseStetho({ size = 50 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <path d="M10 30 L 30 14 L 50 30 L 50 52 L 10 52 Z" fill="none" stroke="#0F172A" strokeWidth="2.5" />
      <rect x="26" y="18" width="6" height="6" fill="none" stroke="#0F172A" strokeWidth="1.5" />
      <line x1="29" y1="18" x2="29" y2="24" stroke="#0F172A" strokeWidth="1.5" />
      <line x1="26" y1="21" x2="32" y2="21" stroke="#0F172A" strokeWidth="1.5" />
      <circle cx="22" cy="42" r="4" fill="none" stroke="#A3E635" strokeWidth="2" />
      <circle cx="34" cy="42" r="4" fill="none" stroke="#A3E635" strokeWidth="2" />
      <path d="M22 46 Q 22 52 28 52 Q 34 52 34 46" stroke="#A3E635" strokeWidth="2" fill="none" />
    </svg>
  );
}
function HighfieldRxLabel({ letterhead }) {
  return <MedLabelShell letterhead={letterhead} accent="#0F172A" bg="#F1F1EF" logo={<HighfieldHouseStetho />} logoPos="left" rxRight={true} barcode={true} />;
}

function WillowbankHospital({ size = 50 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} aria-hidden>
      <rect x="10" y="14" width="40" height="40" fill="#7C5BB8" />
      <rect x="26" y="20" width="8" height="3" fill="#FFFFFF" />
      <rect x="29" y="17" width="2" height="9" fill="#FFFFFF" />
      {[0,1,2].map((r) => [0,1,2].map((co) => (
        <rect key={`wb${r}${co}`} x={16 + co * 10} y={32 + r * 6} width="5" height="4" fill="#FFFFFF" />
      )))}
    </svg>
  );
}
function WillowbankRxLabel({ letterhead }) {
  return <MedLabelShell letterhead={letterhead} accent="#7C5BB8" bg="#EFE9F7" logo={<WillowbankHospital />} logoPos="left" rxRight={true} barcode={true} />;
}

function SoundwellEye({ size = 50 }) {
  return (
    <svg viewBox="0 0 80 40" width={size} aria-hidden>
      <path d="M5 20 Q 40 -5 75 20" stroke="#0F766E" strokeWidth="3" fill="none" />
      <path d="M5 20 Q 40 45 75 20" stroke="#0F766E" strokeWidth="3" fill="none" />
      <circle cx="40" cy="20" r="8" fill="#0F766E" />
      <circle cx="42" cy="18" r="2" fill="#FFFFFF" />
    </svg>
  );
}
function SoundwellRxLabel({ letterhead }) {
  return <MedLabelShell letterhead={letterhead} accent="#0F766E" bg="#FCEAE6" logo={<SoundwellEye size={56} />} logoPos="left" rxRight={true} barcode={true} />;
}

/* ---------- OTC medication package shell (Complex / Red labels) ---------- */
function OtcBarcode({ value, frame = false, color = "#0F172A", width = 110, height = 36 }) {
  return (
    <div className={`inline-flex flex-col items-center ${frame ? "p-1.5 rounded" : ""}`} style={frame ? { background: "#FFFFFF", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" } : undefined}>
      {frame ? (
        <div className="relative" style={{ padding: "4px 6px" }}>
          <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 6, height: 6, borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
          <span aria-hidden style={{ position: "absolute", top: 0, right: 0, width: 6, height: 6, borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
          <span aria-hidden style={{ position: "absolute", bottom: 0, left: 0, width: 6, height: 6, borderBottom: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
          <span aria-hidden style={{ position: "absolute", bottom: 0, right: 0, width: 6, height: 6, borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
          <svg viewBox="0 0 110 36" width={width} height={height} aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => {
              const w = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
              return <rect key={i} x={i * 4 + 2} y="2" width={w} height={28} fill={color} />;
            })}
          </svg>
          {value ? <div className="text-[9px] text-center font-mono mt-0.5" style={{ color }}>{value}</div> : null}
        </div>
      ) : (
        <>
          <svg viewBox="0 0 110 36" width={width} height={height} aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => {
              const w = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
              return <rect key={i} x={i * 4 + 2} y="2" width={w} height={28} fill={color} />;
            })}
          </svg>
          {value ? <div className="text-[9px] text-center font-mono mt-0.5" style={{ color }}>{value}</div> : null}
        </>
      )}
    </div>
  );
}

function WarnTriangle({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="inline-block flex-shrink-0 align-text-bottom mr-1">
      <path d="M12 2 L 22 20 L 2 20 Z" fill="#FBBF24" stroke="#92400E" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="11.1" y="9" width="1.8" height="6" rx="0.9" fill="#1F2937" />
      <circle cx="12" cy="17.4" r="1" fill="#1F2937" />
    </svg>
  );
}

function CartonWrap({ children, boxBg = "#FFFFFF", topShade = "#E9E9E9", sideShade = "#D2D2D2" }) {
  // 2.5D medicine-carton mockup — front face flat, with skewed parallelogram strips
  // representing the visible top lid and right side panel, plus a soft contact shadow.
  // Mirrors the look of the source product photos.
  const TOP_DEPTH = 12;
  const SIDE_DEPTH = 10;
  return (
    <div
      className="relative"
      style={{
        paddingTop: TOP_DEPTH + 2,
        paddingRight: SIDE_DEPTH + 2,
        paddingBottom: 22,
      }}
    >
      {/* Soft contact shadow under the carton */}
      <div
        aria-hidden
        className="absolute"
        style={{
          left: 18,
          right: 6,
          bottom: 2,
          height: 22,
          background:
            "radial-gradient(ellipse at center, rgba(15,23,42,0.30) 0%, rgba(15,23,42,0.12) 45%, transparent 75%)",
          filter: "blur(4px)",
          zIndex: 0,
        }}
      />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Top lid — full-width slanted parallelogram */}
        <div
          aria-hidden
          className="absolute"
          style={{
            top: 0,
            left: TOP_DEPTH,
            right: SIDE_DEPTH + TOP_DEPTH * 0.6,
            height: TOP_DEPTH,
            background: `linear-gradient(180deg, ${topShade} 0%, #FFFFFF 75%)`,
            borderTop: "1px solid #C8C8C8",
            borderLeft: "1px solid #C8C8C8",
            borderRight: "1px solid #C8C8C8",
            transform: "skewX(-58deg)",
            transformOrigin: "bottom left",
            borderTopLeftRadius: "3px",
            borderTopRightRadius: "3px",
          }}
        />
        {/* Right side — full-height slanted parallelogram */}
        <div
          aria-hidden
          className="absolute"
          style={{
            top: TOP_DEPTH + SIDE_DEPTH * 0.4,
            bottom: SIDE_DEPTH * 0.4,
            right: 0,
            width: SIDE_DEPTH,
            background: `linear-gradient(90deg, ${sideShade} 0%, #B8B8B8 100%)`,
            borderTop: "1px solid #B5B5B5",
            borderRight: "1px solid #B5B5B5",
            borderBottom: "1px solid #B5B5B5",
            transform: "skewY(-30deg)",
            transformOrigin: "top left",
            borderTopRightRadius: "3px",
            borderBottomRightRadius: "3px",
          }}
        />
        {/* Front face */}
        <div
          className="relative rounded-md"
          style={{
            background: boxBg,
            border: "1px solid #C8C8C8",
            padding: "14px 16px 18px",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.9) inset, 0 6px 14px rgba(15,23,42,0.06)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Section({ label, body, inkColor = "#18181B" }) {
  return (
    <p className="mt-2" style={{ color: inkColor }}>
      <strong className="font-bold">{label}</strong> {body}
    </p>
  );
}

/* RED 1 — Relievex extra (Ibuprofen 200mg) */
function RelievexPackageLabel({ letterhead }) {
  const med = letterhead.medication || {};
  return (
    <CartonWrap boxBg="#FAFAF9">
      <div className="rounded relative" style={{ background: "#F2EBF7", padding: "22px 26px 18px", border: "1px solid rgba(124, 91, 184, 0.18)" }}>
        {/* Brand top-right (orange script) */}
        <div className="absolute right-5 top-3 text-right" style={{ color: "#EA8923", fontFamily: '"Brush Script MT", "Segoe Script", cursive', lineHeight: 0.95, transform: "rotate(-3deg)" }}>
          <div className="italic font-extrabold" style={{ fontSize: 26 }}>Relievex</div>
          <div className="italic font-extrabold" style={{ fontSize: 26, paddingLeft: 26 }}>extra</div>
        </div>
        <div className="max-w-[62%]">
          <div className="text-[13px] sm:text-[14px] text-zinc-900 font-medium">{med.subtitle}</div>
          <div className="font-display font-extrabold uppercase text-[15px] sm:text-[16px] text-zinc-900 mt-0.5 tracking-tight">{med.name}</div>
          <div className="mt-1.5 h-px bg-zinc-800/40 max-w-[180px]" />
        </div>
        <div className="mt-3 grid grid-cols-[1.55fr_1fr] gap-5 text-[12px] sm:text-[13px] text-zinc-900 leading-relaxed">
          <div>
            {med.intro ? <p>{med.intro}</p> : null}
            {(med.sections || []).map((s, i) => (
              <Section key={i} label={s.label} body={s.body} />
            ))}
          </div>
          <div className="flex flex-col items-end gap-3 pt-1">
            {med.storage ? (
              <div className="rounded-2xl px-3 py-2 text-[11px] sm:text-[12px] text-center w-full" style={{ background: "#FFF7E0", border: "1px solid #FBE3A8" }}>
                {med.storage}
              </div>
            ) : null}
            {med.warning ? (
              <div className="text-[11px] sm:text-[12px] leading-snug text-right">
                <strong>Warning</strong> <WarnTriangle size={14} /> {med.warning}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <OtcBarcode value={med.barcode_value} frame />
        </div>
      </div>
    </CartonWrap>
  );
}

/* RED 2 — Paxolin (Paracetamol 500mg) */
function PaxolinPackageLabel({ letterhead }) {
  const med = letterhead.medication || {};
  return (
    <CartonWrap boxBg="#FFFFFF">
      {/* Top barcode strip outside the colored panel */}
      <div className="flex justify-end pb-1.5 pr-1">
        <OtcBarcode width={84} height={20} color="#0F172A" />
      </div>
      <div className="rounded relative overflow-hidden" style={{ background: "#9DB4C2", padding: "22px 70px 22px 26px", color: "#0F172A" }}>
        {/* Swooshy decorative lines */}
        <svg viewBox="0 0 600 200" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden>
          <path d="M-40 100 Q 200 60 400 110 T 700 100" stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="2" fill="none" />
          <path d="M-40 130 Q 200 90 400 140 T 700 130" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2" fill="none" />
          <path d="M-40 70 Q 200 30 400 80 T 700 70" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2" fill="none" />
        </svg>
        {/* Sideways brand on the right (vertical text, top-to-bottom) */}
        <div
          className="absolute font-display font-extrabold tracking-tight select-none"
          style={{
            top: 16,
            bottom: 16,
            right: 14,
            writingMode: "vertical-rl",
            color: "#F6D7E0",
            fontSize: 30,
            lineHeight: 1,
            letterSpacing: 1,
          }}
        >
          Paxolin
        </div>
        <div className="relative z-10">
          <div className="font-display font-extrabold uppercase text-[15px] sm:text-[17px] tracking-tight">{med.name}</div>
          <div className="mt-1 h-px bg-zinc-900/30 max-w-[160px]" />
        </div>
        <div className="relative z-10 mt-3 text-[12px] sm:text-[13px] leading-relaxed">
          {med.intro ? <p>{med.intro}</p> : null}
          {(med.sections || []).map((s, i) => (
            <Section key={i} label={s.label} body={s.body} />
          ))}
        </div>
      </div>
    </CartonWrap>
  );
}

/* RED 3 — Allergex (Cetirizine 10mg) — two-column */
function AllergexPackageLabel({ letterhead }) {
  const med = letterhead.medication || {};
  const left = med.sections_left || [];
  const right = med.sections_right || [];
  return (
    <CartonWrap boxBg="#FFFFFF">
      <div className="rounded relative" style={{ background: "#F2EBDF", padding: "22px 24px 18px", color: "#1F1B12" }}>
        <div className="font-display font-extrabold uppercase text-[14px] sm:text-[15px] tracking-tight">{med.name}</div>
        <div className="grid grid-cols-2 gap-x-6 mt-3 relative" style={{ borderTop: "1px solid #C8B79A33" }}>
          <div className="pt-3 pr-3 text-[12px] sm:text-[12.5px] leading-relaxed" style={{ borderRight: "1.5px dashed #BFAE91" }}>
            {med.intro ? <p>{med.intro}</p> : null}
            {left.map((s, i) => (
              <Section key={i} label={s.label} body={s.body} />
            ))}
          </div>
          <div className="pt-3 pl-2 text-[12px] sm:text-[12.5px] leading-relaxed">
            {right.map((s, i) => (
              <Section key={i} label={s.label} body={s.body} />
            ))}
            <div className="mt-3 flex flex-col items-end gap-2">
              <div className="font-display font-extrabold tracking-[0.05em] uppercase" style={{ color: "#9C8568", fontSize: 28 }}>ALLERGEX</div>
              <OtcBarcode />
            </div>
          </div>
        </div>
      </div>
    </CartonWrap>
  );
}

/* RED 4 — Rexazid (Ranitidine 75mg) */
function RexazidPackageLabel({ letterhead }) {
  const med = letterhead.medication || {};
  return (
    <CartonWrap boxBg="#FFFFFF">
      <div className="rounded relative" style={{ background: "#FFFFFF", padding: "20px 24px 18px", color: "#18181B", border: "1px solid #EDEDED" }}>
        <div className="flex items-start justify-between gap-4">
          {/* Brand: green stylized */}
          <div className="inline-block rounded px-2 py-0.5" style={{ background: "#E8F2C4" }}>
            <span className="font-display font-bold lowercase italic" style={{ color: "#5BA239", fontSize: 26, letterSpacing: -1 }}>rexazid</span>
          </div>
          <div className="flex-1 text-[12px] sm:text-[13px] font-medium text-zinc-800 pt-1">
            {med.subtitle}
          </div>
          {/* Orange barcode tag */}
          <div className="rounded-md p-1.5" style={{ background: "linear-gradient(135deg, #F08C2D, #DB6B12)" }}>
            <div className="bg-white rounded-sm px-1 py-1">
              <OtcBarcode value={med.barcode_value} width={70} height={22} />
            </div>
          </div>
        </div>
        <div className="mt-2 font-display font-extrabold uppercase text-[14px] sm:text-[15px] tracking-tight">{med.name}</div>
        <div className="mt-3 text-[12px] sm:text-[13px] leading-relaxed">
          {(med.sections || []).map((s, i) => (
            <Section key={i} label={s.label} body={s.body} />
          ))}
        </div>
      </div>
    </CartonWrap>
  );
}

/* RED 5 — Throatmin Honey & Lemon (Lozenges) */
function ThroatminPackageLabel({ letterhead }) {
  const med = letterhead.medication || {};
  return (
    <CartonWrap boxBg="#F6F6F6">
      <div className="rounded relative" style={{ background: "#EDEDED", padding: "20px 24px 20px", color: "#18181B" }}>
        <div className="flex items-center gap-3">
          {/* Pill blister icon */}
          <svg viewBox="0 0 60 36" width="56" height="34" aria-hidden>
            <rect x="2" y="2" width="56" height="32" rx="4" fill="#DCE6F1" stroke="#A4B7CC" />
            {[8, 22, 36, 50].map((cx) => (
              <circle key={cx} cx={cx} cy="12" r="5" fill="#F4C44F" stroke="#B58B1A" strokeWidth="1" />
            ))}
            {[8, 22, 36, 50].map((cx) => (
              <circle key={`b${cx}`} cx={cx} cy="24" r="5" fill="#F4C44F" stroke="#B58B1A" strokeWidth="1" />
            ))}
          </svg>
          <div className="font-display font-extrabold text-[20px] sm:text-[22px] tracking-tight">{med.brand_text || "Throatmin Honey & Lemon"}</div>
        </div>
        <div className="mt-3 text-[12px] sm:text-[13px] leading-relaxed">
          {med.intro ? <p>{med.intro}</p> : null}
          {(med.sections || []).map((s, i) => (
            <Section key={i} label={s.label} body={s.body} />
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <OtcBarcode value={med.barcode_value} frame />
        </div>
      </div>
    </CartonWrap>
  );
}

/* ---------- Voicemail card (Functional Communication / Voicemails activity) ---------- */
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function callerInitials(name) {
  if (!name) return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const VOICEMAIL_SPEEDS = [0.75, 1, 1.25];

function VoicemailCard({
  letterhead,
  replayNonce = 0,
  onPrevious,
  hasPrevious = false,
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1); // index into VOICEMAIL_SPEEDS

  const hasAudio = Boolean(letterhead.audio_url);
  const isPhoneMenu = letterhead.format === "phone-menu";
  // For comprehension voicemails (Foundational / Intermediate / Complex),
  // we hide the caller-identifying details (name, subtitle, real initials)
  // so users have to listen to the audio to find the answers. Phone menus
  // (Bonus tier) keep their identity because the scenario references the
  // brand directly.
  const hideCallerIdentity = !isPhoneMenu;
  const displayCallerName = hideCallerIdentity
    ? "Unknown Caller"
    : letterhead.caller_name || "Unknown Caller";
  const displaySubtitle = hideCallerIdentity ? null : letterhead.caller_subtitle;
  const displayPhoneNumber = hideCallerIdentity ? null : letterhead.phone_number;
  const initials = hideCallerIdentity ? "?" : callerInitials(letterhead.caller_name);
  const headerLabel = isPhoneMenu ? "Phone menu — automated line" : "New voicemail";

  // Reset on letterhead change
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    a.muted = false;
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setShowTranscript(false);
    setShowDetails(false);
    setMuted(false);
    setSpeedIdx(1);
  }, [letterhead.audio_url]);

  // Apply playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = VOICEMAIL_SPEEDS[speedIdx];
  }, [speedIdx]);

  // External replay trigger (e.g. user pressed the "hear options again" keypad key)
  useEffect(() => {
    if (!replayNonce) return;
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }, [replayNonce]);

  const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % VOICEMAIL_SPEEDS.length);

  const toggleMuted = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.play().catch(() => {});
    }
  };

  const onLoaded = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };
  const onTime = () => {
    if (audioRef.current) setCurrent(audioRef.current.currentTime || 0);
  };
  const onSeek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const next = (Number(e.target.value) / 1000) * duration;
    a.currentTime = next;
    setCurrent(next);
  };
  const onEnded = () => {
    setPlaying(false);
    setCurrent(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const progressValue = duration ? Math.min(1000, Math.round((current / duration) * 1000)) : 0;
  const shownDuration = letterhead.duration || (duration ? formatTime(duration) : "");

  // Unified indigo→violet brand gradient for every voicemail card.
  const headerTimeLabel = letterhead.time_label
    ? letterhead.time_label.toUpperCase()
    : null;

  // Deterministic waveform bars (50 bars, varying heights).
  const WAVE_BARS = 56;
  const waveHeights = React.useMemo(() => {
    const out = [];
    let seed = (letterhead.audio_url || letterhead.caller_name || "x")
      .split("")
      .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7);
    for (let i = 0; i < WAVE_BARS; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const r = (seed % 1000) / 1000; // 0..1
      // Bias toward middle: combine with sine for a "speech-like" envelope.
      const envelope = Math.sin((i / WAVE_BARS) * Math.PI) * 0.6 + 0.4;
      const h = 0.25 + r * 0.75 * envelope; // 0.25..1
      out.push(Math.max(0.15, Math.min(1, h)));
    }
    return out;
  }, [letterhead.audio_url, letterhead.caller_name]);

  const playedFraction = duration ? Math.min(1, current / duration) : 0;
  const playedBars = Math.round(playedFraction * WAVE_BARS);

  // Click on waveform to seek.
  const waveRef = useRef(null);
  const onWaveClick = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = waveRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = x / rect.width;
    a.currentTime = ratio * duration;
    setCurrent(ratio * duration);
  };

  const remainingTime = duration
    ? `-${formatTime(Math.max(0, duration - current))}`
    : shownDuration
    ? `-${shownDuration}`
    : "-0:00";

  return (
    <div className="voicemail-player-card">
      <div className="voicemail-player-caller">
        <div className="voicemail-player-avatar" aria-hidden="true">
          {hideCallerIdentity ? (
            <UserRound className="w-10 h-10" strokeWidth={1.7} />
          ) : (
            <span className="font-display text-lg font-extrabold">{initials}</span>
          )}
        </div>

        <div className="voicemail-player-caller-copy">
          <h2>{displayCallerName}</h2>
          <p>{displayPhoneNumber || "Private number"}</p>
          {displaySubtitle ? <p>{displaySubtitle}</p> : null}
          {headerTimeLabel ? <p>{letterhead.time_label}</p> : null}
        </div>

        <span className="voicemail-player-call-icon" aria-hidden="true">
          <PhoneCall className="w-6 h-6" fill="currentColor" />
        </span>
      </div>

      <div className="voicemail-player-audio-shell">
        <div className="voicemail-player-audio-row">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!hasAudio}
            data-testid="voicemail-play-button"
            aria-label={playing ? "Pause voicemail" : "Play voicemail"}
            className="voicemail-player-primary-play"
          >
            {playing ? (
              <Pause className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Play className="w-6 h-6 translate-x-px" fill="currentColor" aria-hidden="true" />
            )}
          </button>

          <div
            ref={waveRef}
            onClick={onWaveClick}
            aria-hidden="true"
            className={`voicemail-player-waveform ${hasAudio && duration ? "is-seekable" : ""}`}
          >
            {waveHeights.map((height, index) => {
              const played = index < playedBars;
              const interpolation = index / Math.max(1, WAVE_BARS - 1);
              const red = Math.round(0x25 + (0xEC - 0x25) * interpolation);
              const green = Math.round(0x63 + (0x48 - 0x63) * interpolation);
              const blue = Math.round(0xEB + (0x99 - 0xEB) * interpolation);
              return (
                <span
                  key={index}
                  style={{
                    height: `${Math.round(height * 100)}%`,
                    background: `rgb(${red}, ${green}, ${blue})`,
                    opacity: played ? 1 : 0.3,
                  }}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={cycleSpeed}
            disabled={!hasAudio}
            data-testid="voicemail-speed-button"
            aria-label={`Playback speed ${VOICEMAIL_SPEEDS[speedIdx]}x. Click to change.`}
            title="Change playback speed"
            className="voicemail-player-speed"
          >
            {VOICEMAIL_SPEEDS[speedIdx]}×
          </button>
        </div>

        <div className="voicemail-player-times" aria-hidden="true">
          <span>{formatTime(current)}</span>
          <span>{remainingTime}</span>
        </div>
      </div>

      <div className="voicemail-player-timeline">
        <span>{formatTime(current)}</span>
        <input
          type="range"
          min="0"
          max="1000"
          step="1"
          value={progressValue}
          onChange={onSeek}
          disabled={!hasAudio || !duration}
          aria-label="Voicemail timeline"
          data-testid="voicemail-scrubber"
        />
        <span>{remainingTime}</span>
      </div>

      <div className="voicemail-player-media-controls" aria-label="Voicemail media controls">
        <button
          type="button"
          disabled
          aria-label="Share voicemail unavailable"
          title="Share unavailable"
        >
          <Share2 className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious || !onPrevious}
          aria-label="Previous voicemail"
          data-testid="previous-voicemail-button"
        >
          <SkipBack className="w-5 h-5" fill="currentColor" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!hasAudio}
          aria-label={playing ? "Pause voicemail" : "Play voicemail"}
        >
          {playing ? (
            <Pause className="w-6 h-6" fill="currentColor" aria-hidden="true" />
          ) : (
            <Play className="w-6 h-6" fill="currentColor" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={toggleMuted}
          disabled={!hasAudio}
          aria-label={muted ? "Unmute voicemail" : "Mute voicemail"}
          aria-pressed={muted}
        >
          {muted ? (
            <VolumeX className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Volume2 className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          disabled
          aria-label="Delete voicemail unavailable"
          title="Delete unavailable"
        >
          <Trash2 className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {hasAudio ? (
        <audio
          ref={audioRef}
          src={letterhead.audio_url}
          preload="metadata"
          onLoadedMetadata={onLoaded}
          onTimeUpdate={onTime}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={onEnded}
        />
      ) : null}

      <div className="voicemail-player-bottom">
        <div className="voicemail-player-bottom-actions">
          <button
            type="button"
            onClick={() => setShowTranscript((value) => !value)}
            disabled={!letterhead.transcript}
            data-testid="voicemail-transcript-toggle"
            aria-expanded={showTranscript}
            aria-controls="voicemail-transcript-panel"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            {showTranscript ? "Hide transcript" : "Show transcript"}
          </button>
          <button
            type="button"
            onClick={() => setShowDetails((value) => !value)}
            aria-expanded={showDetails}
            aria-controls="voicemail-caller-details"
            data-testid="voicemail-caller-details-toggle"
          >
            <Info className="w-4 h-4" aria-hidden="true" />
            Caller details
          </button>
        </div>

        {showTranscript && letterhead.transcript ? (
          <div
            id="voicemail-transcript-panel"
            className="voicemail-player-drawer whitespace-pre-line"
            data-testid="voicemail-transcript"
          >
            {letterhead.transcript}
          </div>
        ) : null}

        {showDetails ? (
          <div
            id="voicemail-caller-details"
            className="voicemail-player-drawer"
            data-testid="voicemail-caller-details"
          >
            {hideCallerIdentity ? (
              <p>
                Caller identity is hidden during this listening task. Listen for who called
                and why.
              </p>
            ) : (
              <dl className="voicemail-player-detail-list">
                <dt>Caller</dt>
                <dd>{letterhead.caller_name || "Unknown Caller"}</dd>
                <dt>Number</dt>
                <dd>{letterhead.phone_number || "Not provided"}</dd>
                <dt>Context</dt>
                <dd>{letterhead.caller_subtitle || headerLabel}</dd>
                <dt>Received</dt>
                <dd>{letterhead.time_label || "Not provided"}</dd>
              </dl>
            )}
          </div>
        ) : null}

        {!hasAudio ? (
          <p className="voicemail-player-audio-unavailable">Audio coming soon.</p>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- Highlight tool ---------- */
const HL_COLORS = {
  yellow: "rgba(254, 240, 138, 0.75)",
  green: "rgba(187, 247, 208, 0.75)",
  pink: "rgba(251, 207, 232, 0.75)",
};

function applyHighlight(range, color) {
  if (!range || range.collapsed) return;
  const root = range.commonAncestorContainer;
  const rootEl = root.nodeType === 1 ? root : root.parentNode;
  if (!rootEl) return;

  // Collect text nodes that intersect the range.
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (!range.intersectsNode(n)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  let n = walker.nextNode();
  while (n) {
    nodes.push(n);
    n = walker.nextNode();
  }

  for (const tn of nodes) {
    const r = document.createRange();
    if (tn === range.startContainer && tn === range.endContainer) {
      r.setStart(tn, range.startOffset);
      r.setEnd(tn, range.endOffset);
    } else if (tn === range.startContainer) {
      r.setStart(tn, range.startOffset);
      r.setEnd(tn, tn.nodeValue.length);
    } else if (tn === range.endContainer) {
      r.setStart(tn, 0);
      r.setEnd(tn, range.endOffset);
    } else {
      r.selectNodeContents(tn);
    }
    if (r.collapsed) continue;
    const mark = document.createElement("mark");
    mark.className = "soniva-hl";
    mark.style.backgroundColor = color;
    mark.style.color = "inherit";
    mark.style.padding = "0";
    mark.style.borderRadius = "2px";
    try {
      r.surroundContents(mark);
    } catch {
      try {
        const frag = r.extractContents();
        mark.appendChild(frag);
        r.insertNode(mark);
      } catch {
        /* skip */
      }
    }
  }
}

function eraseHighlights(range, root) {
  if (!root) return;
  const marks = Array.from(root.querySelectorAll("mark.soniva-hl"));
  for (const m of marks) {
    if (range && !range.collapsed && !range.intersectsNode(m)) continue;
    const parent = m.parentNode;
    if (!parent) continue;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
    parent.normalize();
  }
}

function HighlightToolbar({ tool, onChange }) {
  const colors = [
    { id: "yellow", swatch: "#FDE68A" },
    { id: "green", swatch: "#86EFAC" },
    { id: "pink", swatch: "#F9A8D4" },
  ];
  return (
    <div
      className="absolute -left-12 top-1 flex flex-col items-center gap-1.5 z-10"
      data-testid="highlight-toolbar"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="rounded-full bg-white border border-zinc-200 shadow-sm p-1.5 flex flex-col items-center gap-1.5">
        <div className="w-7 h-7 rounded-full grid place-items-center text-zinc-500" title="Highlighter">
          <Highlighter className="w-3.5 h-3.5" />
        </div>
        {colors.map((c) => {
          const active = tool === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(active ? null : c.id)}
              className={`w-7 h-7 rounded-full transition border ${
                active ? "ring-2 ring-indigo-500 border-white scale-110" : "border-zinc-200 hover:scale-105"
              }`}
              style={{ background: c.swatch }}
              data-testid={`hl-${c.id}`}
              aria-label={`Highlight ${c.id}`}
              aria-pressed={active}
            />
          );
        })}
        <div className="w-6 h-px bg-zinc-200 my-0.5" />
        <button
          type="button"
          onClick={() => onChange(tool === "erase" ? null : "erase")}
          className={`w-7 h-7 rounded-full grid place-items-center transition border ${
            tool === "erase"
              ? "ring-2 ring-indigo-500 bg-zinc-900 text-white border-white"
              : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          }`}
          data-testid="hl-erase"
          aria-label="Eraser"
          aria-pressed={tool === "erase"}
          title="Eraser"
        >
          <Eraser className="w-3.5 h-3.5" />
        </button>
      </div>
      {tool ? (
        <div className="text-[10px] font-display font-semibold uppercase tracking-wider text-zinc-500 mt-1">
          {tool === "erase" ? "Erase" : "Highlight"}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Dispatcher ---------- */
const VARIANTS = {
  orion: OrionLetterhead,
  maple: MapleLetterhead,
  westside: WestsideLetterhead,
  clearview: ClearviewLetterhead,
  "clearview-amber": ClearviewAmberLetterhead,
  meadow: MeadowLetterhead,
  northfield: NorthfieldLetterhead,
  lakeside: LakesideLetterhead,
  soundwell: SoundwellLetterhead,
  willowbank: WillowbankLetterhead,
  greenhill: GreenhillLetterhead,
  riverbank: RiverbankLetterhead,
  "riverbank-red": RiverbankRedLetterhead,
  oakwood: OakwoodLetterhead,
  highfield: HighfieldLetterhead,
  parkview: ParkviewLetterhead,
  elmtree: ElmtreeLetterhead,
  "meadow-rx": MeadowRxLabel,
  "oakwood-rx": OakwoodRxLabel,
  "brightside-rx": BrightsideRxLabel,
  "maple-rx": MapleRxLabel,
  "clearview-rx": ClearviewRxLabel,
  "parkview-rx": ParkviewRxLabel,
  "northfield-rx": NorthfieldRxLabel,
  "highfield-rx": HighfieldRxLabel,
  "willowbank-rx": WillowbankRxLabel,
  "soundwell-rx": SoundwellRxLabel,
  "relievex-pkg": RelievexPackageLabel,
  "paxolin-pkg": PaxolinPackageLabel,
  "allergex-pkg": AllergexPackageLabel,
  "rexazid-pkg": RexazidPackageLabel,
  "throatmin-pkg": ThroatminPackageLabel,
};

export function LetterheadView({
  letterhead,
  replayNonce = 0,
  onPrevious,
  hasPrevious = false,
}) {
  const key = letterhead.variant || (letterhead.logo === "orion" ? "orion" : "orion");
  const Component = VARIANTS[key] || OrionLetterhead;
  const scrollRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [tool, setTool] = useState(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const overflow = el.scrollHeight - el.clientHeight > 4;
      setHasOverflow(overflow);
      setAtBottom(overflow && el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [letterhead]);

  // Selection-based highlighter / eraser inside the letter card.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !tool) return;
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const anchor = range.commonAncestorContainer;
      const anchorEl = anchor.nodeType === 1 ? anchor : anchor.parentNode;
      if (!anchorEl || !root.contains(anchorEl)) return;
      if (tool === "erase") {
        eraseHighlights(range, root);
      } else if (HL_COLORS[tool]) {
        applyHighlight(range, HL_COLORS[tool]);
      }
      sel.removeAllRanges();
    };
    root.addEventListener("mouseup", handler);
    root.addEventListener("touchend", handler);
    return () => {
      root.removeEventListener("mouseup", handler);
      root.removeEventListener("touchend", handler);
    };
  }, [tool]);

  const showHint = hasOverflow && !atBottom;
  const cursorClass =
    tool === "erase"
      ? "cursor-cell"
      : tool && HL_COLORS[tool]
      ? "cursor-text"
      : "";

  const isLabel = letterhead.format === "label";
  const wrapperStyle = isLabel
    ? { maxWidth: "780px" }
    : { aspectRatio: "1 / 1.3", maxWidth: "640px" };

  // AI-rendered product shot (image_url) — replace the React carton entirely.
  // Highlight tool is unavailable for these (image, not text).
  if (letterhead.image_url) {
    return (
      <div
        className="w-full mx-auto relative"
        style={{ maxWidth: "780px" }}
        data-testid="letterhead"
      >
        <img
          src={letterhead.image_url}
          alt={letterhead.image_alt || "Medication package render"}
          className="w-full h-auto block rounded-xl select-none"
          draggable={false}
          data-testid="letterhead-image"
        />
      </div>
    );
  }

  // Voicemail card — phone-inbox UI with audio playback + transcript toggle.
  if (letterhead.format === "voicemail" || letterhead.format === "phone-menu") {
    return (
      <div
        className="w-full mx-auto relative"
        style={{ maxWidth: "640px" }}
        data-testid="letterhead"
      >
        <VoicemailCard
          letterhead={letterhead}
          replayNonce={replayNonce}
          onPrevious={onPrevious}
          hasPrevious={hasPrevious}
        />
      </div>
    );
  }

  // Labels size to content (so nothing gets clipped); letters use a fixed
  // aspect-ratio box with internal scrolling.
  if (isLabel) {
    return (
      <div
        className="w-full mx-auto relative"
        style={wrapperStyle}
        data-testid="letterhead"
      >
        <HighlightToolbar tool={tool} onChange={setTool} />
        <div ref={scrollRef} className={`rounded-xl ${cursorClass}`}>
          <Component letterhead={letterhead} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full mx-auto relative"
      style={wrapperStyle}
      data-testid="letterhead"
    >
      <HighlightToolbar tool={tool} onChange={setTool} />
      <div
        ref={scrollRef}
        className={`absolute inset-0 overflow-y-auto rounded-xl ${cursorClass}`}
      >
        <Component letterhead={letterhead} />
      </div>
      <div
        className={`pointer-events-none absolute left-0 right-0 bottom-0 h-14 rounded-b-xl flex items-end justify-center pb-2 transition-opacity duration-300 ${
          showHint ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0) 100%)",
        }}
        aria-hidden
      >
        <div
          className="inline-flex items-center gap-1 text-[11px] font-display font-semibold text-zinc-600 bg-white/80 backdrop-blur rounded-full px-2.5 py-1 border border-zinc-200 shadow-sm"
          data-testid="scroll-more-hint"
        >
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          Scroll for more
        </div>
      </div>
    </div>
  );
}
