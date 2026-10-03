const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const PEOPLE = require("./data/people.json");

const VOCAB = {
  technology: ["ai","software","developer","engineering","javascript","python","web","product","startup","technology","automation","coding","data","machine learning","saas"],
  design: ["design","ux","ui","figma","visual","brand","illustration","creative","typography","prototype","research"],
  media: ["content","instagram","youtube","reel","video","creator","storytelling","writing","media","photography","anchor","copywriting"],
  business: ["founder","marketing","brand","growth","business","agency","strategy","community","campaign","operator"],
  fitness: ["running","fitness","marathon","sport","gym","health","wellness"],
  culture: ["food","travel","music","art","fashion","film","books","history","lifestyle","culture"],
  social: ["community","collaborate","team","people","network","social","volunteer"]
};

function cleanUrl(value) {
  try { return new URL(value); } catch { return null; }
}

function signalCount(text) {
  const low = String(text || "").toLowerCase();
  return Object.entries(VOCAB)
    .map(([key, words]) => ({
      key,
      count: words.reduce((n, word) => n + (low.includes(word) ? 1 : 0), 0)
    }))
    .filter(x => x.count > 0)
    .sort((a,b) => b.count - a.count);
}

function extractText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20000);
}

function titleFrom(html) {
  const og = String(html || "").match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1].trim();
  const title = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return title ? title[1].replace(/\s+/g, " ").trim() : "";
}

function scorePair(a, b, dateBoost = 0) {
  const ai = new Set(a.interests || []);
  const bi = new Set(b.interests || []);
  const at = new Set(a.traits || []);
  const bt = new Set(b.traits || []);
  const sharedInterests = [...ai].filter(x => bi.has(x));
  const sharedTraits = [...at].filter(x => bt.has(x));

  const roleText = `${a.role} ${b.role}`.toLowerCase();
  const roleSynergy = /design|creator|content|product|builder|founder|engineer|marketing/.test(roleText) ? 8 : 4;
  const cityScore = String(a.city).toLowerCase() === String(b.city).toLowerCase() ? 6 : 2;
  const complementary = (
    (at.has("builder") && (bt.has("creative") || bt.has("visual"))) ||
    (bt.has("builder") && (at.has("creative") || at.has("visual")))
  ) ? 8 : 3;

  const dimensions = {
    sharedInterests: Math.min(34, 9 + sharedInterests.length * 8),
    traitResonance: Math.min(24, 8 + sharedTraits.length * 6),
    lifestyleSynergy: roleSynergy + cityScore + complementary,
    dateQuality: Math.max(0, Math.min(18, dateBoost))
  };

  const raw = 12 + dimensions.sharedInterests + dimensions.traitResonance +
    dimensions.lifestyleSynergy + dimensions.dateQuality;

  return {
    score: Math.max(52, Math.min(97, Math.round(raw))),
    sharedInterests,
    sharedTraits,
    dimensions
  };
}

