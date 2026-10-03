# AgentDate v4 — premium agentic dating demo

AgentDate is a standalone product prototype for the 3-hour agentic-dating hiring challenge.

## Product thesis

Most dating products optimize the human's search loop: browse → like → match → chat. AgentDate keeps the familiar discovery language but moves the interesting work into an observable agent loop:

**Source → Agent model → Agent-to-agent date → Explainable ranking**

The redesign intentionally makes the autonomous layer visible instead of hiding it behind a single match percentage.

## Design research used for v4

### 1. Hinge / profile-first context

Hinge's current product direction puts more weight on detailed profile content and specific prompt/photo interactions rather than generic likes. That informed AgentDate's profile lab, visible interests and evidence layer.

Source: https://hinge.co/mission

### 2. Tinder / personalized recommendations

Tinder's current Most Compatible experience is a personalized recommendation inside Discovery. That informed the concept of an "Agent Pick" / current best fit rather than treating every candidate as visually identical.

Source: https://www.help.tinder.com/hc/en-us/articles/42908926408333-Most-Compatible

### 3. Bumble / reducing first-message friction

Bumble uses Opening Moves to reduce the friction of starting conversations. AgentDate adapts the principle by having agents produce a concrete opening question and follow-up instead of rendering an empty chat room.

Source: https://bumble.com/en/features/opening-moves/

### 4. Coffee Meets Bagel / curation and intentionality

CMB's product positioning emphasizes curated recommendations and intentional dating. The AgentDate ranking surface therefore explains why a candidate appears rather than presenting an endless undifferentiated grid.

Source: https://www.coffeemeetsbagel.com/

### 5. Feeld / explicit interests and privacy

Feeld treats interests/desires as meaningful profile inputs and pairs discovery with privacy controls. AgentDate turns interests into explicit match signals while keeping the supplied-source boundary visible.

Source: https://feeld.co/ask-feeld/how-to/what-are-interests-and-desires-on-feeld

### 6. Muzz / explicit compatibility criteria

Muzz exposes match-alignment / must-have criteria. This informed the score breakdown in AgentDate: shared interests, trait resonance, lifestyle synergy and date quality are shown as separate dimensions.

Source: https://muzz.com/us/en/help/muzz-101/how-do-i-change-my-filters-for-matches/

### 7. Modern visual direction / dark premium dating UI

Current Dribbble and Behance dating concepts repeatedly use profile-centric layouts, expressive gradients, rounded cards, match percentages, interest chips and clear navigation. AgentDate uses these patterns without copying any one brand.

References:
- https://dribbble.com/shots/26807065-AI-Dating-App-Modern-Matchmaking-Social-Connection-UI-UX-Des
- https://dribbble.com/shots/27218760-Social-Dating-App-UI-Match-Feed-Real-Time-Chat-Design
- https://www.behance.net/gallery/240477521/Modern-Dating-App-UI-Match-Chat-Connect-Experience

### 8. Product UI hierarchy / Linear

Linear's recent UI refresh specifically describes dimmer navigation, stronger hierarchy and clearer separation between navigation and the main work surface. AgentDate applies the same structural idea: quiet sidebar, stronger main canvas, consistent page heads and predictable action placement.

Sources:
- https://linear.app/changelog/2026-03-12-ui-refresh
- https://linear.app/now/behind-the-latest-design-refresh

### 9. Typography / Radix

Radix Themes recommends using a structured type scale where size, line height and letter spacing work together. AgentDate keeps small metadata deliberately small, uses Manrope for product UI, and reserves Instrument Serif for a narrow editorial accent rather than making every heading oversized.

Source: https://www.radix-ui.com/themes/docs/theme/typography

### 10. Ranking / leaderboard research

For the ranking screen, the useful patterns are dense, scannable ranked rows with avatars, numeric scores, in-row progress indicators and a stronger top result. The redesign follows the same information hierarchy seen in modern leaderboard patterns and LMArena-style benchmark tables, but uses relationship language instead of competitive language.

Sources:
- https://ui.trophy.so/docs/components/leaderboard-rankings
- https://www.shadcn.io/blocks/tables-leaderboard
- https://swipefile.design/ref/lmarena-leaderboard/
- https://docs.appian.com/suite/help/26.3/leaderboard-pattern.html

