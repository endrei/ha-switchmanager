/* Schaltzentrale – Seitenleisten-Panel für Home Assistant.
 * Ohne Build-Schritt: ein einzelnes Web Component mit Shadow DOM.
 */

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const COLORS = ["#f59e0b", "#60a5fa", "#c084fc", "#34d399", "#f472b6", "#f87171", "#2dd4bf", "#a3e635"];
const ENTITY_DOMAINS = ["switch", "light", "input_boolean", "fan"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const newId = () => Math.random().toString(36).slice(2, 10);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const pct = (h) => ((h / 24) * 100).toFixed(3) + "%";

function hhmm(h) {
  h = clamp(h, 0, 24);
  let hours = Math.floor(h + 1e-6);
  let minutes = Math.round((h - hours) * 60);
  if (minutes === 60) { hours += 1; minutes = 0; }
  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}
function parseHHMM(s) {
  const [a, b] = String(s || "00:00").split(":").map(Number);
  return a + (b || 0) / 60;
}
function hoursOf(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}
function offLabel(v) {
  if (!v) return "";
  return (v > 0 ? " +" : " −") + Math.abs(v) + " min";
}
function mdToText(md) {
  const [m, d] = String(md || "").split("-");
  return d && m ? `${d}.${m}.` : "";
}
function textToMd(text) {
  const m = String(text).trim().match(/^(\d{1,2})\.(\d{1,2})\.?$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  return String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
}

class SchaltzentralePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cfg = null;
    this._status = null;
    this._sel = { theme: null, group: null, win: 0 };
    this._ui = { editTheme: false, editGroup: null, picker: null, confirm: null, saved: "" };
    this._drag = null;
    this._bound = false;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._init();
    else this._onStates();
  }
  set narrow(n) { this._narrow = n; if (this._cfg) this._render(); }
  set panel(_p) {}
  set route(_r) {}

  connectedCallback() {
    this._clock = setInterval(() => this._softRender(), 60000);
    if (this._hass && !this._unsub && this._cfg) this._subscribe();
  }
  disconnectedCallback() {
    clearInterval(this._clock);
    if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; }
  }

  async _init() {
    this._renderShell("Lade Schaltzentrale …");
    try {
      const res = await this._hass.callWS({ type: "schaltzentrale/get" });
      this._apply(res);
      this._subscribe();
    } catch (err) {
      this._renderShell("Schaltzentrale konnte nicht geladen werden: " + esc(err.message || err));
    }
  }

  _subscribe() {
    this._unsub = this._hass.connection
      .subscribeMessage((msg) => {
        // Konfiguration nur übernehmen, wenn gerade nichts ungespeichert ist
        if (!this._saveTimer) this._cfg = msg.config;
        this._status = msg.status;
        this._softRender();
      }, { type: "schaltzentrale/subscribe" })
      .catch(() => null);
  }

  _apply(res) {
    this._cfg = res.config;
    this._status = res.status;
    this._fixSelection();
    this._render();
  }

  _fixSelection() {
    const themes = this._cfg.themes;
    let theme = themes.find((t) => t.id === this._sel.theme) || themes[0];
    this._sel.theme = theme ? theme.id : null;
    let group = theme && (theme.groups.find((g) => g.id === this._sel.group) || theme.groups[0]);
    this._sel.group = group ? group.id : null;
    if (!group || this._sel.win >= group.windows.length) this._sel.win = 0;
  }

  get _theme() { return this._cfg.themes.find((t) => t.id === this._sel.theme); }
  get _group() { const t = this._theme; return t && t.groups.find((g) => g.id === this._sel.group); }

  // ---------------------------------------------------------------- Speichern
  _changed() {
    this._fixSelection();
    this._render();
    clearTimeout(this._saveTimer);
    this._ui.saved = "Speichern …";
    this._paintSaved();
    this._saveTimer = setTimeout(() => this._save(), 500);
  }

  async _save() {
    try {
      const res = await this._hass.callWS({ type: "schaltzentrale/save", config: this._cfg });
      this._saveTimer = null;
      this._cfg = res.config;
      this._status = res.status;
      this._ui.saved = "Gespeichert";
      this._fixSelection();
      this._softRender();
      setTimeout(() => { this._ui.saved = ""; this._paintSaved(); }, 2000);
    } catch (err) {
      this._saveTimer = null;
      this._ui.saved = "Fehler: " + (err.message || err);
      this._paintSaved();
    }
  }

  _paintSaved() {
    const el = this.shadowRoot.querySelector("#saved");
    if (el) el.textContent = this._ui.saved;
  }

  // ---------------------------------------------------------------- Zeit
  get _sun() {
    const s = (this._status && this._status.sun) || {};
    return { sunrise: hoursOf(s.sunrise) ?? 7.5, sunset: hoursOf(s.sunset) ?? 17 };
  }
  _hours(p) {
    if (p.type === "time") return parseHHMM(p.time);
    return (p.type === "sunrise" ? this._sun.sunrise : this._sun.sunset) + (p.offset || 0) / 60;
  }
  _label(p) {
    if (p.type === "time") return p.time;
    return (p.type === "sunrise" ? "Aufgang" : "Untergang") + offLabel(p.offset);
  }

  // ---------------------------------------------------------------- Zustände
  _onStates() {
    if (!this._cfg || this._drag) return;
    const t = this._theme;
    if (!t) return;
    const sig = t.groups.flatMap((g) => g.entities).map((e) => this._hass.states[e]?.state).join("|");
    if (sig !== this._stateSig) { this._stateSig = sig; this._softRender(); }
  }

  _softRender() {
    if (!this._cfg || this._drag) return;
    const active = this.shadowRoot.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "SELECT")) return;
    this._render();
  }

  // ---------------------------------------------------------------- Rendern
  _renderShell(text) {
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="root"><p class="muted pad">${text}</p></div>`;
  }

  _render() {
    if (!this._cfg) return;
    const scroll = this.shadowRoot.querySelector(".root")?.scrollTop;
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="root">${this._header()}<div class="layout">${this._nav()}<main class="main">${this._main()}</main></div></div>`;
    if (scroll) this.shadowRoot.querySelector(".root").scrollTop = scroll;
    const menu = this.shadowRoot.querySelector("ha-menu-button");
    if (menu) { menu.hass = this._hass; menu.narrow = this._narrow; }
    if (!this._bound) this._bind();
    if (this._ui.picker) this._paintPicker();
  }

  _header() {
    const now = new Date();
    const date = now.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
    const time = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const paused = this._cfg.paused;
    return `
    <header class="top">
      <div class="brand">
        ${this._narrow ? `<ha-menu-button></ha-menu-button>` : ""}
        <div class="logo">${ICON.power}</div>
        <div><h1>Schaltzentrale</h1><p class="muted small">Zeitpläne für deine Schalter, ohne eine Zeile YAML</p></div>
      </div>
      <div class="row wrap gap10">
        <span id="saved" class="muted small">${esc(this._ui.saved)}</span>
        <span class="pill">${ICON.sun}${esc(date)} · ${esc(time)} · Aufgang ${hhmm(this._sun.sunrise)} · Untergang ${hhmm(this._sun.sunset)}</span>
        <button class="btn ${paused ? "danger-on" : ""}" data-a="pause">${paused ? "Pläne fortsetzen" : "Alles pausieren"}</button>
      </div>
    </header>`;
  }

  _nav() {
    const themes = this._cfg.themes;
    const list = themes.map((t) => {
      const sel = t.id === this._sel.theme;
      const n = t.groups.reduce((s, g) => s + g.entities.length, 0);
      const st = this._status?.themes?.[t.id];
      let meta = `${t.groups.length} ${t.groups.length === 1 ? "Gruppe" : "Gruppen"} · ${n} Schalter`;
      if (!t.active) meta += " · aus";
      else if (st && !st.in_season) meta += " · außerhalb Saison";
      return `
      <div class="theme ${sel ? "sel" : ""} ${t.active ? "" : "dim"}" style="--c:${esc(t.color)}">
        <button class="theme-pick" data-a="pick-theme" data-id="${esc(t.id)}">
          <span class="dot"></span>
          <span class="col"><span class="strong">${esc(t.name)}</span><span class="muted small">${esc(meta)}</span></span>
        </button>
        ${this._toggle("toggle-theme", t.active, t.color, `data-id="${esc(t.id)}"`, t.name)}
      </div>`;
    }).join("");
    return `
    <nav class="nav" aria-label="Themen">
      <div class="row between"><h2 class="eyebrow">Themen</h2><span class="muted small">${themes.length} angelegt</span></div>
      ${list}
      <button class="dashed" data-a="add-theme">${ICON.plus} Thema anlegen</button>
      <div class="hint"><strong>Aufbau:</strong> Ein Thema (z. B. Weihnachten Außen) enthält Gruppen, jede Gruppe enthält Schalter und hat ihren eigenen Wochenplan. Ist ein Thema aus oder außerhalb seiner Saison, ruhen alle seine Pläne.</div>
    </nav>`;
  }

  _toggle(action, on, color, attrs, name) {
    return `<button class="toggle ${on ? "on" : ""}" style="--c:${esc(color)}" data-a="${action}" ${attrs} aria-pressed="${on}" aria-label="${esc(name)} ${on ? "ausschalten" : "einschalten"}"><span></span></button>`;
  }

  _main() {
    const t = this._theme;
    if (!t) {
      return `<section class="card empty"><h2>Willkommen in der Schaltzentrale</h2>
        <p class="muted">Lege links dein erstes Thema an, zum Beispiel „Weihnachten Außen“. Darin legst du Gruppen mit deinen Schaltern an und gibst jeder Gruppe einen Wochenplan.</p>
        <button class="btn primary" style="--c:#f59e0b" data-a="add-theme">${ICON.plus} Erstes Thema anlegen</button></section>`;
    }
    return this._themeHeader(t) + this._groups(t) + this._schedule(t);
  }

  _themeHeader(t) {
    const st = this._status?.themes?.[t.id];
    const paused = this._cfg.paused;
    const season = t.season?.enabled ? `${mdToText(t.season.start)} – ${mdToText(t.season.end)}` : "ganzjährig";
    let line;
    if (paused) line = "Alle Pläne pausiert, es wird nichts geschaltet";
    else if (!t.active) line = "Ausgeschaltet · Pläne ruhen, die Schalter sind aus";
    else if (st && !st.in_season) line = "Außerhalb der Saison · Pläne ruhen";
    else line = `Aktiv · ${t.groups.length} ${t.groups.length === 1 ? "Gruppe" : "Gruppen"}`;

    let editor = "";
    if (this._ui.editTheme) {
      const confirm = this._ui.confirm === "theme:" + t.id;
      editor = `
      <div class="editor grid3">
        <label class="field"><span class="eyebrow">Name</span><input data-f="theme-name" value="${esc(t.name)}" maxlength="60"></label>
        <div class="field"><span class="eyebrow">Farbe</span><div class="row wrap gap6">
          ${COLORS.map((c) => `<button class="swatch ${c === t.color ? "on" : ""}" style="--c:${c}" data-a="theme-color" data-v="${c}" aria-label="Farbe ${c}"></button>`).join("")}
        </div></div>
        <div class="field"><span class="eyebrow">Saison</span>
          <label class="row gap6 small"><input type="checkbox" data-f="season-on" ${t.season?.enabled ? "checked" : ""}> nur in diesem Zeitraum schalten</label>
          <div class="row gap6">
            <input class="short" data-f="season-start" value="${esc(mdToText(t.season?.start || "11-29"))}" placeholder="29.11." aria-label="Saison von" ${t.season?.enabled ? "" : "disabled"}>
            <span class="muted">bis</span>
            <input class="short" data-f="season-end" value="${esc(mdToText(t.season?.end || "01-06"))}" placeholder="06.01." aria-label="Saison bis" ${t.season?.enabled ? "" : "disabled"}>
          </div>
        </div>
        <div class="row wrap gap6 span3">
          <button class="btn" data-a="edit-theme">Fertig</button>
          <button class="btn ghost-danger" data-a="del-theme">${confirm ? "Wirklich löschen? Nochmal klicken" : "Thema löschen"}</button>
        </div>
      </div>`;
    }
    return `
    <section class="card" style="--c:${esc(t.color)}">
      <div class="row between wrap gap12">
        <div class="row gap14"><span class="bar"></span>
          <div><h2 class="title">${esc(t.name)}</h2><p class="muted small">${esc(line)}</p></div>
        </div>
        <div class="row wrap gap8">
          <span class="pill">${ICON.cal} Saison ${esc(season)}</span>
          <button class="btn" data-a="edit-theme">${this._ui.editTheme ? "Schließen" : "Bearbeiten"}</button>
        </div>
      </div>
      ${editor}
    </section>`;
  }

  _nextText(gs) {
    if (!gs) return "";
    if (gs.reason === "paused") return "Pausiert, keine Schaltungen";
    if (gs.reason === "theme_off") return "Thema ist aus";
    if (gs.reason === "season") return "Außerhalb der Saison";
    if (!gs.next_change) return "Kein Zeitfenster geplant";
    const d = new Date(gs.next_change);
    const today = new Date();
    const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
    let day;
    if (d.toDateString() === today.toDateString()) day = "heute";
    else if (d.toDateString() === tomorrow.toDateString()) day = "morgen";
    else day = DAYS_LONG[(d.getDay() + 6) % 7];
    const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    return `Nächste Schaltung: ${day} ${time} ${gs.next_state ? "an" : "aus"}`;
  }

  _groups(t) {
    const cards = t.groups.map((g) => {
      const sel = g.id === this._sel.group;
      const gs = this._status?.groups?.[g.id];
      const on = gs?.on;
      const editing = this._ui.editGroup === g.id;
      const chips = g.entities.map((e) => {
        const st = this._hass.states[e];
        const name = st?.attributes?.friendly_name || e;
        const state = st?.state;
        const cls = state === "on" ? "on" : (state === "off" ? "" : "na");
        const title = state === "on" || state === "off" ? `${e} · antippen zum Umschalten` : `${e} · nicht erreichbar`;
        return editing
          ? `<span class="chip"><span class="cdot ${cls}"></span>${esc(name)}<button class="x" data-a="del-entity" data-g="${esc(g.id)}" data-e="${esc(e)}" aria-label="${esc(name)} entfernen">×</button></span>`
          : `<button class="chip" data-a="flip" data-e="${esc(e)}" title="${esc(title)}"><span class="cdot ${cls}"></span>${esc(name)}</button>`;
      }).join("");
      const confirm = this._ui.confirm === "group:" + g.id;
      const top = editing
        ? `<input class="grow" data-f="group-name" data-g="${esc(g.id)}" value="${esc(g.name)}" maxlength="60" aria-label="Gruppenname">`
        : `<button class="group-pick" data-a="pick-group" data-id="${esc(g.id)}">
             <span class="row between gap8"><span class="strong big">${esc(g.name)}</span><span class="badge ${on ? "on" : ""}">${on ? "AN laut Plan" : "AUS laut Plan"}</span></span>
             <span class="muted small">${esc(this._nextText(gs))}</span>
           </button>`;
      return `
      <div class="group ${sel ? "sel" : ""}">
        <div class="row gap8 start">${top}
          <button class="icon" data-a="edit-group" data-id="${esc(g.id)}" aria-label="${editing ? "Fertig" : "Gruppe bearbeiten"}">${editing ? ICON.check : ICON.edit}</button>
        </div>
        <div class="row wrap gap6">${chips || `<span class="muted small">Noch keine Schalter</span>`}</div>
        ${editing ? `
          <div class="row wrap gap6">
            <button class="btn small-btn" data-a="open-picker" data-g="${esc(g.id)}">${ICON.plus} Schalter hinzufügen</button>
            <button class="btn small-btn ghost-danger" data-a="del-group" data-id="${esc(g.id)}">${confirm ? "Wirklich löschen?" : "Gruppe löschen"}</button>
          </div>
          ${this._ui.picker === g.id ? `<div class="picker"><input id="pick-q" placeholder="Schalter suchen, z. B. Krippe" aria-label="Schalter suchen"><div id="pick-list" class="pick-list"></div></div>` : ""}
        ` : ""}
      </div>`;
    }).join("");
    return `<section class="groups" aria-label="Gruppen" style="--c:${esc(t.color)}">${cards}
      <button class="dashed tall" data-a="add-group">${ICON.plus} Gruppe anlegen</button></section>`;
  }

  _schedule(t) {
    const g = this._group;
    if (!g) return "";
    const rows = DAYS.map((day, di) => {
      const blocks = [];
      g.windows.forEach((w, wi) => {
        const a = this._hours(w.from);
        const b = this._hours(w.to);
        const sel = wi === this._sel.win;
        const label = `${this._label(w.from)} – ${this._label(w.to)}`;
        const aria = `${DAYS_LONG[di]}: ${label}`;
        const block = (from, to, l, r) =>
          `<button class="block ${sel ? "sel" : ""}" data-a="pick-win" data-w="${wi}" data-day="${di}" aria-label="${esc(aria)}" style="left:${pct(from)};width:${pct(Math.max(0.1, to - from))}">${
            l ? `<span class="h h-l" data-w="${wi}" data-side="from"></span>` : ""}<span class="bl">${to - from > 3 ? esc(label) : ""}</span>${
            r ? `<span class="h h-r" data-w="${wi}" data-side="to"></span>` : ""}</button>`;
        if (b > a) {
          if (w.days.includes(di)) blocks.push(block(a, b, true, true));
        } else {
          // über Mitternacht: Abend am Tag selbst, Rest am Folgetag
          if (w.days.includes(di)) blocks.push(block(a, 24, true, false));
          if (w.days.includes((di + 6) % 7)) blocks.push(block(0, b, false, true));
        }
      });
      const today = (new Date().getDay() + 6) % 7 === di;
      const now = new Date();
      const nowH = now.getHours() + now.getMinutes() / 60;
      return `
      <div class="trow">
        <span class="tday ${today ? "today" : ""}">${day}</span>
        <div class="track" data-day="${di}">
          <span class="sunline" style="left:${pct(this._sun.sunrise)}"></span>
          <span class="sunline" style="left:${pct(this._sun.sunset)}"></span>
          ${blocks.join("")}
          ${today ? `<span class="now" style="left:${pct(nowH)}"></span>` : ""}
        </div>
      </div>`;
    }).join("");

    const w = g.windows[this._sel.win];
    let editor = "";
    if (w) {
      const types = (side) => [["time", "Uhrzeit"], ["sunrise", "Aufgang"], ["sunset", "Untergang"]]
        .map(([k, l]) => `<button class="seg ${w[side].type === k ? "on" : ""}" data-a="set-type" data-side="${side}" data-v="${k}">${l}</button>`).join("");
      const stepper = (side) => `
        <div class="row gap8">
          <button class="step" data-a="step" data-side="${side}" data-v="-1" aria-label="Früher">−</button>
          <span class="val">${esc(this._label(w[side]))}</span>
          <button class="step" data-a="step" data-side="${side}" data-v="1" aria-label="Später">+</button>
        </div>`;
      editor = `
      <div class="editor grid3">
        <div class="field"><span class="eyebrow">Einschalten</span><div class="row wrap gap6">${types("from")}</div>${stepper("from")}</div>
        <div class="field"><span class="eyebrow">Ausschalten</span><div class="row wrap gap6">${types("to")}</div>${stepper("to")}</div>
        <div class="field"><span class="eyebrow">Wochentage</span>
          <div class="row wrap gap6">${DAYS.map((d, di) => `<button class="day ${w.days.includes(di) ? "on" : ""}" data-a="day" data-v="${di}" aria-pressed="${w.days.includes(di)}">${d}</button>`).join("")}</div>
          <div class="row wrap gap6">
            <button class="seg" data-a="preset" data-v="work">Mo–Fr</button>
            <button class="seg" data-a="preset" data-v="weekend">Sa–So</button>
            <button class="seg" data-a="preset" data-v="all">Täglich</button>
            <button class="seg danger" data-a="del-win">Zeitfenster löschen</button>
          </div>
        </div>
      </div>`;
    } else {
      editor = `<p class="muted small">Noch kein Zeitfenster. Zieh im Raster mit der Maus über einen Tag oder klick auf „+ Zeitfenster“.</p>`;
    }

    return `
    <section class="card" style="--c:${esc(t.color)}" aria-label="Wochenplan">
      <div class="row between wrap gap10">
        <div><h3 class="title sm">Wochenplan · ${esc(g.name)}</h3>
          <p class="muted small">Zieh über einen Tag, um ein Zeitfenster anzulegen. Zieh an den Enden eines Balkens, um ihn zu verschieben. Klick auf einen Balken zum Bearbeiten.</p></div>
        <button class="btn primary" data-a="add-win">${ICON.plus} Zeitfenster</button>
      </div>
      <div class="scrollx"><div class="grid-wrap">
        <div class="hours">${["0", "3", "6", "9", "12", "15", "18", "21"].map((h) => `<span>${h}</span>`).join("")}</div>
        ${rows}
        <div class="legend"><span><i class="lg-now"></i> jetzt</span><span><i class="lg-sun"></i> Sonnenaufgang / -untergang heute</span></div>
      </div></div>
      ${editor}
    </section>`;
  }

  // ---------------------------------------------------------------- Picker
  _paintPicker() {
    const list = this.shadowRoot.querySelector("#pick-list");
    const input = this.shadowRoot.querySelector("#pick-q");
    if (!list || !input) return;
    const g = this._group && this._group.id === this._ui.picker ? this._group : this._theme?.groups.find((x) => x.id === this._ui.picker);
    if (!g) return;
    const q = (this._ui.pickQ || "").toLowerCase();
    const items = Object.values(this._hass.states)
      .filter((s) => ENTITY_DOMAINS.includes(s.entity_id.split(".")[0]) && !g.entities.includes(s.entity_id))
      .map((s) => ({ id: s.entity_id, name: s.attributes.friendly_name || s.entity_id, state: s.state }))
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.id.includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "de"))
      .slice(0, 40);
    list.innerHTML = items.length
      ? items.map((s) => `<button class="pick" data-a="add-entity" data-g="${esc(g.id)}" data-e="${esc(s.id)}"><span class="cdot ${s.state === "on" ? "on" : s.state === "off" ? "" : "na"}"></span><span class="col"><span>${esc(s.name)}</span><span class="muted tiny">${esc(s.id)}</span></span></button>`).join("")
      : `<p class="muted small pad">Nichts gefunden.</p>`;
    if (input.value !== (this._ui.pickQ || "")) input.value = this._ui.pickQ || "";
  }

  // ---------------------------------------------------------------- Ereignisse
  _bind() {
    this._bound = true;
    const root = this.shadowRoot;
    root.addEventListener("click", (ev) => {
      const el = ev.target.closest("[data-a]");
      if (!el || this._suppressClick) { this._suppressClick = false; return; }
      this._action(el.dataset.a, el.dataset, el);
    });
    root.addEventListener("change", (ev) => this._field(ev.target));
    root.addEventListener("input", (ev) => {
      if (ev.target.id === "pick-q") { this._ui.pickQ = ev.target.value; this._paintPicker(); }
    });
    root.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && ev.target.tagName === "INPUT" && ev.target.dataset.f) ev.target.blur();
    });
    root.addEventListener("pointerdown", (ev) => this._dragStart(ev));
  }

  _action(a, d) {
    const cfg = this._cfg;
    const t = this._theme;
    const g = this._group;
    const w = g && g.windows[this._sel.win];
    if (a !== "del-theme" && a !== "del-group") this._ui.confirm = null;
    switch (a) {
      case "pause": cfg.paused = !cfg.paused; return this._changed();
      case "pick-theme":
        this._sel = { theme: d.id, group: null, win: 0 };
        this._ui.editTheme = false; this._ui.editGroup = null; this._ui.picker = null;
        this._fixSelection(); return this._render();
      case "toggle-theme": {
        const x = cfg.themes.find((y) => y.id === d.id); x.active = !x.active; return this._changed();
      }
      case "add-theme": {
        const color = COLORS[cfg.themes.length % COLORS.length];
        const theme = { id: newId(), name: "Neues Thema", color, active: true, season: { enabled: false, start: "11-29", end: "01-06" }, groups: [{ id: newId(), name: "Neue Gruppe", entities: [], windows: [] }] };
        cfg.themes.push(theme);
        this._sel = { theme: theme.id, group: theme.groups[0].id, win: 0 };
        this._ui.editTheme = true;
        return this._changed();
      }
      case "edit-theme": this._ui.editTheme = !this._ui.editTheme; return this._render();
      case "theme-color": t.color = d.v; return this._changed();
      case "del-theme":
        if (this._ui.confirm !== "theme:" + t.id) { this._ui.confirm = "theme:" + t.id; return this._render(); }
        cfg.themes = cfg.themes.filter((x) => x.id !== t.id);
        this._ui.confirm = null; this._ui.editTheme = false; this._sel = { theme: null, group: null, win: 0 };
        return this._changed();
      case "pick-group": this._sel.group = d.id; this._sel.win = 0; return this._render();
      case "add-group": {
        const group = { id: newId(), name: "Neue Gruppe", entities: [], windows: [] };
        t.groups.push(group);
        this._sel.group = group.id; this._sel.win = 0;
        this._ui.editGroup = group.id; this._ui.picker = group.id; this._ui.pickQ = "";
        return this._changed();
      }
      case "edit-group":
        this._ui.editGroup = this._ui.editGroup === d.id ? null : d.id;
        this._ui.picker = null;
        if (this._ui.editGroup) { this._sel.group = d.id; this._sel.win = 0; }
        return this._render();
      case "del-group":
        if (this._ui.confirm !== "group:" + d.id) { this._ui.confirm = "group:" + d.id; return this._render(); }
        t.groups = t.groups.filter((x) => x.id !== d.id);
        this._ui.confirm = null; this._ui.editGroup = null;
        return this._changed();
      case "open-picker": this._ui.picker = this._ui.picker === d.g ? null : d.g; this._ui.pickQ = ""; this._render();
        this.shadowRoot.querySelector("#pick-q")?.focus(); return;
      case "add-entity": {
        const grp = t.groups.find((x) => x.id === d.g); if (!grp.entities.includes(d.e)) grp.entities.push(d.e);
        this._changed(); this.shadowRoot.querySelector("#pick-q")?.focus(); return;
      }
      case "del-entity": {
        const grp = t.groups.find((x) => x.id === d.g); grp.entities = grp.entities.filter((e) => e !== d.e); return this._changed();
      }
      case "flip": {
        const st = this._hass.states[d.e];
        if (!st || (st.state !== "on" && st.state !== "off")) return;
        this._hass.callService("homeassistant", "toggle", { entity_id: d.e });
        return;
      }
      case "pick-win": this._sel.win = Number(d.w); return this._render();
      case "add-win": {
        g.windows.push({ days: ALL_DAYS.slice(), from: { type: "sunset", offset: 0, time: "00:00" }, to: { type: "time", time: "22:00", offset: 0 } });
        this._sel.win = g.windows.length - 1; return this._changed();
      }
      case "del-win": if (!w) return; g.windows.splice(this._sel.win, 1); this._sel.win = 0; return this._changed();
      case "set-type": {
        if (!w || w[d.side].type === d.v) return;
        const h = this._hours(w[d.side]);
        w[d.side] = d.v === "time" ? { type: "time", time: hhmm(Math.round(h * 4) / 4), offset: 0 } : { type: d.v, offset: 0, time: "00:00" };
        return this._changed();
      }
      case "step": {
        if (!w) return;
        const p = w[d.side]; const dir = Number(d.v);
        if (p.type === "time") p.time = hhmm(clamp(Math.round((parseHHMM(p.time) + dir * 0.25) * 4) / 4, 0, d.side === "to" ? 24 : 23.75));
        else p.offset = clamp((p.offset || 0) + dir * 5, -720, 720);
        return this._changed();
      }
      case "day": {
        if (!w) return;
        const v = Number(d.v);
        w.days = w.days.includes(v) ? w.days.filter((x) => x !== v) : [...w.days, v].sort();
        return this._changed();
      }
      case "preset": {
        if (!w) return;
        w.days = d.v === "work" ? [0, 1, 2, 3, 4] : d.v === "weekend" ? [5, 6] : ALL_DAYS.slice();
        return this._changed();
      }
    }
  }

  _field(el) {
    const f = el.dataset.f;
    if (!f) return;
    const t = this._theme;
    if (f === "theme-name") { const v = el.value.trim(); if (v) { t.name = v; this._changed(); } }
    else if (f === "group-name") { const v = el.value.trim(); const grp = t.groups.find((x) => x.id === el.dataset.g); if (v && grp) { grp.name = v; this._changed(); } }
    else if (f === "season-on") { t.season = { start: "11-29", end: "01-06", ...(t.season || {}), enabled: el.checked }; this._changed(); }
    else if (f === "season-start" || f === "season-end") {
      const md = textToMd(el.value);
      if (!md) { el.setCustomValidity("Bitte als TT.MM. eingeben"); el.reportValidity(); return; }
      el.setCustomValidity("");
      t.season = { ...(t.season || {}), [f === "season-start" ? "start" : "end"]: md };
      this._changed();
    }
  }

  // ---------------------------------------------------------------- Ziehen
  _hourAt(track, clientX) {
    const r = track.getBoundingClientRect();
    return clamp(Math.round(((clientX - r.left) / r.width) * 24 * 4) / 4, 0, 24);
  }

  _dragStart(ev) {
    if (ev.button !== 0) return;
    const track = ev.target.closest(".track");
    if (!track) return;
    const g = this._group;
    if (!g) return;
    const handle = ev.target.closest(".h");
    if (handle) {
      ev.preventDefault();
      const wi = Number(handle.dataset.w);
      this._sel.win = wi;
      this._drag = { kind: "edge", track, wi, side: handle.dataset.side, block: handle.closest(".block"), h: null };
    } else if (!ev.target.closest(".block")) {
      ev.preventDefault();
      const h = this._hourAt(track, ev.clientX);
      const ghost = document.createElement("span");
      ghost.className = "ghost";
      track.appendChild(ghost);
      this._drag = { kind: "new", track, day: Number(track.dataset.day), h0: h, h1: h, ghost };
    } else {
      return;
    }
    const move = (e) => this._dragMove(e);
    const up = (e) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      this._dragEnd(e);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  _dragMove(ev) {
    const d = this._drag;
    if (!d) return;
    const h = this._hourAt(d.track, ev.clientX);
    if (d.kind === "new") {
      d.h1 = h;
      const a = Math.min(d.h0, d.h1); const b = Math.max(d.h0, d.h1);
      d.ghost.style.left = pct(a); d.ghost.style.width = pct(b - a);
      d.ghost.textContent = b - a >= 1 ? `${hhmm(a)} – ${hhmm(b)}` : "";
    } else {
      d.h = h;
      const w = this._group.windows[d.wi];
      const left = parseFloat(d.block.style.left) / 100 * 24;
      const right = left + parseFloat(d.block.style.width) / 100 * 24;
      if (d.side === "from" && h < right) { d.block.style.left = pct(h); d.block.style.width = pct(right - h); }
      if (d.side === "to" && h > left) { d.block.style.width = pct(h - left); }
      const label = d.block.querySelector(".bl");
      if (label) label.textContent = d.side === "from" ? `${hhmm(h)} – ${this._label(w.to)}` : `${this._label(w.from)} – ${hhmm(h)}`;
    }
  }

  _dragEnd() {
    const d = this._drag;
    this._drag = null;
    if (!d) return;
    const g = this._group;
    if (d.kind === "new") {
      const a = Math.min(d.h0, d.h1); const b = Math.max(d.h0, d.h1);
      d.ghost.remove();
      if (b - a < 0.25) return;
      g.windows.push({ days: [d.day], from: { type: "time", time: hhmm(a), offset: 0 }, to: { type: "time", time: hhmm(b), offset: 0 } });
      this._sel.win = g.windows.length - 1;
      this._suppressClick = true;
      setTimeout(() => { this._suppressClick = false; }, 0);
      return this._changed();
    }
    if (d.h === null) return this._render();
    const w = g.windows[d.wi];
    const p = w[d.side];
    if (p.type === "time") p.time = hhmm(d.side === "from" ? Math.min(d.h, 23.75) : d.h);
    else {
      const base = p.type === "sunrise" ? this._sun.sunrise : this._sun.sunset;
      p.offset = clamp(Math.round(((d.h - base) * 60) / 5) * 5, -720, 720);
    }
    this._suppressClick = true;
    setTimeout(() => { this._suppressClick = false; }, 0);
    this._changed();
  }
}

