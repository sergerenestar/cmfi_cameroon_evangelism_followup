"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface RecordRow {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  gender: string | null;
  age_range: string | null;
  decision_type: string;
  campaign_name: string | null;
  assigned_church: string | null;
  language: string;
}

const DECISION_LABEL: Record<string, string> = {
  first_time: "First commitment",
  rededication: "Reconciliation",
};

export default function RecordsListClient() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [decisionType, setDecisionType] = useState("");
  const [assignedStatus, setAssignedStatus] = useState("");

  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (decisionType) params.set("decisionType", decisionType);
    if (assignedStatus) params.set("assignedStatus", assignedStatus);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/records?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setRecords(data.records);
      setTotal(data.total);
    }
    setLoading(false);
  }, [search, decisionType, assignedStatus, page]);

  useEffect(() => {
    load();
  }, [load]);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-forest">Records</h1>
      <p className="text-forest/60 text-[15px] mt-1">
        {total} submission{total === 1 ? "" : "s"}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
          placeholder="Search name or phone"
          className="rounded-lg border border-forest/15 bg-white px-3 py-2 text-[14px] text-forest focus:border-orange min-w-[200px]"
        />
        <select
          value={decisionType}
          onChange={(e) => handleFilterChange(() => setDecisionType(e.target.value))}
          className="rounded-lg border border-forest/15 bg-white px-3 py-2 text-[14px] text-forest focus:border-orange"
        >
          <option value="">All decisions</option>
          <option value="first_time">First commitment</option>
          <option value="rededication">Reconciliation</option>
        </select>
        <select
          value={assignedStatus}
          onChange={(e) => handleFilterChange(() => setAssignedStatus(e.target.value))}
          className="rounded-lg border border-forest/15 bg-white px-3 py-2 text-[14px] text-forest focus:border-orange"
        >
          <option value="">All follow-up status</option>
          <option value="assigned">Church assigned</option>
          <option value="unassigned">Not yet assigned</option>
        </select>
      </div>

      <div className="mt-5 rounded-lg border border-forest/10 bg-white overflow-x-auto">
        <table className="w-full text-[14px] whitespace-nowrap">
          <thead>
            <tr className="text-left text-forest/50 border-b border-forest/10">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Phone</th>
              <th className="px-4 py-2.5 font-medium">Decision</th>
              <th className="px-4 py-2.5 font-medium">Campaign</th>
              <th className="px-4 py-2.5 font-medium">Church assigned</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-forest/40 text-center">
                  Loading…
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-forest/40 text-center">
                  No records match these filters.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="border-b border-forest/5 last:border-0 hover:bg-cream/60">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/records/${r.id}`} className="text-forest font-medium hover:text-orange">
                      {r.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-forest/70">{r.phone}</td>
                  <td className="px-4 py-2.5 text-forest/70">
                    {DECISION_LABEL[r.decision_type] ?? r.decision_type}
                  </td>
                  <td className="px-4 py-2.5 text-forest/70">{r.campaign_name ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {r.assigned_church ? (
                      <span className="text-leaf">{r.assigned_church}</span>
                    ) : (
                      <span className="text-orange">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-forest/50">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-[14px] text-forest/70">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="disabled:opacity-30"
          >
            ← Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
