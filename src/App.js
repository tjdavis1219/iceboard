import { useState, Fragment, useMemo, useEffect } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const SCHOOLS = ["Williams College","Middlebury College","Trinity College","Bowdoin College","Hamilton College","Colby College","Amherst College","Wesleyan University","Tufts University","Bates College","Connecticut College"];
const DIMS = ["skating","skill","size","sense","spirit"];
const DIM_LABELS = { skating:"Skating", skill:"Skill", size:"Size/Strength", sense:"Sense", spirit:"Spirit" };
const COLUMNS = [
  { key:"identified",  label:"Identified",            color:"#7F96B7" },
  { key:"contacted",   label:"Contact Made",          color:"#00AEEF" },
  { key:"building",    label:"Building Relationship", color:"#FFC20E" },
  { key:"offer",       label:"Offer Extended",        color:"#22C7A9" },
];
const C = {
  bg:"#061A33", surface:"#0A2346", card:"#102E57", border:"#1D4370",
  accent:"#00AEEF", gold:"#FFC20E", green:"#22C7A9", red:"#F25F5C",
  purple:"#8B7CFF", text:"#F5FAFF", muted:"#8EA8C8",
};

const SCHOOL_THEMES = {
  default: {
    colors: { bg:"#061A33", surface:"#0A2346", card:"#102E57", border:"#1D4370", accent:"#00AEEF", gold:"#FFC20E", green:"#22C7A9", red:"#F25F5C", purple:"#8B7CFF", text:"#F5FAFF", muted:"#8EA8C8" },
    pipeline: { identified:"#7F96B7", contacted:"#00AEEF", building:"#FFC20E", offer:"#22C7A9" },
  },
  "Williams College": {
    colors: { bg:"#1E0F3F", surface:"#2A1660", card:"#35207A", border:"#5A44A1", accent:"#FFB81C", gold:"#FFB81C", green:"#22C7A9", red:"#E76F51", purple:"#9B8CE4", text:"#F8F5FF", muted:"#C9BFE8" },
    pipeline: { identified:"#B8A9E6", contacted:"#9B8CE4", building:"#FFB81C", offer:"#22C7A9" },
  },
  "Middlebury College": {
    colors: { bg:"#071D3A", surface:"#0A2A52", card:"#103B6F", border:"#215488", accent:"#6EC1FF", gold:"#F9D65A", green:"#27C4A8", red:"#F46A6A", purple:"#8FA4FF", text:"#F3F9FF", muted:"#9CB9D7" },
    pipeline: { identified:"#90A9C8", contacted:"#6EC1FF", building:"#F9D65A", offer:"#27C4A8" },
  },
  "Trinity College": {
    colors: { bg:"#071527", surface:"#0B213A", card:"#123050", border:"#23456D", accent:"#64B5FF", gold:"#D9B24C", green:"#1FC0A5", red:"#E76B6B", purple:"#8C9BFF", text:"#F2F8FF", muted:"#9FB1C8" },
    pipeline: { identified:"#8AA0BE", contacted:"#64B5FF", building:"#D9B24C", offer:"#1FC0A5" },
  },
  "Bowdoin College": {
    colors: { bg:"#1A1010", surface:"#251616", card:"#322020", border:"#5A3A3A", accent:"#D34A4A", gold:"#E2C98B", green:"#2BB8A0", red:"#E45757", purple:"#A58CFF", text:"#FFF7F7", muted:"#C9A8A8" },
    pipeline: { identified:"#A49191", contacted:"#D34A4A", building:"#E2C98B", offer:"#2BB8A0" },
  },
  "Hamilton College": {
    colors: { bg:"#0A1630", surface:"#102243", card:"#16315A", border:"#294A74", accent:"#CFAE4D", gold:"#CFAE4D", green:"#25C3A8", red:"#E66B6B", purple:"#8FA0FF", text:"#F5FAFF", muted:"#A6B7D0" },
    pipeline: { identified:"#93A5C0", contacted:"#71A6FF", building:"#CFAE4D", offer:"#25C3A8" },
  },
  "Colby College": {
    colors: { bg:"#07172F", surface:"#0B2448", card:"#11345F", border:"#214D79", accent:"#74A9FF", gold:"#E4C65A", green:"#25C4A9", red:"#EC6D6D", purple:"#8FA0FF", text:"#F4F9FF", muted:"#9DB4D3" },
    pipeline: { identified:"#90A7C6", contacted:"#74A9FF", building:"#E4C65A", offer:"#25C4A9" },
  },
  "Amherst College": {
    colors: { bg:"#1A1132", surface:"#251A47", card:"#30235E", border:"#4C3A80", accent:"#9E86FF", gold:"#F2CC5C", green:"#2AC4AB", red:"#E86E76", purple:"#B09BFF", text:"#F8F5FF", muted:"#BEB1D9" },
    pipeline: { identified:"#A79ABF", contacted:"#9E86FF", building:"#F2CC5C", offer:"#2AC4AB" },
  },
  "Wesleyan University": {
    colors: { bg:"#2A111C", surface:"#3A1726", card:"#4A1F31", border:"#70405A", accent:"#C9557B", gold:"#EACB62", green:"#2AC3A7", red:"#DF5F76", purple:"#B08BFF", text:"#FFF6FA", muted:"#D4A9B9" },
    pipeline: { identified:"#B59AA4", contacted:"#C9557B", building:"#EACB62", offer:"#2AC3A7" },
  },
  "Tufts University": {
    colors: { bg:"#0B1730", surface:"#12244A", card:"#1A3566", border:"#325687", accent:"#66B7FF", gold:"#F0D06A", green:"#2CC7AB", red:"#F07070", purple:"#95A6FF", text:"#F4FAFF", muted:"#A6BDD9" },
    pipeline: { identified:"#95ABC8", contacted:"#66B7FF", building:"#F0D06A", offer:"#2CC7AB" },
  },
  "Bates College": {
    colors: { bg:"#230D17", surface:"#321223", card:"#451A2F", border:"#6A314C", accent:"#B83D62", gold:"#E5C764", green:"#2ABDA5", red:"#D8546F", purple:"#AA8CFF", text:"#FFF6FA", muted:"#D0A7B8" },
    pipeline: { identified:"#AD95A0", contacted:"#B83D62", building:"#E5C764", offer:"#2ABDA5" },
  },
  "Connecticut College": {
    colors: { bg:"#0A1B34", surface:"#10284A", card:"#173A63", border:"#2B5985", accent:"#6BAFEA", gold:"#D9B85B", green:"#28C0A6", red:"#E66F6F", purple:"#94A5FF", text:"#F4FAFF", muted:"#A8BDD8" },
    pipeline: { identified:"#94A9C5", contacted:"#6BAFEA", building:"#D9B85B", offer:"#28C0A6" },
  },
};

function applySchoolTheme(school) {
  const theme = SCHOOL_THEMES[school] || SCHOOL_THEMES.default;
  Object.assign(C, theme.colors);
  COLUMNS.forEach(col => {
    if (theme.pipeline[col.key]) col.color = theme.pipeline[col.key];
  });
}
/** Team record line under War Room / Rival rosters */
const RECORD_LINE_STYLE = { fontSize: 15, fontWeight: 600, color: "#CBD5E1", marginBottom: 14, letterSpacing: 0.2, fontVariantNumeric: "tabular-nums" };

// ── Helpers ──────────────────────────────────────────────────────────────────

function avgScores(evals) {
  if (!evals || evals.length === 0) return { skating:3, skill:3, size:3, sense:3, spirit:3 };
  const sums = { skating:0, skill:0, size:0, sense:0, spirit:0 };
  evals.forEach(e => DIMS.forEach(d => { sums[d] += e.scores[d]; }));
  const out = {};
  DIMS.forEach(d => { out[d] = sums[d] / evals.length; });
  return out;
}
function compositeAvg(scores) { return DIMS.reduce((s,d) => s + scores[d], 0) / 5; }
function fmtScore(n) { return Number(n).toFixed(1); }
function mkEval(id, date, context, sk, sl, sz, se, sp) { return { id, date, context, scores:{ skating:sk, skill:sl, size:sz, sense:se, spirit:sp } }; }

// ── Roster helpers ────────────────────────────────────────────────────────────

function hashStr(s) { return String(s).split("").reduce((a, c) => a + c.charCodeAt(0), 0); }
function statFor(name, pos) {
  const h = hashStr(name + pos);
  if (pos === "G") {
    const gp = 14 + (h % 14);
    return { gp, g: 0, a: 0, pm: -3 + (h % 12) };
  }
  const gp = 24 + (h % 9);
  const g = 1 + (h % 24);
  const a = 2 + ((h * 13) % 26);
  return { gp, g, a, pm: -14 + (h % 28) };
}
function pl(name, pos, yr, hand, ht, gp, g, a, extra="", status="current") {
  const s = statFor(name, pos);
  return { name, pos, yr, hand, ht, gp, g, a, extra, status, pm: s.pm };
}
function rp(name, pos, yr, hand, ht) {
  const s = statFor(name, pos);
  return pl(name, pos, yr, hand, ht, s.gp, s.g, s.a, "", "ref");
}
function rv(name, pos, yr, hand, ht) {
  const s = statFor(name, pos);
  return pl(name, pos, yr, hand, ht, s.gp, s.g, s.a, "", "rival");
}
function op(pos) { return { name:"", pos, yr:"", hand:"", ht:"", gp:"", g:"", a:"", extra:"", status:"open", pm: 0 }; }

/** Save % uses standard abbreviation SV% (NHL / NCAA). */
function getGoalieStatParts(player) {
  const h = hashStr(player.name + "goalie");
  const gpRaw = Number(player.gp);
  const gp = !Number.isNaN(gpRaw) && gpRaw > 0 ? gpRaw : 16 + (h % 12);

  let gaa = 2.15 + (h % 18) / 10;
  let sv = 0.905 + (h % 28) / 1000;

  const extra = String(player.extra || "");
  const parsed = extra.match(/^([\d.]+)\s*GAA\s*(\.?\d+)/i);
  if (parsed) {
    gaa = parseFloat(parsed[1]);
    const svRaw = parsed[2];
    sv = parseFloat(svRaw.startsWith(".") ? `0${svRaw}` : `0.${svRaw}`);
    if (sv > 1) sv /= 1000;
  }

  const losses = Math.max(1, Math.min(gp - 1, 2 + (h % 7)));
  const wins = gp - losses;

  const gaaStr = `${gaa.toFixed(2)} GAA`;
  const svStr = `${sv.toFixed(3).replace(/^0/, "")} SV%`;

  return [`${wins} W`, `${losses} L`, gaaStr, svStr];
}

/** Stat tokens with labels (GP, G, A, PTS); +/- unlabeled. */
function getPlayerStatParts(player) {
  if (player.status === "open") return null;
  if (player.pos === "G") {
    return getGoalieStatParts(player);
  }
  const gp = Number(player.gp);
  const g = Number(player.g);
  const a = Number(player.a);
  if (player.gp === "" || Number.isNaN(gp)) return null;
  const gN = Number.isNaN(g) ? 0 : g;
  const aN = Number.isNaN(a) ? 0 : a;
  const pts = gN + aN;
  const pm = typeof player.pm === "number" ? player.pm : 0;
  const pmStr = pm >= 0 ? `+${pm}` : `${pm}`;
  return [`${gp} GP`, `${gN} G`, `${aN} A`, `${pts} PTS`, pmStr];
}

// ── MY ROSTER ────────────────────────────────────────────────────────────────

const MY_ROSTER = {
  label:"'26-'27 Projected",
  /* Williams overall 2025-26 — nescac.com standings OVERALL */
  record: { w: 12, l: 14, t: 2 },
  forwards:[
    pl("D. Bouchard","LW","Jr","L","6'2\"",28,9,13), pl("R. Okafor","C","Jr","R","6'0\"",28,11,17), pl("S. Petrov","RW","Jr","R","5'10\"",28,7,9),
    pl("C. Walsh","LW","So","L","5'11\"",28,5,8), pl("N. Lindqvist","C","So","L","6'1\"",28,4,11), pl("B. Kowalczyk","RW","So","R","6'0\"",28,6,7),
    pl("M. Torres","LW","Fr","L","6'0\"",28,3,5), pl("K. Yamamoto","C","Fr","R","5'11\"",28,4,6), pl("L. Brennan","RW","Fr","R","6'1\"",28,2,4),
    op("LW"), op("C"), op("RW"),
  ],
  defense:[
    pl("F. Marchetti","LD","Jr","L","6'2\"",28,4,9), pl("T. Olsen","RD","So","R","6'1\"",28,1,7),
    pl("G. Hoffman","LD","Fr","L","6'3\"",28,2,4), pl("R. Sato","RD","Fr","R","6'0\"",28,0,3),
    op("LD"), op("RD"),
  ],
  goalies:[
    pl("K. Haverford","G","Jr","L","6'2\"",22,"","","2.41 GAA .918"),
    pl("M. Santos","G","So","L","6'1\"",8,"","","3.12 GAA .901"),
  ],
};

/** Williams current season (2025-26) — distinct from '26-'27 projection */
const WILLIAMS_CURRENT_SEASON = {
  id: "williams-2526",
  warRoomKind: "current",
  label: "Williams '25-'26",
  record: { w: 12, l: 14, t: 2 },
  forwards:[
    pl("J. Caldwell","LW","Sr","L","6'1\"",28,12,14), pl("M. Irving","C","Sr","R","6'0\"",28,15,20), pl("T. Okonkwo","RW","Sr","R","5'11\"",28,9,11),
    pl("D. Mercer","LW","Jr","L","6'2\"",28,8,12), pl("S. Lindberg","C","Jr","L","6'1\"",28,7,16), pl("R. Vatanen","RW","Jr","R","6'0\"",28,6,9),
    pl("A. St. Louis","LW","So","L","5'11\"",28,5,7), pl("P. Okada","C","So","R","6'0\"",28,4,10), pl("C. Nyberg","RW","So","R","5'10\"",28,5,6),
    pl("E. Forslund","LW","Fr","L","6'0\"",28,3,4), pl("L. Moreau","C","Fr","R","5'11\"",28,2,5), pl("H. Kitajima","RW","Fr","R","6'1\"",28,2,3),
  ],
  defense:[
    pl("N. Harcourt","LD","Sr","L","6'2\"",28,5,11), pl("V. Strand","RD","Sr","R","6'1\"",28,3,9),
    pl("W. Poulin","LD","Jr","L","6'3\"",28,2,8), pl("Y. Soderberg","RD","So","R","6'0\"",28,1,6),
    pl("Z. Abboud","LD","Fr","L","6'2\"",28,0,4), pl("B. Chara","RD","Fr","R","6'1\"",28,1,3),
  ],
  goalies:[
    pl("G. Whitmore","G","Sr","L","6'2\"",26,"","","2.22 GAA .926"),
    pl("A. Reeves","G","Jr","L","6'1\"",12,"","","2.88 GAA .905"),
  ],
};

// ── BENCHMARK ROSTERS ────────────────────────────────────────────────────────

const BENCHMARK_ROSTERS = [
  { label:"Cornell 2019-20 ★ (#1 ECAC)", record: { w: 23, l: 2, t: 4 },
    forwards:[rp("M. Ladue","LW","Sr","L","6'0\""),rp("C. Whelan","C","Jr","L","6'2\""),rp("G. Matheson","RW","Sr","R","5'11\""),rp("T. Parla","LW","Jr","L","6'1\""),rp("B. Norden","C","So","R","6'0\""),rp("A. Carrier","RW","Jr","R","6'2\""),rp("R. Ayers","LW","Sr","L","5'10\""),rp("P. Tondo","C","Jr","L","6'1\""),rp("J. Stevens","RW","So","R","5'11\""),rp("D. Fulton","LW","Fr","L","6'0\""),rp("H. McBain","C","So","R","6'1\""),rp("L. Fafard","RW","Sr","R","6'3\"")],
    defense:[rp("M. Regula","LD","Jr","L","6'2\""),rp("W. Corson","RD","Sr","R","6'1\""),rp("T. Bristeir","LD","So","L","6'3\""),rp("B. Salo","RD","Jr","R","6'0\""),rp("A. McEneny","LD","Sr","L","6'1\""),rp("C. Petrecki","RD","Jr","R","6'2\"")],
    goalies:[rp("A. Bjork","G","Jr","L","6'3\""),rp("M. Dowd","G","So","L","6'2\"")],
  },
  { label:"Princeton 2017-18 ★ (ECAC Champs)", record: { w: 19, l: 13, t: 4 },
    forwards:[rp("M. Gildon","LW","Sr","L","6'0\""),rp("T. Seeler","C","Sr","L","6'2\""),rp("R. Poturalski","RW","Jr","R","5'10\""),rp("C. Bradley","LW","Jr","L","6'1\""),rp("L. Ferriero","C","So","R","6'0\""),rp("E. Robinson","RW","Jr","R","6'2\""),rp("N. Shea","LW","Sr","L","5'11\""),rp("D. MacKenzie","C","Jr","L","6'1\""),rp("B. Suter","RW","So","R","6'0\""),rp("A. Storjohann","LW","Fr","L","5'11\""),rp("K. Davies","C","So","R","6'0\""),rp("P. Ouellette","RW","Sr","R","6'1\"")],
    defense:[rp("C. Andonovski","LD","Sr","L","6'2\""),rp("M. Becker","RD","Jr","R","6'1\""),rp("J. Berger","LD","Jr","L","6'3\""),rp("R. Quinlan","RD","So","R","6'0\""),rp("T. Brickley","LD","Sr","L","6'2\""),rp("C. Shea","RD","Jr","R","6'1\"")],
    goalies:[rp("T. Sarro","G","Jr","L","6'2\""),rp("B. Koven","G","So","L","6'1\"")],
  },
];

