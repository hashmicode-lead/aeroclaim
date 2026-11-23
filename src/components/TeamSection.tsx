import Image from "next/image";

/** The people building AeroClaim. Photos are used with the team members' consent. */
const TEAM = [
  {
    name: "Abdul Rahman Hashmi",
    role: "Founder · Lead Architect",
    photo: "/team/abdul-rahman-hashmi.png",
    bio: "MCA candidate at LEAD College and BCA graduate. Leads AeroClaim's product architecture, platform engineering, and passenger-rights automation systems.",
  },
  {
    name: "Riju Monachan",
    role: "Developer · Security",
    photo: "/team/riju-monachan.jpg",
    bio: "MCA student and BCA graduate from Kerala. Works on the platform's backend and on keeping travellers' documents and data secure.",
  },
  {
    name: "Ajal Vinod",
    role: "Developer · Full stack",
    photo: "/team/ajal-vinod.jpg",
    bio: "MCA student and BCA graduate from Kozhikode. Builds the claim flow end to end, from document upload to the filing packets.",
  },
  {
    name: "Ameer Hussain K Z",
    role: "Developer · Core Systems",
    photo: "/team/ameer-hussain.png",
    bio: "Computer applications graduate from Kerala. Designs core passenger-rights rule engines, DGCA compliance automation, and claim-packet workflows.",
  },
];

const ADVISORY_BOARD = [
  {
    name: "Nandagopal Marar",
    role: "Advocate · Advisory Board",
    photo: "/team/nandagopal-marar.jpg",
    bio: "Consumer-law advocate and advisory board member. Provides regulatory guidance on DGCA CARs, the Montreal Convention and consumer-commission procedure.",
  },
  {
    name: "Adv. Lal Krishna Viradiyara",
    role: "Advocate · Advisory Board",
    photo: "/team/suresh-gopi.jpg",
    bio: "Senior advocate and advisory board member. Specialises in consumer-commission advocacy and aviation dispute resolution across Indian jurisdictions.",
  },
];

export function TeamSection() {
  return (
    <section id="team" aria-labelledby="team-title" className="scroll-mt-20">
      <h2 id="team-title" className="title-2">The team behind AeroClaim</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {TEAM.map((p) => (
          <article key={p.name} className="card scroll-rise flex items-start gap-4 p-5">
            <Image src={p.photo} alt={p.name} width={72} height={72} className="size-18 shrink-0 rounded-full object-cover ring-2 ring-white shadow-[var(--shadow-card)]" />
            <div className="min-w-0">
              <div className="headline">{p.name}</div>
              <div className="footnote text-accent">{p.role}</div>
              <p className="footnote mt-2 text-muted">{p.bio}</p>
            </div>
          </article>
        ))}
      </div>

      <h2 id="board-title" className="title-2 mt-12">Advocate Advisory Board</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ADVISORY_BOARD.map((p) => (
          <article key={p.name} className="card scroll-rise flex items-start gap-4 p-5">
            <Image src={p.photo} alt={p.name} width={72} height={72} className="size-18 shrink-0 rounded-full object-cover ring-2 ring-white shadow-[var(--shadow-card)]" />
            <div className="min-w-0">
              <div className="headline">{p.name}</div>
              <div className="footnote text-accent">{p.role}</div>
              <p className="footnote mt-2 text-muted">{p.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
