const openai = require("../config/openai");

const MODEL = "gpt-4o-mini"; // fast + cheap, great for structured text tasks

/**
 * Shared helper — wraps all OpenAI calls with consistent error handling.
 */
const callOpenAI = async (systemPrompt, userPrompt, maxTokens = 800) => {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return response.choices[0].message.content.trim();
};

// ── 1. Improve bullet points ───────────────────────────────────────────────────
/**
 * Takes an array of weak bullet points and rewrites them.
 * Returns an array of improved bullets in the same order.
 */
const improveBullets = async (bullets, jobTitle = "", jobDescription = "") => {
  const context = jobDescription
    ? `The target job is: ${jobTitle || "Software Engineer"}.\nJob description excerpt: ${jobDescription.slice(0, 500)}`
    : `The target role is: ${jobTitle || "a software engineering position"}.`;

  const system = `You are an expert resume writer and career coach.
Your task is to rewrite resume bullet points to be:
- Action-verb led (e.g., "Engineered", "Reduced", "Architected", "Spearheaded")
- Quantified where possible (add realistic placeholders like "~30%", "10k+ users" if no data given)
- Concise (1-2 lines max per bullet)
- ATS-optimized with relevant keywords
- Impactful, showing business/technical value

Return ONLY a JSON array of strings — one improved bullet per item.
Do NOT add commentary. Do NOT change the number of bullets.
Example output: ["Engineered a scalable REST API serving 50k+ daily requests, reducing latency by 40%"]`;

  const user = `${context}

Rewrite these ${bullets.length} bullet point(s):
${bullets.map((b, i) => `${i + 1}. ${b || "(empty)"}`).join("\n")}`;

  const raw = await callOpenAI(system, user, 600);

  // Parse JSON — fall back to original if parsing fails
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === bullets.length) return parsed;
  } catch {
    // Try to extract array from response
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
  }
  return bullets; // return originals if AI fails
};

// ── 2. Generate professional summary ──────────────────────────────────────────
/**
 * Generates a tailored 3-4 sentence professional summary.
 */
const generateSummary = async (resumeData, jobTitle = "", jobDescription = "") => {
  const { personalInfo, experience, skills } = resumeData;

  const expSummary = (experience || [])
    .slice(0, 3)
    .map((e) => `${e.position} at ${e.company}`)
    .join(", ");

  const techSkills = (skills?.technical || []).slice(0, 10).join(", ");

  const system = `You are an expert resume writer.
Write a compelling 3-4 sentence professional summary for a resume.
Requirements:
- Start with a strong descriptor (e.g., "Results-driven", "Innovative", "Full-stack")
- Include years of experience if inferable
- Mention top 2-3 technical skills
- Align with the target role
- End with value proposition or career goal
- Do NOT use first-person pronouns (I, my, me)
- Return ONLY the summary text, no labels or formatting`;

  const user = `Name: ${personalInfo?.name || "Candidate"}
Experience: ${expSummary || "various technical roles"}
Technical Skills: ${techSkills || "not specified"}
Target Role: ${jobTitle || "Software Engineer"}
${jobDescription ? `Job Description (excerpt): ${jobDescription.slice(0, 400)}` : ""}

Write the professional summary:`;

  return callOpenAI(system, user, 300);
};

// ── 3. Suggest missing skills ──────────────────────────────────────────────────
/**
 * Compares current skills against JD and suggests what to add.
 * Returns { technical: [], soft: [], certifications: [] }
 */
const suggestSkills = async (currentSkills, jobDescription, jobTitle = "") => {
  const current = [
    ...(currentSkills?.technical || []),
    ...(currentSkills?.soft || []),
    ...(currentSkills?.languages || []),
  ].join(", ");

  const system = `You are a technical recruiter and skills advisor.
Analyze the job description and suggest specific skills to add to the resume.
Return ONLY valid JSON in this exact format:
{
  "technical": ["skill1", "skill2"],
  "soft": ["skill1", "skill2"],
  "certifications": ["cert1", "cert2"]
}
Rules:
- Max 8 items per category
- Only suggest skills NOT already in the current skills list
- Be specific (e.g., "Docker" not "containers", "React Query" not "state management")
- For certifications, only suggest widely-recognized ones relevant to the role`;

  const user = `Job Title: ${jobTitle || "Software Engineer"}
Job Description: ${jobDescription.slice(0, 800)}

Current Skills: ${current || "none listed"}

Suggest missing skills:`;

  const raw = await callOpenAI(system, user, 400);

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch { /* fall through */ }

  return { technical: [], soft: [], certifications: [] };
};

// ── 4. Enhanced ATS suggestions ────────────────────────────────────────────────
/**
 * Takes ATS score data and generates deep, personalized suggestions.
 * Returns array of suggestion objects.
 */
const enhanceAtsSuggestions = async (atsResult, resumeData) => {
  const { score, missingKeywords, matchedKeywords } = atsResult;

  const system = `You are a senior ATS optimization expert and resume coach.
Given the ATS analysis data, provide 4-6 highly specific, actionable suggestions.
Return ONLY a JSON array in this format:
[
  {
    "section": "experience|skills|summary|education|general",
    "priority": "high|medium|low",
    "title": "Short title (5-8 words)",
    "text": "Detailed actionable recommendation (2-3 sentences)"
  }
]
Make suggestions SPECIFIC — mention actual keywords, sections, and examples.`;

  const user = `ATS Score: ${score.overall}/100
Keyword Match: ${score.keywordMatch}%
Skills Match: ${score.skillsMatch}%
Experience Match: ${score.experienceMatch}%

Top matched keywords: ${matchedKeywords.slice(0, 10).join(", ")}
Missing keywords: ${missingKeywords.slice(0, 15).join(", ")}

Resume summary section exists: ${!!resumeData?.personalInfo?.summary}
Number of experience bullet points: ${(resumeData?.experience || []).reduce((a, e) => a + (e.bullets?.length || 0), 0)}
Technical skills count: ${(resumeData?.skills?.technical || []).length}

Generate specific improvement suggestions:`;

  const raw = await callOpenAI(system, user, 700);

  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch { /* fall through */ }

  return [];
};

// ── 5. Rewrite full experience section ────────────────────────────────────────
/**
 * Rewrites an entire experience entry's bullets for a target role.
 */
const rewriteExperience = async (experience, jobDescription = "") => {
  const bulletCount = (experience.bullets || []).filter(Boolean).length;
  if (bulletCount === 0) return experience;

  const improved = await improveBullets(
    experience.bullets.filter(Boolean),
    experience.position,
    jobDescription
  );

  return { ...experience, bullets: improved };
};

module.exports = {
  improveBullets,
  generateSummary,
  suggestSkills,
  enhanceAtsSuggestions,
  rewriteExperience,
};
