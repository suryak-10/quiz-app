import { useEffect } from 'react'

export function useImagePreloader(imageUrls: string[]) {
  useEffect(() => {
    const imageElements = imageUrls.map((imageUrl) => {
      const image = new Image()
      image.src = imageUrl
      return image
    })

    return () => {
      for (const image of imageElements) {
        image.src = ''
      }
    }
  }, [imageUrls])
}
