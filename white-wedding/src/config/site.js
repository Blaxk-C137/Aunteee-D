export const CONFIG = {
  // Display names, exactly as they should read on the page. The
  // invitation was supplied as "Danboyi Jemimah" and
  // "Watashira Titus"; the groom is shown as Watashira.
  bride: "Jemimah",
  groom: "Watashira",

  // Monogram. Keep it to initials only — 2 to 5 characters.
  //
  // J & W, read from the two names as displayed above. One line to
  // change if the monogram should carry something else.
  initials: "J & W",

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

  // Blank lines separate paragraphs. `Story.jsx` splits on them and
  // renders one <p> per block, so a break here is real markup rather
  // than something that has to be faked with <br>s.
  story:
    "We met online in 2014, in the BlackBerry era, when a single BBM ping could brighten an entire day.\n\n" +
    "Months of laughter and easy love followed. Then he went abroad, and we parted.\n\n" +
    "In 2018 he came home to ask for another chance. I knew the sweet boy underneath the bravado, so I gave him one.\n\n" +
    "And here we are.",

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
