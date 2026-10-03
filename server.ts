import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, DEMO_DRONE_IMAGES, SEEDED_PARCELS, SEEDED_FEATURES, SEEDED_VALIDATIONS, SEEDED_BUILDINGS, SEEDED_ROADS } from './server/data.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini SDK with server-side API key and telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

app.use(express.json({ limit: '20mb' }));

// Health and API routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'UrbanParcel AI',
    version: '2.4.0-sih2026',
    geminiConfigured: !!geminiApiKey,
    time: new Date().toISOString(),
  });
});

// Dashboard stats endpoint
app.get('/api/stats', (req: Request, res: Response) => {
  const parcels = db.getAllParcels();
  const buildings = db.buildings;
  const roads = db.roads;
  const features = db.features;
  const validations = db.validations;
  const issues = validations.filter(v => v.hasWarnings || v.overlapCount > 0);

  res.json({
    imagesProcessed: 24, // Demo baseline statistics
    parcelsDetected: parcels.length > 0 ? parcels.length * 31 : 186,
    buildingsDetected: buildings.length > 0 ? buildings.length * 17 : 241,
    roadsDetected: 48,
    featuresExtracted: 512,
    validationIssues: issues.length > 0 ? issues.length : 7,
    datasetType: 'Demo Dataset - Smart India Hackathon 2026',
    activeDroneImagesCount: db.droneImages.length,
    activeParcelsCount: parcels.length,
  });
});

// Drone Images endpoints
app.get('/api/drone/images', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.droneImages,
  });
});

app.post('/api/drone/upload', (req: Request, res: Response) => {
  const { fileName, fileSize, resolutionGsd, locationName, imageUrl } = req.body;
  
  if (!fileName) {
    return res.status(400).json({ error: 'File name is required' });
  }

  const newImage = {
    id: `drone-img-${Date.now()}`,
    fileName: fileName || 'Uploaded_Drone_Flight.tif',
    fileSize: fileSize || 35400000,
    resolutionGsd: resolutionGsd || 2.5,
    flightAltitude: 105,
    flightDate: new Date().toISOString().split('T')[0],
    locationName: locationName || 'Urban Survey Sector A, Municipal Area',
    minLat: 18.5520,
    maxLat: 18.5575,
    minLng: 73.9310,
    maxLng: 73.9380,
    imageUrl: imageUrl || DEMO_DRONE_IMAGES[0].imageUrl,
  };

  db.droneImages.unshift(newImage);
  res.json({ success: true, data: newImage });
});

// Start Analysis endpoint (simulates pipeline)
app.post('/api/analysis/start', (req: Request, res: Response) => {
  const { droneImageId } = req.body;
  const image = db.droneImages.find(img => img.id === droneImageId) || db.droneImages[0];

  const analysisId = `analysis-${Date.now()}`;
  const newAnalysis = {
    id: analysisId,
    droneImageId: image.id,
    status: 'COMPLETED' as const,
    modelName: 'UrbanCadastre-Net v2.4 (GSD-ResNet)',
    overallConfidence: 0.94,
    parcelsCount: db.parcels.length,
    buildingsCount: db.buildings.length,
    roadsCount: db.roads.length,
    featuresCount: db.features.length,
    issuesCount: db.validations.filter(v => v.hasWarnings).length,
    aiSummary: `AI segmentation and contour boundary extraction completed for ${image.fileName}. Identified ${db.parcels.length} parcel zones, ${db.buildings.length} structural footprints, and ${db.roads.length} road alignments with 94% average feature confidence.`,
    processedAt: new Date().toISOString(),
    progressPercent: 100,
  };

  db.analyses.unshift(newAnalysis);
  res.json({
    success: true,
    analysisId,
    status: 'COMPLETED',
    data: newAnalysis,
  });
});

app.get('/api/analysis/:id', (req: Request, res: Response) => {
  const analysis = db.analyses.find(a => a.id === req.params.id) || db.analyses[0];
  res.json({ success: true, data: analysis });
});

// Parcels endpoints
app.get('/api/parcels', (req: Request, res: Response) => {
  const { landUse, status } = req.query;
  let results = db.getAllParcels();

  if (landUse) {
    results = results.filter(p => p.landUse.toLowerCase().includes(String(landUse).toLowerCase()));
  }
  if (status) {
    results = results.filter(p => p.status === status);
  }

  res.json({ success: true, count: results.length, data: results });
});

