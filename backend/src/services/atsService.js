/**
 * ATS scoring logic — no OpenAI needed.
 * Fast, deterministic, keyword-based scoring.
 * OpenAI is used in Step 6 for the suggestion text only.
 */

/**
 * Tokenize text: lowercase, strip punctuation, split on whitespace.
 * Also generates bigrams ("machine learning", "node js") for phrase matching.
 */
const tokenize = (text) => {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s+#.]/g, " ");
  const words = cleaned.split(/\s+/).filter((w) => w.length > 1);
  // Add bigrams
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  return new Set([...words, ...bigrams]);
};

/**
 * Extract keywords from a job description.
 * Filters out stop words, returns unique significant terms.
 */
const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","have","has","had","do","does","did",
  "will","would","could","should","may","might","shall","must","can",
  "we","you","they","he","she","it","this","that","these","those",
  "our","your","their","its","my","your","his","her",
  "as","by","from","into","through","during","before","after","above","below",
  "between","out","off","over","under","again","further","then","once",
  "here","there","when","where","why","how","all","both","each","few","more",
  "most","other","some","such","no","not","only","own","same","so","than",
  "too","very","just","about","also","well","need","work","role","team",
  "experience","years","year","strong","excellent","good","ability","skills",
  "knowledge","understanding","candidate","position","opportunity",
  "environment","responsibilities","requirements","preferred","required",
  "including","etc","plus","bonus","eg","ie",
]);

const extractKeywords = (jd) => {
  const tokens = tokenize(jd);
  return [...tokens].filter((t) => !STOP_WORDS.has(t) && t.length > 2);
};

/**
 * Convert a resume object to a flat text blob for comparison.
 */
const resumeToText = (resume) => {
  const parts = [];

  const { personalInfo, education, experience, projects, skills, certifications } = resume;

  if (personalInfo?.summary) parts.push(personalInfo.summary);

  (experience || []).forEach((exp) => {
    parts.push(exp.position, exp.company);
    (exp.bullets || []).forEach((b) => parts.push(b));
  });

  (education || []).forEach((edu) => {
    parts.push(edu.degree, edu.field, edu.institution);
  });

  (projects || []).forEach((proj) => {
    parts.push(proj.name, proj.description, ...(proj.techStack || []));
  });

  const { technical = [], soft = [], languages = [] } = skills || {};
  parts.push(...technical, ...soft, ...languages);

  (certifications || []).forEach((cert) => parts.push(cert.name, cert.issuer));

  return parts.filter(Boolean).join(" ");
};

/**
 * Main scoring function.
 * Returns: overall score, sub-scores, matched/missing keywords.
 */
const scoreResume = (resume, jobDescription) => {
  const resumeText = resumeToText(resume);
  const resumeTokens = tokenize(resumeText);
  const jdKeywords = extractKeywords(jobDescription);

  if (jdKeywords.length === 0) {
    return {
      score: { overall: 0, keywordMatch: 0, skillsMatch: 0, experienceMatch: 0 },
      matchedKeywords: [],
      missingKeywords: [],
    };
  }

  // ── Keyword match ──────────────────────────────────────────────────────────
  const matched = jdKeywords.filter((kw) => resumeTokens.has(kw));
  const missing = jdKeywords.filter((kw) => !resumeTokens.has(kw));

  const keywordScore = Math.round((matched.length / jdKeywords.length) * 100);

  // ── Skills match — only look at the skills section ─────────────────────────
  const skillsText = [
    ...(resume.skills?.technical || []),
    ...(resume.skills?.soft || []),
    ...(resume.skills?.languages || []),
  ].join(" ").toLowerCase();
  const skillsTokens = tokenize(skillsText);
  const skillsMatched = jdKeywords.filter((kw) => skillsTokens.has(kw));
  const skillsScore = Math.round((skillsMatched.length / jdKeywords.length) * 100);

  // ── Experience match — look at bullets + positions ─────────────────────────
  const expText = (resume.experience || [])
    .map((e) => [e.position, e.company, ...(e.bullets || [])].join(" "))
    .join(" ")
    .toLowerCase();
  const expTokens = tokenize(expText);
  const expMatched = jdKeywords.filter((kw) => expTokens.has(kw));
  const expScore = Math.round((expMatched.length / jdKeywords.length) * 100);

  // ── Overall: weighted average ─────────────────────────────────────────────
  // keyword: 50%, skills: 30%, experience: 20%
  const overall = Math.min(
    100,
    Math.round(keywordScore * 0.5 + skillsScore * 0.3 + expScore * 0.2)
  );

  // Return top 20 matched and top 20 missing to keep response size reasonable
  return {
    score: {
      overall,
      keywordMatch: Math.min(100, keywordScore),
      skillsMatch: Math.min(100, skillsScore),
      experienceMatch: Math.min(100, expScore),
    },
    matchedKeywords: matched.slice(0, 20),
    missingKeywords: missing.slice(0, 20),
  };
};

module.exports = { scoreResume, resumeToText };
