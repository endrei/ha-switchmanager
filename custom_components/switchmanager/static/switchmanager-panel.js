/* SwitchManager panel: themes, groups and weekly plans for switches.
 * Plain web component, no build step. Texts in German and English. */


const I18N = {
  de: {
    locale: "de-DE",
    days: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
    daysLong: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    loading: "Lade SwitchManager …",
    loadError: "SwitchManager konnte nicht geladen werden: {err}",
    tagline: "Wochenpläne für deine Schalter, ohne eine Zeile YAML",
    saving: "Speichern …",
    saved: "Gespeichert",
    error: "Fehler: {err}",
    sunrise: "Aufgang",
    sunset: "Untergang",
    sunriseLong: "Sonnenaufgang",
    sunsetLong: "Sonnenuntergang",
    pause: "Alles pausieren",
    resume: "Pläne fortsetzen",
    themes: "Themen",
    created: "{n} angelegt",
    groupsN: (n) => `${n} ${n === 1 ? "Gruppe" : "Gruppen"}`,
    switchesN: (n) => `${n} Schalter`,
    off: "aus",
    outOfSeason: "außerhalb Saison",
    addTheme: "Thema anlegen",
    howItWorks: "<strong>Aufbau:</strong> Ein Thema (z. B. Weihnachten Außen) enthält Gruppen, jede Gruppe enthält Schalter und hat ihren eigenen Wochenplan. Ist ein Thema aus oder außerhalb seiner Saison, ruhen alle seine Pläne.",
    turnOff: "ausschalten",
    turnOn: "einschalten",
    welcome: "Willkommen im SwitchManager",
    welcomeText: "Lege links dein erstes Thema an, zum Beispiel „Weihnachten Außen“. Darin legst du Gruppen mit deinen Schaltern an und gibst jeder Gruppe einen Wochenplan.",
    firstTheme: "Erstes Thema anlegen",
    yearRound: "ganzjährig",
    season: "Saison",
    allPaused: "Alle Pläne pausiert, es wird nichts geschaltet",
    themeOff: "Ausgeschaltet · Pläne ruhen, die Schalter sind aus",
    seasonRest: "Außerhalb der Saison · Pläne ruhen",
    activeGroups: "Aktiv · {groups}",
    name: "Name",
    color: "Farbe",
    onlyInSeason: "nur in diesem Zeitraum schalten",
    seasonFrom: "Saison von",
    seasonTo: "Saison bis",
    until: "bis",
    datePlaceholderStart: "29.11.",
    datePlaceholderEnd: "06.01.",
    dateFormatError: "Bitte als TT.MM. eingeben",
    done: "Fertig",
    close: "Schließen",
    edit: "Bearbeiten",
    reallyDelete: "Wirklich löschen? Nochmal klicken",
    deleteTheme: "Thema löschen",
    pausedNoSwitching: "Pausiert, keine Schaltungen",
    themeIsOff: "Thema ist aus",
    outOfSeasonLong: "Außerhalb der Saison",
    noWindow: "Kein Zeitfenster geplant",
    today: "heute",
    tomorrow: "morgen",
    nextSwitch: "Nächste Schaltung: {day} {time} {state}",
    stateOn: "an",
    stateOff: "aus",
    tapToToggle: "antippen zum Umschalten",
    unreachable: "nicht erreichbar",
    remove: "{name} entfernen",
    groupName: "Gruppenname",
    planOn: "AN laut Plan",
    planOff: "AUS laut Plan",
    editGroup: "Gruppe bearbeiten",
    noSwitches: "Noch keine Schalter",
    addSwitch: "Schalter hinzufügen",
    reallyDeleteShort: "Wirklich löschen?",
    deleteGroup: "Gruppe löschen",
    searchSwitch: "Schalter suchen, z. B. Krippe",
    searchSwitchLabel: "Schalter suchen",
    nothingFound: "Nichts gefunden.",
    addGroup: "Gruppe anlegen",
    newTheme: "Neues Thema",
    newGroup: "Neue Gruppe",
    adjustDay: "{day} einzeln anpassen",
    timeOn: "Uhrzeit",
    earlier: "Früher",
    later: "Später",
    daily: "täglich",
    weekdays: "Mo–Fr",
    weekend: "Sa–So",
    noDay: "keinen Tag",
    invalidWindow: "Dieses Zeitfenster schaltet heute nicht: Einschalten ({from}, {fromTime}) liegt nach Ausschalten ({to}, {toTime}). Stell Ausschalten später oder Einschalten früher.",
    overnight: "Läuft über Mitternacht: aus am Folgetag um {time}.",
    appliesTo: "Dieses Zeitfenster gilt für <strong>{days}</strong>.",
    appliesToAll: " Änderungen wirken auf alle diese Tage.",
    splitDay: "Nur {day} anders einstellen",
    switchOn: "Einschalten",
    switchOff: "Ausschalten",
    weekdaysTitle: "Wochentage",
    dailyBtn: "Täglich",
    deleteWindow: "Zeitfenster löschen",
    noWindowYet: "Noch kein Zeitfenster. Zieh im Raster mit der Maus über einen Tag oder klick auf „+ Zeitfenster“.",
    weeklyPlan: "Wochenplan",
    gridHelp: "Zieh über einen Tag, um ein Zeitfenster anzulegen. Zieh an den Enden eines Balkens, um ihn zu verschieben. Klick auf einen Balken zum Bearbeiten.",
    window: "Zeitfenster",
    now: "jetzt",
    sunLegend: "Sonnenaufgang / -untergang heute",
    otherLegend: "andere Automation",
    hours: "Stunden",
    minutes: "Minuten",
    offsetLabel: "Minuten vor (−) oder nach (+) {what}",
    timeErrorTo: "Bitte eine Uhrzeit von 00:00 bis 24:00 eingeben.",
    timeErrorFrom: "Bitte eine Uhrzeit von 00:00 bis 23:59 eingeben.",
    offsetError: "Bitte den Versatz in Minuten eingeben, z. B. -15 oder +30 (höchstens 720).",
    rejectFrom: "Geht so nicht: Einschalten wäre {label} ({time}) und damit nach Ausschalten um {other}. Stell zuerst Ausschalten später.",
    rejectTo: "Geht so nicht: Ausschalten wäre {label} ({time}) und damit vor Einschalten um {other}. Stell zuerst Einschalten früher.",
    // conflict check
    check: "Konflikt-Check",
    checkHelp: "Sucht Automationen, Szenen und Skripte, die dieselben Schalter steuern, und vergleicht sie mit deinem Plan.",
    recheck: "Neu prüfen",
    checking: "Prüfe …",
    allClear: "Alles sauber: Keine andere Automation schaltet diese Geräte.",
    lvl: {
      conflict: (n) => `${n} ${n === 1 ? "Konflikt" : "Konflikte"}`,
      warning: (n) => `${n} ${n === 1 ? "Warnung" : "Warnungen"}`,
      duplicate: (n) => `${n} doppelt`,
      info: (n) => `${n} ${n === 1 ? "Hinweis" : "Hinweise"}`,
    },
    lvlName: { conflict: "Konflikt", warning: "Warnung", duplicate: "Doppelt", info: "Hinweis" },
    msg: {
      turns_off_against_plan: "„{name}“ schaltet {switches} {when} aus, obwohl dein Plan dann an vorsieht.",
      turns_on_against_plan: "„{name}“ schaltet {switches} {when} ein, obwohl dein Plan dann aus vorsieht.",
      duplicate: "„{name}“ schaltet {switches} {when} {verb}, genau wie dein Plan. Vermutlich eine alte Automation, die du deaktivieren kannst.",
      toggle: "„{name}“ schaltet {switches} um (Toggle), ausgelöst durch {trigger}. Das kann den Plan durcheinanderbringen.",
      unknown_time: "„{name}“ schaltet {switches} {verb}, ausgelöst durch {trigger}. Wann das passiert, lässt sich nicht vorhersagen.",
      disabled: "„{name}“ steuert {switches} auch, ist aber deaktiviert. Stört nicht.",
      unavailable: "{switches} ist gerade nicht erreichbar und wird beim Schalten übersprungen.",
    },
    whenAt: "um {time} ({days})",
    whenSun: "bei {sun} ({days}, heute {time})",
    verbOn: "ein",
    verbOff: "aus",
    trig: { state: "eine Zustandsänderung", time_pattern: "ein Zeitmuster", time: "eine Uhrzeit-Hilfe", event: "ein Ereignis", device: "ein Gerät", numeric_state: "einen Messwert", homeassistant: "den Start von Home Assistant", "?": "einen unbekannten Auslöser" },
    trigOther: "„{t}“",
    openAutomation: "Öffnen",
    disable: "Deaktivieren",
    checkPill: "Check",
    checkOk: "Check ok",
  },

  en: {
    locale: "en-GB",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    daysLong: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    loading: "Loading SwitchManager …",
    loadError: "Could not load SwitchManager: {err}",
    tagline: "Weekly schedules for your switches, without a line of YAML",
    saving: "Saving …",
    saved: "Saved",
    error: "Error: {err}",
    sunrise: "Sunrise",
    sunset: "Sunset",
    sunriseLong: "sunrise",
    sunsetLong: "sunset",
    pause: "Pause all",
    resume: "Resume schedules",
    themes: "Themes",
    created: "{n} created",
    groupsN: (n) => `${n} ${n === 1 ? "group" : "groups"}`,
    switchesN: (n) => `${n} ${n === 1 ? "switch" : "switches"}`,
    off: "off",
    outOfSeason: "out of season",
    addTheme: "Add theme",
    howItWorks: "<strong>How it works:</strong> A theme (e.g. Christmas outdoor) contains groups. Each group contains switches and has its own weekly plan. When a theme is off or out of season, all its plans rest.",
    turnOff: "turn off",
    turnOn: "turn on",
    welcome: "Welcome to SwitchManager",
    welcomeText: "Create your first theme on the left, for example “Christmas outdoor”. Inside it you add groups with your switches and give each group a weekly plan.",
    firstTheme: "Create first theme",
    yearRound: "all year",
    season: "Season",
    allPaused: "All schedules paused, nothing is switched",
    themeOff: "Turned off · plans rest, the switches are off",
    seasonRest: "Out of season · plans rest",
    activeGroups: "Active · {groups}",
    name: "Name",
    color: "Color",
    onlyInSeason: "only switch during this period",
    seasonFrom: "Season from",
    seasonTo: "Season to",
    until: "to",
    datePlaceholderStart: "29.11.",
    datePlaceholderEnd: "06.01.",
    dateFormatError: "Please enter as DD.MM.",
    done: "Done",
    close: "Close",
    edit: "Edit",
    reallyDelete: "Really delete? Click again",
    deleteTheme: "Delete theme",
    pausedNoSwitching: "Paused, no switching",
    themeIsOff: "Theme is off",
    outOfSeasonLong: "Out of season",
    noWindow: "No time window planned",
    today: "today",
    tomorrow: "tomorrow",
    nextSwitch: "Next switch: {day} {time} {state}",
    stateOn: "on",
    stateOff: "off",
    tapToToggle: "tap to toggle",
    unreachable: "unavailable",
    remove: "Remove {name}",
    groupName: "Group name",
    planOn: "ON by plan",
    planOff: "OFF by plan",
    editGroup: "Edit group",
    noSwitches: "No switches yet",
    addSwitch: "Add switch",
    reallyDeleteShort: "Really delete?",
    deleteGroup: "Delete group",
    searchSwitch: "Search switches, e.g. tree",
    searchSwitchLabel: "Search switches",
    nothingFound: "Nothing found.",
    addGroup: "Add group",
    newTheme: "New theme",
    newGroup: "New group",
    adjustDay: "Adjust {day} on its own",
    timeOn: "Time",
    earlier: "Earlier",
    later: "Later",
    daily: "daily",
    weekdays: "Mon–Fri",
    weekend: "Sat–Sun",
    noDay: "no day",
    invalidWindow: "This window does not switch today: on ({from}, {fromTime}) is after off ({to}, {toTime}). Set off later or on earlier.",
    overnight: "Runs past midnight: off the next day at {time}.",
    appliesTo: "This time window applies to <strong>{days}</strong>.",
    appliesToAll: " Changes affect all these days.",
    splitDay: "Set {day} differently",
    switchOn: "Turn on",
    switchOff: "Turn off",
    weekdaysTitle: "Weekdays",
    dailyBtn: "Daily",
    deleteWindow: "Delete window",
    noWindowYet: "No time window yet. Drag across a day in the grid or click “+ Window”.",
    weeklyPlan: "Weekly plan",
    gridHelp: "Drag across a day to add a time window. Drag the ends of a bar to move it. Click a bar to edit it.",
    window: "Window",
    now: "now",
    sunLegend: "sunrise / sunset today",
    otherLegend: "other automation",
    hours: "Hours",
    minutes: "Minutes",
    offsetLabel: "Minutes before (−) or after (+) {what}",
    timeErrorTo: "Please enter a time from 00:00 to 24:00.",
    timeErrorFrom: "Please enter a time from 00:00 to 23:59.",
    offsetError: "Please enter the offset in minutes, e.g. -15 or +30 (at most 720).",
    rejectFrom: "Not possible: on would be {label} ({time}), which is after off at {other}. Set off later first.",
    rejectTo: "Not possible: off would be {label} ({time}), which is before on at {other}. Set on earlier first.",
    check: "Conflict check",
    checkHelp: "Looks for automations, scenes and scripts that control the same switches and compares them with your plan.",
    recheck: "Check again",
    checking: "Checking …",
    allClear: "All clear: no other automation switches these devices.",
    lvl: {
      conflict: (n) => `${n} ${n === 1 ? "conflict" : "conflicts"}`,
      warning: (n) => `${n} ${n === 1 ? "warning" : "warnings"}`,
      duplicate: (n) => `${n} duplicate`,
      info: (n) => `${n} ${n === 1 ? "note" : "notes"}`,
    },
    lvlName: { conflict: "Conflict", warning: "Warning", duplicate: "Duplicate", info: "Note" },
    msg: {
      turns_off_against_plan: "“{name}” turns {switches} off {when}, while your plan wants it on.",
      turns_on_against_plan: "“{name}” turns {switches} on {when}, while your plan wants it off.",
      duplicate: "“{name}” turns {switches} {verb} {when}, just like your plan. Probably an old automation you can disable.",
      toggle: "“{name}” toggles {switches}, triggered by {trigger}. That can mess up the plan.",
      unknown_time: "“{name}” turns {switches} {verb}, triggered by {trigger}. When that happens cannot be predicted.",
      disabled: "“{name}” also controls {switches}, but is disabled. No problem.",
      unavailable: "{switches} is unavailable right now and is skipped when switching.",
    },
    whenAt: "at {time} ({days})",
    whenSun: "at {sun} ({days}, today {time})",
    verbOn: "on",
    verbOff: "off",
    trig: { state: "a state change", time_pattern: "a time pattern", time: "a date/time helper", event: "an event", device: "a device", numeric_state: "a numeric value", homeassistant: "Home Assistant starting", "?": "an unknown trigger" },
    trigOther: "“{t}”",
    openAutomation: "Open",
    disable: "Disable",
    checkPill: "Check",
    checkOk: "Check ok",
  },
};

