import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const inputPath = resolve(process.argv[2] || "/private/tmp/adis-framer-index.html")
const outputPath = resolve(process.argv[3] || new URL("./index.html", import.meta.url).pathname)

// The demo is now an exact content mirror of the published Framer page.
// Only normalize line endings for git; do not patch the DOM, responsive
// breakpoints, text, or animations here.
const source = readFileSync(inputPath, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")

const badgeStyle = `
    <style id="adis-demo-branding">
        #__framer-badge-container { display: none !important; }
    </style>`

if (!source.includes("</head>")) throw new Error("Framer document has no closing head tag")
const html = source.replace("</head>", `${badgeStyle}\n</head>`)
writeFileSync(outputPath, html)
console.log(`Mirrored ${inputPath} -> ${outputPath}`)