// ── NESCAC RIVAL ROSTERS — overall W-L-T from nescac.com standings (2025-26), March 2026 ──
// Bates: placeholder overall (not on same NESCAC 10-team standings page).

const RIVAL_ROSTERS = [
  { label:"Middlebury '25-'26", record: { w: 15, l: 9, t: 3 },
    forwards:[rv("A. Fournier","LW","Sr","L","6'1\""),rv("B. Thornton","C","Jr","R","6'0\""),rv("C. Hamill","RW","Sr","R","5'11\""),rv("D. Lacroix","LW","So","L","6'2\""),rv("E. Osei","C","Jr","L","6'1\""),rv("F. Rinaldi","RW","Sr","R","6'0\""),rv("G. Halvorsen","LW","Jr","L","5'10\""),rv("H. Brennan","C","So","R","6'1\""),rv("I. Korhonen","RW","Fr","R","6'0\""),rv("J. Pelletier","LW","Sr","L","6'2\""),rv("K. Morse","C","Jr","L","6'0\""),rv("L. Hansson","RW","So","R","5'11\"")],
    defense:[rv("M. Trudeau","LD","Sr","L","6'2\""),rv("N. Yablonsky","RD","Jr","R","6'1\""),rv("O. Ferrara","LD","So","L","6'3\""),rv("P. Sundqvist","RD","Jr","R","6'0\""),rv("Q. Lafleur","LD","Sr","L","6'1\""),rv("R. Ashby","RD","So","R","6'2\"")],
    goalies:[rv("S. Virtanen","G","Jr","L","6'3\""),rv("T. Malone","G","Fr","L","6'2\"")],
  },
  { label:"Bowdoin '25-'26", record: { w: 19, l: 7, t: 1 },
    forwards:[rv("C. Finneran","LW","Sr","L","6'0\""),rv("D. Weston","C","Jr","R","5'11\""),rv("E. Calloway","RW","Sr","R","6'1\""),rv("F. Lindahl","LW","Jr","L","6'2\""),rv("G. Okonkwo","C","So","L","6'0\""),rv("H. Bartels","RW","Jr","R","5'10\""),rv("I. MacDougall","LW","Sr","L","6'1\""),rv("J. Caruso","C","So","R","6'0\""),rv("K. Svensson","RW","Jr","R","6'2\""),rv("L. Pemberton","LW","Fr","L","5'11\""),rv("M. Nakamura","C","So","L","6'1\""),rv("N. Frechette","RW","Sr","R","6'0\"")],
    defense:[rv("O. Blackwood","LD","Sr","L","6'3\""),rv("P. Renaud","RD","Jr","R","6'1\""),rv("Q. Tamblyn","LD","So","L","6'2\""),rv("R. Johansson","RD","Jr","R","6'0\""),rv("S. Dempsey","LD","Sr","L","6'1\""),rv("T. Nilsson","RD","So","R","6'2\"")],
    goalies:[rv("U. Bergeron","G","Jr","L","6'2\""),rv("V. Holst","G","Fr","L","6'1\"")],
  },
  { label:"Trinity '25-'26", record: { w: 12, l: 11, t: 1 },
    forwards:[rv("W. Marchand","LW","Sr","L","6'1\""),rv("X. Delacroix","C","Jr","R","6'0\""),rv("Y. Sullivan","RW","Sr","R","5'11\""),rv("Z. Koivisto","LW","Jr","L","6'2\""),rv("A. Patel","C","So","L","6'0\""),rv("B. Fitzgerald","RW","Jr","R","6'1\""),rv("C. Novak","LW","Sr","L","5'10\""),rv("D. Arsenault","C","So","R","6'1\""),rv("E. Magnusson","RW","Fr","R","6'0\""),rv("F. Belanger","LW","Jr","L","6'2\""),rv("G. Dupont","C","So","L","6'0\""),rv("H. Reilly","RW","Sr","R","5'11\"")],
    defense:[rv("I. Czarnecki","LD","Sr","L","6'2\""),rv("J. Warwick","RD","Jr","R","6'1\""),rv("K. Fontaine","LD","So","L","6'3\""),rv("L. Hedstrom","RD","Jr","R","6'0\""),rv("M. Tremblay","LD","Sr","L","6'1\""),rv("N. Sousa","RD","So","R","6'2\"")],
    goalies:[rv("O. Backstrom","G","Jr","L","6'3\""),rv("P. Gaudreau","G","Fr","L","6'2\"")],
  },
  { label:"Amherst '25-'26", record: { w: 12, l: 11, t: 2 },
    forwards:[rv("Q. Morrison","LW","Sr","L","6'0\""),rv("R. Flaherty","C","Jr","R","6'1\""),rv("S. Vanhanen","RW","Sr","R","5'11\""),rv("T. Oduya","LW","Jr","L","6'2\""),rv("U. Eriksen","C","So","R","6'0\""),rv("V. Deschamps","RW","Jr","L","5'10\""),rv("W. Bergmann","LW","Sr","L","6'1\""),rv("X. Nakashima","C","So","R","6'0\""),rv("Y. O'Brien","RW","Fr","R","6'2\""),rv("Z. Lindberg","LW","Jr","L","5'11\""),rv("A. Carrasco","C","So","L","6'1\""),rv("B. Gustafsson","RW","Sr","R","6'0\"")],
    defense:[rv("C. Bondar","LD","Sr","L","6'3\""),rv("D. Pelletier","RD","Jr","R","6'1\""),rv("E. Nystrom","LD","So","L","6'2\""),rv("F. Kowalski","RD","Jr","R","6'0\""),rv("G. Lemaire","LD","Sr","L","6'1\""),rv("H. Sorensen","RD","So","R","6'2\"")],
    goalies:[rv("I. Hakala","G","Jr","L","6'2\""),rv("J. Rousseau","G","Fr","L","6'1\"")],
  },
  { label:"Hamilton '25-'26", record: { w: 23, l: 5, t: 2 },
    forwards:[rv("K. Sundstrom","LW","Sr","L","6'1\""),rv("L. McAllister","C","Jr","R","6'0\""),rv("M. Pettersson","RW","Sr","R","5'10\""),rv("N. Girard","LW","Jr","L","6'2\""),rv("O. Tanaka","C","So","R","6'1\""),rv("P. Boutin","RW","Jr","L","6'0\""),rv("Q. Henriksson","LW","Sr","L","5'11\""),rv("R. Fitzgerald","C","So","R","6'1\""),rv("S. Aalto","RW","Fr","R","6'0\""),rv("T. Cloutier","LW","Jr","L","6'2\""),rv("U. Bergstrom","C","So","L","6'0\""),rv("V. Mackenzie","RW","Sr","R","5'11\"")],
    defense:[rv("W. Karlsson","LD","Sr","L","6'2\""),rv("X. Benoit","RD","Jr","R","6'1\""),rv("Y. Leinonen","LD","So","L","6'3\""),rv("Z. Duplessis","RD","Jr","R","6'0\""),rv("A. Forsberg","LD","Sr","L","6'1\""),rv("B. Tran","RD","So","R","6'2\"")],
    goalies:[rv("C. Nieminen","G","Jr","L","6'3\""),rv("D. Bilodeau","G","Fr","L","6'2\"")],
  },
  { label:"Colby '25-'26", record: { w: 10, l: 12, t: 2 },
    forwards:[rv("E. Magnusson","LW","Sr","L","6'0\""),rv("F. Arsenault","C","Jr","R","5'11\""),rv("G. Korhonen","RW","Sr","R","6'1\""),rv("H. Lapointe","LW","Jr","L","6'2\""),rv("I. Watanabe","C","So","R","6'0\""),rv("J. Chartrand","RW","Jr","L","5'10\""),rv("K. Holmberg","LW","Sr","L","6'1\""),rv("L. Duchesne","C","So","R","6'0\""),rv("M. Saarinen","RW","Fr","R","6'2\""),rv("N. Gosselin","LW","Jr","L","5'11\""),rv("O. Bergqvist","C","So","L","6'1\""),rv("P. Hawkins","RW","Sr","R","6'0\"")],
    defense:[rv("Q. Salonen","LD","Sr","L","6'2\""),rv("R. Lavoie","RD","Jr","R","6'1\""),rv("S. Kivinen","LD","So","L","6'3\""),rv("T. Beauchamp","RD","Jr","R","6'0\""),rv("U. Rantanen","LD","Sr","L","6'1\""),rv("V. Caron","RD","So","R","6'2\"")],
    goalies:[rv("W. Koivunen","G","Jr","L","6'2\""),rv("X. Gagnon","G","Fr","L","6'1\"")],
  },
  { label:"Wesleyan '25-'26", record: { w: 9, l: 16, t: 0 },
    forwards:[rv("Y. Picard","LW","Sr","L","5'11\""),rv("Z. Lindqvist","C","Jr","R","5'10\""),rv("A. Thibodeau","RW","Sr","R","6'0\""),rv("B. Salminen","LW","Jr","L","6'1\""),rv("C. Anttila","C","So","R","5'11\""),rv("D. Dufour","RW","Jr","L","6'0\""),rv("E. Lehtinen","LW","Sr","L","5'10\""),rv("F. Pelland","C","So","R","6'1\""),rv("G. Ahonen","RW","Fr","R","5'11\""),rv("H. Turgeon","LW","Jr","L","6'0\""),rv("I. Laukkanen","C","So","L","6'1\""),rv("J. Racine","RW","Sr","R","5'10\"")],
    defense:[rv("K. Koskela","LD","Sr","L","6'1\""),rv("L. Patenaude","RD","Jr","R","6'0\""),rv("M. Heikkinen","LD","So","L","6'2\""),rv("N. Gervais","RD","Jr","R","6'1\""),rv("O. Makinen","LD","Sr","L","6'0\""),rv("P. Houle","RD","So","R","6'1\"")],
    goalies:[rv("Q. Viitanen","G","Jr","L","6'1\""),rv("R. Bellemare","G","Fr","L","6'2\"")],
  },
  { label:"Tufts '25-'26", record: { w: 12, l: 12, t: 1 },
    forwards:[rv("S. Makela","LW","Sr","L","6'0\""),rv("T. Chouinard","C","Jr","R","6'1\""),rv("U. Blais","RW","Sr","R","5'11\""),rv("V. Korhonen","LW","Jr","L","6'0\""),rv("W. Siltala","C","So","R","6'2\""),rv("X. Boudreau","RW","Jr","L","5'11\""),rv("Y. Hamalainen","LW","Sr","L","6'1\""),rv("Z. Marcotte","C","So","R","6'0\""),rv("A. Virtanen","RW","Fr","R","6'1\""),rv("B. Leblanc","LW","Jr","L","5'10\""),rv("C. Tuominen","C","So","L","6'1\""),rv("D. Poirier","RW","Sr","R","6'0\"")],
    defense:[rv("E. Rinne","LD","Sr","L","6'2\""),rv("F. Lariviere","RD","Jr","R","6'1\""),rv("G. Niskanen","LD","So","L","6'3\""),rv("H. Rondeau","RD","Jr","R","6'0\""),rv("I. Pakarinen","LD","Sr","L","6'1\""),rv("J. Desrochers","RD","So","R","6'2\"")],
    goalies:[rv("K. Matikainen","G","Jr","L","6'2\""),rv("L. Tanguay","G","Fr","L","6'1\"")],
  },
  { label:"Bates '25-'26", record: { w: 9, l: 15, t: 2 },
    forwards:[rv("M. Virolainen","LW","Sr","L","6'0\""),rv("N. Robichaud","C","Jr","R","5'11\""),rv("O. Kallinen","RW","Sr","R","6'1\""),rv("P. Ouellet","LW","Jr","L","6'2\""),rv("Q. Laine","C","So","R","6'0\""),rv("R. Gauthier","RW","Jr","L","5'11\""),rv("S. Pesonen","LW","Sr","L","6'1\""),rv("T. Beaulieu","C","So","R","6'0\""),rv("U. Koivisto","RW","Fr","R","6'2\""),rv("V. Labbe","LW","Jr","L","5'11\""),rv("W. Mikkola","C","So","L","6'1\""),rv("X. Fortin","RW","Sr","R","6'0\"")],
    defense:[rv("Y. Leinonen","LD","Sr","L","6'2\""),rv("Z. Laplante","RD","Jr","R","6'1\""),rv("A. Saarinen","LD","So","L","6'3\""),rv("B. Masse","RD","Jr","R","6'0\""),rv("C. Ojanen","LD","Sr","L","6'1\""),rv("D. Belanger","RD","So","R","6'2\"")],
    goalies:[rv("E. Rasanen","G","Jr","L","6'2\""),rv("F. Lachance","G","Fr","L","6'1\"")],
  },
  { label:"Connecticut College '25-'26", record: { w: 10, l: 14, t: 1 },
    forwards:[rv("G. Hakkinen","LW","Sr","L","5'11\""),rv("H. Morin","C","Jr","R","6'0\""),rv("I. Sihvonen","RW","Sr","R","5'10\""),rv("J. Dupuis","LW","Jr","L","6'1\""),rv("K. Ojala","C","So","R","5'11\""),rv("L. Briere","RW","Jr","L","6'0\""),rv("M. Niemi","LW","Sr","L","5'10\""),rv("N. Thibault","C","So","R","6'1\""),rv("O. Partanen","RW","Fr","R","5'11\""),rv("P. Gauvin","LW","Jr","L","6'0\""),rv("Q. Koskinen","C","So","L","5'11\""),rv("R. Vallee","RW","Sr","R","6'0\"")],
    defense:[rv("S. Toivonen","LD","Sr","L","6'1\""),rv("T. Leclerc","RD","Jr","R","6'0\""),rv("U. Laitinen","LD","So","L","6'2\""),rv("V. Allard","RD","Jr","R","6'1\""),rv("W. Niinimaki","LD","Sr","L","6'0\""),rv("X. Bergeron","RD","So","R","6'1\"")],
    goalies:[rv("Y. Korhonen","G","Jr","L","6'1\""),rv("Z. Paquette","G","Fr","L","6'2\"")],
  },
];

// ── War Room: multi-year projections & custom rosters ────────────────────────

function parseProjectionEndYear(label) {
  const m = String(label).match(/'(\d{2})-'(\d{2})/);
  if (!m) return null;
  return parseInt(m[2], 10);
}

function nextYearLabelFromLabel(label) {
  const m = String(label).match(/'(\d{2})-'(\d{2})/);
  if (!m) return "'27-'28";
  const end = parseInt(m[2], 10);
  const ns = String(end).padStart(2, "0");
  const ne = String((end + 1) % 100).padStart(2, "0");
  return `'${ns}-'${ne}`;
}

function normalizeYearInput(s) {
  if (!s || !String(s).trim()) return null;
  const m = String(s).trim().match(/(\d{2})\s*[-'']\s*(\d{2})/);
  if (!m) return null;
  return `'${m[1]}-'${m[2]}`;
}

function advancePlayerYear(p) {
  if (p.status === "open") return op(p.pos);
  if (p.yr === "Sr") return op(p.pos);
  const nextYr = { Jr: "Sr", So: "Jr", Fr: "So" }[p.yr];
  if (!nextYr) return op(p.pos);
  const s = statFor(p.name, p.pos);
  return { ...p, yr: nextYr, pm: s.pm };
}

function advanceRosterFromSource(source) {
  return {
    forwards: source.forwards.map(advancePlayerYear),
    defense: source.defense.map(advancePlayerYear),
    goalies: source.goalies.map(advancePlayerYear),
  };
}

function findLatestProjectionRoster(futureProjections) {
  const candidates = [
    { roster: MY_ROSTER, label: MY_ROSTER.label },
    ...futureProjections.map(r => ({ roster: r, label: r.label })),
  ];
  let best = candidates[0];
  let bestEnd = parseProjectionEndYear(best.label) ?? -1;
  for (let i = 1; i < candidates.length; i++) {
    const e = parseProjectionEndYear(candidates[i].label);
    if (e != null && e > bestEnd) {
      bestEnd = e;
      best = candidates[i];
    }
  }
  return best.roster;
}

function blankWilliamsRoster(id, label) {
  return {
    id,
    warRoomKind: "custom",
    label,
    record: { w: 0, l: 0, t: 0 },
    forwards: [
      op("LW"), op("C"), op("RW"),
      op("LW"), op("C"), op("RW"),
      op("LW"), op("C"), op("RW"),
      op("LW"), op("C"), op("RW"),
    ],
    defense: [op("LD"), op("RD"), op("LD"), op("RD"), op("LD"), op("RD")],
    goalies: [op("G"), op("G")],
  };
}

function cloneBenchmarkTemplate(id, label) {
  const src = BENCHMARK_ROSTERS[0];
  return {
    id,
    warRoomKind: "custom",
    label,
    record: { ...src.record },
    forwards: src.forwards.map(p => ({ ...p })),
    defense: src.defense.map(p => ({ ...p })),
    goalies: src.goalies.map(p => ({ ...p })),
  };
}

function mergeRosterEdit(base, edit) {
  if (!edit) return base;
  return {
    ...base,
    forwards: edit.forwards ?? base.forwards,
    defense: edit.defense ?? base.defense,
    goalies: edit.goalies ?? base.goalies,
  };
}

/** Forward/defense/goalie slot vs pipeline prospect position */
function posMatchesSlot(slotPos, prospectPos) {
  if (slotPos === "G" || prospectPos === "G") return prospectPos === "G";
  const fwd = new Set(["LW", "C", "RW"]);
  const def = new Set(["LD", "RD", "D"]);
  if (fwd.has(slotPos) && fwd.has(prospectPos)) return true;
  if (def.has(slotPos) && def.has(prospectPos)) return true;
  return false;
}

function rosterSectionArray(roster, section) {
  if (section === "forwards") return roster.forwards;
  if (section === "defense") return roster.defense;
  return roster.goalies;
}