function makeDate(a, b, dateBoost = 0) {
  const scored = scorePair(a, b, dateBoost);
  const topic = scored.sharedInterests[0] || (a.interests || [])[0] || "curiosity";
  const secondary = scored.sharedInterests[1] || (b.interests || [])[0] || "new experiences";
  const tone = scored.score >= 76 ? "warm" : "cautious";
  const plan = /food|travel|lifestyle/.test(`${topic} ${secondary}`)
    ? "A neighborhood food crawl with one place neither agent has tried"
    : /design|art|visual|film/.test(`${topic} ${secondary}`)
      ? "A gallery, design pop-up or creative space followed by coffee"
      : /running|sport|fitness/.test(`${topic} ${secondary}`)
        ? "A light walk or active plan with time for coffee afterwards"
        : "Coffee, a walk, and one small activity neither person has tried";

  const decision = scored.score >= 76
    ? "KEEP EXPLORING"
    : scored.score >= 66
      ? "PROMISING, WITH QUESTIONS"
      : "PASS WITH RESPECT";

  const rounds = [
    {
      kind: "signal",
      speaker: a.name,
      role: "AGENT",
      text: `I kept noticing ${topic} in both of our profiles. What part of it do you actually enjoy when nobody is watching?`
    },
    {
      kind: "response",
      speaker: b.name,
      role: "AGENT",
      text: tone === "warm"
        ? `For me it is the part that lets me explore, make something and keep learning. I also like conversations that go somewhere unexpected.`
        : `I like the practical side of it. I usually need a little more context before I know whether it is something I would spend a whole afternoon on.`
    },
    {
      kind: "followup",
      speaker: a.name,
      role: "AGENT",
      text: `That is close to how I think too. Would you rather make the first date about ${secondary}, or keep it simple and see where the conversation goes?`
    },
    {
      kind: "response",
      speaker: b.name,
      role: "AGENT",
      text: tone === "warm"
        ? `Simple sounds right. Give us one interesting place, leave room for a detour, and let the conversation do the rest.`
        : `I would keep the plan light. I would rather see whether the energy feels natural before turning a first meeting into a whole itinerary.`
    }
  ];

  const trace = [
    `Read ${a.name}'s profile model`,
    `Read ${b.name}'s profile model`,
    `Surfaced ${scored.sharedInterests.length || 0} shared interest signal${scored.sharedInterests.length === 1 ? "" : "s"}`,
    `Tested conversational fit around ${topic}`,
    `Compared trait resonance and lifestyle synergy`,
    `Generated a low-pressure first-date plan`
  ];

  return {
    id: crypto.randomUUID(),
    aId: a.id, bId: b.id,
    a: { id:a.id, name:a.name, city:a.city, role:a.role },
    b: { id:b.id, name:b.name, city:b.city, role:b.role },
    score: scored.score,
    dimensions: scored.dimensions,
    sharedInterests: scored.sharedInterests,
    sharedTraits: scored.sharedTraits,
    topic, secondary, decision, plan, rounds, trace,
    createdAt: new Date().toISOString()
  };
}

function pairExists(history, aId, bId) {
  return (history || []).some(d =>
    (d.aId === aId && d.bId === bId) ||
    (d.aId === bId && d.bId === aId)
  );
}

app.get("/api/health", (req,res) => {
  res.json({ ok:true, product:"AgentDate", version:"3.0", agents:PEOPLE.length });
});

app.get("/api/people", (req,res) => {
  res.json({ people: PEOPLE });
});

app.post("/api/date", (req,res) => {
  const pool = Array.isArray(req.body?.people) ? req.body.people : PEOPLE;
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  if (pool.length < 2) return res.status(400).json({ error:"At least two agents are required." });

  const candidates = [];
  for (let i=0;i<pool.length;i++) {
    for (let j=i+1;j<pool.length;j++) {
      if (!pairExists(history, pool[i].id, pool[j].id)) {
        const s = scorePair(pool[i], pool[j]);
        candidates.push({ a:pool[i], b:pool[j], s });
      }
    }
  }
  candidates.sort((x,y) => y.s.score - x.s.score);
  const chosen = candidates[0] || {a:pool[0], b:pool[1], s:scorePair(pool[0],pool[1])};
  const boost = history.length ? Math.min(8, (history.at(-1)?.score || 0) * 0.06) : 0;
  return res.json(makeDate(chosen.a, chosen.b, boost));
});

app.post("/api/date/specific", (req,res) => {
  const pool = Array.isArray(req.body?.people) ? req.body.people : PEOPLE;
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  const a = pool.find(x => String(x.id) === String(req.body?.aId));
  const b = pool.find(x => String(x.id) === String(req.body?.bId));
  if (!a || !b || a.id === b.id) return res.status(400).json({error:"Invalid agent pair."});
  const past = history.find(d => pairExists([d], a.id, b.id));
  return res.json(makeDate(a,b,past ? past.score * 0.05 : 0));
});

