import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { Button } from "./ui/button";
import { Volume2, Mic, Square, Loader2 } from "lucide-react";

/**
 * AudioControls
 *  - "Listen" button uses backend OpenAI TTS to play prompt audio
 *  - "Record" button captures voice using MediaRecorder, optional Whisper transcription
 */
export function AudioControls({ text, onTranscript, audioSrc }) {
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const playTTS = async () => {
    if (!text && !audioSrc) return;
    setLoadingTTS(true);
    try {
      let audio;
      if (audioSrc) {
        audio = new Audio(audioSrc);
      } else {
        const { data } = await api.post("/tts", { text, voice: "nova" });
        audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
      }
      audioRef.current = audio;
      await audio.play();
    } catch (e) {
      alert("Could not play audio. Please try again.");
    } finally {
      setLoadingTTS(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (onTranscript) {
          setTranscribing(true);
          try {
            const fd = new FormData();
            fd.append("file", blob, "recording.webm");
            const { data } = await api.post("/transcribe", fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            onTranscript(data.text || "");
          } catch (err) {
            onTranscript("");
            alert("Could not transcribe audio.");
          } finally {
            setTranscribing(false);
          }
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (err) {
      alert("Microphone permission required to record.");
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    setRecording(false);
  };

  return (
    <div className="flex flex-wrap gap-3" data-testid="audio-controls">
      <Button
        type="button"
        onClick={playTTS}
        disabled={loadingTTS || (!text && !audioSrc)}
        className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-12 px-5"
        data-testid="tts-play-btn"
      >
        {loadingTTS ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
        Listen
      </Button>

      {!recording ? (
        <Button
          type="button"
          variant="outline"
          onClick={startRecording}
          disabled={transcribing}
          className="rounded-full font-display h-12 px-5 border-zinc-300"
          data-testid="record-start-btn"
        >
          {transcribing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mic className="w-4 h-4 mr-2" />}
          {transcribing ? "Transcribing…" : "Record me"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={stopRecording}
          className="rounded-full font-display h-12 px-5 bg-rose-600 hover:bg-rose-700"
          data-testid="record-stop-btn"
        >
          <Square className="w-4 h-4 mr-2" /> Stop
        </Button>
      )}
    </div>
  );
}
