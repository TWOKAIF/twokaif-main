'use client'

import Hls from 'hls.js'
import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

type EventVideo = { video: string; title: string; aspectRatio: number }
import { useSmoothCorners } from '@/lib/use-smooth-corners'

import s from './video-player.module.css'

// Declare user-requested media playback to supporting WebKit audio sessions.
// Feature detection keeps older browsers on their ordinary media path.
function claimPlaybackSession() {
  if (!('audioSession' in navigator)) return
  const session = navigator.audioSession
  if (!(session instanceof EventTarget) || !('type' in session)) return
  const previous = session.type
  try {
    session.type = 'playback'
  } catch {
    return // Optional platform API must not prevent the video from starting.
  }
  return () => {
    try {
      if (session.type === 'playback') session.type = previous
    } catch {
      // The platform may invalidate its audio session when the page closes.
    }
  }
}

function play(video: HTMLVideoElement) {
  void video.play().catch((error: DOMException) => {
    if (video.isConnected && error.name !== 'AbortError') {
      video.dispatchEvent(
        new CustomEvent('playbackfailure', { detail: error.name })
      )
    }
  })
}

// Called synchronously by the card's click, after flushSync mounts the media.
// Never retry with muted autoplay: an audible start is the viewer's intent.
export function startVideo(video: HTMLVideoElement | null) {
  if (!video) return
  video.defaultMuted = false
  video.muted = false
  video.volume = 1
  play(video)
}

function clock(seconds: number) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

function PlaybackIcon({ paused }: { paused: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={s.playbackIcon}>
      {paused ? (
        <path d="M8 5v14l11-7Z" />
      ) : (
        <>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </>
      )}
    </svg>
  )
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      {muted ? (
        <path d="m16 9 6 6m0-6-6 6" />
      ) : (
        <>
          <path d="M15 8a6 6 0 0 1 0 8" />
          <path d="M18 5a10 10 0 0 1 0 14" />
        </>
      )}
    </svg>
  )
}

