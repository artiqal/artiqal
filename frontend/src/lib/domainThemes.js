import {
  BookOpen,
  Brain,
  Gamepad2,
  Headphones,
  MessageCircle,
  Mic2,
  Pencil,
  Speech,
  Type,
  UtensilsCrossed,
} from "lucide-react";

/*
 * CATEGORY THEME GUARDRAIL
 * Every therapy domain/category that appears in the Activities Hub or sidebar must
 * be added here with a complete visual theme before it ships. Do not rely on the
 * fallback for final categories; it exists only as a safety net while developing.
 *
 * Before adding a new category, check existing assigned colours and choose a
 * distinct domain family. Good future options to preserve:
 * Cognitive Communication = amber/gold, RHD = slate blue/periwinkle,
 * Social Communication = warm peach, Functional Simulations = deep aqua/ocean,
 * Memory = soft sky blue, Executive Function = graphite/blue-grey,
 * AAC = emerald/mint, Fluency = soft red/raspberry,
 * Swallow Education = sage/clinical green.
 */
export const DOMAIN_THEMES = {
  "word-finding": {
    name: "Word Finding",
    accent: "#6D5DFB",
    dot: "#6D5DFB",
    hoverGlow: "#9B6DFF",
    softBg: "rgba(109, 93, 251, 0.10)",
    sidebarActiveBg: "rgba(109, 93, 251, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(109,93,251,0.16), rgba(56,189,248,0.12))",
    blobGradient:
      "radial-gradient(circle at 32% 24%, rgba(255,255,255,.48), transparent 30%), radial-gradient(ellipse at 58% 42%, rgba(144,94,255,.62), transparent 52%), radial-gradient(ellipse at 38% 72%, rgba(214,96,255,.44), transparent 48%), linear-gradient(135deg, rgba(122,96,255,.72), rgba(230,179,255,.42))",
    bannerGradient:
      "radial-gradient(circle at 28% 0%, rgba(255,255,255,.42), transparent 28%), radial-gradient(circle at 54% 8%, rgba(255,117,201,.40), transparent 24%), radial-gradient(circle at 78% 18%, rgba(181,132,255,.30), transparent 28%), linear-gradient(120deg,#8377f7 0%,#55c2f4 52%,#34b9e8 100%)",
  },
  reading: {
    name: "Reading",
    accent: "#2563EB",
    dot: "#2563EB",
    hoverGlow: "#38A7F8",
    softBg: "rgba(37, 99, 235, 0.10)",
    sidebarActiveBg: "rgba(37, 99, 235, 0.11)",
    iconTint: "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(56,189,248,0.12))",
    blobGradient:
      "radial-gradient(circle at 36% 24%, rgba(255,255,255,.5), transparent 30%), radial-gradient(ellipse at 58% 48%, rgba(37,145,255,.66), transparent 54%), radial-gradient(ellipse at 36% 76%, rgba(132,212,255,.42), transparent 50%), linear-gradient(135deg, rgba(37,99,235,.68), rgba(190,233,255,.46))",
    bannerGradient:
      "radial-gradient(circle at 22% 8%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(147,197,253,.34), transparent 30%), linear-gradient(135deg,#2563EB 0%,#38BDF8 100%)",
  },
  writing: {
    name: "Writing",
    accent: "#F97316",
    dot: "#F97316",
    hoverGlow: "#14B8A6",
    softBg: "rgba(249, 115, 22, 0.11)",
    sidebarActiveBg: "rgba(249, 115, 22, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(249,115,22,0.16), rgba(251,113,133,0.12))",
    blobGradient:
      "radial-gradient(circle at 34% 24%, rgba(255,255,255,.48), transparent 30%), radial-gradient(ellipse at 52% 44%, rgba(255,156,37,.66), transparent 54%), radial-gradient(ellipse at 70% 72%, rgba(255,112,128,.42), transparent 48%), linear-gradient(135deg, rgba(255,154,45,.72), rgba(255,198,173,.46))",
    bannerGradient:
      "radial-gradient(circle at 18% 10%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(253,164,175,.32), transparent 30%), linear-gradient(135deg,#F97316 0%,#FB7185 100%)",
  },
  "auditory-comprehension": {
    name: "Listening",
    accent: "#0891B2",
    dot: "#0891B2",
    hoverGlow: "#9B6DFF",
    softBg: "rgba(8, 145, 178, 0.10)",
    sidebarActiveBg: "rgba(8, 145, 178, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(8,145,178,0.16), rgba(59,130,246,0.12))",
    blobGradient:
      "radial-gradient(circle at 36% 24%, rgba(255,255,255,.5), transparent 30%), radial-gradient(ellipse at 58% 44%, rgba(14,180,224,.62), transparent 54%), radial-gradient(ellipse at 38% 76%, rgba(96,165,250,.42), transparent 48%), linear-gradient(135deg, rgba(6,182,212,.68), rgba(191,231,255,.46))",
    bannerGradient:
      "radial-gradient(circle at 20% 10%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(125,211,252,.30), transparent 30%), linear-gradient(135deg,#06B6D4 0%,#3B82F6 100%)",
  },
  "functional-communication": {
    name: "Functional Tasks",
    accent: "#D97706",
    dot: "#D97706",
    hoverGlow: "#F59E0B",
    softBg: "rgba(217, 119, 6, 0.10)",
    sidebarActiveBg: "rgba(217, 119, 6, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,113,133,0.12))",
    blobGradient:
      "radial-gradient(circle at 32% 24%, rgba(255,255,255,.46), transparent 30%), radial-gradient(ellipse at 50% 48%, rgba(255,179,43,.66), transparent 54%), radial-gradient(ellipse at 72% 42%, rgba(255,119,98,.38), transparent 50%), linear-gradient(135deg, rgba(255,194,71,.66), rgba(255,175,153,.46))",
    bannerGradient:
      "radial-gradient(circle at 18% 10%, rgba(255,255,255,.38), transparent 28%), radial-gradient(circle at 78% 18%, rgba(251,146,60,.34), transparent 30%), radial-gradient(circle at 52% 92%, rgba(251,191,36,.24), transparent 34%), linear-gradient(135deg,#FDBA74 0%,#F59E0B 48%,#FB7185 100%)",
  },
  games: {
    name: "Games",
    accent: "#16A34A",
    dot: "#16A34A",
    hoverGlow: "#22C55E",
    softBg: "rgba(22, 163, 74, 0.10)",
    sidebarActiveBg: "rgba(22, 163, 74, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(22,163,74,0.16), rgba(20,184,166,0.12))",
    blobGradient:
      "radial-gradient(circle at 34% 24%, rgba(255,255,255,.5), transparent 30%), radial-gradient(ellipse at 52% 46%, rgba(34,211,113,.62), transparent 54%), radial-gradient(ellipse at 70% 70%, rgba(45,212,191,.4), transparent 48%), linear-gradient(135deg, rgba(34,197,94,.66), rgba(187,247,208,.48))",
    bannerGradient:
      "radial-gradient(circle at 18% 10%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(134,239,172,.28), transparent 30%), linear-gradient(135deg,#22C55E 0%,#14B8A6 100%)",
  },
  dysphagia: {
    name: "Dysphagia",
    accent: "#0F766E",
    dot: "#0F766E",
    hoverGlow: "#0E7490",
    softBg: "rgba(15, 118, 110, 0.10)",
    sidebarActiveBg: "rgba(15, 118, 110, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(15,118,110,0.16), rgba(132,204,22,0.10))",
    blobGradient:
      "radial-gradient(circle at 34% 24%, rgba(255,255,255,.5), transparent 30%), radial-gradient(ellipse at 52% 48%, rgba(20,184,166,.62), transparent 54%), radial-gradient(ellipse at 70% 68%, rgba(125,211,252,.38), transparent 48%), linear-gradient(135deg, rgba(45,212,191,.66), rgba(205,250,229,.48))",
    bannerGradient:
      "radial-gradient(circle at 20% 10%, rgba(255,255,255,.32), transparent 28%), radial-gradient(circle at 82% 18%, rgba(45,212,191,.26), transparent 30%), linear-gradient(135deg,#0F766E 0%,#2DD4BF 100%)",
  },
  "motor-speech": {
    name: "Motor Speech",
    accent: "#F05A3C",
    dot: "#F05A3C",
    hoverGlow: "#F05A3C",
    softBg: "rgba(240, 90, 60, 0.10)",
    sidebarActiveBg: "rgba(240, 90, 60, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(240,90,60,0.16), rgba(251,146,60,0.12))",
    blobGradient:
      "radial-gradient(circle at 34% 24%, rgba(255,255,255,.48), transparent 30%), radial-gradient(ellipse at 52% 48%, rgba(255,92,76,.66), transparent 54%), radial-gradient(ellipse at 72% 36%, rgba(255,177,112,.4), transparent 50%), linear-gradient(135deg, rgba(255,95,76,.68), rgba(255,199,171,.46))",
    bannerGradient:
      "radial-gradient(circle at 20% 10%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(251,146,60,.30), transparent 30%), linear-gradient(135deg,#F05A3C 0%,#FB923C 100%)",
  },
  voice: {
    name: "Voice",
    accent: "#EF233C",
    dot: "#EF233C",
    hoverGlow: "#EF233C",
    softBg: "rgba(239, 35, 60, 0.10)",
    sidebarActiveBg: "rgba(239, 35, 60, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(239,35,60,0.16), rgba(248,113,113,0.11))",
    blobGradient:
      "radial-gradient(circle at 34% 24%, rgba(255,255,255,.46), transparent 30%), radial-gradient(ellipse at 52% 46%, rgba(239,35,60,.7), transparent 54%), radial-gradient(ellipse at 72% 70%, rgba(255,128,105,.38), transparent 50%), linear-gradient(135deg, rgba(239,35,60,.7), rgba(255,183,168,.46))",
    bannerGradient:
      "radial-gradient(circle at 20% 10%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(248,113,113,.28), transparent 30%), linear-gradient(135deg,#EF233C 0%,#F87171 100%)",
  },
  "cognitive-communication": {
    name: "Cognitive Communication",
    accent: "#7A853A",
    dot: "#7A853A",
    hoverGlow: "#A3A94A",
    softBg: "rgba(122, 133, 58, 0.11)",
    sidebarActiveBg: "rgba(122, 133, 58, 0.13)",
    iconTint: "linear-gradient(135deg, rgba(122,133,58,0.16), rgba(234,179,8,0.11))",
    blobGradient:
      "radial-gradient(circle at 34% 24%, rgba(255,255,255,.48), transparent 30%), radial-gradient(ellipse at 52% 50%, rgba(122,133,58,.58), transparent 54%), radial-gradient(ellipse at 72% 38%, rgba(234,179,8,.28), transparent 50%), linear-gradient(135deg, rgba(122,133,58,.52), rgba(235,224,142,.38))",
    bannerGradient:
      "radial-gradient(circle at 22% 12%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 78% 18%, rgba(235,224,142,.28), transparent 30%), linear-gradient(135deg,#7A853A 0%,#A3A94A 54%,#D7C864 100%)",
  },
  "ai-practice": {
    name: "AI Practice",
    accent: "#7C3AED",
    dot: "#7C3AED",
    hoverGlow: "#F472B6",
    softBg: "rgba(124, 58, 237, 0.10)",
    sidebarActiveBg: "rgba(124, 58, 237, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(45,212,191,0.14), rgba(124,58,237,0.14), rgba(251,146,60,0.12))",
    blobGradient:
      "radial-gradient(circle at 34% 24%, rgba(255,255,255,.46), transparent 30%), radial-gradient(ellipse at 42% 54%, rgba(45,212,191,.48), transparent 54%), radial-gradient(ellipse at 64% 40%, rgba(244,114,182,.54), transparent 52%), radial-gradient(ellipse at 72% 72%, rgba(251,191,36,.38), transparent 48%), linear-gradient(135deg, rgba(45,212,191,.42), rgba(124,58,237,.34), rgba(251,146,60,.32))",
    bannerGradient:
      "radial-gradient(circle at 22% 14%, rgba(45,212,191,.30), transparent 30%), radial-gradient(circle at 56% 30%, rgba(244,114,182,.32), transparent 32%), radial-gradient(circle at 82% 70%, rgba(251,191,36,.28), transparent 30%), linear-gradient(135deg,#22D3EE 0%,#8B5CF6 48%,#FB7185 100%)",
  },
  "sfa-therapy": {
    name: "SFA Therapy Tool",
    accent: "#C026D3",
    dot: "#C026D3",
    hoverGlow: "#C026D3",
    softBg: "rgba(192, 38, 211, 0.10)",
    sidebarActiveBg: "rgba(192, 38, 211, 0.12)",
    iconTint: "linear-gradient(135deg, rgba(236,72,153,0.16), rgba(168,85,247,0.14))",
    blobGradient:
      "radial-gradient(circle at 34% 24%, rgba(255,255,255,.48), transparent 30%), radial-gradient(ellipse at 54% 46%, rgba(236,72,153,.64), transparent 54%), radial-gradient(ellipse at 72% 72%, rgba(168,85,247,.38), transparent 48%), linear-gradient(135deg, rgba(236,72,153,.68), rgba(216,180,254,.46))",
    bannerGradient:
      "radial-gradient(circle at 20% 10%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(244,114,182,.30), transparent 30%), linear-gradient(135deg,#EC4899 0%,#A855F7 100%)",
  },
};

