import { Route, Switch, Redirect } from "wouter";
import { AuthContext, useAuthProvider, useAuth } from "@/_core/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import CoursesPage from "@/pages/CoursesPage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import ActionItemsPage from "@/pages/ActionItemsPage";
import ReviewsPage from "@/pages/ReviewsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Route>
      <Route path="/register">
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/courses">
        <ProtectedRoute>
          <Layout>
            <CoursesPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/courses/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout>
              <CourseDetailPage id={Number(params.id)} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/action-items">
        <ProtectedRoute>
          <Layout>
            <ActionItemsPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/reviews">
        <ProtectedRoute>
          <Layout>
            <ReviewsPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <Layout>
            <AnalyticsPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <AppRoutes />
      <Toaster />
    </AuthContext.Provider>
  );
}
