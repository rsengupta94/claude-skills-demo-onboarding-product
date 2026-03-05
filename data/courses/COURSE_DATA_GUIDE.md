# Course Data Collection Guide

This guide explains how to collect course information from Coursera to populate the catalog.

## What You Need to Provide

For each Coursera course (aim for 8-10 courses covering behavioral skills), collect:

### 1. **Basic Information**
- Course title
- Coursera URL
- Duration (in hours)
- Primary skills it teaches (e.g., "Communication", "Strategic Thinking")

### 2. **Course Description**
- Copy the main course description from the Coursera page
- Usually found at the top of the course page under "About this Course"

### 3. **Learning Objectives**
- Copy the "What you'll learn" section
- Usually bullet points listing key outcomes
- Separate multiple objectives with pipe character: `|`

### 4. **Module Information** (if available)
- List of modules with titles and brief descriptions
- Found in the "Syllabus" or "Course Structure" section
- Format: `Module 1: Title - Description|Module 2: Title - Description`

---

## How to Find This Information on Coursera

1. **Go to the course page** (e.g., https://coursera.org/learn/executive-communication)

2. **Scroll down to find:**
   - **About this Course** → Course description
   - **What You'll Learn** → Learning objectives (bullet points)
   - **Syllabus** → Module titles and descriptions

3. **Copy and paste** into the format below

---

## Format for Providing Course Data

### Option 1: CSV Format (Easiest)

Create a CSV file or spreadsheet with these columns:

```
course_id | title | provider | duration_hours | skills | coursera_url | description | learning_objectives | modules
```

**Example Row:**
```csv
exec-comm-101,Executive Communication and Influence,Coursera,12,Communication|Leadership,https://coursera.org/learn/executive-communication,"Master the art of communicating effectively with senior leaders...","Present complex ideas clearly to executive audiences|Craft compelling narratives using data storytelling|Influence stakeholders across organizational levels","Module 1: Foundations of Executive Communication - Understanding executive priorities|Module 2: Data Storytelling - Transforming numbers into narratives|Module 3: Cross-Cultural Communication - Adapting your message globally|Module 4: Influencing Without Authority - Building credibility and driving decisions"
```

### Option 2: Structured Text (Easier to Read)

For each course, provide:

```
COURSE 1:
Course ID: exec-comm-101
Title: Executive Communication and Influence
URL: https://coursera.org/learn/executive-communication
Duration: 12 hours
Skills: Communication, Leadership

Description:
Master the art of communicating effectively with senior leaders and stakeholders. Learn to present data-driven insights, influence without authority, and adapt your message across cultures.

Learning Objectives:
- Present complex ideas clearly to executive audiences
- Craft compelling narratives using data storytelling
- Influence stakeholders across organizational levels
- Navigate cross-cultural communication challenges

Modules:
1. Foundations of Executive Communication - Understanding executive priorities and communication preferences
2. Data Storytelling - Transforming numbers into compelling narratives
3. Cross-Cultural Communication - Adapting your message for global audiences
4. Influencing Without Authority - Building credibility and driving decisions
```

---

## Recommended Course Topics (Based on Demo JDs)

### Priority Skills to Cover:

1. **Communication** (2-3 courses)
   - Executive communication
   - Presentation skills
   - Stakeholder communication
   - Data storytelling

2. **Strategic Thinking** (2-3 courses)
   - Business strategy
   - Strategic planning
   - Strategic decision-making

3. **Collaboration & Stakeholder Management** (2-3 courses)
   - Cross-functional leadership
   - Stakeholder management
   - Influencing without authority
   - Building relationships

4. **Problem-Solving** (1-2 courses)
   - Critical thinking
   - Analytical problem-solving
   - Creative solutions

5. **Project/Program Management** (1-2 courses)
   - Project management fundamentals
   - Managing complex initiatives
   - Agile methodologies

---

## Tips for Selecting Courses

✅ **Do:**
- Choose courses focused on **behavioral/soft skills**
- Look for courses with **clear module structures**
- Prioritize courses with **rich descriptions and learning objectives**
- Include courses at **different skill levels** (foundational to advanced)

❌ **Avoid:**
- Highly technical courses (Python, SQL, etc.) - not the focus for this demo
- Courses without clear module breakdowns
- Very short courses (< 3 hours) or very long (> 20 hours)

---

## Quick Start: Sample Coursera Searches

Try searching Coursera for:
- "Executive Communication"
- "Strategic Thinking"
- "Leadership Skills"
- "Stakeholder Management"
- "Business Strategy"
- "Cross-Functional Collaboration"
- "Project Management"
- "Critical Thinking"

---

## What to Do After Collecting

Once you have 8-10 courses:
1. Format them according to Option 1 (CSV) or Option 2 (Structured Text)
2. Provide the data to Claude
3. I'll create/update the `course-catalog.csv` file
4. System will be ready to match courses to skill gaps!

---

## Questions?

Just ask! I can help with:
- Identifying good Coursera courses for specific skills
- Formatting the data correctly
- Troubleshooting any issues
