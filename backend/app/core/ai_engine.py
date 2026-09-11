import json
import re
from typing import Dict, Any, List
from backend.app.config import settings

ANALYSIS_SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) reviewer and senior technical recruiter.
Your job is to compare a candidate's resume text against a target job description with rigorous detail.

Evaluate:
1. Overall relevance and qualifications match.
2. Missing critical skills, technologies, keywords, certifications, or methodologies that the job demands.
3. Concrete, high-impact suggestions to tailor the resume to the job description.

Return ONLY a valid JSON object with the following exact keys:
{
  "match_score": <integer from 0 to 100>,
  "missing_keywords": [<list of strings for missing skills/keywords>],
  "suggestions": "<detailed, actionable advice with bullet points on how to improve the resume for this role>",
  "strengths": [<list of strings highlighting where the candidate matches well>],
  "summary": "<concise overview of fit>"
}
"""


def _heuristic_fallback_analysis(resume_text: str, job_description: str) -> Dict[str, Any]:
    """
    Intelligent keyword-based analysis used when no external AI API key is configured
    or during automated testing.
    """
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()

    # Extract common tech & soft skill terms from JD
    common_skills = [
        "python", "fastapi", "django", "flask", "docker", "kubernetes", "aws", "gcp", "azure",
        "sql", "postgresql", "mysql", "mongodb", "redis", "celery", "graphql", "rest api",
        "react", "next.js", "typescript", "javascript", "tailwind", "git", "ci/cd",
        "agile", "microservices", "unit testing", "system design", "linux", "html", "css"
    ]

    jd_skills = [skill for skill in common_skills if skill in jd_lower]
    if not jd_skills:
        # Fallback to extracting meaningful words (>= 4 chars) from JD
        words = set(re.findall(r"\b[a-zA-Z]{4,}\b", jd_lower))
        stop_words = {"with", "that", "this", "from", "have", "will", "your", "must", "work", "team", "role", "help"}
        jd_skills = list(words - stop_words)[:10]

    matched_skills = [s for s in jd_skills if s in resume_lower]
    missing_skills = [s for s in jd_skills if s not in resume_lower]

    if jd_skills:
        score = int((len(matched_skills) / len(jd_skills)) * 100)
    else:
        score = 70

    score = max(15, min(95, score))

    suggestions = (
        f"1. Quantify achievements: Add clear metrics and business outcomes to previous experience.\n"
        f"2. Bridge skill gaps: Emphasize practical experience or side projects using {', '.join(missing_skills[:3]) if missing_skills else 'target technologies'}.\n"
        f"3. Tailor summary: Directly align your top profile summary with the key requirements of this job description."
    )

    return {
        "match_score": score,
        "missing_keywords": [s.title() for s in missing_skills],
        "suggestions": suggestions,
        "strengths": [f"Demonstrated proficiency in {s.title()}" for s in matched_skills[:5]],
        "summary": f"Candidate demonstrates a {score}% alignment with the target role. Highlight key missing skills to maximize ATS ranking.",
    }


def analyze_resume_against_job(resume_text: str, job_description: str) -> Dict[str, Any]:
    """
    Orchestrate resume analysis using Anthropic Claude, OpenAI, or the fallback engine.
    """
    api_key = settings.AI_PROVIDER_API_KEY

    # If no API key configured, use intelligent heuristic engine
    if not api_key or api_key.startswith("your_") or api_key.strip() == "":
        return _heuristic_fallback_analysis(resume_text, job_description)

    prompt_user = f"""RESUME TEXT:
\"\"\"
{resume_text}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{job_description}
\"\"\"

Analyze the match and provide structured JSON."""

    # 1. Anthropic Provider
    if settings.AI_PROVIDER.lower() == "anthropic":
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model=settings.AI_MODEL if "claude" in settings.AI_MODEL else "claude-3-5-sonnet-20241022",
                max_tokens=1500,
                system=ANALYSIS_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt_user}],
            )
            raw_text = response.content[0].text
            # Extract JSON block
            json_match = re.search(r"\{[\s\S]*\}", raw_text)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception:
            # Fallback on failure
            return _heuristic_fallback_analysis(resume_text, job_description)

    # 2. OpenAI Provider
    elif settings.AI_PROVIDER.lower() == "openai":
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=settings.AI_MODEL if "gpt" in settings.AI_MODEL else "gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt_user},
                ],
            )
            raw_text = response.choices[0].message.content
            return json.loads(raw_text)
        except Exception:
            return _heuristic_fallback_analysis(resume_text, job_description)

    return _heuristic_fallback_analysis(resume_text, job_description)
