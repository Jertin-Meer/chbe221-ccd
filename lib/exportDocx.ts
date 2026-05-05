import { Document, Packer, Paragraph, ImageRun, AlignmentType } from 'docx'
import { toPng } from 'html-to-image'

// ── Capture a DOM section as PNG ──────────────────────────────────────────────
async function captureSection(id: string): Promise<{
  bytes: Uint8Array
  docW: number
  docH: number
} | null> {
  const el = document.getElementById(id)
  if (!el) return null

  const elW = el.offsetWidth  || 900
  const elH = el.offsetHeight || 400

  try {
    const dataUrl = await toPng(el, {
      backgroundColor: '#ffffff',
      pixelRatio: 1.5,
      width:  elW,
      height: elH,
    })

    const base64 = dataUrl.split(',')[1]
    const binary = atob(base64)
    const arr = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)

    // Scale to fit Word page width (600 px ≈ A4 with 1-inch margins at 96 dpi)
    const docW = 600
    const docH = Math.round(elH * docW / elW)

    return { bytes: arr, docW, docH }
  } catch {
    return null
  }
}

function sectionImage(bytes: Uint8Array, docW: number, docH: number): Paragraph {
  return new Paragraph({
    children: [
      new ImageRun({
        type: 'png',
        data: bytes,
        transformation: { width: docW, height: docH },
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  })
}

function gap(): Paragraph {
  return new Paragraph({ text: '' })
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function exportToDocx(): Promise<void> {
  // IDs of every section on the page, in order
  const sectionIds = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'refs']

  // Capture all sections concurrently
  const captured = await Promise.all(sectionIds.map(id => captureSection(id)))

  const children: Paragraph[] = [
    // ── Title page ──────────────────────────────────────────────────────────
    new Paragraph({
      children: [],
      spacing: { after: 0 },
    }),
    new Paragraph({
      text: 'CHBE 221 — CCD Project',
      heading: 'Title' as 'Title',
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      text: 'CO₂ Absorption, Henry\'s Law, and Carbonate Equilibrium',
      heading: 'Heading1' as 'Heading1',
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Questions 1–6  ·  CHBE 221 Process Engineering',
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    gap(),
  ]

  // ── One image per section ──────────────────────────────────────────────────
  for (const result of captured) {
    if (result) {
      children.push(sectionImage(result.bytes, result.docW, result.docH))
    }
    children.push(gap())
  }

  // Build and download
  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'CHBE221_CCD_Project_Final.docx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
