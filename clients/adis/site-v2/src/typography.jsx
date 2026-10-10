import { ScrollInk } from './scroll-ink.jsx'
import React, { Children, cloneElement, isValidElement } from 'react'

const shortWords = new Set('а в во и к ко о об обо с со у я не ни на но по из за от до или без для при над под про как через перед между после'.split(' '))
const phrases = [
  /WEDDING[ \u00a0]+AWARDS/gi,
  /ROAST[ \u00a0]+BATTLE/gi,
  /ВЕДУЩИЙ[ \u00a0]+РОССИИ/gi,
  /«ИСТОРИИ[ \u00a0]+НА[ \u00a0]+СПОР»/gi,
  /«У[ \u00a0]+МЕНЯ[ \u00a0]+ХУЖЕ»/gi,
  /СОЛЬНЫЙ[ \u00a0]+СТЕНДАП[\-\u2011]КОНЦЕРТ/gi,
  /ЖИВОЙ[ \u00a0]+ЗАЛ/gi,
  /ЭНЕРГИЯ[ \u00a0]+МОМЕНТА/gi,
  /КАКОМ[ \u00a0]+ОСНОВАНИИ/gi,
  /ВНЕШНИЕ[ \u00a0]+СЕРВИСЫ/gi,
  /РЕШИЛ[ \u00a0]+СООБЩИТЬ[ \u00a0]+САМ/gi,
  /ИХ[ \u00a0]+ВКЛЮЧЕНИЯ/gi,
  /РЕГУЛЯРНО[ \u00a0]+ОБНОВЛЯЮТСЯ/gi,
  /ИСПОЛНЕНИЯ[ \u00a0]+ДОГОВОРА/gi,
  /ТРЕБУЕТ[ \u00a0]+ПОСЕТИТЕЛЬ/gi,
  /ТИП[ \u00a0]+БРАУЗЕРА[ \u00a0]+И[ \u00a0]+УСТРОЙСТВА/gi,
  /ИСПОЛНИТЬ[ \u00a0]+ДОГОВОР/gi,
  /РОСКОМНАДЗОРЕ[ \u00a0]+ИЛИ[ \u00a0]+СУДЕ/gi,
]

// Format rendered copy only: links, source content and legal wording stay intact.
export function readableText(value) {
  let text = String(value ?? '').replace(/([A-Za-zА-ЯЁа-яё0-9])-(?=[A-Za-zА-ЯЁа-яё0-9])/g, '$1\u2011')
  for (const phrase of phrases) text = text.replace(phrase, (match) => match.replace(/[ \u00a0]+/g, '\u00a0'))
  const parts = text.split(/(\s+)/)
  for (let index = 1; index < parts.length; index += 2) {
    const previous = parts[index - 1].replace(/^[«“"([{]+/, '').toLowerCase()
    if (shortWords.has(previous)) parts[index] = '\u00a0'
  }
  return parts.join('')
}

export function CopyThoughts({ text, animate = false }) {
  // Existing desktop line breaks survive; narrow layouts wrap each full thought.
  const thoughts = String(text ?? '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []
  return thoughts.map((thought, index) => <span className="copy-thought" key={index}>{animate ? <ScrollInk text={readableText(thought)} /> : readableText(thought)}</span>)
}

export function readableChildren(children) {
  return Children.map(children, (child) => {
    if (typeof child === 'string') return readableText(child)
    if (!isValidElement(child) || child.props.children === undefined) return child
    return cloneElement(child, undefined, readableChildren(child.props.children))
  })
}
