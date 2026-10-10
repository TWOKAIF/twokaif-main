"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const snapshot = () => document.documentElement.dataset.theme !== "light"
const serverSnapshot = () => true
function subscribe(update: () => void) {
  window.addEventListener("adis-theme-change", update)
  return () => window.removeEventListener("adis-theme-change", update)
}

export function ThemeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  function toggle() {
    const theme = isDark ? "light" : "dark"
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#ffffff" : "#060607")
    window.dispatchEvent(new Event("adis-theme-change"))
  }
  return (
    <button type="button" role="switch" aria-checked={isDark} aria-label="Тёмная тема" onClick={toggle}
      title={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      className={cn("theme-toggle", className)}>
      <span className={cn("theme-toggle-icon", isDark && "is-selected")} aria-hidden="true"><Moon size={16} strokeWidth={1.5}/></span>
      <span className={cn("theme-toggle-icon", !isDark && "is-selected")} aria-hidden="true"><Sun size={16} strokeWidth={1.5}/></span>
    </button>
  )
}
