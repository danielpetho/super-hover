import { useSuperHoverRef } from "./super-hover-react";

const ITEM_COUNT = 180;

const superHoverRowProps = { "data-super-hover": "" } as const;

export default function App() {
  const rootRef = useSuperHoverRef();

  return (
    <div className="page" ref={rootRef}>
      <div className="compare">
        <section className="panel" aria-labelledby="native-heading">
          <div className="panel-head">
            <h2 id="native-heading">
              Native <code>:hover</code>
            </h2>
          </div>
          <div className="scroller" tabIndex={0}>
            {Array.from({ length: ITEM_COUNT }, (_, i) => (
              <div key={`n${i}`} className="row row--native">
                <span className="row-label">Item {i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" aria-labelledby="super-heading">
          <div className="panel-head">
            <h2 id="super-heading">super-hover</h2>
          </div>
          <div className="scroller" tabIndex={0}>
            {Array.from({ length: ITEM_COUNT }, (_, i) => (
              <div key={`s${i}`} className="row row--super" {...superHoverRowProps}>
                <span className="row-label">Item {i + 1}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
