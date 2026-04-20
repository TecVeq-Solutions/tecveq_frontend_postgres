import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../api/Admin/AdminApi';
import { getAllLevels } from '../api/Admin/LevelsApi';
import { getAllSubjects } from '../api/Admin/SubjectsApi';
import { getAllClassroom } from '../api/Admin/classroomApi';
import axios from 'axios';
import { BACKEND_URL } from '../constants/api';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [allLevels, setAllLevels] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allClassrooms, setAllClassrooms] = useState([]);
  const [selectedTeacherSubjects, setSelectedTeacherSubjects] = useState([]);
  const [adminLogedIn, setAdminLogedIn] = useState(false);

  const [adminUsersData, setAdminUsersdata] = useState({
    allStudents: [],
    allTeachers: [],
    allParents: [],
    allUsers: [],
  });

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

  // Ensure data is refetched when `adminLogedIn` becomes true
  useEffect(() => {
    if (adminLogedIn) {
      userQuery.refetch();
      subjectQuery.refetch();
      levelQuery.refetch();
      classroomQuery.refetch();
    }
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

    allClassrooms,
    classroomsRefetch: classroomQuery.refetch,
    classroomsIsPending: classroomQuery.isPending,

    selectedTeacherSubjects,
    updateTeacherSubjects,
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
  ]);

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
