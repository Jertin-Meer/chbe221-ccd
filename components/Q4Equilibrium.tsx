// Q4 – CO2-Water Equilibrium at 25 °C
// All chemistry is done in plain JS; no charts needed.

// ── Constants ────────────────────────────────────────────────────────────────
const K1  = 6.31e-5   // CO2(aq) + H2O ⇌ H⁺ + HCO3⁻   (course value)
const K2  = 4.67e-11  // HCO3⁻ ⇌ H⁺ + CO3²⁻
const KW  = 1.0e-14   // H2O ⇌ H⁺ + OH⁻  (25 °C)

// Henry's law at 25 °C from Appendix A (Q3)
const XI_CO2_25C = 6.034e-4   // mole fraction at p = 1 atm
const C_WATER    = 55.5        // mol/L
const KH_CO2     = XI_CO2_25C * C_WATER  // mol/(L·atm)

// Two representative partial pressures
const CASES = [
  { label: 'Pure CO₂ (p = 1 atm)',           pCO2: 1.0    },
  { label: 'Atmospheric CO₂ (p = 415 ppm)',  pCO2: 415e-6 },
]

interface EqResult {
  label: string
  pCO2: number
  co2_aq: number  // mol/L
  Hplus:  number  // mol/L
  pH:     number
  hco3:   number  // mol/L
  co3:    number  // mol/L
  oh:     number  // mol/L
  chargeErr: number  // % relative error on charge balance
}

function solve(pCO2: number): Omit<EqResult, 'label'> {
  // [CO2(aq)] fixed by Henry's law (open system)
  const co2_aq = KH_CO2 * pCO2

  // Charge balance: [H+] = [HCO3-] + 2[CO3²-] + [OH-]
  // Express all in terms of h = [H+]:
  //   [HCO3-] = K1·co2 / h
  //   [CO3²-] = K1·K2·co2 / h²
  //   [OH-]   = Kw / h
  // → h³ - K1·co2·h - 2·K1·K2·co2 - Kw·h = 0   (cubic)
  // Solve iteratively starting from h² ≈ K1·co2

  let h = Math.sqrt(K1 * co2_aq + KW)
  for (let iter = 0; iter < 200; iter++) {
    const hco3 = (K1 * co2_aq) / h
    const co3  = (K1 * K2 * co2_aq) / (h * h)
    const oh   = KW / h
    const rhs  = hco3 + 2 * co3 + oh
    const hNew = Math.sqrt(K1 * co2_aq + 2 * K1 * K2 * co2_aq / h + KW)
    if (Math.abs(hNew - h) / h < 1e-12) break
    h = hNew
    void rhs
  }
  const hco3 = (K1 * co2_aq) / h
  const co3  = (K1 * K2 * co2_aq) / (h * h)
  const oh   = KW / h
  const chargeErr = Math.abs(h - hco3 - 2 * co3 - oh) / h * 100

  return { pCO2, co2_aq, Hplus: h, pH: -Math.log10(h), hco3, co3, oh, chargeErr }
}

const RESULTS: EqResult[] = CASES.map(c => ({ label: c.label, ...solve(c.pCO2) }))

function fmt(v: number, sig = 3): string {
  if (v === 0) return '0'
  const exp = Math.floor(Math.log10(Math.abs(v)))
  if (exp >= -2 && exp <= 3) return v.toPrecision(sig)
  return v.toExponential(sig - 1)
}

// Row component for the species table
function SpecRow({ label, val, unit }: { label: string; val: string; unit: string }) {
  return (
    <tr>
      <td className="border border-gray-300 px-3 py-1 font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: label }} />
      <td className="border border-gray-300 px-3 py-1 font-mono text-sm text-right">{val}</td>
      <td className="border border-gray-300 px-3 py-1 text-sm text-gray-600">{unit}</td>
    </tr>
  )
}

