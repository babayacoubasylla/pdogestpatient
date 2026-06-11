import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { DataProvider } from "./context/DataContext";
import { ToastContainer } from "./components/NotificationCenter";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { PatientDetail } from "./pages/PatientDetail";
import { Vitals } from "./pages/Vitals";
import { Alerts } from "./pages/Alerts";
import { Consultations } from "./pages/Consultations";
import { Stats } from "./pages/Stats";
import { UsersAdmin } from "./pages/UsersAdmin";
import { Integration } from "./pages/Integration";
import { Archives } from "./pages/Archives";
import type { PageId } from "./types";

function AppShell() {
  const { user } = useAuth();
  const [page, setPage] = useState<PageId>("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  if (!user) return <Login />;

  const accessible: Record<string, string[]> = {
    dashboard: ["medecin", "admin"],
    patients: ["infirmier", "medecin", "admin", "gestionnaire"],
    "patient-detail": ["infirmier", "medecin", "admin", "gestionnaire"],
    constantes: ["infirmier", "medecin", "admin"],
    consultations: ["medecin", "admin"],
    alertes: ["medecin", "admin"],
    archives: ["gestionnaire", "admin"],
    stats: ["admin"],
    users: ["admin"],
    integration: ["admin"],
  };

  let currentPage = page;
  if (!accessible[page]?.includes(user.role)) {
    currentPage =
      user.role === "infirmier"
        ? "patients"
        : user.role === "gestionnaire"
        ? "archives"
        : "dashboard";
  }

  const handleNavigate = (p: PageId, payload?: any) => {
    setPage(p);
    if (p === "patient-detail" && typeof payload === "number") {
      setSelectedPatientId(payload);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "patients":
        return <Patients onNavigate={handleNavigate} />;
      case "patient-detail":
        return selectedPatientId ? (
          <PatientDetail patientId={selectedPatientId} onNavigate={handleNavigate} />
        ) : (
          <Patients onNavigate={handleNavigate} />
        );
      case "constantes":
        return <Vitals />;
      case "alertes":
        return <Alerts />;
      case "consultations":
        return <Consultations onNavigate={handleNavigate} />;
      case "stats":
        return <Stats />;
      case "users":
        return <UsersAdmin />;
      case "integration":
        return <Integration />;
      case "archives":
        return <Archives />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </Layout>
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <AppShell />
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
}