app.get('/api/parcels/:id', (req: Request, res: Response) => {
  const parcel = db.getParcelById(req.params.id);
  if (!parcel) {
    return res.status(404).json({ error: 'Parcel not found' });
  }

  const buildings = db.getBuildingsByParcel(parcel.id);
  const validation = db.getValidationByParcel(parcel.id);
  const features = db.features.filter(f => f.parcelId === parcel.id);

  res.json({
    success: true,
    data: {
      ...parcel,
      buildings,
      validation,
      features,
    },
  });
});

// Cadastral Features endpoint
app.get('/api/features', (req: Request, res: Response) => {
  const { type, parcelId } = req.query;
  let results = db.features;

  if (type) {
    results = results.filter(f => f.type === type);
  }
  if (parcelId) {
    results = results.filter(f => f.parcelId === parcelId);
  }

  res.json({ success: true, count: results.length, data: results });
});

// Validation endpoints
app.get('/api/validation', (req: Request, res: Response) => {
  const validations = db.validations;
  const issues = validations.filter(v => v.hasWarnings || v.overlapCount > 0);
  const parcels = db.getAllParcels();

  const enriched = validations.map(v => {
    const parcel = parcels.find(p => p.id === v.parcelId);
    return {
      ...v,
      parcelCode: parcel?.parcelCode || 'Unknown',
      landUse: parcel?.landUse || 'N/A',
      areaSqM: parcel?.areaSqM || 0,
    };
  });

  res.json({
    success: true,
    summary: {
      totalValidated: validations.length,
      validParcels: validations.filter(v => !v.hasWarnings).length,
      flaggedIssues: issues.length,
      closedBoundariesPassed: validations.filter(v => v.closedBoundaries).length,
      validCoordinatesPassed: validations.filter(v => v.validCoordinates).length,
      noDuplicateParcelsPassed: validations.filter(v => v.noDuplicateParcels).length,
      buildingEnclosurePassed: validations.filter(v => v.buildingInsideParcel).length,
      roadConnectivityPassed: validations.filter(v => v.roadConnectivity).length,
    },
    results: enriched,
  });
});

app.get('/api/validation/:parcelId', (req: Request, res: Response) => {
  const parcel = db.getParcelById(req.params.parcelId);
  if (!parcel) {
    return res.status(404).json({ error: 'Parcel not found' });
  }

  const validation = db.getValidationByParcel(parcel.id);
  res.json({ success: true, parcel, validation });
});

// Reports endpoints
app.get('/api/reports', (req: Request, res: Response) => {
  res.json({ success: true, data: db.reports });
});

