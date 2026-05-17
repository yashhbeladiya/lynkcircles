import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RedirectIfAuth } from "@/components/auth/RedirectIfAuth";

import Home from "@/pages/Home";
import Network from "@/pages/Network";
import Works from "@/pages/Works";
import WorkPage from "@/pages/WorkPage";
import Messages from "@/pages/Messages";
import { ChatPane } from "@/components/messaging/ChatPane";
import EmptyChatPane from "@/components/messaging/EmptyChatPane";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";

/**
 * Top-level router. Auth-gated routes are wrapped in <RequireAuth> and
 * render inside <AppShell> (nav chrome). Public auth pages bypass the
 * shell entirely so they can do their own full-screen layouts.
 */
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
              </AppShell>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
