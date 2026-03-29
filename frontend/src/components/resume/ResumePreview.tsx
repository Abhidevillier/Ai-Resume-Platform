import { ResumeFormData } from "@/types";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeFormData;
  previewRef?: React.RefObject<HTMLDivElement>;
}

export default function ResumePreview({ data, previewRef }: ResumePreviewProps) {
  const { personalInfo, education, experience, projects, skills, certifications } = data;
  const { contact } = personalInfo;

  const allTech = skills.technical.join(" • ");
  const allSoft = skills.soft.join(" • ");
  const allLang = skills.languages.join(" • ");

  return (
    <div
      ref={previewRef}
      id="resume-preview"
      className="bg-white text-slate-900 font-sans"
      style={{
        width: "794px",         // A4 width at 96dpi
        minHeight: "1123px",    // A4 height
        padding: "48px 52px",
        fontSize: "12px",
        lineHeight: "1.5",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-4 pb-4 border-b-2 border-slate-800">
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px", color: "#1e293b" }}>
          {personalInfo.name || "Your Name"}
        </h1>

        {/* Contact row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "#475569", fontSize: "11px" }}>
          {personalInfo.email && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Mail size={11} /> {personalInfo.email}
            </span>
          )}
          {contact.phone && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Phone size={11} /> {contact.phone}
            </span>
          )}
          {contact.location && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={11} /> {contact.location}
            </span>
          )}
          {contact.linkedin && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Linkedin size={11} /> {contact.linkedin.replace("https://", "").replace("http://", "")}
            </span>
          )}
          {contact.github && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Github size={11} /> {contact.github.replace("https://", "").replace("http://", "")}
            </span>
          )}
          {contact.portfolio && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Globe size={11} /> {contact.portfolio.replace("https://", "").replace("http://", "")}
            </span>
          )}
        </div>
      </div>

      {/* ── Summary ─────────────────────────────────────────────────────────── */}
      {personalInfo.summary && (
        <Section title="Summary">
          <p style={{ color: "#334155" }}>{personalInfo.summary}</p>
        </Section>
      )}

      {/* ── Experience ──────────────────────────────────────────────────────── */}
      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>{exp.position}</span>
                  <span style={{ color: "#64748b" }}>{exp.company ? ` — ${exp.company}` : ""}</span>
                  {exp.location && <span style={{ color: "#94a3b8" }}>{` · ${exp.location}`}</span>}
                </div>
                <span style={{ color: "#94a3b8", fontSize: "11px", whiteSpace: "nowrap", marginLeft: "8px" }}>
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}
                </span>
              </div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul style={{ marginTop: "4px", paddingLeft: "16px" }}>
                  {exp.bullets.filter(Boolean).map((b, bi) => (
                    <li key={bi} style={{ color: "#334155", marginBottom: "2px", listStyleType: "disc" }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ── Education ───────────────────────────────────────────────────────── */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>{edu.institution}</span>
                  <div style={{ color: "#475569" }}>
                    {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                    {edu.grade && <span style={{ color: "#94a3b8" }}>{` · ${edu.grade}`}</span>}
                  </div>
                </div>
                <span style={{ color: "#94a3b8", fontSize: "11px", whiteSpace: "nowrap", marginLeft: "8px" }}>
                  {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
                </span>
              </div>
              {edu.description && (
                <p style={{ color: "#64748b", marginTop: "2px" }}>{edu.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ── Skills ──────────────────────────────────────────────────────────── */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <Section title="Skills">
          <div style={{ display: "grid", gap: "4px" }}>
            {allTech && <div><span style={{ fontWeight: 600, color: "#1e293b" }}>Technical: </span><span style={{ color: "#334155" }}>{allTech}</span></div>}
            {allSoft && <div><span style={{ fontWeight: 600, color: "#1e293b" }}>Soft Skills: </span><span style={{ color: "#334155" }}>{allSoft}</span></div>}
            {allLang && <div><span style={{ fontWeight: 600, color: "#1e293b" }}>Languages: </span><span style={{ color: "#334155" }}>{allLang}</span></div>}
          </div>
        </Section>
      )}

      {/* ── Projects ────────────────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>{proj.name}</span>
                <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                  {proj.startDate}{proj.endDate ? ` – ${proj.endDate}` : ""}
                </span>
              </div>
              {proj.techStack.length > 0 && (
                <p style={{ color: "#6366f1", fontSize: "11px", marginBottom: "2px" }}>
                  {proj.techStack.join(" · ")}
                </p>
              )}
              {proj.description && <p style={{ color: "#334155" }}>{proj.description}</p>}
              <div style={{ display: "flex", gap: "12px", marginTop: "2px", fontSize: "11px", color: "#6366f1" }}>
                {proj.githubUrl && <span>GitHub: {proj.githubUrl.replace("https://", "")}</span>}
                {proj.liveUrl && <span>Live: {proj.liveUrl.replace("https://", "")}</span>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── Certifications ──────────────────────────────────────────────────── */}
      {certifications.length > 0 && (
        <Section title="Certifications">
          {certifications.map((cert, i) => (
            <div key={i} style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>{cert.name}</span>
                {cert.issuer && <span style={{ color: "#64748b" }}>{` · ${cert.issuer}`}</span>}
              </div>
              {cert.date && <span style={{ color: "#94a3b8", fontSize: "11px" }}>{cert.date}</span>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h2
        style={{
          fontSize: "13px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#4f46e5",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "3px",
          marginBottom: "8px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
