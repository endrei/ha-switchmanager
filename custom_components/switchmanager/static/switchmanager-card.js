/* SwitchManager dashboard card "Today".
 * Loaded automatically by the integration.
 *   type: custom:switchmanager-card
 *   title: Today                 # optional
 *   theme: Christmas outdoor     # optional, only this theme (name or id)
 */

const CARD_TEXT = {
  de: { locale: "de-DE", title: "Heute geschaltet", unreachable: "SwitchManager nicht erreichbar: {err}", loading: "Lade …",
    paused: "Pausiert", themeOff: "Thema aus", season: "Keine Saison", on: "AN", off: "AUS", onW: "An", offW: "Aus",
    at: "um", tomorrowAt: "morgen um", on_day: "am", resting: "Plan ruht",
    empty: "Noch keine Gruppen angelegt. Öffne SwitchManager in der Seitenleiste.", open: "Öffnen",
    cardName: "SwitchManager: Heute", cardDesc: "Zeigt, wann deine Gruppen heute an sind." },
  en: { locale: "en-GB", title: "Switched today", unreachable: "SwitchManager not reachable: {err}", loading: "Loading …",
    paused: "Paused", themeOff: "Theme off", season: "Out of season", on: "ON", off: "OFF", onW: "On", offW: "Off",
    at: "at", tomorrowAt: "tomorrow at", on_day: "on", resting: "Plan resting",
    empty: "No groups yet. Open SwitchManager in the sidebar.", open: "Open",
    cardName: "SwitchManager: Today", cardDesc: "Shows when your groups are on today." },
};
const cardLang = (hass) => {
  const l = String(hass?.locale?.language || hass?.language || navigator.language || "en").toLowerCase();
  return l.startsWith("de") ? "de" : "en";
};

const escC = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

class SwitchManagerCard extends HTMLElement {
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
      .subscribeMessage((msg) => { this._data = msg; this._paint(); }, { type: "switchmanager/subscribe" })
      .catch((err) => { this._error = err.message || String(err); this._paint(); return null; });
  }

  _paint() {
    if (!this.shadowRoot) return;
    const T = CARD_TEXT[cardLang(this._hass)];
    const title = this._config?.title || T.title;
    let body;
    if (this._error) body = `<p class="muted">${escC(T.unreachable.replace("{err}", this._error))}</p>`;
    else if (!this._data) body = `<p class="muted">${escC(T.loading)}</p>`;
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
        if (gs.reason === "paused") state = T.paused;
        else if (gs.reason === "theme_off") state = T.themeOff;
        else if (gs.reason === "season") state = T.season;
        else state = gs.on ? T.on : T.off;
        let next = "";
        if (active && gs.next_change) {
          const d = new Date(gs.next_change);
          const time = d.toLocaleTimeString(T.locale, { hour: "2-digit", minute: "2-digit" });
          const sameDay = d.toDateString() === now.toDateString();
          next = `${gs.next_state ? T.onW : T.offW} ${sameDay ? T.at : T.tomorrowAt} ${time}`;
          if (!sameDay && d - now > 36 * 3600 * 1000) next = `${gs.next_state ? T.onW : T.offW} ${T.on_day} ${d.toLocaleDateString(T.locale, { weekday: "long" })}`;
        } else if (!active) next = T.resting;
        return `
        <div class="item ${active ? "" : "dim"}" style="--c:${escC(t.color)}">
          <div class="head"><span class="name"><span class="dot"></span>${escC(g.name)}<span class="theme">${escC(t.name)}</span></span><span class="state ${gs.on ? "on" : ""}">${state}</span></div>
          <div class="bar">${segs}<span class="now" style="left:${nowPct}%"></span></div>
          <span class="muted small">${escC(next)}</span>
        </div>`;
      })).join("");
      body = rows || `<p class="muted">${escC(T.empty)}</p>`;
      body = `<div class="scale"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>` + body;
    }
    this.shadowRoot.innerHTML = `<style>${CARD_CSS}</style>
      <ha-card>
        <div class="wrap">
          <div class="top"><h2>${escC(title)}</h2><a href="/switchmanager" class="link">${escC(T.open)}</a></div>
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

if (!customElements.get("switchmanager-card")) {
  customElements.define("switchmanager-card", SwitchManagerCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "switchmanager-card",
    name: CARD_TEXT[cardLang()].cardName,
    description: CARD_TEXT[cardLang()].cardDesc,
  });
}
