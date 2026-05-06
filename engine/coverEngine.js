// engine/coverEngine.js
// NeuroCine Cover/Thumbnail Engine v1
// 2-вариантная генерация виральных обложек: SHOCK / EVENT vs HYBRID / HUMAN + EVIDENCE
// Адаптивно под тему: alien / crime / conspiracy / horror / war / disaster / history / science

function nc(s) { return String(s || "").toLowerCase(); }

export function detectCoverTheme({ topic = "", frames = [], thumb = null, locRef = "", styleRef = "" } = {}) {
  const source = nc([
    topic, locRef, styleRef,
    thumb?.title, thumb?.hook, thumb?.text_for_rendering,
    ...(frames || []).flatMap(f => [f.visual, f.voice, f.vo_ru, f.text_on_screen, f.sfx, f.description_ru])
  ].filter(Boolean).join(" "));

  const has = (words) => words.some(w => source.includes(w));

  if (has(["нло","ufo","alien","иноплан","розуэл","roswell","mj-12","mj12","аквариус","aquarius","пентагон","pentagon","внезем"])) return "alien";
  if (has(["убий","маньяк","crime","преступ","детектив","полици","фбр","fbi","cia","цру","след"])) return "crime";
  if (has(["заговор","секрет","секретн","classified","redacted","архив","документ","правительство","government","лаборатор","experiment"])) return "conspiracy";
  if (has(["ужас","хоррор","призрак","демон","монстр","страх","horror","creature","nightmare"])) return "horror";
  if (has(["война","солдат","танк","battle","war","military","армия","ракета","взрыв"])) return "war";
  if (has(["катастроф","disaster","авар","цунами","землетр","пожар","шторм","самолет","корабль"])) return "disaster";
  if (has(["древн","археолог","фараон","рим","history","истори","импер","артефакт"])) return "history";
  if (has(["ai","ии","нейро","робот","эксперимент","наука","учен","технолог","science"])) return "science";
  return "general";
}

const PACKS = {
  alien: {
    shock: "1947 desert crash site at night, military floodlights, soldiers carrying covered non-human bodies on stretchers, one grey alien hand visible from under a sheet, dust and smoke, impossible wreckage in background",
    hybrid: "female intelligence agent in foreground holding a stamped confidential folder, anxious direct eye contact, glasses reflecting a non-human silhouette, behind her military personnel carry a covered alien body, one alien hand visible",
  },
  crime: {
    shock: "non-graphic crime scene evidence, torn case file, chalk outline partially hidden by police tape, flashing red-blue police lights, suspect silhouette behind frosted glass, forensic markers, tense night atmosphere",
    hybrid: "detective or FBI analyst in foreground holding a case file, direct eye contact, crime-scene evidence reflected in glasses, suspect silhouette and police lights blurred behind, clean non-graphic thriller tone",
  },
  conspiracy: {
    shock: "secret archive room, redacted classified documents scattered under a hard desk lamp, surveillance screens, shadow officials behind glass, one folder stamped above top secret, tense evidence-first composition",
    hybrid: "government archivist or agent in foreground with a classified folder, direct eye contact, redacted documents sharp in lower third, shadow officials and hidden lab monitors visible behind, paranoid thriller lighting",
  },
  horror: {
    shock: "dark corridor with a barely visible unnatural creature silhouette, clawed shadow crossing the wall, frightened hand reaching from foreground, flickering light, heavy fog, clean non-graphic horror tension",
    hybrid: "terrified witness in foreground, direct eye contact, creature silhouette reflected in eyes or glasses, door behind slightly open with cold light leaking out, cinematic horror shadows",
  },
  war: {
    shock: "battlefield evidence, damaged military vehicle, soldiers rushing through smoke, searchlights and sparks, classified map in foreground, high tension war documentary thumbnail",
    hybrid: "military analyst or soldier in foreground with classified map, direct eye contact, battlefield chaos blurred behind, smoke, searchlights, urgent documentary thriller tone",
  },
  disaster: {
    shock: "large-scale disaster moment, emergency lights, cracked ground or burning debris, rescue workers silhouetted, one impossible clue sharp in foreground, cinematic chaos, no gore",
    hybrid: "survivor or investigator in foreground holding evidence, direct eye contact, disaster scene blurred behind, emergency lights and smoke, dramatic high contrast tension",
  },
  history: {
    shock: "ancient forbidden artifact uncovered in dust, torchlight, shocked archaeologists, cracked stone chamber, mysterious symbol glowing faintly, cinematic historical mystery thumbnail",
    hybrid: "historian or archaeologist in foreground holding an ancient document, direct eye contact, forbidden artifact visible behind, torchlit archive, dust, mystery atmosphere",
  },
  science: {
    shock: "secret laboratory experiment going wrong, glowing containment chamber, warning lights, scientists behind glass, impossible object floating in center, cinematic science thriller",
    hybrid: "scientist in foreground holding research file, direct eye contact, failed experiment reflected in glasses, glowing lab chamber behind, high contrast sci-fi documentary tone",
  },
  general: {
    shock: "strongest visible story evidence in foreground, dramatic event happening behind, shocked witnesses, cinematic high contrast lighting, clear viral hook object, tense atmosphere",
    hybrid: "main witness or investigator in foreground, direct eye contact, key evidence sharp in lower third, story threat visible in background or reflection, cinematic tension",
  },
};

