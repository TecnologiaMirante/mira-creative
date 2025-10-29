// /src/components/CronogramaPage/index.jsx

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Tv,
  MapPin,
  Calendar as CalendarIcon,
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
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import { getStatusClasses } from "@/lib/utils";
import { LoadingOverlay } from "../LoadingOverlay";

export function CronogramaPage() {
  const [allScripts, setAllScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("gravacao");
  const [programFilter, setProgramFilter] = useState("all");
  const [view, setView] = useState("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState("");
  const calendarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "pautas"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scriptsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllScripts(scriptsData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredEvents = useMemo(() => {
    return allScripts
      .filter((script) => {
        if (programFilter === "all") return true;
        const program = script.programa || script.program;
        return program === programFilter;
      })
      .flatMap((script) => {
        const events = [];
        const sharedProps = {
          id: script.id,
          title: script.pauta,
          extendedProps: { ...script },
          className: getStatusClasses(script.status),
        };

        if (dateFilter === "gravacao" && script.dataGravacao) {
          events.push({
            ...sharedProps,
            title: `[G] ${script.pauta}`,
            start: `${script.dataGravacao}T07:00:00`,
            end: `${script.dataGravacao}T22:00:00`,
          });
        }

        if (dateFilter === "exibicao" && script.dataExibicao) {
          events.push({
            ...sharedProps,
            title: `[E] ${script.pauta}`,
            start: `${script.dataExibicao}T07:00:00`,
            end: `${script.dataExibicao}T22:00:00`,
          });
        }

        return events;
      });
  }, [allScripts, dateFilter, programFilter]);

  const handleEventClick = useCallback(
    (clickInfo) => {
      navigate(`/home/script/view/${clickInfo.event.id}`);
    },
    [navigate]
  );

  const renderEventContent = (eventInfo) => {
    const { extendedProps } = eventInfo.event;

    return (
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>
          <div className="fc-event-main-frame w-full overflow-hidden whitespace-nowrap text-ellipsis">
            <div className="fc-event-title-container">
              <div className="fc-event-title">{eventInfo.event.title}</div>
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent
          className={`${getStatusClasses(
            extendedProps.status
          )} w-80 max-w-[calc(100vw_-_20px)] p-0 border border-gray-200 shadow-lg text-gray-900 `}
          side="top"
          align="center"
        >
          {/* Header do Tooltip */}
          <div className="px-4 py-3 border-b border-gray-500 flex justify-between items-start">
            <h3 className="font-bold text-base  text-gray-900 leading-[1.4]">
              {extendedProps.pauta}
            </h3>
            <Badge className={getStatusClasses(extendedProps.status)}>
              {extendedProps.status}
            </Badge>
          </div>

          {/* Conteúdo do Tooltip */}
          <div className="px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <CalendarIcon className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Programa:</strong>{" "}
                {extendedProps.programa || extendedProps.program}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Produtor:</strong> {extendedProps.produtor}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <Tv className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Apresentador:</strong> {extendedProps.apresentador}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Local:</strong> {extendedProps.cidade} -{" "}
                {extendedProps.bairro}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  const goToNext = () => calendarRef.current?.getApi().next();
  const goToPrev = () => calendarRef.current?.getApi().prev();
  const goToToday = () => calendarRef.current?.getApi().today();
  const changeView = (viewName) => {
    setView(viewName);
    calendarRef.current?.getApi().changeView(viewName);
  };
  const updateTitle = useCallback(() => {
    if (calendarRef.current) {
      setCalendarTitle(calendarRef.current.getApi().view.title);
    }
  }, []);

  if (isLoading) {
    return (
      <LoadingOverlay message={"Carregando cronograma..."} success={false} />
    );
  }

  return (
    <TooltipProvider>
      <div className="cronograma-page">
        {/* HEADER */}
        <div className="calendar-header">
          <div className="flex items-center gap-4">
            <div className="month-navigation">
              <Button variant="outline" size="icon" onClick={goToPrev}>
                <ChevronLeft size={20} />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={goToNext}>
                <ChevronRight size={20} />
              </Button>
            </div>
            <h1 className="page-title">{calendarTitle}</h1>
          </div>
          <div className="header-controls">
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Programas</SelectItem>
                <SelectItem value="Daqui">Daqui</SelectItem>
                <SelectItem value="Especial">Especial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gravacao">Data de Gravação</SelectItem>
                <SelectItem value="exibicao">Data de Exibição</SelectItem>
              </SelectContent>
            </Select>
            <div className="view-toggles">
              <Button
                variant={view === "timeGridDay" ? "default" : "outline"}
                onClick={() => changeView("timeGridDay")}
              >
                Dia
              </Button>
              <Button
                variant={view === "timeGridWeek" ? "default" : "outline"}
                onClick={() => changeView("timeGridWeek")}
              >
                Semana
              </Button>
              <Button
                variant={view === "dayGridMonth" ? "default" : "outline"}
                onClick={() => changeView("dayGridMonth")}
              >
                Mês
              </Button>
            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={false}
            events={filteredEvents}
            locale={ptBrLocale}
            allDaySlot={view === "dayGridMonth"}
            height="80vh"
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            slotMaxTime="22:00:00"
            datesSet={updateTitle}
            viewDidMount={updateTitle}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
