// /src/components/AppSidebar.js

import React from "react";

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
  SidebarGroup,
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
import { auth } from "../../../firebase";
import { signOut } from "firebase/auth";
import { customStylesModal } from "@/lib/utils";

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
      className="absolute -right-4 top-1/2 -translate-y-1/2 bg-background hover:bg-accent border rounded-full h-8 w-8 hidden lg:flex"
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
    // { title: "Dashboard", icon: HomeIcon, id: "dashboard" },
    { title: "Programas", icon: HomeIcon, id: "programas" },
    {
      title: "Pautas",
      icon: FileText,
      id: "pautas",
    },

    {
      title: "Pergunte ao Daqui",
      icon: MessageCircle,
      id: "ai-chat",
    },
  ];

  const toolsMenuItems = [
    { title: "Equipe", icon: Users, id: "team" },
    { title: "Cronograma", icon: Calendar, id: "cronograma" },
    { title: "Dashboard", icon: BarChart3, id: "dashboard" },
  ];

  return (
    <>
      <SidebarToggle />
      {/* Sidebar Header*/}
      <SidebarHeader className="p-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>
        <div
          className={`overflow-hidden transition-opacity duration-200 ${
            isCollapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          <h1 className="text-xl font-sans font-bold text-sidebar-foreground whitespace-nowrap">
            Mira Creative
          </h1>
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Produção Audiovisual
          </p>
        </div>
      </SidebarHeader>
      {/* Sidebar content*/}
      <SidebarContent className="px-2 py-4">
        {/* Sidebar Menu PRINCIPAL*/}
        {!isCollapsed && (
          <SidebarGroupLabel className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Principal
          </SidebarGroupLabel>
        )}
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link
                to={`/home/${item.id}`}
                className={`flex items-center w-full gap-3 px-2 py-3 text-left rounded-lg transition-all duration-700 ${
                  isCollapsed ? "justify-center" : "justify-start"
                } ${
                  location.pathname.startsWith(`/home/${item.id}`) ||
                  (location.pathname === "/home" && item.id === "programas")
                    ? "bg-[#2563eb] text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
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

        {/* Sidebar Menu FERRAMENTAS*/}
        {!isCollapsed && (
          <SidebarGroupLabel className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Ferramentas
          </SidebarGroupLabel>
        )}
        <SidebarMenu>
          {toolsMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link
                to={`/home/${item.id}`}
                className={`flex items-center w-full gap-3 px-2 py-3 text-left rounded-lg transition-all duration-700 ${
                  isCollapsed ? "justify-center" : "justify-start"
                } ${
                  location.pathname.startsWith(`/home/${item.id}`)
                    ? "bg-[#2563eb] text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
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
      {/* Sidebar Footer*/}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent">
          <img
            src={user.photoURL}
            alt="Foto de perfil"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div
            className={`flex-1 min-w-0 overflow-hidden transition-opacity duration-700 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            <p className="text-sm font-medium text-sidebar-foreground truncate whitespace-nowrap">
              {user.display_name}
            </p>
            <p className="text-xs text-muted-foreground truncate whitespace-nowrap">
              {user.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={openModal}
            className={`h-8 w-8 p-0 cursor-pointer flex-shrink-0 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            <LogOut className="h-4 w-4" />
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
