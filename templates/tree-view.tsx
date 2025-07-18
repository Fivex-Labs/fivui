"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const treeViewVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        default: "",
        outline: "border rounded-md",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
  icon?: React.ReactNode
  disabled?: boolean
  [key: string]: any
}

export interface TreeViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">,
    VariantProps<typeof treeViewVariants> {
  data: TreeNode[]
  onSelect?: (node: TreeNode) => void
  onExpand?: (node: TreeNode) => void
  onCollapse?: (node: TreeNode) => void
  expandOnClick?: boolean
  multiple?: boolean
  defaultExpanded?: string[]
  defaultSelected?: string[]
}

interface TreeViewContextValue {
  selectedNodes: Set<string>
  expandedNodes: Set<string>
  onNodeSelect: (node: TreeNode) => void
  onNodeToggle: (node: TreeNode) => void
  expandOnClick: boolean
  multiple: boolean
  variant: "default" | "outline"
  size: "sm" | "md" | "lg"
}

const TreeViewContext = React.createContext<TreeViewContextValue | undefined>(undefined)

function useTreeView() {
  const context = React.useContext(TreeViewContext)
  if (!context) {
    throw new Error("TreeView components must be used within TreeView")
  }
  return context
}

function TreeView({
  className,
  variant = "default",
  size = "md",
  data,
  onSelect,
  onExpand,
  onCollapse,
  expandOnClick = true,
  multiple = false,
  defaultExpanded = [],
  defaultSelected = [],
  ...props
}: TreeViewProps) {
  const [selectedNodes, setSelectedNodes] = React.useState<Set<string>>(
    new Set(defaultSelected)
  )
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(
    new Set(defaultExpanded)
  )

  const handleNodeSelect = React.useCallback(
    (node: TreeNode) => {
      if (node.disabled) return

      setSelectedNodes((prev) => {
        const newSelected = new Set(prev)
        if (multiple) {
          if (newSelected.has(node.id)) {
            newSelected.delete(node.id)
          } else {
            newSelected.add(node.id)
          }
        } else {
          newSelected.clear()
          newSelected.add(node.id)
        }
        return newSelected
      })
      onSelect?.(node)
    },
    [multiple, onSelect]
  )

  const handleNodeToggle = React.useCallback(
    (node: TreeNode) => {
      if (node.disabled) return

      setExpandedNodes((prev) => {
        const newExpanded = new Set(prev)
        if (newExpanded.has(node.id)) {
          newExpanded.delete(node.id)
          onCollapse?.(node)
        } else {
          newExpanded.add(node.id)
          onExpand?.(node)
        }
        return newExpanded
      })
    },
    [onExpand, onCollapse]
  )

  const contextValue: TreeViewContextValue = {
    selectedNodes,
    expandedNodes,
    onNodeSelect: handleNodeSelect,
    onNodeToggle: handleNodeToggle,
    expandOnClick,
    multiple,
    variant: variant || "default",
    size: size || "md",
  }

  return (
    <TreeViewContext.Provider value={contextValue}>
      <div
        data-slot="tree-view"
        className={cn(treeViewVariants({ variant, size, className }))}
        role="tree"
        {...props}
      >
        <TreeViewList nodes={data} />
      </div>
    </TreeViewContext.Provider>
  )
}

interface TreeViewListProps {
  nodes: TreeNode[]
  level?: number
}

function TreeViewList({ nodes, level = 0 }: TreeViewListProps) {
  return (
    <div role="group" className="space-y-1">
      {nodes.map((node) => (
        <TreeViewItem key={node.id} node={node} level={level} />
      ))}
    </div>
  )
}

interface TreeViewItemProps {
  node: TreeNode
  level: number
}

function TreeViewItem({ node, level }: TreeViewItemProps) {
  const {
    selectedNodes,
    expandedNodes,
    onNodeSelect,
    onNodeToggle,
    expandOnClick,
    size,
  } = useTreeView()

  const isSelected = selectedNodes.has(node.id)
  const isExpanded = expandedNodes.has(node.id)
  const hasChildren = node.children && node.children.length > 0
  const isDisabled = node.disabled

  const handleClick = () => {
    if (isDisabled) return

    if (hasChildren && expandOnClick) {
      onNodeToggle(node)
    } else {
      onNodeSelect(node)
    }
  }

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren && !isDisabled) {
      onNodeToggle(node)
    }
  }

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDisabled) {
      onNodeSelect(node)
    }
  }

  const paddingLeft = level * 24 + 8

  return (
    <div data-slot="tree-view-item">
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        className={cn(
          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground focus:outline-none",
          isSelected && "bg-accent text-accent-foreground font-medium",
          isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
          size === "sm" && "py-1 text-xs",
          size === "lg" && "py-2 text-base"
        )}
        style={{ paddingLeft }}
        onClick={expandOnClick ? handleClick : handleSelectClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        {hasChildren && (
          <button
            className={cn(
              "flex items-center justify-center w-4 h-4 rounded-sm transition-transform",
              "hover:bg-accent-foreground/10",
              isExpanded && "rotate-90"
            )}
            onClick={expandOnClick ? handleToggleClick : handleClick}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        <TreeViewIcon node={node} isExpanded={isExpanded} />
        
        <span className="flex-1 truncate">{node.name}</span>
      </div>
      
      {hasChildren && isExpanded && (
        <TreeViewList nodes={node.children!} level={level + 1} />
      )}
    </div>
  )
}

interface TreeViewIconProps {
  node: TreeNode
  isExpanded: boolean
}

function TreeViewIcon({ node, isExpanded }: TreeViewIconProps) {
  const { size } = useTreeView()
  
  const iconSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
  
  if (node.icon) {
    return <div className={cn("flex-shrink-0", iconSize)}>{node.icon}</div>
  }
  
  if (node.children && node.children.length > 0) {
    return isExpanded ? (
      <FolderOpen className={cn("flex-shrink-0 text-blue-500", iconSize)} />
    ) : (
      <Folder className={cn("flex-shrink-0 text-blue-500", iconSize)} />
    )
  }
  
  return <File className={cn("flex-shrink-0 text-gray-500", iconSize)} />
}

// Additional compound components for more flexibility
function TreeViewRoot({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="tree-view-root"
      className={cn("space-y-2", className)}
      {...props}
    />
  )
}

function TreeViewLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="tree-view-label"
      className={cn("text-sm font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function TreeViewContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="tree-view-content"
      className={cn("", className)}
      {...props}
    />
  )
}

export {
  TreeView,
  TreeViewRoot,
  TreeViewLabel,
  TreeViewContent,
  TreeViewList,
  TreeViewItem,
  TreeViewIcon,
} 