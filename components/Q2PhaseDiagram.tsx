import { useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label,
} from 'recharts'

interface PhasePoint { T: number; P: number }

// ── Sublimation curve (solid ↔ gas) ──────────────────────────────────────────
// ln(P/atm) = 16.53 − 3224/T_K  [calibrated to triple point + dry-ice sublimation]
function sublimP(T_C: number): number {
  return Math.exp(16.53 - 3224 / (T_C + 273.15))
}

// ── Vaporization curve (liquid ↔ gas) ────────────────────────────────────────
// NIST saturation data converted to atm (P_atm = P_MPa / 0.101325)
const VAPOR_DATA: PhasePoint[] = [
  { T: -56.6, P: 5.18  },
  { T: -50,   P: 6.74  },
  { T: -40,   P: 9.92  },
  { T: -30,   P: 14.10 },
  { T: -20,   P: 19.43 },
  { T: -10,   P: 26.14 },
  { T:   0,   P: 34.42 },
  { T:  10,   P: 44.43 },
  { T:  20,   P: 56.54 },
  { T:  31.0, P: 72.84 },
]

// ── Fusion curve (solid ↔ liquid) ────────────────────────────────────────────
// dP/dT ≈ +45.7 atm/K at triple point (positive slope, unlike water)
function fusionP(T_C: number): number {
  return 5.18 + 45.7 * (T_C - (-56.6))
}

// ── Key points ───────────────────────────────────────────────────────────────
const TRIPLE = { T: -56.6, P: 5.18  }
const CRIT   = { T:  31.0, P: 72.84 }

// ── Build data for each curve ─────────────────────────────────────────────────
function buildSublim(): PhasePoint[] {
  return Array.from({ length: 35 }, (_, i) => {
    const T = -130 + i * (73.4 / 34)
    return { T: parseFloat(T.toFixed(2)), P: sublimP(T) }
  })
}

function buildFusion(): PhasePoint[] {
  const pts: PhasePoint[] = []
  for (let i = 0; i <= 20; i++) {
    const T = -56.6 + i * (4.5 / 20)
    const P = fusionP(T)
    if (P <= 200) pts.push({ T: parseFloat(T.toFixed(2)), P: parseFloat(P.toFixed(2)) })
  }
  return pts
}

// Custom dot: invisible (r=0), only the connecting line is shown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HiddenDot = (props: any) => <circle cx={props.cx} cy={props.cy} r={0} />

// Custom tooltip for ScatterChart
function PhaseTip({
  active, payload,
}: {
  active?: boolean
  payload?: { payload: PhasePoint; name: string }[]
}) {
  if (!active || !payload?.length) return null
  const { T, P } = payload[0].payload
  const name = payload[0].name
  return (
    <div className="bg-white border border-gray-300 px-3 py-2 text-xs shadow">
      <p className="font-semibold mb-1">{name}</p>
      <p>T = {T.toFixed(1)} °C</p>
      <p>P = {P.toFixed(2)} atm</p>
    </div>
  )
}

