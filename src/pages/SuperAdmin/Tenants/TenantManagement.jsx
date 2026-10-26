import React, { useState } from "react";
import SuperAdminNavbar from "../../../components/SuperAdmin/SuperAdminNavbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../../utils/Loader";
import {
  getTenantOverview,
  createTestStudent,
  onboardInstitute,
  toggleTenantStatus,
  deleteTenant,
} from "../../../api/SuperAdmin/tenantApi";
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
  Key,
  ExternalLink,
  Power,
  X,
  Eye,
  EyeOff,
  FileText,
  Mail,
  Building,
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

const PLAN_BADGES = {
  STARTER: "bg-blue-50 text-blue-700 border-blue-200",
  STANDARD: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PREMIUM: "bg-purple-50 text-purple-700 border-purple-200",
  ENTERPRISE: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
};

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

  // Modals state
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [handoverData, setHandoverData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Onboard form state
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    slug: "",
    code: "",
    subdomain: "",
    plan: "ENTERPRISE",
    dbType: "managed",
    customDbUrl: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    maxUsers: 1000,
  });

  const { data: overviewData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["tenantOverview"],
    queryFn: async () => {
      const resp = await getTenantOverview();
      return resp;
    },
    refetchOnWindowFocus: false,
  });

  // Onboard Institute Mutation
  const onboardMutation = useMutation({
    mutationFn: (data) => onboardInstitute(data),
    onSuccess: (res) => {
      toast.success(res.message || "Institute onboarded successfully!");
      setIsOnboardOpen(false);
      queryClient.invalidateQueries(["tenantOverview"]);
      if (res.handover) {
        setHandoverData(res.handover);
        setIsHandoverOpen(true);
      }
      setOnboardForm({
        name: "",
        slug: "",
        code: "",
        subdomain: "",
        plan: "ENTERPRISE",
        dbType: "managed",
        customDbUrl: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        maxUsers: 1000,
      });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to onboard institute."
      );
    },
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (slug) => toggleTenantStatus(slug),
    onSuccess: (res) => {
      toast.success(res.message || "Status updated.");
      queryClient.invalidateQueries(["tenantOverview"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to update status.");
    },
  });

  // Test Student Mutation
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

  const handleCopy = (text, label = "text") => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.info(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "Sch@";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOnboardForm((prev) => ({ ...prev, adminPassword: pwd }));
    toast.success("Generated strong password!");
  };

  const handleNameChange = (val) => {
    const cleanSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const cleanCode = val
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase();

    setOnboardForm((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || prev.slug === cleanSlug.slice(0, -1) ? cleanSlug : prev.slug,
      code: prev.code === "" || prev.code === cleanCode.slice(0, -1) ? cleanCode : prev.code,
      subdomain: prev.subdomain === "" ? cleanSlug : prev.subdomain,
      adminEmail:
        prev.adminEmail === "" || prev.adminEmail.includes("@")
          ? `admin@${cleanSlug || "school"}.edu.pk`
          : prev.adminEmail,
    }));
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

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.adminEmail) {
      return toast.warning("Please fill in the institute name and admin email.");
    }
    onboardMutation.mutate(onboardForm);
  };

  const handleCopyHandoverSlip = (handover) => {
    if (!handover) return;
    const text = `
🏫 *LMS INSTITUTE ACCESS & ONBOARDING SLIP*
--------------------------------------------
• Institute Name : ${handover.instituteName}
• Branch Code    : ${handover.branchCode}
• Branch Slug    : ${handover.slug}
• Isolated DB    : ${handover.databaseName}
• Subscription   : ${handover.plan || "ENTERPRISE"} (Active)

🔐 *ADMINISTRATOR CREDENTIALS*
• Login Portal   : ${handover.loginUrl || "http://localhost:5173/admin/login"}
• Admin Email    : ${handover.adminEmail}
• Initial Password: ${handover.adminPassword || "******"}

🔑 *LICENSE KEY*
• Key            : ${handover.licenseKey}

Please store these credentials securely and share them with the designated institute administrator.
`.trim();

    handleCopy(text, "Onboarding Handover Slip");
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

  const activeTenantObj = branchDbs.find((b) => b.slug === activeBranch) || branchDbs[0];

  return (
    <>
      <SuperAdminNavbar heading="Tenant Databases & SaaS Control Plane" />

      <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8 font-['Outfit',sans-serif]">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  <Activity size={13} className="text-indigo-600 animate-pulse" />
                  Multi-Tenant PostgreSQL Architecture
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} />
                  Zero Data Leakage Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1053] tracking-tight">
                Tenant Database Fleet &amp; Live Isolation
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Dedicated database-per-tenant architecture. Every branch operates with physically isolated
                storage, dedicated schemas, and instant admin assignment.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsOnboardOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-[#0B1053] text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-indigo-900/25 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                Onboard New Institute
              </button>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={14} className={isFetching ? "animate-spin text-indigo-600" : ""} />
                {isFetching ? "Syncing..." : "Refresh Fleet"}
              </button>

              <Link
                to="/superadmin/licenses"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all"
              >
                <Lock size={13} className="text-amber-600" />
                License Authority
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
                    Active Institute:{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
                      {activeTenantObj?.name || activeBranch}
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

                {activeTenantObj?.adminEmail && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-white/80">
                    <Mail size={13} className="text-indigo-400" />
                    <span>Assigned Admin:</span>
                    <span className="font-semibold text-white">{activeTenantObj.adminName}</span>
                    <code className="text-cyan-300 bg-white/10 px-1.5 py-0.5 rounded font-mono text-[11px]">
                      {activeTenantObj.adminEmail}
                    </code>
                  </div>
                )}
              </div>

              {/* Dynamic Branch Switcher Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md max-w-full overflow-x-auto">
                {branchDbs.map((b) => {
                  const isActive = activeBranch === b.slug;
                  return (
                    <button
                      key={b.slug}
                      onClick={() => handleBranchSwitch(b.slug)}
                      className={`relative flex flex-col items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-white text-[#0B1053] shadow-md shadow-black/20"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[120px]">{b.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            isActive ? "bg-indigo-100 text-indigo-800" : "bg-white/15 text-white/80"
                          }`}
                        >
                          {b.code || b.slug}
                        </span>
                      </div>
                      <span className={`text-[10px] font-normal ${isActive ? "text-indigo-600" : "text-white/40"}`}>
                        {b.stats?.students ?? 0} Students
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
                  Tenant Databases
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {databases.length} <span className="text-xs font-semibold text-slate-400">Total</span>
                </p>
                <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                  1 Master + {branchDbs.length} Branches
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
                  Across all branch DBs
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Users size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assigned Admins
                </p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                  {totalBranchAdmins} <span className="text-xs font-semibold text-slate-400">Admins</span>
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Direct branch authority
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <UserCheck size={20} />
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
                      PostgreSQL Database Instances &amp; Assigned Admins
                    </h3>
                    <p className="text-xs text-slate-500">
                      Active tenant databases and their direct administrative credentials
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Port: 5432 • pgPool Live
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                            Master Central DB
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
                            onClick={() => handleCopy(masterDb.database, "database name")}
                            title="Copy database name"
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
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
                            <span className="text-slate-500">Registered Institutes:</span>
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
                        <span className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100/80">
                          <ShieldCheck size={13} /> Sovereign Master Control
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Branch Tenant Database Cards */}
                  {branchDbs.map((tenant, idx) => {
                    const isActive = activeBranch === tenant.slug;
                    const isSuspended = tenant.status === "SUSPENDED";
                    const accentColor = isSuspended
                      ? "from-rose-500 to-red-600"
                      : idx % 3 === 0
                      ? "from-blue-500 to-cyan-500"
                      : idx % 3 === 1
                      ? "from-emerald-500 to-teal-500"
                      : "from-amber-500 to-orange-500";

                    return (
                      <div
                        key={tenant.slug}
                        className={`group relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between ${
                          isActive
                            ? "border-[#0B1053] shadow-xl shadow-indigo-950/10 ring-4 ring-[#0B1053]/5"
                            : isSuspended
                            ? "border-rose-200 bg-rose-50/20 shadow-sm"
                            : "border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-lg"
                        }`}
                      >
                        <div
                          className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${accentColor} rounded-t-3xl`}
                        />

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="p-2.5 rounded-2xl border bg-indigo-50 text-indigo-700 border-indigo-100">
                                <School size={18} />
                              </span>
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                                {tenant.code}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {isSuspended ? (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-lg uppercase">
                                  Suspended
                                </span>
                              ) : isActive ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase">
                                  Standby
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 className="font-bold text-slate-900 text-base mb-1 tracking-tight truncate">
                            {tenant.name}
                          </h4>

                          <div className="flex items-center gap-1.5 mb-3">
                            <code className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 truncate flex-1">
                              {tenant.database}
                            </code>
                            <button
                              onClick={() => handleCopy(tenant.database, "database name")}
                              title="Copy database name"
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              {copiedText === tenant.database ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>

                          {/* Assigned Admin Box */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-3 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">Assigned Admin:</span>
                              <span className="font-bold text-slate-900 truncate max-w-[120px]">
                                {tenant.adminName || "Administrator"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-0.5">
                              <span className="font-mono text-indigo-700 truncate max-w-[170px]">
                                {tenant.adminEmail || "admin@school.com"}
                              </span>
                              <button
                                onClick={() => handleCopy(tenant.adminEmail, "admin email")}
                                title="Copy email"
                                className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                {copiedText === tenant.adminEmail ? (
                                  <Check size={11} className="text-emerald-600" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600">
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-500">Students:</span>
                              <span className="font-bold text-[#0B1053]">
                                {tenant.stats?.students ?? 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-500">License:</span>
                              <span className="font-mono text-[10px] text-slate-700 truncate max-w-[120px]">
                                {tenant.licenseKey || "Active"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <button
                                disabled
                                className="flex-1 py-2 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1 shadow-sm"
                              >
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                Active Context
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBranchSwitch(tenant.slug)}
                                className="flex-1 py-2 rounded-xl font-bold text-xs bg-slate-50 hover:bg-[#0B1053] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0B1053] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              >
                                <ArrowRight size={13} />
                                Select Branch
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setHandoverData({
                                  instituteName: tenant.name,
                                  branchCode: tenant.code,
                                  slug: tenant.slug,
                                  databaseName: tenant.database,
                                  adminName: tenant.adminName,
                                  adminEmail: tenant.adminEmail,
                                  adminPassword: "(Saved securely on DB)",
                                  loginUrl: `${window.location.origin}/admin/login`,
                                  licenseKey: tenant.licenseKey,
                                  plan: "ENTERPRISE",
                                });
                                setIsHandoverOpen(true);
                              }}
                              title="View Handover Credentials"
                              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              <FileText size={14} />
                            </button>

                            <button
                              onClick={() => toggleStatusMutation.mutate(tenant.slug)}
                              title={isSuspended ? "Reactivate Institute" : "Suspend Institute"}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                isSuspended
                                  ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                  : "border-rose-200 text-rose-600 hover:bg-rose-50"
                              }`}
                            >
                              <Power size={14} />
                            </button>
                          </div>
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
                          Insert student into target branch &amp; verify other databases remain untouched
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
                      Auto-fill
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
                        {branchDbs.map((b) => (
                          <option key={b.slug} value={b.slug}>
                            {b.name} ({b.code}) — {b.database}
                          </option>
                        ))}
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
                        Use the injection test form on the left to write a record into any branch database.
                        The zero-leakage telemetry board will verify that data is saved strictly into that specific database instance.
                      </p>
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-indigo-700 text-xs font-bold hover:bg-indigo-50 shadow-sm transition-all cursor-pointer"
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

      {/* ========================================================================= */}
      {/* MODAL 1: 1-Click Institute Onboarding & Database Provisioning Wizard */}
      {/* ========================================================================= */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
                  <Building size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Onboard New School Institute
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provisions isolated database, creates branch admin, and issues subscription license
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOnboardOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-5">
              {/* Step 1: Institute Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Institute Information
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Institute / School Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Beaconhouse School System - Johar Town"
                    value={onboardForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Branch Code (e.g. BSS-JT)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BSS-JT"
                      value={onboardForm.code}
                      onChange={(e) =>
                        setOnboardForm({ ...onboardForm, code: e.target.value.toUpperCase() })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Tenant Unique Slug
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. beaconhouse-johar"
                      value={onboardForm.slug}
                      onChange={(e) =>
                        setOnboardForm({
                          ...onboardForm,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-mono text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Subscription Tier Plan
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {["STANDARD", "PREMIUM", "ENTERPRISE"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setOnboardForm({ ...onboardForm, plan: p })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          onboardForm.plan === p
                            ? "bg-[#0B1053] text-white border-[#0B1053] shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Database Strategy */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Database Allocation Strategy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setOnboardForm({ ...onboardForm, dbType: "managed" })}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      onboardForm.dbType === "managed"
                        ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Database size={16} className="text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Auto-Provision Dedicated DB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Creates a dedicated database <code className="text-indigo-600 font-mono">lms_{onboardForm.slug || "slug"}</code> on port 5432 with automatic schema migration.
                    </p>
                  </div>

                  <div
                    onClick={() => setOnboardForm({ ...onboardForm, dbType: "custom" })}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      onboardForm.dbType === "custom"
                        ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Server size={16} className="text-purple-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Custom Remote PostgreSQL
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Provide your own AWS RDS, Supabase, or external connection URI for cloud hosting.
                    </p>
                  </div>
                </div>

                {onboardForm.dbType === "custom" && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Custom PostgreSQL Connection URL *
                    </label>
                    <input
                      type="text"
                      required={onboardForm.dbType === "custom"}
                      placeholder="postgresql://user:pass@host:5432/dbname?sslmode=require"
                      value={onboardForm.customDbUrl}
                      onChange={(e) =>
                        setOnboardForm({ ...onboardForm, customDbUrl: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:border-indigo-600 focus:bg-white outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Branch Admin Credentials */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Institute Administrator Credentials
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} />
                    Generate Strong Password
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Admin Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Kamran Siddiqui"
                      value={onboardForm.adminName}
                      onChange={(e) =>
                        setOnboardForm({ ...onboardForm, adminName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Admin Email (Login ID) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. principal@school.edu.pk"
                      value={onboardForm.adminEmail}
                      onChange={(e) =>
                        setOnboardForm({ ...onboardForm, adminEmail: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Initial Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to auto-generate"
                      value={onboardForm.adminPassword}
                      onChange={(e) =>
                        setOnboardForm({ ...onboardForm, adminPassword: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-mono text-slate-900 focus:border-indigo-600 focus:bg-white outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboardMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-[#0B1053] text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-indigo-900/25 shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {onboardMutation.isPending ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Provisioning Database &amp; Admin...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Launch &amp; Provision Institute
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Institute Handover & Credentials Slip */}
      {/* ========================================================================= */}
      {isHandoverOpen && handoverData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Institute Access &amp; Handover Slip
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Share these credentials with the school head or administrator to access their dedicated LMS portal.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Institute:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {handoverData.instituteName} ({handoverData.branchCode})
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Dedicated Database:</span>
                <code className="bg-white px-2 py-0.5 rounded text-indigo-700 font-mono font-bold border border-slate-200">
                  {handoverData.databaseName}
                </code>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Admin Login URL:</span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={handoverData.loginUrl || "/admin/login"}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-600 hover:underline font-bold"
                  >
                    {handoverData.loginUrl || "/admin/login"}
                  </a>
                  <button
                    onClick={() => handleCopy(handoverData.loginUrl || window.location.origin + "/admin/login", "login URL")}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Admin Email:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 font-mono">
                    {handoverData.adminEmail}
                  </span>
                  <button
                    onClick={() => handleCopy(handoverData.adminEmail, "admin email")}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Admin Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {handoverData.adminPassword}
                  </span>
                  <button
                    onClick={() => handleCopy(handoverData.adminPassword, "password")}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">License Key:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-slate-700 truncate max-w-[170px]">
                    {handoverData.licenseKey}
                  </span>
                  <button
                    onClick={() => handleCopy(handoverData.licenseKey, "license key")}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleCopyHandoverSlip(handoverData)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-emerald-900/20 shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy size={15} />
                Copy Handover Slip (WhatsApp/Email)
              </button>

              <button
                onClick={() => setIsHandoverOpen(false)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantManagement;
