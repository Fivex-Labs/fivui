"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { MultipleSelector, type Option as MultiOption } from "@/components/ui/multiple-selector"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Star, StarOff, Circle, Paperclip, ChevronDown, Reply, ReplyAll, Forward } from "lucide-react"

export interface FivuiEmailFolder {
  id: string
  label: string
  count?: number
}

export interface FivuiEmailThread {
  id: string
  from: string
  subject: string
  snippet: string
  datetime: string
  unread?: boolean
  starred?: boolean
  labels?: string[]
  conversationCount?: number
  messages?: FivuiEmailMessage[]
}

export interface FivuiEmailMessage {
  id: string
  subject: string
  from: string
  to: string
  fromEmail?: string
  toEmail?: string
  datetime: string
  body: React.ReactNode
  html?: string
  labels?: string[]
  avatarUrl?: string
  attachments?: Array<{
    id: string
    name: string
    size: string
    thumbnailUrl?: string
    ext?: string
  }>
  toRecipients?: string[]
  ccRecipients?: string[]
}

export interface FivuiAppkitEmailProps {
  className?: string
  folders: FivuiEmailFolder[]
  selectedFolderId?: string
  onFolderSelect?: (folderId: string) => void

  searchValue?: string
  onSearchChange?: (value: string) => void

  threads: FivuiEmailThread[]
  loadingThreads?: boolean
  selectedThreadId?: string | null
  onThreadSelect?: (threadId: string) => void

  message?: FivuiEmailMessage | null
  loadingMessage?: boolean

  onCompose?: () => void

  emptyThreadsText?: string
  loadingIndicator?: React.ReactNode
  mailboxTitle?: string
  pageInfo?: string
  onPrevPage?: () => void
  onNextPage?: () => void
  labelsPalette?: Record<string, string>

  // Labels filter (left sidebar)
  availableLabels?: string[]
  selectedLabel?: string | null
  onSelectLabel?: (label: string | null) => void

  // Conversation messages for expanded view
  conversation?: FivuiEmailMessage[]

  // Compose/Reply handling
  onSendEmail?: (payload: { to: string; cc?: string; bcc?: string; subject: string; body: string; mode: "new" | "reply" | "replyAll" | "forward" }) => void

