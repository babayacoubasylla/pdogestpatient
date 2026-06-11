import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { DataProvider } from "./context/DataContext";
import { ToastContainer } from "./components/NotificationCenter";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { PreEnregistrement } from "./pages/PreEnregistrement";
import { FluxJour } from "./pages/FluxJour";
import { Patients } from "./pages/Patients";
import { PatientDetail } from "./pages/PatientDetail";
import { Vitals } from "./pages/Vitals";
import { Alerts } from "./pages/Alerts";
import { Consultations } from "./pages/Consultations";
import { Stats } from "./pages/Stats";
import { UsersAdmin } from "./pages/UsersAdmin";
import { Archives } from "./pages/Archives";
import { Integration } from "./pages/Integration";
import { CarnetDigital } from "./pages/CarnetDigital";
import { Audit } from "./pages/Audit";
import { PatientCarnetPublic } from "./pages/PatientCarnetPublic";
import { ActesSpeciaux } from "./pages/ActesSpeciaux";
import { RendezVous } from "./pages/RendezVous";
import type { PageId } from "./types";

function AppShell() {
  const { user } = useAuth();
  const [page, setPage] = useState<PageId>("dashboard");
  // CORRECTION : Autorise les types string et number pour les IDs synchronisés SGH
  const [selectedPatientId, setSelectedPatientId] = useState<string | number | null>(null);

  if (!user) return <Login />;

  const handleNavigate = (p: PageId, payload?: any) => {
    setPage(p);
    // CORRECTION : Suppression du blocage strict "typeof payload === 'number'"
    if (p === "patient-detail" && payload !== undefined) {
      setSelectedPatientId(payload);
    }
  };

  return (
    <>
      <Layout currentPage={page} onNavigate={handleNavigate}>
        <PageRouter page={page} selectedPatientId={selectedPatientId} onNavigate={handleNavigate} />
      </Layout>
      <ToastContainer />
    </>
  );
}

function PageRouter({ page, selectedPatientId, onNavigate }: any) {
  const { user } = useAuth();
  if (!user) return null;

  const accessible: Record<string, string[]> = {
    "dashboard": ["medecin", "admin"],
    "pre-enregistrement": ["secretaire", "admin"],
    "actes-speciaux": ["secretaire", "admin", "archiviste"],
    "flux-jour": ["secretaire", "medecin", "admin", "infirmier", "archiviste"],
    "patients": ["secretaire", "medecin", "admin", "infirmier", "archiviste"],
    "patient-detail": ["secretaire", "medecin", "admin", "infirmier", "archiviste"],
    "carnet-digital": ["medecin", "admin", "archiviste"],
    "constantes": ["infirmier", "medecin", "admin"],
    "consultations": ["medecin", "admin"],
    "alertes": ["medecin", "admin", "infirmier"],
    "stats": ["admin"],
    "users": ["admin"],
    "archives": ["archiviste", "admin", "medecin"],
    "integration": ["admin"],
    "audit": ["admin"],
    "rendez-vous": ["secretaire", "medecin", "admin"],
  };

  let currentPage = page;
  if (!accessible[page]?.includes(user.role)) {
    if (user.role === "secretaire") currentPage = "pre-enregistrement";
    else if (user.role === "infirmier") currentPage = "flux-jour";
    else if (user.role === "archiviste") currentPage = "archives";
    else if (user.role === "medecin") currentPage = "flux-jour";
    else currentPage = "dashboard";
  }

  switch (currentPage) {
    case "dashboard": return <Dashboard onNavigate={onNavigate} />;
    case "pre-enregistrement": return <PreEnregistrement onNavigate={onNavigate} />;
    case "actes-speciaux": return <ActesSpeciaux onNavigate={onNavigate} />;
    case "flux-jour": return <FluxJour onNavigate={onNavigate} />;
    case "patients": return <Patients onNavigate={onNavigate} />;
    case "patient-detail":
      return selectedPatientId
        ? <PatientDetail patientId={selectedPatientId} onNavigate={onNavigate} />
        : <Patients onNavigate={onNavigate} />;
    case "carnet-digital": return <CarnetDigital onNavigate={onNavigate} />;
    case "constantes": return <Vitals />;
    case "alertes": return <Alerts />;
    case "consultations": return <Consultations onNavigate={onNavigate} />;
    case "stats": return <Stats />;
    case "users": return <UsersAdmin />;
    case "archives": return <Archives onNavigate={onNavigate} />;
    case "integration": return <Integration />;
    case "audit": return <Audit />;
    case "rendez-vous": return <RendezVous onNavigate={onNavigate} />;
    default: return <Dashboard onNavigate={onNavigate} />;
  }
}

function AppWithProviders() {
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique : carnet digital accessible via QR code SANS connexion */}
        <Route path="/public/patient/:nip" element={<PatientCarnetPublic />} />
        {/* Toutes les autres routes : application clinique authentifiée */}
        <Route path="/*" element={<AppWithProviders />} />
      </Routes>
    </BrowserRouter>
  );
}