/** Map a pipeline prospect onto a depth-chart slot (Fr., pipeline stats). */
function prospectToRosterPlayer(prospect, slotPos) {
  const s = statFor(prospect.name, slotPos);
  const leagueTag = prospect.league ? String(prospect.league).trim() : "";
  if (slotPos === "G") {
    return {
      name: prospect.name,
      pos: "G",
      yr: "Fr",
      hand: "L",
      ht: prospect.height || "6'2\"",
      gp: prospect.gp ?? 0,
      g: "",
      a: "",
      extra: "",
      status: "current",
      prospectId: prospect.id,
      prospectLeague: leagueTag,
      pm: s.pm,
    };
  }
  return {
    name: prospect.name,
    pos: slotPos,
    yr: "Fr",
    hand: "L",
    ht: prospect.height || "6'0\"",
    gp: prospect.gp ?? 0,
    g: prospect.g ?? 0,
    a: prospect.a ?? 0,
    extra: "",
    status: "current",
    prospectId: prospect.id,
    prospectLeague: leagueTag,
    pm: s.pm,
  };
}

function collectPlacedProspectIds(roster) {
  const ids = new Set();
  [...roster.forwards, ...roster.defense, ...roster.goalies].forEach(p => {
    if (p.prospectId != null) ids.add(p.prospectId);
  });
  return ids;
}

function rosterPlayerStatLine(player) {
  const statParts = getPlayerStatParts(player) || [];
  if (player.prospectId != null && player.prospectLeague) {
    statParts.push(`(${player.prospectLeague})`);
  }
  return statParts.join(" · ");
}

function getProspectPositionBucket(pos) {
  if (pos === "G") return "G";
  if (pos === "D" || pos === "LD" || pos === "RD") return "D";
  return "F";
}

function getProspectHandedness(prospect) {
  if (prospect.hand === "L" || prospect.hand === "R") return prospect.hand;
  return hashStr(prospect.name || "") % 2 === 0 ? "L" : "R";
}

function getProspectBirthYear(prospect) {
  if (prospect.birthYear) return Number(prospect.birthYear);
  const age = Number(prospect.age);
  if (Number.isNaN(age) || age <= 0) return null;
  return new Date().getFullYear() - age;
}

function getProspectLastContactDays(prospect) {
  const msgs = prospect.messages || [];
  if (msgs.length === 0) return null;
  const raw = String(msgs[msgs.length - 1].time || "").trim();
  if (!raw) return null;
  if (/^today\b/i.test(raw) || /^(sun|mon|tue|wed|thu|fri|sat)\b/i.test(raw)) return 0;

  const now = new Date();
  const cleaned = raw.replace(/^Today\s+/i, "").trim();
  const withYear = cleaned.match(/\b\d{4}\b/) ? cleaned : `${cleaned} ${now.getFullYear()}`;
  const parsedMs = Date.parse(withYear);
  if (Number.isNaN(parsedMs)) return null;
  const diff = now.getTime() - parsedMs;
  if (diff <= 0) return 0;
  return Math.floor(diff / 86400000);
}

function formatProspectCardStatLine(prospect) {
  const gpRaw = Number(prospect.gp);
  const gp = Number.isNaN(gpRaw) ? 0 : gpRaw;
  if (getProspectPositionBucket(prospect.pos) === "G") {
    const h = hashStr(`${prospect.name || ""}-goalie-card`);
    const losses = Math.max(1, Math.min(Math.max(gp - 1, 1), 2 + (h % 7)));
    const wins = Math.max(0, gp - losses);

    let gaa = 2.15 + (h % 18) / 10;
    let sv = 0.905 + (h % 28) / 1000;
    const note = String(prospect.note || "");
    const parsed = note.match(/GAA\s*([\d.]+).*SV%?\s*\.?(\d{3})/i);
    if (parsed) {
      gaa = parseFloat(parsed[1]);
      sv = parseFloat(`0.${parsed[2]}`);
    }
    return `${gp} GP - ${wins} W - ${losses} L - ${gaa.toFixed(2)} GAA - ${sv.toFixed(3).replace(/^0/, "")} SV%`;
  }
  const gRaw = Number(prospect.g);
  const aRaw = Number(prospect.a);
  const g = Number.isNaN(gRaw) ? 0 : gRaw;
  const a = Number.isNaN(aRaw) ? 0 : aRaw;
  const pts = g + a;
  const pm = statFor(prospect.name || "", prospect.pos || "C").pm;
  const pmStr = pm >= 0 ? `+${pm}` : `${pm}`;
  return `${gp} GP - ${g} G - ${a} A - ${pts} PTS - ${pmStr}`;
}

// ── Trending feed data ────────────────────────────────────────────────────────

const TRENDING_PIPELINE = [
  { id:"t1", name:"Dmitri Volkov", pos:"LW", league:"CCHL", team:"Carleton Place", age:20, weekend:"2G 1A vs. Kingston", availability:"Available", onBoard:true },
  { id:"t2", name:"Ryan Kowalski", pos:"G", league:"OJHL", team:"Georgetown Raiders", age:19, weekend:"39 saves .951 SV%", availability:"Available", onBoard:true },
  { id:"t3", name:"Connor Halverson", pos:"LW", league:"USHL", team:"Sioux City", age:18, weekend:"3G 1A in 2 games", availability:"Available", onBoard:true },
];

const TRENDING_LEAGUE = [
  { id:"l1", name:"M. Johansson", pos:"C", league:"USHL", team:"Tri-City Storm", age:18, weekend:"4G 2A — hat trick Fri", availability:"Available", onBoard:false },
  { id:"l2", name:"P. Marchand", pos:"RW", league:"BCHL", team:"Penticton Vees", age:19, weekend:"2G 3A over weekend", availability:"Unknown", onBoard:false },
  { id:"l3", name:"A. Kovalenko", pos:"LD", league:"NAHL", team:"Amarillo Bulls", age:18, weekend:"+3 rating, 4 blocked shots", availability:"Available", onBoard:false },
  { id:"l4", name:"T. Bergqvist", pos:"C", league:"CCHL", team:"Carleton Place", age:19, weekend:"5A in 2 games", availability:"Committed", onBoard:false },
  { id:"l5", name:"J. Okafor", pos:"RW", league:"OJHL", team:"Oakville Blades", age:18, weekend:"2G 1A, strong compete", availability:"Available", onBoard:false },
  { id:"l6", name:"N. Petrov", pos:"LW", league:"USHL", team:"Fargo Force", age:18, weekend:"2G 2A Fri/Sat sweep", availability:"Unknown", onBoard:false },
];

// ── Pipeline prospects (30 identified, 15 contacted, 8 building, 3 offer) ──────

function mkP(id, name, pos, league, team, age, gp, g, a, ht, wt, evals, note, tier, messages, nudge, notes) {
  const birthYear = new Date().getFullYear() - Number(age || 0);
  const hand = hashStr(`${name}-${pos}-${id}`) % 2 === 0 ? "L" : "R";
  return { id, name, pos, league, team, age, birthYear, hand, gp, g, a, height:ht, weight:wt, evals, note, tier, messages, nudge, notes };
}

