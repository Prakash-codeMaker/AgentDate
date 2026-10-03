(() => {
  const VALID_VIEWS = new Set(["discover","lab","dates","rankings","activity"]);

  function readView() {
    const saved = localStorage.getItem("agentdate.view") || "discover";
    if (saved === "profiles") return "discover";
    if (saved === "system") return "activity";
    return VALID_VIEWS.has(saved) ? saved : "discover";
  }

  const state = {
    people: [],
    history: JSON.parse(localStorage.getItem("agentdate.history") || "[]"),
    selectedId: localStorage.getItem("agentdate.selected") || "1",
    view: readView(),
    query: "",
    filter: "all",
    rankCache: null,
    currentDate: null,
    rankingRuns: Number(localStorage.getItem("agentdate.rankingRuns") || 0)
  };

  let avatarUid = 0;

  const palettes = [
    ["#4d1b40","#7a3f70"],["#2d2252","#5645a4"],["#193d3b","#3c756e"],
    ["#4c221d","#875048"],["#3d2750","#7351a1"],["#4a2030","#8d4a67"],
    ["#1b3548","#48728e"],["#4b321d","#8a6940"],["#342249","#5a3da0"],["#203b34","#4a7665"]
  ];

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  const initials = n => String(n).split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase();
  const palette = p => {
    const key = String(p?.id ?? 1);
    let h = 0; for (let i=0;i<key.length;i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return palettes[h % palettes.length];
  };
  const shared = (a,b,key) => {
    const A = new Set(a[key] || []), B = new Set(b[key] || []);
    return [...A].filter(x=>B.has(x));
  };

  const save = () => {
    localStorage.setItem("agentdate.history", JSON.stringify(state.history.slice(-80)));
    localStorage.setItem("agentdate.selected", String(state.selectedId));
    localStorage.setItem("agentdate.view", state.view);
    localStorage.setItem("agentdate.rankingRuns", String(state.rankingRuns));
  };

  const current = () => state.people.find(p => String(p.id) === String(state.selectedId)) || state.people[0];

  function svgAvatar(p, cls="avatar-art") {
    const id = String(p?.id ?? 1).replace(/\W/g, "").slice(0,14) || "1";
    const key = String(p?.id ?? 1);
    let n = 0; for (let i=0;i<key.length;i++) n = (n * 33 + key.charCodeAt(i)) >>> 0;
    const [c1,c2] = palette(p);
    const variants = [
      {skin:"#f1bf9a",hair:"#231b25",accent:"#ff6c9f",shirt:"#ffd6e5",access:"none"},
      {skin:"#c9875b",hair:"#17131c",accent:"#8e77ff",shirt:"#d9d6ff",access:"glasses"},
      {skin:"#e6b07f",hair:"#5d2b22",accent:"#5ee0c5",shirt:"#c8f5ea",access:"earring"},
      {skin:"#9d623f",hair:"#22151b",accent:"#f4c86c",shirt:"#ffe8ad",access:"star"},
      {skin:"#f2c9a4",hair:"#2d273b",accent:"#71a4ff",shirt:"#d6e4ff",access:"headphones"},
      {skin:"#ba7650",hair:"#142124",accent:"#fa6eae",shirt:"#ffd4e7",access:"flower"},
      {skin:"#e8b888",hair:"#352127",accent:"#be87ff",shirt:"#eadcff",access:"chain"},
      {skin:"#8b5237",hair:"#1a141b",accent:"#6fe2c8",shirt:"#c8f6ea",access:"glasses"}
    ][n % 8];
    const g = `avGrad${id}_${++avatarUid}`;
    let accessory = "";
    if (variants.access === "glasses") accessory = `<g fill="none" stroke="#19161d" stroke-width="3"><rect x="57" y="66" width="28" height="16" rx="6"/><rect x="95" y="66" width="28" height="16" rx="6"/><path d="M85 73h10"/></g>`;
    if (variants.access === "earring") accessory = `<circle cx="53" cy="88" r="4" fill="${variants.accent}"/><circle cx="127" cy="88" r="4" fill="${variants.accent}"/>`;
    if (variants.access === "star") accessory = `<path d="M133 44l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="${variants.accent}"/>`;
    if (variants.access === "headphones") accessory = `<path d="M47 74a41 41 0 0 1 86 0" fill="none" stroke="${variants.accent}" stroke-width="7" stroke-linecap="round"/><rect x="43" y="71" width="10" height="23" rx="5" fill="${variants.accent}"/><rect x="127" y="71" width="10" height="23" rx="5" fill="${variants.accent}"/>`;
    if (variants.access === "flower") accessory = `<g fill="${variants.accent}"><circle cx="132" cy="45" r="7"/><circle cx="142" cy="45" r="7"/><circle cx="137" cy="35" r="7"/><circle cx="137" cy="55" r="7"/><circle cx="137" cy="45" r="4" fill="#fff2f8"/></g>`;
    if (variants.access === "chain") accessory = `<path d="M66 108c14 15 41 15 55 0" fill="none" stroke="${variants.accent}" stroke-width="3" stroke-linecap="round"/><circle cx="93.5" cy="118" r="4" fill="${variants.accent}"/>`;

    return `<div class="${cls}"><svg viewBox="0 0 180 180" role="img" aria-label="Abstract profile avatar for ${esc(p?.name || "agent")}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <rect width="180" height="180" rx="34" fill="url(#${g})"/>
      <circle cx="142" cy="32" r="30" fill="#fff" opacity=".05"/><circle cx="30" cy="148" r="47" fill="#fff" opacity=".04"/>
      <ellipse cx="90" cy="162" rx="55" ry="18" fill="#000" opacity=".16"/>
      <path d="M38 164c7-32 26-49 52-49s45 17 52 49" fill="${variants.shirt}" opacity=".96"/>
      <path d="M61 103c6 11 18 17 29 17s23-6 29-17" fill="${variants.accent}" opacity=".28"/>
      <circle cx="90" cy="78" r="34" fill="${variants.skin}"/>
      <path d="M56 76c1-31 17-46 35-46s38 12 38 47c-11-8-25-13-38-12-13 1-24 4-35 11z" fill="${variants.hair}"/>
      <path d="M71 76c4-4 9-5 14-5M95 71c5 0 10 2 14 5" stroke="#5a3b35" stroke-width="3" stroke-linecap="round" opacity=".65"/>
      <circle cx="77" cy="80" r="2.6" fill="#1b171d"/><circle cx="103" cy="80" r="2.6" fill="#1b171d"/>
      <path d="M86 94c4 3 8 3 12 0" fill="none" stroke="#a2645d" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
      ${accessory}
      <circle cx="25" cy="28" r="4" fill="${variants.accent}"/><circle cx="157" cy="139" r="3" fill="#fff" opacity=".65"/>
    </svg></div>`;
  }

  async function api(url, options={}) {
    const r = await fetch(url, {headers:{"Content-Type":"application/json"}, ...options});
    const d = await r.json().catch(()=>({}));
    if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
    return d;
  }

  function toast(message) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = message; t.classList.add("show");
    clearTimeout(window.__toast); window.__toast = setTimeout(()=>t.classList.remove("show"),3200);
  }

  function setView(name) {
    if (!VALID_VIEWS.has(name)) name = "discover";
    state.view = name; save();
    $$(".view").forEach(v=>v.classList.toggle("active", v.id === `view-${name}`));
    $$(".navbtn").forEach(b=>b.classList.toggle("active", b.dataset.view === name));
    if (name === "discover") renderDiscover();
    if (name === "lab") renderLab();
    if (name === "dates") renderDates();
    if (name === "rankings") renderRankings();
    if (name === "activity") renderActivity();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function updateTop() {
    const count = $("#agentCount"), pairs = $("#pairCount"), hist = $("#historyCount");
    if (count) count.textContent = `${state.people.length} agents`;
    if (pairs) pairs.textContent = `${Math.floor(state.people.length*(state.people.length-1)/2)} pairings`;
    if (hist) hist.textContent = `${state.history.length} date${state.history.length===1?"":"s"}`;
  }

  function renderNav() { $$(".navbtn").forEach(btn=>btn.onclick=()=>setView(btn.dataset.view)); }

  function card(p) {
    const [a,b] = palette(p);
    return `<button class="p-card ${String(state.selectedId)===String(p.id)?"selected":""}" data-id="${esc(p.id)}" onclick="window.AgentDate.select(${JSON.stringify(p.id)})">
      <div class="p-art" style="--a:${a};--b:${b}"><div class="p-badge">${p.verifiedSources||2} PUBLIC SOURCES</div>${svgAvatar(p,"card-avatar")}</div>
      <div class="p-body"><h3>${esc(p.name)}</h3><div class="p-role">${esc(p.role)} · ${esc(p.city)}</div>
        <div class="chips">${(p.interests||[]).slice(0,3).map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div>
        <div class="p-foot"><span>Agent modeled</span><strong>View profile →</strong></div>
      </div></button>`;
  }

  function discoverFiltered() {
    const q = state.query.toLowerCase();
    return state.people.filter(p=>{
      const text = [p.name,p.city,p.role,...(p.interests||[]),...(p.traits||[])].join(" ").toLowerCase();
      const qok = !q || text.includes(q);
      const fok = state.filter === "all" || (p.interests||[]).some(x=>x.toLowerCase().includes(state.filter));
      return qok && fok;
    });
  }

  async function renderDiscover() {
    const p = current(); if (!p) return;
    const [a,b] = palette(p);
    const last = state.currentDate;
    const comparison = last ? `${last.a.name} × ${last.b.name}` : "Agent engine · awaiting first date";
    const score = last ? `${last.score}%` : "—";
    const mount = $("#discover"); if (!mount) throw new Error("Discover mount missing");
    mount.innerHTML = `
      <div class="hero">
        <div class="hero-copy">
          <div class="kicker">AGENTDATE / DISCOVERY</div>
          <h1>Your agent doesn't <em>swipe.</em><br><span>It gets to know the room.</span></h1>
          <p>Two public sources become a structured agent. That agent meets other agents, tests the connection through conversation, and returns an explainable recommendation instead of another endless feed.</p>
          <div class="hero-cta"><button class="btn" onclick="window.AgentDate.runDate()">Run an agent date ↗</button><button class="btn ghost" onclick="window.AgentDate.go('lab')">Inspect ${esc(p.name)}'s agent</button></div>
          <div class="hero-stats"><div><strong>${state.people.length}</strong>agents in pool</div><div><strong>${Math.floor(state.people.length*(state.people.length-1)/2)}</strong>possible pairings</div><div><strong>${state.history.length}</strong>completed dates</div><div><strong>2</strong>source boundary</div></div>
        </div>
        <div class="hero-card">
          <div class="mini-top"><div><div class="tiny-label">Agent date / live reasoning</div><div class="mini-title">${esc(comparison)}</div></div><div class="live">ENGINE READY</div></div>
          <div class="hero-pair">
            <div class="vcard"><div class="vart">${svgAvatar(p,"hero-avatar")}</div><div class="vbody"><h3>${esc(p.name)}</h3><p>${esc(p.role)}</p><div class="vscore"><strong>${score}</strong><span>${last?"last date":"ready"}</span></div></div></div>
            <div class="vcard ai"><div class="vart">${svgAvatar({id:999, name:"Agent engine"},"hero-avatar")}</div><div class="vbody"><h3>Agent engine</h3><p>read · date · rank</p><div class="vscore"><strong>${state.history.length||0}</strong><span>dates run</span></div></div></div>
          </div>
          <div class="quote">A good match is not just a number. The system should show the evidence, the conversation and the reason the agents decided to keep exploring.</div>
        </div>
      </div>
      <div class="toolstrip"><div class="search"><input id="peopleSearch" class="input" placeholder="Search people, cities, roles or interests…" value="${esc(state.query)}"></div>
        ${["all","technology","design","media","business","culture","fitness"].map(f=>`<button class="filter ${state.filter===f?"active":""}" data-filter="${f}">${f==="all"?"All people":f}</button>`).join("")}
      </div>
      <div class="discover-feature">
        <div class="feature-card"><div class="feature-art" style="background:linear-gradient(135deg,${a},${b})"><div class="status">ABSTRACT AVATAR · SELECTED AGENT · ${p.verifiedSources||2} SOURCES</div>${svgAvatar(p,"feature-avatar")}</div>
          <div class="feature-body"><h3>${esc(p.name)}</h3><div class="role">${esc(p.role)} · ${esc(p.city)}</div><div class="chips">${(p.interests||[]).slice(0,4).map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div>
            <div class="feature-links"><a class="link" target="_blank" rel="noopener" href="${esc(p.linkedin)}">LinkedIn ↗</a><a class="link" target="_blank" rel="noopener" href="${esc(p.instagram)}">Instagram ↗</a><button class="link" onclick="window.AgentDate.go('lab')">Agent analysis</button></div>
          </div></div>
        <div class="radar"><div class="radar-main"><div class="radar-head"><div><h3>Compatibility radar</h3><p>${last?`Latest match: ${esc(last.a.name)} × ${esc(last.b.name)}`:"Run a date to populate live match dimensions."}</p></div><div class="radar-score">${last?last.score:"—"}<small>${last?"FIT":"READY"}</small></div></div>
          <div class="bars">${["sharedInterests","traitResonance","lifestyleSynergy","dateQuality"].map((k,i)=>{const labels=["Shared interests","Trait resonance","Lifestyle synergy","Date quality"],max=[34,24,28,18][i],val=last?.dimensions?.[k]||0;return `<div class="barrow"><span>${labels[i]}</span><div class="bar"><i style="width:${Math.min(100,Math.round((val/max)*100))}%"></i></div><b>${val}/${max}</b></div>`}).join("")}</div>
          <div class="radar-note">The engine makes the fit legible: shared interests, trait resonance, lifestyle synergy and the observed quality of the agent conversation can all contribute.</div></div>
          <div class="radar-side"><h3>Product principles</h3><p>Borrow the best interaction patterns from modern dating. Make the autonomous layer the differentiator.</p>
            <div class="signal"><div class="sig-dot"></div><div><b>Context before decision</b><span>Profile depth comes before a match judgment.</span></div></div>
            <div class="signal"><div class="sig-dot"></div><div><b>Conversation as evidence</b><span>Agents actually test a shared signal.</span></div></div>
            <div class="signal"><div class="sig-dot"></div><div><b>Explainable ranking</b><span>See what moved the score.</span></div></div>
            <div class="signal"><div class="sig-dot"></div><div><b>Source-aware</b><span>Observed evidence and inference stay distinct.</span></div></div>
          </div></div>
      </div>
      <div class="panel" style="margin-top:13px"><div class="panel-title"><div><h2>25 profile agents</h2><p>Click any card to inspect the agent model, sources and matching context.</p></div><div class="count">${discoverFiltered().length} shown</div></div><div class="people-grid" id="peopleGrid"></div></div>`;
    $("#peopleGrid").innerHTML = discoverFiltered().map(card).join("") || `<div class="empty">No profiles match that search.</div>`;
    $("#peopleSearch").oninput=e=>{state.query=e.target.value;renderDiscover()};
    $$(".filter").forEach(x=>x.onclick=()=>{state.filter=x.dataset.filter;renderDiscover()});
  }

  function renderLab() {
    const p=current(); if(!p) return;
    const [a,b]=palette(p);
    const mount=$("#lab"); if(!mount) throw new Error("Profile lab mount missing");
    mount.innerHTML=`
      <div class="page-head"><div><h1>Agent profile lab</h1><p>Identity context, source evidence and inferred match signals in one clean product surface.</p></div><div class="page-actions"><button class="smallbtn" onclick="window.AgentDate.selectRandom()">Inspect another</button><button class="smallbtn primary" onclick="window.AgentDate.runSpecificForSelected()">Date this agent ↗</button></div></div>
      <div class="lab-grid"><div class="profile-panel"><div class="profile-art-lg" style="background:linear-gradient(135deg,${a},${b})"><div class="status">ABSTRACT AVATAR · AGENT READY · ${p.verifiedSources||2} SOURCES</div>${svgAvatar(p,"profile-avatar")}</div>
        <div class="profile-meta"><h2>${esc(p.name)}</h2><div class="role">${esc(p.role)} · ${esc(p.city)}</div><div class="chips">${(p.interests||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div>
          <div class="source-list"><div class="source"><small>Source 01 · LinkedIn</small><a href="${esc(p.linkedin)}" target="_blank" rel="noopener">${esc(p.linkedin)}</a></div><div class="source"><small>Source 02 · Instagram</small><a href="${esc(p.instagram)}" target="_blank" rel="noopener">${esc(p.instagram)}</a></div></div></div></div>
        <div class="insight-panel"><div class="insight-head"><div><h2>Agent readout</h2><p>Structured signals used by the date and ranking engines.</p></div><div class="confidence">${p.custom?"INGESTED":"SEEDED"} · 2 SOURCES</div></div>
          <div class="insight-grid"><div class="ibox"><label>Needs</label><strong>Curiosity · good conversation · shared interests · low-pressure connection</strong></div><div class="ibox"><label>Hobbies / anchors</label><strong>${esc((p.interests||[]).slice(0,4).join(" · "))}</strong></div><div class="ibox"><label>Traits</label><strong>${esc((p.traits||[]).slice(0,4).join(" · "))}</strong></div></div>
          <div class="detail"><h4>Agent interpretation</h4><p>${esc(p.name)}'s agent uses these signals to select a conversation anchor, ask a follow-up, test whether the connection feels natural and propose a first date. It is a decision support layer, not a claim about the person's private life.</p></div>
          <div class="detail"><h4>Evidence layer</h4><div class="evidence">${p.custom&&p.evidence?p.evidence.map(e=>`<div class="e-row"><span class="e-dot"></span><span>${esc(e)}</span></div>`).join(""):`<div class="e-row"><span class="e-dot"></span><span>LinkedIn and Instagram are the only source links shown for this seeded agent.</span></div><div class="e-row"><span class="e-dot"></span><span>Interest and trait labels are reproducible demo signals used by the agent engine.</span></div>`}</div></div>
          <div class="detail"><h4>Source boundary</h4><p>Observed source text is separate from the model's inferred signals. The interface intentionally shows both rather than presenting inference as verification.</p></div>
        </div></div>`;
  }

  function renderDates() {
    const mount=$("#dates"); if(!mount) throw new Error("Dates mount missing");
    const d=state.currentDate;
    if(!d){ mount.innerHTML=`<div class="empty">No agent date yet. Start one from Discover or click the button below.</div><div class="page-actions" style="margin-top:10px"><button class="btn" onclick="window.AgentDate.runDate()">Run first agent date ↗</button></div>`; return; }
    mount.innerHTML=`
      <div class="page-head"><div><h1>Agent date room</h1><p>Two agents meet, probe a shared signal, react to the answer and turn the result into a recommendation.</p></div><div class="page-actions"><button class="smallbtn primary" onclick="window.AgentDate.runDate()">Run another date ↗</button><button class="smallbtn" onclick="window.AgentDate.go('rankings')">Open rankings</button></div></div>
      <div class="date-layout"><div class="room"><div class="room-head"><div class="pair-person"><div class="avatar">${svgAvatar(d.a,"mini-avatar-art")}</div><div><h3>${esc(d.a.name)}'s agent × ${esc(d.b.name)}'s agent</h3><p>${esc(d.a.city)} · ${esc(d.b.city)} · shared ${esc(d.topic)}</p></div></div><div class="room-score"><strong>${d.score}%</strong><span>compatibility</span></div></div>
        <div class="trace">${d.trace.map(x=>`<span class="trace-chip">${esc(x)}</span>`).join("")}</div>
        <div class="chat">${d.rounds.map((m,i)=>`<div class="msg ${i%2?"right":""}">${i%2===0?`<div class="avatar">${svgAvatar({id:d.a.id,name:d.a.name},"mini-avatar-art")}</div>`:""}<div class="bubble"><div class="speaker">${esc(m.speaker)} · ${m.role}</div>${esc(m.text)}</div>${i%2?`<div class="avatar">${svgAvatar({id:d.b.id,name:d.b.name},"mini-avatar-art")}</div>`:""}</div>`).join("")}<div class="date-decision"><div class="decision-row"><b>Agent decision</b><span class="decision">${esc(d.decision)}</span></div><p>The agents found ${d.sharedInterests.length} shared interest signal${d.sharedInterests.length===1?"":"s"} and ${d.sharedTraits.length} shared trait signal${d.sharedTraits.length===1?"":"s"}. Suggested date: <strong>${esc(d.plan)}</strong>.</p></div></div></div>
        <div class="date-side"><div class="side-panel"><h3>Why this pair connected</h3><div class="signal"><div class="sig-dot"></div><div><b>Shared interests</b><span>${esc(d.sharedInterests.join(" · ")||"No exact overlap")}</span></div></div><div class="signal"><div class="sig-dot"></div><div><b>Trait resonance</b><span>${esc(d.sharedTraits.join(" · ")||"Complementary traits")}</span></div></div><div class="signal"><div class="sig-dot"></div><div><b>Conversation test</b><span>Four turns, including a follow-up question and a date-choice response.</span></div></div></div>
          <div class="side-panel"><h3>Recent date history</h3>${state.history.slice(-6).reverse().map(x=>`<div class="date-item"><b>${esc(x.a?.name||"Agent")} × ${esc(x.b?.name||"Agent")}</b><span>${x.score}%</span></div>`).join("")||`<div class="empty">No history yet.</div>`}</div></div></div>`;
  }

  async function renderRankings() {
    const mount=$("#rankings"); if(!mount) throw new Error("Rankings mount missing");
    const p=current(); if(!p) return;
    mount.innerHTML=`<div class="page-head"><div><h1>Compatibility rankings</h1><p>Server-computed from the current agent pool. The UI exposes why a candidate sits where it does.</p></div><div class="page-actions"><button id="recalc" class="smallbtn primary">Recalculate ↗</button><button class="smallbtn" onclick="window.AgentDate.go('dates')">See latest date</button></div></div><div class="rank-hero"><div class="match-card" id="rankHero"><div class="empty">Calculating this agent's current best fit…</div></div><div class="dimension-card" id="rankDimensions"><h3>Match methodology</h3><p>Four visible dimensions keep the score interpretable.</p><div class="dim-row"><span>Shared interests</span><div class="dim-bar"><i style="width:0%"></i></div><strong>—</strong></div><div class="dim-row"><span>Trait resonance</span><div class="dim-bar"><i style="width:0%"></i></div><strong>—</strong></div><div class="dim-row"><span>Lifestyle synergy</span><div class="dim-bar"><i style="width:0%"></i></div><strong>—</strong></div><div class="dim-row"><span>Date quality</span><div class="dim-bar"><i style="width:0%"></i></div><strong>—</strong></div></div></div><div class="rank-board" id="rankBoard"><div class="rank-board-top"><div><h2>Agent ranking</h2><p id="rankStatus">Computing full pool…</p></div><div class="rank-status">${state.people.length-1} candidates · run ${state.rankingRuns+1}</div></div><div class="rank-col"><span>Rank</span><span>Profile</span><span>Why it fits</span><span>Date signal</span><span>Score</span></div><div id="rankRows"></div><div class="rank-foot">Scores are demo-engine outputs for reproducible judging. They should be treated as explainable signals, not an objective truth about people.</div></div>`;
    $("#recalc").onclick=()=>renderRankings();
    try {
      const data=await api("/api/rankings",{method:"POST",body:JSON.stringify({people:state.people,history:state.history,subjectId:p.id})});
      state.rankCache=data; state.rankingRuns++; save();
      const top=data.top[0];
      if(top){
        const fit = top.sharedInterests.length?top.sharedInterests:top.sharedTraits;
        const dimensions=top.dimensions||{};
        $("#rankHero").innerHTML=`<div class="match-head"><div><div class="match-label">AGENT PICK · CURRENT BEST FIT</div><div class="match-title">${esc(top.name)}</div></div><div class="match-score">${top.score}<small>% FIT</small></div></div><div class="match-person"><div class="match-avatar">${svgAvatar({id:top.id,name:top.name},"rank-avatar-art")}</div><div><h3>${esc(top.name)}</h3><p>${esc(top.role)} · ${esc(top.city)}</p></div></div><div class="fit-chips">${(fit.length?fit:["Complementary signals"]).slice(0,4).map(x=>`<span class="fit-chip">${esc(x)}</span>`).join("")}</div><div class="match-note">${esc(top.reason)}. The score combines profile overlap, trait resonance, lifestyle synergy and any evidence from previous agent dates.</div>`;
        const vals=[dimensions.sharedInterests||0,dimensions.traitResonance||0,dimensions.lifestyleSynergy||0,dimensions.dateQuality||0], max=[34,24,28,18];
        $$("#rankDimensions .dim-row").forEach((row,i)=>{const val=vals[i],mx=max[i]; $(".dim-bar i",row).style.width=Math.min(100,Math.round(val/mx*100))+"%"; $("strong",row).textContent=`${val}/${mx}`});
      }
      $("#rankStatus").textContent=`For ${p.name} · refreshed ${new Date(data.generatedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`;
      $("#rankRows").innerHTML=data.results.map((r,i)=>{
        const tested=state.history.some(d=>(d.aId===p.id&&d.bId===r.id)||(d.aId===r.id&&d.bId===p.id));
        const signalCount=(r.sharedInterests?.length||0)+(r.sharedTraits?.length||0);
        return `<div class="rank-table-row"><div class="rank-num">${String(i+1).padStart(2,"0")}</div><div class="rank-ident"><div class="rank-avatar">${svgAvatar({id:r.id,name:r.name},"rank-avatar-art")}</div><div style="min-width:0"><div class="rank-name">${esc(r.name)}</div><div class="rank-role">${esc(r.role)} · ${esc(r.city)}</div></div></div><div class="rank-fit"><div class="fit-reason">${esc(r.reason)}</div><div class="fit-mini"><div class="mini-bar"><i style="width:${r.score}%"></i></div><span class="signal-count">${signalCount} signals</span></div></div><div class="rank-date"><span class="fit-chip" style="padding:5px 6px;color:${tested?"#77e6cd":"#817a84"};border-color:${tested?"rgba(119,230,205,.18)":"#2b2730"}">${tested?"DATE TESTED":"PROFILE ONLY"}</span></div><div class="rank-score">${r.score}%</div></div>`;
      }).join("");
    } catch(e){$("#rankRows").innerHTML=`<div class="empty">Ranking engine error: ${esc(e.message)}</div>`;}
  }

  function renderActivity() {
    const mount=$("#activity"); if(!mount) throw new Error("Activity mount missing");
    mount.innerHTML=`<div class="page-head"><div><h1>Agent activity</h1><p>Observe the autonomous loop, keep the source boundary explicit, and add new people when you need to.</p></div></div>
      <div class="activity"><div class="timeline">${state.history.length?state.history.slice().reverse().map(d=>`<div class="timeline-item"><div class="t-dot"></div><div><b>${esc(d.a?.name||"Agent")} × ${esc(d.b?.name||"Agent")}</b><p>${new Date(d.createdAt||Date.now()).toLocaleString()} · ${esc(d.decision||"date completed")} · ${esc(d.plan||"")}</p></div><div class="timeline-score">${d.score}%</div></div>`).join(""):`<div class="empty">No autonomous activity yet. Run an agent date to start the timeline.</div>`}</div>
      <div class="form-panel"><h3>Bring in a person</h3><p>Paste exactly two public URLs. The backend attempts to read those two sources only.</p><div class="formgrid"><input id="newLinkedin" class="input" placeholder="https://linkedin.com/in/..."><input id="newInstagram" class="input" placeholder="https://instagram.com/..."><button id="createAgent" class="btn">Create agent</button><div id="analyzeStatus" class="statusline"></div></div></div></div>
      <div class="panel" style="margin-top:13px"><div class="panel-title"><div><h2>Trust + source boundary</h2><p>Modern dating interactions need useful context without pretending model inference is identity verification.</p></div></div><div class="insight-grid"><div class="ibox"><label>Source policy</label><strong>Exactly LinkedIn + Instagram for the seeded challenge flow.</strong></div><div class="ibox"><label>Inference policy</label><strong>Observed source evidence and generated signals stay visually separate.</strong></div><div class="ibox"><label>Human control</label><strong>Agents can propose a date; a real production product should keep the human in control of any real-world action.</strong></div></div></div>`;
    $("#createAgent").onclick=analyzeNew;
  }

  async function analyzeNew() {
    const li=$("#newLinkedin").value.trim(), ig=$("#newInstagram").value.trim(), st=$("#analyzeStatus");
    if(!li||!ig){st.className="statusline bad";st.textContent="Paste both public URLs.";return}
    st.className="statusline";st.textContent="Reading exactly the two supplied public pages…";
    try {
      const d=await api("/api/analyze",{method:"POST",body:JSON.stringify({linkedin:li,instagram:ig})});
      const p={...d,custom:true,verifiedSources:2};
      state.people=[p,...state.people]; localStorage.setItem("agentdate.custom",JSON.stringify(state.people.filter(x=>x.custom).slice(0,12))); state.selectedId=p.id; save(); updateTop();
      st.className="statusline good";st.textContent="Agent created and added to the current dating pool."; toast("New agent added to the dating pool."); setView("lab");
    } catch(e){st.className="statusline bad";st.textContent=e.message;toast("The seeded 25-agent showcase remains available.");}
  }

  async function runDate(forcePair) {
    $$(".smallbtn,.btn").forEach(b=>{if(/Run (an|another) agent date/.test(b.textContent))b.disabled=true});
    try {
      const payload={people:state.people,history:state.history};
      let d=forcePair?await api("/api/date/specific",{method:"POST",body:JSON.stringify({...payload,aId:forcePair.aId,bId:forcePair.bId})}):await api("/api/date",{method:"POST",body:JSON.stringify(payload)});
      state.currentDate=d; state.history.push(d); save(); updateTop(); setView("dates"); toast(`${d.a.name}'s agent finished a date with ${d.b.name}'s agent.`);
    } catch(e){toast(e.message)} finally{$$(".smallbtn,.btn").forEach(b=>b.disabled=false)}
  }

  function select(id){state.selectedId=String(id);save(); if(state.view==="discover")renderDiscover(); if(state.view==="lab")renderLab(); if(state.view==="rankings")renderRankings(); toast(`Selected ${state.people.find(p=>String(p.id)===String(id))?.name||"agent"}.`);}
  function selectRandom(){const arr=state.people.filter(p=>String(p.id)!==String(state.selectedId));const p=arr[Math.floor(Math.random()*arr.length)];select(p.id);setView("lab");}
  function runSpecificForSelected(){const p=current();const others=state.people.filter(x=>x.id!==p.id).map(x=>({p:x,s:(shared(p,x,"interests").length*12)+(shared(p,x,"traits").length*6)})).sort((a,b)=>b.s-a.s);const other=others[0]?.p;if(other)runDate({aId:p.id,bId:other.id});}
  function go(view){setView(view)}

  async function init(){
    try { const d=await api("/api/people"); const custom=JSON.parse(localStorage.getItem("agentdate.custom")||"[]"); state.people=[...custom,...d.people]; }
    catch { state.people=[...(window.SEED_PEOPLE||[])]; }
    if(!state.people.find(p=>String(p.id)===String(state.selectedId))) state.selectedId=state.people[0]?.id;
    renderNav();updateTop();setView(state.view);
    window.AgentDate={select,selectRandom,runDate,runSpecificForSelected,go};
  }

  window.AgentDate={select,selectRandom,runDate,runSpecificForSelected,go};
  window.addEventListener("error", event=>{
    const main=$(".content"); if(!main||$("#runtimeError"))return;
    const box=document.createElement("div"); box.id="runtimeError"; box.style.cssText="margin:28px 0;padding:16px;border:1px solid #5a3344;border-radius:15px;background:#171016;color:#f7e7ee;font:11px/1.65 'DM Sans',sans-serif"; box.innerHTML=`<strong>AgentDate runtime error</strong><br><span style="color:#b8aeb8">${esc(event.message||"Unknown browser error")}</span>`; main.prepend(box);
  });
  init();
})();
