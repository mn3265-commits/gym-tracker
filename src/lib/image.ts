/**
 * Downscale an image file to a small JPEG data URL.
 *
 * Progress photos live in the synced state blob, so they must be small — a
 * full-res phone photo would bloat every cloud write. We cap the long edge and
 * re-encode as JPEG, which takes a ~4MB photo down to tens of KB while staying
 * perfectly legible for a physique comparison.
 */
export async function downscaleImage(file: File, maxEdge = 720, quality = 0.72): Promise<string> {
  const bitmap = await fileToImage(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no 2d context')
  ctx.drawImage(bitmap, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('could not read image'))
    }
    img.src = url
  })
}
