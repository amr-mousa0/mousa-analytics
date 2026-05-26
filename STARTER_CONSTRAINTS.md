# STARTER_CONSTRAINTS.md Project Bootstrap Rules

- This is a blank-slate Astro-native rebuild
- Do not reference legacy architecture
- Do not generate unnecessary files
- Use pnpm or npm consistently
- Use TypeScript strict mode
- Use Astro Content Collections only
- No global client runtime unless explicitly required
- Keep hydration isolated
- Use Tailwind logical properties everywhere
- No light/dark mode system
- No GSAP
- No SPA architecture
- No Zustand/Redux/state managers
- No React islands unless explicitly required
- The inline Contact section (formerly Contact.astro) and the WhatsApp Contact Modal sheet in Navigation.astro have been completely deleted. All contact pathways must route directly to the founder's WhatsApp link (https://wa.me/201017749925) or email directly. Do not implement inline contact forms or bottom sheet modal sheets.
