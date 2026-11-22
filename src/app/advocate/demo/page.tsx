"use client";

import { FileText, Mic, MicOff, MonitorUp, PhoneOff, Send, ShieldCheck, Video, VideoOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { demoClaim as c, demoTotal, demoUser, inr } from "@/lib/demo";

const SCRIPT = [
  { from: "adv", text: "Hi Ananya, I'm Rahul Khanna. I've gone through your brief. The weather certificate is strong evidence." },
  { from: "adv", text: "For the damaged bag, keep the original case. The airline may ask to inspect it before settling." },
];

function CtrlButton({ on, label, onClick, children }: { on: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} className={`pressable flex size-11 items-center justify-center rounded-full ${on ? "bg-white/15 text-white" : "bg-white text-[#1d1d1f]"}`}>
      {children}
    </button>
  );
}

export default function ConsultRoom() {
  const [state, setState] = useState<"connecting" | "live" | "ended">("connecting");
  const [secs, setSecs] = useState(0);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(false);
  const [msgs, setMsgs] = useState<{ from: string; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setState("live"), 1400);
    const t2 = setTimeout(() => setMsgs([SCRIPT[0]]), 2600);
    const t3 = setTimeout(() => setMsgs(SCRIPT), 5200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (state !== "live") return;
    const i = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [state]);

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  async function toggleCam() {
    if (cam) {
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      setCam(false);
      return;
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCam(true);
      requestAnimationFrame(() => {
        if (video.current) video.current.srcObject = stream.current;
      });
    } catch {
      setCam(false);
    }
  }

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  if (state === "ended")
    return (
      <div className="reveal mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="title-1">Consultation ended</h1>
        <p className="mt-2 text-muted">{mm}:{ss} with Adv. Rahul Khanna. A summary and next steps have been added to your claim.</p>
        <Link href="/packets/demo" className="btn-primary mt-6">Back to action hub</Link>
      </div>
    );

  return (
    <div className="reveal mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="eyebrow">Advocate consult · {c.ref}</p>
          <h1 className="title-2 mt-1">Adv. Rahul Khanna · Consumer disputes, Delhi</h1>
        </div>
        <span className={`caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${state === "live" ? "bg-bad-soft text-bad" : "bg-fill text-muted"}`}>
          <span className={`size-1.5 rounded-full ${state === "live" ? "animate-pulse bg-bad" : "bg-muted"}`} />
          {state === "live" ? `Live · ${mm}:${ss}` : "Connecting…"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Stage */}
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-[#1d1d1f]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#0066cc] to-[#5e5ce6] text-2xl font-semibold text-white">RK</div>
              <p className="footnote mt-3 text-white/70">{state === "live" ? "Rahul Khanna" : "Joining room…"}</p>
            </div>
          </div>
          {/* Self view */}
          <div className="absolute right-4 bottom-20 aspect-video w-40 overflow-hidden rounded-2xl bg-[#2c2c2e] ring-1 ring-white/10 sm:w-52">
            {cam ? (
              <video ref={video} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-white/15 text-[13px] font-semibold text-white">{demoUser.initials}</span>
              </div>
            )}
            <span className="caption absolute bottom-1.5 left-2 text-white/80">You{mic ? "" : " · muted"}</span>
          </div>
          {/* Controls */}
          <div className="chrome absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full p-1.5 [--chrome:rgba(29,29,31,0.6)]">
            <CtrlButton on={mic} label={mic ? "Mute" : "Unmute"} onClick={() => setMic((m) => !m)}>
              {mic ? <Mic size={19} aria-hidden /> : <MicOff size={19} aria-hidden />}
            </CtrlButton>
            <CtrlButton on={cam} label={cam ? "Turn camera off" : "Turn camera on"} onClick={() => void toggleCam()}>
              {cam ? <Video size={19} aria-hidden /> : <VideoOff size={19} aria-hidden />}
            </CtrlButton>
            <CtrlButton on label="Share documents" onClick={() => {}}>
              <MonitorUp size={19} aria-hidden />
            </CtrlButton>
            <button aria-label="Leave" title="Leave" onClick={() => { stream.current?.getTracks().forEach((t) => t.stop()); setState("ended"); }} className="pressable flex size-11 items-center justify-center rounded-full bg-[#ff3b30] text-white">
              <PhoneOff size={19} aria-hidden />
            </button>
          </div>
          <span className="caption absolute top-4 left-4 rounded-full bg-black/40 px-2.5 py-1 text-white/80">LiveKit WebRTC · demo mode</span>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-accent" aria-hidden />
              <span className="headline">Shared case brief</span>
            </div>
            <dl className="footnote mt-3 grid grid-cols-2 gap-y-1.5">
              <dt className="text-muted">Flight</dt><dd>{c.flight} · {c.origin.iata}→{c.dest.iata}</dd>
              <dt className="text-muted">Delay</dt><dd>6h 20m</dd>
              <dt className="text-muted">Weather</dt><dd className="text-ok">Clear (verified)</dd>
              <dt className="text-muted">Baggage</dt><dd>1 damaged, 1 delayed</dd>
              <dt className="text-muted">Claim value</dt><dd className="font-semibold">{inr(demoTotal)}</dd>
            </dl>
            <p className="caption mt-3 flex items-center gap-1.5 text-muted"><ShieldCheck size={13} className="text-ok" aria-hidden /> Bar Council of Delhi · D/1842/2014 (verified)</p>
          </div>

          <div className="card flex min-h-64 flex-1 flex-col p-4">
            <div className="headline px-1">Chat</div>
            <div className="mt-3 flex-1 space-y-2 overflow-y-auto" aria-live="polite">
              {msgs.length === 0 && <p className="caption px-1 text-muted">Messages appear here.</p>}
              {msgs.map((m, i) => (
                <div key={i} className={`reveal footnote max-w-[85%] rounded-2xl px-3 py-2 ${m.from === "me" ? "ml-auto bg-accent text-white" : "bg-fill"}`}>{m.text}</div>
              ))}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                setMsgs((m) => [...m, { from: "me", text: draft.trim() }]);
                setDraft("");
              }}
            >
              <input className="field py-2! text-[15px]!" placeholder="Message" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Message" />
              <button aria-label="Send" className="btn-primary px-3!"><Send size={16} aria-hidden /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
