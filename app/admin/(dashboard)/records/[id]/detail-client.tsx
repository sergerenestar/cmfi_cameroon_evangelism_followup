"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";

interface FullRecord {
  id: string;
  created_at: string;
  worker_name: string;
  campaign_name: string | null;
  campaign_location: string | null;
  language: string;
  full_name: string;
  gender: string | null;
  age_range: string | null;
  phone: string;
  quartier: string | null;
  profession: string | null;
  decision_type: string;
  has_bible: boolean | null;
  attends_church: boolean | null;
  home_church: string | null;
  addictions: string | null;
  prayer_healing: boolean;
  prayer_deliverance: boolean;
  prayer_peace: boolean;
  prayer_family: boolean;
  prayer_other: string | null;
  wants_bible_study: boolean;
  wants_church_referral: boolean;
  notes: string | null;
  contact_mode: string | null;
  assigned_church: string | null;
  assigned_disciple_maker: string | null;
}

interface ContactLogEntry {
  id: string;
  created_at: string;
  channel: string;
  provider: string | null;
  message: string | null;
  status: string;
  error: string | null;
}

const DECISION_LABEL: Record<string, string> = {
  first_time: "First commitment (Salvation)",
  rededication: "Reconciliation",
};

const YES_NO = (v: boolean | null) => (v === null ? "Not asked" : v ? "Yes" : "No");