export const DOMAIN_NAV_ITEMS = [
  {
    slug: "word-finding",
    name: "Word Finding",
    route: "/category/word-finding",
    sidebarIcon: Type,
    hubCardIcon: Type,
    fallback: "Naming, cueing, and associations",
  },
  {
    slug: "reading",
    name: "Reading",
    route: "/category/reading",
    sidebarIcon: BookOpen,
    hubCardIcon: BookOpen,
    fallback: "Reading comprehension practice",
  },
  {
    slug: "writing",
    name: "Writing",
    route: "/category/writing",
    sidebarIcon: Pencil,
    hubCardIcon: Pencil,
    fallback: "Spelling and written expression",
  },
  {
    slug: "auditory-comprehension",
    name: "Listening",
    route: "/category/auditory-comprehension",
    sidebarIcon: Headphones,
    hubCardIcon: Headphones,
    fallback: "Auditory comprehension tasks",
  },
  {
    slug: "functional-communication",
    name: "Functional Tasks",
    route: "/category/functional-communication",
    sidebarIcon: MessageCircle,
    hubCardIcon: MessageCircle,
    fallback: "Real-world conversations and everyday communication practice",
  },
  {
    slug: "games",
    name: "Games",
    route: "/explore/games",
    sidebarIcon: Gamepad2,
    hubCardIcon: Gamepad2,
    fallback: "Playful clinical practice",
  },
  {
    slug: "dysphagia",
    name: "Dysphagia",
    route: "/explore/dysphagia",
    sidebarIcon: UtensilsCrossed,
    hubCardIcon: UtensilsCrossed,
    fallback: "Swallowing support resources",
  },
  {
    slug: "motor-speech",
    name: "Motor Speech",
    route: "/explore/motor-speech",
    sidebarIcon: Speech,
    hubCardIcon: Speech,
    fallback: "Speech clarity and control",
  },
  {
    slug: "voice",
    name: "Voice",
    route: "/explore/voice",
    sidebarIcon: Mic2,
    hubCardIcon: Mic2,
    fallback: "Voice and resonance activities",
  },
  {
    slug: "cognitive-communication",
    name: "Cognitive Communication",
    route: "/category/cognitive-communication",
    sidebarIcon: Brain,
    hubCardIcon: Brain,
    fallback: "Memory, attention, problem-solving, and executive function activities.",
    tags: ["cognition", "memory", "attention", "executive function", "problem solving"],
    description: "Memory, attention, problem-solving, and executive function activities.",
  },
];

export const FUTURE_DOMAIN_COLOR_OPTIONS = [
  "Cognitive Communication = amber / gold",
  "RHD = slate blue / periwinkle",
  "Social Communication = warm peach",
  "Functional Simulations = deep aqua / ocean blue",
  "Memory = soft sky blue",
  "Executive Function = graphite / blue-grey",
  "AAC = emerald / mint",
  "Fluency = soft red / raspberry",
  "Swallow Education = sage / clinical green",
  "Reading & Writing combined = blue-orange gradient",
];

export const FALLBACK_DOMAIN_THEME = {
  name: "Activities",
  accent: "#6366F1",
  dot: "#6366F1",
  softBg: "rgba(99, 102, 241, 0.10)",
  sidebarActiveBg: "rgba(99, 102, 241, 0.12)",
  iconTint: "linear-gradient(135deg, rgba(99,102,241,0.16), rgba(6,182,212,0.12))",
  bannerGradient:
    "radial-gradient(circle at 20% 10%, rgba(255,255,255,.34), transparent 28%), linear-gradient(135deg,#6366F1 0%,#06B6D4 100%)",
};

export function getDomainTheme(slug) {
  return DOMAIN_THEMES[slug] || FALLBACK_DOMAIN_THEME;
}
