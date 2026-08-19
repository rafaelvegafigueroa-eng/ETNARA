import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppSwitcher } from "./navigation/AppSwitcher";
import { FamilyTabBar } from "./navigation/FamilyTabBar";
import { ShiftProvider } from "./pages/caregiver/shiftState";
import { OrgTypeProvider } from "./pages/agency/orgTypeState";
import { CareEventsProvider } from "./state/careEventsState";

import { FamilyTodayPage } from "./pages/family/FamilyTodayPage";
import {
  FamilyHistoryPage,
  FamilyMessagesPage,
  FamilyProfilePage,
} from "./pages/family/FamilySupportPages";
import { FamilyTrustCenterPage } from "./pages/family/FamilyTrustCenterPage";
import { CaregiverProfilePage } from "./pages/CaregiverProfilePage";

import { CaregiverMyShiftPage } from "./pages/caregiver/CaregiverMyShiftPage";
import { CaregiverCheckInPage } from "./pages/caregiver/CaregiverCheckInPage";
import { CaregiverActiveShiftPage } from "./pages/caregiver/CaregiverActiveShiftPage";
import { CaregiverMealFormPage } from "./pages/caregiver/CaregiverMealFormPage";
import { CaregiverHydrationFormPage } from "./pages/caregiver/CaregiverHydrationFormPage";
import { CaregiverToiletingFormPage } from "./pages/caregiver/CaregiverToiletingFormPage";
import { CaregiverMobilityFormPage } from "./pages/caregiver/CaregiverMobilityFormPage";
import { CaregiverActivityFormPage } from "./pages/caregiver/CaregiverActivityFormPage";
import { CaregiverMoodFormPage } from "./pages/caregiver/CaregiverMoodFormPage";
import { CaregiverNoteFormPage } from "./pages/caregiver/CaregiverNoteFormPage";
import { CaregiverPhotoFormPage } from "./pages/caregiver/CaregiverPhotoFormPage";
import { CaregiverObservationPage } from "./pages/caregiver/CaregiverObservationPage";
import {
  CaregiverIncidentPage,
  CaregiverShiftCompletePage,
} from "./pages/caregiver/CaregiverIncidentPages";

import { AgencyDashboardPage } from "./pages/agency/AgencyDashboardPage";
import { AgencyResidentProfilePage } from "./pages/agency/AgencyResidentProfilePage";
import { AgencyComplianceCenterPage } from "./pages/agency/AgencyComplianceCenterPage";

function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function FamilyLayout() {
  return (
    <MobileFrame>
      <div style={{ flex: 1, paddingBottom: 8 }}>
        <Outlet />
      </div>
      <FamilyTabBar />
    </MobileFrame>
  );
}

function CaregiverLayout() {
  return (
    <MobileFrame>
      <Outlet />
    </MobileFrame>
  );
}

function AgencyLayout() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppSwitcher />
      <ShiftProvider>
        <CareEventsProvider>
        <OrgTypeProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/family" replace />} />

            {/* ---- App Familiar ---- */}
            <Route path="/family" element={<FamilyLayout />}>
              <Route index element={<FamilyTodayPage />} />
              <Route path="historial" element={<FamilyHistoryPage />} />
              <Route path="mensajes" element={<FamilyMessagesPage />} />
              <Route path="confianza" element={<FamilyTrustCenterPage />} />
              <Route path="perfil" element={<FamilyProfilePage />} />
              <Route
                path="cuidador/:caregiverId"
                element={<CaregiverProfilePage backTo="/family/confianza" />}
              />
            </Route>

            {/* ---- App Cuidador ---- */}
            <Route path="/caregiver" element={<CaregiverLayout />}>
              <Route index element={<CaregiverMyShiftPage />} />
              <Route path="check-in" element={<CaregiverCheckInPage />} />
              <Route path="turno-activo" element={<CaregiverActiveShiftPage />} />
              <Route path="registrar/comida" element={<CaregiverMealFormPage />} />
              <Route path="registrar/agua" element={<CaregiverHydrationFormPage />} />
              <Route path="registrar/bano" element={<CaregiverToiletingFormPage />} />
              <Route path="registrar/movilidad" element={<CaregiverMobilityFormPage />} />
              <Route path="registrar/actividad" element={<CaregiverActivityFormPage />} />
              <Route path="registrar/animo" element={<CaregiverMoodFormPage />} />
              <Route path="registrar/nota" element={<CaregiverNoteFormPage />} />
              <Route path="registrar/foto" element={<CaregiverPhotoFormPage />} />
              <Route path="observacion" element={<CaregiverObservationPage />} />
              <Route path="incidente" element={<CaregiverIncidentPage />} />
              <Route path="turno-completado" element={<CaregiverShiftCompletePage />} />
            </Route>

            {/* ---- Portal Agencia ---- */}
            <Route path="/agency" element={<AgencyLayout />}>
              <Route index element={<AgencyDashboardPage />} />
              <Route path="residentes/:residentId" element={<AgencyResidentProfilePage />} />
              <Route path="cumplimiento" element={<AgencyComplianceCenterPage />} />
              <Route
                path="cuidadores/:caregiverId"
                element={<CaregiverProfilePage backTo="/agency/cumplimiento" />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/family" replace />} />
          </Routes>
        </OrgTypeProvider>
        </CareEventsProvider>
      </ShiftProvider>
    </BrowserRouter>
  );
}
