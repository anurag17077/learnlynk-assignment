export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "#f8fafc",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#1e3a8a",
          textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        Welcome to LearnLynk
      </h1>

      <p
        style={{
          fontSize: "1.25rem",
          color: "#334155",
          background: "#e0e7ff",
          padding: "10px 20px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        Go to <strong>/dashboard/today</strong> to see tasks.
      </p>
    </div>
  );
}