export default function RecordDetailClient({
  id,
  canEdit,
}: {
  id: string;
  canEdit: boolean;
}) {
  const [record, setRecord] = useState<FullRecord | null>(null);
  const [log, setLog] = useState<ContactLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/records/${id}`);
    if (res.ok) {
      const data = await res.json();
      setRecord(data.record);
      setLog(data.contactLog);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveAssignment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      contactMode: data.get("contactMode") || null,
      assignedChurch: data.get("assignedChurch"),
      assignedDiscipleMaker: data.get("assignedDiscipleMaker"),
    };

    const res = await fetch(`/api/admin/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSaveError(body.error ?? "Could not save changes.");
      setSaving(false);
      return;
    }

    setSaving(false);
    load();
  }

  async function handleLogContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLogError(null);
    setLogging(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      channel: data.get("channel"),
      message: data.get("message"),
    };

    const res = await fetch(`/api/admin/records/${id}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setLogError(body.error ?? "Could not log this contact.");
      setLogging(false);
      return;
    }

    form.reset();
    setLogging(false);
    load();
  }

  if (loading) return <p className="text-forest/50 text-sm">Loading…</p>;
  if (!record) return <p className="text-forest/50 text-sm">Record not found.</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link href="/admin/records" className="text-orange text-sm underline underline-offset-4">
          ← Back to records
        </Link>
        <h1 className="font-display text-2xl text-forest mt-2">{record.full_name}</h1>
        <p className="text-forest/60 text-[15px] mt-1">
          {DECISION_LABEL[record.decision_type] ?? record.decision_type} ·{" "}
          {new Date(record.created_at).toLocaleString()}
        </p>
      </div>

      <Section title="About this record">
        <Row label="Counselor / worker" value={record.worker_name} />
        <Row label="Event" value={record.campaign_name} />
        <Row label="Location" value={record.campaign_location} />
        <Row label="Language used" value={record.language === "fr" ? "French" : "English"} />
      </Section>

      <Section title="Personal information">
        <Row label="Sex" value={record.gender} />
        <Row label="Age range" value={record.age_range} />
        <Row label="Phone" value={record.phone} />
        <Row label="Neighborhood / address" value={record.quartier} />
        <Row label="Profession / school" value={record.profession} />
      </Section>

      <Section title="Spiritual situation">
        <Row label="Owns a Bible" value={YES_NO(record.has_bible)} />
        <Row label="Already attends a church" value={YES_NO(record.attends_church)} />
        {record.attends_church && <Row label="Church name" value={record.home_church} />}
      </Section>

      <Section title="Prayer topics">
        <Row label="Addictions" value={record.addictions} />
        <Row
          label="Immediate needs"
          value={
            [
              record.prayer_healing && "Healing",
              record.prayer_deliverance && "Deliverance",
              record.prayer_peace && "Peace",
              record.prayer_family && "Family",
            ]
              .filter(Boolean)
              .join(", ") || null
          }
        />
        <Row label="Other" value={record.prayer_other} />
      </Section>

      <Section title="Follow-up interest">
        <Row label="Wants Bible study / discipleship" value={YES_NO(record.wants_bible_study)} />
        <Row label="Wants help finding a church" value={YES_NO(record.wants_church_referral)} />
        <Row label="Notes" value={record.notes} />
      </Section>

      <Section title="Follow-up plan (team-assigned)">
        {canEdit ? (
          <form onSubmit={handleSaveAssignment} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-forest/80">Preferred contact mode</span>
              <select
                name="contactMode"
                defaultValue={record.contact_mode ?? ""}
                className="mt-1.5 w-full rounded-lg border border-forest/15 px-3 py-2.5 text-[14px] text-forest focus:border-orange"
              >
                <option value="">Not set</option>
                <option value="call">Phone call</option>
                <option value="whatsapp">WhatsApp message</option>
                <option value="home_visit">Home visit</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-forest/80">Assigned local church</span>
              <input
                name="assignedChurch"
                defaultValue={record.assigned_church ?? ""}
                className="mt-1.5 w-full rounded-lg border border-forest/15 px-3 py-2.5 text-[14px] text-forest focus:border-orange"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-forest/80">
                Assigned discipleship maker
              </span>
              <input
                name="assignedDiscipleMaker"
                defaultValue={record.assigned_disciple_maker ?? ""}
                className="mt-1.5 w-full rounded-lg border border-forest/15 px-3 py-2.5 text-[14px] text-forest focus:border-orange"
              />
            </label>
            {saveError && (
              <p role="alert" className="text-sm text-orange bg-orange/10 rounded-lg px-4 py-2.5">
                {saveError}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange text-cream font-medium text-[14px] px-5 py-2.5 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        ) : (
          <>
            <Row label="Preferred contact mode" value={record.contact_mode} />
            <Row label="Assigned local church" value={record.assigned_church} />
            <Row label="Assigned discipleship maker" value={record.assigned_disciple_maker} />
          </>
        )}
      </Section>

      <Section title="Contact history">
        <div className="space-y-2">
          {log.length === 0 && <p className="text-forest/40 text-[14px]">No contact logged yet.</p>}
          {log.map((entry) => (
            <div key={entry.id} className="border-b border-forest/5 pb-2 last:border-0">
              <p className="text-[14px] text-forest">
                <span className="font-medium capitalize">{entry.channel.replace("_", " ")}</span>
                {entry.provider && <span className="text-forest/40"> · {entry.provider}</span>}
                <span className="text-forest/40">
                  {" "}
                  · {new Date(entry.created_at).toLocaleString()}
                </span>
              </p>
              {entry.message && <p className="text-forest/60 text-[14px] mt-0.5">{entry.message}</p>}
              {entry.status === "failed" && (
                <p className="text-orange text-[13px] mt-0.5">Failed: {entry.error}</p>
              )}
            </div>
          ))}
        </div>

        {canEdit && (
          <form onSubmit={handleLogContact} className="mt-5 space-y-3 border-t border-forest/10 pt-5">
            <p className="text-sm font-medium text-forest/80">Log a contact attempt</p>
            <p className="text-xs text-forest/45 -mt-2">
              Real SMS/email sending from here is coming with the outreach phase — this logs a
              call or visit you made outside the system.
            </p>
            <div className="flex gap-3">
              <select
                name="channel"
                required
                defaultValue=""
                className="rounded-lg border border-forest/15 px-3 py-2 text-[14px] text-forest focus:border-orange"
              >
                <option value="" disabled>
                  Channel
                </option>
                <option value="call">Phone call</option>
                <option value="home_visit">Home visit</option>
              </select>
              <input
                name="message"
                placeholder="Note (optional)"
                className="flex-1 rounded-lg border border-forest/15 px-3 py-2 text-[14px] text-forest focus:border-orange"
              />
            </div>
            {logError && <p className="text-sm text-orange">{logError}</p>}
            <button
              type="submit"
              disabled={logging}
              className="rounded-lg border border-forest/20 text-forest font-medium text-[13px] px-4 py-2 disabled:opacity-60"
            >
              {logging ? "Logging…" : "Log contact"}
            </button>
          </form>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-forest/10 bg-white p-5">
      <h2 className="font-display text-lg text-forest mb-3">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <span className="text-forest/50">{label}</span>
      <span className="text-forest text-right">{value || "—"}</span>
    </div>
  );
}
