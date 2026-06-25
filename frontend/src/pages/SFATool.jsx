import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";
import { Header } from "@/components/Header";
import { AudioControls } from "@/components/AudioControls";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Brain, ChevronRight, Eye, EyeOff, Shuffle } from "lucide-react";

const FEATURES = [
  { key: "group", label: "Group", question: "What group does it belong to?" },
  { key: "use", label: "Use", question: "What is it used for?" },
  { key: "action", label: "Action", question: "What does it do or what do you do with it?" },
  { key: "location", label: "Location", question: "Where do you find it?" },
  { key: "properties", label: "Properties", question: "What is it like? (size, colour, feel)" },
  { key: "association", label: "Association", question: "What does it remind you of?" },
];

export default function SFATool() {
  const [words, setWords] = useState([]);
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState({});
  const { logActivity, logCue } = useSession();

  useEffect(() => {
    api.get("/sfa/words").then(({ data }) => setWords(data));
    logActivity({
      category: "sfa-therapy",
      activity_slug: "sfa-tool",
      activity_title: "SFA Therapy Tool",
    });
  }, [logActivity]);

  const word = words[idx];

  const next = () => {
    setReveal({});
    setIdx((idx + 1) % words.length);
  };
  const shuffle = () => {
    setReveal({});
    setIdx(Math.floor(Math.random() * words.length));
  };

  const toggleReveal = (key) => {
    setReveal((r) => {
      const nv = !r[key];
      if (nv) {
        logCue({
          category: "sfa-therapy",
          activity_slug: "sfa-tool",
          activity_title: "SFA Therapy Tool",
          cue_type: "hint",
          detail: `${key}: ${word?.[key] ?? ""}`,
        });
      }
      return { ...r, [key]: nv };
    });
  };

  return (
    <div className="min-h-screen" data-testid="sfa-page">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 flex-wrap" data-testid="breadcrumb-header">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-zinc-600 hover:text-indigo-600 font-display font-medium"
            data-testid="back-to-hub"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <span className="hidden sm:inline-block w-px h-4 bg-zinc-300" />
          <nav className="flex items-center gap-1.5 text-sm text-zinc-500 flex-wrap" aria-label="Breadcrumb">
            <Link to="/dashboard" className="hover:text-indigo-600 hover:underline underline-offset-2 transition" data-testid="breadcrumb-crumb-0">
              Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-900 font-display font-semibold" data-testid="breadcrumb-crumb-1">
              SFA Therapy Tool
            </span>
          </nav>
        </div>

        <div className="mt-8 flex items-center gap-4 fade-up">
          <div className="icon-bubble" style={{ "--bubble-bg": "#FFF1F2", "--bubble-fg": "#F43F5E" }}>
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">SFA Therapy Tool</h1>
            <p className="text-zinc-600 mt-1">
              Semantic Feature Analysis. Pick a word, explore six features, then say it aloud.
            </p>
          </div>
        </div>

        {!word ? (
          <div className="mt-10 text-zinc-500">Loading words…</div>
        ) : (
          <>
            <section className="mt-10 fade-up delay-1 border border-zinc-200 rounded-3xl bg-white p-8" data-testid="sfa-card">
              <div className="text-sm uppercase tracking-wider text-rose-500 font-semibold">Target word</div>
              <div className="font-display text-5xl sm:text-6xl font-extrabold mt-2" data-testid="sfa-target-word">
                {word.word}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <AudioControls text={word.word} />
                <Button
                  variant="outline"
                  onClick={shuffle}
                  className="rounded-full font-display h-12 px-5"
                  data-testid="sfa-shuffle-btn"
                >
                  <Shuffle className="w-4 h-4 mr-2" /> Random word
                </Button>
                <Button
                  onClick={next}
                  className="rounded-full font-display h-12 px-5 bg-indigo-600 hover:bg-indigo-700"
                  data-testid="sfa-next-btn"
                >
                  Next word <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </section>

            <section className="mt-8 grid sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.key}
                  className="border border-zinc-200 rounded-2xl bg-white p-5"
                  data-testid={`sfa-feature-${f.key}`}
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{f.label}</div>
                  <div className="font-display font-semibold text-lg mt-1">{f.question}</div>
                  <div className="mt-3 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => toggleReveal(f.key)}
                      className="rounded-full h-10 px-4 font-display"
                      data-testid={`sfa-reveal-${f.key}`}
                    >
                      {reveal[f.key] ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {reveal[f.key] ? "Hide" : "Show"} hint
                    </Button>
                    <AudioControls text={`${f.label}. ${f.question}`} />
                  </div>
                  {reveal[f.key] ? (
                    <div className="mt-3 text-zinc-700">
                      <strong>Hint:</strong> {word[f.key]}
                    </div>
                  ) : null}
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
