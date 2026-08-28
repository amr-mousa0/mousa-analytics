// Modulepreload of vendor-motion is disabled to allow LCP image to claim 100% network priority
// Motion chunk is loaded naturally via deferred module scripts on DOM idle.
console.log('[inject-motion-preload] Motion preload injection bypassed for LCP optimization.');
process.exit(0);