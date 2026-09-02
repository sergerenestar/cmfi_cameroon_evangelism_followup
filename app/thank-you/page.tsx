"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { dict, type Lang } from "@/lib/i18n";

export default function ThankYou() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const params = useSearchParams();
  const lang: Lang = params.get("lang") === "fr" ? "fr" : "en";
  const t = dict[lang];

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="bg-forest text-cream px-6 pt-10 pb-8">
        <div className="mx-auto max-w-md">
          <p className="font-body text-sm tracking-wide text-leaf">
            {t.thankYouEyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight mt-3">
            {t.thankYouTitle}
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-6 py-10 space-y-6">
        <p className="text-forest text-[15px] leading-relaxed">{t.thankYouBody}</p>
        <p className="text-forest/70 text-[15px] leading-relaxed">{t.thankYouBody2}</p>
        <Link
          href="/"
          className="inline-block text-orange font-medium text-[15px] underline underline-offset-4"
        >
          {t.thankYouAgain}
        </Link>
      </div>
    </main>
  );
}
