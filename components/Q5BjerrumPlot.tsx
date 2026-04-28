import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Label,
} from 'recharts'

// ── Equilibrium constants (same as Q4) ──────────────────────────────────────
const K1 = 6.31e-5
const K2 = 4.67e-11

// ── Alpha (Bjerrum) fractions ────────────────────────────────────────────────
// alpha0 = [H+]² / D        (CO2(aq) / H2CO3*)
// alpha1 = K1[H+] / D       (HCO3⁻)
// alpha2 = K1 K2 / D        (CO3²⁻)
// D = [H+]² + K1[H+] + K1K2
function bjerrumPoint(pH: number) {
  const h = Math.pow(10, -pH)
  const D = h * h + K1 * h + K1 * K2
  return {
    pH: parseFloat(pH.toFixed(3)),
    alpha0: (h * h) / D,
    alpha1: (K1 * h) / D,
    alpha2: (K1 * K2) / D,
  }
}

// Derived pKa values
const pKa1 = -Math.log10(K1)   // ≈ 4.20
const pKa2 = -Math.log10(K2)   // ≈ 10.33

// Highlight pH values
const PH_A = 7.7
const PH_B = 8.3

// Compute alpha at highlighted points for the table
function alphaAt(pH: number) {
  const h = Math.pow(10, -pH)
  const D = h * h + K1 * h + K1 * K2
  return {
    a0: (h * h) / D,
    a1: (K1 * h) / D,
    a2: (K1 * K2) / D,
  }
}

const PT_A = alphaAt(PH_A)
const PT_B = alphaAt(PH_B)

// Custom dot renderer to mark crossover points on the chart
function pct(v: number) { return (v * 100).toFixed(2) + '%' }

// Custom tooltip
function BjerrumTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; stroke: string }[]; label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-300 px-3 py-2 text-xs shadow">
      <p className="font-semibold mb-1">pH = {Number(label).toFixed(2)}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.stroke }}>
          {p.name}: {(p.value * 100).toFixed(2)}%
        </p>
      ))}
    </div>
  )
}

