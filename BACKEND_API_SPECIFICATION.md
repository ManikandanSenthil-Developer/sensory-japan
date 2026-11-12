# LandSense Backend API Specification & Integration Guide

This document defines the complete OpenAPI 3.0-compliant specification, mock payloads, cURL requests, and backend integration guidance for the **LandSense** application.

---

## 1. OpenAPI 3.0 Specification (YAML)

Save this specification as `openapi.yaml` or import it directly into **Swagger UI** or **Postman**.

```yaml
openapi: 3.0.3
info:
  title: LandSense Core AI API
  description: Backend API service powering LandSense architectural plot analysis, floor plan synthesis, and Vastu compliance.
  version: 1.0.0
servers:
  - url: https://api.landsense.app
    description: Production Server
  - url: http://localhost:8000
    description: Local Development Server

paths:
  /api/analyze:
    post:
      summary: Submit a land plot photo for AI architectural analysis
      description: Uploads a photograph of a land parcel along with geo-coordinates and project criteria to generate site context, solar orientation, Vastu compliance, room layouts, and cost estimations.
      operationId: analyzeImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - image
                - buildingType
              properties:
                image:
                  type: string
                  format: binary
                  description: Photographic image of the land plot (JPEG, PNG).
                buildingType:
                  type: string
                  enum: [Residential, Commercial, Mixed, Industrial]
                  example: Residential
                plotSize:
                  type: number
                  description: Land plot area in square feet (optional).
                  example: 2400
                latitude:
                  type: number
                  format: float
                  description: GPS Latitude of the plot.
                  example: 12.971598
                longitude:
                  type: number
                  format: float
                  description: GPS Longitude of the plot.
                  example: 77.594566
      responses:
        '200':
          description: Analysis and floor plan generated successfully.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnalyzeResponse'
        '400':
          description: Invalid request parameters or unreadable image file.
        '500':
          description: Internal server or computer vision pipeline error.

  /api/export-pdf:
    post:
      summary: Generate and download an architectural PDF dossier
      description: Renders a vector PDF document containing the floor plan layout, compliance audit, solar orientation data, and cost breakdown.
      operationId: exportPDF
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - analysisId
              properties:
                analysisId:
                  type: string
                  example: "1710500200123"
      responses:
        '200':
          description: PDF report binary stream.
          content:
            application/pdf:
              schema:
                type: string
                format: binary
        '404':
          description: Analysis ID not found.

  /api/history:
    get:
      summary: Retrieve past analyses history
      description: Returns all past site analyses and synthesized floor plans associated with the current user or device.
      operationId: getHistory
      responses:
        '200':
          description: Array of past analyses.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/AnalyzeResponse'

  /api/refine:
    post:
      summary: Refine a synthesized floor plan with natural language AI
      description: Applies conversational design adjustments (e.g., "Add another bedroom", "Make Vastu compliant") to an existing floor plan layout.
      operationId: refineWithAI
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - analysisId
                - message
              properties:
                analysisId:
                  type: string
                  example: "1710500200123"
                message:
                  type: string
                  example: "Relocate the kitchen to the South-East Agni corner and add a pooja room."
      responses:
        '200':
          description: Floor plan successfully updated.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnalyzeResponse'
        '404':
          description: Analysis ID not found.

components:
  schemas:
    AnalyzeResponse:
      type: object
      required:
        - id
        - siteAnalysis
        - floorPlan
        - compliance
        - costEstimation
        - designRationale
      properties:
        id:
          type: string
          example: "1710500200123"
        siteAnalysis:
          $ref: '#/components/schemas/SiteAnalysis'
        floorPlan:
          $ref: '#/components/schemas/FloorPlanData'
        compliance:
          $ref: '#/components/schemas/ComplianceData'
        costEstimation:
          $ref: '#/components/schemas/CostEstimation'
        designRationale:
          type: string
          example: "The floor plan prioritizes morning solar ingress by positioning the living room along the East frontage..."

    SiteAnalysis:
      type: object
      required:
        - estimatedArea
        - roadAccess
        - vegetation
        - terrain
        - bestOrientation
        - soilType
      properties:
        estimatedArea:
          type: number
          example: 2400
        roadAccess:
          type: string
          example: "North"
        vegetation:
          type: string
          example: "Sparse"
        terrain:
          type: string
          example: "Flat"
        bestOrientation:
          type: string
          example: "East-facing"
        soilType:
          type: string
          example: "Loamy"

    FloorPlanData:
      type: object
      required:
        - totalArea
        - rooms
        - setbacks
      properties:
        totalArea:
          type: number
          example: 2400
        rooms:
          type: array
          items:
            $ref: '#/components/schemas/FloorPlanRoom'
        setbacks:
          type: object
          properties:
            front: { type: number, example: 10 }
            rear: { type: number, example: 5 }
            left: { type: number, example: 3 }
            right: { type: number, example: 3 }

    FloorPlanRoom:
      type: object
      required:
        - id
        - name
        - x
        - y
        - width
        - height
        - color
        - areaSqft
      properties:
        id:
          type: string
          example: "room-1"
        name:
          type: string
          example: "Living Room"
        x:
          type: number
          example: 20
        y:
          type: number
          example: 60
        width:
          type: number
          example: 140
        height:
          type: number
          example: 100
        color:
          type: string
          example: "#4F7FFF"
        areaSqft:
          type: number
          example: 280

    ComplianceData:
      type: object
      required:
        - nbc2016
        - vastu
        - greenScore
      properties:
        nbc2016:
          type: object
          properties:
            compliant: { type: boolean, example: true }
            label: { type: string, example: "NBC 2016 Compliant" }
        vastu:
          type: object
          properties:
            status:
              type: string
              enum: [compliant, partial, non-compliant]
              example: "compliant"
            label: { type: string, example: "Vastu: Compliant" }
        greenScore:
          type: number
          minimum: 1
          maximum: 10
          example: 8

    CostEstimation:
      type: object
      required:
        - minCost
        - maxCost
        - breakdown
      properties:
        minCost:
          type: number
          example: 2500000
        maxCost:
          type: number
          example: 3200000
        breakdown:
          type: array
          items:
            type: object
            properties:
              label: { type: string, example: "Structure" }
              percentage: { type: number, example: 45 }
              color: { type: string, example: "#4F7FFF" }
```

