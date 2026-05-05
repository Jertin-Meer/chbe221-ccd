import {
  Document, Packer, Paragraph, TextRun, ImageRun,
  HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle,
} from 'docx'
import { toPng } from 'html-to-image'

// ── Helpers ───────────────────────────────────────────────────────────────────

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return arr
}

async function captureChart(id: string): Promise<Uint8Array | null> {
  const el = document.getElementById(id)
  if (!el) return null
  try {
    const url = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 })
    return dataUrlToBytes(url)
  } catch {
    return null
  }
}

function h1(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 120 } })
}

function h2(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 80 } })
}

function body(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, size: 22 })], spacing: { after: 120 } })
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level: 0 },
    spacing: { after: 60 },
  })
}

function gap(): Paragraph {
  return new Paragraph({ text: '' })
}

function imgParagraph(data: Uint8Array, w: number, h: number): Paragraph {
  return new Paragraph({
    children: [
      new ImageRun({
        type: 'png',
        data,
        transformation: { width: w, height: h },
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
  })
}

const noBorder = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: 'aaaaaa' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'aaaaaa' },
  left:   { style: BorderStyle.SINGLE, size: 4, color: 'aaaaaa' },
  right:  { style: BorderStyle.SINGLE, size: 4, color: 'aaaaaa' },
}

function tableRow(cells: string[], isHeader = false): TableRow {
  return new TableRow({
    children: cells.map(txt =>
      new TableCell({
        borders: noBorder,
        width: { size: Math.floor(9000 / cells.length), type: WidthType.DXA },
        children: [
          new Paragraph({
            children: [new TextRun({ text: txt, size: isHeader ? 20 : 18, bold: isHeader })],
            spacing: { after: 40 },
          }),
        ],
      })
    ),
  })
}

// ── Main export function ──────────────────────────────────────────────────────

export async function exportToDocx(): Promise<void> {
  // Capture all charts concurrently
  const [phaseImg, co2Img, o2Img, bjerrumImg] = await Promise.all([
    captureChart('chart-phase-diagram'),
    captureChart('chart-co2-solubility'),
    captureChart('chart-o2-solubility'),
    captureChart('chart-bjerrum'),
  ])

  const children: (Paragraph | Table)[] = [

    // ── Cover ─────────────────────────────────────────────────────────────────
    new Paragraph({
      children: [new TextRun({ text: 'CHBE 221 – CCD Project', bold: true, size: 52 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'CO₂ Absorption, Henry\'s Law, and Carbonate Equilibrium', size: 36 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Questions 1–6 — CHBE 221 Process Engineering', size: 24, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),

    // ── Q1 ────────────────────────────────────────────────────────────────────
    h1('Question 1 — Carbon Cycle and Ocean CO₂ Sequestration'),
    h2('(a) Role of the Oceans'),
    body('The global carbon cycle moves carbon among four major reservoirs: the atmosphere (~870 GtC as CO₂), the ocean (~38,000 GtC dissolved), the terrestrial biosphere (~2,200 GtC), and geologic stores. The ocean is 40× larger than the atmospheric reservoir.'),
    body('Exchange between atmosphere and surface ocean is governed by Henry\'s law. The ocean currently absorbs ~2–3 GtC yr⁻¹ net — approximately 25–30% of annual anthropogenic emissions.'),

    h2('(b) Solubility Pump and Biological Pump'),
    body('Solubility pump: cold, dense, CO₂-rich polar water sinks in thermohaline circulation, sequestering carbon in the deep ocean for centuries. Warmer upwelling water releases CO₂ back to the atmosphere.'),
    body('Biological pump: phytoplankton fix CO₂ via photosynthesis (6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂). Sinking organic matter exports carbon downward; 10–20% reaches the seafloor. Without the biological pump, atmospheric CO₂ would be ~150–200 ppm higher.'),

    h2('(c) Ocean Acidification'),
    body('Atmospheric CO₂ has risen from ~280 ppm (pre-industrial) to >420 ppm today. Dissolution reactions: CO₂ + H₂O ⇌ H₂CO₃* → H⁺ + HCO₃⁻; excess H⁺ then consumes CO₃²⁻ → HCO₃⁻.'),
    body('Surface-ocean pH has fallen from ~8.18 to ~8.08 since pre-industrial times — a 26% increase in [H⁺]. Reduced CO₃²⁻ impairs shell formation by corals, oysters, and pteropods. The lysocline and CCD are shoaling as CO₃²⁻ declines.'),
    gap(),

    // ── Q2 ────────────────────────────────────────────────────────────────────
    h1('Question 2 — CO₂ Phase Diagram'),
    body('Key phase boundaries: sublimation (solid↔gas): ln(P/atm) = 16.53 − 3224/T_K; vaporization (liquid↔gas): NIST saturation data; fusion (solid↔liquid): dP/dT ≈ +45.7 atm/K.'),
    body('Triple point: T = −56.6°C, P = 5.18 atm. Critical point: T = 31.0°C, P = 72.8 atm. CO₂ sublimes at 1 atm and −78.5°C (dry ice). Above the critical point, supercritical CO₂ has liquid-like density and gas-like diffusivity — the preferred form for geological sequestration.'),
    ...(phaseImg
      ? [imgParagraph(phaseImg, 520, 300), body('Figure 0 — CO₂ P–T phase diagram')]
      : [body('[Phase diagram chart — view online at the interactive site]')]),
    gap(),

    // ── Q3 ────────────────────────────────────────────────────────────────────
    h1('Question 3 — Henry\'s Law Solubility'),
    body('Henry\'s law: pᵢ = H · xᵢ.  Mole-fraction solubility at p = 1 atm from the Appendix A correlation: ln(xᵢ) = A + B/T + C ln(T) + D·T + E·T² (T in K).'),
    body('CO₂ coefficients (Weiss 1974): A = −164.769, B = 9050.69, C = 22.294. O₂ coefficients (Benson & Krause 1980): A = −179.329, B = 8747.55, C = 24.453. At 25°C: H(CO₂) ≈ 1700 atm, H(O₂) ≈ 43,000 atm — CO₂ is ~25× more soluble than O₂.'),
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: [
        tableRow(['Gas', 'T (°C)', 'xi (mol/mol)', 'H (atm)', 'mg/L'], true),
        tableRow(['CO₂', '0',  '1.713e-3', '584',   '75.4']),
        tableRow(['CO₂', '10', '1.215e-3', '823',   '53.5']),
        tableRow(['CO₂', '20', '9.028e-4', '1108',  '39.7']),
        tableRow(['CO₂', '30', '6.919e-4', '1445',  '30.4']),
        tableRow(['O₂',  '0',  '3.980e-5', '25125', '1.273']),
        tableRow(['O₂',  '10', '2.766e-5', '36153', '0.885']),
        tableRow(['O₂',  '20', '2.026e-5', '49358', '0.648']),
        tableRow(['O₂',  '30', '1.547e-5', '64630', '0.495']),
      ],
    }),
    gap(),
    ...(co2Img
      ? [imgParagraph(co2Img, 260, 175), body('Figure 1 — CO₂ solubility vs partial pressure')]
      : []),
    ...(o2Img
      ? [imgParagraph(o2Img, 260, 175), body('Figure 2 — O₂ solubility vs partial pressure')]
      : []),
    gap(),

    // ── Q4 ────────────────────────────────────────────────────────────────────
    h1('Question 4 — CO₂–Water Equilibrium at 25°C'),
    body('Reactions: CO₂(aq) + H₂O ⇌ H⁺ + HCO₃⁻ (K₁ = 6.31×10⁻⁵); HCO₃⁻ ⇌ H⁺ + CO₃²⁻ (K₂ = 4.67×10⁻¹¹); H₂O ⇌ H⁺ + OH⁻ (Kw = 10⁻¹⁴).'),
    body('Henry\'s law at 25°C: KH = 0.03347 mol/(L·atm). Charge balance (open system): [H⁺] = [HCO₃⁻] + 2[CO₃²⁻] + [OH⁻], solved iteratively.'),
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: [
        tableRow(['Case', '[CO₂(aq)] mol/L', 'pH', '[HCO₃⁻] mol/L', '[CO₃²⁻] mol/L'], true),
        tableRow(['p = 1 atm',     '3.347e-2', '3.91', '2.74e-4', '4.67e-11']),
        tableRow(['p = 415 ppm',   '1.389e-5', '5.61', '1.14e-6', '4.67e-11']),
      ],
    }),
    gap(),

    // ── Q5 ────────────────────────────────────────────────────────────────────
    h1('Question 5 — Bjerrum Plot (Carbonate System)'),
    body('Distribution fractions: α₀ = [H⁺]²/Δ (CO₂); α₁ = K₁[H⁺]/Δ (HCO₃⁻); α₂ = K₁K₂/Δ (CO₃²⁻); Δ = [H⁺]² + K₁[H⁺] + K₁K₂.'),
    body('pKa1 ≈ 4.2 (CO₂/HCO₃⁻ crossover); pKa2 ≈ 10.33 (HCO₃⁻/CO₃²⁻ crossover). Between these values, HCO₃⁻ accounts for ≥99% of DIC. At pH 7.7 → 8.3, CO₃²⁻ rises ~6× and drives CaCO₃ scale formation.'),
    ...(bjerrumImg
      ? [imgParagraph(bjerrumImg, 520, 300), body('Figure 3 — Bjerrum plot, pH 4–11')]
      : [body('[Bjerrum plot — view online]')]),
    gap(),

    // ── Q6 ────────────────────────────────────────────────────────────────────
    h1('Question 6 — Ocean Inorganic Carbon Speciation vs. Depth'),
    body('Seawater apparent constants (25°C, S≈35): K₁_sw = 1.41×10⁻⁶ (pKa1 = 5.85); K₂_sw = 1.00×10⁻⁹ (pKa2 = 9.00). Surface ocean (pH 8.1): ~1% CO₂, 88% HCO₃⁻, 11% CO₃²⁻.'),
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: [
        tableRow(['Depth', 'pH', 'α₀ CO₂', 'α₁ HCO₃⁻', 'α₂ CO₃²⁻'], true),
        tableRow(['Surface (0 m)',    '8.10', '0.49%', '88.3%', '11.2%']),
        tableRow(['200 m',            '7.95', '0.80%', '90.8%',  '8.4%']),
        tableRow(['500 m',            '7.80', '1.27%', '92.8%',  '5.9%']),
        tableRow(['1 000 m',          '7.65', '2.00%', '94.4%',  '3.6%']),
        tableRow(['2 000 m',          '7.50', '3.12%', '95.7%',  '1.2%']),
        tableRow(['3 000 m (lyso.)',   '7.40', '4.38%', '95.5%',  '0.1%']),
        tableRow(['5 000 m (CCD)',     '7.25', '7.67%', '92.3%',  '0.0%']),
      ],
    }),
    body('Lysocline (~3000–4000 m): onset of CaCO₃ dissolution. CCD (~4000–5000 m): depth where carbonate rain equals dissolution; no calcareous sediments below. Both are shoaling as ocean CO₂ uptake continues.'),
    gap(),

    // ── References ────────────────────────────────────────────────────────────
    h1('References'),
    ...[
      'Weiss, R.F. (1974). Carbon dioxide in water and seawater. J. Mar. Res. 32(2), 235–250.',
      'Benson, B.B. & Krause, D. (1980). Dissolved gases in freshwater. Limnol. Oceanogr. 25(4), 662–671.',
      'Smith, J.M., Van Ness, H.C. & Abbott, M.M. (2018). Introduction to Chemical Engineering Thermodynamics, 9th ed. McGraw-Hill.',
      'Stumm, W. & Morgan, J.J. (1996). Aquatic Chemistry, 3rd ed. Wiley-Interscience.',
      'Sander, R. (2015). Compilation of Henry\'s law constants. Atmos. Chem. Phys. 15, 4399–4981.',
    ].map(bullet),
  ]

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
