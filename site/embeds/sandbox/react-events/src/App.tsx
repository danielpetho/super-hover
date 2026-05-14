import { useEffect, useRef, useState } from "react";

import {
  createSuperHover,
  type SuperHoverController,
} from "./super-hover";

const ITEM_COUNT = 180;

const superHoverRowProps = { "data-super-hover": "" } as const;

export default function App() {
  const [eventRoot, setEventRoot] = useState<HTMLDivElement | null>(null);
  const [activePill, setActivePill] = useState("None");
  const [paused, setPaused] = useState(false);

  const ctrlRef = useRef<SuperHoverController | null>(null);

  useEffect(() => {
    if (!eventRoot) {
      ctrlRef.current?.destroy();
      ctrlRef.current = null;
      return;
    }

    ctrlRef.current?.destroy();
    const ctrl = createSuperHover({ root: eventRoot });
    ctrlRef.current = ctrl;

    const onEnter = (e: Event) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const id = t.dataset.rowId;
      if (id) setActivePill(`Item ${id}`);
    };
    const onLeave = (e: Event) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.dataset.rowId) setActivePill("None");
    };

    eventRoot.addEventListener("superhoverenter", onEnter);
    eventRoot.addEventListener("superhoverleave", onLeave);

    return () => {
      eventRoot.removeEventListener("superhoverenter", onEnter);
      eventRoot.removeEventListener("superhoverleave", onLeave);
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, [eventRoot]);

  useEffect(() => {
    const c = ctrlRef.current;
    if (!c) return;
    if (paused) c.pause();
    else c.resume();
  }, [paused, eventRoot]);

  return (
    <div className="page">
      <section className="panel" aria-labelledby="event-heading">
        <div className="event-toolbar" aria-live="polite">
          <span className="event-pill-label">Active:</span>
          <span className="event-pill">{activePill}</span>
          <label className="event-toolbar-switch">
            <input
              type="checkbox"
              checked={paused}
              onChange={(e) => setPaused(e.target.checked)}
            />
            Pause hit-test
          </label>
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
