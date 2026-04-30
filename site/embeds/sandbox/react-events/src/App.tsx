import { useState } from "react";
import { useSuperHover } from "./super-hover-react";

const ITEM_COUNT = 180;

const superHoverRowProps = { "data-super-hover": "" } as const;

export default function App() {
  const [eventRoot, setEventRoot] = useState<HTMLDivElement | null>(null);
  const [activePill, setActivePill] = useState("None");

  useSuperHover(eventRoot, {
    enabled: Boolean(eventRoot),
    onEnter: (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const id = t.dataset.rowId;
      if (id) setActivePill(`Item ${id}`);
    },
    onLeave: (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.dataset.rowId) setActivePill("None");
    },
  });

  return (
    <div className="page">
      <section className="panel" aria-labelledby="event-heading">
        <div className="event-toolbar" aria-live="polite">
          <span className="event-pill-label">Active:</span>
          <span className="event-pill">{activePill}</span>
        </div>
        <div ref={setEventRoot} className="scroller" tabIndex={0}>
          {Array.from({ length: ITEM_COUNT }, (_, i) => (
            <div
              key={`e${i}`}
              className="row row--event"
              data-row-id={String(i + 1)}
              {...superHoverRowProps}
            >
              <span className="row-label">Item {i + 1}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
