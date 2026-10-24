import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  History,
  Copy,
  Check,
  Key,
  Users,
} from "lucide-react";

import Loader from "../../../utils/Loader";
import {
  getAllLicenses,
  createLicense,
  renewLicense,
  suspendLicense,
  reactivateLicense,
  revokeLicense,
} from "../../../api/SuperAdmin/licenseApi";

const PLAN_BADGES = {
  STARTER: "bg-blue-50 text-blue-700 border-blue-200",
  STANDARD: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PREMIUM: "bg-purple-50 text-purple-700 border-purple-200",
  ENTERPRISE: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
};

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  GRACE_PERIOD: {
    label: "Grace Period",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  SUSPENDED: {
    label: "Suspended",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  REVOKED: {
    label: "Revoked",
    color: "bg-red-100 text-red-900 border-red-300",
    dot: "bg-red-700",
  },
  TRIAL: {
    label: "Trial",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
};

const ALL_FEATURES = [
  { id: "core_lms", label: "Core LMS & Auth" },
  { id: "attendance", label: "Attendance Tracking" },
  { id: "quizzes", label: "Quizzes & Tests" },
  { id: "assignments", label: "Assignments & Submissions" },
  { id: "timetable", label: "Timetable Scheduling" },
  { id: "fees", label: "Fee Management" },
  { id: "bulk_upload", label: "CSV Bulk Onboarding" },
  { id: "certificates", label: "Certificates Generation" },
  { id: "ai_bot", label: "Gemini AI Tutor" },
  { id: "custom_branding", label: "White-Label Branding" },
];

const LicenseManagement = () => {
  const [licenses, setLicenses] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, gracePeriod: 0, expired: 0, suspended: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedKey, setCopiedKey] = useState(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const [selectedLicense, setSelectedLicense] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    tenantId: "",
    schoolName: "",
    plan: "STANDARD",
    durationDays: 365,
    gracePeriodDays: 7,
    maxUsers: 500,
    authorizedDomains: "",
    entitlements: ["core_lms", "attendance", "quizzes", "assignments", "timetable"],
  });

  const [renewForm, setRenewForm] = useState({
    months: 12,
    invoiceRef: "",
    paymentMethod: "BANK_TRANSFER",
    notes: "",
  });

  const [suspendReason, setSuspendReason] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await getAllLicenses({
        tenantId: searchQuery || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });

      if (res && res.data) {
        setLicenses(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load licenses:", err);
      toast.error(err.response?.data?.message || "Failed to load licenses from Authority.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, [statusFilter]);

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("License key copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...createForm,
        authorizedDomains: createForm.authorizedDomains
          ? createForm.authorizedDomains.split(",").map((d) => d.trim()).filter(Boolean)
          : [],
      };
      await createLicense(payload);
      toast.success("License created successfully!");
      setIsCreateOpen(false);
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create license.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLicense) return;
    setActionLoading(true);
    try {
      await renewLicense(selectedLicense.id, renewForm);
      toast.success(`Subscription renewed for ${selectedLicense.schoolName}!`);
      setIsRenewOpen(false);
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Renewal failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLicense) return;
    setActionLoading(true);
    try {
      await suspendLicense(selectedLicense.id, suspendReason || "Administrative hold");
      toast.success("License suspended.");
      setIsSuspendOpen(false);
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Suspension failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateClick = async (lic) => {
    if (!window.confirm(`Reactivate license for ${lic.schoolName}?`)) return;
    try {
      await reactivateLicense(lic.id);
      toast.success("License reactivated.");
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reactivation failed.");
    }
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLicense || !revokeReason.trim()) {
      toast.error("A mandatory revocation reason is required.");
      return;
    }
    setActionLoading(true);
    try {
      await revokeLicense(selectedLicense.id, revokeReason.trim());
      toast.success("License permanently revoked.");
      setIsRevokeOpen(false);
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Revocation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLicenses = licenses.filter((l) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      l.schoolName?.toLowerCase().includes(query) ||
      l.tenantId?.toLowerCase().includes(query) ||
      l.licenseKey?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC] p-4 lg:p-8 ml-0 lg:ml-64">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">License & SaaS Management</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0B1053]/10 text-[#0B1053]">
              <ShieldCheck className="w-3.5 h-3.5" /> Ed25519 Secured
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage school subscription plans, cryptographic entitlements, and tenant activations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLicenses}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0B1053]" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0B1053] hover:bg-[#0B1053]/90 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Issue New License
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total || licenses.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Grace Period</p>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.gracePeriod}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Suspended / Expired</p>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-1">{(stats.expired || 0) + (stats.suspended || 0)}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search school, tenant ID, or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]/20 focus:border-[#0B1053]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["ALL", "ACTIVE", "GRACE_PERIOD", "EXPIRED", "SUSPENDED", "REVOKED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#0B1053] text-white border-[#0B1053]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {st === "ALL" ? "All Statuses" : STATUS_CONFIG[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Key className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">No licenses found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              No tenant subscriptions match your query. Click "Issue New License" to onboard a school.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">School / Tenant</th>
                  <th className="px-5 py-3.5">License Key</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Expiration & Grace</th>
                  <th className="px-5 py-3.5">Users & Features</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredLicenses.map((lic) => {
                  const statusInfo = STATUS_CONFIG[lic.dynamicStatus] || STATUS_CONFIG.ACTIVE;
                  const isExp = new Date(lic.expiresAt) < new Date();
                  const daysLeft = Math.ceil((new Date(lic.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={lic.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{lic.schoolName}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {lic.tenantId}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded w-fit text-gray-700">
                          <span>{lic.licenseKey}</span>
                          <button
                            onClick={() => handleCopyKey(lic.licenseKey)}
                            title="Copy License Key"
                            className="text-gray-400 hover:text-gray-700"
                          >
                            {copiedKey === lic.licenseKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            PLAN_BADGES[lic.plan] || "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {lic.plan}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-xs text-gray-900 font-medium">
                          {new Date(lic.expiresAt).toLocaleDateString()}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 ${
                            isExp ? "text-rose-600 font-semibold" : daysLeft <= 15 ? "text-amber-600 font-medium" : "text-gray-500"
                          }`}
                        >
                          {isExp ? "Expired" : `${daysLeft} days remaining`}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-xs text-gray-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-gray-400" /> Max {lic.maxUsers} users
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {lic.entitlements?.length || 0} features active
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedLicense(lic);
                              setIsRenewOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                          >
                            Renew
                          </button>

                          {lic.status === "SUSPENDED" ? (
                            <button
                              onClick={() => handleReactivateClick(lic)}
                              className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                            >
                              Reactivate
                            </button>
                          ) : lic.status !== "REVOKED" ? (
                            <button
                              onClick={() => {
                                setSelectedLicense(lic);
                                setSuspendReason("");
                                setIsSuspendOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                            >
                              Suspend
                            </button>
                          ) : null}

                          {lic.status !== "REVOKED" && (
                            <button
                              onClick={() => {
                                setSelectedLicense(lic);
                                setRevokeReason("");
                                setIsRevokeOpen(true);
                              }}
                              className="px-2 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                            >
                              Revoke
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedLicense(lic);
                              setIsAuditOpen(true);
                            }}
                            title="Audit Trail"
                            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE LICENSE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Issue New Tenant License</h2>
            <p className="text-xs text-gray-500 mb-5">
              Generates an asymmetric Ed25519-signed software entitlement key for a school.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    School / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oxford Cambridge Academy"
                    value={createForm.schoolName}
                    onChange={(e) => setCreateForm({ ...createForm, schoolName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Tenant ID (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. oxford_camb_101"
                    value={createForm.tenantId}
                    onChange={(e) => setCreateForm({ ...createForm, tenantId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Plan
                  </label>
                  <select
                    value={createForm.plan}
                    onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.durationDays}
                    onChange={(e) => setCreateForm({ ...createForm, durationDays: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.gracePeriodDays}
                    onChange={(e) => setCreateForm({ ...createForm, gracePeriodDays: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Maximum Permitted Users
                </label>
                <input
                  type="number"
                  min="10"
                  value={createForm.maxUsers}
                  onChange={(e) => setCreateForm({ ...createForm, maxUsers: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Enabled Feature Entitlements
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {ALL_FEATURES.map((feat) => {
                    const checked = createForm.entitlements.includes(feat.id);
                    return (
                      <label key={feat.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateForm({
                                ...createForm,
                                entitlements: [...createForm.entitlements, feat.id],
                              });
                            } else {
                              setCreateForm({
                                ...createForm,
                                entitlements: createForm.entitlements.filter((id) => id !== feat.id),
                              });
                            }
                          }}
                          className="rounded text-[#0B1053] focus:ring-[#0B1053]"
                        />
                        {feat.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0B1053] hover:bg-[#0B1053]/90 rounded-lg shadow-sm"
                >
                  {actionLoading ? "Issuing..." : "Confirm & Issue License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENEW SUBSCRIPTION MODAL */}
      {isRenewOpen && selectedLicense && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Renew Subscription</h2>
            <p className="text-xs text-gray-500 mb-4">
              Extend license duration for <b>{selectedLicense.schoolName}</b> ({selectedLicense.tenantId}).
            </p>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Months to Add
                </label>
                <select
                  value={renewForm.months}
                  onChange={(e) => setRenewForm({ ...renewForm, months: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months (Quarterly)</option>
                  <option value="6">6 Months (Semi-Annual)</option>
                  <option value="12">12 Months (Annual)</option>
                  <option value="24">24 Months (2 Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Invoice / Payment Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-1049"
                  value={renewForm.invoiceRef}
                  onChange={(e) => setRenewForm({ ...renewForm, invoiceRef: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Renewal Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Paid via wire transfer on Oct 23"
                  value={renewForm.notes}
                  onChange={(e) => setRenewForm({ ...renewForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1053]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsRenewOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {actionLoading ? "Processing..." : "Confirm Renewal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPEND MODAL */}
      {isSuspendOpen && selectedLicense && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Suspend License</h2>
            <p className="text-xs text-gray-500 mb-4">
              Place an administrative hold on <b>{selectedLicense.schoolName}</b>.
            </p>

            <form onSubmit={handleSuspendSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Suspension Reason *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Unresolved billing dispute, investigation into terms violation..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsSuspendOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  {actionLoading ? "Suspending..." : "Confirm Suspension"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOKE MODAL */}
      {isRevokeOpen && selectedLicense && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border-t-4 border-rose-600">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-xl font-bold text-gray-900">Revoke License Permanently</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Warning: Revocation is a permanent state. <b>{selectedLicense.schoolName}</b> will be permanently terminated from software entitlement.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Mandatory Legal / Justification Reason *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Contract terminated, mutual settlement reached on date..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsRevokeOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  {actionLoading ? "Revoking..." : "Revoke License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT HISTORY MODAL */}
      {isAuditOpen && selectedLicense && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">License Audit & Renewal History</h2>
                <p className="text-xs text-gray-500">
                  {selectedLicense.schoolName} ({selectedLicense.tenantId})
                </p>
              </div>
              <button
                onClick={() => setIsAuditOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {/* Renewal history */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Renewal Events</h3>
              {selectedLicense.renewalHistory && selectedLicense.renewalHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedLicense.renewalHistory.map((ren) => (
                    <div key={ren.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                      <div className="flex items-center justify-between font-semibold text-gray-800">
                        <span>Extended by {ren.monthsAdded} Month(s)</span>
                        <span className="text-gray-500 font-normal">{new Date(ren.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-gray-600 mt-1">Ref: {ren.invoiceRef} | By: {ren.renewedBy}</div>
                      {ren.notes && <div className="text-gray-500 italic mt-0.5">{ren.notes}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No renewals recorded yet.</p>
              )}
            </div>

            {/* Audit Logs */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Audit Log</h3>
              {selectedLicense.auditHistory && selectedLicense.auditHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedLicense.auditHistory.map((aud) => (
                    <div key={aud.id} className="p-2.5 bg-gray-50 rounded border border-gray-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{aud.action}</span>
                        <span className="text-gray-400 text-[11px]">{new Date(aud.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-gray-600 mt-0.5">Actor: {aud.actor}</div>
                      {aud.reason && <div className="text-gray-500 italic mt-0.5">Reason: {aud.reason}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No audit records available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManagement;