export default function Q2PhaseDiagram() {
  const sublimData = useMemo(buildSublim, [])
  const fusionData = useMemo(buildFusion, [])

  return (
    <section id="q2" className="mb-20">
      <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">
        Question 2 &mdash; CO&#x2082; Phase Diagram
      </h2>

      {/* Theory box */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Key phase boundaries</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            {
              name: 'Sublimation (solid ↔ gas)',
              eq: 'ln(P/atm) = 16.53 − 3224/T_K',
              note: 'T < −56.6 °C',
            },
            {
              name: 'Vaporization (liquid ↔ gas)',
              eq: 'NIST saturation data',
              note: '−56.6 °C < T < 31.0 °C',
            },
            {
              name: 'Fusion (solid ↔ liquid)',
              eq: 'dP/dT ≈ +45.7 atm/K',
              note: 'T > −56.6 °C, P > 5.18 atm',
            },
          ].map(({ name, eq, note }) => (
            <div key={name} className="bg-white border border-gray-200 rounded p-2">
              <div className="font-semibold text-gray-700 mb-1">{name}</div>
              <div className="font-mono mb-0.5">{eq}</div>
              <div className="text-gray-500">{note}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-gray-200 rounded p-2">
            <span className="font-semibold">Triple point: </span>
            <span className="font-mono">T = −56.6 °C,  P = 5.18 atm</span>
            <p className="text-gray-500 mt-0.5">
              Only point where solid, liquid, and gas coexist.
              CO&#x2082; cannot exist as liquid below this pressure.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-2">
            <span className="font-semibold">Critical point: </span>
            <span className="font-mono">T = 31.0 °C,  P = 72.8 atm</span>
            <p className="text-gray-500 mt-0.5">
              Above T&#x1D04; and P&#x1D04;, CO&#x2082; is a supercritical fluid:
              no phase boundary separates liquid from gas.
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <p className="font-semibold text-sm mb-2">
        Figure 0 &mdash; CO&#x2082; pressure&ndash;temperature phase diagram
      </p>
      <div id="chart-phase-diagram" className="border border-gray-200 rounded p-2 mb-2">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 16, right: 30, bottom: 48, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
            <XAxis
              type="number"
              dataKey="T"
              domain={[-130, 50]}
              ticks={[-120, -100, -80, -60, -40, -20, 0, 20, 40]}
              label={{
                value: 'Temperature (°C)',
                position: 'insideBottom',
                offset: -32,
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="P"
              scale="log"
              domain={[0.002, 200]}
              ticks={[0.01, 0.1, 1, 10, 100]}
              tickFormatter={(v: number) =>
                v >= 1 ? v.toFixed(0) : v.toExponential(0)
              }
              label={{
                value: 'Pressure (atm, log scale)',
                angle: -90,
                position: 'insideLeft',
                offset: 16,
                fontSize: 10,
              }}
            />
            <Tooltip content={<PhaseTip />} />
            <Legend
              verticalAlign="bottom"
              iconType="line"
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            />

            {/* Sublimation curve */}
            <Scatter
              name="Sublimation (solid ↔ gas)"
              data={sublimData}
              line={{ stroke: '#2c7bb6', strokeWidth: 2.5 }}
              fill="#2c7bb6"
              shape={<HiddenDot />}
            />

            {/* Vaporization curve */}
            <Scatter
              name="Vaporization (liquid ↔ gas)"
              data={VAPOR_DATA}
              line={{ stroke: '#d7191c', strokeWidth: 2.5 }}
              fill="#d7191c"
              shape={<HiddenDot />}
            />

            {/* Fusion curve */}
            <Scatter
              name="Fusion (solid ↔ liquid)"
              data={fusionData}
              line={{ stroke: '#1a9641', strokeWidth: 2.5 }}
              fill="#1a9641"
              shape={<HiddenDot />}
            />

            {/* Triple point */}
            <ReferenceDot
              x={TRIPLE.T} y={TRIPLE.P}
              r={5} fill="#555" stroke="white" strokeWidth={1.5}
            >
              <Label
                value="Triple pt (−56.6 °C, 5.18 atm)"
                position="right"
                fontSize={9}
                fill="#333"
              />
            </ReferenceDot>

            {/* Critical point */}
            <ReferenceDot
              x={CRIT.T} y={CRIT.P}
              r={5} fill="#e8a020" stroke="white" strokeWidth={1.5}
            >
              <Label
                value="Critical pt (31.0 °C, 72.8 atm)"
                position="left"
                fontSize={9}
                fill="#333"
              />
            </ReferenceDot>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 italic mb-8">
        Log pressure axis. Sublimation curve: from the Antoine-type fit
        ln(P/atm)&nbsp;=&nbsp;16.53&nbsp;&minus;&nbsp;3224/T<sub>K</sub>.
        Vaporization curve: NIST saturation data. Fusion curve: linear
        approximation with dP/dT&nbsp;=&nbsp;+45.7&nbsp;atm/K (positive slope,
        opposite to water). Dry ice sublimes at 1&nbsp;atm and &minus;78.5&nbsp;°C
        (marked by the sublimation curve crossing P&nbsp;=&nbsp;1&nbsp;atm).
      </p>

      {/* Engineering interpretation */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Engineering interpretation</p>
        <ul className="list-disc ml-5 space-y-2 text-gray-700">
          <li>
            <strong>No liquid below 5.18 atm:</strong> At atmospheric pressure,
            CO&#x2082; sublimes directly from solid to gas at &minus;78.5&nbsp;°C.
            This is why dry ice does not melt&mdash;it goes straight from solid
            to vapour. Liquid CO&#x2082; requires both T&nbsp;&gt;&nbsp;&minus;56.6&nbsp;°C
            and P&nbsp;&gt;&nbsp;5.18&nbsp;atm.
          </li>
          <li>
            <strong>Supercritical CO&#x2082; (scCO&#x2082;):</strong> Above the
            critical point (31.0&nbsp;°C, 72.8&nbsp;atm), CO&#x2082; becomes a
            supercritical fluid with liquid-like density and gas-like diffusivity.
            scCO&#x2082; is widely used as a green solvent in extraction (coffee
            decaffeination, hop extraction) and is the preferred injectant in
            geological carbon sequestration, where reservoir pressures typically
            exceed 100&nbsp;atm.
          </li>
          <li>
            <strong>Pipeline transport:</strong> Commercial CO&#x2082; pipelines
            operate above the critical pressure (~80&ndash;150&nbsp;atm) to keep
            CO&#x2082; in the dense-phase / supercritical region, avoiding
            two-phase flow and corrosion issues associated with wet gas.
          </li>
          <li>
            <strong>Positive fusion slope:</strong> Unlike water, CO&#x2082; has a
            positive dP/dT on the melting curve (+45.7&nbsp;atm/K), meaning
            increased pressure raises the melting point. This is the normal
            behaviour for most materials, where the liquid is less dense than
            the solid.
          </li>
        </ul>
      </div>
    </section>
  )
}
