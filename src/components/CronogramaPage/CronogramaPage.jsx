// /src/components/CronogramaPage/index.jsx

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useUserCache } from "@/context/UserCacheContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  ChevronLeft,
  ChevronRight,
  Tv,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import "./CronogramaPage.css";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "../ui/tooltip";

import { getProgramConfig, getStatusConfig } from "@/lib/utils";
import { LoadingOverlay } from "../LoadingOverlay";
import { EventCard } from "./EventCard";
import { SafeGetDate } from "./SafeGetDate";

export function CronogramaPage() {
  const [allScripts, setAllScripts] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [loadingPautas, setLoadingPautas] = useState(true);
  const [loadingProgramas, setLoadingProgramas] = useState(true);

  // Filtros
  const [viewType, setViewType] = useState("pautas");
  const [dateFilter, setDateFilter] = useState("exibicao");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState("");

  const isLoading = viewType === "pautas" ? loadingPautas : loadingProgramas;
  const calendarRef = useRef(null);
  const { getUserById } = useUserCache();

  // 1. Busca PAUTAS
  useEffect(() => {
    const q = query(collection(db, "pautas"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scriptsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "pauta",
      }));
      setAllScripts(scriptsData);
      setLoadingPautas(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Busca PROGRAMAS
  useEffect(() => {
    const q = query(
      collection(db, "programas"),
      where("isVisible", "==", true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const programsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "programa",
      }));
      setAllPrograms(programsData);
      setLoadingProgramas(false);
    });
    return () => unsubscribe();
  }, []);

  // Lógica de Filtragem e Mapeamento
  const filteredEvents = useMemo(() => {
    // --- PAUTAS ---
    if (viewType === "pautas") {
      return allScripts
        .filter((script) => {
          // 1. FILTRO DE PROGRAMA
          if (programFilter !== "all") {
            // Descobre o nome real do programa usando o ID
            let nomeRealPrograma = "Programa não vinculado";

            if (script.programaId) {
              const prog = allPrograms.find((p) => p.id === script.programaId);
              if (prog) nomeRealPrograma = prog.nome;
            } else if (script.programa && script.programa !== "—") {
              nomeRealPrograma = script.programa;
            }

            // Lógica de Comparação
            if (programFilter === "Especial") {
              // Se o filtro for "Especial", aceita "Especial - Carnaval", "Especial - Natal", etc.
              if (!nomeRealPrograma.startsWith("Especial")) return false;
            } else {
              // Para outros (ex: "Daqui"), comparação exata ou parcial
              if (nomeRealPrograma !== programFilter) return false;
            }
          }

          // 2. Filtro de Status
          if (statusFilter !== "all" && script.status !== statusFilter) {
            return false;
          }
          return true;
        })
        .flatMap((script) => {
          const events = [];
          const styles = getStatusConfig(script.status);

          const sharedProps = {
            id: script.id,
            title: script.titulo || script.pauta,
            extendedProps: { ...script, eventType: "pauta", styles },
          };

          if (dateFilter === "gravacao") {
            const dateStr = SafeGetDate(script.dataGravacao);
            if (dateStr) {
              events.push({
                ...sharedProps,
                title: `[G] ${script.titulo}`,
                start: `${dateStr}T08:00:00`,
              });
            }
          }

          if (dateFilter === "exibicao") {
            const dateStr = SafeGetDate(script.dataExibicao);
            if (dateStr) {
              events.push({
                ...sharedProps,
                title: `[E] ${script.titulo}`,
                start: `${dateStr}T12:00:00`,
              });
            }
          }
          return events;
        });
    }

    // --- PROGRAMAS  ---
    if (viewType === "programas") {
      if (dateFilter === "gravacao") return [];

      return allPrograms
        .filter((prog) => {
          if (programFilter !== "all") {
            if (programFilter === "Especial") {
              if (!prog.nome.startsWith("Especial")) return false;
            } else {
              if (prog.nome !== programFilter) return false;
            }
          }
          if (statusFilter !== "all" && prog.status !== statusFilter)
            return false;
          return true;
        })
        .flatMap((prog) => {
          const dateStr = SafeGetDate(prog.dataExibicao);
          if (!dateStr) return [];

          const styles = getProgramConfig(prog.nome);

          return [
            {
              id: prog.id,
              title: prog.nome,
              start: `${dateStr}T12:00:00`,
              extendedProps: { ...prog, eventType: "programa", styles },
            },
          ];
        });
    }
    return [];
  }, [
    allScripts,
    allPrograms,
    viewType,
    dateFilter,
    programFilter,
    statusFilter,
  ]);

  const renderEventContent = useCallback(
    (eventInfo) => {
      return (
        <EventCard
          eventInfo={eventInfo}
          allPrograms={allPrograms}
          getUserById={getUserById}
        />
      );
    },
    [allPrograms, getUserById]
  );

  const goToNext = () => calendarRef.current?.getApi().next();
  const goToPrev = () => calendarRef.current?.getApi().prev();
  const goToToday = () => calendarRef.current?.getApi().today();
  const changeView = (viewName) => {
    setView(viewName);
    calendarRef.current?.getApi().changeView(viewName);
  };

  const updateTitle = useCallback((args) => {
    const api = args?.view?.calendar || calendarRef.current?.getApi();

    if (api) {
      const currentDate = api.getDate();

      const month = currentDate.toLocaleString("pt-BR", { month: "long" });
      const year = currentDate.getFullYear();
      const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);

      setCalendarTitle(`${monthCapitalized}/${year}`);
    }
  }, []);

  if (isLoading) return <LoadingOverlay message="Carregando cronograma..." />;

  return (
    <TooltipProvider>
      <div className="cronograma-page min-h-screen bg-slate-50/50 p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          {/* Controls (Top Row) */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center bg-slate-100 rounded-lg p-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToPrev}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="ghost"
                  className="h-8 px-3 text-xs font-medium"
                  onClick={goToToday}
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToNext}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
              <h1 className="text-lg md:text-2xl font-bold text-slate-800 capitalize truncate text-right md:text-left">
                {calendarTitle}
              </h1>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 md:ml-auto">
              <button
                onClick={() => changeView("timeGridWeek")}
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  view === "timeGridWeek"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => changeView("dayGridMonth")}
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  view === "dayGridMonth"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-slate-500"
                }`}
              >
                Mês
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 md:hidden"></div>

          {/* Controls (Bottom Row: Filters) */}
          <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
            <div className="flex bg-slate-100 p-1 rounded-lg w-full lg:w-auto">
              <button
                onClick={() => setViewType("pautas")}
                className={`cursor-pointer flex-1 lg:flex-none px-4 py-1.5 text-xs md:text-sm font-semibold rounded-md transition-all ${
                  viewType === "pautas"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Pautas
              </button>
              <button
                onClick={() => {
                  setViewType("programas");
                  setDateFilter("exibicao");
                }}
                className={`cursor-pointer flex-1 lg:flex-none px-4 py-1.5 text-xs md:text-sm font-semibold rounded-md transition-all ${
                  viewType === "programas"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Programas
              </button>
            </div>

            <div className="grid grid-cols-2 md:flex gap-2 w-full lg:w-auto lg:ml-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px] h-9 text-xs">
                  <Filter className="w-3 h-3 mr-2 opacity-50" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Em Produção">Em Produção</SelectItem>
                  <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                  <SelectItem value="Exibido">Exibido</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-9 text-xs">
                  <Tv className="w-3 h-3 mr-2 opacity-50" />
                  <SelectValue placeholder="Programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Programas</SelectItem>
                  <SelectItem value="Daqui">Daqui</SelectItem>
                  <SelectItem value="Especial">Especial</SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-2 md:col-span-1">
                <Select
                  value={dateFilter}
                  onValueChange={setDateFilter}
                  disabled={viewType === "programas"}
                >
                  <SelectTrigger className="w-full md:w-[140px] h-9 text-xs">
                    <CalendarIcon className="w-3 h-3 mr-2 opacity-50" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exibicao">Exibição</SelectItem>
                    <SelectItem value="gravacao">Gravação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="flex-grow bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-1 min-h-[500px] h-[calc(100vh-280px)]">
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={false}
            events={filteredEvents}
            locale={ptBrLocale}
            allDaySlot={true}
            height="100%"
            eventContent={renderEventContent}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            datesSet={updateTitle}
            viewDidMount={updateTitle}
            dayMaxEvents={3}
            moreLinkContent={(args) => `+${args.num}`}
            windowResizeDelay={0}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
