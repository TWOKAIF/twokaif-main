import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const inputPath = resolve(process.argv[2] || "/private/tmp/adis-framer-index.html")
const outputPath = resolve(process.argv[3] || new URL("./index.html", import.meta.url).pathname)

let html = readFileSync(inputPath, "utf8")

function replaceOnce(pattern, replacement, label) {
    const matches = html.match(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))
    if (!matches || matches.length !== 1) {
        throw new Error(`${label}: expected exactly one match, found ${matches?.length || 0}`)
    }
    html = html.replace(pattern, replacement)
}

function replaceLiteralOnce(from, to, label) {
    const parts = html.split(from)
    if (parts.length !== 2) {
        throw new Error(`${label}: expected exactly one match, found ${parts.length - 1}`)
    }
    html = parts.join(to)
}

html = html
    .replace(/<!-- Made in Framer[^>]*-->\s*/g, "")
    .replace(/<!-- Published [^>]*-->\s*/g, "")
    .replace(/\s*<meta name="generator"[^>]*>/g, "")
    .replace(/\s*<meta name="framer-search-index(?:-fallback)?"[^>]*>/g, "")
    .replace(/\s*<link(?=[^>]*\brel="icon")[^>]*>/g, "")
    .replace(/\s*<link(?=[^>]*\brel="apple-touch-icon")[^>]*>/g, "")
    .replace(/\s*<meta name="robots"[^>]*>/g, "")
    .replace(/\s*<script>try\{if\(localStorage\.getItem\("__framer_force_showing_editorbar_since"\)[\s\S]*?<\/script>/g, "")

replaceOnce(/<html lang="[^"]*"/, '<html lang="ru"', "document language")
replaceOnce(/<meta charset="utf-8">/, '<meta charset="utf-8">\n\t<meta name="robots" content="noindex,nofollow,noarchive">', "robots metadata")
replaceOnce(/<title>[\s\S]*?<\/title>/, "<title>Адис Маммо — артист, ведущий, комик</title>", "page title")
replaceOnce(
    /<meta name="description"[^>]*>/,
    '<meta name="description" content="Частные события, корпоративы, стендап и медийные проекты Адиса Маммо.">',
    "page description",
)
replaceOnce(/<meta property="og:title"[^>]*>/, '<meta property="og:title" content="Адис Маммо — артист, ведущий, комик">', "Open Graph title")
replaceOnce(
    /<meta property="og:description"[^>]*>/,
    '<meta property="og:description" content="Частные события, корпоративы, стендап и медийные проекты Адиса Маммо.">',
    "Open Graph description",
)
replaceOnce(/<meta property="og:image"[^>]*>/, '<meta property="og:image" content="https://adis-demo.twokaif.ru/og-cover.png">', "Open Graph image")
replaceOnce(/<meta name="twitter:title"[^>]*>/, '<meta name="twitter:title" content="Адис Маммо — артист, ведущий, комик">', "Twitter title")
replaceOnce(
    /<meta name="twitter:description"[^>]*>/,
    '<meta name="twitter:description" content="Частные события, корпоративы, стендап и медийные проекты Адиса Маммо.">',
    "Twitter description",
)
replaceOnce(/<meta name="twitter:image"[^>]*>/, '<meta name="twitter:image" content="https://adis-demo.twokaif.ru/og-cover.png">', "Twitter image")
replaceOnce(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="https://adis-demo.twokaif.ru/">', "canonical URL")
replaceOnce(/<meta property="og:url"[^>]*>/, '<meta property="og:url" content="https://adis-demo.twokaif.ru/">', "Open Graph URL")

replaceLiteralOnce(
    '<meta property="og:type" content="website">',
    '<meta property="og:type" content="website">\n    <meta property="og:site_name" content="Адис Маммо">',
    "Open Graph site name",
)

replaceLiteralOnce(
    "<!-- Open Graph -->",
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="preload" href="https://framerusercontent.com/assets/aHx6kD8NZziXZ3NAxl5MRap2lvg.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="https://framerusercontent.com/assets/9NFS0tfd3DVMOKZnkhYtK3Yw.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="https://framerusercontent.com/third-party-assets/fontshare/wf/2GQIT54GKQY3JRFTSHS4ARTRNRQISSAA/3CIP5EBHRRHE5FVQU3VFROPUERNDSTDF/JTSL5QESUXATU47LCPUNHZQBDDIWDOSW.woff2" as="font" type="font/woff2" crossorigin>
    <meta name="theme-color" content="#050505">
    <!-- Open Graph -->`,
    "local icons",
)

const deviceGateScript = `
    <script id="adis-device-gate">
        (() => {
            const updateDeviceGate = () => {
                const ua = navigator.userAgent
                const hasTouch = navigator.maxTouchPoints > 0
                    || matchMedia("(any-pointer: coarse)").matches
                    || matchMedia("(hover: none)").matches
                const mobileOrTablet = /iPad|iPhone|Android|Mobile|Tablet|Silk|Kindle/i.test(ua)
                    || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
                const desktopGeometry = innerWidth >= 1200
                    && innerWidth / Math.max(innerHeight, 1) >= 1.45
                document.documentElement.classList.toggle(
                    "adis-desktop-ok",
                    desktopGeometry && !hasTouch && !mobileOrTablet,
                )
            }
            updateDeviceGate()
            addEventListener("resize", updateDeviceGate, { passive: true })
            addEventListener("orientationchange", updateDeviceGate, { passive: true })
        })()
    </script>`

const demoStyles = `
    <style id="adis-demo-overrides">
        #__framer-badge-container { display: none !important; }
        html, body { overflow: hidden !important; background: #050505 !important; }
        #main { visibility: hidden !important; }
        #adis-desktop-gate {
            position: fixed;
            inset: 0;
            z-index: 2147483646;
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px;
            background: #050505;
            color: #fff;
            text-align: center;
            font-family: "Inter Tight", Arial, sans-serif;
        }
        #adis-desktop-gate strong {
            max-width: 760px;
            font-family: "Druk Wide Cyr Bold", "Arial Black", sans-serif;
            font-size: clamp(34px, 10vw, 68px);
            line-height: 0.9;
            letter-spacing: 0;
        }
        #adis-desktop-gate span {
            margin-top: 28px;
            color: #8c8c8c;
            font-size: 15px;
            line-height: 1.35;
            letter-spacing: 0;
        }
        html.adis-desktop-ok, html.adis-desktop-ok body { overflow: auto !important; }
        html.adis-desktop-ok.adis-content-clean #main { visibility: visible !important; }
        html.adis-desktop-ok.adis-content-clean #adis-desktop-gate { display: none !important; }
        @media (min-width: 1200px) and (max-width: 1439.98px) {
            .framer-EsYhJ .framer-1mexjrf h3 {
                --framer-line-height: 0.92em !important;
                line-height: 0.92em !important;
            }
        }
    </style>`

replaceOnce(/<\/head>/, `${deviceGateScript}\n${demoStyles}\n</head>`, "device gate and demo styles")

const gate = `
    <div id="adis-desktop-gate" aria-label="Версия для компьютера">
        <strong>АДИС МАММО</strong>
        <span>Версия для компьютера.<br>Открой сайт на MacBook или ПК.</span>
    </div>`

replaceOnce(/<body([^>]*)>/, `<body$1>${gate}`, "desktop gate")

const cleanupScript = `
    <script id="adis-demo-cleanup">
        (() => {
            const pageTitle = "Адис Маммо — артист, ведущий, комик"
            const removeBadge = () => document.getElementById("__framer-badge-container")?.remove()
            const removeEnglishBio = () => {
                document.querySelectorAll("h5").forEach(element => {
                    const text = element.textContent.replace(/\s+/g, " ").trim()
                    if (text.startsWith("BASED IN USA, I AM AN INNOVATIVE DESIGNER AND DIGITAL ARTIST")) {
                        element.closest('[data-framer-component-type="RichTextContainer"]')?.remove()
                        return
                    }
                    if (text.startsWith("I'M AN INNOVATIVE DESIGNER AND DIGITAL ARTIST IN TOKYO")) {
                        element.textContent = "АВТОР ПОДКАСТА «ТЁМНАЯ СТОРОНА» И СОЗДАТЕЛЬ КАНАЛА «САРКАЗМОШНАЯ»."
                    }
                })
            }
            const translateFooter = () => {
                document.querySelectorAll("h6").forEach(element => {
                    if (element.textContent.trim() === "Back To Top") element.textContent = "НАВЕРХ"
                })
            }
            const lockTitle = () => {
                if (document.title !== pageTitle) document.title = pageTitle
            }
            const cleanTemplateResidue = () => {
                removeBadge()
                removeEnglishBio()
                translateFooter()
                lockTitle()
            }
            const menuIsOpen = () => [...document.querySelectorAll("*")].some(element => {
                if (element.children.length || element.textContent.trim() !== "ФОРМАТЫ") return false
                const rect = element.getBoundingClientRect()
                const style = getComputedStyle(element)
                return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && style.visibility !== "hidden" && style.display !== "none"
            })
            const closeMenuFallback = event => {
                const control = event.target.closest?.("a")
                if (!control || !menuIsOpen()) return
                const rect = control.getBoundingClientRect()
                const centered = Math.abs(rect.left + rect.width / 2 - innerWidth / 2) < 80
                if (!centered || rect.top > 140 || rect.width > 100 || rect.height > 100) return
                const scrollY = window.scrollY
                window.setTimeout(() => {
                    if (!menuIsOpen()) return
                    sessionStorage.setItem("adis-demo-scroll-position", String(scrollY))
                    window.location.reload()
                }, 180)
            }
            const restoreScroll = () => {
                const saved = sessionStorage.getItem("adis-demo-scroll-position")
                if (saved === null) return
                sessionStorage.removeItem("adis-demo-scroll-position")
                requestAnimationFrame(() => window.scrollTo(0, Number(saved) || 0))
            }
            const revealCleanContent = () => {
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    cleanTemplateResidue()
                    document.documentElement.classList.add("adis-content-clean")
                }))
            }
            document.addEventListener("click", closeMenuFallback, true)
            window.addEventListener("load", () => {
                cleanTemplateResidue()
                const observer = new MutationObserver(cleanTemplateResidue)
                observer.observe(document.documentElement, { childList: true, subtree: true })
                restoreScroll()
                revealCleanContent()
                window.setTimeout(() => observer.disconnect(), 15000)
            }, { once: true })
        })()
    </script>`

replaceOnce(/<\/body>/, `${cleanupScript}\n</body>`, "badge cleanup")

const forbidden = [
    "<title>Porto</title>",
    "minimal portfolio framer template",
    "default-favicon",
    "default-touch-icon",
    "higher-size-222081.framer.app",
    'name="generator"',
    "framer-search-index",
    "Made in Framer",
    "__framer_force_showing_editorbar_since",
]

for (const marker of forbidden) {
    if (html.includes(marker)) throw new Error(`Forbidden template marker remains: ${marker}`)
}

html = html.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "")
writeFileSync(outputPath, html)
console.log(`Prepared ${outputPath}`)