export function VideoPlayer({
  item,
  onDismiss,
  mediaRef,
  lockScroll,
}: {
  item: EventVideo
  lockScroll: () => () => void
  onDismiss: () => void
  mediaRef: RefObject<HTMLVideoElement | null>
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const { ref: cornerRef, style: cornerStyle } =
    useSmoothCorners<HTMLDivElement>(12, 1)
  const retryRef = useRef<(() => void) | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // The player mounts inside the first click. Choose its initial presentation
  // synchronously so opening on a phone does not defer the audible play call.
  const [expanded, setExpanded] = useState(
    () =>
      window.matchMedia(
        '(max-width: 767px), (pointer: coarse) and (max-width: 999px) and (max-height: 599px)'
      ).matches
  )
  const [aspectRatio, setAspectRatio] = useState(item.aspectRatio)
  const [paused, setPaused] = useState(true)
  const [muted, setMuted] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [issue, setIssue] = useState<'blocked' | 'error' | null>(null)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [visible, setVisible] = useState(true)
  const [interacting, setInteracting] = useState(false)
  const [activity, setActivity] = useState(0)

  useLayoutEffect(() => {
    const video = mediaRef.current
    if (!video) return
    const releaseAudioSession = claimPlaybackSession()
    let hls: Hls | undefined
    const fail = (event: Event) => {
      setIssue(
        (event instanceof CustomEvent ? event.detail : '') === 'NotAllowedError'
          ? 'blocked'
          : 'error'
      )
      setBuffering(false)
    }
    video.addEventListener('playbackfailure', fail)
    function load() {
      if (!video) return
      hls?.destroy()
      hls = undefined
      setIssue(null)
      setBuffering(true)
      const source = `https://kinescope.io/${item.video}/master.m3u8`
      // Prefer the native engine where audio tracks are exposed (WebKit).
      // Other MSE browsers use the same explicit alternate-audio pipeline.
      if (
        video.canPlayType('application/vnd.apple.mpegurl') &&
        ('audioTracks' in video || !Hls.isSupported())
      ) {
        video.src = source
      } else if (Hls.isSupported()) {
        // Full build supports Kinescope's separate AAC audio rendition.
        // No worker/blob script or third-party player/analytics is required.
        hls = new Hls({ enableWorker: false, maxBufferLength: 20 })
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setIssue('error')
            setBuffering(false)
          }
        })
        hls.attachMedia(video)
        hls.loadSource(source)
      } else {
        setIssue('error')
        setBuffering(false)
      }
    }
    load()
    retryRef.current = () => {
      load()
      startVideo(video)
    }
    return () => {
      video.removeEventListener('playbackfailure', fail)
      hls?.destroy()
      video.pause()
      video.removeAttribute('src')
      video.load()
      releaseAudioSession?.()
    }
  }, [item.video, mediaRef])

  const reveal = useCallback(() => {
    setVisible(true)
    setActivity((value) => value + 1)
    clearTimeout(hideTimer.current)
  }, [])
  const togglePlay = useCallback(() => {
    const video = mediaRef.current
    if (!video) return
    reveal()
    if (video.paused) {
      setIssue(null)
      play(video)
    } else video.pause()
  }, [mediaRef, reveal])
  useEffect(() => {
    clearTimeout(hideTimer.current)
    if (visible && !paused && !buffering && !issue && !interacting) {
      hideTimer.current = setTimeout(() => setVisible(false), 2800)
    }
    return () => clearTimeout(hideTimer.current)
  }, [visible, paused, buffering, issue, interacting, activity])

  useLayoutEffect(() => {
    if (!expanded) return
    const dialog = ref.current
    if (!dialog) return
    const viewport = window.visualViewport
    const update = () => {
      dialog.style.setProperty(
        '--player-viewport-width',
        `${viewport?.width ?? window.innerWidth}px`
      )
      dialog.style.setProperty(
        '--player-viewport-height',
        `${viewport?.height ?? window.innerHeight}px`
      )
      dialog.style.setProperty(
        '--player-viewport-top',
        `${viewport?.offsetTop ?? 0}px`
      )
      dialog.style.setProperty(
        '--player-viewport-left',
        `${viewport?.offsetLeft ?? 0}px`
      )
    }
    update()
    viewport?.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      viewport?.removeEventListener('resize', update)
      viewport?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [expanded])

  useLayoutEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    let releaseScroll: (() => void) | undefined
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape' && !expanded) {
        event.preventDefault()
        onDismiss()
      }
      if (event.target !== dialog) return
      if (event.key === ' ' || event.key === 'k') {
        event.preventDefault()
        togglePlay()
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        const video = mediaRef.current
        if (video && Number.isFinite(video.duration))
          video.currentTime = Math.max(
            0,
            Math.min(
              video.duration,
              video.currentTime + (event.key === 'ArrowRight' ? 5 : -5)
            )
          )
      }
    }
    function backdrop(event: MouseEvent) {
      if (expanded && event.target === dialog) setExpanded(false)
    }
    dialog.addEventListener('keydown', keyboard)
    dialog.addEventListener('click', backdrop)
    if (expanded) {
      releaseScroll = lockScroll()
      dialog.showModal()
    } else dialog.show()
    dialog.focus({ preventScroll: true })
    reveal()
    return () => {
      dialog.removeEventListener('keydown', keyboard)
      dialog.removeEventListener('click', backdrop)
      releaseScroll?.()
      dialog.close()
    }
  }, [expanded, onDismiss, mediaRef, togglePlay, reveal, lockScroll])

  const controlsVisible =
    visible || paused || buffering || !!issue || interacting
  const progress = duration ? (time / duration) * 100 : 0

  // SAFETY: These objects only extend CSSProperties with CSS custom properties.
  const playerStyle = { '--video-ratio': aspectRatio } as CSSProperties
  // SAFETY: --progress is a percentage consumed by the timeline gradient.
  const progressStyle = { '--progress': `${progress}%` } as CSSProperties

  return (
    <dialog
      ref={ref}
      id="video-player"
      data-lenis-prevent={expanded ? "" : undefined}
      tabIndex={-1}
      className={s.dialog}
      style={playerStyle}
      onKeyDownCapture={reveal}
      data-expanded={expanded}
      data-controls={controlsVisible}
      aria-label={`Видео: ${item.title}`}
      onCancel={(event) => {
        event.preventDefault()
        setExpanded(false)
      }}
    >
      <div
        ref={cornerRef}
        style={cornerStyle}
        className={s.stage}
        onPointerMove={(event) => {
          if (event.pointerType === 'mouse') reveal()
        }}
        onFocusCapture={(event) => {
          if (event.target.classList.contains(s.playerSurface ?? '')) return
          reveal()
          setInteracting(event.target.matches(':focus-visible'))
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setInteracting(false)
        }}
      >
        {/* Caption files are not supplied for these source videos. */}
        {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={mediaRef}
          playsInline
          preload="none"
          crossOrigin="anonymous"
          aria-label={`Видео: ${item.title}`}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget
            if (video.videoWidth && video.videoHeight) setAspectRatio(video.videoWidth / video.videoHeight)
          }}
          onPlaying={() => {
            setPaused(false)
            setBuffering(false)
            setIssue(null)
          }}
          onPause={() => setPaused(true)}
          onEnded={() => setPaused(true)}
          onWaiting={() => setBuffering(true)}
          onCanPlay={() => setBuffering(false)}
          onDurationChange={(event) =>
            setDuration(
              Number.isFinite(event.currentTarget.duration)
                ? event.currentTarget.duration
                : 0
            )
          }
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onVolumeChange={(event) =>
            setMuted(
              event.currentTarget.muted || event.currentTarget.volume === 0
            )
          }
          onError={() => {
            setIssue('error')
            setBuffering(false)
          }}
        />
        <button
          type="button"
          className={s.playerSurface}
          tabIndex={-1}
          aria-label="Показать управление видео"
          onClick={() => {
            if (paused) togglePlay()
            else reveal()
          }}
        />
        {buffering && !issue && (
          <span
            className={s.loading}
            role="status"
            aria-label="Загружаем видео"
          />
        )}
        <div className={s.playerChrome} inert={!controlsVisible}>
          <button
            type="button"
            className={`${s.playerButton} ${s.close}`}
            aria-label="Закрыть видео"
            onClick={onDismiss}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <div
            className={s.playerControls}
            onPointerDown={() => setInteracting(true)}
            onPointerCancel={() => setInteracting(false)}
            onPointerUp={(event) => {
              event.currentTarget.querySelector<HTMLElement>(':focus')?.blur()
              setInteracting(false)
            }}
          >
            <button
              type="button"
              className={s.playerButton}
              aria-label={
                paused ? 'Воспроизвести видео' : 'Приостановить видео'
              }
              onClick={togglePlay}
            >
              <PlaybackIcon paused={paused} />
            </button>
            <input
              className={s.timeline}
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={Math.min(time, duration || 1)}
              disabled={!duration}
              aria-label="Позиция видео"
              aria-valuetext={`${clock(time)} из ${clock(duration)}`}
              style={progressStyle}
              onChange={(event) => {
                const video = mediaRef.current
                if (video) {
                  video.currentTime = Number(event.target.value)
                  setTime(video.currentTime)
                }
              }}
            />
            <span className={s.playerTime} aria-hidden="true">
              {clock(Math.max(0, duration - time))}
            </span>
            <button
              type="button"
              className={s.playerButton}
              aria-label={muted ? 'Включить звук' : 'Выключить звук'}
              onClick={() => {
                const video = mediaRef.current
                if (video) {
                  if (video.muted || video.volume === 0) {
                    video.muted = false
                    video.volume = 1
                  } else video.muted = true
                }
              }}
            >
              <SoundIcon muted={muted} />
            </button>
            <button
              type="button"
              className={s.playerButton}
              aria-label={
                expanded ? 'Свернуть видео в карточку' : 'Развернуть видео'
              }
              aria-pressed={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={expanded ? "M4 9h5V4m11 11h-5v5M9 9 3 3m12 12 6 6" : "M9 4H4v5m11 11h5v-5M4 4l6 6m10 10-6-6"} /></svg>
            </button>
          </div>
        </div>
        {issue && (
          <div className={s.playerError} role="status">
            <p>
              {issue === 'blocked'
                ? 'Нажми, чтобы включить видео со звуком'
                : 'Не удалось загрузить видео'}
            </p>
            <button
              type="button"
              onClick={() => {
                if (issue === 'blocked') {
                  setIssue(null)
                  startVideo(mediaRef.current)
                } else retryRef.current?.()
              }}
            >
              {issue === 'blocked' ? 'Включить видео' : 'Повторить'}
            </button>
            {issue === 'error' && (
              <a
                href={`https://kinescope.io/${item.video}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть отдельно ↗
              </a>
            )}
          </div>
        )}
      </div>
    </dialog>
  )
}
