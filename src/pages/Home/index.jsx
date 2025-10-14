import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AiChat } from "@/components/AiChat";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { ScriptForm } from "@/components/Card/ScriptForm";
import { CronogramaPage } from "@/components/CronogramaPage"; // 1. Importar a nova página
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useEffect, useState } from "react";

// Componentes de carregamento (ScriptViewLoader, ScriptEditLoader) permanecem os mesmos...
function ScriptViewLoader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scriptData, setScriptData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScript = async () => {
      setLoading(true);
      const scriptRef = doc(db, "pautas", id);
      const docSnap = await getDoc(scriptRef);
      if (docSnap.exists()) {
        setScriptData({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    if (id) fetchScript();
  }, [id]);

  if (loading) return <div className="p-8">Carregando roteiro...</div>;
  if (!scriptData) return <div className="p-8">Roteiro não encontrado.</div>;

  return (
    <ScriptForm
      mode="view"
      initialData={scriptData}
      onCancel={() => navigate("/home/dashboard")} // Volta para o dashboard
    />
  );
}

function ScriptEditLoader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scriptData, setScriptData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScript = async () => {
      setLoading(true);
      const scriptRef = doc(db, "pautas", id);
      const docSnap = await getDoc(scriptRef);
      if (docSnap.exists()) {
        setScriptData({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    if (id) fetchScript();
  }, [id]);

  if (loading) return <div className="p-8">Carregando roteiro...</div>;
  if (!scriptData) return <div className="p-8">Roteiro não encontrado.</div>;

  return (
    <ScriptForm
      mode="edit"
      initialData={scriptData}
      onCancel={() => navigate("/home/dashboard")}
      onSave={() => navigate("/home/dashboard")}
    />
  );
}

// --- Componente de Conteúdo Principal ---
function MainContent() {
  const navigate = useNavigate();

  const handleViewScript = (scriptData) => {
    navigate(`/home/script/view/${scriptData.id}`);
  };

  const handleEditScript = (scriptData) => {
    navigate(`/home/script/edit/${scriptData.id}`);
  };

  return (
    <main className="flex-1 bg-gray-50 overflow-y-auto transition-all duration-300 ease-in-out">
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              onViewScript={handleViewScript}
              onEditScript={handleEditScript}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              onViewScript={handleViewScript}
              onEditScript={handleEditScript}
            />
          }
        />
        <Route
          path="/create-script"
          element={
            <ScriptForm
              mode="create"
              onCancel={() => navigate("/home/dashboard")}
              onSave={() => navigate("/home/dashboard")}
            />
          }
        />
        <Route path="/ai-chat" element={<AiChat />} />
        <Route path="/script/view/:id" element={<ScriptViewLoader />} />
        <Route path="/script/edit/:id" element={<ScriptEditLoader />} />

        {/* 2. Adicionar a nova rota para o cronograma */}
        <Route path="/schedule" element={<CronogramaPage />} />
      </Routes>
    </main>
  );
}

// --- Componente Principal da Página Home ---
export function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <MainContent />
      </div>
    </SidebarProvider>
  );
}
