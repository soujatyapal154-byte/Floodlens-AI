import { AnalysisRunData, BoundingBox, FlowPathResult } from '../types';

export async function startFloodAnalysis(payload: {
  areaName: string;
  bbox: BoundingBox;
  floodDate: string;
}): Promise<{ status: string; data?: AnalysisRunData; errorMessage?: string; errorReason?: string }> {
  try {
    const res = await fetch('/api/analysis/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        status: 'failed',
        errorMessage: json.errorMessage || 'We couldn’t retrieve the satellite data right now.',
        errorReason: json.errorReason || 'Satellite imagery could not be accessed for this area and date.',
      };
    }
    return json;
  } catch (err: any) {
    return {
      status: 'failed',
      errorMessage: 'We couldn’t retrieve the satellite data right now.',
      errorReason: 'Network connection or satellite service temporarily unavailable.',
    };
  }
}

export async function fetchAnalysis(id: string = 'latest'): Promise<AnalysisRunData | null> {
  try {
    const res = await fetch(`/api/analysis/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function calculateFlowPath(coordinates: [number, number]): Promise<FlowPathResult | null> {
  try {
    const res = await fetch('/api/analysis/flow-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function askFloodlensAI(message: string, analysisData: AnalysisRunData): Promise<string> {
  try {
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, analysisData }),
    });
    if (!res.ok) {
      throw new Error('Assistant response failed.');
    }
    const data = await res.json();
    return data.reply;
  } catch (err: any) {
    return 'This information was not determined from the available data.';
  }
}
