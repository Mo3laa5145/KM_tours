import { supabase, TRIP_IMAGES_BUCKET } from '../lib/supabase'

/** Resize big photos in the browser before upload (max 2000px, WebP) to keep the site fast. */
async function compress(file: File, maxSize = 2000, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

export async function uploadImage(folder: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured')
  const blob = await compress(file)
  const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, '-') || 'misc'
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(TRIP_IMAGES_BUCKET).upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from(TRIP_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
}

/** Storage path for a URL that belongs to our bucket, otherwise null (e.g. Unsplash links). */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${TRIP_IMAGES_BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

export async function deleteImages(urls: string[]): Promise<void> {
  if (!supabase) return
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => !!p)
  if (paths.length === 0) return
  await supabase.storage.from(TRIP_IMAGES_BUCKET).remove(paths)
}
