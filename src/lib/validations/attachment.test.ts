import { describe, expect, it } from "vitest"
import { validateAttachmentFile, formatFileSize, MAX_ATTACHMENT_SIZE_BYTES } from "./attachment"

function makeFile({ size, type }: { size: number; type: string }): File {
  const file = new File([new Uint8Array(1)], "test-file", { type })
  Object.defineProperty(file, "size", { value: size })
  return file
}

describe("validateAttachmentFile", () => {
  it("accepts a valid file within the size limit and an allowed type", () => {
    const file = makeFile({ size: 1024, type: "application/pdf" })
    expect(validateAttachmentFile(file)).toBeNull()
  })

  it("accepts a file exactly at the size limit", () => {
    const file = makeFile({ size: MAX_ATTACHMENT_SIZE_BYTES, type: "image/png" })
    expect(validateAttachmentFile(file)).toBeNull()
  })

  it("rejects a file exceeding the size limit", () => {
    const file = makeFile({ size: MAX_ATTACHMENT_SIZE_BYTES + 1, type: "application/pdf" })
    const result = validateAttachmentFile(file)
    expect(result).not.toBeNull()
    expect(result?.message).toMatch(/zu groß/i)
  })

  it("rejects a disallowed MIME type", () => {
    const file = makeFile({ size: 1024, type: "text/html" })
    const result = validateAttachmentFile(file)
    expect(result).not.toBeNull()
    expect(result?.message).toMatch(/dateityp/i)
  })

  it("rejects an executable-like MIME type", () => {
    const file = makeFile({ size: 1024, type: "application/x-msdownload" })
    expect(validateAttachmentFile(file)).not.toBeNull()
  })

  it("checks size before type, but both invalid still returns an error", () => {
    const file = makeFile({ size: MAX_ATTACHMENT_SIZE_BYTES + 1, type: "text/html" })
    expect(validateAttachmentFile(file)).not.toBeNull()
  })
})

describe("formatFileSize", () => {
  it("formats bytes under 1 KB", () => {
    expect(formatFileSize(512)).toBe("512 B")
  })

  it("formats sizes in KB", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB")
  })

  it("formats sizes in MB", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB")
  })
})
