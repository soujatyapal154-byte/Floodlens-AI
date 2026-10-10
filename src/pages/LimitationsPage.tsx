import React from 'react';
import { AlertTriangle, Clock, CloudRain, Mountain, ShieldAlert, CheckCircle2, Info, EyeOff, GitFork } from 'lucide-react';

export const LimitationsPage: React.FC = () => {
  const limitations = [
    {
      title: 'Satellite Revisit Latency (Not Continuous Real-Time)',
      icon: Clock,
      category: 'Orbital Constraints',
      description:
        'Sentinel-1 SAR satellites pass overhead in polar sun-synchronous orbits. A given ground scene is revisited every 6 to 12 days for identical track geometry. Sudden flash floods, dam bursts, or debris flows that surge and recede within hours between acquisitions may leave only residual mud scars rather than standing water.',
    },
    {
      title: 'Severe Mountain Radar Geometry (Layover, Foreshortening & Shadow)',
      icon: Mountain,
      category: 'SAR Physics',
      description:
        'In steep Himalayan canyons (e.g. Trishuli, Marsyangdi, Bhote Koshi), radar pulses hit mountain summits before reaching the valley floor (layover) and steep slopes facing away from the antenna reflect zero energy back (radar shadow). These areas appear pitch black in radar images regardless of moisture and must be masked out using Copernicus DEM slope models.',
    },
    {
      title: 'Cloud Cover Obstruction on Optical Imagery',
      icon: CloudRain,
      category: 'Optical Sensor Constraints',
      description:
        'Monsoon storms routinely cause 80% to 100% cloud opacity across the Himalayas during high-risk flood periods. While Sentinel-2 provides rich multispectral water indices (NDWI), optical imagery is frequently rendered completely unusable. Sentinel-1 SAR is our primary sensor specifically because microwaves penetrate clouds.',
    },
    {
      title: 'SAR False Positives & Surface Roughness Ambiguity',
      icon: AlertTriangle,
      category: 'Backscatter Interpretation',
      description:
        'Smooth dry asphalt, calm airport runways, and specular sandbanks can mimic water backscatter drops. Conversely, wind-driven surface chop or turbulence on flooded rivers causes diffuse reflection, mimicking dry land. Dual-polarization (VV/VH ratio) and multi-temporal baseline subtraction mitigate but cannot completely eliminate these artifacts.',
    },
    {
      title: 'AI Model Domain Shift in Rugged Alpine Relief',
      icon: EyeOff,
      category: 'Deep Learning Generalization',
      description:
        'Most public flood segmentation benchmarks (such as Sen1Floods11) are predominantly trained on low-relief river floodplains (e.g. Mississippi, Mekong, Ganges deltas). Applying these neural networks zero-shot to steep Himalayan gorges requires careful threshold calibration and terrain post-processing to avoid false positives.',
    },
    {
      title: 'OpenStreetMap Vector Completeness & Informal Trails',
      icon: GitFork,
      category: 'Geospatial Vectors',
      description:
        'While primary arteries (such as the Pasang Lhamu Highway NH08) are well-mapped in OSM, informal pedestrian footpaths, temporary wooden suspension footbridges, and seasonal tractor tracks may be unrecorded. A settlement marked as having "NO ROUTE FOUND" has lost vehicular road connectivity, but local residents may still access foot evacuation paths.',
    },
    {
      title: 'Inundation Proximity vs Physical Structural Damage',
      icon: ShieldAlert,
      category: 'Structural Assessment',
      description:
        'Satellite imagery detects the presence of flood water or sediment accumulation touching an infrastructure vector. It cannot evaluate whether a bridge pier has suffered subsurface scour, whether a road embankment is washed away beneath the pavement, or whether a building foundation is compromised. All assessments must be labeled "Potentially affected" and validated on the ground.',
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Scientific Limitations & Operational Caveats
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Understanding the physics, orbital mechanics, and algorithmic boundaries of satellite emergency mapping.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 font-bold">
          Mandatory Safety Notice
        </div>
      </div>

      {/* Prominent Disclaimer Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Non-Operational Prototype Status: Not for Emergency Evacuation Dispatch
          </h2>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          FloodLens AI is designed exclusively as an <strong>educational, research, and hackathon prototype</strong>.
          It must <strong>NOT</strong> be used as an operational emergency decision support system by first responders,
          civil defense authorities, or evacuation teams without independent ground verification. Emergency operations
          must rely on official disaster directives issued by the National Disaster Risk Reduction and Management Authority (NDRRMA)
          and local district administration offices.
        </p>
      </div>

      {/* Limitations Cards */}
      <div className="space-y-4">
        {limitations.map((lim, idx) => {
          const Icon = lim.icon;
          return (
            <div
              key={idx}
              className="enterprise-card rounded-2xl p-5 shadow-xl space-y-2.5 transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">{lim.title}</h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {lim.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-10">
                {lim.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
