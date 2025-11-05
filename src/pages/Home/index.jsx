// /src/pages/Home.jsx

import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AiChat } from "@/components/AiChat";
import { ScriptForm } from "@/components/Card/ScriptForm";
import { CronogramaPage } from "@/components/CronogramaPage";
import { useContext } from "react";
import { Team } from "@/components/Team";
import UserContext from "@/context/UserContext";
import { AccessDenied } from "@/components/AccessDenied";
import { ProgramasListPage } from "@/components/Programas/ProgramasListPage";
import { ProgramaDetailPage } from "@/components/Programas/ProgramaDetailPage";
import { PautaDetailPage } from "@/components/Pautas/PautaDetailPage";
import { PautasListPage } from "@/components/Pautas/PautasListPage";

function MainContent() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 bg-gray-50 overflow-y-auto transition-all duration-300 ease-in-out">
      <Routes>
        {/* --- ROTAS PRINCIPAIS --- */}
        <Route path="/" element={<Navigate to="programas" replace />} />
        <Route
          path="/dashboard"
          element={<Navigate to="programas" replace />}
        />
        <Route path="/programas" element={<ProgramasListPage />} />
        <Route path="/programas/:id" element={<ProgramaDetailPage />} />

        {/* --- ROTAS DE PAUTA --- */}
        <Route path="/pautas" element={<PautasListPage />} />
        <Route
          path="/pautas/create"
          element={
            <ScriptForm
              mode="create"
              onCancel={() => navigate("/home/pautas")}
              onSave={() => navigate("/home/pautas")}
            />
          }
        />
        <Route path="/pautas/:id" element={<PautaDetailPage />} />
        <Route path="/pautas/edit/:id" element={<PautaDetailPage />} />

        {/* --- OUTRAS ROTAS --- */}
        <Route path="/ai-chat" element={<AiChat />} />
        <Route path="/schedule" element={<CronogramaPage />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </main>
  );
}

// --- Componente Principal da Página Home ---
export function Home() {
  const { user } = useContext(UserContext);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        {user?.typeUser !== "user" ? <MainContent /> : <AccessDenied />}
      </div>
    </SidebarProvider>
  );
}
