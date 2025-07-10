# API Documentation

Complete documentation for the NASA Mission Control Dashboard API endpoints.

## Base Information

- **Base URL**: `http://localhost:5000/api` (development)
- **Authentication**: NASA API key required (configured server-side)
- **Rate Limiting**: 100 requests per 15 minutes (configurable)
- **Response Format**: JSON
- **CORS**: Enabled for configured origins

## Health & System Endpoints

### GET /api/health

Returns server health status and system metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "timestamp": "2025-07-09T10:00:00.000Z",
    "uptime": 3600.123,
    "environment": "development",
    "version": "1.0.0",
    "services": {
      "api": "operational",
      "cache": "operational",
      "nasa_api": "operational"
    },
    "cache": {
      "keys": 15,
      "hits": 45,
      "misses": 12,
      "hit_rate": 78.9
    }
  }
}
```

## Image Proxy Endpoints

### GET /api/proxy/image

Proxies NASA images to avoid CORS issues and provide caching.

**Parameters:**
- `url` (required): NASA image URL to proxy

**Example:**
```
GET /api/proxy/image?url=https://apod.nasa.gov/apod/image/2501/example.jpg
```

**Response:** Binary image data with appropriate headers

### GET /api/proxy/cache/stats

Returns image cache statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "hits": 150,
      "misses": 25,
      "keys": 75,
      "ksize": 75,
      "vsize": 1024000
    },
    "cached_images": 75,
    "cache_size_mb": 1.0
  }
}
```

## APOD (Astronomy Picture of the Day)

### GET /api/apod/today

Returns today's Astronomy Picture of the Day.

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-07-09",
    "explanation": "Detailed explanation of the image...",
    "hdurl": "https://apod.nasa.gov/apod/image/2501/example_hd.jpg",
    "media_type": "image",
    "service_version": "v1",
    "title": "Amazing Space Phenomenon",
    "url": "https://apod.nasa.gov/apod/image/2501/example.jpg",
    "copyright": "Photographer Name"
  }
}
```

### GET /api/apod/date/:date

Returns APOD for a specific date.

**Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Example:**
```
GET /api/apod/date/2025-01-01
```

### GET /api/apod/random

Returns a random APOD from the archive.

**Query Parameters:**
- `count` (optional): Number of random images (1-100, default: 1)

**Example:**
```
GET /api/apod/random?count=5
```

## Mars Rover Photos

### GET /api/mars/rovers

Returns list of available Mars rovers with their status.

**Response:**
```json
{
  "success": true,
  "data": {
    "rovers": [
      {
        "id": 5,
        "name": "Curiosity",
        "landing_date": "2012-08-06",
        "launch_date": "2011-11-26",
        "status": "active",
        "max_sol": 4000,
        "max_date": "2025-07-09",
        "total_photos": 695000,
        "cameras": [
          {
            "name": "FHAZ",
            "full_name": "Front Hazard Avoidance Camera"
          }
        ]
      }
    ]
  }
}
```

### GET /api/mars/photos/:rover

Returns latest photos from a specific rover.

**Parameters:**
- `rover` (required): Rover name (curiosity, opportunity, spirit, perseverance)

**Query Parameters:**
- `sol` (optional): Martian sol (day)
- `camera` (optional): Camera name (FHAZ, RHAZ, MAST, CHEMCAM, etc.)
- `page` (optional): Page number for pagination

**Example:**
```
GET /api/mars/photos/curiosity?sol=1000&camera=MAST
```

**Response:**
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": 102693,
        "sol": 1000,
        "camera": {
          "id": 20,
          "name": "FHAZ",
          "rover_id": 5,
          "full_name": "Front Hazard Avoidance Camera"
        },
        "img_src": "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG",
        "earth_date": "2015-05-30",
        "rover": {
          "id": 5,
          "name": "Curiosity",
          "landing_date": "2012-08-06",
          "launch_date": "2011-11-26",
          "status": "active"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_photos": 250
    }
  }
}
```

## Near Earth Objects (NEO)

### GET /api/neows/today

Returns today's Near Earth Object data with threat assessment.

