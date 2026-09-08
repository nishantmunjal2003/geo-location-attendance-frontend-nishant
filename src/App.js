import { useContext, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Auth from "./components/Auth/Auth";
import Class from "./components/Class/Class";
import SingleClass from "./components/Class/SingleClass";
import Course from "./components/Course/Course";
import SingleCourse from "./components/Course/SingleCourse";
import ErrorPage from "./components/Error/ErrorPage";
import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";
import StudentHome from "./pages/StudentHome";
import AuthContext from "./store/auth-context";
import Message from "./components/Message/Message";
import AdminNavbar from "./components/Navbar/AdminNavbar";
import AdminHome from "./pages/AdminHome";
import UserCourses from "./pages/UserCourses";
import ProfilePage from "./pages/ProfilePage";
import ArchivedCourses from "./components/Course/ArchivedCourses";
import MainLayout from "./components/Layout/MainLayout";
import CourseAttendanceReport from "./pages/CourseAttendanceReport";

const App = () => {
  const authCtx = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const router = createBrowserRouter([
    {
      path: "/",
      element: authCtx.isLoggedIn ? (
        <MainLayout
          navbar={
            authCtx.user?.role === "admin" ? (
              <AdminNavbar setSearchTerm={setSearchTerm} />
            ) : (
              <Navbar />
            )
          }
        >
          {authCtx.user?.role === "teacher" ? (
            <Home />
          ) : authCtx.user?.role === "admin" ? (
            <AdminHome searchTerm={searchTerm} />
          ) : (
            <StudentHome />
          )}
        </MainLayout>
      ) : (
        <Auth />
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "courses",
      element: authCtx.isLoggedIn ? (
        <MainLayout
          navbar={
            authCtx.user?.role === "admin" ? (
              <AdminNavbar setSearchTerm={setSearchTerm} />
            ) : (
              <Navbar />
            )
          }
        >
          {authCtx.user?.role === "admin" ? <UserCourses /> : <Course />}
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
    {
      path: "messages",
      element: authCtx.isLoggedIn ? (
        <MainLayout navbar={<Navbar />}>
          <Message />
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
    {
      path: "course/:courseId",
      element: authCtx.isLoggedIn ? (
        <MainLayout navbar={<Navbar />}>
          <SingleCourse />
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
    {
      path: "classes/:courseId",
      element: authCtx.isLoggedIn ? (
        <MainLayout navbar={<Navbar />}>
          <Class />
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
    {
      path: "classes/:courseId/report",
      element: authCtx.isLoggedIn ? (
        <MainLayout navbar={<Navbar />}>
          <CourseAttendanceReport />
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
    {
      path: "course/:courseId/report",
      element: authCtx.isLoggedIn ? (
        <MainLayout navbar={<Navbar />}>
          <CourseAttendanceReport />
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
    {
      path: "class/:classId",
      element: authCtx.isLoggedIn ? (
        <MainLayout navbar={<Navbar />}>
          <SingleClass />
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
    {
      path: "me",
      element: authCtx.isLoggedIn ? (
        <MainLayout
          navbar={
            authCtx.user?.role === "admin" ? (
              <AdminNavbar setSearchTerm={setSearchTerm} />
            ) : (
              <Navbar />
            )
          }
        >
          <ProfilePage />
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
    {
      path: "archived",
      element: authCtx.isLoggedIn ? (
        <MainLayout navbar={<Navbar />}>
          <ArchivedCourses />
        </MainLayout>
      ) : (
        <Auth />
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
