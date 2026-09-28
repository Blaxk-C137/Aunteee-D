import { useState } from "react";
import { CONFIG } from "../../config/site.js";
import { Foil } from "../../foil/Foil.jsx";
import { FernCurl, LaurelArc } from "../../foil/motifs.jsx";
import { EngravedRule } from "../EngravedRule.jsx";
import { Section } from "../Section.jsx";

export function Rsvp() {
  const [form, setForm] = useState({ guests: "1", name: "", phone: "", attending: "yes" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  const buildMessage = () =>
    [
      `RSVP — ${CONFIG.bride} & ${CONFIG.groom}`,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Guests: ${form.guests}`,
      form.attending === "yes" ? "Attending: Yes" : "Attending: No, with regret",
    ].join("\n");

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name so we know who is coming.";
    if (!form.phone.trim()) next.phone = "Please add a phone number we can reach you on.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) {
      document.querySelector("[aria-invalid='true']")?.focus();
      return;
    }
    const text = buildMessage();
    const to = (CONFIG.whatsapp || "").replace(/\D/g, "");
    const href = to
      ? `https://wa.me/${to}?text=${encodeURIComponent(text)}`
      : `mailto:${CONFIG.email}?subject=${encodeURIComponent(
          `RSVP — ${form.name.trim()}`
        )}&body=${encodeURIComponent(text)}`;

    window.open(href, "_blank", "noopener");
    setSent(true);
  };

  const mailtoHref = `mailto:${CONFIG.email}?subject=${encodeURIComponent(
    `RSVP — ${CONFIG.bride} & ${CONFIG.groom}`
  )}&body=${encodeURIComponent(buildMessage())}`;

  // Shared between both branches so the ornament does not restart when
  // the form is replaced by its thank-you.
  const foil = (
    <>
      <Foil art={LaurelArc} tier="accent" size={280} x="-7%" y="8%" rotate={-6} drift={38} />
      <Foil art={FernCurl} tier="wm" size={300} x="76%" y="58%" rotate={14} flip drift={-36} />
    </>
  );

  if (sent) {
    return (
      <Section id="rsvp" tone="beige-deep" foil={foil}>
        <div style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto" }}>
          <EngravedRule width="min(13rem,55%)" />
          <p
            className="ww-display"
            style={{
              marginTop: "2rem",
              fontSize: "clamp(1.875rem,7vw,2.5rem)",
              color: "var(--ink)",
            }}
          >
            Thank you, {form.name.trim().split(" ")[0]}
          </p>
          <p
            className="ww-text"
            style={{ marginTop: "1.2rem", fontSize: "1.0625rem", color: "var(--ink-soft)" }}
          >
            {form.attending === "yes"
              ? "Your reply is on its way to us. We cannot wait to see you."
              : "Your reply is on its way. We will miss you, and thank you for telling us."}
          </p>

          {form.attending === "yes" ? (
            <p style={{ marginTop: "2rem", fontSize: ".875rem", color: "var(--ink-soft)" }}>
              If the message did not open,{" "}
              <a
                href={mailtoHref}
                style={{
                  color: "var(--lilac)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                send it by email instead
              </a>
              .
            </p>
          ) : null}
        </div>
      </Section>
    );
  }

  return (
    <Section id="rsvp" tone="beige-deep" foil={foil}>
      <div style={{ maxWidth: "27rem", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <p className="ww-label">Kindly RSVP</p>
          <EngravedRule width="min(13rem,55%)" style={{ margin: "1.5rem auto 2.2rem" }} />
        </div>

        <form onSubmit={submit} noValidate>
          <div>
            <label className="ww-fielabel" htmlFor="ww-guests">
              Number of guests
            </label>
            <select
              id="ww-guests"
              className="ww-field"
              value={form.guests}
              onChange={(e) => set("guests", e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: "1.2rem" }}>
            <label className="ww-fielabel" htmlFor="ww-name">
              Full name
            </label>
            <input
              id="ww-name"
              className="ww-field"
              placeholder="Your name"
              value={form.name}
              autoComplete="name"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "ww-name-err" : undefined}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name ? (
              <p className="ww-error" id="ww-name-err">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div style={{ marginTop: "1.2rem" }}>
            <label className="ww-fielabel" htmlFor="ww-phone">
              Phone number
            </label>
            <input
              id="ww-phone"
              className="ww-field"
              placeholder="So we can reach you"
              type="tel"
              inputMode="tel"
              value={form.phone}
              autoComplete="tel"
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? "ww-phone-err" : undefined}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errors.phone ? (
              <p className="ww-error" id="ww-phone-err">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <fieldset style={{ marginTop: "1.6rem" }}>
            <legend className="ww-fielabel" style={{ padding: 0 }}>
              Will you be joining us?
            </legend>
            <div style={{ display: "grid", gap: ".6rem" }}>
              {[
                { val: "yes", label: "Accepts with pleasure" },
                { val: "no", label: "Declines with regret" },
              ].map(({ val, label }) => (
                <div key={val} style={{ position: "relative" }}>
                  <input
                    className="ww-choice"
                    type="radio"
                    name="ww-attending"
                    id={`ww-att-${val}`}
                    value={val}
                    checked={form.attending === val}
                    onChange={() => set("attending", val)}
                  />
                  <label className="ww-choice-label" htmlFor={`ww-att-${val}`}>
                    <span className="ww-tick" aria-hidden="true" />
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="ww-btn ww-btn--solid"
            style={{ width: "100%", marginTop: "1.7rem" }}
          >
            Send my reply
          </button>

          <p
            style={{
              marginTop: "1rem",
              fontSize: ".8125rem",
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              textAlign: "center",
            }}
          >
            Your reply opens in WhatsApp, ready to send. Nothing is stored on this page.
          </p>
        </form>
      </div>
    </Section>
  );
}
