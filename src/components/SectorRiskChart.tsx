import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AnalysisRunData } from '../types';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface SectorRiskChartProps {
  analysisData: AnalysisRunData;
}

export interface SectorDataPoint {
  sector: string;
  shortName: string;
  historicalRisk: number; // 0 - 100 historical baseline risk index
  projectedImpact: number; // 0 - 100 current event projected impact
  delta: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  keyAsset: string;
  exposureNote: string;
}

export const SectorRiskChart: React.FC<SectorRiskChartProps> = ({ analysisData }) => {
  const [viewMode, setViewMode] = useState<'comparison' | 'delta'>('comparison');
  const [activeSector, setActiveSector] = useState<string | null>(null);

  // Compute sector data dynamically based on the current analysis run data
  const sectorData = useMemo<SectorDataPoint[]>(() => {
    const totalKm2 =
      analysisData.floodSummary.floodedAreaKm2 + analysisData.floodSummary.debrisAreaKm2;
    const damagedRoads = analysisData.infrastructure.filter(
      (i) => i.type === 'road' && i.status !== 'Clear'
    ).length;
    const damagedBridges = analysisData.infrastructure.filter(
      (i) => i.type === 'bridge' && i.status !== 'Clear'
    ).length;
    const damagedBuildings = analysisData.infrastructure.filter(
      (i) => i.type === 'building' && i.status !== 'Clear'
    ).length;
    const isolatedSettlements = analysisData.settlements.filter(
      (s) => s.connectivityStatus !== 'CONNECTED'
    ).length;

    // Severity scaling factors (clamped 0 to 100)
    const transportImpact = Math.min(
      96,
      Math.max(35, Math.round(45 + damagedRoads * 9 + damagedBridges * 14))
    );
    const residentialImpact = Math.min(
      94,
      Math.max(28, Math.round(35 + isolatedSettlements * 12 + damagedBuildings * 6))
    );
    const agricultureImpact = Math.min(
      92,
      Math.max(30, Math.round(38 + totalKm2 * 11))
    );
    const utilitiesImpact = Math.min(
      88,
      Math.max(25, Math.round(32 + damagedBridges * 10 + totalKm2 * 6))
    );
    const healthImpact = Math.min(
      95,
      Math.max(20, Math.round(28 + isolatedSettlements * 14))
    );
    const commercialImpact = Math.min(
      85,
      Math.max(18, Math.round(24 + damagedBuildings * 8 + totalKm2 * 4))
    );

    const getSeverity = (impact: number): 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' => {
      if (impact >= 75) return 'CRITICAL';
      if (impact >= 55) return 'HIGH';
      if (impact >= 35) return 'MODERATE';
      return 'LOW';
    };

    const list: SectorDataPoint[] = [
      {
        sector: 'Critical Transport',
        shortName: 'Transport',
        historicalRisk: 52,
        projectedImpact: transportImpact,
        delta: transportImpact - 52,
        severity: getSeverity(transportImpact),
        keyAsset: `${damagedRoads} road segments · ${damagedBridges} bridges`,
        exposureNote: 'Culverts and bridges compromised along primary valley corridors.',
      },
      {
        sector: 'Residential Settlements',
        shortName: 'Residential',
        historicalRisk: 44,
        projectedImpact: residentialImpact,
        delta: residentialImpact - 44,
        severity: getSeverity(residentialImpact),
        keyAsset: `${isolatedSettlements} cut-off habitations · ${damagedBuildings} homes`,
        exposureNote: 'Terraced dwellings adjacent to active debris runout channels.',
      },
      {
        sector: 'Agriculture & Terraces',
        shortName: 'Agriculture',
        historicalRisk: 60,
        projectedImpact: agricultureImpact,
        delta: agricultureImpact - 60,
        severity: getSeverity(agricultureImpact),
        keyAsset: `${totalKm2.toFixed(1)} km² silted acreage`,
        exposureNote: 'Riparian crops submerged beneath high-turbidity sediment wash.',
      },
      {
        sector: 'Power & Water Utilities',
        shortName: 'Utilities',
        historicalRisk: 38,
        projectedImpact: utilitiesImpact,
        delta: utilitiesImpact - 38,
        severity: getSeverity(utilitiesImpact),
        keyAsset: 'Hydro conduit intakes & transmission pylons',
        exposureNote: 'Downstream tailrace sedimentation and intake scour hazards.',
      },
      {
        sector: 'Healthcare & Emergency',
        shortName: 'Healthcare',
        historicalRisk: 32,
        projectedImpact: healthImpact,
        delta: healthImpact - 32,
        severity: getSeverity(healthImpact),
        keyAsset: 'Ambulance evacuation corridors',
        exposureNote: 'Direct vehicular access obstructed by road-cut slope failures.',
      },
      {
        sector: 'Commercial & Markets',
        shortName: 'Commercial',
        historicalRisk: 28,
        projectedImpact: commercialImpact,
        delta: commercialImpact - 28,
        severity: getSeverity(commercialImpact),
        keyAsset: 'Valley bazaars & storage depots',
        exposureNote: 'Basement inundation and logistics supply-chain disruptions.',
      },
    ];

    return list;
  }, [analysisData]);

  // Find most critical sector
  const mostCritical = useMemo(() => {
    return [...sectorData].sort((a, b) => b.projectedImpact - a.projectedImpact)[0];
  }, [sectorData]);

  // Custom Dark Command Center Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: SectorDataPoint = payload[0].payload;
    const isCritical = data.projectedImpact >= 75;
    const isHigh = data.projectedImpact >= 55 && data.projectedImpact < 75;

    return (
      <div className="bg-[#0B0F19]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl text-xs max-w-xs space-y-2 text-slate-200 font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
          <span className="font-bold text-white text-sm tracking-tight">{data.sector}</span>
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isCritical
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : isHigh
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
            }`}
          >
            {data.severity}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums">
          <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Historical Risk:</span>
            <span className="text-slate-300 font-bold">{data.historicalRisk}%</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Projected Impact:</span>
            <span
              className={`font-bold ${
                isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              {data.projectedImpact}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
          <span className="text-slate-400">Net Risk Shift (Δ):</span>
          <span
            className={`font-bold ${
              data.delta > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {data.delta > 0 ? `+${data.delta}%` : `${data.delta}%`}
          </span>
        </div>

        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed font-sans">
          <div className="text-cyan-300 font-medium">Key Assets: {data.keyAsset}</div>
          <div className="mt-0.5">{data.exposureNote}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="enterprise-card rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 border border-slate-800">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
              Cross-Sector Vulnerability &amp; Risk Projection
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparative analysis of 10-year historical baseline risk versus current Sentinel-1 event impact.
          </p>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'comparison'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side Comparison
          </button>
          <button
            type="button"
            onClick={() => setViewMode('delta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'delta'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Net Risk Delta (Δ)
          </button>
        </div>
      </div>

      {/* Main Recharts Bar Chart */}
      <div className="w-full h-[320px] sm:h-[360px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'comparison' ? (
            <BarChart
              data={sectorData}
              margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
              onMouseMove={(state) => {
                if (state?.activeLabel != null) setActiveSector(String(state.activeLabel));
              }}
              onMouseLeave={() => setActiveSector(null)}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1E293B"
                vertical={false}
              />
              <XAxis
                dataKey="shortName"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval={0}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '16px',
                  fontSize: '11px',
                  fontFamily: 'Inter, sans-serif',
                }}
                formatter={(value) => {
                  if (value === 'historicalRisk') return 'Historical Baseline Risk Level (%)';
                  if (value === 'projectedImpact') return 'Current Projected Event Impact (%)';
                  return value;
                }}
              />
              <Bar
                dataKey="historicalRisk"
                name="historicalRisk"
                fill="#475569"
                radius={[4, 4, 0, 0]}
                maxBarSize={38}
              />
              <Bar
                dataKey="projectedImpact"
                name="projectedImpact"
                radius={[4, 4, 0, 0]}
                maxBarSize={38}
              >
                {sectorData.map((entry, index) => {
                  let fillColor = '#06B6D4'; // Radar Cyan
                  if (entry.projectedImpact >= 75) fillColor = '#EF4444'; // Emergency Red
                  else if (entry.projectedImpact >= 55) fillColor = '#F59E0B'; // Alert Amber

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      opacity={activeSector && activeSector !== entry.shortName ? 0.6 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={sectorData}
              margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
              onMouseMove={(state) => {
                if (state?.activeLabel != null) setActiveSector(String(state.activeLabel));
              }}
              onMouseLeave={() => setActiveSector(null)}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1E293B"
                vertical={false}
              />
              <XAxis
                dataKey="shortName"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval={0}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit="%"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '16px',
                  fontSize: '11px',
                  fontFamily: 'Inter, sans-serif',
                }}
                formatter={() => 'Net Risk Spike / Delta above Historical Baseline (Δ %)'}
              />
              <Bar
                dataKey="delta"
                name="delta"
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
              >
                {sectorData.map((entry, index) => {
                  let fillColor = '#06B6D4';
                  if (entry.delta >= 30) fillColor = '#EF4444';
                  else if (entry.delta >= 15) fillColor = '#F59E0B';
                  else if (entry.delta < 0) fillColor = '#10B981';

                  return (
                    <Cell
                      key={`cell-delta-${index}`}
                      fill={fillColor}
                      opacity={activeSector && activeSector !== entry.shortName ? 0.6 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Tactical Sector Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800/80">
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Critical Vulnerability Lead</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-white font-bold text-sm">
            {mostCritical.sector}
          </div>
          <div className="text-[10px] font-mono text-rose-400">
            {mostCritical.projectedImpact}% Projected Impact ({mostCritical.delta > 0 ? `+${mostCritical.delta}%` : `${mostCritical.delta}%`} surge)
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Telemetry Methodology</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-white font-bold text-sm">
            SAR Envelope Overlap
          </div>
          <div className="text-[10px] text-slate-400">
            25m spatial buffer intersected with OSM topological vector graphs.
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Operational Priority</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-white font-bold text-sm">
            Bridge &amp; Road Reopening
          </div>
          <div className="text-[10px] text-slate-400">
            Restores connectivity for {analysisData.settlements.length} downstream communities.
          </div>
        </div>
      </div>
    </div>
  );
};
