type ImageUploaderProps = {
  fileName: string | null
  hasPreview: boolean
  previewUrl: string
  isDragging: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDragOver: (event: React.DragEvent<HTMLElement>) => void
  onDragLeave: (event: React.DragEvent<HTMLElement>) => void
  onDrop: (event: React.DragEvent<HTMLElement>) => void
  onOpen: () => void
  onRemove: () => void
}

export function ImageUploader({
  fileName,
  hasPreview,
  previewUrl,
  isDragging,
  inputRef,
  onInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpen,
  onRemove,
}: ImageUploaderProps) {
  return (
    <div className="field-block">
      <label className="field-label" htmlFor="question-image">
        Image Upload
      </label>
      <div
        className={`image-uploader ${isDragging ? 'image-uploader-active' : ''}`}
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen()
          }
        }}
      >
        <input
          ref={inputRef}
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          id="question-image"
          type="file"
          onChange={onInputChange}
        />

        {hasPreview ? (
          <div className="image-preview-shell">
            <img alt="Question preview" className="image-preview" src={previewUrl} />
            <div className="image-preview-meta">
              <strong>{fileName ?? 'Current image'}</strong>
              <span>Click or drop a file to replace the image.</span>
            </div>
          </div>
        ) : (
          <div className="uploader-empty">
            <strong>Drag and drop an image here</strong>
            <span>or click to browse JPG, PNG, or WEBP up to 10 MB.</span>
          </div>
        )}
      </div>

      {hasPreview ? (
        <button className="inline-link-button" type="button" onClick={onRemove}>
          Remove selected file
        </button>
      ) : null}
    </div>
  )
}