**Response:**
```json
{
  "success": true,
  "data": {
    "element_count": 15,
    "near_earth_objects": {
      "2025-07-09": [
        {
          "id": "54016476",
          "neo_reference_id": "54016476",
          "name": "(2020 XY1)",
          "nasa_jpl_url": "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=54016476",
          "absolute_magnitude_h": 18.73,
          "estimated_diameter": {
            "kilometers": {
              "estimated_diameter_min": 0.4082,
              "estimated_diameter_max": 0.9129
            }
          },
          "is_potentially_hazardous_asteroid": false,
          "close_approach_data": [
            {
              "close_approach_date": "2025-07-09",
              "close_approach_date_full": "2025-Jul-09 14:23",
              "epoch_date_close_approach": 1752134580000,
              "relative_velocity": {
                "kilometers_per_second": "8.0123456789",
                "kilometers_per_hour": "28844.4444444",
                "miles_per_hour": "17920.1234567"
              },
              "miss_distance": {
                "astronomical": "0.1234567890",
                "lunar": "48.0246913521",
                "kilometers": "18467890.123456789",
                "miles": "11472345.6789012345"
              }
            }
          ],
          "threat_level": "low",
          "size_category": "small"
        }
      ]
    }
  }
}
```

### GET /api/neows/feed

Returns NEO feed for a date range.

**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format

**Example:**
```
GET /api/neows/feed?start_date=2025-07-01&end_date=2025-07-07
```

## Earth Observation (EPIC)

### GET /api/epic/latest

Returns latest EPIC Earth images.

**Query Parameters:**
- `type` (optional): Image type (natural, enhanced) - default: natural

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "identifier": "20250709003633",
      "caption": "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
      "image": "epic_1b_20250709003633",
      "version": "03",
      "centroid_coordinates": {
        "lat": 8.375,
        "lon": -157.5
      },
      "dscovr_j2000_position": {
        "x": -1283061.5,
        "y": -669893.75,
        "z": -130240.625
      },
      "lunar_j2000_position": {
        "x": 55420.0,
        "y": -346296.875,
        "z": -150240.625
      },
      "sun_j2000_position": {
        "x": -94285000.0,
        "y": 103827000.0,
        "z": 45034000.0
      },
      "attitude_quaternions": {
        "q0": 0.123456,
        "q1": -0.234567,
        "q2": 0.345678,
        "q3": 0.456789
      },
      "date": "2025-07-09 00:36:33",
      "coords": {
        "centroid_coordinates": {
          "lat": 8.375,
          "lon": -157.5
        }
      },
      "image_url": "https://epic.gsfc.nasa.gov/archive/natural/2025/07/09/png/epic_1b_20250709003633.png",
      "thumbnail_url": "https://epic.gsfc.nasa.gov/archive/natural/2025/07/09/thumbs/epic_1b_20250709003633.jpg"
    }
  ]
}
```

### GET /api/epic/date/:date

Returns EPIC images for a specific date.

**Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Query Parameters:**
- `type` (optional): Image type (natural, enhanced)

**Example:**
```
GET /api/epic/date/2025-07-09?type=enhanced
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Invalid request parameters |
| `NASA_API_ERROR` | Error from NASA API |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server internal error |
| `NOT_FOUND` | Resource not found |
| `CACHE_ERROR` | Caching system error |

## Rate Limiting

- **Default Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info included in response headers
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Usage Examples

### JavaScript/Fetch
```javascript
// Get today's APOD
const response = await fetch('/api/apod/today')
const data = await response.json()

if (data.success) {
  console.log(data.data.title)
}
```

### cURL
```bash
# Get Mars rover photos
curl "http://localhost:5000/api/mars/photos/curiosity?sol=1000"

# Get NEO data with date range
curl "http://localhost:5000/api/neows/feed?start_date=2025-07-01&end_date=2025-07-07"
```

## 🔧 Configuration

API behavior can be configured via environment variables:

- `NASA_API_KEY`: NASA API key for higher rate limits
- `CACHE_TTL`: Cache time-to-live in milliseconds
- `RATE_LIMIT_WINDOW`: Rate limiting window in milliseconds
- `RATE_LIMIT_MAX`: Maximum requests per window

For more information, see the main README.md file.