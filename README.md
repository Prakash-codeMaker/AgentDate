✦ AgentDate

Agents date before people do.

AgentDate is an agentic dating product concept where a person is represented by an agent built from exactly two public profile sources — LinkedIn + Instagram. The agent models interests, needs and traits, meets other agents, runs a multi-turn date, and produces an explainable compatibility ranking.

<p align="center">
  <a href="https://github.com/Prakash-codeMaker/AgentDate">
    <img src="https://img.shields.io/badge/GitHub-Public-111111?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <a href="https://YOUR-VERCEL-DOMAIN.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Vercel-111111?style=for-the-badge&logo=vercel" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Agents-25-FF4E91?style=for-the-badge" alt="25 Agents">
  <img src="https://img.shields.io/badge/Sources-LinkedIn%20%2B%20Instagram-9B72FF?style=for-the-badge" alt="Two Sources">
</p>

✨ What is AgentDate?

Most dating products ask people to browse profiles, decide who looks compatible, start conversations, and filter through hundreds of candidates.

AgentDate explores a different interaction model:

          Public profile sources
        ┌─────────────┬─────────────┐
        │             │             │
     LinkedIn     Instagram      (only 2)
        │             │
        └───────┬─────┘
                ↓
        ┌─────────────────┐
        │   Agent Model   │
        │                 │
        │ interests       │
        │ needs           │
        │ hobbies        │
        │ traits          │
        └────────┬────────┘
                 ↓
        ┌─────────────────┐
        │   Agent Date    │
        │                 │
        │ open → respond  │
        │ follow-up → react│
        │ reason → decide │
        └────────┬────────┘
                 ↓
        ┌─────────────────┐
        │ Explainable Fit │
        │                 │
        │ score           │
        │ shared signals  │
        │ date quality    │
        └─────────────────┘

The product's central idea is simple:

Let agents do the first round of understanding and compatibility testing, then show the human why the result happened.

🎥 Product Preview



Core product surfaces

Surface

What it does

Discover

Browse the 25-agent pool, search by person/city/role/interests, and inspect the selected agent's live compatibility context.

Agent Profile

Shows interests, needs, hobbies, traits, source links, inference notes and evidence boundaries.

Agent Dates

Runs a fresh agent-to-agent pairing and displays the multi-turn conversation, reasoning trace, decision and suggested first date.

Rankings

Recalculates compatibility from the current pool and date history, with visible reasons behind each result.

Activity

Shows date history and provides the two-source LinkedIn + Instagram ingestion flow for adding another agent.

🧠 How It Works

AgentDate uses four stages:

01 — READ

The application accepts exactly two URLs:

LinkedIn
Instagram

For seeded challenge profiles, these two links are displayed as the explicit source boundary.

For a newly submitted profile, the backend attempts a direct public-page read using Node.js fetch. It normalizes the returned HTML into text and extracts broad signal clusters.

No login, CAPTCHA bypass, private profile access, or hidden profile source is used.

02 — MODEL

The source material is converted into a structured agent representation:

{
  "interests": ["design", "media", "business"],
  "needs": [
    "curiosity",
    "good conversation",
    "shared interests",
    "low-pressure connection"
  ],
  "traits": [
    "curious",
    "social",
    "creative",
    "open-minded"
  ]
}

The interface intentionally distinguishes source evidence from model inference.

An inferred trait is shown as an agent signal, not as a verified fact about the person.

03 — DATE

Two agents are paired by the date engine.

The agent-date flow includes:

1. Surface a shared signal
2. Ask an opening question
3. Respond using the other agent's profile
4. Ask a follow-up
5. React to the answer
6. Evaluate conversational fit
7. Propose a first-date plan

The UI exposes a small reasoning trace so the autonomous loop is visible rather than hidden behind a single score.

04 — RANK

The ranking engine evaluates each candidate using multiple dimensions:

Shared interests
Trait resonance
Lifestyle / role synergy
Date quality / prior interaction

The final result is shown as:

Compatibility score
+
Why it fits
+
Shared signals
+
Recent interaction context

💎 Why the UI is Designed This Way

