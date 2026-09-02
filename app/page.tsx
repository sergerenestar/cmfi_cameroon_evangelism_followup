"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { dict, EVENT, type Lang } from "@/lib/i18n";

type DecisionType = "first_time" | "rededication";

export default function NewConvertForm() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const t = dict[lang];

  const [decisionType, setDecisionType] = useState<DecisionType | "">("");
  const [attendsChurch, setAttendsChurch] = useState<"" | "yes" | "no">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decisionOptions: { value: DecisionType; label: string }[] = [
    { value: "first_time", label: t.decisionFirstTime },
    { value: "rededication", label: t.decisionRededication },
  ];

  const ageOptions: { value: string; label: string }[] = [
    { value: "12-17", label: t.age1 },
    { value: "18-25", label: t.age2 },
    { value: "26-35", label: t.age3 },
    { value: "36+", label: t.age4 },
  ];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const workerName = String(data.get("workerName") ?? "").trim();

    if (!workerName) {
      setError(t.errWorkerName);
      return;
    }
    if (!decisionType) {
      setError(t.errDecision);
      return;
    }

    const payload = {
      workerName,
      campaignName: data.get("campaignName"),
      campaignLocation: data.get("campaignLocation"),
      language: lang,

      fullName: data.get("fullName"),
      gender: data.get("gender"),
      ageRange: data.get("ageRange"),
      phone: data.get("phone"),
      quartier: data.get("quartier"),
      profession: data.get("profession"),

      decisionType,
      hasBible: data.get("hasBible") ?? "",
      attendsChurch: data.get("attendsChurch") ?? "",
      homeChurch: data.get("homeChurch"),

      addictions: data.get("addictions"),
      prayerHealing: data.get("prayerHealing") === "on",
      prayerDeliverance: data.get("prayerDeliverance") === "on",
      prayerPeace: data.get("prayerPeace") === "on",
      prayerFamily: data.get("prayerFamily") === "on",
      prayerOther: data.get("prayerOther"),

      wantsBibleStudy: data.get("wantsBibleStudy") === "on",
      wantsChurchReferral: data.get("wantsChurchReferral") === "on",
      notes: data.get("notes"),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const resBody = await res.json().catch(() => ({}));
        setError(resBody.error ?? t.errGeneric);
        setSubmitting(false);
        return;
      }

      router.push(`/thank-you?lang=${lang}`);
    } catch {
      setError(t.errOffline);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      {/* ---------- Landing / event hero ---------- */}
      <section className="bg-forest text-cream px-6 pt-10 pb-8 relative overflow-hidden">
        <div className="mx-auto max-w-md relative">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="text-xs font-medium tracking-wide border border-cream/40 rounded-full px-3 py-1.5 text-cream/90"
          >
            {t.langToggle}
          </button>

          <p className="font-body text-sm tracking-wide text-gold mt-6">{t.eyebrow}</p>
          <h1 className="font-display text-[28px] leading-tight mt-2">{t.heroTitle}</h1>
          <p className="mt-2 text-cream/80 text-[14px]">{t.heroSubtitle}</p>

          <div className="mt-5 flex items-baseline gap-2 text-leaf">
            <span className="font-display text-2xl">{t.heroDates}</span>
          </div>
          <p className="text-cream/85 text-[15px] mt-1">{t.heroLocation}</p>

          <div className="mt-6 pt-5 border-t border-cream/15">
            <p className="text-xs tracking-wide text-cream/60 mb-2">{t.speakersHeading}</p>
            <ul className="text-[14px] text-cream/90 leading-relaxed space-y-0.5">
              {EVENT.speakers.map((s) => (
                <li key={s.name}>
                  {s.name}
                  <span className="text-cream/50"> — {s.role[lang]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 pt-5 border-t border-cream/15">
            <p className="text-xs tracking-wide text-cream/60 mb-1">{t.contactHeading}</p>
            <p className="text-[14px] text-cream/90">{EVENT.contacts.join("  ·  ")}</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
          <span className="flex-1" style={{ backgroundColor: "#007A5E" }} />
          <span className="flex-1" style={{ backgroundColor: "#CE1126" }} />
          <span className="flex-1" style={{ backgroundColor: "#FCD116" }} />
        </div>
      </section>

      {/* ---------- Form intro ---------- */}
      <div className="px-6 pt-8">
        <div className="mx-auto max-w-md">
          <p className="font-body text-sm tracking-wide text-orange">{t.formEyebrow}</p>
          <h2 className="font-display text-2xl leading-tight mt-2 text-forest">
            {t.formTitle}
          </h2>
          <p className="mt-2 text-forest/70 text-[15px] leading-relaxed">{t.formIntro}</p>
        </div>
      </div>

      {/* ---------- Form ---------- */}
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md px-6 py-8 space-y-9">
        {/* Intake context */}
        <fieldset className="space-y-4">
          <legend className="font-display text-xl text-forest mb-1">{t.sectionIntake}</legend>
          <Field
            label={t.workerName}
            name="workerName"
            required
            hint={t.workerNameHint}
          />
          <Field label={t.campaignName} name="campaignName" defaultValue={EVENT.name} />
          <Field label={t.campaignLocation} name="campaignLocation" defaultValue={EVENT.location} />
        </fieldset>

        {/* 1. Informations Personnelles */}
        <fieldset className="space-y-4">
          <legend className="font-display text-xl text-forest mb-1">{t.sectionAbout}</legend>
          <Field label={t.fullName} name="fullName" required autoComplete="name" />

          <div>
            <span className="text-sm font-medium text-forest/80">{t.sex}</span>
            <div className="mt-1.5 flex gap-2">
              <RadioPill name="gender" value="M" label={t.sexM} />
              <RadioPill name="gender" value="F" label={t.sexF} />
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-forest/80">{t.ageRange}</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {ageOptions.map((opt) => (
                <RadioPill key={opt.value} name="ageRange" value={opt.value} label={opt.label} />
              ))}
            </div>
          </div>

          <Field
            label={t.phone}
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
          />
          <Field label={t.quartier} name="quartier" />
          <Field label={t.profession} name="profession" />
        </fieldset>

        {/* 2. Situation Spirituelle */}
        <fieldset className="space-y-5">
          <legend className="font-display text-xl text-forest mb-1">{t.sectionSpiritual}</legend>

          <div className="space-y-2.5">
            <p className="text-sm font-medium text-forest/80">{t.sectionDecision}</p>
            {decisionOptions.map((opt) => (
              <label
                key={opt.value}
                className={`block rounded-lg border px-4 py-3.5 cursor-pointer transition-colors ${
                  decisionType === opt.value
                    ? "border-orange bg-orange/[0.06]"
                    : "border-forest/15 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="decisionType"
                  value={opt.value}
                  checked={decisionType === opt.value}
                  onChange={() => setDecisionType(opt.value)}
                  className="sr-only"
                />
                <span className="block font-medium text-forest text-[15px]">{opt.label}</span>
              </label>
            ))}
          </div>

          <div>
            <span className="text-sm font-medium text-forest/80">{t.hasBible}</span>
            <div className="mt-1.5 flex gap-2">
              <RadioPill name="hasBible" value="yes" label={t.yes} />
              <RadioPill name="hasBible" value="no" label={t.no} />
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-forest/80">{t.attendsChurch}</span>
            <div className="mt-1.5 flex gap-2">
              <RadioPill
                name="attendsChurch"
                value="yes"
                label={t.yes}
                onSelect={() => setAttendsChurch("yes")}
              />
              <RadioPill
                name="attendsChurch"
                value="no"
                label={t.no}
                onSelect={() => setAttendsChurch("no")}
              />
            </div>
            {attendsChurch === "yes" && (
              <div className="mt-3">
                <Field label={t.homeChurchName} name="homeChurch" />
              </div>
            )}
          </div>
        </fieldset>

        {/* Prayer topics */}
        <fieldset className="space-y-3">
          <legend className="font-display text-xl text-forest mb-1">{t.sectionPrayer}</legend>
          <Field
            label={t.addictions}
            name="addictions"
            placeholder={t.addictionsPlaceholder}
          />

          <div>
            <p className="text-sm font-medium text-forest/80 mb-1.5">{t.immediateNeeds}</p>
            <div className="grid grid-cols-2 gap-2">
              <Checkbox name="prayerHealing" label={t.needHealing} />
              <Checkbox name="prayerDeliverance" label={t.needDeliverance} />
              <Checkbox name="prayerPeace" label={t.needPeace} />
              <Checkbox name="prayerFamily" label={t.needFamily} />
            </div>
          </div>

          <Field
            label={t.needOther}
            name="prayerOther"
            placeholder={t.needOtherPlaceholder}
          />
        </fieldset>

        {/* Follow-up interest (not on the paper fiche, kept for convenience) */}
        <fieldset className="space-y-3">
          <legend className="font-display text-xl text-forest mb-1">{t.sectionNext}</legend>
          <Checkbox name="wantsBibleStudy" label={t.wantsBibleStudy} />
          {attendsChurch !== "yes" && (
            <Checkbox name="wantsChurchReferral" label={t.wantsChurchReferral} />
          )}
        </fieldset>

        <fieldset>
          <label className="block">
            <span className="text-sm font-medium text-forest/80">{t.notesLabel}</span>
            <textarea
              name="notes"
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-forest/15 bg-white px-4 py-3 text-[15px] text-forest placeholder:text-forest/35 focus:border-orange"
              placeholder={t.notesPlaceholder}
            />
          </label>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-orange bg-orange/10 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-orange text-cream font-medium text-[15px] py-4 disabled:opacity-60 active:scale-[0.99] transition-transform"
        >
          {submitting ? t.submitting : t.submit}
        </button>

        <p className="text-center text-xs text-forest/50 leading-relaxed pb-4">
          {t.privacyNote}
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  inputMode,
  placeholder,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-forest/80">
        {label}
        {required && <span className="text-orange"> *</span>}
      </span>
      {hint && <span className="block text-xs text-forest/45 mt-0.5">{hint}</span>}
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-lg border border-forest/15 bg-white px-4 py-3 text-[15px] text-forest placeholder:text-forest/35 focus:border-orange"
      />
    </label>
  );
}

function RadioPill({
  name,
  value,
  label,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  onSelect?: () => void;
}) {
  return (
    <label className="flex-1 min-w-0">
      <input
        type="radio"
        name={name}
        value={value}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span className="block text-center rounded-lg border border-forest/15 bg-white px-3 py-2.5 text-[14px] text-forest peer-checked:border-orange peer-checked:bg-orange/[0.08] peer-checked:font-medium cursor-pointer truncate">
        {label}
      </span>
    </label>
  );
}

function Checkbox({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-forest/15 bg-white px-4 py-3.5 cursor-pointer">
      <input type="checkbox" name={name} className="mt-0.5 h-4 w-4 accent-orange shrink-0" />
      <span className="text-[15px] text-forest">{label}</span>
    </label>
  );
}
