import { useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label, Customized,
} from 'recharts'

interface PhasePoint { T: number; P: number }

// ── Sublimation curve (solid ↔ gas) ──────────────────────────────────────────
// ln(P/atm) = 16.53 − 3224/T_K  [calibrated to triple point + dry-ice sublimation]
function sublimP(T_C: number): number {
  return Math.exp(16.53 - 3224 / (T_C + 273.15))
}

// ── Vaporization curve (liquid ↔ gas) ────────────────────────────────────────
// NIST saturation data, P in atm
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
// dP/dT ≈ +45.7 atm/K starting from the triple point
function fusionP(T_C: number): number {
  return 5.18 + 45.7 * (T_C - (-56.6))
}

// ── Key points ───────────────────────────────────────────────────────────────
const TRIPLE  = { T: -56.6, P: 5.18  }
const CRIT    = { T:  31.0, P: 72.84 }
const DRY_ICE = { T: -78.5, P: 1.0   }  // dry-ice sublimation at 1 atm

// ── Build data ────────────────────────────────────────────────────────────────
function buildSublim(): PhasePoint[] {
  return Array.from({ length: 40 }, (_, i) => {
    const T = -130 + i * (73.4 / 39)
    return { T: parseFloat(T.toFixed(2)), P: sublimP(T) }
  })
}

function buildFusion(): PhasePoint[] {
  const pts: PhasePoint[] = []
  for (let i = 0; i <= 25; i++) {
    const T = -56.6 + i * (4.6 / 25)
    const P = fusionP(T)
    if (P <= 200) pts.push({ T: parseFloat(T.toFixed(3)), P: parseFloat(P.toFixed(2)) })
  }
  return pts
}

// ── Region labels rendered via Recharts Customized ───────────────────────────
interface AxisEntry { scale?: (v: number) => number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PhaseRegionLabels(props: any) {
  const xs: ((v: number) => number) | undefined = props?.xAxisMap?.[0]?.scale
  const ys: ((v: number) => number) | undefined = props?.yAxisMap?.[0]?.scale
  if (!xs || !ys) return null

  // [T_celsius, P_atm, label]
  const labels: [number, number, string][] = [
    [ -90,   20,  'SOLID'          ],
    [  -5,   30,  'LIQUID'         ],
    [ -20,  0.06, 'GAS'            ],
    [  40,  110,  'SUPER-CRITICAL' ],
  ]

