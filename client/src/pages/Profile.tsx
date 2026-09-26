import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { api, unwrap } from "../lib/api";

export function Profile() {
  const navigate = useNavigate();

  const [p, setP] = useState<any>({
    interests: [],
    skills: [],
    languages: [],
    preferredCareers: [],
    projects: 0,
    experience: 0,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load existing profile
  useEffect(() => {
    api
      .get("/profile")
      .then(unwrap)
      .then((data: any) => {
        if (data) {
          setP({
            ...data,
            interests: data.interests || [],
            skills: data.skills || [],
            languages: data.languages || [],
            preferredCareers:
              data.preferredCareers || [],
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load profile");
      });
  }, []);

  // Save profile
  const save = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const profileData = {
        ...p,

        interests: String(p.interests)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),

        skills: String(p.skills)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),

        languages: String(p.languages)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),

        preferredCareers: String(p.preferredCareers)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),
      };

      await api.put(
        "/profile",
        profileData
      );

      setMessage(
        "Profile saved successfully! 🎉"
      );

      // Go to astrology after saving
      setTimeout(() => {
        navigate("/astrology");
      }, 1000);
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.error?.message ||
          "Unable to save profile"
      );
    }
  };

  return (
    <Layout>
      <form
        className="form wide"
        onSubmit={save}
      >
        <h1>Your Student Profile</h1>

        <label>
          Date of Birth
          <input
            type="date"
            value={p.dateOfBirth || ""}
            onChange={(e) =>
              setP({
                ...p,
                dateOfBirth: e.target.value,
              })
            }
          />
        </label>

        <label>
          Birth Time
          <input
            type="text"
            placeholder="10:30 AM"
            value={p.birthTime || ""}
            onChange={(e) =>
              setP({
                ...p,
                birthTime: e.target.value,
              })
            }
          />
        </label>

        <label>
          Birth Place
          <input
            type="text"
            placeholder="Shimla"
            value={p.birthPlace || ""}
            onChange={(e) =>
              setP({
                ...p,
                birthPlace: e.target.value,
              })
            }
          />
        </label>

        <label>
          College
          <input
            type="text"
            value={p.college || ""}
            onChange={(e) =>
              setP({
                ...p,
                college: e.target.value,
              })
            }
          />
        </label>

        <label>
          Course
          <input
            type="text"
            placeholder="B.Tech"
            value={p.course || ""}
            onChange={(e) =>
              setP({
                ...p,
                course: e.target.value,
              })
            }
          />
        </label>

        <label>
          Specialization
          <input
            type="text"
            placeholder="Computer Science"
            value={p.specialization || ""}
            onChange={(e) =>
              setP({
                ...p,
                specialization: e.target.value,
              })
            }
          />
        </label>

        <label>
          Semester
          <input
            type="text"
            placeholder="5"
            value={p.semester || ""}
            onChange={(e) =>
              setP({
                ...p,
                semester: e.target.value,
              })
            }
          />
        </label>

        <label>
          Interests
          <input
            type="text"
            placeholder="Coding, AI, Web Development"
            value={
              Array.isArray(p.interests)
                ? p.interests.join(", ")
                : p.interests || ""
            }
            onChange={(e) =>
              setP({
                ...p,
                interests: e.target.value,
              })
            }
          />
        </label>

        <label>
          Skills
          <input
            type="text"
            placeholder="Java, DSA, SQL"
            value={
              Array.isArray(p.skills)
                ? p.skills.join(", ")
                : p.skills || ""
            }
            onChange={(e) =>
              setP({
                ...p,
                skills: e.target.value,
              })
            }
          />
        </label>

        <label>
          Programming Languages
          <input
            type="text"
            placeholder="Java, Python, JavaScript"
            value={
              Array.isArray(p.languages)
                ? p.languages.join(", ")
                : p.languages || ""
            }
            onChange={(e) =>
              setP({
                ...p,
                languages: e.target.value,
              })
            }
          />
        </label>

        <label>
          Projects
          <input
            type="number"
            min="0"
            value={p.projects || 0}
            onChange={(e) =>
              setP({
                ...p,
                projects: Number(e.target.value),
              })
            }
          />
        </label>

        <label>
          Experience
          <input
            type="number"
            min="0"
            value={p.experience || 0}
            onChange={(e) =>
              setP({
                ...p,
                experience: Number(e.target.value),
              })
            }
          />
        </label>

        <button type="submit">
          Save Profile & Continue →
        </button>

        {message && (
          <p style={{ color: "#7cffb2" }}>
            {message}
          </p>
        )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}
      </form>
    </Layout>
  );
}
