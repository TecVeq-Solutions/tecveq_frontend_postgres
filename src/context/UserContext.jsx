import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAdmin } from './AdminContext';
import { useTeacher } from './TeacherContext';
import { useStudent } from './StudentContext';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {

  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("tcauser")));
  
  const [socketContext, setSocketContext] = useState(null);

  const addUserToLS = async () => {
    localStorage.setItem("tcauser", JSON.stringify(userData));
  };
  const { setAdminLogedIn } = useAdmin();
  const { setTeacherLogedIn } = useTeacher();
  const { setStudentLogedIn } = useStudent();

  useEffect(() => {
    if (userData) {
      localStorage.setItem("tcauser", JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    if (userData) {
      if (userData.userType == "admin") {
        setAdminLogedIn(true);
      }
      if (userData.userType == "student") {
        setStudentLogedIn(true);
      }
      if (userData.userType == "teacher") {
        setTeacherLogedIn(true);
      }
    }
  }, [])

  return (
    <UserContext.Provider value={{ userData, setUserData, addUserToLS, socketContext, setSocketContext }}>
      {children}
    </UserContext.Provider>
  );
};