  return (
    <g>
      {labels.map(([T, P, text]) => (
        <text
          key={text}
          x={xs(T)}
          y={ys(P)}
          textAnchor="middle"
          fill="#bbb"
          fontSize={10.5}
          fontStyle="italic"
          fontFamily="Georgia, serif"
        >
          {text}
        </text>
      ))}
    </g>
  )
}

// ── Invisible dot (only line is drawn) ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HiddenDot = (props: any) => <circle cx={props.cx} cy={props.cy} r={0} />

// ── Custom tooltip ────────────────────────────────────────────────────────────
function PhaseTip({ active, payload }: { active?: boolean; payload?: { payload: PhasePoint; name: string }[] }) {
  if (!active || !payload?.length) return null
  const { T, P } = payload[0].payload
  return (
    <div className="bg-white border border-gray-300 px-3 py-2 text-xs shadow">
      <p className="font-semibold mb-0.5">{payload[0].name}</p>
      <p>T = {T.toFixed(1)} °C</p>
      <p>P = {P < 1 ? P.toExponential(2) : P.toFixed(2)} atm</p>
    </div>
  )
}

// Suppress unused warning for AxisEntry (used only as documentation)
void ({} as AxisEntry)

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
        <p className="font-semibold mb-2">Phase boundaries</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
          {[
            { name: 'Sublimation (solid ↔ gas)', eq: 'ln(P/atm) = 16.53 − 3224/T_K', note: 'T < −56.6 °C' },
            { name: 'Vaporization (liquid ↔ gas)', eq: 'NIST saturation data', note: '−56.6 °C < T < 31.0 °C' },
            { name: 'Fusion (solid ↔ liquid)',   eq: 'dP/dT ≈ +45.7 atm/K', note: 'steep; positive slope' },
          ].map(({ name, eq, note }) => (
            <div key={name} className="bg-white border border-gray-200 rounded p-2">
              <div className="font-semibold text-gray-700 mb-1">{name}</div>
              <div className="font-mono">{eq}</div>
              <div className="text-gray-500 mt-0.5">{note}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white border border-gray-200 rounded p-2">
            <span className="font-semibold">Triple point: </span>
            <span className="font-mono">−56.6 °C, 5.18 atm</span>
            <p className="text-gray-500 mt-0.5">Solid, liquid, and gas coexist. CO&#x2082; cannot be liquid below this pressure.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-2">
            <span className="font-semibold">Critical point: </span>
            <span className="font-mono">31.0 °C, 72.8 atm</span>
            <p className="text-gray-500 mt-0.5">Above T<sub>c</sub> and P<sub>c</sub>, CO&#x2082; is a supercritical fluid.</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <p className="font-semibold text-sm mb-2">
        Figure 0 &mdash; CO&#x2082; pressure&ndash;temperature phase diagram
      </p>
      <div id="chart-phase-diagram" className="border border-gray-200 rounded p-2 mb-2">
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 20, right: 40, bottom: 52, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              type="number"
              dataKey="T"
              domain={[-130, 50]}
              ticks={[-120, -100, -80, -60, -40, -20, 0, 20, 40]}
              label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -36, fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="P"
              scale="log"
              domain={[0.002, 200]}
              ticks={[0.01, 0.1, 1, 10, 100]}
              tickFormatter={(v: number) => v >= 1 ? v.toFixed(0) : v.toString()}
              label={{ value: 'Pressure (atm, log scale)', angle: -90, position: 'insideLeft', offset: 18, fontSize: 10 }}
            />
            <Tooltip content={<PhaseTip />} />
            <Legend
              verticalAlign="bottom"
              iconType="line"
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            />

            {/* Phase region labels (SOLID / LIQUID / GAS / supercritical) */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Customized component={<PhaseRegionLabels />  as any} />

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
            <ReferenceDot x={TRIPLE.T} y={TRIPLE.P} r={5} fill="#444" stroke="white" strokeWidth={1.5}>
              <Label value="Triple pt (−56.6 °C, 5.18 atm)" position="right" fontSize={9} fill="#333" />
            </ReferenceDot>

            {/* Critical point */}
            <ReferenceDot x={CRIT.T} y={CRIT.P} r={5} fill="#e8a020" stroke="white" strokeWidth={1.5}>
              <Label value="Critical pt (31.0 °C, 72.8 atm)" position="insideTopLeft" fontSize={9} fill="#333" />
            </ReferenceDot>

            {/* Dry-ice sublimation at 1 atm */}
            <ReferenceDot x={DRY_ICE.T} y={DRY_ICE.P} r={4} fill="#2c7bb6" stroke="white" strokeWidth={1.5}>
              <Label value="Dry ice (−78.5 °C, 1 atm)" position="right" fontSize={9} fill="#2c7bb6" />
            </ReferenceDot>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 italic mb-8">
        Log pressure axis. Region labels (SOLID / LIQUID / GAS / SUPER-CRITICAL) mark the four phase
        fields separated by the three boundary curves. The blue dot marks the dry-ice sublimation
        point (−78.5&nbsp;°C, 1&nbsp;atm). The fusion curve is nearly vertical on this scale
        (dP/dT&nbsp;≈&nbsp;+45.7&nbsp;atm/K) and is plotted up to 200&nbsp;atm.
      </p>

      {/* Engineering notes */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm leading-relaxed">
        <p className="font-semibold mb-2">Engineering interpretation</p>
        <ul className="list-disc ml-5 space-y-2 text-gray-700">
          <li>
            <strong>No liquid below 5.18 atm:</strong> At atmospheric pressure CO&#x2082; sublimes
            directly from solid to gas at &minus;78.5&nbsp;°C (dry ice).
            Liquid CO&#x2082; requires T&nbsp;&gt;&nbsp;&minus;56.6&nbsp;°C and
            P&nbsp;&gt;&nbsp;5.18&nbsp;atm simultaneously.
          </li>
          <li>
            <strong>Supercritical CO&#x2082; (scCO&#x2082;):</strong> Above 31.0&nbsp;°C and
            72.8&nbsp;atm, CO&#x2082; becomes a supercritical fluid with liquid-like density and
            gas-like diffusivity. It is used as a green solvent and is the preferred injectant for
            geological carbon sequestration (reservoir pressures typically 100&ndash;300&nbsp;atm).
          </li>
          <li>
            <strong>Positive fusion slope:</strong> Unlike water, CO&#x2082; has a positive
            dP/dT on its melting curve (+45.7&nbsp;atm/K), meaning increased pressure
            raises the melting point — the normal behaviour for most substances.
          </li>
          <li>
            <strong>Pipeline transport:</strong> CO&#x2082; pipelines operate above the critical
            pressure (~80&ndash;150&nbsp;atm) to maintain dense-phase flow, avoiding two-phase
            slugging and corrosion from liquid water.
          </li>
        </ul>
      </div>
    </section>
  )
}
