import CharacterCanvas from "./CharacterCanvas.jsx";
import Cursor from "./Cursor.jsx";

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const skills = [
  ["Languages", "Swift, Python, SQL"],
  ["Frameworks and architecture", "SwiftUI, VIPER"],
  ["Development practices", "API Integration (REST), UI Component Development, Agile/Scrum"],
  ["Tools", "Xcode, Figma, Jira, MySQL"],
  ["Version control and CI/CD", "Git, GitHub, GitHub Actions"],
  ["Soft skills", "Cross-functional Collaboration, Client Communication, Stakeholder Demos"],
];

export default function App() {
  return (
    <>
      <main className="hero">
        <CharacterCanvas />

        <header className="nav-wrap">
          <nav className="nav" aria-label="Primary">
            <a href="#about" data-hover>ABOUT</a>
            <a href="#work" data-hover>WORK</a>
            <a href="mailto:vamshikasushma18@gmail.com" data-hover>CONTACT</a>
          </nav>
        </header>

        <section className="intro">
          <p className="hi">Hi, I'm</p>
          <h1 className="name">Vamshika Sushma Appaji</h1>
          <p className="bio">
            iOS developer building reliable, user-focused connected-car apps for 50k+ daily users.
            Swift, SwiftUI and VIPER, shipped with care from Figma to App Store.
          </p>
          <div className="actions">
            <a className="btn btn-solid" href="/Vamshika_Sushma_Appaji_Resume_(4).pdf" data-hover data-magnetic>
              Resume <Arrow />
            </a>
            <a className="btn btn-glass" href="mailto:vamshikasushma18@gmail.com" data-hover data-magnetic>
              Let's Talk
            </a>
          </div>
        </section>

        <Cursor />
      </main>

      <section id="about" className="about">
        <h2>About</h2>
        <p className="summary">
          iOS Developer with 2+ years of experience at Accenture building connected-car
          applications used by 50k+ daily active users. Shipped 7+ customer-facing
          features across connected-car iOS applications for a leading automotive client
          using Swift, SwiftUI, and VIPER architecture, maintaining a 4.1-star App Store
          rating across 52k ratings. Strong in reusable UI components, REST API
          integration, and Figma-to-code collaboration. Known for delivering reliable
          releases ahead of schedule and presenting demos to client stakeholders.
        </p>
        <dl className="skills">
          {skills.map(([label, items]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{items}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="work" className="work">
        <h2>Work</h2>
        <h3 className="role">iOS Developer, Accenture</h3>
        <ul className="points">
          <li>
            Delivered 7+ customer-facing features across multiple automotive iOS apps
            using Swift, SwiftUI, and VIPER architecture, including:
            <ul>
              <li><strong>Remote start and lock:</strong> let customers control their vehicle remotely from the app.</li>
              <li><strong>Vehicle diagnostics:</strong> surfaced vehicle health information to customers in the app.</li>
              <li><strong>EV charging status and maintenance alerts:</strong> kept customers informed of charging progress and service needs.</li>
            </ul>
          </li>
          <li>Supported 50k+ daily active users and a 4.1-star App Store rating across 52k ratings.</li>
          <li>Worked sequentially across multiple connected-car applications, reusing VIPER modules and UI components to speed up development on each new project.</li>
          <li>Integrated backend services through REST APIs and translated Figma designs into production-ready SwiftUI screens in close collaboration with designers.</li>
          <li>Partnered with designers, testers, and backend teams across 3+ departments to deliver major releases ahead of schedule.</li>
          <li>Presented feature demos to client stakeholders and incorporated their feedback into releases.</li>
        </ul>
      </section>
    </>
  );
}
