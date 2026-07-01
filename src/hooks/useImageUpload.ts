import { useEffect, useMemo, useRef, useState } from 'react'

export function useImageUpload(initialImageUrl?: string) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  function setSelectedFile(nextFile: File | null) {
    setFile(nextFile)
  }

  function handleFiles(fileList: FileList | null) {
    const nextFile = fileList?.[0] ?? null

    if (!nextFile) {
      return
    }

    setSelectedFile(nextFile)
  }

  return {
    file,
    inputRef,
    isDragging,
    previewUrl: objectUrl ?? initialImageUrl ?? '',
    openFilePicker: () => inputRef.current?.click(),
    removeFile: () => setSelectedFile(null),
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      handleFiles(event.target.files),
    onDragOver: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      setIsDragging(true)
    },
    onDragLeave: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      setIsDragging(false)
    },
    onDrop: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      setIsDragging(false)
      handleFiles(event.dataTransfer.files)
    },
  }
}
