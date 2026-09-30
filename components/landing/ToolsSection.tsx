// components/landing/ToolsSection.tsx
import { Icon, IconName } from "./LandingIcons";

const TOOLS = [
  {
    icon: "file" as IconName,
    eyebrow: "CV INTELLIGENCE",
    title: "Turn your CV into an advantage",
    copy: "Get instant feedback, keyword insights, and tailored recommendations for every application.",
    accent: "blue",
  },
  {
    icon: "target" as IconName,
    eyebrow: "SMART MATCHING",
    title: "Only see roles that fit",
    copy: "Our matching engine scores your experience, goals, and location against every opportunity.",
    accent: "purple",
  },
  {
    icon: "wand" as IconName,
    eyebrow: "CAREER COPILOT",
    title: "Apply with more confidence",
    copy: "Create stronger applications and prepare for interviews with an AI coach that knows your profile.",
    accent: "coral",
  },
];

export function ToolsSection() {
  return (
    <section className="landing-tools" id="tools">
      <div className="landing-tools-intro">
        <span className="landing-kicker landing-kicker--light">
          YOUR CAREER, SUPERCHARGED
        </span>
        <h2>
          More than a job board.
          <br />
          <span>A smarter way forward.</span>
        </h2>
        <p>
          Practical AI tools that work together to help you make better career
          decisions.
        </p>
        <a href="#jobs">
          Explore all AI tools <Icon name="arrow" size={16} />
        </a>
      </div>

      <div className="landing-tools-list">
        {TOOLS.map((tool) => (
          <article className="landing-tool-card" key={tool.title}>
            <div className={`landing-tool-icon landing-tool-icon--${tool.accent}`}>
              <Icon name={tool.icon} size={24} />
            </div>
            <div className="landing-tool-card-content">
              <span>{tool.eyebrow}</span>
              <h3>{tool.title}</h3>
              <p>{tool.copy}</p>
            </div>
            <button type="button" aria-label={`Learn more about ${tool.title}`}>
              <Icon name="arrow" size={18} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
