import { useScrollProgress } from "./lib/hooks.js";

import { Hero } from "./components/sections/Hero.jsx";
import { Story } from "./components/sections/Story.jsx";
import { BigDay } from "./components/sections/BigDay.jsx";
import { Countdown } from "./components/sections/Countdown.jsx";
import { Song } from "./components/sections/Song.jsx";
import { Rsvp } from "./components/sections/Rsvp.jsx";
import { Footer } from "./components/sections/Footer.jsx";

export default function App() {
  const progress = useScrollProgress();

  return (
    <div className="ww">
      <div className="ww-thread" style={{ width: `${progress * 100}%` }} aria-hidden="true" />

      <Hero />
      <Story />
      <BigDay />
      <Countdown />
      <Song />
      <Rsvp />
      <Footer />
    </div>
  );
}