AgentDate takes interaction inspiration from modern dating products without copying any individual brand.

The experience deliberately combines:

Dating-product patterns

visual profiles

interest chips

curated discovery

low-friction conversation starters

compatibility context

with:

AI-product patterns

source boundaries

explicit reasoning traces

explainable scores

activity history

model-vs-evidence separation

The goal is for the product to feel like:

a premium consumer dating app on the surface, with an agentic reasoning system underneath.

🚀 Key Features

Profile-first discovery

People are not represented only as names and percentages.

Each card contains:

visual identity

name

role

city

interests

source count

agent status

Clicking a profile opens a deeper profile model.

Two-source boundary

Every seeded person exposes:

Source 01 → LinkedIn
Source 02 → Instagram

The system is intentionally source-limited.

Agent profile model

The profile lab shows:

interests

needs

hobbies

traits

evidence

inference notes

source links

Dynamic agent dating

Run another date calls the backend date engine.

It selects a new pair from the current pool and generates a new multi-turn interaction rather than replaying a fixed conversation.

Explainable ranking

Rankings are calculated against the current pool and include reasons such as:

Shared product design + creative
Shared technology
Complementary profile signals

Persistent demo state

The browser stores:

date history

selected agent

custom-agent state

current view

in localStorage, so a refreshed demo can continue where it left off.

🏗️ Architecture

                              ┌─────────────────────┐
                              │      Browser UI      │
                              │ HTML / CSS / JS      │
                              └──────────┬──────────┘
                                         │
             ┌───────────────────────────┼───────────────────────────┐
             │                           │                           │
             ↓                           ↓                           ↓
       /api/people                 /api/date                  /api/rankings
             │                           │                           │
             └───────────────────────────┼───────────────────────────┘
                                         ↓
                              ┌─────────────────────┐
                              │   Express 5 app     │
                              │       app.js        │
                              └──────────┬──────────┘
                                         │
                              ┌──────────┴──────────┐
                              ↓                     ↓
                       people.json             date engine
                              │                     │
                              └──────────┬──────────┘
                                         ↓
                                compatibility engine

New profile:
LinkedIn + Instagram
        ↓
   /api/analyze
        ↓
 public-page text normalization
        ↓
 signal extraction
        ↓
 structured agent profile

Repository structure

AgentDate/
├── app.js                  # Shared Express application
├── server.js               # Local entry point
├── api/
│   └── index.js            # Vercel serverless entry point
├── data/
│   └── people.json         # 25 seeded challenge profiles
├── public/
│   ├── index.html          # Application shell
│   ├── styles.css          # Product styling
│   ├── app.js              # Client-side product logic
│   └── people.js           # Browser-side seeded data
├── docs/
│   └── screenshots/
│       └── agentdate-ui.png
├── package.json
├── vercel.json
├── .env.example
└── README.md

🧰 Tech Stack

Frontend

HTML5

CSS3

Vanilla JavaScript

Responsive CSS

Google Fonts

Local browser persistence with localStorage

Backend

Node.js

Express 5

CORS

Native fetch

JSON APIs

Deployment

Vercel-compatible serverless entry point

vercel.json routing

Profile ingestion

The current challenge build uses:

Node.js native fetch
        ↓
public LinkedIn / Instagram URL
        ↓
HTML response
        ↓
script/style removal
        ↓
plain-text normalization
        ↓
keyword/signal extraction

No paid API is required by the seeded demo.

📡 API

GET /api/health

Returns service status.

Example:

{
  "ok": true,
  "product": "AgentDate",
  "version": "3.0",
  "agents": 25
}

GET /api/people

Returns the seeded agent pool.

POST /api/date

Runs the next available agent pairing.

{
  "people": [],
  "history": []
}

Returns:

{
  "a": {},
  "b": {},
  "score": 88,
  "dimensions": {},
  "rounds": [],
  "decision": "KEEP EXPLORING",
  "plan": "..."
}

POST /api/date/specific

Runs a chosen pair.

{
  "aId": 1,
  "bId": 7,
  "people": [],
  "history": []
}

POST /api/rankings

Generates compatibility results for one selected agent.

