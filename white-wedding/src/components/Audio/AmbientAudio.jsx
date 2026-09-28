import "./audio.css";

/* The music control.

   Deliberately dumb: it renders a button and reports clicks. Whether
   anything is playing, and whether there is anything to play at all,
   belongs to App — the same place that has to issue play() inside the
   envelope's click handler. Splitting that knowledge across two
   components is how the gesture gets lost. */
export function AudioControl({ playing, onToggle, title }) {
  const label = title ? `${playing ? "Pause" : "Play"} ${title}` : playing ? "Pause" : "Play";

  return (
    <button
      type="button"
      className="aud"
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={label}
      title={label}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path
          d="M4 7.6h2.6L10 4.4v11.2L6.6 12.4H4z"
          fill="currentColor"
        />
        <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path className="aud-wave" d="M12.8 7.4a3.7 3.7 0 0 1 0 5.2" />
          <path className="aud-wave aud-wave--far" d="M15.2 5.3a6.7 6.7 0 0 1 0 9.4" />
        </g>
      </svg>
    </button>
  );
}
