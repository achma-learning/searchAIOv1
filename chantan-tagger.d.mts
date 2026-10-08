// Type stub for chantan-tagger.mjs (Chantan's dev-only Babel plugin).
// Without it, `tsc -b` (the first half of `npm run build`) fails with TS7016
// because tsconfig.node.json is strict and the plugin ships as untyped JS.
// This file is NOT written by Chantan, so its syncs leave it alone.
declare const chantanTagger: (babel: unknown) => unknown
export default chantanTagger
