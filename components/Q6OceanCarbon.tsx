// Q6 – Ocean Inorganic Carbon Speciation vs. Depth
// Uses seawater apparent constants (25 °C, S ≈ 35) which differ from the
// simplified fresh-water course values in Q4/Q5.

const K1_SW = 1.41e-6   // pKa1 ≈ 5.85
const K2_SW = 1.00e-9   // pKa2 ≈ 9.00

function bjerrumSW(pH: number) {
  const h = Math.pow(10, -pH)
  const D = h * h + K1_SW * h + K1_SW * K2_SW
  return {
    alpha0: (h * h) / D,
    alpha1: (K1_SW * h) / D,
    alpha2: (K1_SW * K2_SW) / D,
  }
}

function pct(v: number, dp = 1): string {
  return (v * 100).toFixed(dp) + '%'
}

interface OceanRow {
  depth: string
  pH: number
  alpha0: number
  alpha1: number
  alpha2: number
  note: string
}

const ROWS: OceanRow[] = [
  { depth: 'Surface (0 m)',       pH: 8.10, ...bjerrumSW(8.10), note: 'Modern surface ocean' },
  { depth: '200 m',               pH: 7.95, ...bjerrumSW(7.95), note: 'Below euphotic zone' },
  { depth: '500 m',               pH: 7.80, ...bjerrumSW(7.80), note: 'Mesopelagic' },
  { depth: '1 000 m',             pH: 7.65, ...bjerrumSW(7.65), note: 'Bathypelagic' },
  { depth: '2 000 m',             pH: 7.50, ...bjerrumSW(7.50), note: 'Deep water' },
  { depth: '3 000 m',             pH: 7.40, ...bjerrumSW(7.40), note: 'Lysocline onset' },
  { depth: '5 000 m',             pH: 7.25, ...bjerrumSW(7.25), note: 'Below CCD' },
]

function calciteStatus(alpha2: number): string {
  if (alpha2 > 0.06)  return 'Supersaturated'
  if (alpha2 > 0.025) return 'Near saturation'
  if (alpha2 > 0.010) return 'Undersaturated'
  return 'Actively dissolving'
}

