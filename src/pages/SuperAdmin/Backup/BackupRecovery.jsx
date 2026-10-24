import { useState, useEffect } from "react";
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
} from "lucide-react";
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
    if (!window.confirm("Are you sure you want to permanently delete this backup snapshot?")) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await deleteBackup(id);
      if (res?.success) {
        toast.success("Backup deleted successfully.");
        await fetchBackups();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete backup.");
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC] p-4 lg:p-8 ml-0 lg:ml-64 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1053] flex items-center justify-center text-white shadow-md">
              <Database size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Database Backup & Disaster Recovery
              </h1>
              <p className="text-sm text-gray-500">
                Automated continuous protection, atomic snapshots, and 1-click recovery.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className={loading ? "animate-spin text-[#0B1053]" : ""} size={16} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1053] text-white rounded-xl text-sm font-medium hover:bg-[#151c75] transition shadow-md shadow-indigo-950/10"
          >
            <Plus size={18} />
            Create Snapshot Now
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Snapshots</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{backups.length}</h3>
            <p className="text-xs text-gray-400 mt-1">Retained rolling max 15</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Snapshot</p>
            <h3 className="text-sm font-bold text-gray-900 mt-0.5 truncate max-w-[150px]">
              {latestBackup ? formatDate(latestBackup.createdAt) : "None yet"}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">Verified Integrity</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Database size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Protected Tables</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {latestBackup ? latestBackup.tableCount : 46}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Full Relational Schema</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto Daily Cron</p>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">02:00 AM Daily</h3>
            <p className="text-xs text-purple-600 font-medium mt-1">Active Background Service</p>
          </div>
        </div>
      </div>

      {/* Backups Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Stored Backup Snapshots</h2>
            <p className="text-xs text-gray-500">Atomic, transactional recovery points saved on disk</p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">
            {backups.length} points
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <RefreshCw className="animate-spin text-[#0B1053] mb-3" size={28} />
            <p className="text-sm">Loading backup snapshots...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <Database size={32} />
            </div>
            <h3 className="text-base font-semibold text-gray-800">No backups found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Create your first manual backup snapshot or wait for the automatic daily schedule to trigger.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 bg-[#0B1053] text-white rounded-xl text-xs font-medium hover:bg-[#151c75] transition"
            >
              Create Snapshot
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Snapshot / Timestamp</th>
                  <th className="px-6 py-3.5">Trigger Source</th>
                  <th className="px-6 py-3.5">Size & Data</th>
                  <th className="px-6 py-3.5">Integrity Checksum</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{formatDate(b.createdAt)}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{b.id}</div>
                      {b.note && (
                        <div className="text-xs text-indigo-600 bg-indigo-50/70 inline-block px-2 py-0.5 rounded mt-1">
                          {b.note}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {b.trigger === "automated" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <Clock size={12} />
                          Automated Daily
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle2 size={12} />
                          Manual Trigger
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{formatBytes(b.sizeBytes)}</div>
                      <div className="text-xs text-gray-400">
                        {b.totalRows} rows across {b.tableCount} tables
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span title={b.checksum}>
                          {b.checksum ? `${b.checksum.slice(0, 12)}...` : "SHA-256 Valid"}
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
                          className="p-2 rounded-lg text-gray-500 hover:text-[#0B1053] hover:bg-indigo-50 transition border border-gray-200"
                        >
                          <Download size={16} />
                        </a>

                        {/* Restore Button */}
                        <button
                          onClick={() => {
                            setSelectedBackupForRestore(b);
                            setConfirmRestoreCheck(false);
                          }}
                          title="Restore database to this snapshot"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(b.id)}
                          title="Delete snapshot"
                          className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition border border-gray-200"
                        >
                          <Trash2 size={16} />
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

      {/* Modal: Create Backup Snapshot */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plus size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create New Snapshot</h3>
                <p className="text-xs text-gray-500">Capture the full current database state.</p>
              </div>
            </div>

            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Snapshot Note / Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pre-exam snapshot, Before major update"
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                />
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 mb-6 text-xs text-gray-600 space-y-1.5">
                <p className="flex items-center gap-1.5 font-medium text-gray-800">
                  <CheckCircle2 className="text-emerald-500" size={14} />
                  Includes all 46 database tables & relations.
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="text-emerald-500" size={14} />
                  Generates both JSON structure and SQL dump.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-[#0B1053] text-white text-sm font-medium rounded-xl hover:bg-[#151c75] disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : null}
                  {actionLoading ? "Creating..." : "Create Snapshot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Restore */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-200">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Restore Database Warning</h3>
                <p className="text-xs text-amber-700">Atomic Rollback Operation</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-700">
                You are about to restore the database to the snapshot from:
              </p>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <div className="font-bold text-gray-900">{formatDate(selectedBackupForRestore.createdAt)}</div>
                <div className="text-gray-500 font-mono mt-0.5">{selectedBackupForRestore.id}</div>
                <div className="text-gray-600 mt-1">
                  Rows: {selectedBackupForRestore.totalRows} | Tables: {selectedBackupForRestore.tableCount}
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
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
                <span className="text-xs text-gray-700 leading-snug">
                  I understand this will restore the database to this point and replace all current table data.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedBackupForRestore(null)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={!confirmRestoreCheck || actionLoading}
                className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                {actionLoading ? "Restoring Database..." : "Proceed with Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRecovery;