## What changed in v4

### Discover

- Smaller, better-balanced editorial headline instead of a full-viewport serif block.
- Quiet navigation sidebar with clear active state.
- Search + interest filters.
- 25-agent pool.
- Selected-agent feature card.
- Live compatibility radar.
- Product principles panel.
- Profile cards with abstract generative avatars instead of bare initials.

### Abstract Gen-Z profile avatars

The seeded people are real-profile demo records, but the UI now uses deterministic abstract editorial avatars rather than pretending an invented illustration is the person's real appearance. Variants include gradient portraits, glasses, headphones, earrings, stars, flowers and chains. The same avatar follows the person through Discover, Profile, Dates and Rankings.

### Agent profile

- Larger visual identity area.
- Source 01 / Source 02 cards.
- Interests, needs, hobbies and traits.
- Evidence layer vs inference distinction.
- Agent interpretation.
- Dedicated "Date this agent" action.

### Agent dates

- Server-generated pair selection.
- Multi-turn conversation.
- Visible reasoning trace.
- Shared interest and trait signals.
- Compatibility score.
- Concrete first-date plan.
- Date history.

### Rankings

The rankings view is intentionally redesigned as a product-grade table rather than a stack of generic cards:

- Current-agent context.
- Large Agent Pick result.
- Top-fit chips.
- Match methodology panel.
- Four dimension bars.
- Dense ranking table with rank, avatar, identity, why-it-fits signal, date-tested state and score.
- Tabular percentage alignment.
- Responsive mobile transformation.

This is the closest thing in the challenge to an "AI benchmark" surface: users can scan the list quickly, then inspect why the engine reached a result.

## Backend

`app.js` is the shared Express application. `server.js` runs it locally and `api/index.js` exports it for Vercel.

Endpoints:

- `GET /api/health`
- `GET /api/people`
- `POST /api/date`
- `POST /api/date/specific`
- `POST /api/rankings`
- `POST /api/analyze`

The date and ranking engines are computed from the current people pool. Demo history and added agents are kept in browser localStorage so the interaction survives refreshes.

## Source / scraping note

The analyzer accepts exactly two inputs: LinkedIn + Instagram. It attempts a direct public-page fetch and extracts page text/title without bypassing access controls. LinkedIn and Instagram can block server-side automation; if that happens, the app reports the limitation rather than pretending it read the page.

For a compliant production-grade browser extraction layer, connect an authorized provider such as Apify or Browserless. Never bypass CAPTCHA, authentication, robots, rate limits or other access controls.

The 25 seeded records are demo data. Verify every LinkedIn/Instagram pair before challenge submission.

## Run locally

```powershell
npm install
npm start
```

Open `http://localhost:3000`.

Development mode:

```powershell
npm run dev
```

## Deploy to Vercel

```powershell
npm install -g vercel
vercel
```

Or push the project to a public GitHub repository and import it into Vercel.

## 3-minute video flow

0:00–0:15 — Discover hero + 25-agent pool.

0:15–0:35 — Select a person → Agent profile → show two sources + needs/interests/traits/evidence.

0:35–1:25 — Agent dates → Run another date → show reasoning trace + four conversation turns + decision + date plan. Run it twice.

1:25–2:05 — Rankings → Recalculate → show Agent Pick + score dimensions + ranked table.

2:05–2:30 — Activity → paste LinkedIn + Instagram → Create agent.

2:30–2:50 — Open the new agent profile and show it entering the pool.

2:50–3:00 — Return to Agent dates and close on the live result.

## Submission copy

Overall explanation:
"AgentDate lets autonomous agents analyze people from LinkedIn + Instagram, date other agents using their interests and traits, then produce personalized compatibility rankings."

Technical scraping section:
"Vanilla HTML/CSS/JavaScript frontend with a Node/Express backend. The app accepts exactly two supplied public URLs, LinkedIn and Instagram, and attempts a direct public-page read. Extracted page text is normalized into structured interests and traits; a server-side agent-date engine then runs multi-turn compatibility reasoning and produces explainable rankings."
