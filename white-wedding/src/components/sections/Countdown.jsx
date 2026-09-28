import { CONFIG } from "../../config/site.js";
import { Foil } from "../../foil/Foil.jsx";
import { BlossomSpray, FernCurl, WreathRing } from "../../foil/motifs.jsx";
import { asDate, fmtShortDate } from "../../lib/format.js";
import { useCountdown } from "../../lib/hooks.js";
import { EngravedRule } from "../EngravedRule.jsx";
import { Section } from "../Section.jsx";

export function Countdown() {
  const t = useCountdown(CONFIG.weddingDate);
  const by = asDate(CONFIG.rsvpBy);

  // Shared between both branches so the ring does not jump the moment the
  // countdown runs out and the section swaps to its "today" copy.
  const foil = (
    <>
      <Foil art={WreathRing} tier="wm" size={640} x="50%" y="50%" drift={22}
            style={{ marginLeft: -320, marginTop: -320 }} />
      <Foil art={FernCurl} tier="wm" size={260} x="80%" y="64%" rotate={-20} flip drift={-34} />
      <Foil art={BlossomSpray} tier="wm" size={250} x="-5%" y="6%" rotate={8} drift={36} />
    </>
  );

  if (!t) {
    return (
      <Section id="countdown" tone="deep" foil={foil}>
        <div style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto" }}>
          <p className="ww-label ww-label--onpurple">Today</p>
          <EngravedRule tone="purple" width="min(13rem,55%)" style={{ margin: "1.5rem auto" }} />
          <p
            className="ww-display"
            style={{ fontSize: "clamp(2.125rem,8vw,3.25rem)", color: "var(--beige)" }}
          >
            The day is here
          </p>
        </div>
      </Section>
    );
  }

  const units = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Minutes" },
    { v: t.seconds, l: "Seconds" },
  ];

  return (
    <Section id="countdown" tone="purple" foil={foil}>
      <div style={{ textAlign: "center" }}>
        <p className="ww-label ww-label--onpurple">Until we say I do</p>
        <EngravedRule tone="purple" width="min(13rem,55%)" style={{ margin: "1.5rem auto 0" }} />

        <div className="ww-units">
          {units.map(({ v, l }) => (
            <div className="ww-unit" key={l}>
              <p className="ww-num">
                <span
                  aria-hidden="true"
                  style={{ display: "inline-block", minWidth: "2ch", textAlign: "center" }}
                >
                  {String(v).padStart(2, "0")}
                </span>
                <span
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v} {l}
                </span>
              </p>
              <span className="ww-cap">{l}</span>
            </div>
          ))}
        </div>

        {by && by.getTime() > Date.now() ? (
          <p
            style={{
              marginTop: "clamp(36px,8vw,54px)",
              fontSize: ".6875rem",
              fontWeight: 500,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--on-purple-dim)",
            }}
          >
            Kindly reply by {fmtShortDate(by)}
          </p>
        ) : null}
      </div>
    </Section>
  );
}