const ICON = {
  power: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v2"/><path d="M5.6 5.6l1.4 1.4"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="M17 7l1.4-1.4"/><path d="M7 16a5 5 0 0 1 10 0"/><path d="M3 20h18"/></svg>`,
  cal: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>`,
  plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>`,
};

const CSS = `
:host { display:block; height:100%; }
* { box-sizing:border-box; }
.root { min-height:100%; height:100%; overflow-y:auto; background:#111318; color:#e8eaf0; font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size:14px; }
button { font-family:inherit; cursor:pointer; color:inherit; }
h1,h2,h3 { margin:0; font-family:"Space Grotesk", Inter, system-ui, sans-serif; font-weight:600; }
h1 { font-size:22px; }
p { margin:2px 0 0; }
.muted { color:#a3abba; } .small { font-size:13px; } .tiny { font-size:11px; } .strong { font-weight:600; } .big { font-size:15px; }
.pad { padding:24px; }
.row { display:flex; align-items:center; } .wrap { flex-wrap:wrap; } .between { justify-content:space-between; } .start { align-items:flex-start; }
.col { display:flex; flex-direction:column; min-width:0; gap:2px; text-align:left; }
.gap6{gap:6px}.gap8{gap:8px}.gap10{gap:10px}.gap12{gap:12px}.gap14{gap:14px}
.grow { flex:1 1 auto; min-width:0; }
.top { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; padding:20px 28px; border-bottom:1px solid #262b35; }
.brand { display:flex; align-items:center; gap:14px; }
.logo { width:40px; height:40px; border-radius:10px; background:#1f2a3d; display:flex; align-items:center; justify-content:center; }
.pill { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; background:#1a1d24; border:1px solid #262b35; color:#c3c9d4; font-size:13px; }
.btn { min-height:40px; padding:0 16px; border-radius:10px; font-size:13px; font-weight:600; border:1px solid #3a4150; background:transparent; color:#dfe3ea; display:inline-flex; align-items:center; gap:6px; }
.btn:hover { background:#1d2129; }
.btn.primary { border:0; background:var(--c); color:#111318; }
.btn.primary:hover { filter:brightness(1.08); }
.btn.danger-on { border-color:#f87171; background:#3b1d1d; color:#fecaca; }
.btn.ghost-danger { border-color:#5b2a2a; color:#fca5a5; }
.small-btn { min-height:34px; padding:0 12px; font-weight:500; }
.layout { display:flex; flex-wrap:wrap; align-items:flex-start; gap:24px; padding:24px 28px; }
.nav { flex:1 1 260px; max-width:340px; display:flex; flex-direction:column; gap:10px; }
.main { flex:999 1 620px; min-width:0; display:flex; flex-direction:column; gap:20px; }
.eyebrow { font-family:Inter, system-ui, sans-serif; font-size:12px; font-weight:600; letter-spacing:.07em; text-transform:uppercase; color:#a3abba; }
.theme { display:flex; align-items:center; gap:12px; padding:14px; border-radius:12px; background:#1a1d24; border:1px solid #262b35; }
.theme.sel { background:#1f2430; border-color:var(--c); }
.theme.dim { opacity:.7; }
.theme-pick { flex:1 1 auto; min-width:0; display:flex; align-items:center; gap:12px; padding:0; background:none; border:0; text-align:left; }
.dot { width:12px; height:12px; border-radius:50%; flex:0 0 auto; background:var(--c); }
.toggle { position:relative; flex:0 0 auto; width:46px; height:28px; border-radius:14px; border:0; padding:0; background:#3a4150; transition:background .15s; }
.toggle.on { background:var(--c); }
.toggle span { position:absolute; top:3px; left:3px; width:22px; height:22px; border-radius:50%; background:#fff; transition:left .15s; }
.toggle.on span { left:21px; }
.dashed { display:flex; align-items:center; justify-content:center; gap:8px; min-height:48px; border-radius:12px; border:1px dashed #3a4150; background:transparent; color:#c3c9d4; font-size:14px; }
.dashed:hover { border-color:#596173; color:#e8eaf0; }
.dashed.tall { min-height:120px; border-radius:14px; }
.hint { margin-top:8px; padding:14px; border-radius:12px; background:#161920; border:1px solid #262b35; color:#a3abba; font-size:12px; line-height:1.5; }
.hint strong { color:#e8eaf0; }
.card { padding:20px; border-radius:16px; background:#1a1d24; border:1px solid #262b35; display:flex; flex-direction:column; gap:14px; }
.card.empty { align-items:flex-start; gap:12px; padding:32px; }
.bar { width:6px; height:44px; border-radius:3px; background:var(--c); }
.title { font-size:22px; } .title.sm { font-size:17px; }
.groups { display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:14px; }
.group { display:flex; flex-direction:column; gap:12px; padding:16px; border-radius:14px; background:#1a1d24; border:1px solid #262b35; }
.group.sel { border-color:var(--c); box-shadow:0 0 0 3px color-mix(in srgb, var(--c) 15%, transparent); }
.group-pick { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; align-items:stretch; gap:8px; padding:0; background:none; border:0; text-align:left; }
.badge { padding:3px 8px; border-radius:999px; font-size:11px; font-weight:600; background:#262b35; color:#a3abba; white-space:nowrap; }
.badge.on { background:color-mix(in srgb, var(--c) 20%, transparent); color:var(--c); }
.icon { flex:0 0 auto; width:34px; height:34px; border-radius:8px; border:1px solid #2f3541; background:#20242d; display:flex; align-items:center; justify-content:center; color:#c3c9d4; }
.chip { display:inline-flex; align-items:center; gap:6px; min-height:30px; padding:0 10px; border-radius:999px; border:1px solid #2f3541; background:#20242d; color:#dfe3ea; font-size:12px; }
button.chip:hover { border-color:#4a5262; }
.chip .x { border:0; background:none; color:#a3abba; font-size:15px; padding:0 0 0 2px; line-height:1; }
.cdot { width:8px; height:8px; border-radius:50%; background:#59616f; flex:0 0 auto; }
.cdot.on { background:var(--c, #f59e0b); }
.cdot.na { background:transparent; border:1px dashed #7a8291; }
input { font:inherit; color:#e8eaf0; background:#14171d; border:1px solid #3a4150; border-radius:8px; min-height:38px; padding:0 10px; }
input:focus { outline:2px solid #60a5fa; outline-offset:1px; }
input:disabled { opacity:.5; }
input[type=checkbox] { min-height:auto; width:18px; height:18px; accent-color:var(--c); }
input.short { width:90px; }
.picker { display:flex; flex-direction:column; gap:8px; }
.pick-list { max-height:240px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; }
.pick { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; border:1px solid transparent; background:#14171d; text-align:left; }
.pick:hover { border-color:#3a4150; }
.editor { padding:16px; border-radius:12px; background:#14171d; border:1px solid #2a2f3a; }
.grid3 { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px; }
.span3 { grid-column:1 / -1; }
.field { display:flex; flex-direction:column; gap:8px; }
.swatch { width:30px; height:30px; border-radius:50%; border:2px solid transparent; background:var(--c); }
.swatch.on { border-color:#fff; }
.seg { min-height:34px; padding:0 12px; border-radius:8px; font-size:12px; border:1px solid #3a4150; background:transparent; color:#c3c9d4; }
.seg.on { border-color:var(--c); background:color-mix(in srgb, var(--c) 15%, transparent); color:#fff; }
.seg.danger { border-color:#5b2a2a; color:#fca5a5; }
.step { width:44px; height:44px; border-radius:10px; border:1px solid #3a4150; background:#1d2129; font-size:18px; }
.val { min-width:130px; text-align:center; font-family:"Space Grotesk", Inter, sans-serif; font-size:19px; font-weight:600; }
.day { width:44px; height:40px; border-radius:10px; font-size:12px; font-weight:600; border:1px solid #3a4150; background:transparent; color:#c3c9d4; }
.day.on { border-color:var(--c); background:var(--c); color:#111318; }
.scrollx { overflow-x:auto; }
.grid-wrap { min-width:620px; }
.hours { display:flex; padding-left:44px; color:#a3abba; font-size:11px; }
.hours span { flex:1 1 0; }
.trow { display:flex; align-items:center; height:40px; }
.tday { width:44px; flex:0 0 auto; font-size:12px; font-weight:600; color:#a3abba; }
.tday.today { color:#e8eaf0; }
.track { position:relative; flex:1 1 auto; height:28px; border-radius:8px; cursor:crosshair; touch-action:none; user-select:none;
  background:repeating-linear-gradient(90deg, #20242d 0, #20242d calc(12.5% - 1px), #2a2f3a calc(12.5% - 1px), #2a2f3a 12.5%); }
.sunline { position:absolute; top:0; bottom:0; width:1px; background:rgba(251,191,36,.4); pointer-events:none; }
.now { position:absolute; top:-4px; bottom:-4px; width:2px; border-radius:1px; background:#f87171; pointer-events:none; }
.block { position:absolute; top:2px; bottom:2px; display:flex; align-items:center; overflow:hidden; padding:0; border-radius:6px; font-size:11px; font-weight:600; color:#111318; background:var(--c); border:2px solid var(--c); cursor:pointer; }
.block.sel { border-color:#fff; }
.bl { flex:1 1 auto; min-width:0; padding:0 6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:left; pointer-events:none; }
.h { flex:0 0 auto; width:8px; align-self:stretch; cursor:ew-resize; background:rgba(0,0,0,.18); }
.ghost { position:absolute; top:2px; bottom:2px; border-radius:6px; background:color-mix(in srgb, var(--c) 55%, transparent); border:2px dashed var(--c); color:#111318; font-size:11px; font-weight:600; padding:4px 6px; white-space:nowrap; overflow:hidden; pointer-events:none; }
.legend { display:flex; flex-wrap:wrap; gap:16px; padding:8px 0 0 44px; color:#a3abba; font-size:11px; }
.legend i { display:inline-block; vertical-align:middle; margin-right:4px; }
.lg-now { width:10px; height:2px; background:#f87171; }
.lg-sun { width:1px; height:10px; background:#fbbf24; }
@media (max-width: 700px) {
  .top, .layout { padding-left:16px; padding-right:16px; }
  .nav { max-width:none; }
}
`;

if (!document.getElementById("schaltzentrale-fonts")) {
  // Schriften wie im Entwurf; ohne Internet greifen die Systemschriften
  const link = document.createElement("link");
  link.id = "schaltzentrale-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap";
  document.head.appendChild(link);
}

if (!customElements.get("schaltzentrale-panel")) {
  customElements.define("schaltzentrale-panel", SchaltzentralePanel);
}
