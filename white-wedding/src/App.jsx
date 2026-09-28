import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { CONFIG } from "./config/site.js";
import { photos } from "./config/photos.js";
import { trackSrc, trackTitle } from "./config/audio.js";
import { useScrollProgress } from "./lib/hooks.js";
import { FLASH_MS, FADE_MS, OPEN_MS, timeScale } from "./lib/timings.js";

import { Envelope } from "./components/Envelope/Envelope.jsx";
import { AudioControl } from "./components/Audio/AmbientAudio.jsx";
import { Hero } from "./components/sections/Hero.jsx";
import { Story } from "./components/sections/Story.jsx";
import { BigDay } from "./components/sections/BigDay.jsx";
import { Countdown } from "./components/sections/Countdown.jsx";
import { Song } from "./components/sections/Song.jsx";
import { Rsvp } from "./components/sections/Rsvp.jsx";
import { Footer } from "./components/sections/Footer.jsx";

/* Set the moment the envelope goes away, never on the click.

   Clicking can be followed by a reload, a back-navigation, a crash — and
   if the flag were already written the visitor would land straight on the
   site with the music never started, because the gesture that would have
   allowed it was spent on a page that no longer exists. Writing it here
   means the flag and the music are the same event.

   sessionStorage rather than localStorage: a guest should get the
   envelope once per visit, not once forever. And it can throw — Safari
   private mode, storage disabled — which is why both sides are wrapped.
   Losing the flag is not an error worth surfacing; it just means they
   see the envelope again. */
const OPENED_KEY = "ww.opened";

function hasOpened() {
  try {
    return sessionStorage.getItem(OPENED_KEY) === "1";
  } catch {
    return false;
  }
}

function markOpened() {
  try {
    sessionStorage.setItem(OPENED_KEY, "1");
  } catch {
    /* nothing to do — see above */
  }
}

export default function App() {
  const reduced = useReducedMotion();
  const audioRef = useRef(null);
  const [phase, setPhase] = useState(() => (hasOpened() ? "open" : "closed"));
  const [playing, setPlaying] = useState(false);
  const [trackUsable, setTrackUsable] = useState(Boolean(trackSrc));
  const progress = useScrollProgress();

  const gated = phase !== "open";

  /* The one rule the whole design rests on: play() is issued
     synchronously inside the click handler, before any await and before
     any state update that could defer it. Browsers gate audible playback
     on a real user gesture, and this click is the only one we get — a
     play() called from an effect, a timer, or after an await has lost
     the gesture and is refused. */
  const open = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      /* Not awaited, deliberately. The promise resolves whenever the
         browser feels like it, and the open sequence must not wait on it
         — a refused play() has to leave the envelope opening anyway,
         silently. */
      const attempt = el.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    }
    setPhase("opening");
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      const attempt = el.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  /* The sequence runs on timers rather than on animation callbacks: the
     envelope's own motion is on the compositor and its completion is not
     something the page can reliably observe, so the phases are held for
     the durations the animations were built to. */
  useEffect(() => {
    if (phase !== "opening") return;
    const t = setTimeout(() => setPhase("flash"), OPEN_MS * timeScale(reduced));
    return () => clearTimeout(t);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== "flash") return;
    const t = setTimeout(() => {
      markOpened();
      setPhase("open");
    }, FLASH_MS * timeScale(reduced));
    return () => clearTimeout(t);
  }, [phase, reduced]);

  /* Hold the page still while the envelope is up. Without this, a scroll
     that starts on the envelope keeps going underneath it, and the site
     is already part-way down when the flash clears. */
  useEffect(() => {
    if (!gated) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [gated]);

  const hasTrack = Boolean(trackSrc) && trackUsable;

  return (
    <>
      <audio
        ref={audioRef}
        src={trackSrc ?? undefined}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setTrackUsable(false)}
      />

      {/* The site is mounted and running from the first paint, underneath
          the envelope. It is not waiting to be revealed — its entrance
          animations play behind the envelope, so when the flash clears
          the page is simply already there. `inert` keeps it out of the
          tab order and away from the pointer until then. */}
      <div className="ww" inert={gated}>
        <div className="ww-thread" style={{ width: `${progress * 100}%` }} aria-hidden="true" />

        <Hero />
        <Story />
        <BigDay />
        <Countdown />
        <Song />
        <Rsvp />
        <Footer />
      </div>

      {gated && <Envelope phase={phase} onOpen={open} photo={photos.envelope} />}

      <motion.div
        className="ww-flash"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: phase === "flash" ? 1 : 0 }}
        /* Wash in fast, lift slowly. The envelope unmounts on the same
           frame the flash starts leaving, so the white is already opaque
           over the gap where it was. */
        transition={{ duration: (phase === "flash" ? FLASH_MS : FADE_MS) / 1000 }}
      />

      {phase === "open" && hasTrack && (
        <AudioControl playing={playing} onToggle={toggle} title={trackTitle || CONFIG.songTitle} />
      )}
    </>
  );
}