  // Infinite scroll for threads
  onLoadMoreThreads?: () => void
  hasMoreThreads?: boolean
  loadingMoreThreads?: boolean
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export function FivuiAppkitEmail({
  className,
  folders,
  selectedFolderId,
  onFolderSelect,
  searchValue,
  onSearchChange,
  threads,
  loadingThreads,
  selectedThreadId,
  onThreadSelect,
  message,
  loadingMessage,
  onCompose,
  emptyThreadsText = "No emails",
  loadingIndicator,
  mailboxTitle = "INBOX",
  pageInfo,
  onPrevPage,
  onNextPage,
  labelsPalette,
  availableLabels,
  selectedLabel,
  onSelectLabel,
  conversation,
  onSendEmail,
  onLoadMoreThreads,
  hasMoreThreads,
  loadingMoreThreads,
}: FivuiAppkitEmailProps) {
  const [composeOpen, setComposeOpen] = React.useState(false)
  const [composeMode, setComposeMode] = React.useState<"new" | "reply" | "replyAll" | "forward">("new")
  const [draftToList, setDraftToList] = React.useState<MultiOption[]>([])
  const [draftCcList, setDraftCcList] = React.useState<MultiOption[]>([])
  const [draftBccList, setDraftBccList] = React.useState<MultiOption[]>([])
  const [draftSubject, setDraftSubject] = React.useState("")
  const [draftBody, setDraftBody] = React.useState("")

  function openComposer(
    mode: "new" | "reply" | "replyAll" | "forward",
    seed?: { to?: string; cc?: string; subject?: string; body?: string }
  ) {
    setComposeMode(mode)
    setDraftToList(seed?.to ? splitEmails(seed.to) : [])
    setDraftCcList(seed?.cc ? splitEmails(seed.cc) : [])
    setDraftBccList([])
    setDraftSubject(seed?.subject ?? "")
    setDraftBody(seed?.body ?? "")
    setComposeOpen(true)
  }

  function handleSend() {
    const to = draftToList.map(o => o.label).join(", ")
    const cc = draftCcList.length ? draftCcList.map(o => o.label).join(", ") : undefined
    const bcc = draftBccList.length ? draftBccList.map(o => o.label).join(", ") : undefined
    onSendEmail?.({ to, cc, bcc, subject: draftSubject, body: draftBody, mode: composeMode })
    setComposeOpen(false)
  }
  const [mobileView, setMobileView] = React.useState<"list" | "detail">("list")
  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    function onChange() {
      setMobileView("list")
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  function handleSelectThread(id: string) {
    onThreadSelect?.(id)
    if (window.innerWidth < 768) {
      setMobileView("detail")
      setSidebarOpen(false)
    }
  }

  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const selectedThread = React.useMemo(() => threads.find(t => t.id === selectedThreadId) || null, [threads, selectedThreadId])

  const loadMoreRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    if (!onLoadMoreThreads || !hasMoreThreads || loadingMoreThreads) return
    const el = loadMoreRef.current
    if (!el) return
    const root = el.closest('[data-slot="scroll-area-viewport"]') as Element | null
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting) onLoadMoreThreads()
    }, { root: root ?? null, rootMargin: '200px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onLoadMoreThreads, hasMoreThreads, loadingMoreThreads, threads])

  // Contacts options for MultipleSelector (built from threads senders)
  const contactOptions = React.useMemo<MultiOption[]>(() => {
    const map = new Map<string, MultiOption>()
    threads.forEach(t => {
      const email = (t as any).fromEmail || `${t.from.split(" ")[0].toLowerCase()}@example.com`
      const opt = { value: email, label: email } as MultiOption
      map.set(email, opt)
    })
    return Array.from(map.values())
  }, [threads])

  async function searchContacts(query: string): Promise<MultiOption[]> {
    const q = query.trim().toLowerCase()
    const filtered = contactOptions.filter(o => o.label.toLowerCase().includes(q))
    return new Promise(resolve => setTimeout(() => resolve(filtered), 150))
  }

  function splitEmails(input: string): MultiOption[] {
    return input
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(email => ({ value: email.toLowerCase(), label: email }))
  }

  return (
    <div className={cn("h-full w-full md:w-auto md:border md:rounded-2xl overflow-hidden bg-background/50", className)}>
      <div className="md:hidden flex items-center justify-between border-b px-3 py-2">
        <button className="p-2 rounded hover:bg-accent/60" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <div className="font-semibold">{mobileView === 'list' ? mailboxTitle : 'Message'}</div>
        {mobileView === 'detail' ? (
          <button className="p-2 rounded hover:bg-accent/60" onClick={() => setMobileView('list')} aria-label="Back to list">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ) : <span className="w-8" />}
      </div>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-72 bg-background border-r" onClick={(e) => e.stopPropagation()}>
            <ScrollArea className="h-full overscroll-contain">
            <div className="p-4 flex flex-col gap-4">
              <Button size="sm" className="w-full" onClick={() => { onCompose ? onCompose() : openComposer("new"); setSidebarOpen(false) }}>Compose</Button>
              <div className="text-[11px] font-semibold tracking-wider" style={{ color: 'var(--muted-foreground)' }}>MAILBOXES</div>
              <nav className="space-y-1 text-sm" aria-label="Mailboxes">
                {folders.map((f) => {
                  const active = f.id === selectedFolderId
                  return (
                    <button key={f.id} type="button" onClick={() => { onFolderSelect?.(f.id); setSidebarOpen(false) }} className={cn("w-full text-left flex items-center justify-between rounded-md px-2 py-1.5 transition-colors", active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60")}>{f.label}{typeof f.count === 'number' && (<span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{f.count}</span>)}</button>
                  )
                })}
              </nav>
              {availableLabels && availableLabels.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>LABELS</div>
                  <div className="space-y-1" aria-label="Labels">
                    <button type="button" className={cn("w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors", !selectedLabel ? "bg-accent text-accent-foreground" : "hover:bg-accent/60")} onClick={() => { onSelectLabel?.(null); setSidebarOpen(false) }}>All</button>
                    {availableLabels.map((lbl) => (
                      <button key={lbl} type="button" className={cn("w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors flex items-center gap-2", selectedLabel === lbl ? "bg-accent text-accent-foreground" : "hover:bg-accent/60")} onClick={() => { onSelectLabel?.(lbl); setSidebarOpen(false) }}>
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: labelsPalette?.[lbl] ?? 'var(--accent)' }} />
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </ScrollArea>
          </div>
        </div>
      )}

      <ResizablePanelGroup direction="horizontal" className="hidden md:flex h-full">
        <ResizablePanel defaultSize={20} minSize={16} maxSize={40}>
          {/* Sidebar */}
          <div className="h-full border-r overflow-hidden">
            <ScrollArea className="h-full overscroll-contain">
              <div className="p-4 flex flex-col gap-4">
                <Button size="sm" className="w-full" onClick={() => (onCompose ? onCompose() : openComposer("new"))}>Compose</Button>
                <div className="text-[11px] font-semibold tracking-wider" style={{ color: 'var(--muted-foreground)' }}>MAILBOXES</div>
                <nav className="space-y-1 text-sm" aria-label="Mailboxes">
                  {folders.map((f) => {
                    const active = f.id === selectedFolderId
                    return (
                      <button key={f.id} type="button" onClick={() => onFolderSelect?.(f.id)} className={cn("w-full text-left flex items-center justify-between rounded-md px-2 py-1.5 transition-colors", active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60")} aria-current={active ? "page" : undefined}>
                        <span>{f.label}</span>
                        {typeof f.count === 'number' && (<span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{f.count}</span>)}
                      </button>
                    )
                  })}
                </nav>
                {availableLabels && availableLabels.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>LABELS</div>
                    <div className="space-y-1" aria-label="Labels">
                      <button type="button" className={cn("w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors", !selectedLabel ? "bg-accent text-accent-foreground" : "hover:bg-accent/60")} onClick={() => onSelectLabel?.(null)}>All</button>
                      {availableLabels.map((lbl) => (
                        <button key={lbl} type="button" className={cn("w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors flex items-center gap-2", selectedLabel === lbl ? "bg-accent text-accent-foreground" : "hover:bg-accent/60")} onClick={() => onSelectLabel?.(lbl)}>
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: labelsPalette?.[lbl] ?? 'var(--accent)' }} />
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        {/* Resizable handle (looks like a divider) */}
        <ResizableHandle withHandle={false} className="bg-border cursor-col-resize" />
        <ResizablePanel defaultSize={32} minSize={24}>
          {/* Threads Column with own scroll */}
          <div className="h-full grid grid-rows-[auto_minmax(0,1fr)]">
            <div className="border-b p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm" style={{ color: 'var(--muted-foreground)' }}>{mailboxTitle}</div>
              </div>
              <Input placeholder="Search mail" className="h-9" value={searchValue} onChange={(e) => onSearchChange?.(e.target.value)} aria-label="Search mail" />
            </div>
            <ScrollArea className="min-h-0 h-full overscroll-contain">
              {loadingThreads ? (
                <div className="p-4 space-y-3"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>
              ) : threads.length === 0 ? (
                <div className="p-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>{emptyThreadsText}</div>
              ) : (
                <Accordion type="multiple" className="divide-y" defaultValue={selectedThreadId ? [selectedThreadId] : []}>
                  {threads.map((t) => {
                    const active = t.id === selectedThreadId
                    const preview = (t.messages ?? []).slice(-3).reverse()
                    const hasMore = (t.messages?.length ?? 0) > preview.length
                    return (
                      <AccordionItem key={t.id} value={t.id} className={cn(active && "bg-accent/40")}>
                        <AccordionTrigger onClick={() => handleSelectThread(t.id)} className="group w-full text-left p-0 hover:no-underline [&>svg]:hidden">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                {t.unread && <Circle className="h-2 w-2 text-primary" fill="currentColor" />}
                                <div className={cn("font-medium truncate", t.unread && "font-bold")}>{t.from}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {t.starred ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
                                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t.datetime}</div>
                                {(t.messages?.length ?? 0) > 1 && (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                )}
                              </div>
                            </div>
                            <div className="mt-0.5 truncate text-sm font-medium" style={{ color: 'var(--foreground)', opacity: 0.9 }}>{t.subject}</div>
                            <div className="truncate text-sm" style={{ color: 'var(--muted-foreground)' }}>{t.snippet}</div>
                            {t.labels && t.labels.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">{t.labels.map((lbl) => { const bg = labelsPalette?.[lbl]; return (<span key={lbl} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ backgroundColor: bg ? bg : 'var(--accent)', borderColor: 'var(--border)', color: '#0f172a' }}>{lbl}</span>) })}</div>
                            )}
                          </div>
                        </AccordionTrigger>
                        {preview.length > 1 && (
                          <AccordionContent>
                            <div className="px-4 pb-3 space-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {preview.map((m) => (
                                <div key={m.id} className="truncate">{m.from}: {m.subject}</div>
                              ))}
                              {hasMore && <div>…</div>}
                            </div>
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    )
                  })}
                  {onLoadMoreThreads && hasMoreThreads && (
                    <div ref={loadMoreRef} className="p-4 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {loadingMoreThreads ? 'Loading more…' : 'Load more'}
                    </div>
                  )}
                </Accordion>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
        {/* Resizable handle (looks like a divider) */}
        <ResizableHandle withHandle={false} className="bg-border cursor-col-resize" />
        <ResizablePanel defaultSize={48}>
          {/* Detail Column with its own scroll */}
          <ScrollArea className="h-full overscroll-contain">
            <div className="p-6 space-y-4">
              {loadingMessage ? (
                <div className="space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/3" /><Card className="p-4 space-y-3"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /><Skeleton className="h-3 w-4/6" /></Card></div>
              ) : (selectedThread?.messages && selectedThread.messages.length > 0) ? (
                <div className="space-y-4">
                  {selectedThread.messages.slice().sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()).map((m, idx, arr) => {
                    const messageLabels = (m.labels && m.labels.length > 0) ? m.labels : (selectedThread?.labels || [])
                    return (
                    <div key={m.id} className="space-y-2">
                      <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {m.avatarUrl && (// eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatarUrl} alt="avatar" className="h-6 w-6 rounded-full" />
                        )}
                        <span className="text-foreground font-medium">{m.from}</span>
                        <span>to {m.to}</span>
                        <span>· {m.datetime}</span>
                        <div className="ml-auto flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Star">
                            {selectedThread?.starred ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Labels">
                                <Circle className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Apply label</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {(availableLabels ?? []).map(lbl => (
                                <DropdownMenuItem key={lbl}>{lbl}</DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M15 6l-1-3H10L9 6"/></svg>
                          </Button>
                        </div>
                      </div>
                      {messageLabels.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {messageLabels.map((lbl) => {
                            const bg = labelsPalette?.[lbl]
                            return (
                              <span
                                key={lbl}
                                className="text-[11px] px-2 py-0.5 rounded-full border"
                                style={{ backgroundColor: bg ? bg : 'var(--accent)', borderColor: 'var(--border)', color: '#0f172a' }}
                              >
                                {lbl}
                              </span>
                            )
                          })}
                        </div>
                      )}
                      <h2 className="text-lg font-semibold">{m.subject}</h2>
                      <Card className="p-4 prose prose-neutral dark:prose-invert max-w-none">{m.html ? (<div dangerouslySetInnerHTML={{ __html: m.html }} />) : (m.body)}</Card>
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="space-y-2"><div className="flex items-center gap-2 text-sm font-medium"><Paperclip className="h-4 w-4" /> {m.attachments.length} Attachments</div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{m.attachments.map((att) => (<Card key={att.id} className="p-3 flex items-center gap-3">{att.thumbnailUrl ? (// eslint-disable-next-line @next/next/no-img-element
                          <img src={att.thumbnailUrl} alt={att.name} className="h-10 w-14 rounded object-cover" />) : (<div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs font-medium">{att.ext?.toUpperCase() ?? 'FILE'}</div>)}<div className="min-w-0"><div className="truncate text-sm font-medium">{att.name}</div><div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{att.size}</div></div></Card>))}</div></div>
                      )}
                      {idx === arr.length - 1 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => openComposer('reply', { to: m.fromEmail ?? m.from, subject: `Re: ${m.subject}`, body: `\n\nOn ${m.datetime}, ${m.from} wrote:` })}>
                            <Reply className="mr-2 h-4 w-4" /> Reply
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openComposer('replyAll', { to: m.fromEmail ?? m.from, cc: [m.toEmail ?? m.to, ...(m.toRecipients ?? []), ...(m.ccRecipients ?? [])].filter(Boolean).join(', '), subject: `Re: ${m.subject}` })}>
                            <ReplyAll className="mr-2 h-4 w-4" /> Reply All
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openComposer('forward', { subject: `Fwd: ${m.subject}` })}>
                            <Forward className="mr-2 h-4 w-4" /> Forward
                          </Button>
                        </div>
                      )}
                    </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-[50vh] flex items-center justify-center">
                  <div className="text-center opacity-75">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2"/></svg>
                    </div>
                    <div className="text-lg font-semibold">No conversation selected</div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Choose an email from the list to see its details</div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* Mobile content */}
      <div className="md:hidden fixed inset-0 z-10 h-full w-full overflow-hidden bg-background">
        {mobileView === 'list' ? (
          <div className="h-full w-full grid grid-rows-[auto_minmax(0,1fr)]">
            <div className="border-b p-3 flex items-center gap-3">
              <button className="p-2 rounded hover:bg-accent/60" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              <Input placeholder="Search mail" className="h-9 w-full" value={searchValue} onChange={(e) => onSearchChange?.(e.target.value)} aria-label="Search mail" />
            </div>
            <ScrollArea className="min-h-0 h-full overscroll-contain">
              <div className="divide-y">
                {threads.map((t) => (
                  <button key={t.id} type="button" onClick={() => handleSelectThread(t.id)} className="w-full text-left p-4 hover:bg-accent/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">{t.unread && <Circle className="h-2 w-2 text-primary" fill="currentColor" />}<div className={cn("font-medium truncate", t.unread && "font-bold")}>{t.from}</div></div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t.datetime}</div>
                    </div>
                    <div className="mt-0.5 truncate text-sm">{t.subject}</div>
                    <div className="truncate text-sm" style={{ color: 'var(--muted-foreground)' }}>{t.snippet}</div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="h-full w-full overscroll-contain">
            <div className="p-4 space-y-4">
              {selectedThread ? (
                <>
                  <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b -mx-4 px-4 py-2 flex items-center gap-2">
                    <button className="p-2 rounded hover:bg-accent/60" aria-label="Back" onClick={() => setMobileView('list')}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <div className="min-w-0">
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Thread</div>
                      <h2 className="text-base font-semibold truncate">{selectedThread.subject}</h2>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Star">
                        {selectedThread?.starred ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Labels">
                            <Circle className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Apply label</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {(availableLabels ?? []).map(lbl => (
                            <DropdownMenuItem key={lbl}>{lbl}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M15 6l-1-3H10L9 6"/></svg>
                      </Button>
                    </div>
                  </div>

                  {selectedThread.messages?.map((m) => (
                    <div key={m.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {m.avatarUrl && (// eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatarUrl} alt="avatar" className="h-6 w-6 rounded-full" />
                        )}
                        <span className="text-foreground font-medium">{m.from}</span>
                        <span>· {m.datetime}</span>
                      </div>
                      <Card className="p-4 prose prose-neutral dark:prose-invert max-w-none">{m.html ? (<div dangerouslySetInnerHTML={{ __html: m.html }} />) : (m.body)}</Card>
                    </div>
                  ))}

                  {/* Quick actions for the thread */}
                  {selectedThread.messages && selectedThread.messages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(() => {
                        const last = selectedThread.messages![selectedThread.messages!.length - 1]
                        return (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openComposer('reply', { to: last.fromEmail ?? last.from, subject: `Re: ${last.subject}`, body: `\n\nOn ${last.datetime}, ${last.from} wrote:` })}>
                              <Reply className="mr-2 h-4 w-4" /> Reply
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openComposer('replyAll', { to: last.fromEmail ?? last.from, cc: [last.toEmail ?? last.to, ...(last.toRecipients ?? []), ...(last.ccRecipients ?? [])].filter(Boolean).join(', '), subject: `Re: ${last.subject}` })}>
                              <ReplyAll className="mr-2 h-4 w-4" /> Reply All
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openComposer('forward', { subject: `Fwd: ${last.subject}` })}>
                              <Forward className="mr-2 h-4 w-4" /> Forward
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Select an email</div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>To</Label>
              <MultipleSelector
                value={draftToList}
                onChange={setDraftToList}
                placeholder="recipient@example.com"
                creatable
                options={contactOptions}
                onSearch={searchContacts}
                hidePlaceholderWhenSelected
              />
            </div>
            <div className="grid gap-2">
              <Label>Cc</Label>
              <MultipleSelector
                value={draftCcList}
                onChange={setDraftCcList}
                placeholder="cc1@example.com, cc2@example.com"
                creatable
                options={contactOptions}
                onSearch={searchContacts}
                hidePlaceholderWhenSelected
              />
            </div>
            <div className="grid gap-2">
              <Label>Bcc</Label>
              <MultipleSelector
                value={draftBccList}
                onChange={setDraftBccList}
                placeholder="bcc1@example.com"
                creatable
                options={contactOptions}
                onSearch={searchContacts}
                hidePlaceholderWhenSelected
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="compose-subject">Subject</Label>
              <Input id="compose-subject" value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} placeholder="Subject" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="compose-body">Message</Label>
              <Textarea id="compose-body" rows={8} value={draftBody} onChange={(e) => setDraftBody(e.target.value)} placeholder="Insert text here…" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setComposeOpen(false)}>Discard</Button>
              <Button onClick={handleSend}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FivuiAppkitEmail