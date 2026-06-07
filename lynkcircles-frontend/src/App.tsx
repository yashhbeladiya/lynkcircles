import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RedirectIfAuth } from "@/components/auth/RedirectIfAuth";

import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

const Home = lazy(() => import("@/pages/Home"));
const Works = lazy(() => import("@/pages/Works"));
const WorkPage = lazy(() => import("@/pages/WorkPage"));
const Messages = lazy(() => import("@/pages/Messages"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const MapPage = lazy(() => import("@/pages/MapPage"));
const Insights = lazy(() => import("@/pages/Insights"));
const Matches = lazy(() => import("@/pages/Matches"));
const ChatPane = lazy(() =>
  import("@/components/messaging/ChatPane").then((m) => ({ default: m.ChatPane }))
);
const EmptyChatPane = lazy(() => import("@/components/messaging/EmptyChatPane"));

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
                    <Route path="/network" element={<Navigate to="/map" replace />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/matches" element={<Matches />} />
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
