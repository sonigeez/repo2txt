import { useEffect, useState } from 'react'
import { TreeNode } from './TreeNode'
import { FileExtensionSelector } from './FileExtensionSelector'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy } from "lucide-react"
import { fetchFileContent, fetchRepoContents } from '@/utils/github'
import { useToast } from "@/hooks/use-toast"

export default function RepoTreeView({
  repo,
}: {
  repo: string
}) {
  const { toast } = useToast()
  const [tree, setTree] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([])
  const [availableExtensions, setAvailableExtensions] = useState<string[]>([])
  const [fileContents, setFileContents] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchRepo()
  }, [repo])

  const fetchRepo = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedTree = await fetchRepoContents(repo)
      setTree(fetchedTree)
      const extensions = extractUniqueExtensions(fetchedTree)
      setAvailableExtensions(extensions)
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the repository.')
    } finally {
      setIsLoading(false)
    }
  }

  const extractUniqueExtensions = (node): string[] => {
    const extensions = new Set<string>()
    const traverse = (n) => {
      if (n.type === 'blob') {
        const ext = '.' + n.name.split('.').pop()
        if (ext !== '.') extensions.add(ext)
      } else if (n.type === 'tree' && n.contents) {
        n.contents.forEach(traverse)
      }
    }
    traverse(node)
    return Array.from(extensions).sort()
  }

  const handleFileSelect = (path: string, isSelected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(path)
      } else {
        newSet.delete(path)
      }
      return newSet
    })
  }

  const handleExtensionChange = (extensions: string[]) => {
    setSelectedExtensions(extensions)
  }

  const handleSelectAllOfType = (extension: string, isSelected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      const selectFilesOfType = (node) => {
        if (node.type === 'blob' && node.name.endsWith(extension)) {
          if (isSelected) {
            newSet.add(node.path)
          } else {
            newSet.delete(node.path)
          }
        } else if (node.type === 'tree' && node.contents) {
          node.contents.forEach(selectFilesOfType)
        }
      }
      selectFilesOfType(tree)
      return newSet
    })
  }

  const handleProcessFiles = async () => {
    setIsProcessing(true)
    setError(null)
    setFileContents('')
    try {
      const contents = await Promise.all(
        Array.from(selectedFiles).map(async (filePath) => {
          const content = await fetchFileContent(repo, filePath)
          return `File: ${filePath}\n\n${content}\n\n${'='.repeat(40)}\n\n`
        })
      )
      setFileContents(contents.join(''))
    } catch (err) {
      setError(err.message || 'An error occurred while fetching file contents.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(fileContents)
      toast({
        description: "Content copied to clipboard",
        duration: 2000,
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        description: "Failed to copy content",
        duration: 2000,
      })
    }
  }

  if (isLoading) {
    return <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-accent rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-accent rounded w-1/2"></div>
          <div className="h-4 bg-accent rounded w-5/6"></div>
        </div>
      </div>
    </div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-200">
        Error: {error}
        Please check the repository URL and try again.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tree && (
        <>
          <FileExtensionSelector 
            availableExtensions={availableExtensions}
            onChange={handleExtensionChange}
            onSelectAllOfType={handleSelectAllOfType}
          />
          <div className="border rounded-lg p-4 bg-background">
            <TreeNode
              node={tree}
              onSelect={handleFileSelect}
              selectedFiles={selectedFiles}
              selectedExtensions={selectedExtensions}
            />
          </div>
          <Button 
            onClick={handleProcessFiles} 
            disabled={selectedFiles.size === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Process Selected Files'}
          </Button>
          {fileContents && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">File Contents:</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyContent}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <pre className="whitespace-pre-wrap">{fileContents}</pre>
              </ScrollArea>
            </div>
          )}
        </>
      )}
    </div>
  )
}
