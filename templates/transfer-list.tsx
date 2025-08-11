"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Input } from "./input"
import { ScrollArea } from "./scroll-area"

export type TransferListItem = {
  id: string
  label: React.ReactNode
  disabled?: boolean
  // Additional arbitrary fields are allowed
  [key: string]: unknown
}

export type TransferListSide = "left" | "right"

export interface TransferListProps {
  items: TransferListItem[]
  /** Controlled ids on the left side. If provided, component becomes controlled. */
  leftIds?: string[]
  /** Controlled ids on the right side. If provided, component becomes controlled. */
  rightIds?: string[]
  /** Uncontrolled initial ids. If neither default props are provided, all items start on left. */
  defaultLeftIds?: string[]
  defaultRightIds?: string[]
  /** Called whenever the distribution changes. */
  onChange?: (next: { leftIds: string[]; rightIds: string[] }) => void

  /** Optional titles above each list. */
  leftTitle?: React.ReactNode
  rightTitle?: React.ReactNode
  /** Show selected/total counts in headers. */
  showCounts?: boolean

  /** Enable search inputs above lists. */
  enableSearch?: boolean
  /** Provide search placeholders for both sides. */
  searchPlaceholderLeft?: string
  searchPlaceholderRight?: string
  /** Provide a function to extract searchable text from an item. Defaults to string labels. */
  getItemSearchText?: (item: TransferListItem) => string

  /** Render function for each item. Defaults to rendering label. */
  renderItem?: (item: TransferListItem) => React.ReactNode
  /** Predicate to mark items as disabled dynamically. */
  isItemDisabled?: (item: TransferListItem) => boolean

  /** Show the middle control buttons. */
  showControlButtons?: boolean
  /** Allow drag & drop moving between lists. */
  allowDragAndDrop?: boolean

  /** Height of each list area. */
  listHeight?: number | string
  /** Classnames for wrapper and lists. */
  className?: string
  listClassName?: string
  leftListClassName?: string
  rightListClassName?: string
}

const DND_MIME = "application/x-fivui-transferlist"

function useControlledIds(
  controlled: string[] | undefined,
  defaultValue: string[] | undefined
) {
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? [])
  const isControlled = controlled !== undefined
  return [isControlled ? controlled! : internal, setInternal, isControlled] as const
}

