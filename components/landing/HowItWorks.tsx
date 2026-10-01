// components/landing/HowItWorks.tsx
import { Icon } from "./LandingIcons";

const STEPS = [
  {
    num: "01",
    icon: "upload" as const,
    title: "Share your story",
    copy: "Upload your CV or build a profile in minutes. We map your skills, experience, and goals.",
  },
  {
    num: "02",
    icon: "sparkles" as const,
    title: "Meet your best matches",
    copy: "AI analyzes every role and brings the most relevant opportunities to the top.",
  },
  {
    num: "03",
    icon: "briefcase" as const,
    title: "Make your move",
    copy: "Tailor your application, prepare for interviews, and apply with clarity and confidence.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="landing-how">
      <div className="landing-section-head">
        <span className="landing-kicker">A BETTER WAY TO JOB SEARCH</span>
        <h2>Your next move, made simpler.</h2>
        <p>
          From profile to offer, JobConnect AI helps you focus on the
          opportunities worth your time.
        </p>
      </div>

      <div className="landing-steps-grid">
        {STEPS.map((step) => (
          <article className="landing-step" key={step.num}>
            <span className="landing-step-num">{step.num}</span>
            <div className="landing-step-icon">
              <Icon name={step.icon} size={25} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
