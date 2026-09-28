export const EngravedRule = ({ width = "min(19rem,74%)", tone = "beige", style }) => (
  <div
    className={`ww-engraved${tone === "purple" ? " ww-engraved--onpurple" : ""}`}
    style={{ width, margin: "0 auto", ...style }}
    aria-hidden="true"
  >
    <i />
    <svg width="11" height="11" viewBox="0 0 11 11" focusable="false">
      <rect
        x="2.2"
        y="2.2"
        width="6.6"
        height="6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth=".9"
        transform="rotate(45 5.5 5.5)"
      />
    </svg>
    <i />
  </div>
);
