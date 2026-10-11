import { jsPDF } from 'jspdf';
import { AnalysisRunData } from '../types';

/**
 * Exports current analysis data as a clean, structured JSON file for offline field teams.
 */
export function exportAnalysisAsJson(analysisData: AnalysisRunData): void {
  const exportPayload = {
    metadata: {
      generatedBy: 'Floodlens AI - Emergency Response Geospatial System',
      schemaVersion: '1.2.0',
      exportedAt: new Date().toISOString(),
      offlineReady: true,
      classification: 'UNRESTRICTED OPERATIONAL DISASTER BRIEFING',
    },
    event: {
      id: analysisData.id,
      areaName: analysisData.areaName,
      floodDate: analysisData.floodDate,
      center: analysisData.center,
      zoom: analysisData.zoom,
      boundingBox: analysisData.bbox,
      status: analysisData.status,
    },
    observations: {
      totalAffectedKm2: Number(
        (analysisData.floodSummary.floodedAreaKm2 + analysisData.floodSummary.debrisAreaKm2).toFixed(2)
      ),
      standingWaterKm2: analysisData.floodSummary.floodedAreaKm2,
      debrisLandslideKm2: analysisData.floodSummary.debrisAreaKm2,
      radarConfidencePercent: analysisData.floodSummary.sarConfidencePercent,
      meanBackscatterDropDb: analysisData.floodSummary.meanBackscatterDropDb,
      provenance: analysisData.provenance,
    },
    satelliteSensors: {
      beforeImage: analysisData.satelliteMetadata.beforeImage,
      afterImage: analysisData.satelliteMetadata.afterImage,
      opticalSensorNote: analysisData.satelliteMetadata.opticalStatusNote,
      aiModel: analysisData.aiSegmentation,
    },
    infrastructureExposure: {
      totalImpactedCount: analysisData.infrastructure.filter((i) => i.status !== 'Clear').length,
      impactedAssets: analysisData.infrastructure.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        status: i.status,
        confidencePercent: i.confidencePercent,
        overlapDegree: i.overlapDegree,
        coordinates: i.coordinates,
        locationDescription: i.locationDescription,
        notes: i.notes,
        whyExplanation: i.whyExplanation,
      })),
    },
    settlementConnectivity: {
      totalSettlements: analysisData.settlements.length,
      isolatedSettlements: analysisData.settlements.filter(
        (s) => s.connectivityStatus !== 'CONNECTED'
      ),
      allSettlements: analysisData.settlements.map((s) => ({
        id: s.id,
        name: s.name,
        populationEstimate: s.populationEstimate,
        connectivityStatus: s.connectivityStatus,
        nearestTownOrHospital: s.nearestTownOrHospital,
        normalDistanceKm: s.normalDistanceKm,
        currentEstimatedRouteKm: s.currentEstimatedRouteKm,
        affectedRoadSegmentsCount: s.affectedRoadSegmentsCount,
        routingAnalysisNote: s.routingAnalysisNote,
        whyExplanation: s.whyExplanation,
      })),
    },
    limitationsAndAttribution: {
      caveats: [
        'Satellite imagery has multi-day revisit latency; events between passes may leave only residual trace.',
        'Radar backscatter in steep mountain valleys may include terrain shadow and foreshortening.',
        'Pre-event OpenStreetMap vectors may omit informal footpaths.',
        'All automated AI detections require physical ground truth verification before rescue dispatch.',
      ],
      attribution:
        'Contains modified Copernicus Sentinel data (2026). OpenStreetMap contributors. Copernicus DEM (Airbus/DLR/ESA). AI trained on Sen1Floods11 and Kuro Siwo.',
    },
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const sanitizedName = analysisData.areaName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  a.href = url;
  a.download = `floodlens-sitrep-${sanitizedName}-${analysisData.floodDate}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a high-precision, tactical field PDF situation report.
 */
export function exportAnalysisAsPdf(analysisData: AnalysisRunData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  const totalAffectedKm2 = Number(
    (analysisData.floodSummary.floodedAreaKm2 + analysisData.floodSummary.debrisAreaKm2).toFixed(1)
  );
  const cutOffSettlements = analysisData.settlements.filter(
    (s) => s.connectivityStatus === 'NO ROUTE FOUND'
  );
  const detourSettlements = analysisData.settlements.filter(
    (s) => s.connectivityStatus === 'POSSIBLY CUT OFF'
  );
  const affectedRoads = analysisData.infrastructure.filter(
    (i) => i.type === 'road' && i.status !== 'Clear'
  );
  const affectedBridges = analysisData.infrastructure.filter(
    (i) => i.type === 'bridge' && i.status !== 'Clear'
  );
  const affectedBuildings = analysisData.infrastructure.filter(
    (i) => i.type === 'building' && i.status !== 'Clear'
  );

  // Helper for adding footer with page numbers
  const addFooter = (pageNum: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.text(
      `FLOODLENS AI · FIELD SITUATION REPORT · ${analysisData.areaName.toUpperCase()} · ${analysisData.floodDate}`,
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${pageNum}`, pageWidth - margin - 12, pageHeight - 8);
  };

  // --- HEADER BANNER ---
  doc.setFillColor(11, 15, 25); // Deep matte obsidian (#0B0F19)
  doc.rect(margin, y, pageWidth - margin * 2, 24, 'F');

  // Accent cyan border left
  doc.setFillColor(6, 182, 212); // Radar Cyan
  doc.rect(margin, y, 2.5, 24, 'F');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 182, 212);
  doc.text('FLOODLENS AI · EMERGENCY RESPONSE GEOSPATIAL COMMAND', margin + 6, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`SITUATION REPORT (SITREP): ${analysisData.areaName.toUpperCase()}`, margin + 6, y + 14);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `EVENT DATE: ${analysisData.floodDate} | GENERATED: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
    margin + 6,
    y + 20
  );

  y += 28;

  // --- METRIC TILES GRID ---
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'S');

  const colWidth = (pageWidth - margin * 2) / 4;

  // Box 1: Total Flood
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL INUNDATION', margin + 3, y + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(8, 145, 178); // Cyan Dark
  doc.text(`${totalAffectedKm2} km²`, margin + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${analysisData.floodSummary.floodedAreaKm2}km² water + ${analysisData.floodSummary.debrisAreaKm2}km² debris`,
    margin + 3,
    y + 17
  );

  // Box 2: Radar Confidence
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('RADAR CONFIDENCE', margin + colWidth + 3, y + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 149, 90); // Emerald
  doc.text(`${analysisData.floodSummary.sarConfidencePercent}%`, margin + colWidth + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Delta-sigma0 <= -18.4 dB`, margin + colWidth + 3, y + 17);

  // Box 3: Cut-Off Settlements
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CUT-OFF SETTLEMENTS', margin + colWidth * 2 + 3, y + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38); // Alert Red
  doc.text(`${cutOffSettlements.length} ISOLATED`, margin + colWidth * 2 + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${detourSettlements.length} need critical detour`, margin + colWidth * 2 + 3, y + 17);

  // Box 4: Impacted Assets
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('INFRASTRUCTURE IMPACT', margin + colWidth * 3 + 3, y + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(217, 119, 6); // Amber
  doc.text(
    `${affectedRoads.length + affectedBridges.length + affectedBuildings.length} ASSETS`,
    margin + colWidth * 3 + 3,
    y + 13
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${affectedRoads.length} rds · ${affectedBridges.length} br · ${affectedBuildings.length} bld`,
    margin + colWidth * 3 + 3,
    y + 17
  );

  y += 26;

  // --- 1. EXECUTIVE SUMMARY ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE SUMMARY & TACTICAL DIRECTIVE', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const summaryText = `Automated multi-pass satellite change detection using cloud-penetrating Sentinel-1 SAR imagery identified ${totalAffectedKm2} km² of flood inundation and landslide debris in the ${analysisData.areaName} valley. Pre-event OpenStreetMap road network graph analysis identifies ${cutOffSettlements.length} settlement(s) with zero viable motorable roads remaining, and ${detourSettlements.length} settlement(s) requiring multi-hour mountain detours. Immediate field verification and aerial rotary-wing supply recon is recommended for isolated coordinates.`;
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 3.8 + 4;

  // --- 2. ISOLATED SETTLEMENTS TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. POTENTIALLY CUT-OFF SETTLEMENTS & ROAD CONNECTIVITY', margin, y);
  y += 5;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('SETTLEMENT NAME', margin + 3, y + 4.2);
  doc.text('EST. POPULATION', margin + 55, y + 4.2);
  doc.text('STATUS', margin + 90, y + 4.2);
  doc.text('NEAREST MEDICAL / TOWN', margin + 130, y + 4.2);
  y += 6;

  const allRelevantSettlements = analysisData.settlements.slice(0, 6);
  allRelevantSettlements.forEach((settlement, idx) => {
    doc.setFillColor(
      idx % 2 === 0 ? 248 : 255,
      idx % 2 === 0 ? 250 : 255,
      idx % 2 === 0 ? 252 : 255
    );
    doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(settlement.name, margin + 3, y + 4.2);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(String(settlement.populationEstimate || 'N/A'), margin + 55, y + 4.2);

    if (settlement.connectivityStatus === 'NO ROUTE FOUND') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('NO ROUTE FOUND', margin + 90, y + 4.2);
    } else if (settlement.connectivityStatus === 'POSSIBLY CUT OFF') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(217, 119, 6);
      const detourDist = settlement.currentEstimatedRouteKm
        ? `${settlement.currentEstimatedRouteKm} km`
        : 'DETOUR';
      doc.text(detourDist, margin + 90, y + 4.2);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(22, 101, 52);
      doc.text('CONNECTED', margin + 90, y + 4.2);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(settlement.nearestTownOrHospital || 'None designated', margin + 130, y + 4.2);

    y += 6;
  });

  y += 4;

  // --- 3. IMPACTED CRITICAL INFRASTRUCTURE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. IMPACTED INFRASTRUCTURE (WITHIN 25M FLOOD ENVELOPE)', margin, y);
  y += 5;

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('INFRASTRUCTURE ASSET', margin + 3, y + 4.2);
  doc.text('ASSET TYPE', margin + 65, y + 4.2);
  doc.text('STATUS', margin + 105, y + 4.2);
  doc.text('CONFIDENCE', margin + 145, y + 4.2);
  y += 6;

  const relevantInfra = analysisData.infrastructure
    .filter((i) => i.status !== 'Clear')
    .slice(0, 6);

  if (relevantInfra.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No mapped infrastructure intersects the detected flood envelope.', margin + 3, y + 4.5);
    y += 7;
  } else {
    relevantInfra.forEach((item, idx) => {
      doc.setFillColor(
        idx % 2 === 0 ? 248 : 255,
        idx % 2 === 0 ? 250 : 255,
        idx % 2 === 0 ? 252 : 255
      );
      doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.name.slice(0, 36), margin + 3, y + 4.2);

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(item.type.toUpperCase(), margin + 65, y + 4.2);

      doc.setFont('helvetica', 'bold');
      if (item.status === 'Potentially affected') {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(217, 119, 6);
      }
      doc.text(item.status.slice(0, 22), margin + 105, y + 4.2);

      doc.setFont('courier', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${item.confidencePercent}%`, margin + 145, y + 4.2);

      y += 6;
    });
  }

  y += 4;

  // --- 4. SATELLITE & AI PROVENANCE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. OBSERVATIONAL METADATA & SENSOR PROVENANCE', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const provText = `Primary sensor: Sentinel-1 C-SAR (Orbit: ${analysisData.satelliteMetadata.afterImage.relativeOrbit}, Pol: ${analysisData.satelliteMetadata.afterImage.polarization}, Resolution: ${analysisData.satelliteMetadata.afterImage.resolutionMeters}m). Pre-event pass: ${analysisData.satelliteMetadata.beforeImage.acquisitionDate}. Post-event pass: ${analysisData.satelliteMetadata.afterImage.acquisitionDate}. AI Segmenter: ${analysisData.aiSegmentation.architecture} (IoU ${analysisData.aiSegmentation.iouScore}, F1 ${analysisData.aiSegmentation.f1Score}). Optical sensor status: ${analysisData.satelliteMetadata.opticalStatusNote}`;
  const splitProv = doc.splitTextToSize(provText, pageWidth - margin * 2);
  doc.text(splitProv, margin, y);
  y += splitProv.length * 3.5 + 4;

  // --- 5. DISCLAIMER & GROUND VERIFICATION WARNING ---
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.rect(margin, y, pageWidth - margin * 2, 14, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(185, 28, 28);
  doc.text('CAUTION: FOR FIELD OPERATIONAL PLANNING - REQUIRES GROUND TRUTH VERIFICATION', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(127, 29, 29);
  doc.text(
    'Radar backscatter in mountain valleys is subject to terrain shadow and steep angle distortion. Road networks may not reflect informal paths. Ground reconnaissance is required prior to heavy vehicle transit.',
    margin + 3,
    y + 9
  );

  addFooter(1);

  // Save the PDF
  const sanitizedName = analysisData.areaName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`floodlens-sitrep-${sanitizedName}-${analysisData.floodDate}.pdf`);
}
