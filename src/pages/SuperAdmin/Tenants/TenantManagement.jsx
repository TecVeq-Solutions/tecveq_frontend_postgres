import { useState } from "react";
import Navbar from "../../../components/Admin/Navbar";
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
} from "lucide-react";
import { Link } from "react-router-dom";

const TenantManagement = () => {
  const queryClient = useQueryClient();
  const [activeBranch, setActiveBranch] = useState(
    localStorage.getItem("active_tenant_slug") || "cityschool-1"
  );
  const [testForm, setTestForm] = useState({
    tenantSlug: "cityschool-1",
    name: "",
    email: "",
    rollNo: "",
  });
  const [lastTestResult, setLastTestResult] = useState(null);

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
      toast.success(res.message || "Student created in branch database!");
      queryClient.invalidateQueries(["tenantOverview"]);
      setTestForm({
        ...testForm,
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
    toast.info(`Active branch context switched to: ${slug}. All app requests now target this database.`);
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

  return (
    <div className="w-full bg-[#f4f7fe] font-poppins min-h-screen">
      <div className="lg:ml-72 lg:px-10 sm:px-6 px-3 flex-grow min-h-screen md:pt-4 pb-16">
        <Navbar heading="Multi-Tenant Databases & SaaS Architecture" />

        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 my-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#0B1053] text-white rounded-2xl shadow-lg shadow-[#0B1053]/20">
                <Database size={22} />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-[#0B1053]">
                  Branch Database Isolation & Testing
                </h1>
                <p className="text-gray-500 text-sm">
                  Database-per-Tenant architecture with isolated storage for City School 1, 2, and 3.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 shadow-sm transition-all"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin text-[#0B1053]" : ""} />
              Refresh Status
            </button>
            <Link
              to="/superadmin/platform-fees"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0B1053] text-white font-bold text-xs hover:bg-[#1a237e] shadow-lg shadow-[#0B1053]/20 transition-all"
            >
              Platform Fees <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Active Branch Switcher Banner */}
        <div className="bg-gradient-to-r from-[#0B1053] to-[#252f9c] rounded-3xl p-6 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                Live Dynamic Routing
              </span>
              <h2 className="text-xl font-bold mt-2">Active Branch Context: {activeBranch}</h2>
              <p className="text-white/70 text-xs mt-1 max-w-xl">
                Har outgoing API request <code className="bg-white/10 px-2 py-0.5 rounded text-amber-300">X-Tenant-ID: {activeBranch}</code> header bhejti hai. Backend runtime par usi database ko query karta hai.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/60 font-semibold mr-1">Switch Active:</span>
              {["cityschool-1", "cityschool-2", "cityschool-3"].map((slug, idx) => (
                <button
                  key={slug}
                  onClick={() => handleBranchSwitch(slug)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    activeBranch === slug
                      ? "bg-white text-[#0B1053] shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Branch {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Loader />
          </div>
        ) : (
          <>
            {/* Database Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Master DB Card */}
              {masterDb && (
                <div className="bg-white rounded-3xl p-6 border-2 border-purple-200 shadow-xl shadow-purple-100/50 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl">
                      <Server size={20} />
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      Master DB
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0B1053] text-base mb-1">{masterDb.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mb-4">{masterDb.database}</p>

                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Registered Branches:</span>
                      <span className="font-bold text-gray-800">{masterDb.stats?.registeredTenants}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Platform Invoices:</span>
                      <span className="font-bold text-purple-600">{masterDb.stats?.platformFees}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Master Users:</span>
                      <span className="font-bold text-gray-800">{masterDb.stats?.totalUsers}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Branch Tenant Databases */}
              {branchDbs.map((tenant, index) => (
                <div
                  key={tenant.slug}
                  className={`bg-white rounded-3xl p-6 border-2 shadow-xl transition-all ${
                    activeBranch === tenant.slug
                      ? "border-[#0B1053] ring-4 ring-[#0B1053]/10"
                      : "border-gray-100 shadow-gray-200/50 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`p-2.5 rounded-2xl ${
                        index === 0
                          ? "bg-blue-50 text-blue-700"
                          : index === 1
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <School size={20} />
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Isolated
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-1">{tenant.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <code className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                      {tenant.database}
                    </code>
                    <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded">
                      {tenant.code}
                    </span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Enrolled Students:</span>
                      <span className="font-bold text-[#0B1053] text-sm">
                        {tenant.stats?.students ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Student Fees Records:</span>
                      <span className="font-bold text-gray-800">{tenant.stats?.fees ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Branch Admins:</span>
                      <span className="font-bold text-gray-800">{tenant.stats?.admins ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">License Key:</span>
                      <span className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]">
                        {tenant.licenseKey || "Active"}
                      </span>
                    </div>
                  </div>

                  {tenant.sampleStudents && tenant.sampleStudents.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Sample Students in DB:
                      </p>
                      <div className="space-y-1">
                        {tenant.sampleStudents.map((s) => (
                          <div key={s.id} className="text-[11px] text-gray-700 truncate font-medium">
                            • {s.name} ({s.rollNo})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Live Isolation Tester */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                    <Plus size={20} />
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Live Isolation Test</h3>
                    <p className="text-xs text-gray-400">Insert record into a specific branch DB</p>
                  </div>
                </div>

                <form onSubmit={handleTestSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Target Branch Database
                    </label>
                    <select
                      value={testForm.tenantSlug}
                      onChange={(e) => setTestForm({ ...testForm, tenantSlug: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-800 focus:border-[#0B1053] outline-none transition-all cursor-pointer"
                    >
                      <option value="cityschool-1">City School - Branch 1 (Gulberg DB)</option>
                      <option value="cityschool-2">City School - Branch 2 (DHA DB)</option>
                      <option value="cityschool-3">City School - Branch 3 (Johar Town DB)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={testForm.name}
                      onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-800 focus:border-[#0B1053] outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Student Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. tariq@branch.com"
                      value={testForm.email}
                      onChange={(e) => setTestForm({ ...testForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-800 focus:border-[#0B1053] outline-none transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={testStudentMutation.isPending}
                    className="w-full py-4 rounded-2xl bg-[#0B1053] text-white font-bold text-sm hover:bg-[#1a237e] transition-all shadow-xl shadow-[#0B1053]/20 flex items-center justify-center gap-2"
                  >
                    {testStudentMutation.isPending ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Database size={16} />
                    )}
                    Insert into Selected Branch DB
                  </button>
                </form>
              </div>

              {/* Live Test Results & Isolation Proof */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Database Separation Proof</h3>
                    <p className="text-xs text-gray-400">
                      Cross-database isolation check (verifies 0 data leakage)
                    </p>
                  </div>
                  {lastTestResult && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Verified Isolated
                    </span>
                  )}
                </div>

                {lastTestResult ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
                      <p className="text-emerald-900 font-bold text-sm mb-1">
                        {lastTestResult.message}
                      </p>
                      <p className="text-emerald-700 text-xs font-medium">
                        {lastTestResult.explanation}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Branch 1 */}
                      <div
                        className={`p-4 rounded-2xl border-2 text-center ${
                          lastTestResult.isolationVerification?.existsInBranch1
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                          Branch 1 DB
                        </p>
                        <p className="font-mono text-xs">lms_cityschool_branch1</p>
                        <div className="mt-2 text-base font-bold">
                          {lastTestResult.isolationVerification?.existsInBranch1 ? "✅ Stored" : "❌ Empty (0)"}
                        </div>
                      </div>

                      {/* Branch 2 */}
                      <div
                        className={`p-4 rounded-2xl border-2 text-center ${
                          lastTestResult.isolationVerification?.existsInBranch2
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                          Branch 2 DB
                        </p>
                        <p className="font-mono text-xs">lms_cityschool_branch2</p>
                        <div className="mt-2 text-base font-bold">
                          {lastTestResult.isolationVerification?.existsInBranch2 ? "✅ Stored" : "❌ Empty (0)"}
                        </div>
                      </div>

                      {/* Branch 3 */}
                      <div
                        className={`p-4 rounded-2xl border-2 text-center ${
                          lastTestResult.isolationVerification?.existsInBranch3
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                          Branch 3 DB
                        </p>
                        <p className="font-mono text-xs">lms_cityschool_branch3</p>
                        <div className="mt-2 text-base font-bold">
                          {lastTestResult.isolationVerification?.existsInBranch3 ? "✅ Stored" : "❌ Empty (0)"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-1">
                      <span className="font-bold text-gray-700">Created Record Details:</span>
                      <div className="font-mono text-gray-600">
                        ID: {lastTestResult.createdStudent?.id} | Name: {lastTestResult.createdStudent?.name} | Email: {lastTestResult.createdStudent?.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <Database size={36} className="text-gray-300 mb-3" />
                    <p className="font-bold text-gray-600 text-sm">Ready for Testing</p>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                      Use the test form on the left to create a test student in Branch 1, Branch 2, or Branch 3.
                      The verification matrix will dynamically demonstrate that the student is written exclusively to that database.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TenantManagement;
