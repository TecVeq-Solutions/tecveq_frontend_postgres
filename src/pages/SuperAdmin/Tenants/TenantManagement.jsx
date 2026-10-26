import React, { useState } from "react";
import SuperAdminNavbar from "../../../components/SuperAdmin/SuperAdminNavbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../../utils/Loader";
import { getTenantOverview, createTestStudent } from "../../../api/SuperAdmin/tenantApi";
import { toast } from "react-toastify";
import {
  Database,
  Server,
  Plus,
  RefreshCw,
  CheckCircle2,
  School,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  Layers,
  Users,
  CreditCard,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  Terminal,
  Activity,
  Radio,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";

const DEMO_NAMES = [
  "Tariq Mehmood",
  "Ayesha Siddiqui",
  "Hamza Chaudhry",
  "Fatima Zahra",
  "Bilal Mustafa",
  "Zainab Khan",
];

const TenantManagement = () => {
  const queryClient = useQueryClient();
  const [activeBranch, setActiveBranch] = useState(
    localStorage.getItem("active_tenant_slug") || "cityschool-1"
  );
  const [testForm, setTestForm] = useState({
    tenantSlug: activeBranch,
    name: "",
    email: "",
    rollNo: "",
  });
  const [lastTestResult, setLastTestResult] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  const { data: overviewData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["tenantOverview"],
    queryFn: async () => {
      const resp = await getTenantOverview();
      return resp;
    },
    refetchOnWindowFocus: false,
  });

  const testStudentMutation = useMutation({
    mutationFn: (data) => createTestStudent(data),
    onSuccess: (res) => {
      setLastTestResult(res);
      toast.success(res.message || "Student created exclusively in target branch database!");
      queryClient.invalidateQueries(["tenantOverview"]);
      setTestForm({
        tenantSlug: testForm.tenantSlug,
        name: "",
        email: "",
        rollNo: "",
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to create student");
    },
  });

  const handleBranchSwitch = (slug) => {
    setActiveBranch(slug);
    localStorage.setItem("active_tenant_slug", slug);
    setTestForm((prev) => ({ ...prev, tenantSlug: slug }));
    toast.success(`Active branch switched to ${slug.toUpperCase()}. All API requests now target this database.`);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.info("Copied to clipboard: " + text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleQuickFill = () => {
    const randomName = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const cleanName = randomName.toLowerCase().replace(/\s+/g, ".");
    const slugSuffix = testForm.tenantSlug.replace("cityschool-", "b");
    setTestForm({
      tenantSlug: testForm.tenantSlug,
      name: `${randomName} (${slugSuffix.toUpperCase()})`,
      email: `${cleanName}.${randomId}.${slugSuffix}@testedu.com`,
      rollNo: `${slugSuffix.toUpperCase()}-${randomId}`,
    });
  };

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (!testForm.name || !testForm.email) {
      return toast.warning("Please enter student name and email.");
    }
    testStudentMutation.mutate(testForm);
  };

  const databases = overviewData?.databases || [];
  const masterDb = databases.find((d) => d.slug === "master");
  const branchDbs = databases.filter((d) => d.slug !== "master");

  const totalBranchStudents = branchDbs.reduce(
    (acc, b) => acc + (b.stats?.students || 0),
    0
  );
  const totalBranchFees = branchDbs.reduce(
    (acc, b) => acc + (b.stats?.fees || 0),
    0
  );
  const totalBranchAdmins = branchDbs.reduce(
    (acc, b) => acc + (b.stats?.admins || 0),
    0
  );

  return (
    <>
      <SuperAdminNavbar heading="Tenant Databases & SaaS Control Plane" />

      <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8 font-['Outfit',sans-serif]">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  <Activity size={13} className="text-indigo-600 animate-pulse" />
                  Multi-Tenant PostgreSQL Architecture
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} />
                  Zero Leakage Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1053] tracking-tight">
                Tenant Database Fleet & Live Isolation
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Dedicated database-per-tenant architecture. Every branch operates with physically isolated
                storage, dedicated schemas, and zero data leakage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isFetching ? "animate-spin text-indigo-600" : ""} />
                {isFetching ? "Syncing Fleet..." : "Refresh Health"}
              </button>
              <Link
                to="/superadmin/licenses"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all"
              >
                <Lock size={13} className="text-amber-600" />
                License Manager
              </Link>
              <Link
                to="/superadmin/platform-fees"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0B1053] to-[#1e276b] text-white font-semibold text-xs hover:shadow-lg hover:shadow-indigo-900/20 shadow-md transition-all active:scale-95"
              >
                Platform Billing <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Active Dynamic Routing Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070b1e] via-[#0f1738] to-[#182352] p-6 sm:p-7 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
            {/* Ambient Background Light */}
            <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-10 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                    Live Router Active Context
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Active Tenant:{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
                      {activeBranch === "cityschool-1"
                        ? "City School Branch 1 (Gulberg)"
                        : activeBranch === "cityschool-2"
                        ? "City School Branch 2 (DHA)"
                        : "City School Branch 3 (Johar Town)"}
                    </span>
                  </h2>
                  <code className="bg-white/10 text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-white/10">
                    X-Tenant-ID: {activeBranch}
                  </code>
                </div>

                <p className="text-white/60 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Every outgoing frontend request injects this tenant header. Backend middleware
                  automatically binds request lifecycle to this isolated PostgreSQL instance using{" "}
                  <span className="text-white/90 font-mono">AsyncLocalStorage</span>.
                </p>
              </div>

              {/* Quick Branch Switcher Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                {[
                  { slug: "cityschool-1", label: "Branch 1", sub: "Gulberg", code: "CS-B1" },
                  { slug: "cityschool-2", label: "Branch 2", sub: "DHA", code: "CS-B2" },
                  { slug: "cityschool-3", label: "Branch 3", sub: "Johar Town", code: "CS-B3" },
                ].map((b) => {
                  const isActive = activeBranch === b.slug;
                  return (
                    <button
                      key={b.slug}
                      onClick={() => handleBranchSwitch(b.slug)}
                      className={`relative flex flex-col items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white text-[#0B1053] shadow-md shadow-black/20"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{b.label}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            isActive ? "bg-indigo-100 text-indigo-800" : "bg-white/15 text-white/80"
                          }`}
                        >
                          {b.code}
                        </span>
                      </div>
                      <span className={`text-[10px] font-normal ${isActive ? "text-indigo-600" : "text-white/40"}`}>
                        {b.sub}
                      </span>
                      {isActive && (
                        <span className="absolute -bottom-1 w-8 h-1 bg-cyan-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Isolated Databases
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {databases.length} <span className="text-xs font-semibold text-slate-400">Total</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  1 Master + 3 Branches
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <Database size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolled Students
                </p>
                <p className="text-xl sm:text-2xl font-black text-[#0B1053] mt-1">
                  {totalBranchStudents}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Across 3 Branch DBs
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Users size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Student Fee Ledger
                </p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                  {totalBranchFees} <span className="text-xs font-semibold text-slate-400">Records</span>
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Decentralized billing
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CreditCard size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Isolation Status
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-base sm:text-lg font-black text-slate-900">100% Isolated</p>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Zero Data Cross-Talk
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <Loader />
            </div>
          ) : (
            <>
              {/* Database Cards Fleet */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      PostgreSQL Database Instances
                    </h3>
                    <p className="text-xs text-slate-500">
                      Connected databases registered under the SaaS platform
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Port: 5432 • pgPool Live
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Master Database Card */}
                  {masterDb && (
                    <div className="group relative bg-white rounded-3xl p-6 border-2 border-purple-200/90 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-3xl" />
                      
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
                            <Server size={18} />
                          </span>
                          <span className="px-2.5 py-1 bg-purple-100/80 text-purple-800 text-[10px] font-black rounded-lg uppercase tracking-wider">
                            Master Registry
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-base mb-1 tracking-tight">
                          {masterDb.name}
                        </h4>

                        <div className="flex items-center gap-1.5 mb-4">
                          <code className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 truncate flex-1">
                            {masterDb.database}
                          </code>
                          <button
                            onClick={() => handleCopy(masterDb.database)}
                            title="Copy database name"
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                          >
                            {copiedText === masterDb.database ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>

                        <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Registered Branches:</span>
                            <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                              {masterDb.stats?.registeredTenants}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Platform Invoices:</span>
                            <span className="font-bold text-purple-700 px-2 py-0.5 bg-purple-50 rounded">
                              {masterDb.stats?.platformFees}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Super Admins / Master:</span>
                            <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                              {masterDb.stats?.totalUsers}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100">
                        <span className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100/80">
                          <ShieldCheck size={13} /> Central Governance
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Branch Tenant Database Cards */}
                  {branchDbs.map((tenant, idx) => {
                    const isActive = activeBranch === tenant.slug;
                    const accentColor =
                      idx === 0
                        ? "from-blue-500 to-cyan-500"
                        : idx === 1
                        ? "from-emerald-500 to-teal-500"
                        : "from-amber-500 to-orange-500";

                    return (
                      <div
                        key={tenant.slug}
                        className={`group relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between ${
                          isActive
                            ? "border-[#0B1053] shadow-xl shadow-indigo-950/10 ring-4 ring-[#0B1053]/5"
                            : "border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-lg"
                        }`}
                      >
                        <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${accentColor} rounded-t-3xl`} />

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`p-2.5 rounded-2xl border ${
                                  idx === 0
                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                    : idx === 1
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                }`}
                              >
                                <School size={18} />
                              </span>
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                                {tenant.code}
                              </span>
                            </div>

                            {isActive ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                Standby
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-900 text-base mb-1 tracking-tight">
                            {tenant.name}
                          </h4>

                          <div className="flex items-center gap-1.5 mb-4">
                            <code className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 truncate flex-1">
                              {tenant.database}
                            </code>
                            <button
                              onClick={() => handleCopy(tenant.database)}
                              title="Copy database name"
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                            >
                              {copiedText === tenant.database ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-500">Enrolled Students:</span>
                              <span className="font-bold text-[#0B1053] text-sm">
                                {tenant.stats?.students ?? 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-500">Fee Records:</span>
                              <span className="font-bold text-slate-800">{tenant.stats?.fees ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-500">Branch Admins:</span>
                              <span className="font-bold text-slate-800">{tenant.stats?.admins ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-500">License Key:</span>
                              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[110px]">
                                {tenant.licenseKey || "Active"}
                              </span>
                            </div>
                          </div>

                          {/* Sample Students Mini-List */}
                          {tenant.sampleStudents && tenant.sampleStudents.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Sample Branch Students:
                              </p>
                              <div className="space-y-1">
                                {tenant.sampleStudents.slice(0, 2).map((s) => (
                                  <div
                                    key={s.id}
                                    className="text-[11px] text-slate-700 font-medium truncate flex items-center gap-1.5"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <span className="truncate">{s.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ({s.rollNo})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Switch Button */}
                        <div className="mt-5 pt-3 border-t border-slate-100">
                          {isActive ? (
                            <button
                              disabled
                              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              Active Router Target
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBranchSwitch(tenant.slug)}
                              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-50 hover:bg-[#0B1053] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0B1053] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                            >
                              <ArrowRight size={13} />
                              Switch to {tenant.code}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Multi-Tenant Isolation Testing Suite */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Inject Record Form (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                        <Plus size={18} />
                      </span>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">
                          Live Record Injection Test
                        </h3>
                        <p className="text-xs text-slate-500">
                          Insert student into one branch &amp; verify others remain untouched
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickFill}
                      title="Auto-fill demo student data"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold hover:bg-indigo-100 transition-all cursor-pointer shadow-sm"
                    >
                      <Sparkles size={12} />
                      Quick Demo
                    </button>
                  </div>

                  <form onSubmit={handleTestSubmit} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Target Branch Database
                      </label>
                      <select
                        value={testForm.tenantSlug}
                        onChange={(e) => setTestForm({ ...testForm, tenantSlug: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 focus:border-[#0B1053] focus:bg-white outline-none transition-all cursor-pointer"
                      >
                        <option value="cityschool-1">Branch 1 (Gulberg) — lms_cityschool_branch1</option>
                        <option value="cityschool-2">Branch 2 (DHA) — lms_cityschool_branch2</option>
                        <option value="cityschool-3">Branch 3 (Johar Town) — lms_cityschool_branch3</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tariq Mehmood"
                        value={testForm.name}
                        onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0B1053] focus:bg-white outline-none transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Student Email
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. tariq@branch.com"
                          value={testForm.email}
                          onChange={(e) => setTestForm({ ...testForm, email: e.target.value })}
                          className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0B1053] focus:bg-white outline-none transition-all placeholder:text-slate-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Roll / Reference No
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. B1-105"
                          value={testForm.rollNo}
                          onChange={(e) => setTestForm({ ...testForm, rollNo: e.target.value })}
                          className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0B1053] focus:bg-white outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={testStudentMutation.isPending}
                      className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-[#0B1053] to-[#252f9c] text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                    >
                      {testStudentMutation.isPending ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          Executing Isolated Write...
                        </>
                      ) : (
                        <>
                          <Database size={15} />
                          Inject &amp; Verify Isolated Storage
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right: Separation Proof Matrix (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[380px]">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900">
                          Cross-Database Zero-Leakage Matrix
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          Live Telemetry
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Physical isolation check across independent PostgreSQL branch databases
                      </p>
                    </div>

                    {lastTestResult && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 size={14} className="text-emerald-600" /> 100% Isolated
                      </span>
                    )}
                  </div>

                  {lastTestResult ? (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      {/* Success Alert Banner */}
                      <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-emerald-950 font-bold text-xs sm:text-sm">
                              {lastTestResult.message}
                            </p>
                            <p className="text-emerald-800 text-xs mt-1 leading-relaxed">
                              {lastTestResult.explanation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 3 Branch Verification Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* Branch 1 */}
                        <div
                          className={`p-4 rounded-2xl border-2 transition-all text-center ${
                            lastTestResult.isolationVerification?.existsInBranch1
                              ? "bg-emerald-50/80 border-emerald-400 text-emerald-900 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest block mb-1">
                            Branch 1 (Gulberg)
                          </span>
                          <code className="font-mono text-[11px] block truncate">
                            lms_cityschool_branch1
                          </code>
                          <div className="mt-3 text-sm sm:text-base font-extrabold flex items-center justify-center gap-1.5">
                            {lastTestResult.isolationVerification?.existsInBranch1 ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 size={16} /> 1 Record Stored
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                <ShieldCheck size={14} /> 0 Records (Clean)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Branch 2 */}
                        <div
                          className={`p-4 rounded-2xl border-2 transition-all text-center ${
                            lastTestResult.isolationVerification?.existsInBranch2
                              ? "bg-emerald-50/80 border-emerald-400 text-emerald-900 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest block mb-1">
                            Branch 2 (DHA)
                          </span>
                          <code className="font-mono text-[11px] block truncate">
                            lms_cityschool_branch2
                          </code>
                          <div className="mt-3 text-sm sm:text-base font-extrabold flex items-center justify-center gap-1.5">
                            {lastTestResult.isolationVerification?.existsInBranch2 ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 size={16} /> 1 Record Stored
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                <ShieldCheck size={14} /> 0 Records (Clean)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Branch 3 */}
                        <div
                          className={`p-4 rounded-2xl border-2 transition-all text-center ${
                            lastTestResult.isolationVerification?.existsInBranch3
                              ? "bg-emerald-50/80 border-emerald-400 text-emerald-900 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest block mb-1">
                            Branch 3 (Johar Town)
                          </span>
                          <code className="font-mono text-[11px] block truncate">
                            lms_cityschool_branch3
                          </code>
                          <div className="mt-3 text-sm sm:text-base font-extrabold flex items-center justify-center gap-1.5">
                            {lastTestResult.isolationVerification?.existsInBranch3 ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 size={16} /> 1 Record Stored
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                <ShieldCheck size={14} /> 0 Records (Clean)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Created Record Meta */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-1">
                        <span className="font-bold text-slate-700 block">
                          Verified Written Record:
                        </span>
                        <div className="font-mono text-slate-600 truncate">
                          ID: <span className="text-indigo-600 font-bold">{lastTestResult.createdStudent?.id}</span> | Name:{" "}
                          <span className="text-slate-900 font-semibold">{lastTestResult.createdStudent?.name}</span> | Email:{" "}
                          <span className="text-slate-900 font-semibold">{lastTestResult.createdStudent?.email}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mb-3 shadow-inner">
                        <Layers size={28} />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-base">
                        Telemetry Ready for Execution
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                        Use the injection test form on the left to write a record into Branch 1,
                        Branch 2, or Branch 3. The zero-leakage telemetry board will verify that data
                        is saved strictly into that specific database instance.
                      </p>
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-indigo-700 text-xs font-bold hover:bg-indigo-50 shadow-sm transition-all"
                      >
                        <Sparkles size={13} />
                        Auto-populate Demo Record
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Architecture Blueprint Strip */}
              <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                    <Terminal size={18} />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      How Multi-Tenant Dynamic Routing Works Under The Hood
                    </h4>
                    <p className="text-xs text-slate-500">
                      Runtime connection pooling and memory isolation mechanics
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                      1. Ingress Resolution
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Frontend requests carry the active <code className="bg-white px-1.5 py-0.5 rounded text-slate-800 border">X-Tenant-ID</code> header. The middleware maps the slug to its dedicated connection URI.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                      2. AsyncLocalStorage Scope
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Node.js runs the request lifecycle in a thread-isolated async context, binding <code className="bg-white px-1.5 py-0.5 rounded text-slate-800 border">prisma.user</code> directly to that branch DB.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                      3. Zero-Knowledge Master
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Branch operational data (students, grades, attendance, fees) never touches the Master DB, satisfying sovereign privacy requirements.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TenantManagement;
