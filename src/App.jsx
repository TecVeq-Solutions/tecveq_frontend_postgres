import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Student/Dashboard/Dashboard";
import TDashboard from "./pages/Teacher/Dashboard/Dashboard";
import ADashboard from "./pages/Admin/Dashboard/Dashboard";
import PDashboard from "./pages/Parent/Dashboard/Dashboard";

import Reports from "./pages/Student/Reports/Reports";
import TReports from "./pages/Teacher/StudentReports/StudentReports";
import AReports from "./pages/Admin/Students/StudentReports";
import PReports from "./pages/Parent/Reports/Reports";
import PFees from "./pages/Parent/Fees/Fees";

import ATeachers from "./pages/Admin/Teachers/Teachers";
import ATeacherDetails from "./pages/Admin/Teachers/TeacherDetails";

import SubjectReport from "./pages/Student/Reports/SubjectReport";
import TSubjectReport from "./pages/Teacher/StudentReports/SubjectReport";
import ASubjectReport from "./pages/Admin/Students/SubjectReport";
import PSubjectReport from "./pages/Parent/Reports/SubjectReport";

import AssignmentReport from "./pages/Student/Reports/AssignmentReport";
import Assignments from "./pages/Student/Assignments/Assignments";
import TAssignments from "./pages/Teacher/Assignments/Assignments";
import PAssignments from "./pages/Parent/Assignments/Assignments";
import PAssignmentsDetails from "./pages/Parent/Assignments/AssignmentsDetails";
import PAssignmentsReports from "./pages/Parent/Assignments/AssignmentsReports";

import TSubmissions from "./pages/Teacher/Assignments/Submissions";
import TGradingAssignments from "./pages/Teacher/Assignments/GradingAssignments";
import TAttendence from "./pages/Teacher/Attendence/Attendence";
import TMarkAttendence from "./pages/Teacher/Attendence/MarkAttendece";
import TQuizzSubmissions from "./pages/Teacher/Quizzes/Submissions";
import ClassroomAttandence from "./pages/Teacher/Attendence/ClassroomAttendence";
import TGradingQuizzes from "./pages/Teacher/Quizzes/GradingQuizzes";
import Quizzes from "./pages/Student/Quizzes/Quizzes";
import TQuizzes from "./pages/Teacher/Quizzes/Quizzes";
import PQuizzes from "./pages/Parent/Quizzes/Quizzes";
import PQuizzesDetails from "./pages/Parent/Quizzes/QuizzDetails";
import PQuizzesReports from "./pages/Parent/Quizzes/QuizzReports";

import TClassroom from "./pages/Teacher/Classroom/Classroom";
import AClassroom from "./pages/Admin/Classrooms/Classroom";

import TimeTable from "./pages/Student/TImeTable/TimeTable";
import TTimeTable from "./pages/Teacher/TimeTable/TimeTable";
import ATimeTable from "./pages/Admin/TimeTable/TimeTable";

import AAnnouncements from "./pages/Admin/Announcements/Announcements";
// import AAnnouncements from "./pages/Parent/an";
import AManageUsers from "./pages/Admin/ManageUsers/ManageUsers";
import AFees from "./pages/Admin/Fees/Fees";

import ALevels from "./pages/Admin/Levels/Levels";
import ASubjects from "./pages/Admin/Subjects/Subjects";

import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import AdminLayout from "./layouts/AdminLayout";
import ParentLayout from "./layouts/ParentLayout";
import ChildrenScreen from "./pages/Parent/ChildrenScreen/ChildrenScreen";
import Login from "./pages/Auth/Student/Login";
import ALogin from "./pages/Auth/Admin/Login";
import SignUp from "./pages/Auth/Student/SignUp";
import ProtectedStudent from "./utils/ProtectedStudent";
import ProtectedTeacher from "./utils/ProtectedTeacher";
import ProtectedAdmin from "./utils/ProtectedAdmin";
import ProtectedParent from "./utils/ProtectedParent";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from "./pages/Auth/LandingPage";
import HeadAttendence from "./pages/Teacher/Attendence/HeadAttendence";
import Settings from "./pages/Admin/Settings/Settings";
import { TeacherProvider } from "./utils/TeacherProvider";
import ChangePassword from "./commonComponents/ChangePassword";
import AddCSVFile from "./pages/Admin/AddCSVFile/AddCSVFile";
import AttendenceReport from "./pages/Admin/AttendenceReport/AttendenceReport";
import TAttendenceReport from "./pages/Teacher/Attendence/AttendenceReport";
import StudentAttendenceReport from "./pages/Student/Attendence/AttendenceReport";
import ParentAttendenceReport from "./pages/Parent/Attendence/AttendenceReport";
import SuperAdminDashboard from "./pages/SuperAdmin/Dashboard";
import ProtectedSuperAdmin from "./utils/ProtectedSuperAdmin";
import SAPlatformFees from "./pages/SuperAdmin/PlatformFees/PlatformFees";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SAManagement from "./pages/SuperAdmin/AdminManagement";
import SAPackages from "./pages/SuperAdmin/SubscriptionPackages";
import SAPayments from "./pages/SuperAdmin/Payments";
import SAChat from "./pages/SuperAdmin/Chat";
import SANotifications from "./pages/SuperAdmin/Notifications";
import SAReports from "./pages/SuperAdmin/Reports";
import SABlocked from "./pages/SuperAdmin/BlockedAccounts";
import SASettings from "./pages/SuperAdmin/Settings";
import SAProfile from "./pages/SuperAdmin/Profile";
import BulkSubjectAssign from "./pages/Admin/BulkSubjectAssign/BulkSubjectAssign";
import ChatBot from "./components/ChatBot/ChatBot";
import StudentProfileDashboard from "./pages/Common/StudentProfileDashboard";
import APlatformSupport from "./pages/Admin/PlatformSupport/PlatformSupport";
import ABlocked from "./pages/Admin/Blocked/BlockedAccount";
import ASubscription from "./pages/Admin/Subscription/MySubscription";
import StudentLeaves from "./pages/Student/Leaves/Leaves";
import TeacherMyLeaves from "./pages/Teacher/Leaves/MyLeaves";
import TeacherStudentLeaves from "./pages/Teacher/Leaves/StudentLeaves";
import AdminTeacherLeaves from "./pages/Admin/Leaves/TeacherLeaves";

