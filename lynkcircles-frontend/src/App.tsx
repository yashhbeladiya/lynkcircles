/**
 * Minimal scaffold landing — real layout, router, theme, and pages land
 * in subsequent commits in this phase. This commit only verifies the
 * Vite + strict-TS + path-alias setup compiles and renders.
 */
function App() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "0.5rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ margin: 0, fontWeight: 600, letterSpacing: "-0.02em" }}>
        lynkcircles
      </h1>
      <p style={{ margin: 0, color: "#64748b" }}>
        New frontend scaffold — Phase 1b in progress.
      </p>
    </main>
  );
}

export default App;
