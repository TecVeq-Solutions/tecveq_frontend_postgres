import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllUsers } from '../api/Admin/AdminApi';
import { getAllLevels } from '../api/Admin/LevelsApi';
import { getAllSubjects } from '../api/Admin/SubjectsApi';
import { getAllClassroom } from '../api/Admin/classroomApi';
import { getPaymentHistory, getSystemSettings } from '../api/Admin/PaymentsApi';
import axios from 'axios';
import { BACKEND_URL, BACKEND_URL_SOCKET } from '../constants/api';
import { io } from 'socket.io-client';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [allLevels, setAllLevels] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allClassrooms, setAllClassrooms] = useState([]);
  const [selectedTeacherSubjects, setSelectedTeacherSubjects] = useState([]);
  const [adminLogedIn, setAdminLogedIn] = useState(() => {
    const user = JSON.parse(localStorage.getItem('tcauser'));
    return !!user && (user.userType === 'admin' || user.userType === 'super_admin');
  });


  const [adminUsersData, setAdminUsersdata] = useState({
    allStudents: [],
    allTeachers: [],
    allParents: [],
    allUsers: [],
  });

  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const queryClient = useQueryClient();

  const resetState = () => {
    setAllLevels([]);
    setAllSubjects([]);
    setAllClassrooms([]);
    setAdminUsersdata({
      allStudents: [],
      allTeachers: [],
      allParents: [],
      allUsers: [],
    });
    setSubscriptionData(null);
    setPaymentHistory([]);
    setSystemSettings(null);
    setSelectedTeacherSubjects([]);
    setUnreadSupportCount(0);
    queryClient.clear(); // Clear all react-query cache to prevent cross-admin data leak
  };

  // Fetch users data
  const userQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const results = await getAllUsers();
      if (results !== 'error') {
        setAdminUsersdata((prev) => ({
          ...prev,
          allParents: results.filter((item) => item.userType === 'parent' && item.isAccepted === true),
          allStudents: results.filter((item) => item.userType === 'student' && item.isAccepted === true),
          allTeachers: results.filter((item) => item.userType === 'teacher' && item.isAccepted === true),
          allUsers: results,
        }));
      }
      return results;
    },
    staleTime: 300000,
    enabled: adminLogedIn,
  });

  // Fetch subjects data
  const subjectQuery = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const results = await getAllSubjects();
      setAllSubjects(results);
      return results;
    },
    staleTime: 300000,
    enabled: adminLogedIn,
  });

  // Fetch levels data
  const levelQuery = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const results = await getAllLevels();
      setAllLevels(results);
      return results;
    },
    staleTime: 300000,
    enabled: adminLogedIn,
  });

  // Fetch classrooms data
  const classroomQuery = useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const results = await getAllClassroom();
      setAllClassrooms(results);
      return results;
    },
    staleTime: 300000,
    enabled: adminLogedIn,
  });

  // Fetch subscription data
  const subscriptionQuery = useQuery({
    queryKey: ['admin-subscription'],
    queryFn: async () => {
      const response = await axios.get(`${BACKEND_URL}/subscription/status`, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('tcauser'))?.token}` }
      });
      setSubscriptionData(response.data);
      return response.data;
    },
    staleTime: 60000,
    enabled: adminLogedIn,
  });

  // Fetch payment history
  const paymentHistoryQuery = useQuery({
    queryKey: ['admin-payment-history'],
    queryFn: async () => {
      const results = await getPaymentHistory();
      setPaymentHistory(results);
      return results;
    },
    staleTime: 60000,
    enabled: adminLogedIn,
  });

  // Fetch system settings for payment instructions
  const systemSettingsQuery = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const results = await getSystemSettings();
      setSystemSettings(results);
      return results;
    },
    staleTime: 300000,
    enabled: adminLogedIn,
  });

  // Function to update teacher subjects
  const updateTeacherSubjects = async (teacherId) => {
    if (!teacherId) {
      setSelectedTeacherSubjects([]);
      return;
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/subject/teacher-subject/${teacherId}`);
      if (response.status === 200) {
        setSelectedTeacherSubjects(response.data);
      }
    } catch (error) {
      console.error("Error fetching teacher subjects", error);
      setSelectedTeacherSubjects([]);
    }
  };

  // Ensure data is refetched when `adminLogedIn` becomes true, and cleared when false
  useEffect(() => {
    if (adminLogedIn) {
      userQuery.refetch();
      subjectQuery.refetch();
      levelQuery.refetch();
      classroomQuery.refetch();
      subscriptionQuery.refetch();
      paymentHistoryQuery.refetch();
      systemSettingsQuery.refetch();
    } else {
      resetState();
    }
  }, [adminLogedIn]);

  // Global Support Message Listener
  useEffect(() => {
    if (!adminLogedIn) return;

    const userData = JSON.parse(localStorage.getItem('tcauser'));
    if (!userData?.id) return;

    const supportSocket = io(`${BACKEND_URL_SOCKET}/one-to-one`);
    const SUPER_ADMIN_ID = "SUPER_ADMIN_SYSTEM";

    supportSocket.emit("join", [userData.id, SUPER_ADMIN_ID]);

    supportSocket.on("message", (data) => {
      // If message is from Super Admin and we are NOT on the support page
      if (data.message.sentBy !== userData.id) {
        const isSupportPage = window.location.pathname === '/admin/platform-support';
        if (!isSupportPage) {
          setUnreadSupportCount(prev => prev + 1);
        }
      }
    });

    return () => supportSocket.disconnect();
  }, [adminLogedIn]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    adminLogedIn,
    setAdminLogedIn,

    allClassrooms,
    setAllClassrooms,

    adminUsersData,
    adminUsersRefecth: userQuery.refetch,
    adminUsersDataPending: userQuery.isPending,

    allLevels,
    levelsRefetch: levelQuery.refetch,
    levelIsPending: levelQuery.isPending,

    allSubjects,
    subjectsRefetch: subjectQuery.refetch,
    subjectsIsPending: subjectQuery.isPending,

    classroomsRefetch: classroomQuery.refetch,
    classroomsIsPending: classroomQuery.isPending,

    selectedTeacherSubjects,
    updateTeacherSubjects,

    subscriptionData,
    subscriptionRefetch: subscriptionQuery.refetch,
    subscriptionIsPending: subscriptionQuery.isPending,
    subscriptionError: subscriptionQuery.isError,


    paymentHistory,
    paymentHistoryRefetch: paymentHistoryQuery.refetch,
    paymentHistoryPending: paymentHistoryQuery.isPending,

    systemSettings,
    systemSettingsRefetch: systemSettingsQuery.refetch,

    unreadSupportCount,
    setUnreadSupportCount,
  }), [
    adminLogedIn,
    allClassrooms,
    adminUsersData,
    userQuery.refetch,
    userQuery.isPending,
    allLevels,
    levelQuery.refetch,
    levelQuery.isPending,
    allSubjects,
    subjectQuery.refetch,
    subjectQuery.isPending,
    classroomQuery.refetch,
    classroomQuery.isPending,
    selectedTeacherSubjects,
    subscriptionData,
    subscriptionQuery.refetch,
    subscriptionQuery.isPending,
    subscriptionQuery.isError,
    paymentHistory,
    paymentHistoryQuery.refetch,
    paymentHistoryQuery.isPending,
    systemSettings,
    systemSettingsQuery.refetch,
    unreadSupportCount,
  ]);


  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