function App() {

  return (
    <>
      <Routes>
        <Route
          path="/routes"
          element={
            <LandingPage />
          }
        />
        <Route
          path="/login"
          element={
            <Login />
          }
        />
        <Route
          path="/change-password"
          element={
            <ChangePassword />
          }
        />
        <Route
          path="/admin/login"
          element={
            <ALogin />
          }
        />
        <Route
          path="/signup"
          element={
            <SignUp />
          }
        />
        <Route
          path="/"
          element={
            <LandingPage />
          }
        />
        <Route element={<ProtectedAdmin />} >
          <Route
            path="/admin/dashboard"
            element={
              <AdminLayout>
                <ADashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/blocked"
            element={<ABlocked />}
          />
          <Route
            path="/admin/platform-support"
            element={
              <AdminLayout>
                <APlatformSupport />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/blocked"
            element={<ABlocked />}
          />


          <Route
            path="/admin/timetable"
            element={
              <AdminLayout>
                <TeacherProvider>
                  <ATimeTable />
                </TeacherProvider>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminLayout>
                <AReports />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/reports/:student"
            element={
              <AdminLayout>
                <ASubjectReport />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <AdminLayout>
                <AAnnouncements />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/manageusers"
            element={
              <AdminLayout>
                <AManageUsers />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/levels"
            element={
              <AdminLayout>
                <ALevels />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <AdminLayout>
                <ASubjects />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/attendence-report"
            element={
              <AdminLayout>
                <AttendenceReport />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/classrooms"
            element={
              <AdminLayout>
                <AClassroom />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <AdminLayout>
                <ATeachers />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/teachers/:teacher"
            element={
              <AdminLayout>
                <ATeacherDetails />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminLayout>
                <Settings />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/add-csv-file"
            element={
              <AdminLayout>
                <AddCSVFile />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/bulk-subject-assign"
            element={
              <AdminLayout>
                <BulkSubjectAssign />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <AdminLayout>
                <AFees />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/subscription"
            element={
              <AdminLayout>
                <ASubscription />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/teacher-leaves"
            element={
              <AdminLayout>
                <AdminTeacherLeaves />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/student-profile/:studentId"
            element={
              <AdminLayout>
                <StudentProfileDashboard />
              </AdminLayout>
            }
          />
        </Route>
        <Route element={<ProtectedSuperAdmin />}>
          <Route
            path="/superadmin/dashboard"
            element={
              <SuperAdminLayout>
                <SuperAdminDashboard />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/platform-fees"
            element={
              <SuperAdminLayout>
                <SAPlatformFees />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/admins"
            element={
              <SuperAdminLayout>
                <SAManagement />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/packages"
            element={
              <SuperAdminLayout>
                <SAPackages />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/payments"
            element={
              <SuperAdminLayout>
                <SAPayments />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/chat"
            element={
              <SuperAdminLayout>
                <SAChat />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/notifications"
            element={
              <SuperAdminLayout>
                <SANotifications />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/reports"
            element={
              <SuperAdminLayout>
                <SAReports />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/blocked-accounts"
            element={
              <SuperAdminLayout>
                <SABlocked />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/settings"
            element={
              <SuperAdminLayout>
                <SASettings />
              </SuperAdminLayout>
            }
          />
          <Route
            path="/superadmin/profile"
            element={
              <SuperAdminLayout>
                <SAProfile />
              </SuperAdminLayout>
            }
          />
        </Route>
        <Route element={<ProtectedStudent />} >

          <Route
            path="/reports"
            element={
              <StudentLayout>
                <Reports />
              </StudentLayout>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <StudentLayout>
                <Dashboard />
              </StudentLayout>
            }
          />
          <Route
            path="/reports/:subject"
            element={
              <StudentLayout>
                <SubjectReport />
              </StudentLayout>
            }
          />
          <Route
            path="/reports/:subject/:title"
            element={
              <StudentLayout>
                <AssignmentReport />
              </StudentLayout>
            }
          />
          <Route
            path="/assignments"
            element={
              <StudentLayout>
                <Assignments />
              </StudentLayout>
            }
          />
          <Route
            path="/quizzes"
            element={
              <StudentLayout>
                <Quizzes />
              </StudentLayout>
            }
          />
          <Route
            path="/timetable"
            element={
              <StudentLayout>
                <TimeTable />
              </StudentLayout>
            }
          />
          <Route
            path="/student/attendence-report"
            element={
              <StudentLayout>
                <StudentAttendenceReport />
              </StudentLayout>
            }
          />
          <Route
            path="/student/leaves"
            element={
              <StudentLayout>
                <StudentLeaves />
              </StudentLayout>
            }
          />
          <Route
            path="/student/student-profile/:studentId"
            element={
              <StudentLayout>
                <StudentProfileDashboard />
              </StudentLayout>
            }
          />
        </Route>
        <Route element={<ProtectedTeacher />} >
          <Route
            path="/teacher/dashboard"
            element={
              <TeacherLayout>
                <TDashboard />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/timetable"
            element={
              <TeacherLayout>
                <TeacherProvider>
                  <TTimeTable />
                </TeacherProvider>
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <TeacherLayout>
                <TAssignments />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/quizzes"
            element={
              <TeacherLayout>
                <TQuizzes />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/reports"
            element={
              <TeacherLayout>
                <TReports />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/reports/:student"
            element={
              <TeacherLayout>
                <TSubjectReport />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/leaves"
            element={
              <TeacherLayout>
                <TeacherMyLeaves />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/student-leaves"
            element={
              <TeacherLayout>
                <TeacherStudentLeaves />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/assignments/submissions"
            element={
              <TeacherLayout>
                <TSubmissions />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/quizzes/submissions"
            element={
              <TeacherLayout>
                <TQuizzSubmissions />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/assignments/GradingAssignments"
            element={
              <TeacherLayout>
                <TGradingAssignments />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/quizzes/GradingQuizzes"
            element={
              <TeacherLayout>
                <TGradingQuizzes />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/attendence"
            element={
              <TeacherLayout>
                <TAttendence />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/attendence/submission"
            element={
              <TeacherLayout>
                <TMarkAttendence />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/attendence-report"
            element={
              <TeacherLayout>
                <TAttendenceReport />
              </TeacherLayout>
            }
          />

          <Route
            path="/teacher/classroom/head-attendence"
            element={
              <TeacherLayout>
                <HeadAttendence />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/classroom/attendence/submission"
            element={
              <TeacherLayout>
                <ClassroomAttandence />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/classroom"
            element={
              <TeacherLayout>
                <TClassroom />
              </TeacherLayout>
            }
          />
          <Route
            path="/teacher/student-profile/:studentId"
            element={
              <TeacherLayout>
                <StudentProfileDashboard />
              </TeacherLayout>
            }
          />
        </Route>
        <Route element={<ProtectedParent />} >
          <Route
            path="/parent/dashboard"
            element={
              <ParentLayout>
                <PDashboard />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/timetable"
            element={
              <ParentLayout>
                <TimeTable />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/attendence-report"
            element={
              <ParentLayout>
                <ParentAttendenceReport />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/reports"
            element={
              <ParentLayout>
                <PReports />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/reports/:subject"
            element={
              <ParentLayout>
                <PSubjectReport />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/:quizes/reports"
            element={
              <ParentLayout>
                <PQuizzesReports />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/quizes/:details"
            element={
              <ParentLayout>
                <PQuizzesDetails />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/:assignments/reports"
            element={
              <ParentLayout>
                <PAssignmentsReports />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/assignments/:details"
            element={
              <ParentLayout>
                <PAssignmentsDetails />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/assignments"
            element={
              <ParentLayout>
                <PAssignments />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/quizzes"
            element={
              <ParentLayout>
                <PQuizzes />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/children"
            element={
              <ChildrenScreen />
            }
          />
          <Route
            path="/parent/fees"
            element={
              <ParentLayout>
                <PFees />
              </ParentLayout>
            }
          />
          <Route
            path="/parent/student-profile/:studentId"
            element={
              <ParentLayout>
                <StudentProfileDashboard />
              </ParentLayout>
            }
          />
        </Route>
      </Routes>
      <ToastContainer limit={1} autoClose={3000} pauseOnHover={false} />
      <ChatBot />
    </>

  );
}

export default App;
