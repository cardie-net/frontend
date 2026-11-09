import { extractApiErrorMessage } from "./api"

/** Mirrors backend settings.MAX_UPLOAD_SIZE (10 MiB). */
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

/**
 * Source avatar images are cropped and re-encoded in the browser before upload,
 * so only the resulting blob is subject to MAX_UPLOAD_SIZE_BYTES. This separate
 * limit just prevents pathological files from exhausting browser memory.
 */
export const MAX_AVATAR_SOURCE_SIZE_BYTES = 50 * 1024 * 1024

export class UploadTooLargeError extends Error {
  readonly maxBytes: number

  constructor(maxBytes: number = MAX_UPLOAD_SIZE_BYTES) {
    super(`Upload exceeds the maximum size of ${formatUploadSize(maxBytes)}`)
    this.name = "UploadTooLargeError"
    this.maxBytes = maxBytes
  }
}

export function isUploadTooLargeError(
  error: unknown
): error is UploadTooLargeError {
  return error instanceof UploadTooLargeError
}

export function formatUploadSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024)
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`
  }
  if (bytes >= 1024) {
    const kb = bytes / 1024
    return `${Number.isInteger(kb) ? kb : kb.toFixed(1)} KB`
  }
  return `${bytes} B`
}

export function assertUploadSize(
  file: { size: number },
  maxBytes: number = MAX_UPLOAD_SIZE_BYTES
): void {
  if (file.size > maxBytes) {
    throw new UploadTooLargeError(maxBytes)
  }
}

interface UploadErrorBody {
  detail?: unknown
  max_size?: unknown
}

/**
 * Converts an unsuccessful upload response into an Error.
 *
 * A 413 status always maps to UploadTooLargeError, even when the body is not
 * JSON (for example when a reverse proxy rejects the request). When the backend
 * includes max_size it is used for the user-facing message.
 */
export async function uploadErrorFromResponse(
  res: Response,
  fallback: string
): Promise<Error> {
  let data: UploadErrorBody | null = null
  try {
    data = (await res.json()) as UploadErrorBody
  } catch {
    // Non-JSON error body (for example a proxy-generated 413 page).
  }

  if (res.status === 413) {
    const maxBytes = data?.max_size
    return new UploadTooLargeError(
      typeof maxBytes === "number" && maxBytes > 0
        ? maxBytes
        : MAX_UPLOAD_SIZE_BYTES
    )
  }

  return new Error(extractApiErrorMessage(data, fallback))
}
