import { Link } from "react-router-dom";

const benefits = [
  { number: "01", title: "Discover your direction", text: "Explore career paths that fit your interests, strengths, and goals—without the guesswork." },
  { number: "02", title: "Build real confidence", text: "Practice interviews, assess your skills, and see exactly where to focus next." },
  { number: "03", title: "Follow a clear plan", text: "Turn career ambitions into small, practical steps with a roadmap made for you." },
];

export function Home() {
  return <div className="landing-page">
    <header className="landing-nav">
      <Link className="brand" to="/">✦ AstroCareer</Link>
      <div className="nav-actions"><Link className="text-link" to="/login">Log in</Link><Link className="button button-small" to="/login?mode=signup">Get started</Link></div>
    </header>
    <main className="landing-main">
      <section className="landing-hero">
        <div className="hero-copy"><p className="eyebrow">YOUR FUTURE, MADE CLEARER</p><h1>Find the path that feels <em>like you.</em></h1><p className="hero-description">AstroCareer brings career exploration, skill-building, and thoughtful self-reflection into one place—so you can move forward with confidence.</p><div className="hero-actions"><Link className="button" to="/login?mode=signup">Start exploring <span>→</span></Link><a className="learn-link" href="#why-astrocareer">See how it works <span>↓</span></a></div></div>
        <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core">✦</div><span className="planet planet-one" /><span className="planet planet-two" /><span className="planet planet-three" /></div>
      </section>
      <section className="intro-section" id="why-astrocareer"><p className="eyebrow">MORE THAN A CAREER TOOL</p><h2>A more personal way to prepare for what’s next.</h2><p>Whether you are choosing a first career, preparing for a role, or simply curious about your potential, AstroCareer gives you useful tools and a space to understand yourself better.</p></section>
      <section className="benefit-grid" aria-label="AstroCareer advantages">{benefits.map((benefit) => <article className="benefit-card" key={benefit.number}><span>{benefit.number}</span><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}</section>
      <section className="landing-cta"><p className="eyebrow">YOUR NEXT STEP STARTS HERE</p><h2>Ready to meet your future?</h2><Link className="button" to="/login?mode=signup">Create your free account <span>→</span></Link></section>
    </main>
  </div>;
}
