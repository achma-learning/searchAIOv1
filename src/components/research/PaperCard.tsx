import { Bookmark, ExternalLink, FileText, LockKeyhole, ScanEye } from "lucide-react"
import type { Paper } from "@/lib/research"

interface Props {
  paper: Paper
  saved: boolean
  onSave: () => void
  onInspect: () => void
}

export function PaperCard({ paper, saved, onSave, onInspect }: Props) {
  return (
    <article className="paper-card group">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-[0.12em] text-primary">{paper.year}</span>
            <span>{paper.journal}</span>
            {paper.openAccess && <span className="inline-flex items-center gap-1 text-primary"><LockKeyhole size={13} /> Open access</span>}
          </div>
          <h3 className="font-display text-xl leading-snug text-foreground md:text-2xl">{paper.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{paper.authors}</p>
        </div>
        <button type="button" className={`icon-button shrink-0 ${saved ? "text-primary" : "text-muted-foreground"}`} onClick={onSave} aria-label={saved ? "Remove from saved papers" : "Save paper"} title={saved ? "Remove saved paper" : "Save paper"}>
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      {paper.abstract !== "No abstract is available in this record." && <p className="mt-5 line-clamp-3 text-sm leading-6 text-foreground/75">{paper.abstract}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
        <button type="button" onClick={onInspect} className="text-action"><ScanEye size={15} /> Inspect evidence</button>
        <a className="text-action ml-auto" href={paper.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Source record</a>
        {paper.doi && <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex"><FileText size={13} /> DOI</span>}
      </div>
    </article>
  )
}