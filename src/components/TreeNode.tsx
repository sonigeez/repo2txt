import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from "@/components/ui/checkbox"

interface TreeNodeProps {
  node: {
    name: string
    type: string
    path: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contents?: any[]
  }
  level?: number
  onSelect: (path: string, isSelected: boolean) => void
  selectedFiles: Set<string>
  selectedExtensions: string[]
}

export function TreeNode({ node, level = 0, onSelect, selectedFiles, selectedExtensions }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true)
  const isDirectory = node.type === 'tree'
  const isFile = node.type === 'blob'
  const isSelectable = isFile && (selectedExtensions.length === 0 || selectedExtensions.some(ext => node.name.endsWith(ext)))
  const [isChecked, setIsChecked] = useState(selectedFiles.has(node.path))
  
  useEffect(() => {
    setIsChecked(selectedFiles.has(node.path))
  }, [selectedFiles, node.path])

  const toggleOpen = () => {
    if (isDirectory) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelect = (checked: boolean) => {
    onSelect(node.path, checked)
    setIsChecked(checked)
  }

  return (
    <div className="min-w-full">
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1 rounded-md text-sm",
          isDirectory ? "cursor-pointer hover:bg-accent" : "cursor-default",
          level === 0 && "text-lg font-semibold"
        )}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={toggleOpen}
        role={isDirectory ? "button" : undefined}
        tabIndex={isDirectory ? 0 : undefined}
      >
        {isDirectory && (
          <ChevronRight 
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              isOpen && "rotate-90"
            )} 
          />
        )}
        {isDirectory ? (
          isOpen ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-blue-500" />
          )
        ) : (
          <File className="h-4 w-4 shrink-0 text-gray-500" />
        )}
        <span className="truncate flex-grow">{node.name}</span>
        {isSelectable && (
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
      {isDirectory && isOpen && node.contents && (
        <div className="flex flex-col">
          {node.contents.map((child) => (
            <TreeNode
              key={`${child.path}-${child.type}`}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedFiles={selectedFiles}
              selectedExtensions={selectedExtensions}
            />
          ))}
        </div>
      )}
    </div>
  )
}

