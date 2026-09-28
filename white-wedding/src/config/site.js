export const CONFIG = {
  // Given names, which is what the hero sets in display type and what
  // the monogram is drawn from. The surnames are Danboyi and Watashira
  // — see the note on `initials` below.
  bride: "Jemimah",
  groom: "Titus",

  // Monogram. Keep it to initials only — 2 to 5 characters.
  //
  // Read from the given names, to match the hero: J & T. The invitation
  // was supplied as "Danboyi Jemimah" and "Watashira Titus", i.e.
  // surname first, so D & W would be the other reading. One line to
  // change if the monogram should carry the family names instead.
  initials: "J & T",

  // The ceremony. Drives the hero date and the countdown.
  weddingDate: "2026-12-12T11:00:00",

  city: "Kano, Nigeria",

  // The white wedding runs as one day with two parts. Add or remove
  // entries freely — one entry renders as a single card.
  events: [
    {
      label: "The Ceremony",
      date: "2026-12-12T11:00:00",
      venue: "St. Mary's Catholic Church",
      address: "Kano, Nigeria",
    },
    {
      label: "The Reception",
      date: "2026-12-12T16:30:00",
      venue: "Royal Gardens Hall",
      address: "Kano, Nigeria",
    },
  ],

  dressCode: "Black tie optional",

  story:
    "Ten years ago we were two people arguing about a borrowed umbrella. Somewhere between then and now it became a life — a shared kitchen, a hundred inside jokes, and a habit of choosing each other on the ordinary days. We would like you there on the day it becomes official.",

  // ── Our song ──────────────────────────────────────────────────────
  // Title and artist only. The audio itself is not a URL — drop
  // `song.mp3` into `src/assets/audio/` and it is picked up by name,
  // the same way the photographs are. See `config/audio.js`.
  //
  // There is deliberately no player in the Song section: the track is
  // already playing from the moment the envelope opens, and it is
  // owned by a single element in `App.jsx`. A second <audio> on the
  // same file would play a second overlapping copy of it.
  songTitle: "Now and Always",
  songArtist: "Kotrell",

  // ── RSVP ──────────────────────────────────────────────────────────
  // Digits only with country code, no + or spaces. Leave empty to use
  // the email fallback instead.
  whatsapp: "2348012345678",
  email: "rsvp@example.com",
  rsvpBy: "2026-11-28T23:59:59",
};