const INITIAL_PROSPECTS = {
  identified: [
    mkP(1,"Connor Halverson","LW","USHL","Sioux City Musketeers",18,42,18,24,"6'1\"","190",[mkEval("e1","Oct 12","USHL Fall Classic",4,4,3,4,4),mkEval("e2","Jan 18","Sioux City vs. Waterloo",4,4,3,5,4)],"Strong two-way forward, good compete level","A",[],null,[]),
    mkP(2,"Marcus Leblanc","D","BCHL","Penticton Vees",19,38,5,19,"6'2\"","205",[mkEval("e1","Nov 3","BCHL showcase",3,3,5,4,4)],"Big shutdown D, needs work on breakout","B",[],null,[]),
    mkP(3,"Jake Torresi","C","NAHL","Lone Star Brahmas",18,44,22,31,"5'10\"","175",[mkEval("e1","Sep 28","NAHL Showcase",5,4,2,4,3),mkEval("e2","Dec 7","Lone Star home game",5,5,2,5,3),mkEval("e3","Feb 15","Robertson Cup run",5,5,3,5,4)],"Elite skill trending up — weight gain visible this winter","A",[],null,[{id:"n1",text:"Spoke to billet family — up 8 lbs since September. Gym every morning.",date:"Feb 20, 2025",time:"11:30am"},{id:"n2",text:"Coach Thibodeau confirmed uncommitted, very interested in academic schools.",date:"Jan 10, 2025",time:"3:15pm"}]),
    mkP(4,"A. Gallagher","RW","USHL","Waterloo Black Hawks",18,40,14,16,"6'0\"","185",[mkEval("e1","Nov 1","USHL game",3,4,3,3,4)],"Physical winger, strong on puck","B",[],null,[]),
    mkP(5,"T. Hakanen","C","BCHL","Salmon Arm Silverbacks",18,36,11,19,"5'11\"","178",[mkEval("e1","Oct 20","BCHL showcase",4,4,2,4,3)],"Smart playmaker, undersized but high IQ","B",[],null,[]),
    mkP(6,"L. Beauregard","LW","CCHL","Smiths Falls Bears",19,38,16,18,"6'1\"","186",[mkEval("e1","Dec 1","CCHL game",4,3,3,4,4)],"Late bloomer — getting better each month","B",[],null,[]),
    mkP(7,"P. Nieminen","D","NAHL","New Mexico Ice Wolves",18,42,4,12,"6'3\"","210",[mkEval("e1","Oct 5","NAHL Showcase",3,3,5,4,3)],"Huge body, raw but projectable","B",[],null,[]),
    mkP(8,"S. Korhonen","RW","OJHL","Oakville Blades",18,35,9,14,"5'10\"","175",[mkEval("e1","Nov 15","OJHL game",4,4,2,3,4)],"Quick and shifty, needs to add weight","B",[],null,[]),
    mkP(9,"M. Virtanen","C","USHL","Fargo Force",18,38,12,20,"6'0\"","180",[mkEval("e1","Sep 15","USHL opener",4,4,3,4,3)],"Good all-around center, nothing elite","B",[],null,[]),
    mkP(10,"K. Laukkanen","LD","CCHL","Carleton Place Canadians",19,40,5,14,"6'2\"","200",[mkEval("e1","Oct 8","CCHL showcase",4,3,4,4,4)],"Mobile defenseman, good first pass","B",[],null,[]),
    mkP(11,"R. Bergstrom","RW","BCHL","Vernon Vipers",18,32,8,11,"6'1\"","183",[mkEval("e1","Dec 5","BCHL game",3,3,3,3,4)],"Toolsy but inconsistent","C",[],null,[]),
    mkP(12,"F. Lapointe","C","NAHL","Lone Star Brahmas",18,41,10,17,"5'11\"","177",[mkEval("e1","Jan 5","NAHL game",3,4,2,4,3)],"Smart player, not a difference maker yet","C",[],null,[]),
    mkP(13,"H. Saarinen","D","OJHL","Georgetown Raiders",19,37,2,9,"6'1\"","198",[mkEval("e1","Nov 20","OJHL game",3,3,4,3,3)],"Solid shutdown D, limited offensively","C",[],null,[]),
    mkP(14,"J. Picard","LW","USHL","Sioux City Musketeers",18,42,7,10,"5'11\"","179",[mkEval("e1","Oct 22","USHL game",3,3,3,3,3)],"Steady but needs to compete harder","C",[],null,[]),
    mkP(15,"N. Aalto","RW","CCHL","Ottawa Jr. Senators",18,33,6,8,"6'0\"","181",[mkEval("e1","Dec 12","CCHL game",3,3,3,3,3)],"Decent skater, low shot volume","C",[],null,[]),
    mkP(16,"O. Makinen","C","BCHL","Penticton Vees",19,35,9,15,"6'1\"","184",[mkEval("e1","Nov 8","BCHL showcase",3,4,3,4,3)],"Reliable center, nothing flashy","C",[],null,[]),
    mkP(17,"Q. Tuominen","D","NAHL","Amarillo Bulls",18,40,3,10,"6'2\"","202",[mkEval("e1","Oct 15","NAHL game",3,3,4,3,3)],"Big frame, reads plays slowly","C",[],null,[]),
    mkP(18,"A. Heikkinen","LW","OJHL","Mississauga Chargers",18,36,8,9,"6'0\"","180",[mkEval("e1","Jan 9","OJHL game",3,3,3,3,4)],"High energy but raw","C",[],null,[]),
    mkP(19,"B. Mikkola","RW","USHL","Waterloo Black Hawks",18,39,6,9,"5'11\"","176",[mkEval("e1","Dec 3","USHL game",3,3,2,3,3)],"Needs a standout game to stay on board","C",[],null,[]),
    mkP(20,"C. Leinonen","C","CCHL","Carleton Place Canadians",19,37,8,13,"5'11\"","179",[mkEval("e1","Nov 25","CCHL game",3,3,2,4,3)],"Smart but small — size concern at D3","C",[],null,[]),
    mkP(21,"D. Siltala","D","BCHL","Salmon Arm Silverbacks",18,34,2,8,"6'3\"","208",[mkEval("e1","Oct 18","BCHL showcase",3,2,5,3,3)],"Big body, footwork needs work","C",[],null,[]),
    mkP(22,"E. Koivisto","G","OJHL","Georgetown Raiders",18,28,0,1,"6'2\"","190",[mkEval("e1","Nov 28","OJHL game",3,3,4,3,4)],"GAA 3.10 .908 — needs better camp data","C",[],null,[]),
    mkP(23,"G. Forsberg","LW","NAHL","Shreveport Mudbugs",18,38,7,9,"6'1\"","184",[mkEval("e1","Dec 8","NAHL game",3,3,3,3,3)],"New to watch list — flagged by scout","C",[],null,[]),
    mkP(24,"H. Sundstrom","C","USHL","Tri-City Storm",18,40,9,14,"5'10\"","175",[mkEval("e1","Jan 15","USHL game",3,4,2,4,3)],"Crafty center, size is the issue","C",[],null,[]),
    mkP(25,"I. Rantanen","RW","CCHL","Smith Falls Bears",19,35,7,10,"6'0\"","182",[mkEval("e1","Oct 30","CCHL game",3,3,3,3,3)],"Fringy at this stage","C",[],null,[]),
    mkP(26,"J. Niskanen","LD","BCHL","Vernon Vipers",18,33,1,6,"6'2\"","199",[mkEval("e1","Dec 15","BCHL game",3,2,4,3,3)],"Raw but projectable blue line size","C",[],null,[]),
    mkP(27,"K. Pakarinen","C","OJHL","Aurora Tigers",18,36,6,11,"5'11\"","178",[mkEval("e1","Nov 5","OJHL game",3,3,2,4,3)],"Good hockey IQ, very small","C",[],null,[]),
    mkP(28,"L. Gustafsson","RW","USHL","Fargo Force",18,41,8,12,"6'1\"","183",[mkEval("e1","Jan 22","USHL game",3,3,3,3,3)],"Steady but nothing jumps out","C",[],null,[]),
    mkP(29,"M. Tikkanen","D","NAHL","Corpus Christi IceRays",19,39,2,7,"6'2\"","201",[mkEval("e1","Dec 20","NAHL game",2,3,4,3,3)],"Needs another viewing before decision","C",[],null,[]),
    mkP(30,"N. Lehkonen","LW","CCHL","Pembroke Lumber Kings",18,34,5,7,"6'0\"","180",[mkEval("e1","Jan 28","CCHL game",3,3,3,3,3)],"Added to board after showcase tip","C",[],null,[]),
    mkP(31,"O. Cormier","C","USHL","Green Bay Gamblers",21,44,17,20,"6'0\"","188",[mkEval("e1","Nov 4","USHL weekend set",4,4,3,4,4)],"2005 center still in juniors — strong pace and details","B",[],null,[]),
    mkP(32,"P. Savard","RW","NAHL","Janesville Jets",21,42,14,16,"6'1\"","186",[mkEval("e1","Dec 9","NAHL game",3,4,3,4,4)],"Direct winger, wins races, reliable F3 habits","B",[],null,[]),
    mkP(33,"Q. Halme","LD","OJHL","Milton Menace",21,41,5,17,"6'2\"","201",[mkEval("e1","Oct 27","OJHL game",4,3,4,4,3)],"Mobile left-shot D with clean first pass","B",[],null,[]),
    mkP(34,"R. Belliveau","G","BCHL","Coquitlam Express",21,31,0,1,"6'3\"","196",[mkEval("e1","Jan 11","BCHL road game",4,4,4,4,4)],"2005 goalie remains eligible this cycle; composed and square","A",[],null,[]),
    mkP(35,"S. Andersson","LW","CCHL","Rockland Nationals",21,40,13,19,"5'11\"","181",[mkEval("e1","Nov 19","CCHL game",4,4,3,4,4)],"Quick release and disruptive forecheck routes","B",[],null,[]),
    mkP(36,"T. Ouellette","C","BCHL","Cranbrook Bucks",21,39,11,18,"6'0\"","184",[mkEval("e1","Dec 2","BCHL game",3,4,3,4,3)],"Veteran 2005 center with solid faceoff value","B",[],null,[]),
    mkP(37,"U. Kaskinen","RD","USHL","Des Moines Buccaneers",21,43,4,14,"6'2\"","204",[mkEval("e1","Oct 14","USHL game",3,3,4,4,4)],"Length and reach project well in defensive-zone work","C",[],null,[]),
    mkP(38,"V. Dupuis","RW","OJHL","Collingwood Blues",21,38,12,13,"6'0\"","183",[mkEval("e1","Jan 6","OJHL game",3,4,3,3,4)],"Compete-heavy winger who can slide up lineup","C",[],null,[]),
    mkP(39,"W. Nadeau","LD","NAHL","Odessa Jackalopes",21,40,3,11,"6'3\"","207",[mkEval("e1","Nov 30","NAHL game",3,3,5,3,3)],"Big 2005 defender, still adding footspeed","C",[],null,[]),
    mkP(40,"X. Rintala","G","USHL","Lincoln Stars",21,28,0,2,"6'2\"","192",[mkEval("e1","Dec 16","USHL game",3,4,4,4,4)],"Tracks pucks well through traffic; late-bloom profile","B",[],null,[]),
    mkP(41,"Y. Marchese","LW","BCHL","Trail Smoke Eaters",21,41,15,18,"6'1\"","187",[mkEval("e1","Oct 21","BCHL game",4,4,3,4,4)],"North-south winger with power-play net-front value","B",[],null,[]),
    mkP(42,"Z. Lemieux","C","OJHL","Trenton Golden Hawks",21,42,16,22,"5'11\"","180",[mkEval("e1","Jan 20","OJHL game",4,4,3,5,4)],"2005 playmaking center, competitive and mature","A",[],null,[]),
    mkP(43,"A. Vasiliev","RD","CCHL","Nepean Raiders",21,39,2,12,"6'2\"","200",[mkEval("e1","Nov 12","CCHL game",3,3,4,4,3)],"Right-shot D with calm retrieval habits","B",[],null,[]),
    mkP(44,"B. Pellerin","RW","NAHL","Minot Minotauros",21,40,10,14,"6'0\"","185",[mkEval("e1","Dec 28","NAHL game",3,4,3,3,4)],"2005 winger still junior-eligible, good motor and detail","C",[],null,[]),
    mkP(45,"C. Johansen","LW","USHL","Madison Capitols",21,43,18,21,"6'1\"","189",[mkEval("e1","Feb 3","USHL game",4,4,3,4,4)],"Older junior scorer with proven finishing touch","A",[],null,[]),
  ],
  contacted: [
    mkP(101,"Ryan Kowalski","G","OJHL","Georgetown Raiders",19,30,0,2,"6'3\"","195",[mkEval("e1","Oct 19","OJHL showcase",4,4,4,4,5),mkEval("e2","Jan 25","Georgetown vs. Aurora",4,4,4,4,5)],"GAA 2.41 SV% .921 — very coachable","A",[{id:1,from:"coach",text:"Hey Ryan, Coach Davis here. Loved watching you against Guelph — would love to hop on a quick call this week. When works?",time:"Mon 9:14am"},{id:2,from:"prospect",text:"Hey Coach! Thursday afternoon works great, anytime after 3pm",time:"Mon 11:32am"},{id:3,from:"coach",text:"Perfect — Thursday at 4pm. Looking forward to it.",time:"Mon 11:45am"}],null,[{id:"n1",text:"Great call Thursday. Very mature for 19. Academic interest in econ/finance — good Williams fit. Wants to visit in April.",date:"Mar 21, 2025",time:"4:45pm"}]),
    mkP(102,"Tyler Bergstrom","RW","USHL","Waterloo Black Hawks",18,40,14,18,"6'0\"","185",[mkEval("e1","Nov 9","USHL game",4,3,3,3,4)],"Power forward, below avg hands","B",[{id:1,from:"coach",text:"Tyler — Coach Davis. Big fan of how you battle along the boards. Would love to connect.",time:"Tue 8:55am"}],"Jun 2025",[]),
    mkP(103,"P. Sundqvist","LD","BCHL","Vernon Vipers",19,36,4,13,"6'2\"","197",[mkEval("e1","Oct 25","BCHL showcase",4,3,4,4,3),mkEval("e2","Jan 12","Vernon home game",4,3,4,4,4)],"Mobile puck-moving D, trending up","A",[{id:1,from:"coach",text:"Hey Patrick, Coach Davis from Williams. Watched you twice this year — exactly the type of D we're looking for.",time:"Feb 1, 9:00am"},{id:2,from:"prospect",text:"Thanks Coach! Would love to learn more about Williams.",time:"Feb 1, 11:30am"}],null,[{id:"n1",text:"Strong academic record per BCHL coach. GPA 3.7. Will fit Williams admissions profile.",date:"Feb 3, 2025",time:"8:45am"}]),
    mkP(104,"A. Lehtinen","C","NAHL","Lone Star Brahmas",18,42,13,21,"6'1\"","182",[mkEval("e1","Dec 1","NAHL showcase",4,4,3,4,3)],"Two-way center, good in his own zone","B",[{id:1,from:"coach",text:"Hey Alex, saw you last weekend vs. Corpus — really liked your compete level. Worth a quick call.",time:"Jan 20, 8:30am"}],null,[]),
    mkP(105,"C. Makela","RW","CCHL","Ottawa Jr. Senators",19,38,12,15,"5'11\"","180",[mkEval("e1","Nov 14","CCHL game",3,4,2,4,4)],"Crafty winger, explosive skater","B",[{id:1,from:"coach",text:"Chris — Coach Davis from Williams. Caught you vs. Carleton Place. Quick hands, love the compete.",time:"Feb 5, 9:15am"},{id:2,from:"prospect",text:"Thank you so much Coach! Williams is definitely on my list.",time:"Feb 5, 1:00pm"}],"Sep 2025",[]),
    mkP(106,"D. Koivunen","D","OJHL","Mississauga Chargers",18,37,3,11,"6'3\"","206",[mkEval("e1","Oct 30","OJHL showcase",4,3,5,3,4)],"Big stay-at-home D, good instincts","A",[{id:1,from:"coach",text:"Hey Dan, Coach Davis. Watched your last three games — great feet for a big D. Can we connect?",time:"Jan 28, 8:00am"}],null,[]),
    mkP(107,"E. Hakala","C","USHL","Sioux City Musketeers",18,41,9,19,"6'0\"","183",[mkEval("e1","Sep 22","USHL opener",3,4,3,4,3)],"High-IQ center, needs to shoot more","B",[{id:1,from:"coach",text:"Eric — Coach Davis. Big fan of your hockey sense. Interested in talking?",time:"Feb 10, 9:00am"},{id:2,from:"prospect",text:"Absolutely Coach, I'd love that!",time:"Feb 10, 12:00pm"}],null,[]),
    mkP(108,"F. Bergqvist","LW","BCHL","Penticton Vees",19,35,11,13,"6'1\"","187",[mkEval("e1","Nov 22","BCHL showcase",3,3,3,4,4)],"Work-rate winger, not flashy but reliable","B",[{id:1,from:"coach",text:"Filip, Coach Davis here. Liked what I saw vs. Vernon. Would love to connect.",time:"Jan 15, 9:30am"}],"May 2025",[]),
    mkP(109,"G. Aalto","D","CCHL","Carleton Place Canadians",19,40,5,10,"6'2\"","199",[mkEval("e1","Dec 8","CCHL showcase",4,3,4,4,3)],"Good gap control, smart positional D","B",[{id:1,from:"coach",text:"Gunnar — watched your CCHL showcase tape. Really liked the hockey IQ. Free for a call?",time:"Feb 3, 10:00am"},{id:2,from:"prospect",text:"Hi Coach! Yes definitely, how about Thursday?",time:"Feb 3, 2:00pm"}],null,[{id:"n1",text:"Mentioned Williams is his top choice academically. Very motivated student.",date:"Feb 6, 2025",time:"11:00am"}]),
    mkP(110,"H. Picard","RW","NAHL","Amarillo Bulls",18,39,10,12,"6'0\"","184",[mkEval("e1","Nov 5","NAHL showcase",3,3,3,3,4)],"Grinding winger, character player","C",[{id:1,from:"coach",text:"Henri — Coach Davis from Williams. Saw you vs. Lone Star. Big fan of how hard you work.",time:"Jan 25, 9:00am"}],null,[]),
    mkP(111,"I. Saarinen","G","OJHL","Aurora Tigers",19,26,0,1,"6'2\"","191",[mkEval("e1","Oct 12","OJHL game",3,4,3,4,4)],"GAA 2.68 .914 — solid but needs more data","B",[{id:1,from:"coach",text:"Ilmari — Coach Davis. Watched your last two starts. Impressive composure. Worth talking?",time:"Feb 8, 9:15am"}],null,[]),
    mkP(112,"J. Virtanen","C","BCHL","Salmon Arm Silverbacks",18,36,8,14,"5'11\"","176",[mkEval("e1","Dec 3","BCHL game",3,3,2,4,3)],"Smart but small — flagged for revisit","C",[{id:1,from:"coach",text:"Joonas — Coach Davis. Quick note — you showed up twice in scouting reports this month. Like what I see.",time:"Jan 30, 8:45am"},{id:2,from:"prospect",text:"Thank you Coach, means a lot!",time:"Jan 30, 11:00am"}],"Aug 2025",[]),
    mkP(113,"K. Lariviere","LD","USHL","Tri-City Storm",18,40,3,9,"6'2\"","198",[mkEval("e1","Nov 18","USHL game",3,3,4,3,3)],"Steady D, projects as a third pair guy","C",[{id:1,from:"coach",text:"Kyle — Coach Davis from Williams. Liked your USHL tape. Interested in talking?",time:"Feb 12, 9:00am"}],null,[]),
    mkP(114,"L. Thibodeau","RW","CCHL","Smith Falls Bears",19,37,9,11,"6'1\"","185",[mkEval("e1","Dec 10","CCHL game",3,3,3,3,3)],"Energy winger, needs to improve hands","C",[{id:1,from:"coach",text:"Luc — Coach Davis. Catching you vs. Carleton Place next week. Looking forward to it.",time:"Feb 14, 8:30am"}],null,[]),
    mkP(115,"M. Korhonen","D","NAHL","Shreveport Mudbugs",18,41,2,8,"6'2\"","200",[mkEval("e1","Jan 8","NAHL game",3,2,4,3,3)],"Raw but has the frame — long-term project","C",[{id:1,from:"coach",text:"Mikko — Coach Davis from Williams. Worth a conversation when you have time.",time:"Feb 16, 9:00am"}],null,[]),
  ],
  building: [
    mkP(201,"Dmitri Volkov","LW","CCHL","Carleton Place Canadians",20,36,29,33,"5'11\"","180",[mkEval("e1","Sep 14","CCHL opener",4,4,3,4,4),mkEval("e2","Nov 22","CCHL showcase",5,5,3,4,4),mkEval("e3","Feb 1","Carleton Place playoffs",5,5,3,5,4)],"Campus visit scheduled March 28 — trending up all season","A",[{id:1,from:"coach",text:"Hey Dmitri, Coach Davis. Watched your last 3 games — exactly what we're looking for.",time:"Feb 3, 9:02am"},{id:2,from:"prospect",text:"Coach Davis! Yes absolutely — I'd love to talk.",time:"Feb 3, 2:17pm"},{id:3,from:"coach",text:"Friday or Thursday work?",time:"Feb 3, 2:45pm"},{id:4,from:"prospect",text:"Friday works. Free after 5pm EST",time:"Feb 3, 3:10pm"},{id:5,from:"coach",text:"Perfect. Talk Friday 5:30.",time:"Feb 3, 3:14pm"}],null,[{id:"n1",text:"Agent: Stepan Kozlov in Ottawa. Very responsive. Dmitri's priority is academics — Williams' rep is a real selling point.",date:"Feb 5, 2025",time:"9:00am"},{id:"n2",text:"Campus visit confirmed March 28. Wants to meet econ faculty — set that up.",date:"Feb 18, 2025",time:"2:30pm"}]),
    mkP(202,"Q. Lindqvist","C","BCHL","Vernon Vipers",19,38,17,22,"6'0\"","183",[mkEval("e1","Oct 5","BCHL showcase",4,4,3,4,3),mkEval("e2","Dec 18","Vernon home game",4,4,3,5,4)],"Intelligent center, strong leadership qualities","A",[{id:1,from:"coach",text:"Quinn, Coach Davis. Love your two-way game. Can we get on a call this week?",time:"Jan 10, 9:00am"},{id:2,from:"prospect",text:"Yes Coach, how about Wednesday?",time:"Jan 10, 11:00am"},{id:3,from:"coach",text:"Wednesday at 4pm perfect.",time:"Jan 10, 11:30am"},{id:4,from:"prospect",text:"Great! Excited to learn more about Williams.",time:"Jan 10, 11:35am"}],null,[{id:"n1",text:"Great call. Captain of his team. Academic interest in econ. Strong fit all around.",date:"Jan 13, 2025",time:"3:00pm"}]),
    mkP(203,"R. Koistinen","D","OJHL","Aurora Tigers",19,37,6,16,"6'2\"","200",[mkEval("e1","Nov 1","OJHL showcase",4,3,4,4,4),mkEval("e2","Jan 20","Aurora playoff run",4,4,4,5,4)],"Smart offensive D, good PP QB","A",[{id:1,from:"coach",text:"Riku — Coach Davis. Your OJHL tape is exactly what we need on our blue line.",time:"Jan 5, 9:30am"},{id:2,from:"prospect",text:"Coach, I've heard great things about Williams. Very interested.",time:"Jan 5, 1:00pm"},{id:3,from:"coach",text:"Let's set up a call. This week work?",time:"Jan 5, 1:30pm"},{id:4,from:"prospect",text:"Thursday works great Coach.",time:"Jan 5, 2:00pm"},{id:5,from:"coach",text:"Thursday at 5pm. Looking forward to it.",time:"Jan 5, 2:10pm"}],null,[{id:"n1",text:"Dad played D3 at RPI. Family very familiar with D3 hockey culture.",date:"Jan 9, 2025",time:"10:00am"}]),
    mkP(204,"S. Manninen","LW","USHL","Tri-City Storm",18,41,16,18,"6'1\"","186",[mkEval("e1","Sep 28","USHL opener",4,4,3,3,4),mkEval("e2","Dec 14","Tri-City showcase",4,4,3,4,5)],"High-motor winger, competes every shift","B",[{id:1,from:"coach",text:"Sami — Coach Davis from Williams. Your compete level is exactly what we look for.",time:"Jan 18, 9:00am"},{id:2,from:"prospect",text:"Thank you Coach, Williams has always interested me.",time:"Jan 18, 12:00pm"},{id:3,from:"coach",text:"Good — can we set up a call?",time:"Jan 18, 12:30pm"},{id:4,from:"prospect",text:"Absolutely, any day this week.",time:"Jan 18, 12:45pm"}],"Dec 2025",[]),
    mkP(205,"T. Hakkarainen","G","CCHL","Ottawa Jr. Senators",19,30,0,2,"6'3\"","193",[mkEval("e1","Oct 22","CCHL showcase",4,4,4,4,5),mkEval("e2","Feb 5","Ottawa home game",4,4,4,5,5)],"GAA 2.28 .924 — quietly one of the best goalie prospects in CCHL","A",[{id:1,from:"coach",text:"Tuomas — Coach Davis. Watched three of your starts. Outstanding.",time:"Jan 22, 9:00am"},{id:2,from:"prospect",text:"Coach Davis! Yes, would love to talk!",time:"Jan 22, 11:00am"},{id:3,from:"coach",text:"Great — Friday at 4pm?",time:"Jan 22, 11:30am"},{id:4,from:"prospect",text:"Perfect.",time:"Jan 22, 11:45am"}],null,[{id:"n1",text:"Academic record strong — 3.9 GPA. Playing junior specifically to land an academic D3 school.",date:"Jan 25, 2025",time:"2:00pm"}]),
    mkP(206,"U. Koivunen","RW","BCHL","Salmon Arm Silverbacks",19,35,12,14,"6'1\"","185",[mkEval("e1","Nov 8","BCHL showcase",3,4,3,4,4),mkEval("e2","Jan 30","Salmon Arm home game",4,4,3,4,4)],"Improving every month — real upward trend","B",[{id:1,from:"coach",text:"Urho — Coach Davis. Two viewings now and you keep getting better.",time:"Feb 1, 9:00am"},{id:2,from:"prospect",text:"Thanks Coach! Really working hard this year.",time:"Feb 1, 10:00am"},{id:3,from:"coach",text:"It shows. Can we get on a call?",time:"Feb 1, 10:30am"},{id:4,from:"prospect",text:"Yes, this weekend works.",time:"Feb 1, 11:00am"}],null,[]),
    mkP(207,"V. Laaksonen","C","NAHL","Corpus Christi IceRays",18,42,14,20,"5'11\"","179",[mkEval("e1","Oct 15","NAHL showcase",4,4,2,5,3),mkEval("e2","Feb 10","Corpus Christi home game",4,4,3,5,4)],"Elite hockey sense, size the only question","A",[{id:1,from:"coach",text:"Ville — Coach Davis. Your hockey IQ is off the charts.",time:"Jan 28, 9:00am"},{id:2,from:"prospect",text:"Coach, Williams has been on my radar for a while!",time:"Jan 28, 10:00am"},{id:3,from:"coach",text:"Let's talk. Tuesday at 5?",time:"Jan 28, 10:30am"},{id:4,from:"prospect",text:"Perfect.",time:"Jan 28, 10:45am"},{id:5,from:"coach",text:"Great call Tuesday — campus visit in the works.",time:"Feb 4, 9:00am"},{id:6,from:"prospect",text:"Looking forward to it!",time:"Feb 4, 10:00am"}],null,[{id:"n1",text:"NAHL coach called proactively — said Ville is the smartest player he's coached in 10 years.",date:"Feb 2, 2025",time:"3:30pm"}]),
    mkP(208,"W. Soininen","D","OJHL","Mississauga Chargers",19,38,4,14,"6'2\"","202",[mkEval("e1","Nov 3","OJHL showcase",3,3,4,4,4),mkEval("e2","Jan 18","Mississauga home game",4,3,4,4,4)],"Reliable two-way D, improving each month","B",[{id:1,from:"coach",text:"Waltteri — Coach Davis. Two viewings in and you're exactly the D profile we're recruiting.",time:"Jan 20, 9:00am"},{id:2,from:"prospect",text:"Thank you Coach! Really excited to hear from you.",time:"Jan 20, 11:00am"},{id:3,from:"coach",text:"Let's connect this week.",time:"Jan 20, 11:30am"},{id:4,from:"prospect",text:"Thursday afternoon works.",time:"Jan 20, 12:00pm"}],"Mar 2026",[]),
  ],
  offer: [
    mkP(301,"Ben Ashworth","D","NAHL","New Mexico Ice Wolves",19,42,8,22,"6'1\"","198",[mkEval("e1","Oct 5","NAHL Showcase",4,4,4,4,5),mkEval("e2","Dec 14","New Mexico home game",4,4,4,5,5)],"Committed — waiting on paperwork","A",[{id:1,from:"coach",text:"Ben — Coach Davis. So excited about the offer!",time:"Mar 1, 8:30am"},{id:2,from:"prospect",text:"I'm thrilled. Williams has been a dream.",time:"Mar 1, 9:15am"},{id:3,from:"coach",text:"Take your time. We're here for any questions.",time:"Mar 1, 9:20am"},{id:4,from:"prospect",text:"Coach — I'm committing to Williams! Super excited 🎉",time:"Mar 8, 4:02pm"},{id:5,from:"coach",text:"BEN!! Welcome to the family!",time:"Mar 8, 4:05pm"}],null,[{id:"n1",text:"Parents very involved — his dad played D3 at Plattsburgh. Include them in all communication.",date:"Feb 28, 2025",time:"10:00am"}]),
    mkP(302,"X. Niemela","C","BCHL","Penticton Vees",19,39,18,24,"6'0\"","185",[mkEval("e1","Oct 15","BCHL showcase",4,4,3,5,4),mkEval("e2","Jan 8","Penticton home game",5,4,3,5,4),mkEval("e3","Feb 20","BCHL playoffs",5,5,3,5,5)],"Offer accepted — elite playmaker, best center in this class","A",[{id:1,from:"coach",text:"Xander — offer call was outstanding. We are so excited to have you.",time:"Mar 10, 9:00am"},{id:2,from:"prospect",text:"Coach, this was the easiest decision I've ever made. Williams is perfect.",time:"Mar 10, 10:00am"},{id:3,from:"coach",text:"That means the world. Let's get the paperwork moving.",time:"Mar 10, 10:30am"}],null,[{id:"n1",text:"Best player in BCHL by advanced metrics this year. Several NESCAC programs after him — act fast.",date:"Jan 15, 2025",time:"9:00am"},{id:"n2",text:"Verbal commitment confirmed. Emailed his family. Parents are thrilled.",date:"Mar 12, 2025",time:"11:00am"}]),
    mkP(303,"Y. Korhonen","LW","OJHL","Aurora Tigers",19,37,14,19,"6'1\"","186",[mkEval("e1","Nov 10","OJHL showcase",4,4,3,4,4),mkEval("e2","Feb 8","Aurora playoff run",4,5,3,5,5)],"Offer verbally accepted — skilled winger with elite compete level","A",[{id:1,from:"coach",text:"Yianni — just wanted to say again how thrilled we are.",time:"Mar 5, 9:00am"},{id:2,from:"prospect",text:"Coach, Williams was always my dream school. Can't wait.",time:"Mar 5, 10:00am"}],null,[{id:"n1",text:"Brother played at Bowdoin — family very familiar with NESCAC culture.",date:"Feb 25, 2025",time:"2:00pm"}]),
  ],
};

