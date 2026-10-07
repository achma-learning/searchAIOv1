export interface Paper {
  id: string
  title: string
  authors: string
  journal: string
  year: string
  doi: string
  pmid: string
  abstract: string
  types: string[]
  sourceUrl: string
  openAccess: boolean
}

export interface SavedPaper extends Paper {
  note: string
  savedAt: string
}

export function normalizePaper(record: any): Paper {
  const doi = record.doi || ""
  const pmid = record.pmid || ""
  const title = record.title || "Untitled record"
  const authors = record.authorString || record.authorList?.author?.map((author: any) => author.fullName).filter(Boolean).join(", ") || "Author details unavailable"
  return {
    id: pmid || doi || `${title}-${record.pubYear || ""}`,
    title,
    authors,
    journal: record.journalTitle || record.journalInfo?.journal?.title || "Journal not listed",
    year: String(record.pubYear || record.firstPublicationDate?.slice(0, 4) || "Year unavailable"),
    doi,
    pmid,
    abstract: record.abstractText || "No abstract is available in this record.",
    types: record.pubTypeList?.pubType || [],
    sourceUrl: pmid ? `https://europepmc.org/article/MED/${pmid}` : doi ? `https://doi.org/${doi}` : "https://europepmc.org/",
    openAccess: record.isOpenAccess === "Y",
  }
}

export function citationText(paper: Paper) {
  return `${paper.authors}. ${paper.title}. ${paper.journal}. ${paper.year}${paper.doi ? `. doi:${paper.doi}` : ""}.`
}

export function bibtex(paper: Paper) {
  const key = (paper.authors.split(",")[0] || "paper").replace(/[^a-z0-9]/gi, "") + paper.year
  const fields = [`  title = {${paper.title}}`, `  author = {${paper.authors}}`, `  journal = {${paper.journal}}`, `  year = {${paper.year}}`]
  if (paper.doi) fields.push(`  doi = {${paper.doi}}`)
  if (paper.pmid) fields.push(`  pmid = {${paper.pmid}}`)
  return `@article{${key},\n${fields.join(",\n")}\n}`
}

export function csvCell(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`
}

export const sourceLinks = (query: string) => {
  const q = encodeURIComponent(query.trim())
  return [
    { label: "PubMed", href: `https://pubmed.ncbi.nlm.nih.gov/?term=${q}` },
    { label: "Google Scholar", href: `https://scholar.google.com/scholar?q=${q}` },
    { label: "Cochrane Library", href: `https://www.cochranelibrary.com/search?searchBy=all&searchText=${q}` },
    { label: "CISMeF", href: `https://www.cismef.org/` },
  ]
}