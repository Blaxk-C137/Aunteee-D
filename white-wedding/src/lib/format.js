export const asDate = (v) => (v instanceof Date ? v : new Date(v));

export const fmtDay = (v) =>
  asDate(v)
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

export const fmtShortDate = (v) =>
  asDate(v).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const fmtTime = (v) =>
  asDate(v).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

export const mapHref = (e) =>
  `https://maps.google.com/?q=${encodeURIComponent(
    [e.venue, e.address].filter(Boolean).join(", ")
  )}`;
export const scrollToId = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};
