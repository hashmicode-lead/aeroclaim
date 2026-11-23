import Image from "next/image";

/** The people building AeroClaim. Photos are used with the team members' consent. */
const TEAM = [
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
];

export function TeamSection() {
  return (
    <section id="team" aria-labelledby="team-title" className="scroll-mt-20">
      <h2 id="team-title" className="title-2">The team behind AeroClaim</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
    </section>
  );
}
