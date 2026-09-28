import { useRef, useState } from "react";
import { CONFIG } from "../../config/site.js";
import { Foil } from "../../foil/Foil.jsx";
import { BlossomSpray, BudCluster, LeafFrond } from "../../foil/motifs.jsx";
import { EngravedRule } from "../EngravedRule.jsx";
import { Section } from "../Section.jsx";

export function Song() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const hasAudio = Boolean(CONFIG.songUrl);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const seek = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
  };

  const mmss = (s) => {
    if (!Number.isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  return (
    <Section
      id="song"
      tone="ivory"
      foil={
        <>
          <Foil art={BlossomSpray} tier="accent" size={250} x="76%" y="4%" rotate={-12} flip drift={44} />
          <Foil art={LeafFrond} tier="wm" size={300} x="-6%" y="52%" rotate={6} drift={-42} />
          <Foil art={BudCluster} tier="wm" size={230} x="4%" y="-6%" rotate={14} drift={32} />
        </>
      }
    >
      <div style={{ textAlign: "center" }}>
        <p className="ww-label">Our song</p>
        <EngravedRule width="min(13rem,55%)" style={{ margin: "1.5rem auto 2rem" }} />

        <p
          className="ww-display"
          style={{ fontSize: "clamp(1.75rem,6.5vw,2.375rem)", color: "var(--ink)" }}
        >
          {CONFIG.songTitle}
        </p>
        <p
          style={{
            marginTop: ".6rem",
            fontSize: ".8125rem",
            fontWeight: 400,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          {CONFIG.songArtist}
        </p>

        {hasAudio ? (
          <>
            <audio
              ref={audioRef}
              src={CONFIG.songUrl}
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />
            <div className="ww-player">
              <button
                type="button"
                className="ww-play"
                onClick={toggle}
                aria-label={playing ? `Pause ${CONFIG.songTitle}` : `Play ${CONFIG.songTitle}`}
              >
                <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" focusable="false">
                  {playing ? (
                    <>
                      <rect x="3.5" y="2.5" width="3.4" height="12" fill="currentColor" />
                      <rect x="10.1" y="2.5" width="3.4" height="12" fill="currentColor" />
                    </>
                  ) : (
                    <path d="M4.6 2.3l10 6.2-10 6.2z" fill="currentColor" />
                  )}
                </svg>
              </button>

              <div className="ww-track">
                <div className="ww-scrub" role="presentation" onClick={seek}>
                  <span style={{ width: duration ? `${(elapsed / duration) * 100}%` : "0%" }} />
                </div>
                <div className="ww-times">
                  <span>{mmss(elapsed)}</span>
                  <span>{mmss(duration)}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Section>
  );
}
