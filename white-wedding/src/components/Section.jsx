export const Section = ({ id, tone = "ivory", foil, children }) => (
  <section id={id} className={`ww-panel ww-panel--${tone}`}>
    {foil}
    <div className="ww-inner">{children}</div>
  </section>
);
