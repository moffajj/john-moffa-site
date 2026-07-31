export const metadata = {
  title: "Privacy Policy — Oura Bros",
};

export default function OuraBrosPrivacy() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0ede8", marginBottom: 16, letterSpacing: "-0.02em" }}>
          Privacy Policy
        </h1>
        <div style={{ fontSize: 16, color: "#888", lineHeight: 1.7, display: "grid", gap: 14 }}>
          <p>
            Oura Bros is a private, invite-only project for comparing Oura Ring statistics among friends. Health statistics added to the project are visible to other invited participants on the shared dashboard.
          </p>
          <p>
            Oura personal access tokens are encrypted before storage and are used only by the server to retrieve Oura data. Tokens are never displayed on the dashboard or sent to the browser after submission.
          </p>
          <p>
            Data is processed using Oura, Supabase, and the application hosting provider. To request removal of your account, stored token, and health statistics, contact the site owner.
          </p>
        </div>
      </div>
    </main>
  );
}
