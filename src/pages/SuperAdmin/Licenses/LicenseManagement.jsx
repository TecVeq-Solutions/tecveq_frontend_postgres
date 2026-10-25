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
  Lock,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Activity,
  FileText,
} from "lucide-react";
import SuperAdminNavbar from "../../../components/SuperAdmin/SuperAdminNavbar";
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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    gracePeriod: 0,
    expired: 0,
    suspended: 0,
    revoked: 0,
  });
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
    <>
      <SuperAdminNavbar heading="License Authority & Cryptographic SaaS" />

      <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8 font-['Outfit',sans-serif]">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  <ShieldCheck size={13} className="text-indigo-600" />
                  Ed25519 Asymmetric Signatures
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Activity size={12} className="animate-pulse" />
                  Authority Live on Port 5050
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1053] tracking-tight">
                Cryptographic License &amp; SaaS Governance
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Issue tamper-proof software licenses, control feature flags, manage subscription renewals,
                and enforce user quota caps across tenant organizations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={fetchLicenses}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
                {loading ? "Checking Authority..." : "Refresh Status"}
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-[#0B1053] to-[#252f9c] text-white font-semibold text-xs hover:shadow-lg hover:shadow-indigo-900/20 shadow-md transition-all active:scale-95"
              >
                <Plus size={15} /> Issue New License
              </button>
            </div>
          </div>

          {/* Metric Cards Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Subscriptions
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {stats.total || licenses.length}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Across registered tenants
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <Key size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active &amp; Valid
                </p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                  {stats.active}
                </p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  Full operational access
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Grace Period
                </p>
                <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                  {stats.gracePeriod}
                </p>
                <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                  Pending renewal payment
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Suspended / Expired
                </p>
                <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
                  {(stats.expired || 0) + (stats.suspended || 0)}
                </p>
                <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                  Restricted software access
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <XCircle size={20} />
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search school name, tenant ID, key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053] focus:bg-white transition-all font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {["ALL", "ACTIVE", "GRACE_PERIOD", "EXPIRED", "SUSPENDED", "REVOKED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#0B1053] text-white border-[#0B1053] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {st === "ALL" ? "All Statuses" : STATUS_CONFIG[st]?.label || st}
                </button>
              ))}
            </div>
          </div>

          {/* Licenses Table / List Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader />
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mx-auto mb-3">
                  <Key size={26} />
                </div>
                <h3 className="text-base font-bold text-slate-900">No licenses found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No tenant subscriptions match your current filter. Click "Issue New License" to onboard a school.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3.5">School / Tenant</th>
                      <th className="px-5 py-3.5">Cryptographic Key</th>
                      <th className="px-5 py-3.5">Plan Tier</th>
                      <th className="px-5 py-3.5">License Status</th>
                      <th className="px-5 py-3.5">Expiration &amp; Grace</th>
                      <th className="px-5 py-3.5">Users &amp; Features</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {filteredLicenses.map((lic) => {
                      const statusInfo = STATUS_CONFIG[lic.dynamicStatus] || STATUS_CONFIG.ACTIVE;
                      const isExp = new Date(lic.expiresAt) < new Date();
                      const daysLeft = Math.ceil(
                        (new Date(lic.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <tr key={lic.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{lic.schoolName}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              Tenant: <span className="text-slate-600 font-semibold">{lic.tenantId}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 w-fit">
                              <span className="truncate max-w-[140px]">{lic.licenseKey}</span>
                              <button
                                onClick={() => handleCopyKey(lic.licenseKey)}
                                title="Copy License Key"
                                className="text-slate-400 hover:text-slate-700 p-0.5"
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
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                PLAN_BADGES[lic.plan] || "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {lic.plan}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                              {statusInfo.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-xs text-slate-900 font-bold">
                              {new Date(lic.expiresAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div
                              className={`text-[11px] mt-0.5 font-semibold ${
                                isExp
                                  ? "text-rose-600"
                                  : daysLeft <= 15
                                  ? "text-amber-600"
                                  : "text-slate-400 font-normal"
                              }`}
                            >
                              {isExp ? "Subscription Expired" : `${daysLeft} days remaining`}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-xs text-slate-800 flex items-center gap-1.5 font-bold">
                              <Users className="w-3.5 h-3.5 text-indigo-500" /> Max {lic.maxUsers} users
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
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
                                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                              >
                                Renew
                              </button>

                              {lic.status === "SUSPENDED" ? (
                                <button
                                  onClick={() => handleReactivateClick(lic)}
                                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
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
                                  className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer"
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
                                  className="px-2 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
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
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
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
        </div>
      </div>

      {/* CREATE LICENSE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
                <Plus size={20} />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Issue New Tenant License</h2>
                <p className="text-xs text-slate-500">
                  Generates an asymmetric Ed25519-signed software entitlement token.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    School / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oxford Cambridge Academy"
                    value={createForm.schoolName}
                    onChange={(e) => setCreateForm({ ...createForm, schoolName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tenant ID (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. oxford_camb_101"
                    value={createForm.tenantId}
                    onChange={(e) => setCreateForm({ ...createForm, tenantId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Plan
                  </label>
                  <select
                    value={createForm.plan}
                    onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053]"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.durationDays}
                    onChange={(e) => setCreateForm({ ...createForm, durationDays: parseInt(e.target.value) || 365 })}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Max Users
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={createForm.maxUsers}
                    onChange={(e) => setCreateForm({ ...createForm, maxUsers: parseInt(e.target.value) || 500 })}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Authorized Domain Origins (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. oxford.tecveq.com, lms.oxford.edu.pk"
                  value={createForm.authorizedDomains}
                  onChange={(e) => setCreateForm({ ...createForm, authorizedDomains: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-[#0B1053]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Entitled Features ({createForm.entitlements.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {ALL_FEATURES.map((feat) => {
                    const checked = createForm.entitlements.includes(feat.id);
                    return (
                      <label key={feat.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
                          className="rounded text-indigo-900 focus:ring-0"
                        />
                        {feat.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#0B1053] to-[#252f9c] hover:shadow-lg rounded-xl shadow-md transition"
                >
                  {actionLoading ? "Generating Cryptographic Token..." : "Issue & Sign License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENEW MODAL */}
      {isRenewOpen && selectedLicense && (
        <div className="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Renew Subscription</h2>
            <p className="text-xs text-slate-500 mb-4">
              Extend license validity for <b>{selectedLicense.schoolName}</b>.
            </p>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Extension Duration
                </label>
                <select
                  value={renewForm.months}
                  onChange={(e) => setRenewForm({ ...renewForm, months: parseInt(e.target.value) || 12 })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value={1}>1 Month Extension</option>
                  <option value={3}>3 Months Extension</option>
                  <option value={6}>6 Months Extension</option>
                  <option value={12}>1 Year Extension (12 Months)</option>
                  <option value={24}>2 Years Extension (24 Months)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Invoice / Payment Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-089"
                  value={renewForm.invoiceRef}
                  onChange={(e) => setRenewForm({ ...renewForm, invoiceRef: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Renewal Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Annual renewal approved via bank transfer"
                  value={renewForm.notes}
                  onChange={(e) => setRenewForm({ ...renewForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRenewOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
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
        <div className="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Suspend License</h2>
            <p className="text-xs text-slate-500 mb-4">
              Place an administrative hold on <b>{selectedLicense.schoolName}</b>.
            </p>

            <form onSubmit={handleSuspendSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Suspension Reason *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Unresolved billing dispute, investigation into terms violation..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSuspendOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md"
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
        <div className="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border-t-4 border-rose-600">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-xl font-extrabold text-slate-900">Revoke License Permanently</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Warning: Revocation is a permanent state. <b>{selectedLicense.schoolName}</b> software entitlement will be terminated.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Mandatory Legal / Justification Reason *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Contract terminated, mutual settlement reached on date..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRevokeOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
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
        <div className="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-7 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">License Audit &amp; Renewal History</h2>
                <p className="text-xs text-slate-500">
                  {selectedLicense.schoolName} ({selectedLicense.tenantId})
                </p>
              </div>
              <button
                onClick={() => setIsAuditOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Renewal history */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Renewal Events</h3>
              {selectedLicense.renewalHistory && selectedLicense.renewalHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedLicense.renewalHistory.map((ren) => (
                    <div key={ren.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Extended by {ren.monthsAdded} Month(s)</span>
                        <span className="text-slate-400 font-normal">{new Date(ren.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-600 mt-1">Ref: {ren.invoiceRef} | By: {ren.renewedBy}</div>
                      {ren.notes && <div className="text-slate-500 italic mt-0.5">{ren.notes}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No renewals recorded yet.</p>
              )}
            </div>

            {/* Audit Logs */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audit Log</h3>
              {selectedLicense.auditHistory && selectedLicense.auditHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedLicense.auditHistory.map((aud) => (
                    <div key={aud.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{aud.action}</span>
                        <span className="text-slate-400 text-[11px]">{new Date(aud.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-slate-600 mt-0.5">Actor: {aud.actor}</div>
                      {aud.reason && <div className="text-slate-500 italic mt-0.5">Reason: {aud.reason}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No audit records available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LicenseManagement;