app.get('/api/reports/:id', (req: Request, res: Response) => {
  const report = db.reports.find(r => r.id === req.params.id || r.reportNumber === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json({ success: true, data: report });
});

app.post('/api/reports', (req: Request, res: Response) => {
  const { parcelId, summary, recommendations } = req.body;
  if (!parcelId) {
    return res.status(400).json({ error: 'parcelId is required' });
  }

  try {
    const newReport = db.createReport(parcelId, summary, recommendations);
    res.json({ success: true, data: newReport });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create report' });
  }
});

// AI Cadastral Explanation & Decision Support using Gemini @google/genai
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  const { parcelId, customContext } = req.body;
  const parcel = parcelId ? db.getParcelById(parcelId) : db.getAllParcels()[0];
  const validation = parcel ? db.getValidationByParcel(parcel.id) : null;
  const buildings = parcel ? db.getBuildingsByParcel(parcel.id) : [];

  const contextData = {
    parcelCode: parcel?.parcelCode || 'UP-MH-00124',
    areaSqM: parcel?.areaSqM || 1842,
    perimeterM: parcel?.perimeterM || 184.6,
    landUse: parcel?.landUse || 'Mixed Residential',
    buildingCount: parcel?.buildingCount || 3,
    roadAccess: parcel?.roadAccess ?? true,
    aiConfidence: `${Math.round((parcel?.confidence || 0.94) * 100)}%`,
    validationWarnings: validation?.hasWarnings ? validation.overlapDescription : 'None (Topology Valid)',
    buildingFootprints: buildings.map(b => `${b.structureId}: ${b.footprintSqM} sq.m (${b.roofType})`).join(', ') || '3 structures detected',
    customNotes: customContext || 'Drone imagery analysis at 2.5cm GSD under DoLR SIH26012 framework.'
  };

  // If Gemini is available, call gemini-3.8-flash
  if (ai) {
    try {
      const prompt = `You are the AI Cadastral Feature Extraction Engine for 'UrbanParcel AI' (DoLR, Ministry of Rural Development, Smart India Hackathon 2026).
Analyze the following extracted urban parcel data and generate an authoritative, clear, and objective surveyor advisory summary:

Parcel Data:
- Parcel Code: ${contextData.parcelCode}
- Extracted Area: ${contextData.areaSqM} sq. meters
- Perimeter: ${contextData.perimeterM} meters
- Land-Use Classification: ${contextData.landUse}
- Detected Structures: ${contextData.buildingCount} (${contextData.buildingFootprints})
- Road Access: ${contextData.roadAccess ? 'Connected' : 'No direct access'}
- AI Model Confidence: ${contextData.aiConfidence}
- Geometric Validation Status: ${contextData.validationWarnings}
- Additional Context: ${contextData.customNotes}

Please return a structured JSON response with:
1. "summary": A concise 2-3 sentence overview of the detected cadastral features.
2. "landUseAssessment": Short rationale on the observed land-use pattern and building density.
3. "validationAnalysis": Assessment of boundary closure, setback compliance, and overlap/encroachment risk.
4. "surveyorRecommendation": Clear, actionable next steps for the field surveyor or revenue inspector.
5. "disclaimer": Note stating that this is an AI-assisted decision-support prototype and requires ground-truthing.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an expert GIS and Cadastral Land Survey AI specialist for the Department of Land Resources (DoLR). Always provide clear, objective, and legally responsible advisory summaries.'
        }
      });

      const responseText = response.text;
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json({
            success: true,
            source: 'gemini-3.8-flash',
            data: parsed,
          });
        } catch {
          // If JSON parsing fails, wrap the text
          return res.json({
            success: true,
            source: 'gemini-3.8-flash',
            data: {
              summary: responseText,
              landUseAssessment: 'Identified consistent urban building clusters with road frontage.',
              validationAnalysis: contextData.validationWarnings,
              surveyorRecommendation: 'Perform ETS ground verification at indicated corner boundary coordinates.',
              disclaimer: 'Prototype decision support output. Not a certified legal land survey.'
            }
          });
        }
      }
    } catch (error: any) {
      console.warn('Gemini API call failed, falling back to deterministic cadastral engine:', error?.message);
    }
  }

  // Realistic deterministic fallback if Gemini key is missing or unavailable
  const fallbackSummary = {
    summary: `The AI computer vision pipeline analyzed 2.5cm GSD drone orthomosaics for ${contextData.parcelCode}. It verified ${contextData.buildingCount} building footprints (${contextData.areaSqM} sq.m total plot envelope) with ${contextData.aiConfidence} model confidence.`,
    landUseAssessment: `The plot exhibits typical ${contextData.landUse} density with regular structural setbacks along the primary access road. Roof surfaces comprise reinforced concrete flat slabs and auxiliary shed roofs.`,
    validationAnalysis: validation?.hasWarnings
      ? `A potential boundary overlap (${validation.overlapDescription}) was flagged on the southern edge. The remaining polygon geometry is closed and non-intersecting.`
      : 'All boundary segments form closed topological rings. Coordinates conform to municipal cadastral coordinate reference systems without self-intersection.',
    surveyorRecommendation: validation?.hasWarnings
      ? 'Field revenue surveyor should deploy an RTK-DGPS rover to take 4-point ground control measurements along the southern compound line.'
      : 'Digitized boundaries match ortho-rectified drone edges. Recommended for surveyor verification and record updation.',
    disclaimer: 'UrbanParcel AI is a prototype developed for Smart India Hackathon 2026. AI outputs provide decision support and do not replace statutory land revenue surveys.'
  };

  res.json({
    success: true,
    source: 'cadastral-rule-engine-fallback',
    data: fallbackSummary,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`UrbanParcel AI Server running on port ${PORT} [env: ${process.env.NODE_ENV || 'dev'}]`);
  });
}

startServer();
