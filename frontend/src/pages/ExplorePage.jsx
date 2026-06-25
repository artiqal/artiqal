import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Gamepad2, Heart, Mic2, Speech, UtensilsCrossed } from "lucide-react";
import { Header } from "@/components/Header";
import { getDomainTheme } from "@/lib/domainThemes";

const pages = {
  games: {
    title: "Games",
    description: "Playful activities that build language, attention, and confidence.",
    icon: Gamepad2,
    links: [
      ["Name the Picture", "/activity/word-finding/naming"],
      ["Word Associations", "/activity/word-finding/associations"],
      ["Yes or No?", "/activity/auditory-comprehension/yes-no"],
    ],
  },
  dysphagia: {
    title: "Dysphagia",
    description: "A dedicated space for swallowing education and guided practice.",
    icon: UtensilsCrossed,
    links: [],
  },
  "motor-speech": {
    title: "Motor Speech",
    description: "Structured speech practice for clearer, more confident communication.",
    icon: Speech,
    links: [["Open SFA Therapy", "/sfa"]],
  },
  voice: {
    title: "Voice",
    description: "Listening and voice-focused practice for everyday communication.",
    icon: Mic2,
    links: [["Listening to a Voicemail", "/activity/functional-communication/voicemails"]],
  },
  favourites: {
    title: "Favourite Activities",
    description: "Your saved activities will appear here for quick access.",
    icon: Heart,
    links: [],
  },
};

export default function ExplorePage() {
  const { slug } = useParams();
  const page = pages[slug] || pages.games;
  const Icon = page.icon;
  const theme = getDomainTheme(slug);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="clinician-page">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-indigo-600">
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <section
          className="mt-7 rounded-[30px] border border-zinc-200 p-8 sm:p-11 shadow-sm relative overflow-hidden"
          style={{ background: slug === "favourites" ? "#fff" : theme.bannerGradient }}
        >
          <span
            className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-white/92"
            style={{
              color: theme.accent,
              background: slug === "favourites" ? "#EEF2FF" : "rgba(255,255,255,.9)",
              border: "1px solid rgba(255,255,255,.5)",
              boxShadow: "0 14px 28px -18px rgba(15,23,42,.28)",
            }}
          >
            <Icon size={31} />
          </span>
          <h1 className={`mt-6 font-display text-4xl sm:text-5xl font-bold tracking-tight ${slug === "favourites" ? "text-zinc-950" : "text-white"}`}>
            {page.title}
          </h1>
          <p className={`mt-3 text-lg max-w-2xl ${slug === "favourites" ? "text-zinc-600" : "text-white/90"}`}>
            {page.description}
          </p>

          {page.links.length ? (
            <div className="mt-9 grid sm:grid-cols-2 gap-4">
              {page.links.map(([label, href]) => (
                <Link key={href} to={href} className="tile flex items-center justify-between font-display font-semibold">
                  {label} <ArrowRight size={18} style={{ color: theme.accent }} />
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="mt-9 rounded-2xl px-6 py-5"
              style={{ background: slug === "favourites" ? "#EEF2FF" : "rgba(255,255,255,.88)", color: theme.accent }}
            >
              New activities are being prepared for this category.
              <Link to="/all-activities" className="ml-2 font-semibold underline underline-offset-4">Browse current activities</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
