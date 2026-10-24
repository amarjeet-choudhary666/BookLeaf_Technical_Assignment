import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AuthorDashboard } from "@/pages/author/AuthorDashboard";
import { AuthorBooks } from "@/pages/author/AuthorBooks";
import { AuthorBookDetail } from "@/pages/author/AuthorBookDetail";
import { AuthorTickets } from "@/pages/author/AuthorTickets";
import { CreateTicket } from "@/pages/author/CreateTicket";
import { AuthorTicketDetail } from "@/pages/author/AuthorTicketDetail";
import { AuthorProfile } from "@/pages/author/AuthorProfile";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminTickets } from "@/pages/admin/AdminTickets";
import { AdminTicketDetail } from "@/pages/admin/AdminTicketDetail";
import { AdminAuthors } from "@/pages/admin/AdminAuthors";
import { AdminAuthorDetail } from "@/pages/admin/AdminAuthorDetail";
import { AdminBooks } from "@/pages/admin/AdminBooks";
import { AdminSettings } from "@/pages/admin/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRole="author" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Navigate to="/author/dashboard" replace /> },
              { path: "author/dashboard", element: <AuthorDashboard /> },
              { path: "author/books", element: <AuthorBooks /> },
              { path: "author/books/:bookId", element: <AuthorBookDetail /> },
              { path: "author/tickets", element: <AuthorTickets /> },
              { path: "author/tickets/new", element: <CreateTicket /> },
              { path: "author/tickets/:ticketId", element: <AuthorTicketDetail /> },
              { path: "author/profile", element: <AuthorProfile /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowedRole="admin" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/dashboard" replace /> },
              { path: "admin/dashboard", element: <AdminDashboard /> },
              { path: "admin/tickets", element: <AdminTickets /> },
              { path: "admin/tickets/:ticketId", element: <AdminTicketDetail /> },
              { path: "admin/authors", element: <AdminAuthors /> },
              { path: "admin/authors/:authorId", element: <AdminAuthorDetail /> },
              { path: "admin/books", element: <AdminBooks /> },
              { path: "admin/settings", element: <AdminSettings /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
