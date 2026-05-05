import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

// ── Appendix A coefficients ──────────────────────────────────────────────────
// ln(xi) = A + B/T + C·ln(T) + D·T + E·T²   (T in K, xi = x at p = 1 atm)
// CO2: derived from Weiss (1974); O2: derived from Benson & Krause (1980)
const COEFF = {
  CO2: { A: -164.769, B: 9050.69, C: 22.294, D: 0, E: 0, MW: 44.01 },
  O2:  { A: -179.329, B: 8747.55, C: 24.453, D: 0, E: 0, MW: 32.00 },
} as const

const MW_H2O = 18.015
const C_WATER = 55.5   // mol/L

const TEMPS = [0, 10, 20, 30] as const
type Gas = keyof typeof COEFF

function calcXi(gas: Gas, T_K: number): number {
  const c = COEFF[gas]
  return Math.exp(c.A + c.B / T_K + c.C * Math.log(T_K) + c.D * T_K + c.E * T_K ** 2)
}

// Grayscale / dash style for 4 temperatures (print-friendly)
const LINE_STYLES = [
  { stroke: '#000000', strokeDasharray: undefined  },
  { stroke: '#444444', strokeDasharray: '10 4'    },
  { stroke: '#777777', strokeDasharray: '4 4'     },
  { stroke: '#aaaaaa', strokeDasharray: '2 6'     },
] as const

interface ChartPoint { p: number; [key: string]: number }

function useChartData(gas: Gas, scale: number): ChartPoint[] {
  return useMemo(() => {
    const xis = TEMPS.map(T => calcXi(gas, T + 273.15))
    return Array.from({ length: 51 }, (_, i) => {
      const p = i * 0.02
      const pt: ChartPoint = { p }
      TEMPS.forEach((T, idx) => { pt[`${T}C`] = xis[idx] * p * scale })
      return pt
    })
  }, [gas, scale])
}

interface SolChart {
  data: ChartPoint[]
  title: string
  yLabel: string
  fig: string
}

