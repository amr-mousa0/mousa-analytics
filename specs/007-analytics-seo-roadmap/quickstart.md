# Quickstart Guide: Setting up Analytics & Tracking locally

This guide describes how to verify the GTM container injection and trigger test events in your local environment.

---

## 1. Local GTM Debugging

To verify that GTM is successfully loaded without loading production scripts:
1. GTM is configured to load dynamically when `import.meta.env.PROD === true`.
2. To test locally, you can temporarily change the build environment flag or configure a test container ID in `astro.config.mjs` (or `.env` file).

---

## 2. Triggering Test Events in Console

Open the browser dev tools console on `http://localhost:4321/` and type:
```javascript
window.dataLayer.push({
  event: 'whatsapp_click',
  page_language: 'en',
  location_clicked: 'hero-section'
});
console.log(window.dataLayer);
```
Verify that the event object is correctly formatted and appended.
