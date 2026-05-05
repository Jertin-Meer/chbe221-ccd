export default function Q1CarbonCycle() {
  return (
    <section id="q1" className="mb-20">
      <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">
        Question 1 &mdash; Carbon Cycle and Ocean CO&#x2082; Sequestration
      </h2>

      {/* Part a */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-3">
          (a) Role of the Oceans in the Global Carbon Cycle
        </h3>
        <p className="text-sm leading-relaxed mb-3 text-gray-800">
          The global carbon cycle tracks the movement of carbon among four major
          reservoirs: the atmosphere (~870 GtC as CO&#x2082;), the ocean
          (~38,000 GtC as dissolved inorganic and organic carbon), the terrestrial
          biosphere (~2,200 GtC in vegetation and soils), and geologic stores
          (sedimentary rock, fossil fuels). The ocean is by far the largest active
          reservoir&mdash;roughly 40&times; more carbon than the atmosphere.
        </p>
        <p className="text-sm leading-relaxed mb-3 text-gray-800">
          Exchange between the atmosphere and surface ocean is governed by
          Henry&rsquo;s law (Q3): CO&#x2082; dissolves in proportion to its
          partial pressure and inversely with temperature. Globally, the ocean
          absorbs about 90 GtC yr&#x207B;&#xB9; from the atmosphere and releases
          about 88 GtC yr&#x207B;&#xB9; back, yielding a net uptake of roughly
          2&ndash;3 GtC yr&#x207B;&#xB9; today&mdash;approximately 25&ndash;30% of
          annual anthropogenic CO&#x2082; emissions. This net sink is sustained by
          two coupled mechanisms: the solubility pump and the biological pump.
        </p>
        <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm">
          <p className="font-semibold mb-1">Key reservoir sizes (approximate)</p>
          <table className="text-xs border border-gray-300 border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100">
                {['Reservoir', 'Carbon stock (GtC)', 'Notes'].map(h => (
                  <th key={h} className="border border-gray-300 px-3 py-1 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Atmosphere', '~870', 'CO₂, CH₄, other GHGs'],
                ['Surface ocean', '~900', 'DIC in upper 100 m'],
                ['Deep ocean', '~37,100', 'Dissolved CO₂, HCO₃⁻, CO₃²⁻'],
                ['Terrestrial vegetation', '~600', 'Live biomass'],
                ['Soils & permafrost', '~1,600', 'Organic carbon'],
                ['Fossil fuels (proven)', '~3,700', 'Coal, oil, gas'],
              ].map(([r, s, n]) => (
                <tr key={r}>
                  <td className="border border-gray-300 px-3 py-0.5 font-semibold">{r}</td>
                  <td className="border border-gray-300 px-3 py-0.5 font-mono text-right">{s}</td>
                  <td className="border border-gray-300 px-3 py-0.5 text-gray-600">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part b */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-3">
          (b) Solubility Pump and Biological Pump
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          {/* Solubility pump */}
          <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm leading-relaxed">
            <p className="font-semibold mb-2">Solubility Pump (physical)</p>
            <ol className="list-decimal ml-4 space-y-1 text-gray-800">
              <li>
                At high latitudes (North Atlantic, Southern Ocean), surface water
                is cold. Cold water dissolves more CO&#x2082;&mdash;Henry&rsquo;s
                constant H decreases with temperature (Q3: H&#x2082;&#x2080; &#x2248;
                1480 atm vs H&#x2082;&#x2088; &#x2248; 2180 atm for CO&#x2082;,
                so colder water holds &gt;30% more gas per atm).
              </li>
              <li>
                Cold, dense, CO&#x2082;-rich surface water sinks via thermohaline
                circulation (deep-water formation), carrying dissolved carbon
                to depths of 2&ndash;4 km.
              </li>
              <li>
                Deep water is isolated from the atmosphere for centuries to
                millennia, effectively locking away the sequestered carbon.
              </li>
              <li>
                Upwelling in warm tropical and subtropical regions returns deep
                water to the surface; warming reduces solubility, and CO&#x2082;
                outgasses back to the atmosphere, closing the cycle.
              </li>
            </ol>
          </div>

          {/* Biological pump */}
          <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm leading-relaxed">
            <p className="font-semibold mb-2">Biological Pump (biogeochemical)</p>
            <ol className="list-decimal ml-4 space-y-1 text-gray-800">
              <li>
                In the sunlit surface layer (euphotic zone, 0&ndash;200 m),
                phytoplankton fix dissolved CO&#x2082; into organic matter via
                oxygenic photosynthesis and release O&#x2082;:
                <div className="font-mono text-xs bg-white border border-gray-200 rounded px-2 py-1 mt-1">
                  6 CO&#x2082; + 6 H&#x2082;O &rarr; C&#x2086;H&#x2081;&#x2082;O&#x2086; + 6 O&#x2082;
                </div>
              </li>
              <li>
                Dead cells, fecal pellets, and aggregates (marine snow) sink out
                of the surface layer, exporting fixed carbon downward.
              </li>
              <li>
                Roughly 80&ndash;90% is remineralized by bacteria in the water
                column, releasing CO&#x2082;; 10&ndash;20% reaches the seafloor.
              </li>
              <li>
                A small fraction (&#x2272;1% of surface production) is buried in
                sediments, representing long-term geological sequestration.
              </li>
              <li>
                Calcifying organisms (foraminifera, coccolithophores) form CaCO&#x2083;
                shells that also sink, contributing a &ldquo;carbonate pump.&rdquo;
              </li>
            </ol>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          Together, these two pumps maintain a surface-ocean DIC concentration
          of ~2.0 mmol kg&#x207B;&#xB9; and a deep-ocean DIC of ~2.3 mmol kg&#x207B;&#xB9;.
          Without the biological pump, atmospheric CO&#x2082; is estimated to be
          150&ndash;200 ppm higher than observed.
        </p>
      </div>

      {/* Part c */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-3">
          (c) Ocean Acidification
        </h3>

        <p className="text-sm leading-relaxed mb-3 text-gray-800">
          Atmospheric CO&#x2082; has risen from approximately 280 ppm (pre-industrial,
          ca. 1750) to over 420 ppm today, primarily from fossil-fuel combustion and
          land-use change. Because oceanic uptake is governed by Henry&rsquo;s law,
          increased atmospheric CO&#x2082; drives more gas into solution:
        </p>

        <div className="font-mono text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-3 leading-relaxed">
          CO&#x2082;(g) + H&#x2082;O(l) &#x21CC; CO&#x2082;(aq) &#x21CC; H&#x2082;CO&#x2083;*
          &nbsp;&nbsp;&rarr;&nbsp;&nbsp; H&#x207A; + HCO&#x2083;&#x207B;
          &nbsp;&nbsp;&rarr;&nbsp;&nbsp; 2H&#x207A; + CO&#x2083;&#xB2;&#x207B;
        </div>

        <p className="text-sm leading-relaxed mb-3 text-gray-800">
          Each mole of CO&#x2082; that dissolves and fully dissociates releases up to
          two moles of H&#x207A;, lowering pH. The excess protons also consume
          carbonate ion through the secondary reaction:
        </p>

        <div className="font-mono text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-3">
          H&#x207A; + CO&#x2083;&#xB2;&#x207B; &rarr; HCO&#x2083;&#x207B;
        </div>

        <p className="text-sm leading-relaxed mb-3 text-gray-800">
          This reaction depletes the carbonate reservoir, reducing the saturation
          state of calcium carbonate minerals (aragonite and calcite). Since
          pre-industrial times, mean surface-ocean pH has fallen from ~8.18 to
          ~8.08&mdash;a 0.1 unit drop that corresponds to a ~26% increase in
          hydrogen-ion concentration (because pH is logarithmic). Projections
          under high-emission scenarios suggest a further decline of 0.3&ndash;0.4
          units by 2100.
        </p>

        <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm leading-relaxed">
          <p className="font-semibold mb-2">Engineering and ecological significance</p>
          <ul className="list-disc ml-5 space-y-2 text-gray-700">
            <li>
              <strong>Shell-forming organisms:</strong> Corals, oysters, pteropods,
              and many plankton build shells of CaCO&#x2083;. Reduced CO&#x2083;&#xB2;&#x207B;
              concentration lowers the saturation index, making shell formation
              energetically costly and dissolution more likely. Aragonite (used by
              corals) dissolves more readily than calcite; tropical coral reefs are
              already experiencing bleaching exacerbated by acidification.
            </li>
            <li>
              <strong>Lysocline and CCD:</strong> At depth, rising CO&#x2082;
              lowers the lysocline (the depth at which CaCO&#x2083; begins to
              dissolve) and the carbonate compensation depth (CCD, where
              dissolution equals supply), shoaling both by hundreds of metres.
              This affects long-term carbon burial in marine sediments (Q6).
            </li>
            <li>
              <strong>Feedback on the carbon cycle:</strong> As ocean pH falls,
              the buffer capacity (Revelle factor) decreases, meaning the ocean
              becomes less efficient at absorbing additional CO&#x2082;. This is a
              positive feedback that accelerates atmospheric CO&#x2082; accumulation.
            </li>
            <li>
              <strong>CCD process relevance:</strong> Carbon capture and disposal
              (CCD) systems that inject CO&#x2082; into the deep ocean must account
              for local acidification plumes and their effects on sediment chemistry
              and benthic ecosystems.
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
