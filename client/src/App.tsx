import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Load route screens only when a user visits them. This keeps the initial
// AstroCareer download small while retaining the same URL and page behavior.
const Home = lazy(() => import("./pages/Home").then(({ Home }) => ({ default: Home })));
const Auth = lazy(() => import("./pages/Auth").then(({ Auth }) => ({ default: Auth })));
const Profile = lazy(() => import("./pages/Profile").then(({ Profile }) => ({ default: Profile })));
const Resume = lazy(() => import("./pages/Resume").then(({ Resume }) => ({ default: Resume })));
const Astrology = lazy(() => import("./pages/Astrology").then(({ Astrology }) => ({ default: Astrology })));
const Careers = lazy(() => import("./pages/Careers").then(({ Careers }) => ({ default: Careers })));
const Assessment = lazy(() => import("./pages/Assessment").then(({ Assessment }) => ({ default: Assessment })));
const Interview = lazy(() => import("./pages/Interview").then(({ Interview }) => ({ default: Interview })));
const Simulator = lazy(() => import("./pages/Simulator").then(({ Simulator }) => ({ default: Simulator })));
const Roadmap = lazy(() => import("./pages/Roadmap").then(({ Roadmap }) => ({ default: Roadmap })));
const Stars = lazy(() => import("./pages/Stars").then(({ Stars }) => ({ default: Stars })));
const CareerReadiness = lazy(() => import("./pages/CareerReadiness").then(({ CareerReadiness }) => ({ default: CareerReadiness })));

const protectedPage = (page: ReactNode) => <ProtectedRoute>{page}</ProtectedRoute>;

export function App() { return <Suspense fallback={<main><p>Loading AstroCareer...</p></main>}><Routes>
  <Route path="/" element={<Home />} /><Route path="/login" element={<Auth />} /><Route path="/register" element={<Auth register />} />
  <Route path="/profile" element={protectedPage(<Profile />)} /><Route path="/resume" element={protectedPage(<Resume />)} />
  <Route path="/astrology" element={protectedPage(<Astrology />)} /><Route path="/careers" element={protectedPage(<Careers />)} />
  <Route path="/assessment" element={protectedPage(<Assessment />)} /><Route path="/interview" element={protectedPage(<Interview />)} />
  <Route path="/simulator" element={protectedPage(<Simulator />)} /><Route path="/roadmap" element={protectedPage(<Roadmap />)} />
  <Route path="/career-readiness" element={protectedPage(<CareerReadiness />)} />
  <Route path="/stars-vs-skills" element={protectedPage(<Stars />)} /><Route path="*" element={<Home />} />
</Routes></Suspense>; }
