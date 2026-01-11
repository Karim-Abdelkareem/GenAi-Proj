# CV Analysis API Documentation

## Overview
This module provides RAG-based CV analysis features including insights, skills gap analysis, and resume suggestions.

## Endpoints

### 1. Get CV Insights
**GET** `/api/v1/cv/insights`

Analyzes the user's CV and provides comprehensive insights including strengths, weaknesses, skills summary, experience highlights, and recommendations.

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "strengths": [
      "Strength 1 with specific examples",
      "Strength 2 with specific examples",
      ...
    ],
    "weaknesses": [
      "Weakness 1 with specific areas to improve",
      ...
    ],
    "skillsSummary": {
      "technical": ["skill1", "skill2"],
      "soft": ["skill1", "skill2"],
      "missing": ["skill1", "skill2"]
    },
    "experienceHighlights": [
      "Highlight 1 from work experience",
      ...
    ],
    "recommendations": [
      "Specific recommendation 1",
      ...
    ],
    "overallScore": 85,
    "summary": "One paragraph overall assessment"
  }
}
```

---

### 2. Analyze Skills Gap
**POST** `/api/v1/cv/skills-gap`

Compares the user's CV skills with a target role and identifies matching skills, missing skills, and provides a learning path.

**Authentication:** Required

**Request Body:**
```json
{
  "targetRole": "Senior Full Stack Developer"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "matchingSkills": [
      {
        "skill": "React",
        "proficiency": "high|medium|low",
        "evidence": "where it appears in CV"
      },
      ...
    ],
    "missingSkills": [
      {
        "skill": "Docker",
        "importance": "critical|high|medium|low",
        "description": "why this skill is needed"
      },
      ...
    ],
    "learningPath": [
      {
        "skill": "Docker",
        "priority": 1,
        "resources": ["resource 1", "resource 2"],
        "estimatedTime": "2-3 weeks"
      },
      ...
    ],
    "matchScore": 75,
    "summary": "Overall assessment of skills gap"
  }
}
```

---

### 3. Get Resume Suggestions
**POST** `/api/v1/cv/resume-suggestions`

Provides specific, actionable suggestions to improve CV sections.

**Authentication:** Required

**Request Body:**
```json
{
  "section": "summary" // Optional: "summary" | "experience" | "skills" | "education" | "all" (default: "all")
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "section": "summary",
    "currentState": "Brief description of current state",
    "suggestions": [
      {
        "issue": "Specific issue identified",
        "suggestion": "Specific improvement suggestion",
        "example": "Example of improved version",
        "priority": "high|medium|low"
      },
      ...
    ],
    "bestPractices": [
      "Best practice 1 for this section",
      ...
    ],
    "beforeAfter": {
      "before": "Example of current phrasing",
      "after": "Improved version"
    },
    "summary": "Overall assessment and next steps"
  }
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "status": "fail",
  "message": "Error message"
}
```

**Common Error Codes:**
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found (CV not uploaded)
- `500` - Internal Server Error

## Notes

- All endpoints require the user to have uploaded a CV first
- Responses are generated using GPT-4o with RAG (Retrieval Augmented Generation)
- Analysis is based on the user's CV content stored in the vector database
- Results are personalized and specific to each user's CV

