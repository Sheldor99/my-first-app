export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB, muss mit dem Storage-Bucket-Limit übereinstimmen

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
] as const

export interface AttachmentValidationError {
  message: string
}

export function validateAttachmentFile(file: File): AttachmentValidationError | null {
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return { message: 'Datei ist zu groß. Maximale Dateigröße: 10 MB.' }
  }

  if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number])) {
    return { message: 'Dateityp wird nicht unterstützt.' }
  }

  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
