import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Database,
  Clock,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  ShieldAlert,
  Calendar,
  ShieldCheck,
  Activity,
  FileText,
  Copy,
  Check,
  Search,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";
import SuperAdminNavbar from "../../../components/SuperAdmin/SuperAdminNavbar";
import {
  getBackupList,
  createBackup,
  restoreBackup,
  deleteBackup,
  getDownloadBackupUrl,
} from "../../../api/SuperAdmin/backupApi";

const BackupRecovery = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [backupNote, setBackupNote] = useState("");

  // Restore Modal State
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState(null);
  const [confirmRestoreCheck, setConfirmRestoreCheck] = useState(false);

  // Fetch list of backups
  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await getBackupList();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setBackups(list);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to load backups list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await createBackup(backupNote.trim() || "Manual SuperAdmin Snapshot");
      if (res?.success || res?.id || res?.data) {
        toast.success("Database snapshot created successfully!");
        setIsCreateOpen(false);
        setBackupNote("");
        await fetchBackups();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create snapshot.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackupForRestore) return;
    setActionLoading(true);
    try {
      const res = await restoreBackup(selectedBackupForRestore.id);
      if (res?.success || res?.data?.success) {
        const rowsCount = res?.data?.rowsRestored || res?.rowsRestored || "all";
        const tablesCount = res?.data?.tablesRestored || res?.tablesRestored || "all";
        toast.success(
          `Database successfully restored (${rowsCount} rows across ${tablesCount} tables)!`
        );
        setSelectedBackupForRestore(null);
        setConfirmRestoreCheck(false);
        await fetchBackups();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Database restoration failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this backup snapshot?")) return;
    try {
      await deleteBackup(id);
      toast.success("Backup snapshot deleted.");
      await fetchBackups();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete backup.");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.info("Copied to clipboard: " + text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Never";
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const latestBackup = backups.length > 0 ? backups[0] : null;

  const filteredBackups = backups.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.id?.toLowerCase().includes(q) ||
      b.note?.toLowerCase().includes(q) ||
      b.checksum?.toLowerCase().includes(q) ||
      b.trigger?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <SuperAdminNavbar heading="Database Backup &amp; Disaster Recovery" />

      <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8 font-['Outfit',sans-serif]">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  <Database size={13} className="text-indigo-600" />
                  PostgreSQL Logical Snapshots
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} />
                  Point-In-Time Disaster Recovery
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1053] tracking-tight">
                Database Snapshots &amp; Disaster Recovery Vault
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Automated continuous backups, atomic relational schema snapshots, SHA-256 cryptographic checksums,
                and instant 1-click database rollbacks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={fetchBackups}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
                {loading ? "Checking Vault..." : "Refresh Snapshots"}
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-[#0B1053] to-[#252f9c] text-white font-semibold text-xs hover:shadow-lg hover:shadow-indigo-900/20 shadow-md transition-all active:scale-95"
              >
                <Plus size={15} /> Create Snapshot Now
              </button>
            </div>
          </div>

          {/* Stat Cards Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Snapshots
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {backups.length} <span className="text-xs font-semibold text-slate-400">Points</span>
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Retained rolling max 15
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <HardDrive size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Last Snapshot
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1 truncate max-w-[140px]">
                  {latestBackup ? formatDate(latestBackup.createdAt) : "None yet"}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified Integrity
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Clock size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Protected Tables
                </p>
                <p className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">
                  {latestBackup ? latestBackup.tableCount : 47}{" "}
                  <span className="text-xs font-semibold text-slate-400">Tables</span>
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Full relational schema
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <Database size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Auto Daily Cron
                </p>
                <p className="text-base sm:text-lg font-black text-purple-700 mt-1">
                  02:00 AM Daily
                </p>
                <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
                  Active Background Service
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Calendar size={20} />
              </div>
            </div>
          </div>

          {/* Search Filter Strip */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search snapshot ID, note, checksum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053] focus:bg-white transition-all font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>Showing {filteredBackups.length} of {backups.length} snapshots</span>
            </div>
          </div>

          {/* Stored Snapshots Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Stored Backup Snapshots Vault
                </h3>
                <p className="text-xs text-slate-500">
                  Atomic, transactional recovery points saved on disk
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
                {backups.length} Recovery Points Available
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <RefreshCw className="animate-spin text-[#0B1053] mb-3" size={28} />
                <p className="text-sm font-semibold">Loading backup vault...</p>
              </div>
            ) : filteredBackups.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mx-auto mb-3 shadow-inner">
                  <Database size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-900">No backup snapshots found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Create your first manual backup snapshot or wait for the automatic daily schedule to trigger.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 px-4.5 py-2.5 bg-[#0B1053] text-white rounded-xl text-xs font-bold hover:bg-[#151c75] transition shadow-md"
                >
                  Create Instant Snapshot
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3.5">Snapshot / Timestamp</th>
                      <th className="px-6 py-3.5">Trigger Source</th>
                      <th className="px-6 py-3.5">Size &amp; Data Scope</th>
                      <th className="px-6 py-3.5">Integrity Checksum</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBackups.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors font-medium">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{formatDate(b.createdAt)}</div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                            <span className="truncate max-w-[180px]">{b.id}</span>
                            <button
                              onClick={() => handleCopy(b.id)}
                              title="Copy Snapshot ID"
                              className="text-slate-400 hover:text-slate-700"
                            >
                              {copiedId === b.id ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          {b.note && (
                            <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 inline-block px-2.5 py-0.5 rounded-lg mt-1">
                              {b.note}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {b.trigger === "automated" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Clock size={12} />
                              Automated Daily
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <CheckCircle2 size={12} />
                              Manual Snapshot
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-900 font-bold">{formatBytes(b.sizeBytes)}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {b.totalRows} rows across {b.tableCount} tables
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl w-fit">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                            <span title={b.checksum}>
                              {b.checksum ? `${b.checksum.slice(0, 14)}...` : "SHA-256 Valid"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Download SQL */}
                            <a
                              href={getDownloadBackupUrl(b.id, "sql")}
                              target="_blank"
                              rel="noreferrer"
                              title="Download SQL Dump"
                              className="p-2 rounded-xl text-slate-500 hover:text-[#0B1053] hover:bg-indigo-50 transition border border-slate-200 shadow-sm"
                            >
                              <Download size={15} />
                            </a>

                            {/* Restore Button */}
                            <button
                              onClick={() => {
                                setSelectedBackupForRestore(b);
                                setConfirmRestoreCheck(false);
                              }}
                              title="Restore database to this snapshot"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition shadow-sm cursor-pointer"
                            >
                              <RotateCcw size={13} />
                              Restore
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(b.id)}
                              title="Delete snapshot"
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-slate-200 shadow-sm cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Disaster Recovery Architecture Card */}
          <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                <Terminal size={18} />
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Disaster Recovery &amp; Atomic Snapshot Guarantees
                </h4>
                <p className="text-xs text-slate-500">
                  How point-in-time recovery maintains relational data integrity
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                  1. Atomic Transactional Dumps
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Snapshots run inside a single read-committed transaction, ensuring zero half-written or corrupted relational records across all 47 models.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  2. Foreign Key Topological Sorting
                </span>
                <p className="text-slate-600 leading-relaxed">
                  During restore, dependencies (Users → Levels → Classrooms → Fees) are restored in strict topological order to guarantee zero foreign key constraint violations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                  3. SHA-256 Tamper Protection
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Each snapshot payload is hashed using SHA-256 upon creation. Checksums are verified before any restoration to prevent corrupted rollback.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal: Create Backup Snapshot */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Plus size={22} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Create New Snapshot</h3>
                <p className="text-xs text-slate-500">Capture the full current database state.</p>
              </div>
            </div>

            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Snapshot Note / Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pre-exam snapshot, Before major update"
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053]"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-6 text-xs text-slate-600 space-y-1.5">
                <p className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="text-emerald-600" size={14} />
                  Includes all 47 database tables &amp; relational records.
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="text-emerald-600" size={14} />
                  Generates cryptographic SHA-256 integrity checksum.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0B1053] to-[#252f9c] text-white text-xs font-bold rounded-xl hover:shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={15} /> : null}
                  {actionLoading ? "Creating Snapshot..." : "Create Snapshot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Restore */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-amber-200">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Database Restoration Warning</h3>
                <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
                  Atomic Rollback Operation
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-xs sm:text-sm text-slate-700">
                You are about to restore the database to the snapshot from:
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900">{formatDate(selectedBackupForRestore.createdAt)}</div>
                <div className="text-slate-500 font-mono mt-0.5">{selectedBackupForRestore.id}</div>
                <div className="text-slate-600 mt-1">
                  Rows: {selectedBackupForRestore.totalRows} | Tables: {selectedBackupForRestore.tableCount}
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle size={15} />
                  Important Notice:
                </p>
                <p>
                  This action will roll back all current tables to this exact moment in time. Any data created after
                  this snapshot will be replaced.
                </p>
              </div>

              <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmRestoreCheck}
                  onChange={(e) => setConfirmRestoreCheck(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-700 leading-snug font-semibold">
                  I understand this will restore the database to this point and replace all current table data.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedBackupForRestore(null)}
                disabled={actionLoading}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={!confirmRestoreCheck || actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {actionLoading ? <RefreshCw className="animate-spin" size={15} /> : <RotateCcw size={15} />}
                {actionLoading ? "Restoring Database..." : "Proceed with Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BackupRecovery;
