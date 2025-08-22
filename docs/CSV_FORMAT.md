# Supplier Catalog CSV Format

This document describes the CSV format for bulk uploading products to the IRMA marketplace.

## CSV Structure

### Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `title` | String | Product name/title | "RT-600 Industrial Robot Arm" |
| `sku` | String | Unique product SKU | "RT-600-STD" |
| `category` | Enum | Product category | "SixAxis" |
| `priceMinINR` | Number | Minimum price in INR | 1800000 |
| `priceMaxINR` | Number | Maximum price in INR | 2200000 |
| `leadTimeWeeks` | Integer | Lead time in weeks | 8 |

### Optional Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `payloadKg` | Number | Payload capacity in kg | 50.5 |
| `reachMm` | Number | Reach in millimeters | 1200.0 |
| `repeatabilityMm` | Number | Repeatability in mm | 0.05 |
| `maxSpeedMps` | Number | Max speed in m/s | 2.0 |
| `ipRating` | String | IP protection rating | "IP54" |
| `controller` | String | Controller type | "Siemens S7-1500 PLC" |

### Extended Specifications (JSON Format)

Additional specifications can be provided in JSON format columns:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `specs_json` | JSON String | Extended specifications | See examples below |

## Product Categories

| Category | Description |
|----------|-------------|
| `AMR` | Autonomous Mobile Robot |
| `AGV` | Automated Guided Vehicle |
| `SixAxis` | 6-Axis Robot Arm |
| `SCARA` | SCARA Robot |
| `Conveyor` | Conveyor System |
| `ASRS` | Automated Storage & Retrieval |
| `Vision` | Vision System |
| `Other` | Other Automation Equipment |

## Extended Specifications Schema

The `specs_json` column should contain a JSON object with category-specific fields:

### Robot Arms (SixAxis/SCARA)
```json
{
  "degreesOfFreedom": 6,
  "rotationSpeed": 180,
  "mounting": "Floor/Ceiling",
  "connectivity": ["Ethernet/IP", "Profinet"],
  "certifications": ["CE", "ISO 10218"],
  "warrantyMonths": 24,
  "mttrHours": 4,
  "operatingTemp": "-10°C to +50°C",
  "safetyRating": "PLd/SIL2",
  "programmingInterface": "Teach Pendant + PC Software",
  "serviceTeam": true,
  "remoteDiagnostics": true,
  "trainingIncluded": true
}
```

### Mobile Robots (AMR/AGV)
```json
{
  "navigation": "SLAM + LiDAR",
  "batteryLife": 8,
  "chargingTime": 2,
  "dimensions": "1200x800x300 mm",
  "connectivity": ["WiFi", "Bluetooth", "Ethernet"],
  "certifications": ["CE", "FCC"],
  "warrantyMonths": 36,
  "mttrHours": 6,
  "operatingTemp": "0°C to +40°C",
  "safetyRating": "PLd/SIL2",
  "fleetManagement": true,
  "serviceTeam": true,
  "remoteDiagnostics": true,
  "trainingIncluded": true
}
```

### Conveyor Systems
```json
{
  "beltWidth": 600,
  "length": 2400,
  "motorPower": 2.2,
  "driveType": "Variable Frequency Drive",
  "connectivity": ["Modbus RTU", "Ethernet/IP"],
  "certifications": ["CE", "IS Standards"],
  "warrantyMonths": 12,
  "mttrHours": 2,
  "operatingTemp": "+5°C to +60°C",
  "beltMaterial": "PVC/PU",
  "frameStainless": true,
  "serviceTeam": true,
  "remoteDiagnostics": false,
  "trainingIncluded": true
}
```

### Vision Systems
```json
{
  "resolution": "2048x1536",
  "frameRate": 60,
  "lensOptions": ["16mm", "25mm", "50mm"],
  "lightingIntegrated": true,
  "connectivity": ["Ethernet", "RS-232", "Digital I/O"],
  "certifications": ["CE", "FCC"],
  "warrantyMonths": 12,
  "software": "In-Sight Explorer",
  "algorithms": ["OCR", "Pattern Matching", "Measurement"],
  "operatingTemp": "+0°C to +50°C",
  "serviceTeam": false,
  "remoteDiagnostics": true,
  "trainingIncluded": true
}
```

## CSV Example

```csv
title,sku,category,payloadKg,reachMm,repeatabilityMm,maxSpeedMps,ipRating,controller,priceMinINR,priceMaxINR,leadTimeWeeks,specs_json
"RT-600 Industrial Robot Arm","RT-600-STD","SixAxis",50.0,1200.0,0.05,2.0,"IP54","Siemens S7-1500 PLC",1800000,2200000,8,"{""degreesOfFreedom"":6,""warrantyMonths"":24,""serviceTeam"":true}"
"AM-Belt-2400 Conveyor","AM-BELT-2400","Conveyor",100.0,,,1.0,"IP65","Schneider Modicon M580",450000,650000,4,"{""beltWidth"":600,""length"":2400,""motorPower"":2.2}"
```

## Validation Rules

### Required Field Validation
- `title`: 3-200 characters
- `sku`: 3-50 characters, alphanumeric with hyphens
- `category`: Must be one of the valid categories
- `priceMinINR`: Positive number ≥ 1000
- `priceMaxINR`: Must be ≥ priceMinINR
- `leadTimeWeeks`: Integer between 1-52

### Optional Field Validation
- `payloadKg`: Positive number if provided
- `reachMm`: Positive number if provided
- `repeatabilityMm`: Positive number if provided
- `maxSpeedMps`: Positive number if provided
- `ipRating`: Format like "IP54", "IP65", etc.

### Specs JSON Validation
- Must be valid JSON if provided
- Recommended fields vary by category
- `warrantyMonths`: Integer ≥ 1 if provided
- `mttrHours`: Positive number if provided
- Boolean fields: true/false only

## Upload Process

1. **Prepare CSV**: Follow the format above
2. **Validate Locally**: Check required fields and formats
3. **Upload via Portal**: Use the supplier catalog upload page
4. **Review Results**: Check for validation errors
5. **Publish Products**: Set status to LIVE after review

## Common Errors

### CSV Format Issues
- **Encoding**: Use UTF-8 encoding
- **Delimiters**: Use commas (,) as delimiters
- **Quotes**: Wrap text containing commas in double quotes
- **Line Endings**: Use standard line endings (CRLF or LF)

### Data Validation Errors
- **Duplicate SKUs**: Each SKU must be unique within your organization
- **Invalid Category**: Must match exactly (case-sensitive)
- **Price Range**: priceMaxINR must be ≥ priceMinINR
- **JSON Format**: specs_json must be valid JSON or empty

### Performance Tips
- **Batch Size**: Upload up to 1000 products per CSV
- **File Size**: Keep CSV files under 10MB
- **Validation**: Validate JSON specs before upload

## Sample Files

Download sample CSV files from the supplier portal:
- [Robot Arms Sample](samples/robot-arms-sample.csv)
- [Mobile Robots Sample](samples/mobile-robots-sample.csv)
- [Conveyor Systems Sample](samples/conveyor-sample.csv)
- [Complete Sample](samples/all-categories-sample.csv)

## Support

For upload issues or format questions:
- Review validation error messages
- Check sample files for reference
- Contact support via supplier portal
- Email: supplier-support@irma.marketplace

---

**Note**: All products uploaded via CSV will have status "DRAFT" initially. You must manually publish them via the catalog management page after review.