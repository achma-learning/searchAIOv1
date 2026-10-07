import { ArrowRight, BookOpenCheck, CircleAlert, ListChecks } from "lucide-react"

interface Props { onTryExample: (query: string) => void }

export function ResearchGuide({ onTryExample }: Props) {
  const example = 'In adults with hypertension, does home blood pressure monitoring compared with usual care improve blood pressure control?'
  return (
    <section className="space-y-9">
      <div className="guide-hero on-media">
        <img src="/assets/research-process.webp" alt="A calm research workspace with medical literature and notes" />
        <div className="guide-hero-scrim" />
        <div className="guide-hero-copy">
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">A practical starting point</span>
          <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight md:text-5xl">A good thesis begins with a focused question.</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/80">Move from a clinical uncertainty to a searchable question, then assess each paper carefully.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-8">
          <div>
            <div className="eyebrow"><BookOpenCheck size={15} /> Start with PICO</div>
            <h3 className="mt-3 font-display text-3xl">Turn a broad topic into a searchable question.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">PICO is a planning aid for many clinical questions. It helps make the population, intervention, comparison and outcome explicit before you search.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {[["P", "Population", "Adults with hypertension"], ["I", "Intervention", "Home blood pressure monitoring"], ["C", "Comparison", "Usual care"], ["O", "Outcome", "Blood pressure control"]].map(([letter, label, detail]) => <div key={letter} className="pico-row"><span>{letter}</span><div><strong>{label}</strong><p>{detail}</p></div></div>)}
            </div>
          </div>
          <div className="border-t border-border pt-7">
            <div className="eyebrow"><ListChecks size={15} /> A simple review routine</div>
            <ol className="mt-4 space-y-4">
              {["Write down the exact question and its PICO elements.", "Search more than one appropriate source; keep the search terms and date.", "Screen titles and abstracts against criteria agreed with your supervisor.", "Read the full text where available and record design, population, outcomes and limitations.", "Synthesize patterns and uncertainty; do not treat one abstract as a clinical recommendation."].map((line, index) => <li key={line} className="flex gap-4 text-sm leading-6 text-foreground/80"><span className="step-number">0{index + 1}</span>{line}</li>)}
            </ol>
          </div>
          <button type="button" onClick={() => onTryExample(example)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Try the PICO example <ArrowRight size={16} /></button>
        </div>
        <aside className="space-y-5">
          <img className="guide-library-image" src="/assets/clinical-library.webp" alt="A medical library for careful literature review" />
          <div className="rounded-[1.25rem] border border-border p-6">
            <div className="eyebrow"><CircleAlert size={15} /> Keep the scope clear</div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">This workspace supports literature discovery and organization for academic work. It is not a diagnostic service, does not appraise evidence automatically, and does not replace supervision, institutional guidance or clinical judgment.</p>
          </div>
          <div className="roadmap-card">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Planned next version</span>
            <h3 className="mt-2 font-display text-2xl">AI research agent</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">A separate agent-focused experience could help plan search strategies and organize screening steps. It is a roadmap item—not part of this human-led version.</p>
          </div>
        </aside>
      </div>

      <div className="acknowledgement">
        <img src="https://cdn.chantan.one/scraped-images/fb3e46a5ca04f985.png" alt="Ministry of Health and Social Protection source image retained from the original project" />
        <div><span className="eyebrow">Sources & acknowledgments</span><p className="mt-2 text-sm leading-6 text-muted-foreground">Search results are retrieved from Europe PMC and link back to the source record. PubMed, Google Scholar, Cochrane Library and CISMeF are offered as additional places to continue a search. Check each database's own access and use terms.</p></div>
      </div>
    </section>
  )
}