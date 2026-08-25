import { Router } from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are supported"));
    }
  }
});

const skillDatabase: Record<string, string[]> = {
  "Java Developer": [
    "java",
    "spring",
    "spring boot",
    "hibernate",
    "sql",
    "mysql",
    "git",
    "rest api"
  ],

  "Full Stack Developer": [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "node.js",
    "node",
    "express",
    "mongodb",
    "mysql",
    "sql",
    "git",
    "rest api"
  ],

  "Frontend Developer": [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "angular",
    "vue",
    "git"
  ],

  "Backend Developer": [
    "java",
    "spring boot",
    "node.js",
    "node",
    "express",
    "python",
    "django",
    "mongodb",
    "mysql",
    "sql",
    "rest api",
    "git"
  ],

  "Data Analyst": [
    "python",
    "sql",
    "excel",
    "power bi",
    "tableau",
    "pandas",
    "numpy",
    "statistics"
  ],

  "Data Scientist": [
    "python",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "pandas",
    "numpy",
    "scikit-learn",
    "sql",
    "statistics"
  ],

  "DevOps Engineer": [
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "jenkins",
    "linux",
    "git",
    "ci/cd"
  ],

  "Software Developer": [
    "java",
    "python",
    "javascript",
    "c++",
    "sql",
    "git",
    "data structures",
    "algorithms"
  ]
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s+#./-]/g, " ")
    .replace(/\s+/g, " ");

const containsSkill = (
  text: string,
  skill: string
) => {
  const normalizedSkill = skill.toLowerCase();

  if (
    normalizedSkill.includes(" ") ||
    normalizedSkill.includes("/") ||
    normalizedSkill.includes("+") ||
    normalizedSkill.includes(".")
  ) {
    return text.includes(normalizedSkill);
  }

  const words = text.split(/\s+/);

  return words.includes(normalizedSkill);
};

const detectSkills = (text: string) => {
  const normalizedText = normalizeText(text);

  const allSkills = [
    ...new Set(
      Object.values(skillDatabase)
        .flat()
    )
  ];

  return allSkills.filter(skill =>
    containsSkill(normalizedText, skill)
  );
};

const calculateCareerMatches = (
  detectedSkills: string[]
) => {
  const normalizedSkills = detectedSkills.map(
    skill => skill.toLowerCase()
  );

  return Object.entries(skillDatabase)
    .map(([career, requiredSkills]) => {
      const matchedSkills = requiredSkills.filter(
        skill =>
          normalizedSkills.includes(
            skill.toLowerCase()
          )
      );

      const missingSkills = requiredSkills.filter(
        skill =>
          !normalizedSkills.includes(
            skill.toLowerCase()
          )
      );

      const matchPercentage = Math.round(
        (matchedSkills.length /
          requiredSkills.length) *
          100
      );

      return {
        career,
        matchPercentage,
        matchedSkills,
        missingSkills
      };
    })
    .sort(
      (a, b) =>
        b.matchPercentage -
        a.matchPercentage
    );
};

const calculateResumeScore = (
  text: string,
  detectedSkills: string[]
) => {
  const normalizedText = normalizeText(text);

  let score = 0;

  const hasEducation =
    /education|degree|b\.tech|btech|bca|mca|bsc|msc|college|university/.test(
      normalizedText
    );

  const hasExperience =
    /experience|internship|intern|employment|worked|developer|engineer/.test(
      normalizedText
    );

  const hasProjects =
    /projects|project|developed|built|created|implemented/.test(
      normalizedText
    );

  const hasContact =
    /email|phone|mobile|linkedin|github/.test(
      normalizedText
    );

  const hasSummary =
    /summary|objective|profile|about me/.test(
      normalizedText
    );

  const hasCertifications =
    /certification|certificate|certified/.test(
      normalizedText
    );

  if (hasContact) score += 15;
  if (hasSummary) score += 10;
  if (hasEducation) score += 15;
  if (hasExperience) score += 15;
  if (hasProjects) score += 15;
  if (hasCertifications) score += 10;

  score += Math.min(
    20,
    detectedSkills.length * 2
  );

  return Math.min(100, score);
};

const getResumeSuggestions = (
  text: string,
  detectedSkills: string[]
) => {
  const normalizedText = normalizeText(text);

  const suggestions: string[] = [];

  if (
    !/summary|objective|profile/.test(
      normalizedText
    )
  ) {
    suggestions.push(
      "Add a short professional summary or career objective."
    );
  }

  if (
    !/project|developed|built|implemented/.test(
      normalizedText
    )
  ) {
    suggestions.push(
      "Add projects with technologies and measurable results."
    );
  }

  if (
    !/experience|internship|intern|employment/.test(
      normalizedText
    )
  ) {
    suggestions.push(
      "Add internship, work experience, or practical experience."
    );
  }

  if (
    !/github|linkedin/.test(
      normalizedText
    )
  ) {
    suggestions.push(
      "Add your GitHub and LinkedIn profiles."
    );
  }

  if (detectedSkills.length < 5) {
    suggestions.push(
      "Add more relevant technical skills that you actually know."
    );
  }

  if (
    !/certification|certificate|certified/.test(
      normalizedText
    )
  ) {
    suggestions.push(
      "Consider adding relevant certifications or courses."
    );
  }

  if (text.length < 800) {
    suggestions.push(
      "Your resume appears short. Add relevant projects, achievements, and experience."
    );
  }

  return suggestions;
};

const getJobRecommendations = (
  careerMatches: ReturnType<
    typeof calculateCareerMatches
  >
) => {
  return careerMatches
    .filter(
      career =>
        career.matchPercentage >= 40
    )
    .slice(0, 5)
    .map(career => ({
      role: career.career,
      matchPercentage:
        career.matchPercentage,
      reason:
        career.matchPercentage >= 75
          ? "Strong match based on your current skills."
          : career.matchPercentage >= 55
          ? "Good match. A few additional skills can improve your chances."
          : "Possible career option, but additional skills are recommended."
    }));
};

router.post(
  "/upload",
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: "NO_FILE",
            message: "Please upload a resume"
          }
        });
      }

      const file = req.file;

      let text = "";

      if (
        file.mimetype ===
        "application/pdf"
      ) {
        const parser = new PDFParse({
          data: file.buffer
        });

        const result =
          await parser.getText();

        text = result.text;

        await parser.destroy();
      } else if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result =
          await mammoth.extractRawText({
            buffer: file.buffer
          });

        text = result.value;
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FILE",
            message:
              "Only PDF and DOCX files are supported"
          }
        });
      }

      const cleanedText =
        text.trim();

      if (!cleanedText) {
        return res.status(400).json({
          success: false,
          error: {
            code: "EMPTY_RESUME",
            message:
              "Could not extract text from the resume"
          }
        });
      }

      const detectedSkills =
        detectSkills(cleanedText);

      const careerMatches =
        calculateCareerMatches(
          detectedSkills
        );

      const resumeScore =
        calculateResumeScore(
          cleanedText,
          detectedSkills
        );

      const suggestions =
        getResumeSuggestions(
          cleanedText,
          detectedSkills
        );

      const jobRecommendations =
        getJobRecommendations(
          careerMatches
        );

      const topCareer =
        careerMatches.length > 0
          ? careerMatches[0]
          : null;

      const skillsToLearn =
        topCareer
          ? topCareer.missingSkills
          : [];

      return res.json({
        success: true,
        data: {
          filename:
            file.originalname,

          text: cleanedText,

          characterCount:
            cleanedText.length,

          resumeScore,

          skills: detectedSkills,

          topCareer: topCareer
            ? {
                career:
                  topCareer.career,
                matchPercentage:
                  topCareer.matchPercentage
              }
            : null,

          careerMatches,

          jobRecommendations,

          skillsToLearn,

          suggestions,

          analysis: {
            totalSkills:
              detectedSkills.length,

            totalCareerMatches:
              careerMatches.length,

            recommendedJobs:
              jobRecommendations.length
          }
        }
      });
    } catch (error) {
      console.error(
        "Resume analysis error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            "RESUME_PROCESSING_ERROR",
          message:
            "Unable to analyze resume"
        }
      });
    }
  }
);

export default router;