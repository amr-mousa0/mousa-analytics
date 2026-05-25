# Quickstart: Decap CMS Local Development

Follow these steps to run and test Decap CMS locally.

---

## 1. Run the Local CMS Proxy Server

Since Decap CMS runs in the browser and updates git files, local development requires a file system proxy.

Run this command in a terminal at the root of the repository:

```bash
npx decap-cms-proxy-server
```

*Note: Keep this terminal window open. It allows the browser-based editor to read and write markdown files and images directly to your local workspace.*

---

## 2. Launch Astro Dev Server

In another terminal window, start your local Astro development server:

```bash
npm run dev
```

---

## 3. Access the Dashboard

1. Open your browser and go to: `http://localhost:4321/admin/`
2. The interface will detect the local backend automatically.
3. You can now:
   - Add new services or edit existing ones.
   - Upload new images to the media library.
   - Edit, delete, or create projects.
4. Save your changes. They will write to the respective content files under `src/content/` immediately.