function CaseBlock({ r }: { r: EqResult }) {
  return (
    <div className="border border-gray-300 rounded p-5 mb-6">
      <h4 className="font-bold text-sm mb-3 border-b border-gray-200 pb-1">{r.label}</h4>

      {/* Step-by-step */}
      <ol className="text-sm space-y-2 mb-4 leading-relaxed list-decimal ml-4">
        <li>
          <span className="font-semibold">Henry&rsquo;s law</span> at 25&nbsp;°C&nbsp;
          (K<sub>H</sub>&nbsp;=&nbsp;{KH_CO2.toExponential(3)}&nbsp;mol/L·atm):
          <div className="font-mono bg-gray-50 border border-gray-200 px-3 py-1 mt-1 rounded text-xs">
            [CO₂(aq)] = K<sub>H</sub> · p<sub>CO₂</sub>
            &nbsp;= {KH_CO2.toExponential(3)} × {r.pCO2.toExponential(3)}
            &nbsp;= <strong>{r.co2_aq.toExponential(3)} mol/L</strong>
          </div>
        </li>
        <li>
          <span className="font-semibold">Charge balance</span> (open system, [CO₂] fixed):
          <div className="font-mono bg-gray-50 border border-gray-200 px-3 py-1 mt-1 rounded text-xs">
            [H⁺] = [HCO₃⁻] + 2[CO₃²⁻] + [OH⁻]
          </div>
        </li>
        <li>
          <span className="font-semibold">First approximation</span>{' '}
          (neglect CO₃²⁻ and OH⁻; expect [H⁺]&nbsp;≈&nbsp;[HCO₃⁻]):
          <div className="font-mono bg-gray-50 border border-gray-200 px-3 py-1 mt-1 rounded text-xs">
            [H⁺]² ≈ K₁·[CO₂] = {K1.toExponential(2)} × {r.co2_aq.toExponential(3)}
            &nbsp;= {(K1 * r.co2_aq).toExponential(3)}
            &nbsp;→ [H⁺] = {Math.sqrt(K1 * r.co2_aq).toExponential(3)} mol/L
          </div>
        </li>
        <li>
          <span className="font-semibold">Full iterative solution</span> (cubic charge balance
          solved to convergence):
          <div className="font-mono bg-gray-50 border border-gray-200 px-3 py-1 mt-1 rounded text-xs">
            [H⁺] = {r.Hplus.toExponential(3)} mol/L &nbsp;→&nbsp;
            <strong>pH = {r.pH.toFixed(2)}</strong>
            &nbsp;(charge-balance error: {r.chargeErr.toExponential(1)}%)
          </div>
        </li>
      </ol>

      {/* Results table */}
      <p className="text-xs font-semibold mb-1">Equilibrium species concentrations:</p>
      <table className="text-sm border border-gray-300 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-1 text-left">Species</th>
            <th className="border border-gray-300 px-3 py-1 text-right">Concentration</th>
            <th className="border border-gray-300 px-3 py-1 text-left">Unit</th>
          </tr>
        </thead>
        <tbody>
          <SpecRow label="CO₂(aq) ≡ H₂CO₃*" val={fmt(r.co2_aq)} unit="mol/L" />
          <SpecRow label="[H⁺]"               val={fmt(r.Hplus)}  unit="mol/L" />
          <SpecRow label="pH"                  val={r.pH.toFixed(2)} unit="—" />
          <SpecRow label="[HCO₃⁻]"            val={fmt(r.hco3)}   unit="mol/L" />
          <SpecRow label="[CO₃²⁻]"            val={fmt(r.co3)}    unit="mol/L" />
          <SpecRow label="[OH⁻]"              val={fmt(r.oh)}     unit="mol/L" />
        </tbody>
      </table>
    </div>
  )
}

export default function Q4Equilibrium() {
  return (
    <section id="q4" className="mb-20">
      <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">
        Question 4 &mdash; CO&#x2082;-Water Equilibrium at 25&nbsp;°C
      </h2>

      {/* Reactions */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Equilibrium reactions and constants (25&nbsp;°C)</p>
        <p className="text-xs text-gray-600 italic mb-3">
          CO₂(aq) and H₂CO₃ are treated as a single species H₂CO₃* throughout.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { rxn: 'CO₂(aq) + H₂O ⇌ H⁺ + HCO₃⁻', K: 'K₁ = 6.31 × 10⁻⁵' },
            { rxn: 'HCO₃⁻ ⇌ H⁺ + CO₃²⁻',          K: 'K₂ = 4.67 × 10⁻¹¹' },
            { rxn: 'H₂O ⇌ H⁺ + OH⁻',               K: 'Kw = 1.00 × 10⁻¹⁴' },
          ].map(({ rxn, K }) => (
            <div key={K} className="bg-white border border-gray-200 rounded p-2 text-center">
              <div className="text-xs text-gray-500 mb-1"
                   dangerouslySetInnerHTML={{ __html: rxn }} />
              <div className="font-mono text-xs font-bold">{K}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions */}
      <div className="mb-6 text-sm">
        <p className="font-semibold mb-1">Key assumptions</p>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>Ideal dilute solution; activity coefficients = 1.</li>
          <li>
            The system is <em>open</em> to the gas phase — [CO₂(aq)] is fixed by
            Henry&rsquo;s law and does not change as dissociation proceeds.
          </li>
          <li>Only the charge balance constrains [H⁺]; no alkalinity added.</li>
          <li>
            Henry&rsquo;s constant at 25&nbsp;°C from Appendix A (Q3):{' '}
            <span className="font-mono">K<sub>H</sub> = {KH_CO2.toExponential(3)} mol/(L·atm)</span>
          </li>
        </ul>
      </div>

      {/* Case blocks */}
      {RESULTS.map(r => <CaseBlock key={r.label} r={r} />)}

      {/* Interpretation */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Engineering interpretation</p>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>
            At 1&nbsp;atm CO₂ the solution reaches
            pH&nbsp;≈&nbsp;{RESULTS[0].pH.toFixed(1)}, strongly acidic. Almost all
            dissolved carbon exists as CO₂(aq); bicarbonate concentration is{' '}
            {(RESULTS[0].hco3 / RESULTS[0].co2_aq * 100).toFixed(1)}% of
            [CO₂(aq)].
          </li>
          <li>
            At atmospheric pCO₂ (415&nbsp;ppm) the pH rises to{' '}
            {RESULTS[1].pH.toFixed(2)} and the system is still CO₂-dominated
            (bicarbonate is {(RESULTS[1].hco3 / RESULTS[1].co2_aq * 100).toFixed(1)}%
            of total dissolved carbon).
          </li>
          <li>
            Carbonate (CO₃²⁻) is negligible at both pressures because K₂&nbsp;≪&nbsp;K₁,
            placing the HCO₃⁻&nbsp;→&nbsp;CO₃²⁻ transition at pH&nbsp;≈&nbsp;10.3 (see Q5).
          </li>
          <li>
            In a CCD scrubber operating at elevated pCO₂, the absorbing water rapidly
            acidifies; buffering or caustic addition would be needed to maintain
            absorption driving force.
          </li>
        </ul>
      </div>
    </section>
  )
}
