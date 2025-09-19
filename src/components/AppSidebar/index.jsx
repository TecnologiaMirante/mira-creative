// /components/AppSidebar/index.jsx

import {
  Home as HomeIcon,
  FileText,
  MessageCircle,
  Users,
  Calendar,
  BarChart3,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import UserContext from "../../context/UserContext";
import { logout as firebaseLogout } from "../../../firebase";
import Modal from "react-modal";
import { Logout } from "../../components/Logout";
import { useNavigate, Link, useLocation } from "react-router-dom";

const mainMenuItems = [
  { title: "Dashboard", icon: HomeIcon, id: "dashboard", badge: null },
  { title: "Criar Roteiro", icon: FileText, id: "create-script", badge: null },
  {
    title: "Pergunte ao Daqui",
    icon: MessageCircle,
    id: "ai-chat",
    badge: "IA",
  },
];

const toolsMenuItems = [
  { title: "Equipe", icon: Users, id: "team", badge: "5" },
  { title: "Cronograma", icon: Calendar, id: "schedule", badge: null },
  { title: "Relatórios", icon: BarChart3, id: "reports", badge: null },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useContext(UserContext);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      width: "90%",
      maxWidth: "400px",
      height: "auto",
      maxHeight: "90vh",
      borderRadius: "0.5rem",
      padding: "1rem",
      overflow: "auto",
    },
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-sans font-bold text-sidebar-foreground">
              Mira Creative
            </h1>
            <p className="text-sm text-muted-foreground">Gestão de Pautas</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <Link
                    to={`/home/${item.id}`}
                    className={`flex items-center w-full justify-start gap-2 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      location.pathname.endsWith(item.id) ||
                      (location.pathname === "/home" && item.id === "dashboard")
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Ferramentas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <Link
                    to={`/home/${item.id}`}
                    className={`flex items-center w-full justify-start gap-2 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      location.pathname.endsWith(item.id)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <img
              src={user.photoURL}
              alt="Foto de perfil do usuário"
              className="rounded-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.display_name}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={openModal}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Menu"
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
      >
        <Logout
          closeModal={closeModal}
          user={user}
          logout={async () => {
            await firebaseLogout();
            contextLogout();
            navigate("/login");
          }}
        />
      </Modal>
    </Sidebar>
  );
}
