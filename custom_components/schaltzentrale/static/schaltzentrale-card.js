/* Schaltzentrale – Dashboard-Karte „Heute geschaltet“.
 * Wird von der Integration automatisch geladen.
 *   type: custom:schaltzentrale-card
 *   title: Heute geschaltet      # optional
 *   theme: Weihnachten Außen     # optional, nur dieses Thema (Name oder ID)
 */

const escC = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

class SchaltzentraleCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this._paint();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._subscribe();
  }

  static getStubConfig() { return {}; }
  getCardSize() { return 4; }

  connectedCallback() {
    if (this._hass && !this._unsub) this._subscribe();
    this._tick = setInterval(() => this._paint(), 60000);
  }
  disconnectedCallback() {
    clearInterval(this._tick);
    if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; }
  }

  _subscribe() {
    if (!this._hass || !this.isConnected) return;
    this._unsub = this._hass.connection
      .subscribeMessage((msg) => { this._data = msg; this._paint(); }, { type: "schaltzentrale/subscribe" })
      .catch((err) => { this._error = err.message || String(err); this._paint(); return null; });
  }

  _paint() {
    if (!this.shadowRoot) return;
    const title = this._config?.title || "Heute geschaltet";
    let body;
    if (this._error) body = `<p class="muted">Schaltzentrale nicht erreichbar: ${escC(this._error)}</p>`;
    else if (!this._data) body = `<p class="muted">Lade …</p>`;
    else {
      const { config, status } = this._data;
      const filter = this._config?.theme;
      const themes = config.themes.filter((t) => !filter || t.id === filter || t.name === filter);
      const now = new Date();
      const nowPct = (((now.getHours() + now.getMinutes() / 60) / 24) * 100).toFixed(2);
      const rows = themes.flatMap((t) => t.groups.map((g) => {
        const gs = status.groups[g.id] || {};
        const active = gs.reason === "plan";
        const segs = (gs.today || []).map(([a, b]) =>
          `<span class="seg" style="left:${(a / 24) * 100}%;width:${((b - a) / 24) * 100}%"></span>`).join("");
        let state;
        if (gs.reason === "paused") state = "Pausiert";
        else if (gs.reason === "theme_off") state = "Thema aus";
        else if (gs.reason === "season") state = "Keine Saison";
        else state = gs.on ? "AN" : "AUS";
        let next = "";
        if (active && gs.next_change) {
          const d = new Date(gs.next_change);
          const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
          const sameDay = d.toDateString() === now.toDateString();
          next = `${gs.next_state ? "An" : "Aus"} ${sameDay ? "um" : "morgen um"} ${time}`;
          if (!sameDay && d - now > 36 * 3600 * 1000) next = `${gs.next_state ? "An" : "Aus"} am ${d.toLocaleDateString("de-DE", { weekday: "long" })}`;
        } else if (!active) next = "Plan ruht";
        return `
        <div class="item ${active ? "" : "dim"}" style="--c:${escC(t.color)}">
          <div class="head"><span class="name"><span class="dot"></span>${escC(g.name)}<span class="theme">${escC(t.name)}</span></span><span class="state ${gs.on ? "on" : ""}">${state}</span></div>
          <div class="bar">${segs}<span class="now" style="left:${nowPct}%"></span></div>
          <span class="muted small">${escC(next)}</span>
        </div>`;
      })).join("");
      body = rows || `<p class="muted">Noch keine Gruppen angelegt. Öffne die Schaltzentrale in der Seitenleiste.</p>`;
      body = `<div class="scale"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>` + body;
    }
    this.shadowRoot.innerHTML = `<style>${CARD_CSS}</style>
      <ha-card>
        <div class="wrap">
          <div class="top"><h2>${escC(title)}</h2><a href="/schaltzentrale" class="link">Öffnen</a></div>
          ${body}
        </div>
      </ha-card>`;
  }
}

const CARD_CSS = `
.wrap { padding:16px; display:flex; flex-direction:column; gap:14px; font-family:inherit; }
.top { display:flex; align-items:center; justify-content:space-between; }
h2 { margin:0; font-size:18px; font-weight:600; }
.link { font-size:13px; color:var(--primary-color); text-decoration:none; }
.muted { color:var(--secondary-text-color); margin:0; }
.small { font-size:12px; }
.scale { display:flex; justify-content:space-between; font-size:11px; color:var(--secondary-text-color); }
.item { display:flex; flex-direction:column; gap:6px; }
.item.dim { opacity:.6; }
.head { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.name { display:flex; align-items:center; gap:8px; font-weight:600; font-size:14px; min-width:0; }
.theme { font-weight:400; font-size:12px; color:var(--secondary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dot { width:10px; height:10px; border-radius:50%; background:var(--c); flex:0 0 auto; }
.state { padding:2px 10px; border-radius:999px; font-size:11px; font-weight:600; background:var(--secondary-background-color, #262b35); color:var(--secondary-text-color); white-space:nowrap; }
.state.on { background:color-mix(in srgb, var(--c) 22%, transparent); color:var(--c); }
.bar { position:relative; height:12px; border-radius:6px; background:var(--secondary-background-color, #262b35); overflow:hidden; }
.seg { position:absolute; top:0; bottom:0; background:var(--c); }
.now { position:absolute; top:0; bottom:0; width:2px; background:#f87171; }
`;

if (!customElements.get("schaltzentrale-card")) {
  customElements.define("schaltzentrale-card", SchaltzentraleCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "schaltzentrale-card",
    name: "Schaltzentrale: Heute",
    description: "Zeigt, wann deine Gruppen heute an sind.",
  });
}
