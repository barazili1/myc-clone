import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const App = lazy(() =>
  import("../app/App").then((m) => ({ default: m.App })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EL HETAN V1 — AI Game Predictor" },
      {
        name: "description",
        content:
          "EL HETAN V1: AI-powered predictions and live analytics for Apple, Crash, Mines and Wild West games.",
      },
      { property: "og:title", content: "EL HETAN V1 — AI Game Predictor" },
      {
        property: "og:description",
        content:
          "AI-powered predictions and live analytics for Apple, Crash, Mines and Wild West games.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
        <App />
      </Suspense>
    </ClientOnly>
  );
}