function SolubilityChart({ data, title, yLabel, fig }: SolChart) {
  return (
    <div>
      <p className="text-center text-xs font-semibold text-gray-700 mb-1">
        {fig} &mdash; {title}
      </p>
      <ResponsiveContainer width="100%" height={270}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 36, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
          <XAxis
            dataKey="p"
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{ value: 'Partial pressure p (atm)', position: 'insideBottom', offset: -22, fontSize: 11 }}
          />
          <YAxis
            width={62}
            tickFormatter={(v: number) => v.toFixed(2)}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 12, fontSize: 10 }}
          />
          <Tooltip
            formatter={(v) => [typeof v === 'number' ? v.toExponential(3) : v, '']}
            labelFormatter={(v) => `p = ${Number(v).toFixed(2)} atm`}
          />
          <Legend verticalAlign="top" iconType="line" wrapperStyle={{ fontSize: 11 }} />
          {TEMPS.map((T, i) => (
            <Line
              key={T}
              type="monotone"
              dataKey={`${T}C`}
              name={`${T} °C`}
              stroke={LINE_STYLES[i].stroke}
              strokeDasharray={LINE_STYLES[i].strokeDasharray}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Q3HenrysLaw() {
  const co2Data = useChartData('CO2', 1e3)
  const o2Data  = useChartData('O2',  1e5)

  // Conversion table: one row per (gas, temperature) at p = 1 atm
  const tableRows = useMemo(() =>
    (['CO2', 'O2'] as Gas[]).flatMap(gas =>
      TEMPS.map(T => {
        const xi = calcXi(gas, T + 273.15)
        const { MW } = COEFF[gas]
        return {
          gas,
          T,
          H: (1 / xi).toFixed(0),
          xi: xi.toExponential(4),
          ppm_mol: (xi * 1e6).toFixed(1),
          ppm_ww:  (xi * MW / MW_H2O * 1e6).toFixed(1),
          mol_L:   (xi * C_WATER).toExponential(4),
          mg_L:    (xi * C_WATER * MW * 1e3).toFixed(1),
        }
      })
    ), []
  )

  return (
    <section id="q3" className="mb-20">
      {/* Section header */}
      <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">
        Question 3 &mdash; Henry&rsquo;s Law Solubility
      </h2>

      {/* Theory box */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 text-sm leading-relaxed">
        <p className="font-semibold mb-1">Theory</p>
        <p className="mb-2">
          Henry&rsquo;s law for gas&ndash;liquid equilibrium in the dilute limit:
        </p>
        <div className="font-mono text-center my-2">
          p<sub>i</sub> = H · x<sub>i</sub> &nbsp;&nbsp;⟹&nbsp;&nbsp;
          x = p / H = x<sub>i</sub><sup>sat</sup> · p
        </div>
        <p className="mb-2">
          where <em>x</em><sub>i</sub><sup>sat</sup> is the mole-fraction solubility at
          p<sub>i</sub>&nbsp;=&nbsp;1&nbsp;atm, computed from the <strong>Appendix&nbsp;A</strong> correlation
          (T in K):
        </p>
        <div className="font-mono text-center my-2 tracking-tight">
          ln(x<sub>i</sub>) = A + B/T + C ln(T) + D·T + E·T<sup>2</sup>
        </div>
      </div>

      {/* Coefficient table */}
      <p className="font-semibold text-sm mb-2">Table 1 &mdash; Appendix A coefficients (D = E = 0)</p>
      <div className="overflow-x-auto mb-8">
        <table className="text-sm border border-gray-400 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['Gas', 'A', 'B', 'C', 'D', 'E', 'MW (g/mol)', 'Source'].map(h => (
                <th key={h} className="border border-gray-400 px-3 py-1 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-1 font-semibold">CO&#x2082;</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">−164.769</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">9050.69</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">22.294</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">0</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">0</td>
              <td className="border border-gray-400 px-3 py-1">44.01</td>
              <td className="border border-gray-400 px-3 py-1 text-gray-600">Weiss (1974)</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-1 font-semibold">O&#x2082;</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">−179.329</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">8747.55</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">24.453</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">0</td>
              <td className="border border-gray-400 px-3 py-1 font-mono">0</td>
              <td className="border border-gray-400 px-3 py-1">32.00</td>
              <td className="border border-gray-400 px-3 py-1 text-gray-600">Benson & Krause (1980)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Solubility curves */}
      <p className="font-semibold text-sm mb-3">Solubility Curves</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div id="chart-co2-solubility">
          <SolubilityChart
            data={co2Data}
            title="CO&#x2082; in fresh water"
            yLabel="x_CO2 × 10⁻³ (mol/mol)"
            fig="Figure 1"
          />
        </div>
        <div id="chart-o2-solubility">
          <SolubilityChart
            data={o2Data}
            title="O&#x2082; in fresh water"
            yLabel="x_O2 × 10⁻⁵ (mol/mol)"
            fig="Figure 2"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 italic mb-8 -mt-6">
        CO&#x2082; is ~35× more soluble than O&#x2082; at every temperature shown; both gases
        show the expected decrease in solubility with increasing temperature (negative
        ∂x/∂T at constant p).
      </p>

      {/* Conversion table */}
      <p className="font-semibold text-sm mb-1">
        Table 2 &mdash; Concentration unit conversions at <em>p</em> = 1 atm
      </p>
      <p className="text-xs text-gray-600 mb-2">
        Dilute-solution approximations:&ensp;
        [mol/L] = x · c<sub>H₂O</sub>;&ensp;
        [mg/L] = [mol/L] · MW · 1000;&ensp;
        ppm&nbsp;w/w = x · MW<sub>gas</sub>/MW<sub>H₂O</sub> × 10<sup>6</sup>;&ensp;
        c<sub>H₂O</sub> ≈ 55.5 mol/L
      </p>
      <div className="overflow-x-auto">
        <table className="text-xs border border-gray-400 border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              {['Gas', 'T (°C)', 'xᵢ = x @ p = 1 atm', 'H = 1/xᵢ (atm)',
                'ppm mol/mol', 'ppm w/w', 'mol/L', 'mg/L'].map(h => (
                <th key={h} className="border border-gray-400 px-2 py-1 whitespace-nowrap text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r, i) => (
              <tr key={i} className={i % 8 < 4 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-400 px-2 py-0.5 font-semibold">{r.gas}</td>
                <td className="border border-gray-400 px-2 py-0.5 text-center">{r.T}</td>
                <td className="border border-gray-400 px-2 py-0.5 font-mono">{r.xi}</td>
                <td className="border border-gray-400 px-2 py-0.5 font-mono text-right">{r.H}</td>
                <td className="border border-gray-400 px-2 py-0.5 text-right">{r.ppm_mol}</td>
                <td className="border border-gray-400 px-2 py-0.5 text-right">{r.ppm_ww}</td>
                <td className="border border-gray-400 px-2 py-0.5 font-mono">{r.mol_L}</td>
                <td className="border border-gray-400 px-2 py-0.5 text-right">{r.mg_L}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