---

## 2. Example cURL Commands

### 2.1. Submit Plot for Analysis (`POST /api/analyze`)
```bash
curl -X POST https://api.landsense.app/api/analyze \
  -H "Accept: application/json" \
  -F "image=@/path/to/land_photo.jpg;type=image/jpeg" \
  -F "buildingType=Residential" \
  -F "plotSize=2400" \
  -F "latitude=12.971598" \
  -F "longitude=77.594566"
```

### 2.2. Export Dossier as PDF (`POST /api/export-pdf`)
```bash
curl -X POST https://api.landsense.app/api/export-pdf \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "1710500200123"}' \
  --output landsense_report.pdf
```

### 2.3. Query Past History (`GET /api/history`)
```bash
curl -X GET https://api.landsense.app/api/history \
  -H "Accept: application/json"
```

### 2.4. Refine Floor Plan with AI (`POST /api/refine`)
```bash
curl -X POST https://api.landsense.app/api/refine \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "1710500200123",
    "message": "Add a dedicated pooja room in the north-east and make the kitchen larger"
  }'
```

---

## 3. Switching the Frontend from Mock to Live Backend

In [`hooks/useAnalysis.ts`](file:///d:/PersonalSpace/Projects/LandSenseJp/hooks/useAnalysis.ts), the application currently runs a mock timer (`setTimeout`) for offline demonstration.

To switch to the live backend, replace the body of `analyzeImage` with:

```typescript
import api from '../services/api';

const analyzeImage = useCallback(
  async (imageUri: string, buildingType: string, plotSize?: number, coords?: { lat?: number; lng?: number }) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Direct call to the backend endpoint
      const result = await api.analyzeImage({
        image: {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'plot_capture.jpg',
        },
        buildingType,
        plotSize,
        latitude: coords?.lat,
        longitude: coords?.lng,
      });

      // Persist to local cache for offline browsing
      const existing = await AsyncStorage.getItem(HISTORY_KEY);
      const history = existing ? JSON.parse(existing) : [];
      history.unshift(result);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));

      setCurrentResult(result);
      setIsAnalyzing(false);
      return result;
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Analysis failed');
      setIsAnalyzing(false);
      throw e;
    }
  },
  []
);
```

