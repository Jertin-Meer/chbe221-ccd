import Head from 'next/head'
import dynamic from 'next/dynamic'

// Dynamic imports avoid SSR issues with Recharts (browser canvas APIs)
const Q3HenrysLaw   = dynamic(() => import('../components/Q3HenrysLaw'),   { ssr: false })
const Q4Equilibrium = dynamic(() => import('../components/Q4Equilibrium'),  { ssr: false })
const Q5BjerrumPlot = dynamic(() => import('../components/Q5BjerrumPlot'),  { ssr: false })

const NAV = [
  { href: '#q3',   label: 'Q3 · Henry\'s Law'           },
  { href: '#q4',   label: 'Q4 · CO₂–Water Equilibrium'  },
  { href: '#q5',   label: 'Q5 · Bjerrum Plot'            },
  { href: '#refs', label: 'References'                    },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>CHBE 221 – CCD Project</title>
        <meta name="description"
              content="CO₂ absorption, Henry's Law, and carbonate equilibrium — CHBE 221 CCD Project" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── Sticky nav ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-300 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-6 h-10 flex items-center gap-6 overflow-x-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">
            CHBE 221
          </span>
          {NAV.map(l => (
            <a key={l.href} href={l.href}
               className="text-xs text-gray-700 hover:text-black hover:underline whitespace-nowrap">
              {l.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Cover ──────────────────────────────────────────────────────── */}
        <header className="border-b-2 border-black pb-5 mb-12">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            CHBE 221 · Process Engineering · CCD Project
          </p>
          <h1 className="text-3xl font-bold leading-tight mb-2">
            CO&#x2082; Absorption, Henry&rsquo;s Law,
            and Carbonate Equilibrium
          </h1>
          <p className="text-base text-gray-600 mb-1">
            Questions 3, 4, and 5 — numerical results, derivations,
            and engineering interpretation
          </p>
          <p className="text-xs text-gray-400">
            Calculations use Appendix A correlations (Weiss 1974; Benson &amp; Krause 1980)
            and standard thermodynamic equilibrium constants at 25&nbsp;°C.
          </p>
        </header>

        {/* ── Question sections ───────────────────────────────────────────── */}
        <Q3HenrysLaw />
        <Q4Equilibrium />
        <Q5BjerrumPlot />

        {/* ── References ─────────────────────────────────────────────────── */}
        <section id="refs" className="border-t border-gray-300 pt-8 mb-12">
          <h2 className="text-xl font-bold mb-4">References</h2>
          <ol className="list-decimal ml-6 space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>
              Weiss, R.&thinsp;F. (1974). Carbon dioxide in water and seawater:
              the solubility of a non-ideal gas.{' '}
              <em>Journal of Marine Research</em>, 32(2), 235–250.
            </li>
            <li>
              Benson, B.&thinsp;B. &amp; Krause, D. (1980). The concentration and
              isotopic fractionation of gases dissolved in freshwater in equilibrium
              with the atmosphere.{' '}
              <em>Limnology and Oceanography</em>, 25(4), 662–671.
            </li>
            <li>
              Smith, J.&thinsp;M., Van Ness, H.&thinsp;C. &amp; Abbott, M.&thinsp;M.
              (2018). <em>Introduction to Chemical Engineering Thermodynamics</em>,
              9th&nbsp;ed. McGraw-Hill. <em>(Appendix A: gas-solubility correlations.)</em>
            </li>
            <li>
              Stumm, W. &amp; Morgan, J.&thinsp;J. (1996).{' '}
              <em>Aquatic Chemistry: Chemical Equilibria and Rates in Natural Waters</em>,
              3rd&nbsp;ed. Wiley-Interscience.
            </li>
            <li>
              Sander, R. (2015). Compilation of Henry&rsquo;s law constants
              (version&nbsp;4.0) for water as solvent.{' '}
              <em>Atmospheric Chemistry and Physics</em>, 15, 4399–4981.
            </li>
          </ol>
        </section>

        <footer className="text-xs text-gray-400 text-center pb-8">
          CHBE 221 CCD Project · University of Illinois Urbana–Champaign
        </footer>
      </main>
    </>
  )
}