// ── Small shared components ──────────────────────────────────────────────────

function TierBadge({ tier }) {
  const c = { A:{ bg:"#0C2A1A", text:C.green, border:"#10B98133" }, B:{ bg:"#1A1A0C", text:C.gold, border:"#F59E0B33" }, C:{ bg:"#111827", text:C.muted, border:"#64748B33" } }[tier] || {};
  return <span style={{ fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4, background:c.bg, color:c.text, border:`1px solid ${c.border}`, fontFamily:"monospace", letterSpacing:1 }}>{tier}</span>;
}

function ScoreRing({ value, size=32 }) {
  const v = Number(value);
  const color = v >= 4 ? C.green : v >= 3 ? C.gold : C.muted;
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", width:size, height:size, borderRadius:"50%", border:`2px solid ${color}`, fontSize:size*0.34, fontWeight:700, color, fontFamily:"monospace", flexShrink:0 }}>{fmtScore(v)}</div>;
}

function ScoreBar({ value }) {
  const v = Number(value);
  const color = v >= 4 ? C.green : v >= 3 ? C.gold : C.muted;
  return <div style={{ height:4, background:C.border, borderRadius:2 }}><div style={{ height:"100%", width:`${(v/5)*100}%`, background:color, borderRadius:2 }} /></div>;
}

// ── Roster components ────────────────────────────────────────────────────────