export default function Q6OceanCarbon() {
  return (
    <section id="q6" className="mb-20">
      <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">
        Question 6 &mdash; Ocean Inorganic Carbon Speciation vs. Depth
      </h2>

      {/* Context */}
      <p className="text-sm leading-relaxed mb-4 text-gray-800">
        Dissolved inorganic carbon (DIC) in seawater exists as three species:
        CO&#x2082;(aq) (combined with H&#x2082;CO&#x2083; as H&#x2082;CO&#x2083;*),
        bicarbonate HCO&#x2083;&#x207B;, and carbonate CO&#x2083;&#xB2;&#x207B;.
        Their relative proportions at any depth are determined by local pH via the
        Bjerrum distribution (Q5), but computed with seawater apparent equilibrium
        constants that account for ionic strength at S&nbsp;≈&nbsp;35, 25&nbsp;°C:
      </p>

      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="bg-white border border-gray-200 rounded p-2">
            K&#x2081;<sub>sw</sub>&nbsp;=&nbsp;1.41&times;10&#x207B;&#x2076;
            &nbsp;&nbsp;(pK<sub>a1</sub>&nbsp;=&nbsp;5.85)
          </div>
          <div className="bg-white border border-gray-200 rounded p-2">
            K&#x2082;<sub>sw</sub>&nbsp;=&nbsp;1.00&times;10&#x207B;&#x2079;
            &nbsp;&nbsp;(pK<sub>a2</sub>&nbsp;=&nbsp;9.00)
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          These differ from the simplified fresh-water course constants (Q4/Q5).
          The lower pK<sub>a1</sub> (5.85 vs 4.2) and lower pK<sub>a2</sub> (9.00 vs 10.33)
          increase the CO&#x2083;&#xB2;&#x207B; fraction at ocean pH&nbsp;~8, giving
          the realistic surface-ocean speciation of approximately
          1% CO&#x2082; / 88% HCO&#x2083;&#x207B; / 11% CO&#x2083;&#xB2;&#x207B;.
        </p>
      </div>

      {/* Depth table */}
      <p className="font-semibold text-sm mb-2">
        Table 4 &mdash; DIC species fractions at representative ocean depths
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="text-sm border border-gray-400 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['Depth', 'pH', 'α₀  CO₂(aq)', 'α₁  HCO₃⁻', 'α₂  CO₃²⁻', 'Note', 'CaCO₃ status'].map(h => (
                <th key={h} className="border border-gray-400 px-3 py-1 whitespace-nowrap text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => {
              const isLyso = r.note.includes('Lysocline')
              const isCCD  = r.note.includes('CCD')
              const rowBg  = isLyso ? 'bg-yellow-50' : isCCD ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              return (
                <tr key={r.depth} className={rowBg}>
                  <td className="border border-gray-400 px-3 py-1 font-semibold whitespace-nowrap">{r.depth}</td>
                  <td className="border border-gray-400 px-3 py-1 font-mono text-center">{r.pH.toFixed(2)}</td>
                  <td className="border border-gray-400 px-3 py-1 font-mono text-right">{pct(r.alpha0, 2)}</td>
                  <td className="border border-gray-400 px-3 py-1 font-mono text-right">{pct(r.alpha1, 1)}</td>
                  <td className="border border-gray-400 px-3 py-1 font-mono text-right">{pct(r.alpha2, 2)}</td>
                  <td className="border border-gray-400 px-3 py-1 text-xs text-gray-600">{r.note}</td>
                  <td className="border border-gray-400 px-3 py-1 text-xs">{calciteStatus(r.alpha2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 italic mb-8">
        Yellow: lysocline onset; red: below CCD. CaCO&#x2083; status is qualitative;
        actual saturation state requires Ca&#x2082;&#x207A; activity and
        pressure-corrected K<sub>sp</sub>.
      </p>

      {/* Depth trend */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Why does pH decrease with depth?</p>
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>
            <strong>Remineralization:</strong> Sinking organic matter is oxidized by
            bacteria below the euphotic zone, releasing CO&#x2082; and consuming O&#x2082;.
            This raises dissolved CO&#x2082; and lowers pH at depth.
          </li>
          <li>
            <strong>Pressure effect:</strong> Increased hydrostatic pressure slightly
            shifts dissociation constants, lowering pH at constant DIC.
          </li>
          <li>
            <strong>Temperature effect:</strong> Deep water is colder (~2&nbsp;°C),
            which increases CO&#x2082; solubility (Henry&rsquo;s law, Q3) and also
            changes apparent K values.
          </li>
        </ul>
      </div>

      {/* Lysocline and CCD */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Lysocline and Carbonate Compensation Depth (CCD)</p>
        <ul className="list-disc ml-5 space-y-2 text-gray-700">
          <li>
            <strong>Lysocline (~3,000&ndash;4,000 m):</strong> The depth at which
            CaCO&#x2083; dissolution first becomes detectable, corresponding roughly to
            where the calcite saturation index &Omega; drops below 1. The Pacific
            lysocline (~3,500 m) is shallower than the Atlantic (~4,500 m) because
            Pacific deep water is older and has accumulated more remineralized CO&#x2082;.
          </li>
          <li>
            <strong>CCD (~4,000&ndash;5,000 m):</strong> The depth at which the rain
            rate of CaCO&#x2083; from surface production exactly equals the dissolution
            rate. Below the CCD, no carbonate accumulates in sediments&mdash;seafloor
            is covered by siliceous ooze or red clay rather than calcareous ooze.
          </li>
          <li>
            <strong>Shoaling under ocean acidification:</strong> Rising atmospheric CO&#x2082;
            decreases [CO&#x2083;&#xB2;&#x207B;] throughout the water column and raises
            the saturation horizon. Both the lysocline and CCD are shoaling by tens to
            hundreds of metres per decade, threatening carbonate archives and ecosystems.
          </li>
          <li>
            <strong>CCD process implications:</strong> Deep-ocean CO&#x2082; injection below
            the CCD dissolves directly without forming solid hydrates; however, the local
            acidification plume strongly suppresses CO&#x2083;&#xB2;&#x207B; and imposes
            ecological costs that must be weighed against sequestration benefits.
          </li>
        </ul>
      </div>
    </section>
  )
}
