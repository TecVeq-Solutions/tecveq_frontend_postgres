import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BlurProvider } from './context/BlurContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './context/UserContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminProvider } from './context/AdminContext.jsx'
import { TeacherProvider } from './context/TeacherContext.jsx'
import { StudentProvider } from './context/StudentContext.jsx'
import { SidebarProvider } from './context/SidebarContext.jsx';

import { ParentProvider } from './context/ParentContext.jsx'

const queryClient = new QueryClient({});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminProvider>
          <TeacherProvider>
            <StudentProvider>
              <UserProvider>
                <ParentProvider>
                  <SidebarProvider>
                    <BlurProvider>
                      <App />
                    </BlurProvider>
                  </SidebarProvider>
                </ParentProvider>
              </UserProvider>
            </StudentProvider>
          </TeacherProvider>
        </AdminProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