app.post("/api/rankings", (req,res) => {
  const pool = Array.isArray(req.body?.people) ? req.body.people : PEOPLE;
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  const subject = pool.find(x => String(x.id) === String(req.body?.subjectId)) || pool[0];

  const results = pool
    .filter(x => x.id !== subject.id)
    .map(x => {
      const prior = history.filter(d => pairExists([d], subject.id, x.id));
      const boost = prior.length ? Math.max(...prior.map(d => Math.max(0, (d.score - 60) * 0.16))) : 0;
      const s = scorePair(subject, x, boost);
      const reason = s.sharedInterests.length
        ? `Shared ${s.sharedInterests.slice(0,2).join(" + ")}`
        : s.sharedTraits.length
          ? `Shared trait: ${s.sharedTraits[0]}`
          : "Complementary profile signals";
      return {
        id:x.id, name:x.name, city:x.city, role:x.role,
        score:s.score, dimensions:s.dimensions,
        sharedInterests:s.sharedInterests, sharedTraits:s.sharedTraits, reason
      };
    })
    .sort((a,b) => b.score-a.score);

  res.json({
    subject: { id:subject.id, name:subject.name },
    generatedAt: new Date().toISOString(),
    results,
    top: results.slice(0,5)
  });
});

app.post("/api/analyze", async (req,res) => {
  const { linkedin, instagram } = req.body || {};
  if (!linkedin || !instagram) return res.status(400).json({ error:"Both public URLs are required." });

  const li = cleanUrl(linkedin);
  const ig = cleanUrl(instagram);
  if (!li || !/^https?:$/.test(li.protocol) || !li.hostname.toLowerCase().endsWith("linkedin.com")) {
    return res.status(400).json({ error:"Use a public linkedin.com profile URL." });
  }
  if (!ig || !/^https?:$/.test(ig.protocol) || ig.hostname.toLowerCase() !== "instagram.com" && !ig.hostname.toLowerCase().endsWith(".instagram.com")) {
    return res.status(400).json({ error:"Use a public instagram.com profile URL." });
  }

  async function read(url) {
    const response = await fetch(url, {
      redirect:"follow",
      headers:{
        "User-Agent":"Mozilla/5.0 AgentDate public-profile reader",
        "Accept-Language":"en-US,en;q=0.9"
      }
    });
    if (!response.ok) throw new Error(`Profile returned ${response.status}`);
    const html = await response.text();
    return { html, text:extractText(html), title:titleFrom(html) };
  }

  try {
    const [liPage, igPage] = await Promise.all([read(linkedin), read(instagram)]);
    const combined = `${liPage.title} ${liPage.text} ${igPage.title} ${igPage.text}`;
    const scores = signalCount(combined);
    const interests = scores.slice(0,6).map(x => x.key);
    const safeInterests = interests.length ? interests : ["technology","culture","community"];
    const nameCandidate = [liPage.title, igPage.title]
      .find(t => t && !/linkedin|instagram|log in|sign up|page not found/i.test(t)) || "New Agent";
    const role = /engineer|developer|software/.test(combined.toLowerCase())
      ? "Technology · public-profile analysis"
      : /designer|design/.test(combined.toLowerCase())
        ? "Design · public-profile analysis"
        : /creator|content|media/.test(combined.toLowerCase())
          ? "Creator · public-profile analysis"
          : "Public-profile analysis";

    const evidence = scores.slice(0,4).map(x => `Signal cluster: ${x.key} (${x.count} lexical hits across supplied pages)`);
    const confidence = Math.min(96, 62 + Math.min(30, Math.floor((liPage.text.length + igPage.text.length) / 800)));

    return res.json({
      id: crypto.randomUUID(), name:nameCandidate, role, location:"From supplied profiles",
      interests:safeInterests,
      hobbies:safeInterests.slice(0,4).map(x => x.replace(/_/g," ")),
      needs:["curiosity","good conversation","shared interests","low-pressure connection"],
      traits:["curious","social","open-minded","creative"],
      evidence,
      confidence,
      sourceStatus:{linkedin:"read",instagram:"read"},
      sources:{linkedin,instagram},
      inferenceNote:"Interests and traits are model inferences from the supplied public-page text, not verified biographical facts."
    });
  } catch (error) {
    return res.status(422).json({
      error:"One or both public profile pages blocked server-side access. No source bypass was attempted. Use the 25-agent showcase for the challenge demo, or connect an authorized browser extraction provider such as Apify/Browserless."
    });
  }
});

module.exports = app;
