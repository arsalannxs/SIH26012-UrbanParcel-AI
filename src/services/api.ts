import {
  DashboardStats,
  DroneImage,
  Parcel,
  CadastralFeature,
  ValidationResult,
  ValidationSummary,
  Report,
  AiExplanationResponse,
} from '../types.ts';

const API_BASE = '/api';

export const api = {
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to load dashboard statistics');
    return res.json();
  },

  async getDroneImages(): Promise<DroneImage[]> {
    const res = await fetch(`${API_BASE}/drone/images`);
    if (!res.ok) throw new Error('Failed to fetch drone images');
    const json = await res.json();
    return json.data;
  },

  async uploadDroneImage(payload: Partial<DroneImage>): Promise<DroneImage> {
    const res = await fetch(`${API_BASE}/drone/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to upload drone image');
    const json = await res.json();
    return json.data;
  },

  async startAnalysis(droneImageId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/analysis/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ droneImageId }),
    });
    if (!res.ok) throw new Error('Failed to initiate drone analysis');
    return res.json();
  },

  async getParcels(params?: { landUse?: string; status?: string }): Promise<Parcel[]> {
    const query = new URLSearchParams();
    if (params?.landUse) query.append('landUse', params.landUse);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/parcels?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch parcels');
    const json = await res.json();
    return json.data;
  },

  async getParcelById(id: string): Promise<Parcel> {
    const res = await fetch(`${API_BASE}/parcels/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch parcel ${id}`);
    const json = await res.json();
    return json.data;
  },

  async getFeatures(filterType?: string): Promise<CadastralFeature[]> {
    const query = filterType ? `?type=${encodeURIComponent(filterType)}` : '';
    const res = await fetch(`${API_BASE}/features${query}`);
    if (!res.ok) throw new Error('Failed to fetch cadastral features');
    const json = await res.json();
    return json.data;
  },

  async getValidation(): Promise<{ summary: ValidationSummary; results: ValidationResult[] }> {
    const res = await fetch(`${API_BASE}/validation`);
    if (!res.ok) throw new Error('Failed to fetch validation summary');
    return res.json();
  },

  async getValidationByParcel(parcelId: string): Promise<ValidationResult> {
    const res = await fetch(`${API_BASE}/validation/${parcelId}`);
    if (!res.ok) throw new Error(`Failed to fetch validation for ${parcelId}`);
    const json = await res.json();
    return json.validation;
  },

  async getReports(): Promise<Report[]> {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    const json = await res.json();
    return json.data;
  },

  async createReport(parcelId: string, summary?: string, recommendations?: string): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parcelId, summary, recommendations }),
    });
    if (!res.ok) throw new Error('Failed to generate parcel report');
    const json = await res.json();
    return json.data;
  },

  async askAiCadastralAdvisor(parcelId?: string, customContext?: string): Promise<{ source: string; data: AiExplanationResponse }> {
    const res = await fetch(`${API_BASE}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parcelId, customContext }),
    });
    if (!res.ok) throw new Error('Failed to generate AI cadastral explanation');
    return res.json();
  },
};
