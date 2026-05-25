# Quickstart: Minimalist Systems Hero Layout

This document provides quick instructions to run the development server and verify the Hero section updates.

## Development Environment Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open the browser at `http://localhost:4321/` to view the changes.

## Verification

### Localized Rendering
- Navigate to `http://localhost:4321/en/` to verify the English centered layout.
- Navigate to `http://localhost:4321/ar/` to verify the Arabic RTL centered layout.

### Audit Intake Form
- Enter `teststore.com` in the input field inside the Hero section.
- Click "Deploy the Engine" (or "تفعيل المحرك").
- Verify that the page scrolls smoothly to the contact form section and the message field is pre-filled with the audit request details.
