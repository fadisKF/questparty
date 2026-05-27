import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/router/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ShopPage } from '@/pages/ShopPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { KanbanPage } from '@/pages/KanbanPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <PublicOnlyRoute>
              <AuthLayout />
            </PublicOnlyRoute>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="sprints/:sprintId/kanban" element={<KanbanPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="users/:userId" element={<UserProfilePage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