function clean(value = "") {
  return String(value || "")
    .replace(/,?\s*clear ASMR audio of[^,.]*/gi, "")
    .replace(/,?\s*isolated sound[^,.]*/gi, "")
    .replace(/\s+/g, " ").replace(/\.\s*$/, "").trim();
}

export function hardenThumbnailPrompt(value = "") {
  let prompt = clean(value);
  if (!prompt) prompt = "Tall vertical portrait orientation. Viral cinematic thumbnail, strongest story evidence in foreground, dramatic lighting, shallow depth of field, rule of thirds";
  if (!/^Tall vertical portrait orientation\./i.test(prompt)) prompt = `Tall vertical portrait orientation. ${prompt}`;
  if (!/no text/i.test(prompt)) prompt += ", no text, no watermarks, no letters, no subtitles";
  return prompt.replace(/\s+/g, " ").trim();
}

function extractDNA(characterLock = []) {
  const c = (characterLock || [])[0] || {};
  const parts = [c.name, c.age ? `${c.age}y` : null, c.face_features || c.description, c.hair, c.clothing].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "serious human witness, tense eyes, cinematic wardrobe";
}

export function buildCoverVariants({ topic = "", storyboard = null, hook = "" } = {}) {
  const frames = storyboard?.scenes || [];
  const characterLock = storyboard?.character_lock || [];
  const styleRef = storyboard?.global_style_lock || "";
  const theme = detectCoverTheme({ topic, frames, locRef: styleRef, styleRef });
  const pack = PACKS[theme] || PACKS.general;
  const dna = extractDNA(characterLock);
  const hookText = hook || topic || "forbidden evidence";
  const style = "cinematic realism, high contrast shadows, shallow depth of field, viral documentary thriller";

  return {
    theme,
    variants: [
      {
        id: "shock",
        title: "ШОК / СОБЫТИЕ",
        prompt_EN: hardenThumbnailPrompt(
          `Tall vertical portrait orientation. ${pack.shock}. Dominant hook object: ${hookText}. ` +
          `Event-first viral thumbnail, no neutral portrait, face optional, sharp foreground evidence, ` +
          `dramatic lighting, rule of thirds, desaturated cinematic color, ${style}`
        ),
      },
      {
        id: "hybrid",
        title: "ЧЕЛОВЕК + ДОКАЗАТЕЛЬСТВО",
        prompt_EN: hardenThumbnailPrompt(
          `Tall vertical portrait orientation. [PRIMARY_DNA: ${dna}] direct eye contact in foreground, ` +
          `tense expression, ${pack.hybrid}. Hook object sharp in lower third: ${hookText}. ` +
          `Face upper 50-60%, story evidence clearly visible, shallow depth of field, ${style}`
        ),
      },
    ],
  };
}