function pickLang(hass) {
  const lang = (hass && (hass.locale?.language || hass.language)) || navigator.language || "en";
  return String(lang).toLowerCase().startsWith("de") ? "de" : "en";
}

function fmt(text, vars = {}) {
  return String(text).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}


const COLORS = ["#f59e0b", "#60a5fa", "#c084fc", "#34d399", "#f472b6", "#f87171", "#2dd4bf", "#a3e635"];
const ENTITY_DOMAINS = ["switch", "light", "input_boolean", "fan"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const LEVELS = ["conflict", "warning", "duplicate", "info"];

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

class SwitchManagerPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cfg = null;
    this._status = null;
    this._findings = null;
    this._sel = { theme: null, group: null, win: 0, day: null };
    this._ui = { editTheme: false, editGroup: null, picker: null, confirm: null, saved: "" };
    this._drag = null;
    this._bound = false;
    this._lang = "en";
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    this._lang = pickLang(hass);
    if (first) this._init();
    else this._onStates();
  }
  set narrow(n) { this._narrow = n; if (this._cfg) this._render(); }
  set panel(_p) {}
  set route(_r) {}

  // ---------------------------------------------------------------- texts
  get _L() { return I18N[this._lang] || I18N.en; }
  _t(key, vars) {
    const v = this._L[key] ?? I18N.en[key] ?? key;
    return typeof v === "function" ? v(vars) : fmt(v, vars);
  }
  _days() { return this._L.days; }
  _dayLong(i) { return this._L.daysLong[i]; }
  _dayList(days) {
    const s = [...days].sort().join(",");
    if (days.length === 7) return this._t("daily");
    if (s === "0,1,2,3,4") return this._t("weekdays");
    if (s === "5,6") return this._t("weekend");
    return days.map((x) => this._days()[x]).join(", ") || this._t("noDay");
  }

  connectedCallback() {
    this._clock = setInterval(() => this._softRender(), 60000);
    if (this._hass && !this._unsub && this._cfg) this._subscribe();
  }
  disconnectedCallback() {
    clearInterval(this._clock);
    if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; }
  }

  async _init() {
    this._renderShell(this._t("loading"));
    try {
      const res = await this._hass.callWS({ type: "switchmanager/get" });
      this._apply(res);
      this._subscribe();
      this._runCheck();
    } catch (err) {
      this._renderShell(esc(this._t("loadError", { err: err.message || err })));
    }
  }

  _subscribe() {
    this._unsub = this._hass.connection
      .subscribeMessage((msg) => {
        // only take over the config when nothing is waiting to be saved
        if (!this._saveTimer) this._cfg = msg.config;
        this._status = msg.status;
        this._softRender();
      }, { type: "switchmanager/subscribe" })
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
    const theme = themes.find((t) => t.id === this._sel.theme) || themes[0];
    this._sel.theme = theme ? theme.id : null;
    const group = theme && (theme.groups.find((g) => g.id === this._sel.group) || theme.groups[0]);
    this._sel.group = group ? group.id : null;
    if (!group || this._sel.win >= group.windows.length) this._sel.win = 0;
  }

  get _theme() { return this._cfg.themes.find((t) => t.id === this._sel.theme); }
  get _group() { const t = this._theme; return t && t.groups.find((g) => g.id === this._sel.group); }

  // ---------------------------------------------------------------- saving
  _changed() {
    this._fixSelection();
    this._render();
    clearTimeout(this._saveTimer);
    this._ui.saved = this._t("saving");
    this._paintSaved();
    this._saveTimer = setTimeout(() => this._save(), 500);
  }

  async _save() {
    try {
      const res = await this._hass.callWS({ type: "switchmanager/save", config: this._cfg });
      this._saveTimer = null;
      this._cfg = res.config;
      this._status = res.status;
      this._ui.saved = this._t("saved");
      this._fixSelection();
      this._softRender();
      this._runCheck();
      setTimeout(() => { this._ui.saved = ""; this._paintSaved(); }, 2000);
    } catch (err) {
      this._saveTimer = null;
      this._ui.saved = this._t("error", { err: err.message || err });
      this._paintSaved();
    }
  }

  _paintSaved() {
    const el = this.shadowRoot.querySelector("#saved");
    if (el) el.textContent = this._ui.saved;
  }

  // ---------------------------------------------------------------- conflict check
  async _runCheck() {
    clearTimeout(this._checkTimer);
    this._checkTimer = setTimeout(async () => {
      this._checking = true;
      this._softRender();
      try {
        const res = await this._hass.callWS({ type: "switchmanager/check" });
        this._findings = res.groups || {};
      } catch (_err) {
        this._findings = this._findings || {};
      }
      this._checking = false;
      this._softRender();
    }, 300);
  }

  _groupFindings(gid) { return (this._findings && this._findings[gid]) || []; }

  _counts(findings) {
    const c = { conflict: 0, warning: 0, duplicate: 0, info: 0 };
    findings.forEach((f) => { c[f.level] = (c[f.level] || 0) + 1; });
    return c;
  }

  _worst(findings) {
    for (const l of LEVELS) if (findings.some((f) => f.level === l)) return l;
    return "ok";
  }

  _switchNames(ids) {
    return ids.map((e) => `<strong>${esc(this._hass.states[e]?.attributes?.friendly_name || e)}</strong>`).join(", ");
  }

  _findingText(f) {
    const L = this._L;
    const name = esc(f.automation?.name || "");
    const switches = this._switchNames(f.switches || []);
    const verb = f.verb === "on" ? this._t("verbOn") : f.verb === "off" ? this._t("verbOff") : "";
    let when = "";
    const trig = f.trigger;
    if (trig && (trig.kind === "time" || trig.kind === "sun")) {
      const days = this._dayList(f.days || trig.days || []);
      if (trig.kind === "time") when = this._t("whenAt", { time: trig.label, days });
      else {
        const sun = (trig.event === "sunrise" ? this._t("sunriseLong") : this._t("sunsetLong")) + offLabel(trig.offset);
        when = this._t("whenSun", { sun, days, time: f.hour != null ? hhmm(f.hour) : "?" });
      }
    }
    let trigger = "";
    if (trig) trigger = L.trig[trig.label] || fmt(L.trigOther, { t: esc(trig.label) });
    const tpl = L.msg[f.code] || f.code;
    return fmt(tpl, { name, switches, verb, when: esc(when), trigger });
  }

  _navigate(path) {
    history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  }

  // ---------------------------------------------------------------- time
  get _sun() {
    const s = (this._status && this._status.sun) || {};
    return { sunrise: hoursOf(s.sunrise) ?? 7.5, sunset: hoursOf(s.sunset) ?? 17 };
  }
  _hours(p) {
    if (p.type === "time") return parseHHMM(p.time);
    return (p.type === "sunrise" ? this._sun.sunrise : this._sun.sunset) + (p.offset || 0) / 60;
  }
  // "ok" | "overnight" (on in the evening, off in the morning) | "invalid" (on after off)
  _check(w) {
    const a = this._hours(w.from);
    const b = this._hours(w.to);
    if (b > a) return "ok";
    if (a >= 12 && b < 12) return "overnight";
    return "invalid";
  }
  _label(p) {
    if (p.type === "time") return p.time;
    return (p.type === "sunrise" ? this._t("sunrise") : this._t("sunset")) + offLabel(p.offset);
  }

  // ---------------------------------------------------------------- states
  _onStates() {
    if (!this._cfg || this._drag) return;
    const t = this._theme;
    if (!t) return;
    const sig = t.groups.flatMap((g) => g.entities).map((e) => this._hass.states[e]?.state).join("|");
    if (sig !== this._stateSig) { this._stateSig = sig; this._softRender(); }
    // an automation was switched on/off/added: check again
    const autos = Object.keys(this._hass.states).filter((e) => e.startsWith("automation."))
      .map((e) => e + this._hass.states[e].state).join("|");
    if (this._autoSig !== undefined && autos !== this._autoSig) this._runCheck();
    this._autoSig = autos;
  }

  _softRender() {
    if (!this._cfg || this._drag) return;
    const active = this.shadowRoot.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "SELECT")) return;
    this._render();
  }

  // ---------------------------------------------------------------- rendering
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
    const loc = this._L.locale;
    const date = now.toLocaleDateString(loc, { weekday: "short", day: "numeric", month: "short" });
    const time = now.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
    const paused = this._cfg.paused;
    return `
    <header class="top">
      <div class="brand">
        ${this._narrow ? `<ha-menu-button></ha-menu-button>` : ""}
        <div class="logo">${ICON.power}</div>
        <div><h1>SwitchManager</h1><p class="muted small">${esc(this._t("tagline"))}</p></div>
      </div>
      <div class="row wrap gap10">
        <span id="saved" class="muted small">${esc(this._ui.saved)}</span>
        <span class="pill">${ICON.sun}${esc(date)} · ${esc(time)} · ${esc(this._t("sunrise"))} ${hhmm(this._sun.sunrise)} · ${esc(this._t("sunset"))} ${hhmm(this._sun.sunset)}</span>
        <button class="btn ${paused ? "danger-on" : ""}" data-a="pause">${esc(paused ? this._t("resume") : this._t("pause"))}</button>
      </div>
    </header>`;
  }

  _nav() {
    const themes = this._cfg.themes;
    const list = themes.map((t) => {
      const sel = t.id === this._sel.theme;
      const n = t.groups.reduce((s, g) => s + g.entities.length, 0);
      const st = this._status?.themes?.[t.id];
      let meta = `${this._t("groupsN", t.groups.length)} · ${this._t("switchesN", n)}`;
      if (!t.active) meta += " · " + this._t("off");
      else if (st && !st.in_season) meta += " · " + this._t("outOfSeason");
      const worst = this._worst(t.groups.flatMap((g) => this._groupFindings(g.id)));
      return `
      <div class="theme ${sel ? "sel" : ""} ${t.active ? "" : "dim"}" style="--c:${esc(t.color)}">
        <button class="theme-pick" data-a="pick-theme" data-id="${esc(t.id)}">
          <span class="dot"></span>
          <span class="col"><span class="strong">${esc(t.name)}${worst === "conflict" || worst === "warning" ? ` <span class="lvl-dot ${worst}" title="${esc(this._t("check"))}"></span>` : ""}</span><span class="muted small">${esc(meta)}</span></span>
        </button>
        ${this._toggle("toggle-theme", t.active, t.color, `data-id="${esc(t.id)}"`, t.name)}
      </div>`;
    }).join("");
    return `
    <nav class="nav" aria-label="${esc(this._t("themes"))}">
      <div class="row between"><h2 class="eyebrow">${esc(this._t("themes"))}</h2><span class="muted small">${esc(this._t("created", { n: themes.length }))}</span></div>
      ${list}
      <button class="dashed" data-a="add-theme">${ICON.plus} ${esc(this._t("addTheme"))}</button>
      <div class="hint">${this._t("howItWorks")}</div>
    </nav>`;
  }

  _toggle(action, on, color, attrs, name) {
    return `<button class="toggle ${on ? "on" : ""}" style="--c:${esc(color)}" data-a="${action}" ${attrs} aria-pressed="${on}" aria-label="${esc(name)} ${esc(on ? this._t("turnOff") : this._t("turnOn"))}"><span></span></button>`;
  }

  _main() {
    const t = this._theme;
    if (!t) {
      return `<section class="card empty"><h2>${esc(this._t("welcome"))}</h2>
        <p class="muted">${esc(this._t("welcomeText"))}</p>
        <button class="btn primary" style="--c:#f59e0b" data-a="add-theme">${ICON.plus} ${esc(this._t("firstTheme"))}</button></section>`;
    }
    return this._themeHeader(t) + this._groups(t) + this._schedule(t) + this._checkCard(t);
  }

  _themeHeader(t) {
    const st = this._status?.themes?.[t.id];
    const paused = this._cfg.paused;
    const season = t.season?.enabled ? `${mdToText(t.season.start)} – ${mdToText(t.season.end)}` : this._t("yearRound");
    let line;
    if (paused) line = this._t("allPaused");
    else if (!t.active) line = this._t("themeOff");
    else if (st && !st.in_season) line = this._t("seasonRest");
    else line = this._t("activeGroups", { groups: this._t("groupsN", t.groups.length) });

    const findings = t.groups.flatMap((g) => this._groupFindings(g.id));
    const worst = this._worst(findings);
    const counts = this._counts(findings);
    const checkLabel = this._findings === null ? this._t("checking")
      : worst === "ok" ? this._t("checkOk")
      : LEVELS.filter((l) => counts[l] && l !== "info").map((l) => this._L.lvl[l](counts[l])).join(" · ") || this._t("checkOk");

    let editor = "";
    if (this._ui.editTheme) {
      const confirm = this._ui.confirm === "theme:" + t.id;
      editor = `
      <div class="editor grid3">
        <label class="field"><span class="eyebrow">${esc(this._t("name"))}</span><input data-f="theme-name" value="${esc(t.name)}" maxlength="60"></label>
        <div class="field"><span class="eyebrow">${esc(this._t("color"))}</span><div class="row wrap gap6">
          ${COLORS.map((c) => `<button class="swatch ${c === t.color ? "on" : ""}" style="--c:${c}" data-a="theme-color" data-v="${c}" aria-label="${esc(this._t("color"))} ${c}"></button>`).join("")}
        </div></div>
        <div class="field"><span class="eyebrow">${esc(this._t("season"))}</span>
          <label class="row gap6 small"><input type="checkbox" data-f="season-on" ${t.season?.enabled ? "checked" : ""}> ${esc(this._t("onlyInSeason"))}</label>
          <div class="row gap6">
            <input class="short" data-f="season-start" value="${esc(mdToText(t.season?.start || "11-29"))}" placeholder="${esc(this._t("datePlaceholderStart"))}" aria-label="${esc(this._t("seasonFrom"))}" ${t.season?.enabled ? "" : "disabled"}>
            <span class="muted">${esc(this._t("until"))}</span>
            <input class="short" data-f="season-end" value="${esc(mdToText(t.season?.end || "01-06"))}" placeholder="${esc(this._t("datePlaceholderEnd"))}" aria-label="${esc(this._t("seasonTo"))}" ${t.season?.enabled ? "" : "disabled"}>
          </div>
        </div>
        <div class="row wrap gap6 span3">
          <button class="btn" data-a="edit-theme">${esc(this._t("done"))}</button>
          <button class="btn ghost-danger" data-a="del-theme">${esc(confirm ? this._t("reallyDelete") : this._t("deleteTheme"))}</button>
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
          <button class="pill check-pill ${worst}" data-a="goto-check">${ICON.shield}${esc(checkLabel)}</button>
          <span class="pill">${ICON.cal} ${esc(this._t("season"))} ${esc(season)}</span>
          <button class="btn" data-a="edit-theme">${esc(this._ui.editTheme ? this._t("close") : this._t("edit"))}</button>
        </div>
      </div>
      ${editor}
    </section>`;
  }

  _nextText(gs) {
    if (!gs) return "";
    if (gs.reason === "paused") return this._t("pausedNoSwitching");
    if (gs.reason === "theme_off") return this._t("themeIsOff");
    if (gs.reason === "season") return this._t("outOfSeasonLong");
    if (!gs.next_change) return this._t("noWindow");
    const d = new Date(gs.next_change);
    const today = new Date();
    const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
    let day;
    if (d.toDateString() === today.toDateString()) day = this._t("today");
    else if (d.toDateString() === tomorrow.toDateString()) day = this._t("tomorrow");
    else day = this._dayLong((d.getDay() + 6) % 7);
    const time = d.toLocaleTimeString(this._L.locale, { hour: "2-digit", minute: "2-digit" });
    return this._t("nextSwitch", { day, time, state: gs.next_state ? this._t("stateOn") : this._t("stateOff") });
  }

  _groups(t) {
    const cards = t.groups.map((g) => {
      const sel = g.id === this._sel.group;
      const gs = this._status?.groups?.[g.id];
      const on = gs?.on;
      const editing = this._ui.editGroup === g.id;
      const findings = this._groupFindings(g.id);
      const worst = this._worst(findings);
      const counts = this._counts(findings);
      const chips = g.entities.map((e) => {
        const st = this._hass.states[e];
        const name = st?.attributes?.friendly_name || e;
        const state = st?.state;
        const cls = state === "on" ? "on" : (state === "off" ? "" : "na");
        const title = state === "on" || state === "off" ? `${e} · ${this._t("tapToToggle")}` : `${e} · ${this._t("unreachable")}`;
        const flagged = findings.some((f) => f.level !== "info" && (f.switches || []).includes(e));
        return editing
          ? `<span class="chip"><span class="cdot ${cls}"></span>${esc(name)}<button class="x" data-a="del-entity" data-g="${esc(g.id)}" data-e="${esc(e)}" aria-label="${esc(this._t("remove", { name }))}">×</button></span>`
          : `<button class="chip ${flagged ? "flag" : ""}" data-a="flip" data-e="${esc(e)}" title="${esc(title)}"><span class="cdot ${cls}"></span>${esc(name)}${flagged ? ICON.alert : ""}</button>`;
      }).join("");
      const confirm = this._ui.confirm === "group:" + g.id;
      const checkLine = worst === "conflict" || worst === "warning" || worst === "duplicate"
        ? `<button class="mini-check ${worst}" data-a="goto-check" data-id="${esc(g.id)}">${ICON.shield}${esc(LEVELS.filter((l) => counts[l] && l !== "info").map((l) => this._L.lvl[l](counts[l])).join(" · "))}</button>`
        : "";
      const top = editing
        ? `<input class="grow" data-f="group-name" data-g="${esc(g.id)}" value="${esc(g.name)}" maxlength="60" aria-label="${esc(this._t("groupName"))}">`
        : `<button class="group-pick" data-a="pick-group" data-id="${esc(g.id)}">
             <span class="row between gap8"><span class="strong big">${esc(g.name)}</span><span class="badge ${on ? "on" : ""}">${esc(on ? this._t("planOn") : this._t("planOff"))}</span></span>
             <span class="muted small">${esc(this._nextText(gs))}</span>
           </button>`;
      return `
      <div class="group ${sel ? "sel" : ""}">
        <div class="row gap8 start">${top}
          <button class="icon" data-a="edit-group" data-id="${esc(g.id)}" aria-label="${esc(editing ? this._t("done") : this._t("editGroup"))}">${editing ? ICON.check : ICON.edit}</button>
        </div>
        <div class="row wrap gap6">${chips || `<span class="muted small">${esc(this._t("noSwitches"))}</span>`}</div>
        ${checkLine}
        ${editing ? `
          <div class="row wrap gap6">
            <button class="btn small-btn" data-a="open-picker" data-g="${esc(g.id)}">${ICON.plus} ${esc(this._t("addSwitch"))}</button>
            <button class="btn small-btn ghost-danger" data-a="del-group" data-id="${esc(g.id)}">${esc(confirm ? this._t("reallyDeleteShort") : this._t("deleteGroup"))}</button>
          </div>
          ${this._ui.picker === g.id ? `<div class="picker"><input id="pick-q" placeholder="${esc(this._t("searchSwitch"))}" aria-label="${esc(this._t("searchSwitchLabel"))}"><div id="pick-list" class="pick-list"></div></div>` : ""}
        ` : ""}
      </div>`;
    }).join("");
    return `<section class="groups" aria-label="Groups" style="--c:${esc(t.color)}">${cards}
      <button class="dashed tall" data-a="add-group">${ICON.plus} ${esc(this._t("addGroup"))}</button></section>`;
  }

  _schedule(t) {
    const g = this._group;
    if (!g) return "";
    const days = this._days();
    // markers of other automations (time and sun triggers) on the grid
    const markers = this._groupFindings(g.id).filter((f) => f.hour != null && f.level !== "info");
    const rows = days.map((day, di) => {
      const blocks = [];
      g.windows.forEach((w, wi) => {
        const a = this._hours(w.from);
        const b = this._hours(w.to);
        const sel = wi === this._sel.win;
        const label = `${this._label(w.from)} – ${this._label(w.to)}`;
        const aria = `${this._dayLong(di)}: ${label}`;
        const block = (from, to, l, r, startDay) =>
          `<button class="block ${sel ? "sel" : ""} ${sel && this._sel.day === startDay ? "selday" : ""}" data-a="pick-win" data-w="${wi}" data-day="${startDay}" aria-label="${esc(aria)}" style="left:${pct(from)};width:${pct(Math.max(0.1, to - from))}">${
            l ? `<span class="h h-l" data-w="${wi}" data-side="from"></span>` : ""}<span class="bl">${to - from > 3 ? esc(label) : ""}</span>${
            r ? `<span class="h h-r" data-w="${wi}" data-side="to"></span>` : ""}</button>`;
        const check = this._check(w);
        if (check === "ok") {
          if (w.days.includes(di)) blocks.push(block(a, b, true, true, di));
        } else if (check === "overnight") {
          // past midnight: evening on the day itself, the rest on the next day
          if (w.days.includes(di)) blocks.push(block(a, 24, true, false, di));
          const prev = (di + 6) % 7;
          if (w.days.includes(prev)) blocks.push(block(0, b, false, true, prev));
        }
      });
      const marks = markers.filter((f) => (f.days || []).includes(di)).map((f) =>
        `<span class="mark ${f.level}" style="left:${pct(f.hour)}" title="${esc(this._findingText(f).replace(/<[^>]+>/g, ""))}"></span>`).join("");
      const today = (new Date().getDay() + 6) % 7 === di;
      const now = new Date();
      const nowH = now.getHours() + now.getMinutes() / 60;
      return `
      <div class="trow">
        <button class="tday ${today ? "today" : ""} ${this._sel.day === di ? "on" : ""}" data-a="pick-day" data-v="${di}" title="${esc(this._t("adjustDay", { day: this._dayLong(di) }))}">${day}</button>
        <div class="track" data-day="${di}">
          <span class="sunline" style="left:${pct(this._sun.sunrise)}"></span>
          <span class="sunline" style="left:${pct(this._sun.sunset)}"></span>
          ${blocks.join("")}
          ${marks}
          ${today ? `<span class="now" style="left:${pct(nowH)}"></span>` : ""}
        </div>
      </div>`;
    }).join("");

    const w = g.windows[this._sel.win];
    let editor = "";
    if (w) {
      const types = (side) => [["time", this._t("timeOn")], ["sunrise", this._t("sunrise")], ["sunset", this._t("sunset")]]
        .map(([k, l]) => `<button class="seg ${w[side].type === k ? "on" : ""}" data-a="set-type" data-side="${side}" data-v="${k}">${esc(l)}</button>`).join("");
      const stepper = (side) => `
        <div class="row gap8">
          <button class="step" data-a="step" data-side="${side}" data-v="-1" aria-label="${esc(this._t("earlier"))}">−</button>
          ${this._valueBox(w[side], side)}
          <button class="step" data-a="step" data-side="${side}" data-v="1" aria-label="${esc(this._t("later"))}">+</button>
        </div>`;
      const day = this._sel.day;
      const canSplit = day !== null && day !== undefined && w.days.length > 1 && w.days.includes(day);
      const check = this._check(w);
      let note = "";
      if (this._ui.warn) note = `<div class="note warn" role="alert">${esc(this._ui.warn)}</div>`;
      else if (check === "invalid") note = `<div class="note warn" role="alert">${esc(this._t("invalidWindow", { from: this._label(w.from), fromTime: hhmm(this._hours(w.from)), to: this._label(w.to), toTime: hhmm(this._hours(w.to)) }))}</div>`;
      else if (check === "overnight") note = `<div class="note">${esc(this._t("overnight", { time: hhmm(this._hours(w.to)) }))}</div>`;
      editor = `
      <div class="editor grid3">
        <div class="row between wrap gap10 span3">
          <span class="small">${this._t("appliesTo", { days: esc(this._dayList(w.days)) })}${canSplit ? esc(this._t("appliesToAll")) : ""}</span>
          ${canSplit ? `<button class="btn small-btn" data-a="split" data-v="${day}">${esc(this._t("splitDay", { day: this._dayLong(day) }))}</button>` : ""}
        </div>
        ${note ? `<div class="span3">${note}</div>` : ""}
        <div class="field"><span class="eyebrow">${esc(this._t("switchOn"))}</span><div class="row wrap gap6">${types("from")}</div>${stepper("from")}</div>
        <div class="field"><span class="eyebrow">${esc(this._t("switchOff"))}</span><div class="row wrap gap6">${types("to")}</div>${stepper("to")}</div>
        <div class="field"><span class="eyebrow">${esc(this._t("weekdaysTitle"))}</span>
          <div class="row wrap gap6">${days.map((d, di) => `<button class="day ${w.days.includes(di) ? "on" : ""}" data-a="day" data-v="${di}" aria-pressed="${w.days.includes(di)}">${d}</button>`).join("")}</div>
          <div class="row wrap gap6">
            <button class="seg" data-a="preset" data-v="work">${esc(this._t("weekdays"))}</button>
            <button class="seg" data-a="preset" data-v="weekend">${esc(this._t("weekend"))}</button>
            <button class="seg" data-a="preset" data-v="all">${esc(this._t("dailyBtn"))}</button>
            <button class="seg danger" data-a="del-win">${esc(this._t("deleteWindow"))}</button>
          </div>
        </div>
      </div>`;
    } else {
      editor = `<p class="muted small">${esc(this._t("noWindowYet"))}</p>`;
    }

    return `
    <section class="card" style="--c:${esc(t.color)}" aria-label="${esc(this._t("weeklyPlan"))}">
      <div class="row between wrap gap10">
        <div><h3 class="title sm">${esc(this._t("weeklyPlan"))} · ${esc(g.name)}</h3>
          <p class="muted small">${esc(this._t("gridHelp"))}</p></div>
        <button class="btn primary" data-a="add-win">${ICON.plus} ${esc(this._t("window"))}</button>
      </div>
      <div class="scrollx"><div class="grid-wrap">
        <div class="hours">${["0", "3", "6", "9", "12", "15", "18", "21"].map((h) => `<span>${h}</span>`).join("")}</div>
        ${rows}
        <div class="legend"><span><i class="lg-now"></i> ${esc(this._t("now"))}</span><span><i class="lg-sun"></i> ${esc(this._t("sunLegend"))}</span>${markers.length ? `<span><i class="lg-mark"></i> ${esc(this._t("otherLegend"))}</span>` : ""}</div>
      </div></div>
      ${editor}
    </section>`;
  }

  _checkCard(t) {
    const g = this._group;
    if (!g) return "";
    const findings = this._groupFindings(g.id);
    const counts = this._counts(findings);
    const worst = this._worst(findings);
    let body;
    if (this._findings === null) body = `<p class="muted small">${esc(this._t("checking"))}</p>`;
    else if (!findings.length) body = `<div class="ok-line">${ICON.check} ${esc(this._t("allClear"))}</div>`;
    else {
      body = `<ul class="findings">${findings.map((f, i) => {
        const a = f.automation;
        const actions = a ? `
          <div class="row gap6 wrap">
            <button class="btn small-btn" data-a="open-auto" data-v="${esc(a.edit_id || "")}">${esc(this._t("openAutomation"))}</button>
            ${a.enabled && f.level !== "info" ? `<button class="btn small-btn" data-a="disable-auto" data-v="${esc(a.entity_id)}">${esc(this._t("disable"))}</button>` : ""}
          </div>` : "";
        return `<li class="finding ${f.level}">
          <span class="lvl ${f.level}">${esc(this._L.lvlName[f.level])}</span>
          <div class="col grow"><span class="ftext">${this._findingText(f)}</span></div>
          ${actions}
        </li>`;
      }).join("")}</ul>`;
    }
    const summary = findings.length
      ? LEVELS.filter((l) => counts[l]).map((l) => this._L.lvl[l](counts[l])).join(" · ")
      : "";
    return `
    <section class="card" id="check" style="--c:${esc(t.color)}" aria-label="${esc(this._t("check"))}">
      <div class="row between wrap gap10">
        <div class="row gap12"><span class="light ${this._findings === null ? "busy" : worst}"></span>
          <div><h3 class="title sm">${esc(this._t("check"))} · ${esc(g.name)}</h3>
          <p class="muted small">${esc(summary || this._t("checkHelp"))}</p></div></div>
        <button class="btn" data-a="recheck">${esc(this._checking ? this._t("checking") : this._t("recheck"))}</button>
      </div>
      ${body}
    </section>`;
  }

  // ---------------------------------------------------------------- picker
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
      .sort((a, b) => a.name.localeCompare(b.name, this._lang))
      .slice(0, 40);
    list.innerHTML = items.length
      ? items.map((s) => `<button class="pick" data-a="add-entity" data-g="${esc(g.id)}" data-e="${esc(s.id)}"><span class="cdot ${s.state === "on" ? "on" : s.state === "off" ? "" : "na"}"></span><span class="col"><span>${esc(s.name)}</span><span class="muted tiny">${esc(s.id)}</span></span></button>`).join("")
      : `<p class="muted small pad">${esc(this._t("nothingFound"))}</p>`;
    if (input.value !== (this._ui.pickQ || "")) input.value = this._ui.pickQ || "";
  }

  // ---------------------------------------------------------------- events
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
      const tp = ev.target.dataset.tp;
      if (tp === "hh" || tp === "mm") ev.target.value = ev.target.value.replace(/\D/g, "");
      // after two digits of the hour, jump to the minutes
      if (tp === "hh" && ev.target.value.length === 2) {
        const mm = ev.target.parentElement.querySelector('[data-tp="mm"]');
        if (mm) { mm.focus(); mm.select(); }
      }
    });
    root.addEventListener("focusin", (ev) => { if (ev.target.dataset?.tp) ev.target.select(); });
    root.addEventListener("focusout", (ev) => {
      const el = ev.target;
      if (!el.dataset?.tp) return;
      const box = el.closest(".timebox");
      if (ev.relatedTarget && box && box.contains(ev.relatedTarget)) return;  // hour -> minute
      setTimeout(() => this._commitTime(el.dataset.side), 0);
    });
    root.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && ev.target.tagName === "INPUT" && (ev.target.dataset.f || ev.target.dataset.tp)) ev.target.blur();
      if (ev.key === "Escape" && ev.target.dataset?.tp) { ev.target.blur(); }
    });
    root.addEventListener("pointerdown", (ev) => this._dragStart(ev));
  }

  _action(a, d) {
    const cfg = this._cfg;
    const t = this._theme;
    const g = this._group;
    const w = g && g.windows[this._sel.win];
    if (a !== "del-theme" && a !== "del-group") this._ui.confirm = null;
    this._ui.warn = null;
    switch (a) {
      case "pause": cfg.paused = !cfg.paused; return this._changed();
      case "pick-theme":
        this._sel = { theme: d.id, group: null, win: 0, day: null };
        this._ui.editTheme = false; this._ui.editGroup = null; this._ui.picker = null;
        this._fixSelection(); return this._render();
      case "toggle-theme": {
        const x = cfg.themes.find((y) => y.id === d.id); x.active = !x.active; return this._changed();
      }
      case "add-theme": {
        const color = COLORS[cfg.themes.length % COLORS.length];
        const theme = { id: newId(), name: this._t("newTheme"), color, active: true, season: { enabled: false, start: "11-29", end: "01-06" }, groups: [{ id: newId(), name: this._t("newGroup"), entities: [], windows: [] }] };
        cfg.themes.push(theme);
        this._sel = { theme: theme.id, group: theme.groups[0].id, win: 0, day: null };
        this._ui.editTheme = true;
        return this._changed();
      }
      case "edit-theme": this._ui.editTheme = !this._ui.editTheme; return this._render();
      case "theme-color": t.color = d.v; return this._changed();
      case "del-theme":
        if (this._ui.confirm !== "theme:" + t.id) { this._ui.confirm = "theme:" + t.id; return this._render(); }
        cfg.themes = cfg.themes.filter((x) => x.id !== t.id);
        this._ui.confirm = null; this._ui.editTheme = false; this._sel = { theme: null, group: null, win: 0, day: null };
        return this._changed();
      case "pick-group": this._sel.group = d.id; this._sel.win = 0; return this._render();
      case "add-group": {
        const group = { id: newId(), name: this._t("newGroup"), entities: [], windows: [] };
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
      case "goto-check": {
        if (d.id) { this._sel.group = d.id; this._sel.win = 0; this._render(); }
        this.shadowRoot.querySelector("#check")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      case "recheck": return this._runCheck();
      case "open-auto": return this._navigate(d.v ? `/config/automation/edit/${encodeURIComponent(d.v)}` : "/config/automation/dashboard");
      case "disable-auto":
        this._hass.callService("automation", "turn_off", { entity_id: d.v }).then(() => this._runCheck());
        return;
      case "pick-win": this._sel.win = Number(d.w); this._sel.day = Number(d.day); return this._render();
      case "pick-day": {
        const v = Number(d.v);
        this._sel.day = this._sel.day === v ? null : v;
        // select the first bar of that day
        const idx = g ? g.windows.findIndex((x) => x.days.includes(v)) : -1;
        if (this._sel.day !== null && idx >= 0) this._sel.win = idx;
        return this._render();
      }
      case "split": {
        if (!w) return;
        const v = Number(d.v);
        const copy = JSON.parse(JSON.stringify(w));
        w.days = w.days.filter((x) => x !== v);
        copy.days = [v];
        g.windows.splice(this._sel.win + 1, 0, copy);
        this._sel.win = this._sel.win + 1;
        return this._changed();
      }
      case "add-win": {
        g.windows.push({ days: ALL_DAYS.slice(), from: { type: "sunset", offset: 0, time: "00:00" }, to: { type: "time", time: "22:00", offset: 0 } });
        this._sel.win = g.windows.length - 1; return this._changed();
      }
      case "del-win": if (!w) return; g.windows.splice(this._sel.win, 1); this._sel.win = 0; return this._changed();
      case "set-type": {
        if (!w || w[d.side].type === d.v) return;
        const h = this._hours(w[d.side]);
        const next = d.v === "time" ? { type: "time", time: hhmm(Math.round(h * 4) / 4), offset: 0 } : { type: d.v, offset: 0, time: "00:00" };
        return this._tryPoint(w, d.side, next);
      }
      case "step": {
        if (!w) return;
        const p = { ...w[d.side] }; const dir = Number(d.v);
        if (p.type === "time") {
          // exactly 15 minutes, also from odd times like 04:48
          const mins = clamp(Math.round(parseHHMM(p.time) * 60) + dir * 15, 0, d.side === "to" ? 1440 : 1439);
          p.time = String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
        } else p.offset = clamp((p.offset || 0) + dir * 5, -720, 720);
        return this._tryPoint(w, d.side, p);
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

  // time as two inputs (hours, minutes); sun times as an offset in minutes
  _valueBox(p, side) {
    const what = side === "from" ? this._t("switchOn") : this._t("switchOff");
    if (p.type === "time") {
      const [hh, mm] = String(p.time || "00:00").split(":");
      return `<span class="val timebox" data-side="${side}">` +
        `<input class="tp" data-tp="hh" data-side="${side}" value="${esc(hh)}" inputmode="numeric" maxlength="2" aria-label="${esc(this._t("hours"))} ${esc(what)}">:` +
        `<input class="tp" data-tp="mm" data-side="${side}" value="${esc(mm)}" inputmode="numeric" maxlength="2" aria-label="${esc(this._t("minutes"))} ${esc(what)}"></span>`;
    }
    const off = p.offset || 0;
    const sunName = p.type === "sunrise" ? this._t("sunrise") : this._t("sunset");
    return `<span class="val timebox" data-side="${side}"><span class="sunname">${esc(sunName)}</span>` +
      `<input class="tp off" data-tp="off" data-side="${side}" value="${off > 0 ? "+" + off : off}" inputmode="numeric" maxlength="4" aria-label="${esc(this._t("offsetLabel", { what: p.type === "sunrise" ? this._t("sunriseLong") : this._t("sunsetLong") }))}"><span class="small muted">min</span></span>`;
  }

  // take over a typed time once the pair of fields is left
  _commitTime(side) {
    const w = this._group && this._group.windows[this._sel.win];
    if (!w) return;
    const box = this.shadowRoot.querySelector(`.timebox[data-side="${side}"]`);
    if (!box) return;
    const val = (tp) => box.querySelector(`[data-tp="${tp}"]`)?.value.trim();
    const p = w[side];
    let next;
    if (p.type === "time") {
      const h = Number(val("hh"));
      const m = Number(val("mm") || 0);
      const maxH = side === "to" ? 24 : 23;
      if (!/^\d{1,2}$/.test(val("hh")) || !/^\d{0,2}$/.test(val("mm") || "") || h > maxH || m > 59 || (h === 24 && m > 0)) {
        this._ui.warn = side === "to" ? this._t("timeErrorTo") : this._t("timeErrorFrom");
        return this._render();
      }
      next = { ...p, time: String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") };
      if (next.time === p.time) return this._render();
    } else {
      const raw = (val("off") || "0").replace("−", "-");
      if (!/^[+-]?\d{1,3}$/.test(raw) || Math.abs(Number(raw)) > 720) {
        this._ui.warn = this._t("offsetError");
        return this._render();
      }
      next = { ...p, offset: Number(raw) };
      if (next.offset === (p.offset || 0)) return this._render();
    }
    this._ui.warn = null;
    return this._tryPoint(w, side, next);
  }

  // only accept a point when on does not end up after off
  _tryPoint(w, side, point) {
    const test = { ...w, [side]: point };
    if (this._check(test) === "invalid" && this._check(w) !== "invalid") {
      const a = this._hours(test.from);
      const b = this._hours(test.to);
      this._ui.warn = side === "from"
        ? this._t("rejectFrom", { label: this._label(test.from), time: hhmm(a), other: hhmm(b) })
        : this._t("rejectTo", { label: this._label(test.to), time: hhmm(b), other: hhmm(a) });
      return this._render();
    }
    w[side] = point;
    return this._changed();
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
      if (!md) { el.setCustomValidity(this._t("dateFormatError")); el.reportValidity(); return; }
      el.setCustomValidity("");
      t.season = { ...(t.season || {}), [f === "season-start" ? "start" : "end"]: md };
      this._changed();
    }
  }

  // ---------------------------------------------------------------- dragging
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
    const p = { ...w[d.side] };
    if (p.type === "time") p.time = hhmm(d.side === "from" ? Math.min(d.h, 23.75) : d.h);
    else {
      const base = p.type === "sunrise" ? this._sun.sunrise : this._sun.sunset;
      p.offset = clamp(Math.round(((d.h - base) * 60) / 5) * 5, -720, 720);
    }
    this._suppressClick = true;
    setTimeout(() => { this._suppressClick = false; }, 0);
    this._ui.warn = null;
    this._tryPoint(w, d.side, p);
  }
}

const ICON = {
  power: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v2"/><path d="M5.6 5.6l1.4 1.4"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="M17 7l1.4-1.4"/><path d="M7 16a5 5 0 0 1 10 0"/><path d="M3 20h18"/></svg>`,
  cal: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>`,
  plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>`,
  shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
  alert: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>`,
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
button.tday { height:32px; margin-right:6px; width:38px; padding:0; border-radius:8px; border:1px solid transparent; background:none; text-align:center; }
button.tday:hover { border-color:#3a4150; }
button.tday.on { border-color:var(--c); color:#fff; background:color-mix(in srgb, var(--c) 15%, transparent); }
.block.selday { box-shadow:0 0 0 2px #111318, 0 0 0 4px #fff; }
.timebox { display:inline-flex; align-items:center; justify-content:center; gap:2px; }
.tp { width:44px; min-height:40px; padding:0; text-align:center; font-family:"Space Grotesk", Inter, sans-serif; font-size:19px; font-weight:600; color:#e8eaf0; background:transparent; border:1px solid transparent; border-radius:8px; cursor:text; }
.tp:hover { border-color:#3a4150; background:#14171d; }
.tp:focus { background:#14171d; border-color:#60a5fa; outline:none; }
.tp.off { width:54px; font-size:17px; }
.sunname { margin-right:2px; font-family:"Space Grotesk", Inter, sans-serif; font-size:15px; font-weight:600; }
.note { padding:10px 12px; border-radius:8px; font-size:13px; background:#1d2129; border:1px solid #2f3541; color:#c3c9d4; }
.note.warn { background:#3b1d1d; border-color:#7f1d1d; color:#fecaca; }
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
.lvl-dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-left:4px; vertical-align:middle; }
.lvl-dot.conflict { background:#f87171; } .lvl-dot.warning { background:#fbbf24; }
.check-pill { cursor:pointer; }
.check-pill.ok, .check-pill.undefined, .check-pill.null { border-color:#1f4d3a; color:#86efac; }
.check-pill.conflict { border-color:#7f1d1d; background:#3b1d1d; color:#fecaca; }
.check-pill.warning { border-color:#78531a; background:#33270f; color:#fde68a; }
.check-pill.duplicate { border-color:#1e3a5f; background:#14243a; color:#bfdbfe; }
.check-pill.info { border-color:#2f3541; color:#c3c9d4; }
.mini-check { display:inline-flex; align-items:center; gap:6px; align-self:flex-start; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:600; border:1px solid #2f3541; background:#20242d; color:#c3c9d4; }
.mini-check.conflict { border-color:#7f1d1d; background:#3b1d1d; color:#fecaca; }
.mini-check.warning { border-color:#78531a; background:#33270f; color:#fde68a; }
.mini-check.duplicate { border-color:#1e3a5f; background:#14243a; color:#bfdbfe; }
.chip.flag { border-color:#78531a; }
.mark { position:absolute; top:-3px; bottom:-3px; width:4px; margin-left:-2px; border-radius:2px; z-index:2; pointer-events:auto; box-shadow:0 0 0 1px #111318; }
.mark.conflict { background:#f87171; } .mark.warning { background:#fbbf24; } .mark.duplicate { background:#60a5fa; }
.lg-mark { width:4px; height:10px; border-radius:2px; background:#f87171; }
.light { width:14px; height:14px; border-radius:50%; flex:0 0 auto; background:#34d399; box-shadow:0 0 10px rgba(52,211,153,.6); }
.light.conflict { background:#f87171; box-shadow:0 0 10px rgba(248,113,113,.7); }
.light.warning { background:#fbbf24; box-shadow:0 0 10px rgba(251,191,36,.6); }
.light.duplicate { background:#60a5fa; box-shadow:0 0 10px rgba(96,165,250,.6); }
.light.info { background:#a3abba; box-shadow:none; }
.light.busy { background:#596173; box-shadow:none; animation:pulse 1s ease-in-out infinite alternate; }
@keyframes pulse { from { opacity:.4; } to { opacity:1; } }
.findings { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.finding { display:flex; flex-wrap:wrap; align-items:center; gap:12px; padding:12px 14px; border-radius:10px; background:#14171d; border:1px solid #2a2f3a; border-left:4px solid #59616f; }
.finding.conflict { border-left-color:#f87171; } .finding.warning { border-left-color:#fbbf24; }
.finding.duplicate { border-left-color:#60a5fa; } .finding.info { border-left-color:#59616f; }
.lvl { flex:0 0 auto; min-width:78px; text-align:center; padding:3px 8px; border-radius:999px; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; background:#262b35; color:#a3abba; }
.lvl.conflict { background:#3b1d1d; color:#fecaca; } .lvl.warning { background:#33270f; color:#fde68a; }
.lvl.duplicate { background:#14243a; color:#bfdbfe; }
.finding > .col { flex:1 1 320px; }
.finding > .row { flex:0 0 auto; margin-left:auto; }
.ftext { font-size:13px; line-height:1.5; color:#c3c9d4; } .ftext strong { color:#e8eaf0; }
.ok-line { display:flex; align-items:center; gap:8px; padding:12px 14px; border-radius:10px; background:#12241c; border:1px solid #1f4d3a; color:#86efac; font-size:13px; }
@media (max-width: 700px) {
  .top, .layout { padding-left:16px; padding-right:16px; }
  .nav { max-width:none; }
  .finding .row { width:100%; }
}
`;

if (!document.getElementById("switchmanager-fonts")) {
  // Fonts as in the design; without internet the system fonts are used
  const link = document.createElement("link");
  link.id = "switchmanager-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap";
  document.head.appendChild(link);
}

if (!customElements.get("switchmanager-panel")) {
  customElements.define("switchmanager-panel", SwitchManagerPanel);
}
