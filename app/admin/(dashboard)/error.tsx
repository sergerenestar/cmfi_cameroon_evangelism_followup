"use client";

// Temporary diagnostic boundary — shows the real error on screen instead
// of a blank page while we track down the /admin blank-page issue.
export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: 24, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      <h2>Admin portal error</h2>
      <p>{error.message}</p>
      {error.stack && <p>{error.stack}</p>}
      {error.digest && <p>Digest: {error.digest}</p>}
    </div>
  );
}