export function TransferList(props: TransferListProps) {
  const {
    items,
    leftIds: leftIdsProp,
    rightIds: rightIdsProp,
    defaultLeftIds,
    defaultRightIds,
    onChange,
    leftTitle = "Choices",
    rightTitle = "Chosen",
    showCounts = true,
    enableSearch = false,
    searchPlaceholderLeft = "Search...",
    searchPlaceholderRight = "Search...",
    getItemSearchText,
    renderItem,
    isItemDisabled,
    showControlButtons = true,
    allowDragAndDrop = true,
    listHeight = 260,
    className,
    listClassName,
    leftListClassName,
    rightListClassName,
  } = props

  // Initialize default distribution if not provided: all on left
  const allIds = React.useMemo(() => items.map((it) => it.id), [items])
  const initialLeft = defaultLeftIds ?? (defaultRightIds ? allIds.filter((id) => !defaultRightIds.includes(id)) : allIds)
  const initialRight = defaultRightIds ?? []

  const [leftIds, setLeftIds, isLeftControlled] = useControlledIds(leftIdsProp, initialLeft)
  const [rightIds, setRightIds, isRightControlled] = useControlledIds(rightIdsProp, initialRight)

  const [leftSelected, setLeftSelected] = React.useState<Set<string>>(new Set())
  const [rightSelected, setRightSelected] = React.useState<Set<string>>(new Set())
  const [leftQuery, setLeftQuery] = React.useState("")
  const [rightQuery, setRightQuery] = React.useState("")

  const idToItem = React.useMemo(() => {
    const map = new Map<string, TransferListItem>()
    for (const it of items) map.set(it.id, it)
    return map
  }, [items])

  const filteredLeftIds = React.useMemo(() => filterIds(leftIds, idToItem, leftQuery, getItemSearchText), [leftIds, idToItem, leftQuery, getItemSearchText])
  const filteredRightIds = React.useMemo(() => filterIds(rightIds, idToItem, rightQuery, getItemSearchText), [rightIds, idToItem, rightQuery, getItemSearchText])

  const updateIds = React.useCallback(
    (nextLeft: string[], nextRight: string[]) => {
      if (!isLeftControlled) setLeftIds(nextLeft)
      if (!isRightControlled) setRightIds(nextRight)
      onChange?.({ leftIds: nextLeft, rightIds: nextRight })
    },
    [isLeftControlled, isRightControlled, setLeftIds, setRightIds, onChange]
  )

  function moveSelected(from: TransferListSide) {
    const fromIds = from === "left" ? leftIds : rightIds
    const toIds = from === "left" ? rightIds : leftIds
    const selected = from === "left" ? leftSelected : rightSelected
    const moving = fromIds.filter((id) => selected.has(id) && !isDisabled(id))
    if (moving.length === 0) return
    const nextFrom = fromIds.filter((id) => !moving.includes(id))
    const nextTo = [...toIds, ...moving]
    if (from === "left") {
      updateIds(nextFrom, nextTo)
      setLeftSelected(new Set())
    } else {
      updateIds(nextTo, nextFrom)
      setRightSelected(new Set())
    }
  }

  function moveAll(from: TransferListSide) {
    const fromIds = from === "left" ? leftIds : rightIds
    const toIds = from === "left" ? rightIds : leftIds
    const moving = fromIds.filter((id) => !isDisabled(id))
    if (moving.length === 0) return
    const nextFrom: string[] = []
    const nextTo = [...toIds, ...moving]
    if (from === "left") {
      updateIds(nextFrom, nextTo)
      setLeftSelected(new Set())
    } else {
      updateIds(nextTo, nextFrom)
      setRightSelected(new Set())
    }
  }

  function isDisabled(id: string) {
    const it = idToItem.get(id)
    if (!it) return true
    if (it.disabled) return true
    return isItemDisabled?.(it) ?? false
  }

  function toggleSelect(side: TransferListSide, id: string) {
    const set = side === "left" ? leftSelected : rightSelected
    const next = new Set(set)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    if (side === "left") {
      setLeftSelected(next)
    } else {
      setRightSelected(next)
    }
  }

  function toggleSelectAll(side: TransferListSide, ids: string[]) {
    const set = side === "left" ? leftSelected : rightSelected
    const enabledIds = ids.filter((id) => !isDisabled(id))
    const allSelected = enabledIds.every((id) => set.has(id))
    const next = new Set<string>()
    if (!allSelected) {
      for (const id of enabledIds) next.add(id)
    }
    if (side === "left") {
      setLeftSelected(next)
    } else {
      setRightSelected(next)
    }
  }

  function onDragStart(e: React.DragEvent, side: TransferListSide, id: string) {
    if (!allowDragAndDrop || isDisabled(id)) return
    e.dataTransfer.setData(DND_MIME, JSON.stringify({ id, from: side }))
    e.dataTransfer.effectAllowed = "move"
  }

  function onDragOver(e: React.DragEvent) {
    if (!allowDragAndDrop) return
    if (e.dataTransfer.types.includes(DND_MIME)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
    }
  }

  function onDrop(e: React.DragEvent, to: TransferListSide) {
    if (!allowDragAndDrop) return
    const raw = e.dataTransfer.getData(DND_MIME)
    if (!raw) return
    try {
      const { id, from } = JSON.parse(raw) as { id: string; from: TransferListSide }
      if (from === to) return
      const fromIds = from === "left" ? leftIds : rightIds
      const toIds = to === "left" ? leftIds : rightIds
      if (!fromIds.includes(id) || isDisabled(id)) return
      const nextFrom = fromIds.filter((x) => x !== id)
      const nextTo = [...toIds, id]
      if (to === "left") updateIds(nextTo, nextFrom)
      else updateIds(nextFrom, nextTo)
      if (from === "left") setLeftSelected((s) => new Set([...s].filter((x) => x !== id)))
      else setRightSelected((s) => new Set([...s].filter((x) => x !== id)))
    } catch {
      // ignore
    }
  }

  const leftSelectedCount = countSelected(leftSelected, filteredLeftIds, isDisabled)
  const rightSelectedCount = countSelected(rightSelected, filteredRightIds, isDisabled)

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-3 md:gap-4">
        <ListPanel
          side="left"
          title={leftTitle}
          ids={filteredLeftIds}
          totalCount={leftIds.length}
          selectedCount={leftSelectedCount}
          showCounts={showCounts}
          enableSearch={enableSearch}
          searchPlaceholder={searchPlaceholderLeft}
          query={leftQuery}
          setQuery={setLeftQuery}
          idToItem={idToItem}
          renderItem={renderItem}
          isDisabled={isDisabled}
          listHeight={listHeight}
          listClassName={cn(listClassName, leftListClassName)}
          onToggleAll={() => toggleSelectAll("left", filteredLeftIds)}
          selected={leftSelected}
          onToggleItem={(id) => toggleSelect("left", id)}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, "left")}
        />

        {showControlButtons && (
          <div className="flex md:flex-col gap-2 md:pt-[42px] justify-center" aria-label="transfer controls">
            <Button
              variant="outline"
              size="icon"
              type="button"
              title="Move selected to right"
              onClick={() => moveSelected("left")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              type="button"
              title="Move all to right"
              onClick={() => moveAll("left")}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              type="button"
              title="Move selected to left"
              onClick={() => moveSelected("right")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              type="button"
              title="Move all to left"
              onClick={() => moveAll("right")}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        <ListPanel
          side="right"
          title={rightTitle}
          ids={filteredRightIds}
          totalCount={rightIds.length}
          selectedCount={rightSelectedCount}
          showCounts={showCounts}
          enableSearch={enableSearch}
          searchPlaceholder={searchPlaceholderRight}
          query={rightQuery}
          setQuery={setRightQuery}
          idToItem={idToItem}
          renderItem={renderItem}
          isDisabled={isDisabled}
          listHeight={listHeight}
          listClassName={cn(listClassName, rightListClassName)}
          onToggleAll={() => toggleSelectAll("right", filteredRightIds)}
          selected={rightSelected}
          onToggleItem={(id) => toggleSelect("right", id)}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, "right")}
        />
      </div>
    </div>
  )
}

