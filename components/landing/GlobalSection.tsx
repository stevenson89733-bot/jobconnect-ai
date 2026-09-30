// components/landing/GlobalSection.tsx
export function GlobalSection() {
  return (
    <section className="landing-global" id="companies">
      <div>
        <span className="landing-kicker">BUILT FOR A BORDERLESS WORLD</span>
        <h2>
          Your talent goes further
          <br />
          than your postcode.
        </h2>
      </div>
      <div className="landing-global-copy">
        <p>
          Discover remote, relocation-friendly, and visa-sponsored roles from
          companies that value global talent.
        </p>
        <dl className="landing-global-stats">
          <div>
            <dt>63</dt>
            <dd>Countries</dd>
          </div>
          <div>
            <dt>10k+</dt>
            <dd>Open roles</dd>
          </div>
          <div>
            <dt>24/7</dt>
            <dd>New matches</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
