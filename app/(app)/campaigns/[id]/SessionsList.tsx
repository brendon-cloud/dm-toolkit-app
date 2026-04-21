'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'

type Session = {
  id: string
  title: string | null
  session_number: number
  session_date: string | null
  status: string
  summary: string | null
  display_order: number | null
  archived: boolean
}

// ── Single sortable row ──────────────────────────────────────────────────────
function SessionRow({
  session,
  campaignId,
  onDelete,
  onArchive,
  confirmDeleteId,
  setConfirmDeleteId,
}: {
  session: Session
  campaignId: string
  onDelete: (id: string) => void
  onArchive: (id: string, archived: boolean) => void
  confirmDeleteId: string | null
  setConfirmDeleteId: (id: string | null) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isConfirming = confirmDeleteId === session.id
  const dateStr = session.session_date
    ? new Date(session.session_date).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 bg-surface border border-border rounded-toolkit
        transition-all
        ${isDragging ? 'opacity-50 shadow-xl z-50 scale-[1.01]' : ''}
        ${session.archived ? 'opacity-60' : ''}
      `}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="pl-3 pr-1 py-5 text-border hover:text-muted2 transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="2" y="2" width="2" height="2" rx="1" />
          <rect x="6" y="2" width="2" height="2" rx="1" />
          <rect x="10" y="2" width="2" height="2" rx="1" />
          <rect x="2" y="6" width="2" height="2" rx="1" />
          <rect x="6" y="6" width="2" height="2" rx="1" />
          <rect x="10" y="6" width="2" height="2" rx="1" />
          <rect x="2" y="10" width="2" height="2" rx="1" />
          <rect x="6" y="10" width="2" height="2" rx="1" />
          <rect x="10" y="10" width="2" height="2" rx="1" />
        </svg>
      </button>

      {/* Session number badge */}
      <div className="w-9 h-9 rounded-toolkit-sm bg-surface2 border border-border flex items-center justify-center shrink-0">
        <span className="font-cinzel text-muted text-xs font-bold">#{session.session_number}</span>
      </div>

      {/* Session info — clickable */}
      <Link
        href={`/campaigns/${campaignId}/sessions/${session.id}`}
        className="flex-1 py-4 min-w-0"
      >
        <h3 className="font-cinzel font-bold text-text group-hover:text-gold transition-colors truncate">
          {session.title || `Session ${session.session_number}`}
        </h3>
        {session.summary && (
          <p className="text-muted text-xs mt-0.5 truncate">{session.summary}</p>
        )}
        {dateStr && !session.summary && (
          <p className="text-muted text-xs mt-0.5">{dateStr}</p>
        )}
      </Link>

      {/* Status + actions */}
      <div className="flex items-center gap-2 pr-3 shrink-0">
        {/* Status badge */}
        {session.status === 'processing' && (
          <span className="text-xs text-accent2 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full font-cinzel">
            Processing…
          </span>
        )}
        {session.status === 'complete' && (
          <span className="text-xs text-green2 bg-green/10 border border-green/20 px-2 py-0.5 rounded-full font-cinzel">
            Ready
          </span>
        )}
        {session.archived && (
          <span className="text-xs text-muted bg-surface3 border border-border px-2 py-0.5 rounded-full font-cinzel">
            Archived
          </span>
        )}

        {/* Delete confirm inline */}
        {isConfirming ? (
          <div className="flex items-center gap-1.5 bg-red/10 border border-red/30 rounded-toolkit-sm px-3 py-1.5">
            <span className="text-xs text-red2 font-cinzel mr-1">Delete?</span>
            <button
              onClick={() => onDelete(session.id)}
              className="text-xs text-red2 font-cinzel font-bold hover:text-red2 transition-colors"
            >
              Yes
            </button>
            <span className="text-border">·</span>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="text-xs text-muted font-cinzel hover:text-text transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {/* Archive toggle */}
            <button
              onClick={() => onArchive(session.id, !session.archived)}
              title={session.archived ? 'Unarchive' : 'Archive'}
              className="w-7 h-7 rounded-toolkit-sm hover:bg-surface3 transition-colors flex items-center justify-center text-muted hover:text-muted2"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                {session.archived ? (
                  // Unarchive icon (box with up arrow)
                  <>
                    <rect x="2" y="5" width="12" height="9" rx="1.5" />
                    <path d="M2 5l1.5-3h9L14 5" />
                    <path d="M8 8v4M6 10l2-2 2 2" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ) : (
                  // Archive icon (box with down arrow)
                  <>
                    <rect x="2" y="5" width="12" height="9" rx="1.5" />
                    <path d="M2 5l1.5-3h9L14 5" />
                    <path d="M8 8v4M6 10l2 2 2-2" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={() => setConfirmDeleteId(session.id)}
              title="Delete session"
              className="w-7 h-7 rounded-toolkit-sm hover:bg-red/10 transition-colors flex items-center justify-center text-muted hover:text-red2"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 4h10M6 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4M5 4l.5 9h5L11 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Arrow link */}
        <Link
          href={`/campaigns/${campaignId}/sessions/${session.id}`}
          className="text-muted text-sm group-hover:text-text transition-colors ml-1"
          tabIndex={-1}
        >
          →
        </Link>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function SessionsList({
  initialSessions,
  campaignId,
}: {
  initialSessions: Session[]
  campaignId: string
}) {
  const [sessions, setSessions] = useState<Session[]>(
    [...initialSessions].sort((a, b) => {
      const ao = a.display_order ?? a.session_number
      const bo = b.display_order ?? b.session_number
      return ao - bo
    })
  )
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sessions.findIndex(s => s.id === active.id)
    const newIndex = sessions.findIndex(s => s.id === over.id)
    const reordered = arrayMove(sessions, oldIndex, newIndex)
    setSessions(reordered)

    setSaving(true)
    const supabase = createClient()
    await Promise.all(
      reordered.map((s, i) =>
        supabase.from('sessions').update({ display_order: i }).eq('id', s.id)
      )
    )
    setSaving(false)
  }

  async function handleDelete(sessionId: string) {
    const supabase = createClient()
    await supabase.from('sessions').delete().eq('id', sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    setConfirmDeleteId(null)
  }

  async function handleArchive(sessionId: string, archived: boolean) {
    const supabase = createClient()
    await supabase.from('sessions').update({ archived }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, archived } : s))
  }

  const activeSessions  = sessions.filter(s => !s.archived)
  const archivedSessions = sessions.filter(s => s.archived)
  const visibleSessions = showArchived ? sessions : activeSessions

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-5 opacity-40">📖</div>
        <h2 className="font-cinzel text-lg font-semibold text-muted mb-2">No sessions yet</h2>
        <p className="text-muted text-sm max-w-xs leading-relaxed mb-6 font-lora">
          After your first session, upload the transcript and Archivist will transform it into a structured chronicle.
        </p>
        <Link
          href={`/campaigns/${campaignId}/sessions/new`}
          className="bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm px-6 py-3 rounded-toolkit-sm hover:opacity-90 transition-opacity"
        >
          Add Your First Session
        </Link>
      </div>
    )
  }

  return (
    <div>
      {saving && (
        <div className="mb-3 text-xs text-muted font-cinzel tracking-wide text-right animate-pulse">
          Saving order…
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleSessions.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {visibleSessions.map(session => (
              <SessionRow
                key={session.id}
                session={session}
                campaignId={campaignId}
                onDelete={handleDelete}
                onArchive={handleArchive}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Archived toggle */}
      {archivedSessions.length > 0 && (
        <button
          onClick={() => setShowArchived(v => !v)}
          className="mt-6 w-full flex items-center gap-3 text-xs text-muted hover:text-muted2 font-cinzel tracking-widest uppercase transition-colors"
        >
          <div className="flex-1 h-px bg-border" />
          <span>{showArchived ? 'Hide' : 'Show'} {archivedSessions.length} archived session{archivedSessions.length !== 1 ? 's' : ''}</span>
          <div className="flex-1 h-px bg-border" />
        </button>
      )}
    </div>
  )
}
