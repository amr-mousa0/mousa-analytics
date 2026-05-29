# Data Model & Asset Specifications: Brand Identity Refactor

This document maps out the static assets, SVG configurations, and web manifest definitions required for the branding migration.

---

## 1. New Logo Path Specifications (Direction D - Minimal SaaS Monogram)

To ensure the new logo is mathematically precise, scalable, and independent of external vectors, the coordinates are defined below on a standard **24x24 grid**.

### Main Vector Path
* **Usage**: Renders the primary emblem with the brand gradient.
* **SVG Path Coordinates (`d` attribute)**:
  `d="M 4,17 C 4,10 5.5,6 8.5,6 C 10.5,6 12,11.5 12,11.5 C 12,11.5 13.5,6 15.5,6 C 18.5,6 20,10 20,17"`
* **Visual Form**: A continuous, smooth loop forming the letter "M" with rounded top curves, representing data flow pathways.

### Shadow Vector Path
* **Usage**: Renders the supporting brand accent to add depth and dimension.
* **Translation Shift**: Exactly `dx = 2`, `dy = -2` from the main path.
* **SVG Path Coordinates (`d` attribute)**:
  `d="M 6,15 C 6,8 7.5,4 10.5,4 C 12.5,4 14,9.5 14,9.5 C 14,9.5 15.5,4 17.5,4 C 20.5,4 22,8 22,15"`

---

## 2. SVG Design Rules & Safe Areas

To ensure legibility at micro-resolutions (e.g. 16x16px favicon) and proper rendering on high-contrast backgrounds:

### Sizing and Padding
* **ViewBox**: `0 0 24 24` (Standard default coordinate space)
* **Safe Area Grid**: Keep all active vector paths within a `20x20` coordinate window (padding of `2` units on all sides, coordinate bounds from `2` to `22`).
* **Favicon Sizing Grid**:
  * **Safe Margin**: 10% padding on all sides of the raster png exports.
  * **Stroke Width**: `2.0` on the main path, `1.2` on the shadow path.

### Theme & Contrast Compliance
* **Dark Theme Context** (default background `#0A192F`):
  * Main path uses the Ice Blue to Royal Blue gradient (`url(#logo-grad-gradient)`).
  * Shadow path uses Primary Brand Blue (`#2563EB`) at `0.45` opacity.
* **Light Theme Context** (default background `#F8F9FA`):
  * Main path uses a Navy-to-Blue gradient (`url(#logo-grad-light)`).
  * Shadow path uses Deep Navy Slate (`#0A192F`) at `0.3` opacity.

---

## 3. SVG Gradient Specifications

To maintain color alignment with Option B, all inline SVG emblems will utilize the primary blue theme:

### Dark Theme Gradient Stops (`logo-grad-gradient`)
* **Stop 0%**: `#FFFFFF` (White highlight / start point)
* **Stop 60%**: `#93C5FD` (Light Ice Blue)
* **Stop 100%**: `#2563EB` (Primary Brand Blue)

### Light Theme Gradient Stops (`logo-grad-light`)
* **Stop 0%**: `#0A192F` (Deep Navy Slate / start point)
* **Stop 100%**: `#2563EB` (Primary Brand Blue)

---

## 4. Asset Schema Mapping

All branding assets reside in the public directory and are mapped as follows:

| Asset Path | Type | Dimension | Format | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| `/favicon.svg` | Vector | Scale-free | SVG | Primary favicon for modern browsers. |
| `/favicon.ico` | Legacy | Multi-res | ICO | Fallback favicon. |
| `/favicon-48x48.png` | Raster | 48x48px | PNG | Standard search engine favicon. |
| `/favicon-96x96.png` | Raster | 96x96px | PNG | High-DPI browser favicon. |
| `/favicon-180x180.png` | Raster | 180x180px | PNG | iOS Home Screen Touch icon. |
| `/favicon-192x192.png` | PWA | 192x192px | PNG | PWA application icon. |
| `/favicon-512x512.png` | PWA | 512x512px | PNG | PWA splash screen. |
| `/images/og-image.png`| Social | 1200x630px | PNG | Social card preview. |

---

## 5. Web Manifest Schema (`public/manifest.json`)

The manifest file must match the new assets:

```json
{
  "name": "Mousa Analytics",
  "short_name": "Mousa",
  "description": "Mousa Analytics - Data & Marketing Specialist",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8F9FA",
  "theme_color": "#0A192F",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    },
    {
      "src": "/favicon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/favicon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
