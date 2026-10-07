import { useMemo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import "@/components/research/research-workspace.css"
import { AlertCircle, ArrowDownUp, BookMarked, BookOpen, Check, ChevronRight, CircleHelp, ClipboardList, Download, FileDown, FileSearch, LibraryBig, LoaderCircle, Menu, NotebookPen, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react"
import { PaperCard } from "@/components/research/PaperCard"
import { ResearchGuide } from "@/components/research/ResearchGuide"
import { bibtex, citationText, csvCell, normalizePaper, sourceLinks, type Paper, type SavedPaper } from "@/lib/research"

const STORAGE_KEY = "thesis-evidence-saved-v1"
type View = "search" | "saved" | "guide"
const navItems: { id: View; label: string; icon: typeof Search }[] = [
  { id: "search", label: "Literature search", icon: Search },
  { id: "saved", label: "Saved papers", icon: BookMarked },
  { id: "guide", label: "Research guide", icon: BookOpen },
]

function readSaved(): SavedPaper[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as SavedPaper[] } catch { return [] }
}

function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const heroStagger = { hidden: {}, show: { transition: { delayChildren: 0.04, staggerChildren: 0.07 } } }
const heroLine = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } }

const Index = () => {
  const reduceMotion = useReducedMotion()
  const [view, setView] = useState<View>("search")
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [papers, setPapers] = useState<Paper[]>([])
  const [saved, setSaved] = useState<SavedPaper[]>(readSaved)
  const [selected, setSelected] = useState<Paper | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [yearFrom, setYearFrom] = useState("")
  const [yearTo, setYearTo] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [mobileMenu, setMobileMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const filteredPapers = useMemo(() => papers.filter((paper) => {
    const year = Number(paper.year)
    if (yearFrom && year && year < Number(yearFrom)) return false
    if (yearTo && year && year > Number(yearTo)) return false
    if (typeFilter !== "all" && !paper.types.some((type) => type.toLowerCase().includes(typeFilter))) return false
    return true
  }), [papers, yearFrom, yearTo, typeFilter])

  const persist = (next: SavedPaper[]) => {
    setSaved(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { setError("Your browser could not save this list. Check that local storage is available.") }
  }

  const toggleSaved = (paper: Paper) => {
    const exists = saved.some((item) => item.id === paper.id)
    persist(exists ? saved.filter((item) => item.id !== paper.id) : [...saved, { ...paper, note: "", savedAt: new Date().toISOString() }])
  }

  const saveNote = (paper: Paper, note: string) => {
    const prior = saved.find((item) => item.id === paper.id)
    const next = prior ? saved.map((item) => item.id === paper.id ? { ...item, note } : item) : [...saved, { ...paper, note, savedAt: new Date().toISOString() }]
    persist(next)
  }

  const runSearch = async (event?: React.FormEvent) => {
    event?.preventDefault()
    const clean = query.trim()
    if (!clean) return
    setView("search")
    setSubmittedQuery(clean)
    setLoading(true)
    setError("")
    setPapers([])
    try {
      const endpoint = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(clean)}&format=json&pageSize=25&resultType=core`
      const response = await fetch(endpoint, { headers: { Accept: "application/json" } })
      if (!response.ok) throw new Error(`Europe PMC returned ${response.status}.`)
      const data = await response.json()
      setPapers((data.resultList?.result || []).map(normalizePaper))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The literature search could not be completed.")
    } finally {
      setLoading(false)
    }
  }

  const setExample = (text: string) => { setQuery(text); setView("search"); window.scrollTo({ top: 0, behavior: "smooth" }) }
  const exportSaved = (format: "bib" | "csv") => {
    if (!saved.length) return
    if (format === "bib") downloadFile("thesis-papers.bib", saved.map(bibtex).join("\n\n"), "application/x-bibtex")
    else {
      const rows = [["Title", "Authors", "Journal", "Year", "DOI", "PMID", "Note"], ...saved.map((item) => [item.title, item.authors, item.journal, item.year, item.doi, item.pmid, item.note])]
      downloadFile("thesis-papers.csv", rows.map((row) => row.map(csvCell).join(",")).join("\n"), "text/csv;charset=utf-8")
    }
  }

  const copyCitation = async () => {
    if (!selected) return
    await navigator.clipboard.writeText(citationText(selected))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={`workspace-sidebar ${mobileMenu ? "workspace-sidebar-open" : ""}`}>
        <a href="#workspace" className="brand-lockup"><span className="brand-mark brand-mark-image"><img src="https://cdn.chantan.one/scraped-images/fe359f4337e4962c.png" alt="achma-learning project mark" /></span><span><strong>Thesis</strong><small>Evidence workspace</small></span></a>
        <div className="sidebar-label">Workspace</div>
        <nav className="space-y-1" aria-label="Research workspace">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => { setView(id); setMobileMenu(false) }} className={`sidebar-link ${view === id ? "sidebar-link-active" : ""}`}><Icon size={17} />{label}{id === "saved" && saved.length > 0 && <span className="sidebar-count">{saved.length}</span>}</button>)}
        </nav>
        <div className="sidebar-note"><ShieldCheck size={16} /><span>Your saved papers and notes stay in this browser.</span></div>
        <div className="sidebar-credit">A human-led tool for medical thesis research</div>
      </aside>

      <div className="workspace-main" id="workspace">
        <header className="workspace-topbar">
          <button type="button" className="icon-button mobile-menu-button" aria-label="Open menu" aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}><Menu size={19} /></button>
          <div className="breadcrumbs"><span>Research workspace</span><ChevronRight size={14} /><strong>{navItems.find((item) => item.id === view)?.label}</strong></div>
          <a href="#research-guide" onClick={(event) => { event.preventDefault(); setView("guide") }} className="topbar-help"><CircleHelp size={16} /> How to use</a>
        </header>

        <main className="workspace-content">
          {view === "search" && <>
            <section className="workspace-intro">
              <motion.div className="intro-copy" variants={heroStagger} initial={reduceMotion ? false : "hidden"} animate="show">
                <motion.span className="section-kicker" variants={heroLine}>MEDICAL THESIS · LITERATURE WORKSPACE</motion.span>
                <motion.h1 variants={heroLine}>Find the evidence.<br /><em>Build your question.</em></motion.h1>
                <motion.p variants={heroLine}>Search biomedical literature, keep useful papers close, and shape a review you can discuss with your supervisor.</motion.p>
              </motion.div>
              <div className="intro-image"><img src="/assets/medical-research-hero.webp" alt="A thoughtful medical research workspace" /><span><LibraryBig size={15} /> Read, organize, cite</span></div>
            </section>
            <motion.form onSubmit={runSearch} className="search-panel" variants={heroLine} initial={reduceMotion ? false : "hidden"} animate="show" transition={{ delay: 0.23, duration: 0.55, ease: "easeOut" }}>
              <label htmlFor="literature-query" className="text-sm font-semibold">What are you researching?</label>
              <div className="search-field-row"><Search size={19} className="shrink-0 text-muted-foreground" /><input id="literature-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a topic, condition, intervention, or author" /><button type="submit" disabled={loading || !query.trim()} className="search-submit">{loading ? <LoaderCircle className="animate-spin" size={17} /> : <Search size={17} />}<span>{loading ? "Searching" : "Search papers"}</span></button></div>
              <div className="search-panel-bottom"><p>Searches Europe PMC; results link to their source records.</p><button type="button" className="text-action" onClick={() => setView("guide")}><ClipboardList size={15} /> Build a focused question</button></div>
            </motion.form>

            <section className="results-section">
              <div className="results-heading"><div><span className="section-kicker">YOUR LITERATURE</span><h2>{submittedQuery ? "Search results" : "Start with a question"}</h2></div>{papers.length > 0 && <span className="result-total">{filteredPapers.length} shown · {papers.length} retrieved</span>}</div>
              {(papers.length > 0 || submittedQuery) && <div className="filters-row"><span className="filter-label"><SlidersHorizontal size={15} /> Refine</span><label>From <input aria-label="From year" type="number" min="1900" max="2100" placeholder="Year" value={yearFrom} onChange={(event) => setYearFrom(event.target.value)} /></label><label>To <input aria-label="To year" type="number" min="1900" max="2100" placeholder="Year" value={yearTo} onChange={(event) => setYearTo(event.target.value)} /></label><label className="type-filter">Study type <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All types</option><option value="review">Review</option><option value="clinical trial">Clinical trial</option><option value="randomized controlled trial">Randomized trial</option></select></label><ArrowDownUp size={15} className="ml-auto hidden text-muted-foreground sm:block" /></div>}
              {loading && <div className="status-panel"><LoaderCircle className="animate-spin text-primary" size={23} /><div><strong>Searching biomedical literature</strong><p>Retrieving records and abstracts from Europe PMC…</p></div></div>}
              {!loading && error && <div className="error-panel"><AlertCircle size={21} /><div className="min-w-0"><strong>Search unavailable right now</strong><p>{error} You can continue in another literature source:</p><div className="fallback-links">{sourceLinks(submittedQuery).map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} <ChevronRight size={13} /></a>)}</div></div></div>}
              {!loading && !error && submittedQuery && papers.length === 0 && <div className="empty-results"><FileSearch size={27} /><h3>No records found for this search.</h3><p>Try fewer terms, alternative spellings, or search a source directly.</p><div className="fallback-links">{sourceLinks(submittedQuery).map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} <ChevronRight size={13} /></a>)}</div></div>}
              {!loading && !error && filteredPapers.length > 0 && <div className="paper-list">{filteredPapers.map((paper) => <PaperCard key={paper.id} paper={paper} saved={saved.some((item) => item.id === paper.id)} onSave={() => toggleSaved(paper)} onInspect={() => setSelected(paper)} />)}</div>}
              {!loading && !submittedQuery && <div className="start-here"><div className="start-card"><span className="start-number">01</span><div><strong>Start broad, then narrow</strong><p>Combine a population, intervention, and outcome in plain language.</p></div><Search size={18} /></div><div className="start-card"><span className="start-number">02</span><div><strong>Save what matters</strong><p>Keep relevant papers and add your own screening notes.</p></div><BookMarked size={18} /></div><button type="button" className="example-query" onClick={() => setExample("home blood pressure monitoring hypertension")}>Try an example search <span>home blood pressure monitoring hypertension</span><ChevronRight size={16} /></button></div>}
              {!loading && !error && papers.length > 0 && filteredPapers.length === 0 && <div className="empty-results"><SlidersHorizontal size={24} /><h3>No papers match these filters.</h3><p>Adjust the year or study-type filters to see more of your results.</p></div>}
            </section>
          </>}

          {view === "saved" && <section className="saved-view"><div className="page-title-row"><div><span className="section-kicker">YOUR PERSONAL READING LIST</span><h1>Saved papers</h1><p>Private to this browser, ready for your next reading session.</p></div>{saved.length > 0 && <div className="export-actions"><button type="button" onClick={() => exportSaved("bib")}><FileDown size={15} /> BibTeX</button><button type="button" onClick={() => exportSaved("csv")}><Download size={15} /> CSV</button></div>}</div>{saved.length ? <div className="paper-list">{saved.map((paper) => <div key={paper.id}><PaperCard paper={paper} saved onSave={() => toggleSaved(paper)} onInspect={() => setSelected(paper)} />{paper.note && <div className="saved-note"><NotebookPen size={14} /> {paper.note}</div>}</div>)}</div> : <div className="empty-results"><BookMarked size={27} /><h3>Your reading list is ready.</h3><p>Save a paper from your search results and it will appear here. It stays on this device.</p><button type="button" onClick={() => setView("search")} className="search-submit mt-4">Find papers <Search size={16} /></button></div>}</section>}

          {view === "guide" && <section id="research-guide" className="guide-view"><div className="page-title-row"><div><span className="section-kicker">A FIELD GUIDE FOR YOUR THESIS</span><h1>Research, with a clear method.</h1><p>Use this as a starting framework, then confirm your plan with your supervisor and institution.</p></div></div><ResearchGuide onTryExample={setExample} /></section>}

          <footer className="workspace-footer"><span>Thesis Evidence Workspace</span><span>Academic discovery support · Not medical advice</span></footer>
        </main>
      </div>

      {mobileMenu && <button aria-label="Close menu" className="mobile-backdrop" onClick={() => setMobileMenu(false)} />}
      {selected && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><section className="paper-dialog" role="dialog" aria-modal="true" aria-labelledby="paper-title"><div className="dialog-header"><span className="section-kicker">EUROPE PMC RECORD</span><button type="button" className="icon-button" aria-label="Close details" onClick={() => setSelected(null)}><X size={19} /></button></div><div className="dialog-scroll"><div className="flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{selected.year}</span><span>·</span><span>{selected.journal}</span>{selected.openAccess && <span>· Open access</span>}</div><h2 id="paper-title" className="mt-3 font-display text-3xl leading-tight">{selected.title}</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">{selected.authors}</p><div className="citation-block"><div className="flex items-center justify-between gap-3"><strong>Bibliographic details</strong><button type="button" onClick={copyCitation} className="text-action">{copied ? <Check size={14} /> : <FileDown size={14} />}{copied ? "Copied" : "Copy citation"}</button></div><p className="mt-3 text-sm leading-6">{citationText(selected)}</p>{selected.doi && <p className="mt-2 text-xs text-muted-foreground">DOI: {selected.doi}</p>}{selected.pmid && <p className="mt-1 text-xs text-muted-foreground">PMID: {selected.pmid}</p>}</div><h3 className="mt-7 font-display text-2xl">Abstract</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/80">{selected.abstract}</p><label className="mt-7 block text-sm font-semibold">Your research note<textarea value={saved.find((item) => item.id === selected.id)?.note || ""} onChange={(event) => saveNote(selected, event.target.value)} placeholder="Add a private note for your thesis review…" rows={4} className="note-input" /></label><p className="mt-2 text-xs text-muted-foreground">Notes are saved in this browser only.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" className="search-submit" onClick={() => toggleSaved(selected)}>{saved.some((item) => item.id === selected.id) ? <Check size={16} /> : <BookMarked size={16} />}{saved.some((item) => item.id === selected.id) ? "Saved to your list" : "Save this paper"}</button><a className="text-action" href={selected.sourceUrl} target="_blank" rel="noreferrer">Open source record <ChevronRight size={15} /></a></div></div></section></div>}
    </div>
  )
}

export default Index
