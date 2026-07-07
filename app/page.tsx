import Link from 'next/link';

const features = [
  {
    title: 'Prompt-to-React generation',
    description:
      'Describe a product screen in plain English and generate an executable React interface with structured layout, actions, and realistic UI content.',
  },
  {
    title: 'Versioned project workspaces',
    description:
      'Keep generated screens organized by project with persistent history, rollback, duplication, deletion, and fork-based experimentation.',
  },
  {
    title: 'Prompt Runs control center',
    description:
      'Review every generation, manual edit, fork, and duplicate from a dedicated traceability view with search, filters, and direct actions.',
  },
  {
    title: 'Live code editing',
    description:
      'Switch from preview to source code, edit the generated React component manually, preview instantly, and save changes as new versions.',
  },
  {
    title: 'Reusable exports',
    description:
      'Download a generated component directly or package it into a ZIP with metadata for reuse in another React or Next.js project.',
  },
  {
    title: 'Reliability layer',
    description:
      'Prompt safety checks, Zod validation, response repair, component validation, and provider fallback keep the workflow more stable.',
  },
];

const stats = [
  { label: 'Workspace Modes', value: '2' },
  { label: 'Version Actions', value: '4+' },
  { label: 'Export Options', value: '2' },
  { label: 'AI Agents', value: '5' },
];

const metrics = [
  ['Cash Runway', '14.2 mo'],
  ['MRR', '$82.4k'],
  ['Burn Rate', '$18.6k'],
  ['AI Score', '91%'],
];

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <div className="landing-glow" />
      <div className="landing-glow-secondary" />

      <nav className="landing-nav">
        <Link href="/" className="brand-mark">
          Aether
        </Link>

        <div className="nav-actions">
          <a
            href="https://github.com/ayushxt25/Aether"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            GitHub
          </a>

          <Link href="/workspace" className="primary-link">
            Open Workspace
          </Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            AI-Powered React UI Generation Platform
          </div>

          <h1 className="hero-title">
            Build React interfaces from prompts, then make them yours.
          </h1>

          <p className="hero-description">
            Aether turns natural language prompts into editable React UIs with
            project workspaces, live preview, manual code editing, prompt-run
            traceability, version control, and reusable component exports.
          </p>

          <div className="hero-actions">
            <Link href="/workspace" className="hero-primary">
              Launch Workspace
            </Link>

            <a href="#features" className="hero-secondary">
              Explore Features
            </a>
          </div>

          <div className="stat-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-frame">
          <div className="preview-inner">
            <div className="preview-window">
              <div className="window-bar">
                <span className="dot" style={{ background: '#ef4444' }} />
                <span className="dot" style={{ background: '#f59e0b' }} />
                <span className="dot" style={{ background: '#22c55e' }} />
              </div>

              <div className="preview-content">
                <div className="preview-header">
                  <div>
                    <div className="preview-kicker">Generated Preview</div>
                    <div className="preview-title">AI Finance Dashboard</div>
                  </div>

                  <div className="live-pill">Live</div>
                </div>

                <div className="metric-grid">
                  {metrics.map(([label, value]) => (
                    <div className="metric-card" key={label}>
                      <div className="metric-label">{label}</div>
                      <div className="metric-value">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="trace-card">
                  <div className="trace-title">Prompt Run Trace</div>
                  <p className="trace-text">
                    “Create a premium AI finance dashboard for startup founders”
                    was generated, versioned, previewed, and saved into the
                    project timeline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-copy">
          <h2 className="section-title">
            More than a prompt box.
          </h2>

          <p className="section-description">
            Aether combines generation, editing, traceability, version control,
            and export workflows into a focused AI UI-building environment.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-panel">
          <div>
            <h2 className="cta-title">
              Generate a UI. Edit the code. Keep every version.
            </h2>

            <p className="cta-description">
              Open the workspace, create a project, generate your first
              interface, inspect the prompt run, edit the code, and export the
              final component.
            </p>
          </div>

          <Link href="/workspace" className="hero-primary">
            Open Workspace
          </Link>
        </div>
      </section>
    </main>
  );
}