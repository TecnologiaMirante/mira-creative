import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Tv,
} from "lucide-react";

import { db } from "../../../firebaseClient";
import { useUserCache } from "@/context/UserCacheContext";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "../LoadingOverlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "../ui/tooltip";
import { EventCard } from "./EventCard";
import { SafeGetDate } from "./SafeGetDate";
import { getProgramConfig, getStatusConfig } from "@/lib/utils";
import "./CronogramaPage.css";

export function CronogramaPage() {
  const [allScripts, setAllScripts] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [loadingPautas, setLoadingPautas] = useState(true);
  const [loadingProgramas, setLoadingProgramas] = useState(true);
  const [viewType, setViewType] = useState("pautas");
  const [dateFilter, setDateFilter] = useState("exibicao");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState("");

  const isLoading = viewType === "pautas" ? loadingPautas : loadingProgramas;
  const calendarRef = useRef(null);
  const { getUserById } = useUserCache();

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

  useEffect(() => {
    const q = query(
      collection(db, "programas"),
      where("isVisible", "==", true),
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

  const filteredEvents = useMemo(() => {
    if (viewType === "pautas") {
      return allScripts
        .filter((script) => {
          if (programFilter !== "all") {
            let nomeRealPrograma = "Programa não vinculado";
            if (script.programaId) {
              const prog = allPrograms.find((p) => p.id === script.programaId);
              if (prog) nomeRealPrograma = prog.nome;
            } else if (script.programa && script.programa !== "—") {
              nomeRealPrograma = script.programa;
            }

            if (programFilter === "Especial") {
              if (!nomeRealPrograma.startsWith("Especial")) return false;
            } else if (nomeRealPrograma !== programFilter) {
              return false;
            }
          }

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

    if (dateFilter === "gravacao") return [];

    return allPrograms
      .filter((prog) => {
        if (programFilter !== "all") {
          if (programFilter === "Especial") {
            if (!prog.nome.startsWith("Especial")) return false;
          } else if (prog.nome !== programFilter) {
            return false;
          }
        }

        if (statusFilter !== "all" && prog.status !== statusFilter) {
          return false;
        }

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
  }, [
    allPrograms,
    allScripts,
    dateFilter,
    programFilter,
    statusFilter,
    viewType,
  ]);

  const renderEventContent = useCallback(
    (eventInfo) => (
      <EventCard
        eventInfo={eventInfo}
        allPrograms={allPrograms}
        getUserById={getUserById}
      />
    ),
    [allPrograms, getUserById],
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
    if (!api) return;

    const currentDate = api.getDate();
    const month = currentDate.toLocaleString("pt-BR", { month: "long" });
    const year = currentDate.getFullYear();
    const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
    setCalendarTitle(`${monthCapitalized}/${year}`);
  }, []);

  if (isLoading) return <LoadingOverlay message="Carregando cronograma..." />;

  return (
    <TooltipProvider>
      <div className="cronograma-page flex min-h-screen flex-col gap-5 bg-slate-50/50 p-4 md:gap-6 md:p-6">
        <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.14),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.97))] p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)] md:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-700">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Planejamento
                </span>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                    {calendarTitle}
                  </h1>
                  <p className="max-w-3xl text-sm text-slate-600 md:text-base">
                    Acompanhe exibições, gravações e programas em uma visão mais
                    clara para operação e reuniões editoriais.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-2xl border border-slate-200/80 bg-white/85 p-1 shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={goToPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 rounded-xl px-3 text-sm"
                    onClick={goToToday}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center rounded-2xl border border-slate-200/80 bg-white/85 p-1 shadow-sm">
                  <button
                    onClick={() => changeView("timeGridWeek")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      view === "timeGridWeek"
                        ? "bg-slate-900 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => changeView("dayGridMonth")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      view === "dayGridMonth"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Mês
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[auto,1fr]">
              <div className="flex w-full rounded-2xl border border-slate-200/80 bg-white/85 p-1 shadow-sm xl:w-fit">
                <button
                  onClick={() => setViewType("pautas")}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition xl:flex-none ${
                    viewType === "pautas"
                      ? "bg-slate-900 text-white"
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
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition xl:flex-none ${
                    viewType === "programas"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Programas
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-3 shadow-sm">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11 border-0 bg-transparent px-0 shadow-none focus:ring-0">
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
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-3 shadow-sm">
                  <Tv className="h-4 w-4 text-slate-400" />
                  <Select
                    value={programFilter}
                    onValueChange={setProgramFilter}
                  >
                    <SelectTrigger className="h-11 border-0 bg-transparent px-0 shadow-none focus:ring-0">
                      <SelectValue placeholder="Programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Programas</SelectItem>
                      <SelectItem value="Daqui">Daqui</SelectItem>
                      <SelectItem value="Especial">Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-3 shadow-sm">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                    disabled={viewType === "programas"}
                  >
                    <SelectTrigger className="h-11 border-0 bg-transparent px-0 shadow-none focus:ring-0">
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
        </div>

        <div className="min-h-[560px] flex-grow overflow-hidden rounded-[32px] border border-slate-200/80 bg-white p-2 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] md:h-[calc(100vh-290px)]">
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