export default function Q5BjerrumPlot() {
  // Generate data: pH 4.0 → 11.0 in steps of 0.05
  const data = useMemo(() =>
    Array.from({ length: 141 }, (_, i) => bjerrumPoint(4 + i * 0.05)),
    []
  )

  return (
    <section id="q5" className="mb-20">
      <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">
        Question 5 &mdash; Bjerrum Plot (Carbonate System)
      </h2>

      {/* Fraction definitions */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 text-sm leading-relaxed">
        <p className="font-semibold mb-2">
          Distribution (alpha) fractions — fraction of total dissolved inorganic carbon
          present as each species:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {[
            { name: 'α₀ (CO₂ · H₂CO₃*)', expr: '[H⁺]² / Δ' },
            { name: 'α₁ (HCO₃⁻)',         expr: 'K₁[H⁺] / Δ' },
            { name: 'α₂ (CO₃²⁻)',          expr: 'K₁K₂ / Δ' },
          ].map(({ name, expr }) => (
            <div key={name} className="bg-white border border-gray-200 rounded p-2 text-center">
              <div className="text-gray-600 mb-1 text-xs not-italic font-sans">{name}</div>
              <div>{expr}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-600">
          where Δ&nbsp;=&nbsp;[H⁺]² + K₁[H⁺] + K₁K₂;&nbsp;&nbsp;
          K₁&nbsp;=&nbsp;{K1.toExponential(2)}, K₂&nbsp;=&nbsp;{K2.toExponential(2)};&nbsp;&nbsp;
          pK<sub>a1</sub>&nbsp;=&nbsp;{pKa1.toFixed(2)}, pK<sub>a2</sub>&nbsp;=&nbsp;{pKa2.toFixed(2)}
        </p>
      </div>

      {/* Chart */}
      <p className="font-semibold text-sm mb-2">
        Figure 3 &mdash; Bjerrum plot, pH 4–11
      </p>
      <div className="border border-gray-200 rounded p-2 mb-2">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data} margin={{ top: 16, right: 24, bottom: 52, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
            <XAxis
              dataKey="pH"
              type="number"
              domain={[4, 11]}
              ticks={[4, 5, 6, 7, 8, 9, 10, 11]}
              label={{ value: 'pH', position: 'insideBottom', offset: -36, fontSize: 12 }}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v: number) => v.toFixed(1)}
              label={{ value: 'Alpha fraction', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
            />
            <Tooltip content={<BjerrumTooltip />} />
            {/* Legend moved to bottom to avoid clashing with reference-line labels */}
            <Legend
              verticalAlign="bottom"
              iconType="line"
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            />

            {/* Highlighted pH lines — labels inside the plot area, near the bottom */}
            <ReferenceLine x={PH_A} stroke="#555" strokeDasharray="6 3" strokeWidth={1.5}>
              <Label value={`pH ${PH_A}`} position="insideBottomLeft" offset={4} fontSize={10} fill="#555" />
            </ReferenceLine>
            <ReferenceLine x={PH_B} stroke="#888" strokeDasharray="6 3" strokeWidth={1.5}>
              <Label value={`pH ${PH_B}`} position="insideBottomRight" offset={4} fontSize={10} fill="#888" />
            </ReferenceLine>

            {/* pKa crossover lines — label shows which two species are equal here */}
            <ReferenceLine x={pKa1} stroke="#999" strokeDasharray="4 3" strokeWidth={1.2}>
              <Label
                value={`pKa1=${pKa1.toFixed(1)}  α0=α1  (CO₂↔HCO₃⁻)`}
                position="insideTopRight"
                offset={6}
                fontSize={9.5}
                fill="#666"
              />
            </ReferenceLine>
            <ReferenceLine x={pKa2} stroke="#999" strokeDasharray="4 3" strokeWidth={1.2}>
              <Label
                value={`(α1=α2  HCO₃⁻↔CO₃²⁻)  pKa2=${pKa2.toFixed(1)}`}
                position="insideTopLeft"
                offset={6}
                fontSize={9.5}
                fill="#666"
              />
            </ReferenceLine>

            {/* alpha lines */}
            <Line
              type="monotone" dataKey="alpha0" name="α₀  CO₂(aq)"
              stroke="#000000" strokeWidth={2} dot={false}
            />
            <Line
              type="monotone" dataKey="alpha1" name="α₁  HCO₃⁻"
              stroke="#444444" strokeWidth={2} strokeDasharray="8 4" dot={false}
            />
            <Line
              type="monotone" dataKey="alpha2" name="α₂  CO₃²⁻"
              stroke="#888888" strokeWidth={2} strokeDasharray="3 3" dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 italic mb-8">
        Vertical dashed lines mark pH&nbsp;7.7 and 8.3 (highlighted engineering conditions).
        Faint lines at pK<sub>a1</sub> and pK<sub>a2</sub> show the species crossover pH values.
      </p>

      {/* pH 7.7 vs 8.3 comparison table */}
      <p className="font-semibold text-sm mb-2">
        Table 3 &mdash; Species fractions at highlighted pH values
      </p>
      <div className="overflow-x-auto mb-8">
        <table className="text-sm border border-gray-400 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['pH', 'α₀ CO₂(aq)', 'α₁ HCO₃⁻', 'α₂ CO₃²⁻', 'Dominant species'].map(h => (
                <th key={h} className="border border-gray-400 px-3 py-1 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { pH: PH_A, pt: PT_A },
              { pH: PH_B, pt: PT_B },
            ].map(({ pH, pt }) => (
              <tr key={pH}>
                <td className="border border-gray-400 px-3 py-1 font-semibold text-center">{pH}</td>
                <td className="border border-gray-400 px-3 py-1 font-mono text-right">{pct(pt.a0)}</td>
                <td className="border border-gray-400 px-3 py-1 font-mono text-right">{pct(pt.a1)}</td>
                <td className="border border-gray-400 px-3 py-1 font-mono text-right">{pct(pt.a2)}</td>
                <td className="border border-gray-400 px-3 py-1 text-center">HCO₃⁻</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CO3 change */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Change in CO₃²⁻ fraction between pH 7.7 and 8.3</p>
        <div className="font-mono bg-white border border-gray-200 px-3 py-2 rounded text-xs mb-2">
          Δα₂ = α₂(pH 8.3) − α₂(pH 7.7)
          &nbsp;= {pct(PT_B.a2)} − {pct(PT_A.a2)}
          &nbsp;= {pct(PT_B.a2 - PT_A.a2)}
          &nbsp;(ratio: ×{(PT_B.a2 / PT_A.a2).toFixed(1)})
        </div>
        <p className="text-xs text-gray-700">
          Although α₂ is small at both pH values, the carbonate fraction is{' '}
          <strong>~{(PT_B.a2 / PT_A.a2).toFixed(1)}× higher</strong> at pH&nbsp;8.3 than
          at pH&nbsp;7.7. Because CO₃²⁻ drives scale formation (CaCO₃ precipitation) and
          corrosion reactions, this change is engineering-significant in water treatment
          and CCD systems.
        </p>
      </div>

      {/* Engineering interpretation */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Engineering interpretation</p>
        <ul className="list-disc ml-5 space-y-2 text-gray-700">
          <li>
            <strong>Dominant species:</strong> Between pK<sub>a1</sub>&nbsp;({pKa1.toFixed(1)})
            and pK<sub>a2</sub>&nbsp;({pKa2.toFixed(1)}), bicarbonate (HCO₃⁻) accounts for
            ≥&nbsp;99% of dissolved inorganic carbon. Both highlighted pH values (7.7 and 8.3)
            fall well within this window.
          </li>
          <li>
            <strong>CO₂ capture efficiency:</strong> At typical process pH (7–9), virtually
            all absorbed CO₂ has converted to bicarbonate. This represents a 100× increase
            in effective CO₂ capacity compared to a purely physical solvent, because
            dissociation removes dissolved CO₂ and sustains the absorption driving force.
          </li>
          <li>
            <strong>Scale risk:</strong> CO₃²⁻ rises sharply above pH&nbsp;9. Controlling
            pH&nbsp;≤&nbsp;8.5 keeps carbonate below ~3%, reducing CaCO₃ scaling risk in
            hard water.
          </li>
          <li>
            <strong>Regeneration:</strong> To release CO₂ from a spent HCO₃⁻ solution,
            pH must be lowered below pK<sub>a1</sub>&nbsp;≈&nbsp;{pKa1.toFixed(1)} by
            acidification or stripping — consistent with the steep α₀ rise at low pH visible
            in Figure&nbsp;3.
          </li>
        </ul>
      </div>
    </section>
  )
}