{
  "subjectId": 1,
  "people": [],
  "history": []
}

POST /api/analyze

Accepts exactly:

{
  "linkedin": "https://linkedin.com/in/...",
  "instagram": "https://instagram.com/..."
}

The endpoint validates the domains and attempts a public HTTP read of both pages.

💻 Local Development

Requirements

Node.js 20+

npm

Install

npm install

Run

npm start

Open:

http://localhost:3000

Development mode

npm run dev

☁️ Deploy to Vercel

From the project directory:

npm install
npm install -g vercel
vercel

Or:

Push the repository to a public GitHub repository.

Import the repository into Vercel.

Use the project root as the deployment directory.

Deploy with the included vercel.json.

⚠️ Public Profile Ingestion Limitations

LinkedIn and Instagram can block automated server-side HTTP requests.

When that happens, AgentDate does not attempt to bypass:

authentication

CAPTCHA

robots/access controls

rate limits

anti-bot protections

private profile restrictions

Instead, /api/analyze returns an explicit error.

For a production deployment, the compliant next step would be an authorized browser extraction layer such as Apify or Browserless, subject to the provider's terms and the sites' access policies.

Important

The 25 seeded profiles are challenge/demo data.

Before submitting the hiring challenge, verify that every displayed LinkedIn + Instagram pair actually belongs to the corresponding public profile.

🎬 3-Minute Challenge Demo

Recommended recording order:

00:00  Discover / 25 agents
00:15  Open Agent Profile
00:35  Show needs + interests + traits + sources
00:55  Open Agent Dates
01:00  Run another date
01:20  Show conversation + reasoning trace
01:35  Run another date
01:45  Open Rankings
02:00  Recalculate rankings
02:15  Activity / two-source ingestion
02:30  Show new agent profile
02:45  Read → Model → Date → Rank
02:55  Final agent-date result
03:00  End

Suggested closing line

“AgentDate lets agents do the first round of understanding, conversation and compatibility—then shows the human why.”

📝 Challenge Submission Copy

Overall explanation

AgentDate turns LinkedIn + Instagram into autonomous dating agents that analyze profiles, date each other, and generate explainable compatibility rankings.

Technical section

Node.js + Express 5 backend with native fetch reads only the supplied public LinkedIn and Instagram URLs. HTML is normalized to text, then profile signals are extracted into interests and traits. Those signals power the agent-to-agent date engine and explainable ranking engine. No login, CAPTCHA bypass, or hidden third-party profile sources are used.

🔐 Trust & Product Principles

AgentDate is designed around a few explicit principles:

Source transparency
Only the two supplied profile sources are presented as evidence for a seeded agent.

Inference transparency
Model-generated interests and traits are separated from source evidence.

No access-control bypass
The ingestion layer does not attempt to circumvent access restrictions.

Human control
The system can recommend and simulate a date; it should not take real-world actions on behalf of a person without human approval.

🛣️ Future Production Roadmap

The challenge build intentionally stays small and reproducible. A production system could add:

authorized browser extraction

LLM-backed profile summarization

richer preference modeling

explicit must-have / deal-breaker controls

user-approved date actions

real feedback loops after dates

identity/age verification

abuse and safety systems

database-backed profiles and sessions

job queues for large agent populations

observability for agent traces

A/B testing for matchmaking models

📚 Design Research

The product direction was informed by current dating-product interaction patterns:

Hinge — detailed profiles, prompts and conversation starters

Tinder — personalized compatibility/recommendation systems

Bumble — conversation-opening mechanics

Coffee Meets Bagel — curated/intentional discovery

Feeld — explicit interests/desires and privacy-oriented controls

Muzz — explicit matching requirements and compatibility alignment

AgentDate adapts these patterns into a different interaction model: agents date before people do.

🤝 Contributing

Pull requests and improvements are welcome.

For substantial changes:

1. Fork the repository
2. Create a feature branch
3. Make the change
4. Test locally
5. Open a pull request

📄 License

Add the license required by your challenge or repository policy before publishing.

<p align="center">

AgentDate ✦

Agents date before people do.

</p>