function PlayerSlot({ player, swapMode, swapSelected, onSlotClick, recruitPlacement, onAddRecruit, onRemoveRecruit }) {
  const isOpen = player.status === "open";
  const isRef = player.status === "ref";
  const isRival = player.status === "rival";
  const isPipeline = player.prospectId != null;
  const yrDot = { Sr:C.red, Jr:"#F97316", So:C.accent, Fr:C.green };
  const topBorder = isOpen ? C.border+"33" : isRef ? C.gold+"88" : isRival ? C.border+"AA" : C.accent;
  const borderColor = isOpen ? C.border+"55" : C.border;
  const swapHighlight = Boolean(swapSelected);
  const statParts = getPlayerStatParts(player);
  const detailLineColor = "#94A3B8";
  const detailFont = 12.5;
  const detailParts = [];
  if (player.yr) detailParts.push({ kind: "yr", yr: player.yr });
  if (player.hand) detailParts.push({ kind: "txt", text: player.hand });
  if (player.ht) detailParts.push({ kind: "txt", text: player.ht });
  if (statParts) statParts.forEach((t, i) => detailParts.push({ kind: "txt", text: t, key: `s${i}` }));
  if (isPipeline && player.prospectLeague) {
    detailParts.push({ kind: "txt", text: `(${player.prospectLeague})`, key: "lg" });
  }

  const dotSep = (
    <span style={{ color:"#64748B", opacity:0.85, fontSize:11, lineHeight:1, padding:"0 0.2em", userSelect:"none", flexShrink:0 }} aria-hidden>
      ·
    </span>
  );

  const showAddRecruit = recruitPlacement && isOpen && onAddRecruit && !swapMode;
  const showRemovePipeline = !swapMode && isPipeline && onRemoveRecruit;

  return (
    <div
      onClick={swapMode && onSlotClick ? onSlotClick : undefined}
      onKeyDown={swapMode && onSlotClick ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSlotClick(); } } : undefined}
      role={swapMode && onSlotClick ? "button" : undefined}
      tabIndex={swapMode && onSlotClick ? 0 : undefined}
      style={{
        position: "relative",
        background:isOpen?"transparent":C.card,
        border:`1px solid ${swapHighlight ? C.accent : borderColor}`,
        boxShadow: swapHighlight ? `0 0 0 2px ${C.accent}66` : undefined,
        borderTop:`2px solid ${topBorder}`,
        borderRadius:8,
        padding:"7px 9px",
        minHeight:56,
        cursor: swapMode && onSlotClick ? "pointer" : undefined,
        outline: "none",
      }}
    >
      {showRemovePipeline && (
        <button
          type="button"
          title="Remove from lineup"
          onClick={e => { e.stopPropagation(); onRemoveRecruit(); }}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 22,
            height: 22,
            padding: 0,
            lineHeight: "20px",
            fontSize: 14,
            borderRadius: 4,
            border: `1px solid ${C.border}`,
            background: C.surface,
            color: C.muted,
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          ×
        </button>
      )}
      <div style={{ fontSize:9, color:C.muted, letterSpacing:1, marginBottom:3 }}>{player.pos}</div>
      {isOpen ? (
        <div>
          <div style={{ fontSize:10, color:C.muted+"99", fontStyle:"italic" }}>Open</div>
          {showAddRecruit && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onAddRecruit(); }}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "5px 6px",
                borderRadius: 5,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${C.accent}88`,
                background: "#0C1A2A",
                color: C.accent,
              }}
            >
              + Add recruit
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize:12, fontWeight:700, color:C.text, lineHeight:1.25, marginBottom:6, paddingRight: showRemovePipeline ? 20 : 0 }}>{player.name}</div>
          <div
            style={{
              display:"flex",
              flexWrap:"wrap",
              alignItems:"center",
              fontSize:detailFont,
              lineHeight:1.45,
              color:detailLineColor,
              fontWeight:500,
            }}
          >
            {detailParts.map((p, i) => (
              <Fragment key={p.kind === "yr" ? "yr" : p.key ?? `t${i}`}>
                {i > 0 && dotSep}
                {p.kind === "yr" ? (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, flexShrink:0 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:yrDot[p.yr]||C.muted, flexShrink:0 }} />
                    <span style={{ fontWeight:600 }}>{p.yr}</span>
                  </span>
                ) : (
                  <span style={{ fontVariantNumeric:"tabular-nums" }}>{p.text}</span>
                )}
              </Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RosterGrid({ roster, swapMode, swapPick, rosterKey, onSlotClick, recruitPlacement, onAddRecruit, onRemoveRecruit }) {
  const fwdLines = [[0,3],[3,6],[6,9],[9,12]].map(([s,e]) => roster.forwards.slice(s,e));
  const defLines = [[0,2],[2,4],[4,6]].map(([s,e]) => roster.defense.slice(s,e));
  const sel = swapPick;
  const isSel = (section, idx) =>
    Boolean(sel && rosterKey && sel.rosterKey === rosterKey && sel.section === section && sel.index === idx);
  return (
    <div>
      <SecLabel title="Forwards" />
      {fwdLines.map((line, lineIdx) => {
        const base = [0,3,6,9][lineIdx];
        return (
          <div key={lineIdx} style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5, marginBottom:5 }}>
            {line.map((p, j) => {
              const idx = base + j;
              return (
                <PlayerSlot
                  key={`f-${idx}`}
                  player={p}
                  swapMode={swapMode}
                  swapSelected={isSel("forwards", idx)}
                  onSlotClick={onSlotClick ? () => onSlotClick("forwards", idx) : undefined}
                  recruitPlacement={recruitPlacement}
                  onAddRecruit={onAddRecruit ? () => onAddRecruit("forwards", idx) : undefined}
                  onRemoveRecruit={onRemoveRecruit && p.prospectId != null ? () => onRemoveRecruit("forwards", idx) : undefined}
                />
              );
            })}
          </div>
        );
      })}
      <SecLabel title="Defense" mt="12px" />
      {defLines.map((pair, lineIdx) => {
        const base = [0,2,4][lineIdx];
        return (
          <div key={lineIdx} style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:5, marginBottom:5 }}>
            {pair.map((p, j) => {
              const idx = base + j;
              return (
                <PlayerSlot
                  key={`d-${idx}`}
                  player={p}
                  swapMode={swapMode}
                  swapSelected={isSel("defense", idx)}
                  onSlotClick={onSlotClick ? () => onSlotClick("defense", idx) : undefined}
                  recruitPlacement={recruitPlacement}
                  onAddRecruit={onAddRecruit ? () => onAddRecruit("defense", idx) : undefined}
                  onRemoveRecruit={onRemoveRecruit && p.prospectId != null ? () => onRemoveRecruit("defense", idx) : undefined}
                />
              );
            })}
          </div>
        );
      })}
      <SecLabel title="Goalies" mt="12px" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:5 }}>
        {roster.goalies.map((p, i) => (
          <PlayerSlot
            key={`g-${i}`}
            player={p}
            swapMode={swapMode}
            swapSelected={isSel("goalies", i)}
            onSlotClick={onSlotClick ? () => onSlotClick("goalies", i) : undefined}
            recruitPlacement={recruitPlacement}
            onAddRecruit={onAddRecruit ? () => onAddRecruit("goalies", i) : undefined}
            onRemoveRecruit={onRemoveRecruit && p.prospectId != null ? () => onRemoveRecruit("goalies", i) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function SecLabel({ title, sub, mt="8px" }) {
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", margin:`${mt} 0 7px` }}>
      <span style={{ fontSize:10, fontWeight:700, color:C.text, letterSpacing:0.5 }}>{title.toUpperCase()}</span>
      {sub && <span style={{ fontSize:10, color:C.muted }}>{sub}</span>}
    </div>
  );
}

function RosterLegend({ showRef, showRival }) {
  return (
    <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
      {[["Sr",C.red],["Jr","#F97316"],["So",C.accent],["Fr",C.green]].map(([yr,c]) => (
        <div key={yr} style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:7, height:7, borderRadius:2, background:c }} /><span style={{ fontSize:10, color:C.muted }}>{yr}</span></div>
      ))}
      {showRef && <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:7, height:7, borderRadius:2, background:C.gold+"55", border:`1px solid ${C.gold}` }} /><span style={{ fontSize:10, color:C.muted }}>Benchmark</span></div>}
      {showRival && <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:7, height:7, borderRadius:2, background:C.border, border:`1px solid ${C.border}` }} /><span style={{ fontSize:10, color:C.muted }}>Rival</span></div>}
    </div>
  );
}

function RosterViewToggle({ view, onChange }) {
  const isLineup = view === "lineup";
  const mkBtnStyle = active => ({
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.2,
    padding: "4px 9px",
    borderRadius: 5,
    cursor: "pointer",
    border: `1px solid ${active ? C.accent : C.border}`,
    background: active ? "#0C1A2A" : "transparent",
    color: active ? C.accent : C.muted,
  });
  return (
    <div style={{ display:"inline-flex", gap:6, alignItems:"center" }}>
      <button type="button" onClick={() => onChange("lineup")} style={mkBtnStyle(isLineup)}>Lineup View</button>
      <button type="button" onClick={() => onChange("class")} style={mkBtnStyle(!isLineup)}>Class List</button>
    </div>
  );
}

function ClassListRoster({ roster }) {
  const allPlayers = [...roster.forwards, ...roster.defense, ...roster.goalies];
  const buckets = { Sr: [], Jr: [], So: [], Fr: [], open: [] };
  allPlayers.forEach(player => {
    if (player.status === "open") {
      buckets.open.push(player);
      return;
    }
    const yr = player.yr;
    if (yr === "Sr" || yr === "Jr" || yr === "So" || yr === "Fr") buckets[yr].push(player);
    else buckets.open.push(player);
  });

  const groups = [
    { key: "Sr", title: "SENIORS", tint: "#EF44441A", border: "#EF444433" },
    { key: "Jr", title: "JUNIORS", tint: "#F973161A", border: "#F9731633" },
    { key: "So", title: "SOPHOMORES", tint: "#0EA5E91A", border: "#0EA5E933" },
    { key: "Fr", title: "FRESHMEN", tint: "#10B9811A", border: "#10B98133" },
    { key: "open", title: "OPEN SLOTS", tint: "#64748B14", border: "#64748B33" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {groups.map(g => {
        const rows = buckets[g.key];
        if (!rows.length) return null;
        return (
          <div key={g.key} style={{ border:`1px solid ${g.border}`, borderRadius:8, background:g.tint, overflow:"hidden" }}>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:0.6, fontWeight:700, padding:"8px 10px", borderBottom:`1px solid ${g.border}` }}>
              {g.title} ({rows.length})
            </div>
            <div style={{ overflowX:"auto" }}>
              {rows.map((p, idx) => (
                <div
                  key={`${g.key}-${idx}-${p.name || p.pos}`}
                  style={{
                    display:"grid",
                    gridTemplateColumns:"minmax(160px,1.4fr) 48px 48px 62px minmax(220px,2fr)",
                    gap:8,
                    alignItems:"center",
                    padding:"8px 10px",
                    borderBottom: idx < rows.length - 1 ? `1px solid ${g.border}` : "none",
                  }}
                >
                  <div style={{ color:C.text, fontSize:12, fontWeight:700 }}>
                    {p.status === "open" ? "Open Slot" : p.name}
                  </div>
                  <div style={{ color:C.muted, fontSize:10, fontWeight:600, letterSpacing:0.5 }}>{p.pos || "—"}</div>
                  <div style={{ color:C.muted, fontSize:11 }}>{p.hand || "—"}</div>
                  <div style={{ color:C.muted, fontSize:11 }}>{p.ht || "—"}</div>
                  <div style={{ color:"#A3B3C8", fontSize:11, fontFamily:"monospace" }}>
                    {p.status === "open" ? "Open" : rosterPlayerStatLine(p)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecruitPickerModal({ slotPos, prospects, onPick, onClose }) {
  const tierOrder = { A: 0, B: 1, C: 2 };
  const sorted = [...prospects].sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9) || String(a.name).localeCompare(String(b.name)));
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: 16, maxWidth: 420, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="recruit-picker-title"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div id="recruit-picker-title" style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Add pipeline recruit</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Slot: {slotPos} · Fr. year · same stats as pipeline card</div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4 }} aria-label="Close">
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 120 }}>
          {sorted.length === 0 ? (
            <div style={{ fontSize: 12, color: C.muted, padding: "12px 0", textAlign: "center" }}>No matching prospects for this slot (check position), or all are already placed on this lineup.</div>
          ) : (
            sorted.map(p => {
              const avg = compositeAvg(avgScores(p.evals));
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPick(p)}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 11px",
                    marginBottom: 6,
                    borderRadius: 7,
                    border: `1px solid ${C.border}`,
                    background: C.card,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{p.pos} · {p.team} · {p.league}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <TierBadge tier={p.tier} />
                    <ScoreRing value={avg} size={28} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pipeline card ────────────────────────────────────────────────────────────

function ProspectCard({ prospect, onClick, selected }) {
  const scores = avgScores(prospect.evals);
  const avg = compositeAvg(scores);
  const msgs = prospect.messages?.length || 0;
  const evalCount = prospect.evals?.length || 0;
  const noteCount = prospect.notes?.length || 0;
  const birthYear = getProspectBirthYear(prospect) ?? "—";
  const posGroup = getProspectPositionBucket(prospect.pos);
  const handed = getProspectHandedness(prospect);
  const statLine = formatProspectCardStatLine(prospect);
  return (
    <div onClick={() => onClick(prospect)} style={{ background:selected?"#1E3048":C.card, border:`1px solid ${selected?C.accent:C.border}`, borderRadius:10, padding:"10px 12px", cursor:"pointer", marginBottom:7 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:1 }}>{prospect.name}</div>
          <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>{birthYear} · {posGroup} · {handed}</div>
          <div style={{ fontSize:10, color:C.accent, fontFamily:"monospace", marginBottom:2 }}>{statLine}</div>
          <div style={{ fontSize:10, color:C.muted }}>{prospect.team} [{prospect.league}]</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
          <TierBadge tier={prospect.tier} />
          <ScoreRing value={avg} />
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center" }}>
        <div style={{ display:"flex", gap:7 }}>
          {evalCount > 0 && <span style={{ fontSize:10, color:C.purple }}>👁 {evalCount}</span>}
          {noteCount > 0 && <span style={{ fontSize:10, color:C.gold }}>📝 {noteCount}</span>}
          {msgs > 0 && <span style={{ fontSize:10, color:C.accent }}>💬 {msgs}</span>}
          {prospect.nudge && <span style={{ fontSize:10, color:C.gold }}>⏰</span>}
        </div>
      </div>
    </div>
  );
}

// ── Detail panel tabs ────────────────────────────────────────────────────────

function EvaluationsTab({ prospect, onAddEval }) {
  const [adding, setAdding] = useState(false);
  const [context, setContext] = useState("");
  const [ns, setNs] = useState({ skating:3, skill:3, size:3, sense:3, spirit:3 });
  const evals = prospect.evals || [];
  const rolling = avgScores(evals);
  const rollingAvg = compositeAvg(rolling);

  function handleSave() {
    if (!context.trim()) return;
    const today = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    onAddEval(prospect.id, { id:`e${Date.now()}`, date:today, context:context.trim(), scores:{...ns} });
    setAdding(false); setContext(""); setNs({ skating:3, skill:3, size:3, sense:3, spirit:3 });
  }

  return (
    <div style={{ flex:1, overflowY:"auto", padding:12 }}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:12, marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.text, letterSpacing:0.5 }}>ROLLING AVG · {evals.length} VIEWING{evals.length!==1?"S":""}</span>
          <ScoreRing value={rollingAvg} size={36} />
        </div>
        {DIMS.map(d => (
          <div key={d} style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:10, color:C.muted }}>{DIM_LABELS[d]}</span>
              <span style={{ fontSize:10, fontWeight:700, color:C.accent, fontFamily:"monospace" }}>{fmtScore(rolling[d])}</span>
            </div>
            <ScoreBar value={rolling[d]} />
          </div>
        ))}
      </div>
      {evals.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.text, letterSpacing:0.5, marginBottom:8 }}>EVALUATION HISTORY</div>
          {[...evals].reverse().map((ev, i) => {
            const evAvg = compositeAvg(ev.scores);
            const prev = i < evals.length-1 ? evals[evals.length-2-i] : null;
            const delta = prev ? evAvg - compositeAvg(prev.scores) : null;
            return (
              <div key={ev.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", marginBottom:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                  <div><div style={{ fontSize:12, fontWeight:700, color:C.text }}>{ev.context}</div><div style={{ fontSize:10, color:C.muted }}>{ev.date}</div></div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    {delta !== null && <span style={{ fontSize:10, fontWeight:700, color:delta>0?C.green:delta<0?C.red:C.muted, fontFamily:"monospace" }}>{delta>0?"↑":delta<0?"↓":"→"}{Math.abs(delta).toFixed(1)}</span>}
                    <ScoreRing value={evAvg} size={30} />
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:4 }}>
                  {DIMS.map(d => <div key={d} style={{ textAlign:"center" }}><div style={{ fontSize:9, color:C.muted, marginBottom:1 }}>{d.slice(0,2).toUpperCase()}</div><div style={{ fontSize:11, fontWeight:700, color:C.accent, fontFamily:"monospace" }}>{ev.scores[d]}</div></div>)}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!adding ? (
        <button onClick={() => setAdding(true)} style={{ width:"100%", padding:"9px", borderRadius:7, cursor:"pointer", background:"transparent", border:`1px dashed ${C.accent}`, color:C.accent, fontSize:12, fontWeight:600 }}>+ Log New Evaluation</button>
      ) : (
        <div style={{ background:C.card, border:`1px solid ${C.accent}`, borderRadius:9, padding:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.accent, marginBottom:10 }}>NEW EVALUATION</div>
          <input value={context} onChange={e => setContext(e.target.value)} placeholder="Tournament / game context..." style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 9px", fontSize:12, color:C.text, outline:"none", marginBottom:10, boxSizing:"border-box" }} />
          {DIMS.map(d => (
            <div key={d} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}><span style={{ fontSize:10, color:C.muted }}>{DIM_LABELS[d]}</span><span style={{ fontSize:10, fontWeight:700, color:C.accent, fontFamily:"monospace" }}>{ns[d]}/5</span></div>
              <div style={{ display:"flex", gap:3 }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setNs(s=>({...s,[d]:n}))} style={{ flex:1, height:22, borderRadius:3, cursor:"pointer", border:"none", background:n<=ns[d]?C.accent:C.border }} />)}</div>
            </div>
          ))}
          <div style={{ display:"flex", gap:7, marginTop:10 }}>
            <button onClick={handleSave} style={{ flex:1, padding:"8px", borderRadius:6, cursor:"pointer", background:C.accent, border:"none", color:"#fff", fontSize:12, fontWeight:600 }}>Save</button>
            <button onClick={() => setAdding(false)} style={{ padding:"8px 12px", borderRadius:6, cursor:"pointer", background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:12 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotesTab({ prospect, onAddNote }) {
  const [draft, setDraft] = useState("");
  const notes = prospect.notes || [];
  function handleAdd() {
    if (!draft.trim()) return;
    const today = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    const now = new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
    onAddNote(prospect.id, { id:`n${Date.now()}`, text:draft.trim(), date:today, time:now });
    setDraft("");
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
      <div style={{ flex:1, overflowY:"auto", padding:12 }}>
        {notes.length === 0 ? <div style={{ textAlign:"center", padding:"24px 0", fontSize:11, color:C.muted }}>No notes yet</div> : [...notes].reverse().map(n => (
          <div key={n.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 11px", marginBottom:7 }}>
            <div style={{ fontSize:12, color:C.text, lineHeight:1.6, marginBottom:5 }}>{n.text}</div>
            <div style={{ fontSize:9, color:C.muted }}>{n.date} · {n.time}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:"8px 10px", borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
        <textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleAdd(); }}} placeholder="Add a note..." rows={2} style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:7, padding:"7px 9px", fontSize:12, color:C.text, resize:"none", outline:"none", fontFamily:"inherit", lineHeight:1.4, boxSizing:"border-box", marginBottom:6 }} />
        <button onClick={handleAdd} disabled={!draft.trim()} style={{ width:"100%", padding:"7px", borderRadius:6, cursor:draft.trim()?"pointer":"default", background:draft.trim()?C.accent:"transparent", border:`1px solid ${draft.trim()?C.accent:C.border}`, color:draft.trim()?"#fff":C.muted, fontSize:12, fontWeight:600 }}>Save Note</button>
      </div>
    </div>
  );
}

function SMSThread({ prospect, onSend }) {
  const [draft, setDraft] = useState("");
  const msgs = prospect.messages || [];
  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
      <div style={{ padding:"8px 14px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.text }}>SMS THREAD</div>
        <div style={{ fontSize:10, color:C.muted }}>via IceBoard · auto-logged</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"10px 14px", display:"flex", flexDirection:"column", gap:8 }}>
        {msgs.length === 0 ? <div style={{ textAlign:"center", padding:"20px 0" }}><div style={{ fontSize:11, color:C.muted }}>No messages yet</div><div style={{ fontSize:10, color:C.accent, marginTop:4 }}>⚡ First text auto-advances to Contact Made</div></div>
        : msgs.map(msg => (
          <div key={msg.id} style={{ display:"flex", flexDirection:"column", alignItems:msg.from==="coach"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"80%", padding:"7px 11px", borderRadius:msg.from==="coach"?"10px 10px 2px 10px":"10px 10px 10px 2px", background:msg.from==="coach"?C.accent:C.card, border:msg.from==="prospect"?`1px solid ${C.border}`:"none", fontSize:12, color:C.text, lineHeight:1.5 }}>{msg.text}</div>
            <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{msg.time}{msg.from==="coach"?" · ✓✓":""}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:"7px 10px", borderTop:`1px solid ${C.border}`, display:"flex", gap:7, alignItems:"flex-end", flexShrink:0 }}>
        <textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(draft.trim()){onSend(draft.trim());setDraft("");}}}} placeholder={`Text ${prospect.name.split(" ")[0]}...`} rows={2} style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:7, padding:"6px 9px", fontSize:12, color:C.text, resize:"none", outline:"none", fontFamily:"inherit", lineHeight:1.4 }} />
        <button onClick={() => { if(draft.trim()){onSend(draft.trim());setDraft("");}}} style={{ background:draft.trim()?C.accent:C.border, border:"none", borderRadius:7, width:32, height:32, cursor:"pointer", fontSize:14, flexShrink:0 }}>➤</button>
      </div>
    </div>
  );
}

function NudgeTab({ prospect, onSetNudge }) {
  const [sel, setSel] = useState(prospect.nudge||"");
  const opts = ["1 month","2 months","3 months","6 months","Next fall","Next season"];
  return (
    <div style={{ padding:12 }}>
      <div style={{ fontSize:11, color:C.muted, lineHeight:1.6, marginBottom:12 }}>Set a reminder to check back in with {prospect.name.split(" ")[0]}. No prospect falls through the cracks.</div>
      {prospect.nudge && <div style={{ background:"#0C1A2A", border:`1px solid ${C.gold}33`, borderLeft:`3px solid ${C.gold}`, borderRadius:7, padding:"7px 11px", marginBottom:12, fontSize:11, color:C.gold }}>⏰ Current: {prospect.nudge}</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {opts.map(o => <button key={o} onClick={() => setSel(o)} style={{ padding:"9px 12px", borderRadius:7, cursor:"pointer", textAlign:"left", fontSize:12, background:sel===o?"#0C1A2A":"transparent", border:`1px solid ${sel===o?C.gold:C.border}`, color:sel===o?C.gold:C.text }}>{sel===o?"✓ ":""}{o}</button>)}
      </div>
      <button onClick={() => onSetNudge(prospect.id, sel)} disabled={!sel} style={{ marginTop:12, width:"100%", padding:"9px", borderRadius:7, cursor:sel?"pointer":"default", background:sel?C.gold:"transparent", border:`1px solid ${sel?C.gold:C.border}`, color:sel?"#000":C.muted, fontSize:12, fontWeight:600 }}>Set Nudge</button>
      {prospect.nudge && <button onClick={() => { onSetNudge(prospect.id,null); setSel(""); }} style={{ marginTop:6, width:"100%", padding:"7px", borderRadius:7, cursor:"pointer", background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:11 }}>Clear nudge</button>}
    </div>
  );
}

function ProspectDetail({ prospect, onClose, onMove, onSend, onAddEval, onSetNudge, onAddNote }) {
  const [tab, setTab] = useState("evals");
  const msgs = prospect.messages||[];
  const evalCount = prospect.evals?.length||0;
  const noteCount = prospect.notes?.length||0;
  const TABS = [["evals",`Evals (${evalCount})`],["notes",`Notes${noteCount>0?` (${noteCount})`:""}`],["sms",`SMS${msgs.length>0?` (${msgs.length})`:""}`],["move","Move"],["nudge",prospect.nudge?"⏰ Nudge":"Nudge"]];
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.surface, borderLeft:`1px solid ${C.border}`, overflow:"hidden" }}>
      <div style={{ padding:"12px 16px 0", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <div>
            <div style={{ display:"flex", gap:7, marginBottom:3 }}><TierBadge tier={prospect.tier} /><span style={{ fontSize:10, color:C.muted }}>{prospect.pos} · {prospect.league}</span></div>
            <div style={{ fontSize:17, fontWeight:800, color:C.text }}>{prospect.name}</div>
            <div style={{ fontSize:11, color:C.muted }}>{prospect.team} · Age {prospect.age}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18 }}>×</button>
        </div>
        <div style={{ display:"flex", overflowX:"auto" }}>
          {TABS.map(([t,l]) => <button key={t} onClick={() => setTab(t)} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px 11px", fontSize:11, fontWeight:600, color:tab===t?C.accent:C.muted, borderBottom:`2px solid ${tab===t?C.accent:"transparent"}`, whiteSpace:"nowrap" }}>{l}</button>)}
        </div>
      </div>
      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {tab==="evals" && <EvaluationsTab prospect={prospect} onAddEval={onAddEval} />}
        {tab==="notes" && <NotesTab prospect={prospect} onAddNote={onAddNote} />}
        {tab==="sms" && <SMSThread prospect={prospect} onSend={(text) => onSend(prospect.id,text)} />}
        {tab==="move" && (
          <div style={{ padding:12 }}>
            <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>MOVE TO STAGE</div>
            {COLUMNS.map(col => <button key={col.key} onClick={() => { onMove(prospect.id,col.key); setTab("evals"); }} style={{ display:"block", width:"100%", padding:"8px 12px", borderRadius:6, cursor:"pointer", textAlign:"left", fontSize:12, background:"transparent", border:`1px solid ${C.border}`, color:C.text, marginBottom:5 }} onMouseEnter={e => { e.currentTarget.style.borderColor=col.color; e.currentTarget.style.color=col.color; }} onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.text; }}>→ {col.label}</button>)}
          </div>
        )}
        {tab==="nudge" && <NudgeTab prospect={prospect} onSetNudge={onSetNudge} />}
      </div>
    </div>
  );
}

// ── Trending Players ─────────────────────────────────────────────────────────

function AvailBadge({ status }) {
  const c = { Available:{bg:"#0C2A1A",text:C.green,border:"#10B98133"}, Committed:{bg:"#1A0C0C",text:C.red,border:"#EF444433"}, Unknown:{bg:"#1A1A0C",text:C.gold,border:"#F59E0B33"} }[status]||{};
  return <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:4, background:c.bg, color:c.text, border:`1px solid ${c.border}`, fontFamily:"monospace" }}>{status}</span>;
}

function TrendingCard({ player, onAdd, onRemove }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", marginBottom:7 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
        <div><div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:1 }}>{player.name}</div><div style={{ fontSize:10, color:C.muted }}>{player.pos} · {player.team} · {player.league}</div></div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}><AvailBadge status={player.availability} /><span style={{ fontSize:9, color:C.muted }}>Age {player.age}</span></div>
      </div>
      <div style={{ background:C.bg, borderRadius:6, padding:"5px 8px", marginBottom:8, fontSize:11, color:C.gold }}>🏒 {player.weekend}</div>
      <div style={{ display:"flex", gap:6 }}>
        {!player.onBoard ? <button onClick={() => onAdd(player)} style={{ flex:1, padding:"6px", borderRadius:6, cursor:"pointer", background:"transparent", border:`1px solid ${C.accent}`, color:C.accent, fontSize:11, fontWeight:600 }}>+ Add to Pipeline</button>
        : <div style={{ flex:1, padding:"6px", borderRadius:6, background:"#0C1A2A", border:`1px solid ${C.accent}33`, color:C.accent, fontSize:11, textAlign:"center" }}>✓ On your board</div>}
        <button onClick={() => onRemove(player.id)} style={{ padding:"6px 10px", borderRadius:6, cursor:"pointer", background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:11 }}>Remove</button>
      </div>
    </div>
  );
}

function TrendingTab({ allProspects }) {
  const [view, setView] = useState("pipeline");
  const [removedIds, setRemovedIds] = useState([]);
  const [added, setAdded] = useState([]);
  const pipelineNames = allProspects.map(p => p.name);
  const enrichedPipeline = TRENDING_PIPELINE.map(p => ({...p, onBoard:pipelineNames.includes(p.name)})).filter(p => !removedIds.includes(p.id));
  const enrichedLeague = TRENDING_LEAGUE.map(p => ({...p, onBoard:added.includes(p.id)})).filter(p => !removedIds.includes(p.id));
  const removedAll = [...TRENDING_PIPELINE,...TRENDING_LEAGUE].filter(p => removedIds.includes(p.id));
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 16px", display:"flex", flexShrink:0 }}>
        {[["pipeline","My Pipeline"],["league","League Feed"],["removed",`Removed (${removedIds.length})`]].map(([v,l]) => <button key={v} onClick={() => setView(v)} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 13px", fontSize:11, fontWeight:600, color:view===v?C.accent:C.muted, borderBottom:`2px solid ${view===v?C.accent:"transparent"}` }}>{l}</button>)}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
        {view==="pipeline" && <><div style={{ background:C.card, border:`1px solid ${C.accent}33`, borderLeft:`3px solid ${C.accent}`, borderRadius:7, padding:"7px 11px", marginBottom:12, fontSize:11, color:C.accent }}>Top performers from this weekend who are already on your board — prioritize your touchpoints</div>{enrichedPipeline.map(p => <TrendingCard key={p.id} player={p} onAdd={id => setAdded(a=>[...a,id])} onRemove={id => setRemovedIds(r=>[...r,id])} />)}</>}
        {view==="league" && <><div style={{ background:C.card, border:`1px solid ${C.gold}33`, borderLeft:`3px solid ${C.gold}`, borderRadius:7, padding:"7px 11px", marginBottom:12, fontSize:11, color:C.gold }}>All top performers this weekend across target leagues — add to pipeline or remove committed players</div>{enrichedLeague.map(p => <TrendingCard key={p.id} player={p} onAdd={p => setAdded(a=>[...a,p.id])} onRemove={id => setRemovedIds(r=>[...r,id])} />)}</>}
        {view==="removed" && (removedAll.length===0 ? <div style={{ textAlign:"center", padding:"32px 0", fontSize:12, color:C.muted }}>No removed players</div> : removedAll.map(p => <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", marginBottom:7, opacity:0.6 }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><div><div style={{ fontSize:12, fontWeight:700, color:C.text }}>{p.name}</div><div style={{ fontSize:10, color:C.muted }}>{p.pos} · {p.league} · {p.weekend}</div></div><button onClick={() => setRemovedIds(r => r.filter(id => id!==p.id))} style={{ fontSize:10, padding:"4px 8px", borderRadius:5, cursor:"pointer", background:"transparent", border:`1px solid ${C.border}`, color:C.muted }}>Restore</button></div></div>))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function IceBoard() {
  const [school, setSchool] = useState("Williams College");
  const [prospects, setProspects] = useState(INITIAL_PROSPECTS);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("pipeline");
  const [warRoomTabId, setWarRoomTabId] = useState("williams-2526");
  const [futureProjections, setFutureProjections] = useState([]);
  const [customWarRosters, setCustomWarRosters] = useState([]);
  const [customBenchmarkRosters, setCustomBenchmarkRosters] = useState([]);
  const [compareRosterId, setCompareRosterId] = useState(null);
  const [benchmarkTabId, setBenchmarkTabId] = useState("bench-cornell");
  const [warRoomModal, setWarRoomModal] = useState(null);
  const [rivalTab, setRivalTab] = useState(0);
  const [notification, setNotification] = useState(null);
  const [rosterEdits, setRosterEdits] = useState({});
  const [warRoomRosterView, setWarRoomRosterView] = useState("lineup");
  const [rivalRosterView, setRivalRosterView] = useState("lineup");
  const [swapModeWar, setSwapModeWar] = useState(false);
  const [swapModeRival, setSwapModeRival] = useState(false);
  const [swapPick, setSwapPick] = useState(null);
  const [recruitPickerTarget, setRecruitPickerTarget] = useState(null);
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [pipelinePosFilter, setPipelinePosFilter] = useState("all");
  const [pipelineHandFilter, setPipelineHandFilter] = useState("all");
  const [pipelineTierFilter, setPipelineTierFilter] = useState("all");
  const [pipelineLeagueFilter, setPipelineLeagueFilter] = useState("all");
  const [pipelineMinRating, setPipelineMinRating] = useState("all");
  const [pipelineBirthYearFilter, setPipelineBirthYearFilter] = useState("all");
  const [pipelineLastContactFilter, setPipelineLastContactFilter] = useState("all");

  applySchoolTheme(school);

  const allProspects = Object.values(prospects).flat();

  const pipelineLeagueOptions = useMemo(
    () => Array.from(new Set(allProspects.map(p => p.league).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b))),
    [allProspects]
  );
  const pipelineBirthYearOptions = useMemo(
    () => Array.from(new Set(allProspects.map(getProspectBirthYear).filter(v => v != null))).sort((a, b) => b - a),
    [allProspects]
  );
  const filteredProspects = useMemo(() => {
    const q = pipelineSearch.trim().toLowerCase();
    const minRating = pipelineMinRating === "all" ? null : Number(pipelineMinRating);
    const match = (p) => {
      if (q) {
        const hay = `${p.name || ""} ${p.team || ""} ${p.league || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (pipelinePosFilter !== "all" && getProspectPositionBucket(p.pos) !== pipelinePosFilter) return false;
      if (pipelineHandFilter !== "all" && getProspectHandedness(p) !== pipelineHandFilter) return false;
      if (pipelineTierFilter !== "all" && p.tier !== pipelineTierFilter) return false;
      if (pipelineLeagueFilter !== "all" && p.league !== pipelineLeagueFilter) return false;
      if (minRating != null && compositeAvg(avgScores(p.evals)) < minRating) return false;
      if (pipelineBirthYearFilter !== "all" && String(getProspectBirthYear(p)) !== pipelineBirthYearFilter) return false;
      if (pipelineLastContactFilter === "never" && (p.messages?.length || 0) > 0) return false;
      if (pipelineLastContactFilter === "stale30") {
        const msgCount = p.messages?.length || 0;
        if (msgCount === 0) return false;
        const days = getProspectLastContactDays(p);
        if (days != null && days < 30) return false;
      }
      return true;
    };
    return Object.fromEntries(Object.entries(prospects).map(([col, list]) => [col, list.filter(match)]));
  }, [
    prospects,
    pipelineSearch,
    pipelinePosFilter,
    pipelineHandFilter,
    pipelineTierFilter,
    pipelineLeagueFilter,
    pipelineMinRating,
    pipelineBirthYearFilter,
    pipelineLastContactFilter,
  ]);

  function notify(msg) { setNotification(msg); setTimeout(() => setNotification(null), 3000); }

  function updateProspect(id, updater) {
    setProspects(prev => {
      const next = {};
      for (const [col, list] of Object.entries(prev)) {
        next[col] = list.map(p => p.id===id ? updater(p) : p);
      }
      return next;
    });
    setSelected(prev => prev?.id===id ? updater(prev) : prev);
  }

  function moveProspect(id, targetCol) {
    setProspects(prev => {
      const next = {};
      let moved = null;
      for (const [col, list] of Object.entries(prev)) {
        next[col] = list.filter(p => { if(p.id===id){moved=p;return false;} return true; });
      }
      if (moved) next[targetCol] = [...next[targetCol], moved];
      return next;
    });
    setSelected(null);
  }

  function sendMessage(prospectId, text) {
    const now = new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
    const newMsg = { id:Date.now(), from:"coach", text, time:`Today ${now}` };
    let autoAdvanced = false, name = "";
    setProspects(prev => {
      const next = {};
      for (const [col, list] of Object.entries(prev)) {
        const idx = list.findIndex(p => p.id===prospectId);
        if (idx !== -1) {
          const updated = {...list[idx], messages:[...(list[idx].messages||[]), newMsg]};
          name = updated.name.split(" ")[0];
          if (col==="identified" && (list[idx].messages||[]).length===0) {
            next[col] = list.filter((_,i) => i!==idx);
            next.contacted = [...(prev.contacted||[]), updated];
            autoAdvanced = true;
          } else {
            next[col] = list.map((p,i) => i===idx ? updated : p);
          }
        } else { next[col] = list; }
      }
      return next;
    });
    if (autoAdvanced) notify(`⚡ ${name} auto-advanced to Contact Made`);
    setSelected(prev => prev?.id===prospectId ? {...prev, messages:[...(prev.messages||[]), newMsg]} : prev);
  }

  function addEval(id, entry) {
    updateProspect(id, p => ({...p, evals:[...(p.evals||[]), entry]}));
    notify("✓ Evaluation logged — rolling average updated");
  }
  function addNote(id, entry) { updateProspect(id, p => ({...p, notes:[...(p.notes||[]), entry]})); }
  function setNudge(id, val) {
    updateProspect(id, p => ({...p, nudge:val}));
    notify(val ? `⏰ Nudge set: ${val}` : "Nudge cleared");
  }

  const liveSelected = selected ? allProspects.find(p => p.id===selected.id)||selected : null;

  const warRoomRosters = useMemo(() => [
    WILLIAMS_CURRENT_SEASON,
    { ...MY_ROSTER, id: "williams-2627", warRoomKind: "projection" },
    ...futureProjections,
    ...customWarRosters,
  ], [futureProjections, customWarRosters]);

  const benchmarkLibrary = useMemo(() => [
    { ...BENCHMARK_ROSTERS[0], id: "bench-cornell", warRoomKind: "benchmark" },
    { ...BENCHMARK_ROSTERS[1], id: "bench-princeton", warRoomKind: "benchmark" },
    ...customBenchmarkRosters,
  ], [customBenchmarkRosters]);

  const currentWarRoster = warRoomRosters.find(r => r.id === warRoomTabId) || warRoomRosters[0];
  const activeBenchmarkRoster = benchmarkLibrary.find(x => x.id === benchmarkTabId) || benchmarkLibrary[0];

  const rivalRosterKey = `rival-${rivalTab}`;
  const displayWarRoster = useMemo(
    () => mergeRosterEdit(currentWarRoster, rosterEdits[warRoomTabId]),
    [currentWarRoster, rosterEdits, warRoomTabId]
  );
  const displayRivalRoster = useMemo(
    () => mergeRosterEdit(RIVAL_ROSTERS[rivalTab], rosterEdits[rivalRosterKey]),
    [rivalTab, rosterEdits, rivalRosterKey]
  );

  const compareRosterOptions = useMemo(() => {
    const warRoomOptions = warRoomRosters
      .filter(r => r.id !== warRoomTabId)
      .map(r => ({ id: `war-${r.id}`, source: "warroom", label: `Williams · ${r.label}`, rosterId: r.id }));
    const rivalOptions = RIVAL_ROSTERS.map((r, idx) => ({ id: `rival-${idx}`, source: "rival", label: `Rival · ${r.label}`, rivalIndex: idx }));
    const benchmarkOptions = benchmarkLibrary.map(r => ({ id: `bench-${r.id}`, source: "benchmark", label: `Benchmark · ${r.label}`, benchmarkId: r.id }));
    return [...warRoomOptions, ...rivalOptions, ...benchmarkOptions];
  }, [warRoomRosters, warRoomTabId, benchmarkLibrary]);

  const selectedCompareOption = compareRosterOptions.find(x => x.id === compareRosterId) || null;
  const compareRoster = useMemo(() => {
    if (!selectedCompareOption) return null;
    if (selectedCompareOption.source === "warroom") {
      const base = warRoomRosters.find(r => r.id === selectedCompareOption.rosterId);
      if (!base) return null;
      return mergeRosterEdit(base, rosterEdits[selectedCompareOption.rosterId]);
    }
    if (selectedCompareOption.source === "rival") {
      const idx = selectedCompareOption.rivalIndex;
      if (idx == null || !RIVAL_ROSTERS[idx]) return null;
      return mergeRosterEdit(RIVAL_ROSTERS[idx], rosterEdits[`rival-${idx}`]);
    }
    const bench = benchmarkLibrary.find(r => r.id === selectedCompareOption.benchmarkId);
    return bench || null;
  }, [selectedCompareOption, warRoomRosters, benchmarkLibrary, rosterEdits]);

  const warRoomAllowsRecruits = Boolean(currentWarRoster?.warRoomKind && currentWarRoster.warRoomKind !== "current");

  const recruitPickerCandidates = useMemo(() => {
    if (!recruitPickerTarget) return [];
    const slotPlayer = rosterSectionArray(displayWarRoster, recruitPickerTarget.section)[recruitPickerTarget.index];
    const slotPos = slotPlayer.pos;
    const placed = collectPlacedProspectIds(displayWarRoster);
    return allProspects.filter(p => posMatchesSlot(slotPos, p.pos) && !placed.has(p.id));
  }, [recruitPickerTarget, displayWarRoster, allProspects]);

  function applyProspectToSlot(rosterKey, baseRoster, section, index, prospect) {
    setRosterEdits(prev => {
      const merged = mergeRosterEdit(baseRoster, prev[rosterKey]);
      const forwards = [...merged.forwards];
      const defense = [...merged.defense];
      const goalies = [...merged.goalies];
      const arr = section === "forwards" ? forwards : section === "defense" ? defense : goalies;
      const slotPos = arr[index].pos;
      arr[index] = prospectToRosterPlayer(prospect, slotPos);
      return { ...prev, [rosterKey]: { forwards, defense, goalies } };
    });
  }

  function removeRecruitFromSlot(rosterKey, baseRoster, section, index) {
    setRosterEdits(prev => {
      const merged = mergeRosterEdit(baseRoster, prev[rosterKey]);
      const forwards = [...merged.forwards];
      const defense = [...merged.defense];
      const goalies = [...merged.goalies];
      const arr = section === "forwards" ? forwards : section === "defense" ? defense : goalies;
      if (arr[index].prospectId == null) return prev;
      const slotPos = arr[index].pos;
      arr[index] = op(slotPos);
      return { ...prev, [rosterKey]: { forwards, defense, goalies } };
    });
  }

  function performSwap(rosterKey, baseRoster, a, b) {
    setRosterEdits(prev => {
      const merged = mergeRosterEdit(baseRoster, prev[rosterKey]);
      const forwards = [...merged.forwards];
      const defense = [...merged.defense];
      const goalies = [...merged.goalies];
      const getArr = (s) => (s === "forwards" ? forwards : s === "defense" ? defense : goalies);
      const pa = getArr(a.section)[a.index];
      const pb = getArr(b.section)[b.index];
      getArr(a.section)[a.index] = pb;
      getArr(b.section)[b.index] = pa;
      return { ...prev, [rosterKey]: { forwards, defense, goalies } };
    });
  }

  function handleWarRoomSlotClick(section, index) {
    const rk = warRoomTabId;
    const base = currentWarRoster;
    if (!swapPick) {
      setSwapPick({ rosterKey: rk, section, index });
      return;
    }
    if (swapPick.rosterKey !== rk) {
      setSwapPick({ rosterKey: rk, section, index });
      return;
    }
    if (swapPick.section === section && swapPick.index === index) {
      setSwapPick(null);
      return;
    }
    performSwap(rk, base, { section: swapPick.section, index: swapPick.index }, { section, index });
    setSwapPick(null);
  }

  function handleRivalSlotClick(section, index) {
    const rk = rivalRosterKey;
    const base = RIVAL_ROSTERS[rivalTab];
    if (!swapPick) {
      setSwapPick({ rosterKey: rk, section, index });
      return;
    }
    if (swapPick.rosterKey !== rk) {
      setSwapPick({ rosterKey: rk, section, index });
      return;
    }
    if (swapPick.section === section && swapPick.index === index) {
      setSwapPick(null);
      return;
    }
    performSwap(rk, base, { section: swapPick.section, index: swapPick.index }, { section, index });
    setSwapPick(null);
  }

  function handleWarRoomAddRecruit(section, index) {
    setRecruitPickerTarget({ section, index });
  }

  function handleWarRoomRemoveRecruit(section, index) {
    removeRecruitFromSlot(warRoomTabId, currentWarRoster, section, index);
    notify("Removed from projection lineup");
  }

  function handlePickRecruit(prospect) {
    if (!recruitPickerTarget) return;
    const { section, index } = recruitPickerTarget;
    const slot = rosterSectionArray(displayWarRoster, section)[index];
    if (slot.status !== "open") {
      notify("That slot is no longer open — try again");
      setRecruitPickerTarget(null);
      return;
    }
    if (!posMatchesSlot(slot.pos, prospect.pos)) {
      notify("Position does not match this slot");
      return;
    }
    applyProspectToSlot(warRoomTabId, currentWarRoster, section, index, prospect);
    setRecruitPickerTarget(null);
    notify(`✓ ${prospect.name} added to projection`);
  }

  useEffect(() => {
    setSwapPick(null);
    setRecruitPickerTarget(null);
  }, [warRoomTabId, rivalTab]);

  useEffect(() => {
    if (warRoomRosterView !== "lineup") {
      setSwapModeWar(false);
      setSwapPick(sp => (sp && sp.rosterKey === warRoomTabId ? null : sp));
      setRecruitPickerTarget(null);
    }
  }, [warRoomRosterView, warRoomTabId]);

  useEffect(() => {
    if (rivalRosterView !== "lineup") {
      setSwapModeRival(false);
      setSwapPick(sp => (sp && sp.rosterKey === rivalRosterKey ? null : sp));
    }
  }, [rivalRosterView, rivalRosterKey]);

  useEffect(() => {
    if (!recruitPickerTarget) return;
    function onKey(e) {
      if (e.key === "Escape") setRecruitPickerTarget(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [recruitPickerTarget]);

  useEffect(() => {
    if (warRoomRosters.length && !warRoomRosters.some(r => r.id === warRoomTabId)) {
      setWarRoomTabId(warRoomRosters[0].id);
    }
  }, [warRoomRosters, warRoomTabId]);

  useEffect(() => {
    if (compareRosterId && !compareRosterOptions.some(r => r.id === compareRosterId)) {
      setCompareRosterId(null);
    }
  }, [compareRosterOptions, compareRosterId]);

  useEffect(() => {
    if (benchmarkLibrary.length && !benchmarkLibrary.some(r => r.id === benchmarkTabId)) {
      setBenchmarkTabId(benchmarkLibrary[0].id);
    }
  }, [benchmarkLibrary, benchmarkTabId]);

  function handleAddProjectionYear() {
    const src = findLatestProjectionRoster(futureProjections);
    const suggested = nextYearLabelFromLabel(src.label);
    const raw = window.prompt(`Add a future Williams projection year (e.g. 27-28 for '27-'28)`, suggested.replace(/'/g, ""));
    if (raw == null) return;
    const yy = normalizeYearInput(raw) || normalizeYearInput(suggested.replace(/'/g, "")) || null;
    if (!yy) {
      notify("Use a year like 27-28 or '27-'28");
      return;
    }
    const adv = advanceRosterFromSource(src);
    const id = `proj-${Date.now()}`;
    const newRoster = {
      id,
      warRoomKind: "future",
      label: `Williams ${yy} Projected`,
      record: { w: 0, l: 0, t: 0 },
      ...adv,
    };
    setFutureProjections(prev => [...prev, newRoster]);
    setWarRoomTabId(id);
    notify(`Added ${newRoster.label}`);
  }

  function handleCustomBenchmark() {
    const name = window.prompt("Name this benchmark (e.g. Cornell 2020-21)", "Custom benchmark");
    if (name == null) return;
    const id = `bench-custom-${Date.now()}`;
    const roster = cloneBenchmarkTemplate(id, name.trim() || "Custom benchmark");
    setCustomBenchmarkRosters(prev => [...prev, roster]);
    setBenchmarkTabId(id);
    setActiveTab("benchmarks");
    setWarRoomModal(null);
    notify("Benchmark added — open War Room and pick a roster to compare side by side");
  }

  function handleCustomBlank() {
    const name = window.prompt("Name this lineup", "Custom Williams depth chart");
    if (name == null) return;
    const id = `custom-${Date.now()}`;
    setCustomWarRosters(prev => [...prev, blankWilliamsRoster(id, name.trim() || "Custom lineup")]);
    setWarRoomTabId(id);
    setWarRoomModal(null);
    notify("Blank depth chart added");
  }

  const NAV = [
    {key:"pipeline",label:"Pipeline Board"},
    {key:"trending",label:"Trending Players"},
    {key:"warroom",label:"War Room"},
    {key:"rivals",label:"Rival Rosters"},
    {key:"benchmarks",label:"Benchmarks"},
  ];

  return (
    <div style={{ background:C.bg, height:"100vh", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:C.text, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {notification && <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:C.green, color:"#fff", padding:"7px 16px", borderRadius:7, fontSize:12, fontWeight:600, zIndex:999, whiteSpace:"nowrap" }}>{notification}</div>}

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", height:50, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:24, height:24, borderRadius:5, background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🏒</div>
          <span style={{ fontWeight:800, fontSize:15, letterSpacing:-0.5 }}>IceBoard</span>
          <select value={school} onChange={e => setSchool(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:5, padding:"3px 8px", fontSize:11, outline:"none", cursor:"pointer" }}>
            {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          {[["Prospects",allProspects.length],["A List",allProspects.filter(p=>p.tier==="A").length],["Messages",allProspects.reduce((s,p)=>s+(p.messages?.length||0),0)]].map(([l,v]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.accent, fontFamily:"monospace" }}>{v}</div>
              <div style={{ color:C.muted, fontSize:9, letterSpacing:0.5 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 16px", display:"flex", flexShrink:0 }}>
        {NAV.map(({key,label}) => <button key={key} onClick={() => setActiveTab(key)} style={{ background:"none", border:"none", cursor:"pointer", padding:"9px 14px", fontSize:12, fontWeight:600, color:activeTab===key?C.accent:C.muted, borderBottom:`2px solid ${activeTab===key?C.accent:"transparent"}` }}>{label}</button>)}
      </div>

      {/* Pipeline */}
      {activeTab==="pipeline" && (
        <div style={{ display:"flex", flex:1, flexDirection:"column", overflow:"hidden" }}>
          <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"7px 16px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:C.muted }}>Search</span>
              <input
                value={pipelineSearch}
                onChange={e => setPipelineSearch(e.target.value)}
                placeholder="Name, team, league"
                style={{ width:170, background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"4px 8px", fontSize:11, outline:"none" }}
              />
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:C.muted }}>Position</span>
              <select value={pipelinePosFilter} onChange={e => setPipelinePosFilter(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"4px 6px", fontSize:11 }}>
                <option value="all">All</option><option value="F">F</option><option value="D">D</option><option value="G">G</option>
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:C.muted }}>Hand</span>
              <select value={pipelineHandFilter} onChange={e => setPipelineHandFilter(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"4px 6px", fontSize:11 }}>
                <option value="all">All</option><option value="L">L</option><option value="R">R</option>
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:C.muted }}>Tier</span>
              <select value={pipelineTierFilter} onChange={e => setPipelineTierFilter(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"4px 6px", fontSize:11 }}>
                <option value="all">All</option><option value="A">A</option><option value="B">B</option><option value="C">C</option>
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:C.muted }}>League</span>
              <select value={pipelineLeagueFilter} onChange={e => setPipelineLeagueFilter(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"4px 6px", fontSize:11, minWidth:105 }}>
                <option value="all">All</option>
                {pipelineLeagueOptions.map(lg => <option key={lg} value={lg}>{lg}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:C.muted }}>Min Rating</span>
              <select value={pipelineMinRating} onChange={e => setPipelineMinRating(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"4px 6px", fontSize:11 }}>
                <option value="all">All</option><option value="3.0">3.0</option><option value="3.5">3.5</option><option value="4.0">4.0</option><option value="4.5">4.5</option>
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:C.muted }}>Birth Year</span>
              <select value={pipelineBirthYearFilter} onChange={e => setPipelineBirthYearFilter(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"4px 6px", fontSize:11, minWidth:84 }}>
                <option value="all">All</option>
                {pipelineBirthYearOptions.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:C.muted }}>Last Contact</span>
              <select value={pipelineLastContactFilter} onChange={e => setPipelineLastContactFilter(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"4px 6px", fontSize:11 }}>
                <option value="all">All</option><option value="stale30">30+ Days Ago</option><option value="never">Never Contacted</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setPipelineSearch("");
                setPipelinePosFilter("all");
                setPipelineHandFilter("all");
                setPipelineTierFilter("all");
                setPipelineLeagueFilter("all");
                setPipelineMinRating("all");
                setPipelineBirthYearFilter("all");
                setPipelineLastContactFilter("all");
              }}
              style={{ background:"none", border:"none", color:C.accent, fontSize:11, cursor:"pointer", padding:0, textDecoration:"underline", marginLeft:"auto" }}
            >
              Clear Filters
            </button>
          </div>
          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
            <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
              {COLUMNS.map(col => (
                <div key={col.key} style={{ flex:1, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", minWidth:0 }}>
                  <div style={{ padding:"10px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:6, height:6, borderRadius:"50%", background:col.color }} /><span style={{ fontSize:9, fontWeight:700, color:C.text, letterSpacing:0.5 }}>{col.label.toUpperCase()}</span></div>
                    <span style={{ fontSize:9, color:C.muted, background:C.card, padding:"1px 5px", borderRadius:8, border:`1px solid ${C.border}` }}>{filteredProspects[col.key].length}</span>
                  </div>
                  <div style={{ padding:9, overflowY:"auto", flex:1 }}>
                    {filteredProspects[col.key].map(p => <ProspectCard key={p.id} prospect={p} onClick={setSelected} selected={selected?.id===p.id} />)}
                  </div>
                </div>
              ))}
            </div>
            {liveSelected && (
              <div style={{ width:320, minWidth:320, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                <ProspectDetail prospect={liveSelected} onClose={() => setSelected(null)} onMove={moveProspect} onSend={sendMessage} onAddEval={addEval} onSetNudge={setNudge} onAddNote={addNote} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trending */}
      {activeTab==="trending" && <TrendingTab allProspects={allProspects} />}

      {/* War Room */}
      {activeTab==="warroom" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 16px", display:"flex", flexShrink:0, overflowX:"auto", alignItems:"stretch", flexWrap:"nowrap" }}>
            {warRoomRosters.map((r) => {
              const active = warRoomTabId === r.id;
              return (
                <button key={r.id} type="button" onClick={() => setWarRoomTabId(r.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:"7px 13px", fontSize:11, fontWeight:600, color:active?C.accent:C.muted, borderBottom:`2px solid ${active?C.accent:"transparent"}`, whiteSpace:"nowrap" }}>
                  ★ {r.label}
                </button>
              );
            })}
            <button type="button" onClick={handleAddProjectionYear} style={{ background:"none", border:"none", cursor:"pointer", padding:"7px 13px", fontSize:11, fontWeight:600, color:C.muted, borderBottom:"2px solid transparent", whiteSpace:"nowrap", borderLeft:`1px solid ${C.border}`, marginLeft:4 }}>
              + Add Year
            </button>
            <button type="button" onClick={() => setWarRoomModal("custom")} style={{ background:"none", border:"none", cursor:"pointer", padding:"7px 13px", fontSize:11, fontWeight:600, color:C.muted, borderBottom:"2px solid transparent", whiteSpace:"nowrap" }}>
              + Custom
            </button>
          </div>
          <div style={{ padding:"8px 18px 10px", borderBottom:`1px solid ${C.border}`, background:C.surface, display:"flex", flexWrap:"wrap", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:11, color:C.muted }}>Compare depth chart</span>
            <select
              value={compareRosterId ?? ""}
              onChange={e => setCompareRosterId(e.target.value || null)}
              style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"5px 10px", fontSize:11, minWidth:200, cursor:"pointer" }}
            >
              <option value="">None</option>
              {compareRosterOptions.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            {compareRosterId && (
              <button type="button" onClick={() => setCompareRosterId(null)} style={{ fontSize:11, padding:"4px 10px", borderRadius:6, cursor:"pointer", background:"transparent", border:`1px solid ${C.border}`, color:C.muted }}>
                Clear
              </button>
            )}
          </div>
          <div style={{ flex:1, display:"flex", minHeight:0, overflow:"hidden" }}>
            <div style={{ flex:1, minWidth:0, overflowY:"auto", padding:"14px 18px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:0.4, marginBottom:10 }}>YOUR ROSTER</div>
              {displayWarRoster.record && (
                <div style={RECORD_LINE_STYLE}>
                  Record: {displayWarRoster.record.w}-{displayWarRoster.record.l}-{displayWarRoster.record.t} (W-L-T)
                </div>
              )}
              <RosterLegend showRef={false} showRival={false} />
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:10, flexWrap:"wrap" }}>
                <RosterViewToggle view={warRoomRosterView} onChange={setWarRoomRosterView} />
                {warRoomRosterView === "lineup" && (
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSwapModeWar(v => {
                          if (v) setSwapPick(sp => (sp && sp.rosterKey === warRoomTabId ? null : sp));
                          return !v;
                        });
                      }}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "6px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                        border: `1px solid ${swapModeWar ? C.accent : C.border}`,
                        background: swapModeWar ? "#0C1A2A" : "transparent",
                        color: swapModeWar ? C.accent : C.muted,
                      }}
                    >
                      Swap Players
                    </button>
                    {swapModeWar && <span style={{ fontSize:10, color:C.muted }}>Click two slots to swap</span>}
                  </div>
                )}
              </div>
              {warRoomRosterView === "lineup" ? (
                <RosterGrid
                  roster={displayWarRoster}
                  swapMode={swapModeWar}
                  swapPick={swapPick}
                  rosterKey={warRoomTabId}
                  onSlotClick={swapModeWar ? handleWarRoomSlotClick : undefined}
                  recruitPlacement={warRoomAllowsRecruits}
                  onAddRecruit={warRoomAllowsRecruits ? handleWarRoomAddRecruit : undefined}
                  onRemoveRecruit={warRoomAllowsRecruits ? handleWarRoomRemoveRecruit : undefined}
                />
              ) : (
                <ClassListRoster roster={displayWarRoster} />
              )}
              {warRoomTabId === "williams-2627" && warRoomRosterView === "lineup" && (
                <div style={{ marginTop:18 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.text, letterSpacing:0.5, marginBottom:8 }}>A LIST RECRUITS — PIPELINE OVERLAY</div>
                  {allProspects.filter(p=>p.tier==="A").map(p => {
                    const avg = compositeAvg(avgScores(p.evals));
                    return (
                      <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", background:C.card, borderRadius:7, border:`1px solid ${C.border}`, marginBottom:5 }}>
                        <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                          <TierBadge tier={p.tier} />
                          <div><div style={{ fontSize:12, fontWeight:600, color:C.text }}>{p.name}</div><div style={{ fontSize:10, color:C.muted }}>{p.pos} · {p.league} · {p.evals?.length||0} viewings</div></div>
                        </div>
                        <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                          {(p.messages?.length||0)>0 && <span style={{ fontSize:10, color:C.accent }}>💬 {p.messages.length}</span>}
                          <span style={{ fontSize:11, color:C.accent, fontFamily:"monospace" }}>{p.g}G {p.a}A</span>
                          <ScoreRing value={avg} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {compareRoster && (
              <div style={{ flex:1, minWidth:0, overflowY:"auto", padding:"14px 18px", borderLeft:`1px solid ${C.border}`, background:"#0B0F18" }}>
                <div style={{ fontSize:10, fontWeight:700, color:selectedCompareOption?.source==="benchmark"?C.gold:selectedCompareOption?.source==="rival"?C.muted:C.accent, letterSpacing:0.4, marginBottom:10 }}>
                  {selectedCompareOption?.source==="benchmark" ? "BENCHMARK" : selectedCompareOption?.source==="rival" ? "RIVAL" : "WILLIAMS"}
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:8 }}>{compareRoster.label}</div>
                {compareRoster.record && (
                  <div style={{ ...RECORD_LINE_STYLE, fontSize:13 }}>
                    Record: {compareRoster.record.w}-{compareRoster.record.l}-{compareRoster.record.t} (W-L-T)
                  </div>
                )}
                <RosterLegend showRef={selectedCompareOption?.source==="benchmark"} showRival={selectedCompareOption?.source==="rival"} />
                {warRoomRosterView === "lineup" ? <RosterGrid roster={compareRoster} /> : <ClassListRoster roster={compareRoster} />}
              </div>
            )}
          </div>
          {warRoomModal === "custom" && (
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={() => setWarRoomModal(null)} role="presentation">
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:18, maxWidth:360, width:"100%" }} onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="custom-roster-title">
                <div id="custom-roster-title" style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:10 }}>Custom roster</div>
                <p style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:14 }}>Benchmark templates are saved under Benchmarks. Blank depth charts stay in War Room for planning.</p>
                <button type="button" onClick={handleCustomBenchmark} style={{ display:"block", width:"100%", padding:"8px 12px", marginBottom:8, borderRadius:6, cursor:"pointer", background:C.gold, border:"none", color:"#fff", fontSize:12, fontWeight:600 }}>Benchmark comparison</button>
                <button type="button" onClick={handleCustomBlank} style={{ display:"block", width:"100%", padding:"8px 12px", marginBottom:8, borderRadius:6, cursor:"pointer", background:C.accent, border:"none", color:"#fff", fontSize:12, fontWeight:600 }}>Blank Williams depth chart</button>
                <button type="button" onClick={() => setWarRoomModal(null)} style={{ display:"block", width:"100%", padding:"8px", borderRadius:6, cursor:"pointer", background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:12 }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rival Rosters */}
      {activeTab==="rivals" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 16px", display:"flex", flexShrink:0, overflowX:"auto" }}>
            {RIVAL_ROSTERS.map((r,i) => <button key={i} onClick={() => setRivalTab(i)} style={{ background:"none", border:"none", cursor:"pointer", padding:"7px 14px", fontSize:11, fontWeight:600, color:rivalTab===i?C.accent:C.muted, borderBottom:`2px solid ${rivalTab===i?C.accent:"transparent"}`, whiteSpace:"nowrap" }}>{r.label}</button>)}
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 18px" }}>
            {displayRivalRoster.record && (
              <div style={RECORD_LINE_STYLE}>
                Record: {displayRivalRoster.record.w}-{displayRivalRoster.record.l}-{displayRivalRoster.record.t} (W-L-T)
              </div>
            )}
            <RosterLegend showRef={false} showRival={true} />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:10, flexWrap:"wrap" }}>
              <RosterViewToggle view={rivalRosterView} onChange={setRivalRosterView} />
              {rivalRosterView === "lineup" && (
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSwapModeRival(v => {
                        if (v) setSwapPick(sp => (sp && sp.rosterKey === rivalRosterKey ? null : sp));
                        return !v;
                      });
                    }}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      border: `1px solid ${swapModeRival ? C.accent : C.border}`,
                      background: swapModeRival ? "#0C1A2A" : "transparent",
                      color: swapModeRival ? C.accent : C.muted,
                    }}
                  >
                    Swap Players
                  </button>
                  {swapModeRival && <span style={{ fontSize:10, color:C.muted }}>Click two slots to swap</span>}
                </div>
              )}
            </div>
            {rivalRosterView === "lineup" ? (
              <RosterGrid
                roster={displayRivalRoster}
                swapMode={swapModeRival}
                swapPick={swapPick}
                rosterKey={rivalRosterKey}
                onSlotClick={swapModeRival ? handleRivalSlotClick : undefined}
              />
            ) : (
              <ClassListRoster roster={displayRivalRoster} />
            )}
          </div>
        </div>
      )}

      {recruitPickerTarget && warRoomAllowsRecruits && activeTab === "warroom" && (
        <RecruitPickerModal
          slotPos={rosterSectionArray(displayWarRoster, recruitPickerTarget.section)[recruitPickerTarget.index].pos}
          prospects={recruitPickerCandidates}
          onPick={handlePickRecruit}
          onClose={() => setRecruitPickerTarget(null)}
        />
      )}

      {/* Benchmarks — ECAC reference rosters + custom templates */}
      {activeTab==="benchmarks" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 16px", display:"flex", flexShrink:0, overflowX:"auto", alignItems:"center" }}>
            {benchmarkLibrary.map((r) => (
              <button key={r.id} type="button" onClick={() => setBenchmarkTabId(r.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:"7px 14px", fontSize:11, fontWeight:600, color:benchmarkTabId===r.id?C.gold:C.muted, borderBottom:`2px solid ${benchmarkTabId===r.id?C.gold:"transparent"}`, whiteSpace:"nowrap" }}>
                ★ {r.label}
              </button>
            ))}
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 18px" }}>
            {activeBenchmarkRoster ? (
              <>
                {activeBenchmarkRoster.record && (
                  <div style={RECORD_LINE_STYLE}>
                    Record: {activeBenchmarkRoster.record.w}-{activeBenchmarkRoster.record.l}-{activeBenchmarkRoster.record.t} (W-L-T)
                  </div>
                )}
                <RosterLegend showRef={true} showRival={false} />
                <RosterGrid roster={activeBenchmarkRoster} />
              </>
            ) : (
              <div style={{ color:C.muted, fontSize:12 }}>No benchmarks.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}