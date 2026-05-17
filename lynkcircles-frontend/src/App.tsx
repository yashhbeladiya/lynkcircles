import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RedirectIfAuth } from "@/components/auth/RedirectIfAuth";

/**
 * Route-level code splitting. Every page becomes its own JS chunk so
 * the initial paint only loads what's needed for the current URL.
 * Home + AppShell are around ~150KB gzipped on their own; pages like
 * Profile (portfolio + dialogs + image processing) used to bring
 * another ~70KB on every first paint even when the user landed on
 * Home. With React.lazy + Suspense those bytes only ship when the
 * user actually navigates there.
 *
 * Messages is lazy too, including the ChatPane/EmptyChatPane that
 * live as child route elements — same chunk as the parent so the
 * outlet swap doesn't trigger a second download.
 *
 * SignIn and SignUp stay eager because they're the entry point for
 * unauthenticated users — splitting them just adds a spinner before
 * the very first paint.
 */
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

const Home = lazy(() => import("@/pages/Home"));
const Network = lazy(() => import("@/pages/Network"));
const Works = lazy(() => import("@/pages/Works"));
const WorkPage = lazy(() => import("@/pages/WorkPage"));
const Messages = lazy(() => import("@/pages/Messages"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ChatPane = lazy(() =>
  import("@/components/messaging/ChatPane").then((m) => ({ default: m.ChatPane }))
);
const EmptyChatPane = lazy(() => import("@/components/messaging/EmptyChatPane"));

/**
 * Fallback rendered while the route's chunk is in flight. Centered
 * spinner — matches the loading state most pages already use, so
 * the transition doesn't jolt the layout.
 */
const RouteSpinner = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
    }}
  >
    <CircularProgress size={24} />
  </Box>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={
            <RedirectIfAuth>
              <SignIn />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuth>
              <SignUp />
            </RedirectIfAuth>
          }
        />
        <Route
          path="*"
          element={
            <RequireAuth>
              <AppShell>
                <Suspense fallback={<RouteSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/network" element={<Network />} />
                    <Route path="/works" element={<Works />} />
                    <Route path="/works/:workPostId" element={<WorkPage />} />
                    <Route path="/messages" element={<Messages />}>
                      <Route index element={<EmptyChatPane />} />
                      <Route path=":peerId" element={<ChatPane />} />
                    </Route>
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AppShell>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
