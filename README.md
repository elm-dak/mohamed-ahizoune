# Mohamed Ahizoune

A premium, responsive one-page athlete and coaching website. Built with Astro, local fonts, and static assets. No backend or environment variables required.

## Run locally

Use Node.js 22.19 or newer (Node 22 is recommended for Vercel).

```sh
npm install
npm run dev
```

## Validate and build

```sh
npm run check
npm run build
npm run preview
```

With the dev server running, `npm run verify` checks both themes, responsive layouts, goal and session tabs, exercise checklists, downloads, pricing, awards, the enquiry form, encoded WhatsApp links, images, navigation, and FAQ in Chrome. It saves screenshots in `artifacts/`.

## Deploy to Vercel

Import this folder as its own repository, or set the Vercel project Root Directory to `mohamed-ahizoune` if importing the parent repository. Select Astro, use `npm run build`, and publish `dist`. The included `vercel.json` sets these defaults. Alternatively, run `npx vercel` from this directory, then `npx vercel --prod` to publish.

## Content and images

- Edit page content and Instagram links in `src/pages/index.astro`.
- Edit the design foundation in `src/styles/global.css` and the refined components and light theme in `src/styles/refinement.css`.
- Edit sample training routines in `src/data/programs.ts`. Source links are included in the explorer and downloads. Upper/lower and dumbbell sessions are excerpts, not complete personalized plans.
- Pricing is 10% below the supplied reference: Starter MAD 900, Transformation MAD 2,519.10, Elite MAD 4,049.10 per month. Pack features match the supplied screenshot.
- WhatsApp is configured for `212661328967` in `src/data/site.ts`. The form prepares a message with the visitor's details, selected pack, and program interest. The visitor reviews it before opening WhatsApp and sending it. It never sends or stores personal data automatically.
- The original charcoal and lime theme is the default. The light/dark switch saves a visitor's explicit choice in local storage.
- Three distinct supplied photos are stored in `public/images/`. Optimized WebP files are used for the hero, introduction, and achievements.
- Achievements come from the Instagram profile screenshot supplied by the user: 3rd place Finals Moroccan Championship 2026; 2nd place NPC Pro Qualifier Marrakech 2026; 3rd place The Réal Contest 2023, Junior.
- Contact and social links open the supplied Instagram profile. The WhatsApp continuation appears only after a valid coach number is configured and the visitor reviews their enquiry.
- After choosing a production domain, add absolute `og:image`, `og:url`, and canonical URLs in the page head.

Reference: https://anassmaqboul.fit/ for coaching-page structure; original visual design informed by the local portfolio and Domalign projects.
