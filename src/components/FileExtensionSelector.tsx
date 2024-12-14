import { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface FileExtensionSelectorProps {
  availableExtensions: string[]
  onChange: (extensions: string[]) => void
  onSelectAllOfType: (extension: string, isSelected: boolean) => void
}

export function FileExtensionSelector({ 
  availableExtensions, 
  onChange,
  onSelectAllOfType
}: FileExtensionSelectorProps) {
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([])

  useEffect(() => {
    setSelectedExtensions([])
  }, [availableExtensions])

  const handleExtensionChange = (extension: string, isChecked: boolean) => {
    setSelectedExtensions((prev) => {
      const newSelection = isChecked
        ? [...prev, extension]
        : prev.filter(ext => ext !== extension)
      onChange(newSelection)
      return newSelection
    })
    onSelectAllOfType(extension, isChecked)
  }

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {availableExtensions.map((ext) => (
        <div key={ext} className="flex items-center space-x-2">
          <Checkbox
            id={`ext-${ext}`}
            checked={selectedExtensions.includes(ext)}
            onCheckedChange={(checked) => handleExtensionChange(ext, checked as boolean)}
          />
          <Label htmlFor={`ext-${ext}`}>{ext}</Label>
        </div>
      ))}
    </div>
  )
}