function ListPanel(props: {
  side: TransferListSide
  title: React.ReactNode
  ids: string[]
  totalCount: number
  selectedCount: number
  showCounts: boolean
  enableSearch: boolean
  searchPlaceholder: string
  query: string
  setQuery: (v: string) => void
  idToItem: Map<string, TransferListItem>
  renderItem?: (item: TransferListItem) => React.ReactNode
  isDisabled: (id: string) => boolean
  listHeight: number | string
  listClassName?: string
  onToggleAll: () => void
  selected: Set<string>
  onToggleItem: (id: string) => void
  onDragStart: (e: React.DragEvent, side: TransferListSide, id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}) {
  const {
    side,
    title,
    ids,
    totalCount,
    selectedCount,
    showCounts,
    enableSearch,
    searchPlaceholder,
    query,
    setQuery,
    idToItem,
    renderItem,
    isDisabled,
    listHeight,
    listClassName,
    onToggleAll,
    selected,
    onToggleItem,
    onDragStart,
    onDragOver,
    onDrop,
  } = props

  const allEnabledIds = React.useMemo(() => ids.filter((id) => !isDisabled(id)), [ids, isDisabled])
  const allChecked = allEnabledIds.length > 0 && allEnabledIds.every((id) => selected.has(id))
  const someChecked = allEnabledIds.some((id) => selected.has(id)) && !allChecked

  return (
    <div className={cn("min-w-0 md:min-w-64 flex-1", listClassName)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {typeof title === "string" ? (
            <h3 className="text-sm font-medium leading-none">{title}</h3>
          ) : (
            title
          )}
          {showCounts && (
            <span className="text-muted-foreground text-xs">
              {selectedCount}/{ids.length} selected • {ids.length}/{totalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            aria-label={`Select all ${side} items`}
            checked={allChecked}
            onCheckedChange={() => onToggleAll()}
            data-state={allChecked ? "checked" : someChecked ? "indeterminate" : "unchecked"}
          />
        </div>
      </div>

      {enableSearch && (
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="rounded-md border bg-card"
        style={{ height: typeof listHeight === "number" ? `${listHeight}px` : listHeight }}
      >
        <ScrollArea className="h-full w-full rounded-md">
          <ul role="listbox" aria-label={`${side} transfer list`} className="divide-y">
            {ids.length === 0 ? (
              <li className="text-muted-foreground text-sm p-3 select-none">No items</li>
            ) : (
              ids.map((id) => {
                const item = idToItem.get(id)
                if (!item) return null
                const disabled = isDisabled(id)
                const checked = selected.has(id)
                return (
                  <li
                    key={id}
                    role="option"
                    aria-selected={checked}
                    draggable={!disabled}
                    onDragStart={(e) => onDragStart(e, side, id)}
                    className={cn(
                      "flex items-center gap-2 p-2 focus-within:bg-accent/40",
                      disabled && "opacity-60"
                    )}
                  >
                    <label className="flex items-center gap-2 w-full cursor-pointer">
                      <Checkbox
                        disabled={disabled}
                        checked={checked}
                        onCheckedChange={() => onToggleItem(id)}
                      />
                      <div className="flex-1 text-sm leading-6">
                        {renderItem ? renderItem(item) : item.label}
                      </div>
                    </label>
                  </li>
                )
              })
            )}
          </ul>
        </ScrollArea>
      </div>
    </div>
  )
}

function filterIds(
  ids: string[],
  idToItem: Map<string, TransferListItem>,
  query: string,
  getItemSearchText?: (item: TransferListItem) => string
) {
  if (!query) return ids
  const q = query.toLowerCase()
  return ids.filter((id) => {
    const it = idToItem.get(id)
    if (!it) return false
    const text = getItemSearchText
      ? getItemSearchText(it)
      : typeof it.label === "string"
        ? it.label
        : ""
    return text.toLowerCase().includes(q)
  })
}

function countSelected(
  selected: Set<string>,
  visibleIds: string[],
  isDisabled: (id: string) => boolean
) {
  let count = 0
  for (const id of visibleIds) {
    if (!isDisabled(id) && selected.has(id)) count++
  }
  return count
}

export default TransferList