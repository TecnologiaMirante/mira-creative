import {
  ChevronLeft,
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
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import UserContext from "../../context/UserContext";
import Modal from "react-modal";
import { Logout } from "../../components/Logout";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { auth } from "../../../firebaseClient";
import { signOut } from "firebase/auth";
import { customStylesModal } from "@/lib/utils";
import { NotificationCenter } from "../NotificationsCenter/NotificationCenter";

const firebaseLogout = async () => {
  await signOut(auth);
};

const SidebarToggle = () => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute -right-4 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 rounded-full border border-white/70 bg-white/85 text-slate-700 shadow-lg backdrop-blur lg:flex"
      onClick={toggleSidebar}
    >
      <ChevronLeft
        className={`h-4 w-4 transition-transform duration-700 ${
          isCollapsed ? "rotate-180" : ""
        }`}
      />
    </Button>
  );
};

const navItemClass = (isCollapsed, isActive) =>
  `flex items-center w-full gap-3 px-3 py-3 text-left rounded-2xl transition-all duration-300 ${
    isCollapsed ? "justify-center" : "justify-start"
  } ${
    isActive
      ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-primary-foreground shadow-[0_20px_30px_-20px_rgba(34,211,238,0.9)]"
      : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-accent-foreground"
  }`;

const SidebarContents = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useContext(UserContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  const mainMenuItems = [
    { title: "Programas", icon: HomeIcon, id: "programas" },
    { title: "Pautas", icon: FileText, id: "pautas" },
    { title: "Pergunte ao Daqui", icon: MessageCircle, id: "ai-chat" },
  ];

  const toolsMenuItems = [
    { title: "Equipe", icon: Users, id: "team" },
    { title: "Cronograma", icon: Calendar, id: "cronograma" },
    { title: "Dashboard", icon: BarChart3, id: "dashboard" },
  ];

  return (
    <>
      <SidebarToggle />
      <SidebarHeader className="relative flex items-center justify-center gap-3 border-b border-sidebar-border/70 py-5">
        <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-[0_16px_30px_-18px_rgba(59,130,246,0.9)]">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>

        <div
          className={`overflow-hidden text-center transition-opacity duration-200 ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
        >
          <h1 className="whitespace-nowrap text-xl font-bold tracking-tight text-sidebar-foreground">
            Mira Creative
          </h1>
          <p className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.24em] text-slate-300/85">
            Produção Audiovisual
          </p>
        </div>

        {!isCollapsed && (
          <div className="flex-shrink-0">
            <NotificationCenter />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {!isCollapsed && (
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/70">
            Principal
          </SidebarGroupLabel>
        )}
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link
                to={`/home/${item.id}`}
                className={navItemClass(
                  isCollapsed,
                  location.pathname.startsWith(`/home/${item.id}`) ||
                    (location.pathname === "/home" && item.id === "programas"),
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={
                    isCollapsed ? "sr-only" : "font-medium whitespace-nowrap"
                  }
                >
                  {item.title}
                </span>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {!isCollapsed && (
          <SidebarGroupLabel className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/70">
            Ferramentas
          </SidebarGroupLabel>
        )}
        <SidebarMenu>
          {toolsMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link
                to={`/home/${item.id}`}
                className={navItemClass(
                  isCollapsed,
                  location.pathname.startsWith(`/home/${item.id}`),
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={
                    isCollapsed ? "sr-only" : "font-medium whitespace-nowrap"
                  }
                >
                  {item.title}
                </span>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter
        className={`border-t border-sidebar-border/70 transition-all duration-300 ease-in-out ${!isCollapsed && "p-3"}`}
      >
        <div
          className={`flex items-center rounded-[20px] border border-white/10 bg-white/10 backdrop-blur transition-all duration-300 ease-in-out ${!isCollapsed && "p-3 gap-3"}`}
        >
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Foto de perfil"
              className={`rounded-full ring-2 ring-white/20 flex-shrink-0 transition-all duration-300 ease-in-out ${
                isCollapsed ? "h-8 w-8" : "h-9 w-9"
              }`}
            />
          )}

          <div
            className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed ? "w-0 opacity-0" : "opacity-100"
            }`}
          >
            <p className="text-sm font-medium text-sidebar-foreground truncate whitespace-nowrap">
              {user.display_name}
            </p>
            <p className="text-xs text-slate-300/70 truncate whitespace-nowrap">
              {user.email}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={openModal}
            className={`p-0 cursor-pointer flex-shrink-0 text-sidebar-foreground transition-all duration-300 ease-in-out overflow-hidden ${
              isCollapsed ? "w-0 h-0 opacity-0" : "h-8 w-8 opacity-100"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
          </Button>
        </div>
      </SidebarFooter>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStylesModal}
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
    </>
  );
};

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContents />
    </Sidebar>
  );
}
