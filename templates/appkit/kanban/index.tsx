"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Paperclip, MessageSquare, ArrowDown, Minus, ArrowUp, Flame } from "lucide-react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
  rectIntersection,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export interface FivuiKanbanTask {
  id: string
  title: string
  description?: string
  status: string
  priority: "low" | "medium" | "high" | "urgent"
  assignee?: {
    id: string
    name: string
    avatar?: string
    initials: string
  }
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  labels?: string[]
  attachments?: number
  comments?: number
  createdAt: string
  updatedAt: string
}

export interface FivuiKanbanColumn {
  id: string
  title: string
  description?: string
  color?: string
  maxTasks?: number
  tasks: FivuiKanbanTask[]
}

export interface FivuiKanbanAppkitProps {
  className?: string
  columns: FivuiKanbanColumn[]
  onColumnsChange?: (columns: FivuiKanbanColumn[]) => void
  showPriority?: boolean
  showAssignee?: boolean
  showDueDate?: boolean
  showTimeTracking?: boolean
  showLabels?: boolean
  showAttachments?: boolean
  showComments?: boolean
  emptyStateText?: string
  loadingIndicator?: React.ReactNode
  priorityColors?: Record<string, string>
  labelColors?: Record<string, string>
}

const DEFAULT_PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const DEFAULT_LABEL_COLORS = {
  "Frontend": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Backend": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Design": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "Bug": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "Feature": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Documentation": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

function SortableTask({ task, showPriority, showAssignee, showDueDate, showTimeTracking, showLabels, showAttachments, showComments, priorityColors, labelColors }: {
  task: FivuiKanbanTask
  showPriority?: boolean
  showAssignee?: boolean
  showDueDate?: boolean
  showTimeTracking?: boolean
  showLabels?: boolean
  showAttachments?: boolean
  showComments?: boolean
  priorityColors: Record<string, string>
  labelColors: Record<string, string>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 touch-manipulation",
        isDragging && "opacity-50 shadow-lg scale-105"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="group space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">{task.title}</h3>
          <div className="flex items-center gap-1" />
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {/* Priority */}
        {showPriority && task.priority && (
          <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs", priorityColors[task.priority])}>
            {task.priority === "low" && <ArrowDown className="h-3 w-3" />}
            {task.priority === "medium" && <Minus className="h-3 w-3" />}
            {task.priority === "high" && <ArrowUp className="h-3 w-3" />}
            {task.priority === "urgent" && <Flame className="h-3 w-3" />}
            <span className="sr-only">{task.priority}</span>
          </div>
        )}

        {/* Labels */}
        {showLabels && task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.slice(0, 3).map((label) => (
              <Badge
                key={label}
                variant="outline"
                className={cn("text-xs", labelColors[label] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200")}
              >
                {label}
              </Badge>
            ))}
            {task.labels.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Assignee */}
            {showAssignee && task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
              </Avatar>
            )}

            {/* Due Date */}
            {showDueDate && task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}

            {/* Time Tracking */}
            {showTimeTracking && (task.estimatedHours || task.actualHours) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.actualHours || 0}/{task.estimatedHours || 0}h
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {showAttachments && task.attachments && task.attachments > 0 && (
              <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" /> {task.attachments}</span>
            )}
            {showComments && task.comments && task.comments > 0 && (
              <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {task.comments}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Droppable column component
function DroppableColumn({ 
  column, 
  children,
  isOver
}: { 
  column: FivuiKanbanColumn
  children: React.ReactNode
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column
    }
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "group flex-shrink-0 w-80 border rounded-lg bg-card/40 backdrop-blur p-3 mr-2 transition-all duration-200",
        isOver && "ring-2 ring-primary/50 bg-card/60 scale-[1.02]"
      )}
    >
      {children}
    </div>
  )
}

export function FivuiAppkitKanban({
  className,
  columns,
  onColumnsChange,
  showPriority = true,
  showAssignee = true,
  showDueDate = true,
  showTimeTracking = true,
  showLabels = true,
  showAttachments = true,
  showComments = true,
  emptyStateText = "No tasks yet",
  loadingIndicator,
  priorityColors: customPriorityColors,
  labelColors: customLabelColors,
}: FivuiKanbanAppkitProps) {
  const [localColumns, setLocalColumns] = React.useState(columns)
  const [activeTask, setActiveTask] = React.useState<FivuiKanbanTask | null>(null)
  const [hoveredColumn, setHoveredColumn] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // 100ms delay before drag starts on touch
        tolerance: 8, // Allow 8px of movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  React.useEffect(() => {
    setLocalColumns(columns)
  }, [columns])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id as string
    const task = localColumns.flatMap(col => col.tasks).find(task => task.id === activeId)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) {
      setHoveredColumn(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = localColumns.flatMap(col => col.tasks).find(task => task.id === activeId)
    if (!activeTask) return

    // Check if we're dragging over a column
    if (overId.startsWith('column-')) {
      const targetColumnId = overId.replace('column-', '')
      setHoveredColumn(targetColumnId)
      return
    }

    // Check if we're dragging over another task
    const overTask = localColumns.flatMap(col => col.tasks).find(task => task.id === overId)
    if (overTask) {
      // Find which column this task is in
      const taskColumn = localColumns.find(col => col.tasks.some(task => task.id === overId))
      if (taskColumn) {
        setHoveredColumn(taskColumn.id)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      setHoveredColumn(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) {
      setActiveTask(null)
      setHoveredColumn(null)
      return
    }

    const activeTask = localColumns.flatMap(col => col.tasks).find(task => task.id === activeId)
    if (!activeTask) {
      setActiveTask(null)
      setHoveredColumn(null)
      return
    }

    // Check if we're dropping over a column
    if (overId.startsWith('column-')) {
      const targetColumnId = overId.replace('column-', '')
      const sourceColumn = localColumns.find(col => col.tasks.some(task => task.id === activeId))
      
      if (sourceColumn && sourceColumn.id !== targetColumnId) {
        // Move task to the target column
        const movingTask = sourceColumn.tasks.find(task => task.id === activeId)!
        const updated = localColumns.map(col => {
          if (col.id === sourceColumn.id) {
            return { ...col, tasks: col.tasks.filter(t => t.id !== activeId) }
          }
          if (col.id === targetColumnId) {
            return { ...col, tasks: [...col.tasks, movingTask] }
          }
          return col
        })

        setLocalColumns(updated)
        onColumnsChange?.(updated)
      }
    } else {
      // Check if we're dropping over another task
      const overTask = localColumns.flatMap(col => col.tasks).find(task => task.id === overId)
      if (overTask) {
        const activeColumn = localColumns.find(col => col.tasks.some(task => task.id === activeId))
        const overColumn = localColumns.find(col => col.tasks.some(task => task.id === overId))
        
        if (activeColumn && overColumn) {
          if (activeColumn.id === overColumn.id) {
            // Same column reordering
            const oldIndex = activeColumn.tasks.findIndex(task => task.id === activeId)
            const newIndex = overColumn.tasks.findIndex(task => task.id === overId)
            
            const newColumns = localColumns.map(col => {
              if (col.id === activeColumn.id) {
                const newTasks = arrayMove(col.tasks, oldIndex, newIndex)
                return { ...col, tasks: newTasks }
              }
              return col
            })
            
            setLocalColumns(newColumns)
            onColumnsChange?.(newColumns)
          } else {
            // Cross-column move: insert at position of target task
            const movingTask = activeColumn.tasks.find(task => task.id === activeId)!
            const targetIndex = overColumn.tasks.findIndex(task => task.id === overId)
            
            const updated = localColumns.map(col => {
              if (col.id === activeColumn.id) {
                return { ...col, tasks: col.tasks.filter(t => t.id !== activeId) }
              }
              if (col.id === overColumn.id) {
                const newTasks = [...col.tasks]
                newTasks.splice(targetIndex, 0, movingTask)
                return { ...col, tasks: newTasks }
              }
              return col
            })

            setLocalColumns(updated)
            onColumnsChange?.(updated)
          }
        }
      }
    }
    setActiveTask(null)
    setHoveredColumn(null)
  }

  const mergedPriorityColors = React.useMemo(
    () => ({ ...DEFAULT_PRIORITY_COLORS, ...(customPriorityColors || {}) }),
    [customPriorityColors]
  )

  const mergedLabelColors = React.useMemo(
    () => ({ ...DEFAULT_LABEL_COLORS, ...(customLabelColors || {}) }),
    [customLabelColors]
  )

  if (loadingIndicator) {
    return <div className="flex items-center justify-center p-8">{loadingIndicator}</div>
  }

  return (
    <div className={cn("h-full w-full overflow-hidden", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localColumns.flatMap(col => col.tasks.map(task => task.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex h-full gap-4 overflow-x-auto p-4 touch-pan-x overscroll-x-contain scroll-smooth">
            {localColumns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                isOver={hoveredColumn === column.id}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: column.color || "#3b82f6" }}
                    />
                    <h3 className="font-semibold">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {column.tasks.length}
                      {column.maxTasks && `/${column.maxTasks}`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1" />
                </div>

                <ScrollArea className="h-[calc(100vh-220px)] pr-1">
                  <div className="space-y-3 min-h-full">
                    {column.tasks.map((task) => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        showPriority={showPriority}
                        showAssignee={showAssignee}
                        showDueDate={showDueDate}
                        showTimeTracking={showTimeTracking}
                        showLabels={showLabels}
                        showAttachments={showAttachments}
                        showComments={showComments}
                        priorityColors={mergedPriorityColors}
                        labelColors={mergedLabelColors}
                      />
                    ))}
                    
                    {column.tasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">{emptyStateText}</p>
                      </div>
                    )}
                    
                    {/* Drop indicator */}
                    {hoveredColumn === column.id && (
                      <div className="h-2 bg-primary/20 rounded border-2 border-dashed border-primary/40 transition-all duration-200" />
                    )}
                  </div>
                </ScrollArea>
              </DroppableColumn>
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeTask ? (
            <div className="w-80 bg-background border rounded-lg shadow-lg p-4 cursor-grabbing">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{activeTask.title}</h4>
                {showPriority && activeTask.priority && (
                  <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs", mergedPriorityColors[activeTask.priority])}>
                    {activeTask.priority === "low" && <ArrowDown className="h-3 w-3" />}
                    {activeTask.priority === "medium" && <Minus className="h-3 w-3" />}
                    {activeTask.priority === "high" && <ArrowUp className="h-3 w-3" />}
                    {activeTask.priority === "urgent" && <Flame className="h-3 w-3" />}
                  </div>
                )}
              </div>
              {activeTask.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{activeTask.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {showAttachments && activeTask.attachments && activeTask.attachments > 0 && (
                  <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" /> {activeTask.attachments}</span>
                )}
                {showComments && activeTask.comments && activeTask.comments > 0 && (
                  <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {activeTask.comments}</span>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}