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
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

// --- HELPERS ---

const getStatusClasses = (status) => {
  const statusMap = {
    Aprovado: "fc-event-aprovado",
    "Em Produção": "fc-event-producao",
    Exibido: "fc-event-exibido",
    "Em Revisão": "fc-event-revisao",
    Cancelado: "fc-event-cancelado",
  };
  return statusMap[status] || "fc-event-default";
};

const getBadgeClasses = (status) => {
  const statusMap = {
    Aprovado: "badge-aprovado",
    "Em Produção": "badge-producao",
    Exibido: "badge-exibido",
    "Em Revisão": "badge-revisao",
    Cancelado: "badge-cancelado",
  };
  return statusMap[status] || "badge-default";
};

// --- COMPONENTES ---

export function CronogramaPage() {
  const [allScripts, setAllScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("gravacao"); // 'gravacao' ou 'exibicao'
  const [programFilter, setProgramFilter] = useState("all"); // 'all', 'Daqui', 'Especial'
  const [view, setView] = useState("timeGridWeek");
  const [calendarTitle, setCalendarTitle] = useState("");
  const calendarRef = useRef(null);
  const navigate = useNavigate();

  // Tooltip State
  const [tooltipEvent, setTooltipEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
            start: `${script.dataGravacao}T09:00:00`,
            end: `${script.dataGravacao}T18:00:00`,
          });
        }

        if (dateFilter === "exibicao" && script.dataExibicao) {
          events.push({
            ...sharedProps,
            title: `[E] ${script.pauta}`,
            start: script.dataExibicao,
            allDay: true,
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

  const handleEventMouseEnter = (mouseEnterInfo) => {
    setTooltipEvent(mouseEnterInfo.event);
    setTooltipPosition({
      x: mouseEnterInfo.jsEvent.clientX,
      y: mouseEnterInfo.jsEvent.clientY,
    });
  };

  const handleEventMouseLeave = () => {
    setTooltipEvent(null);
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
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Carregando cronograma...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="cronograma-page">
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

      <div className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={false}
          events={filteredEvents}
          locale={ptBrLocale}
          allDaySlot={view === "dayGridMonth"}
          height="100%"
          eventClick={handleEventClick}
          eventMouseEnter={handleEventMouseEnter}
          eventMouseLeave={handleEventMouseLeave}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          datesSet={updateTitle}
          viewDidMount={updateTitle}
        />
      </div>

      {tooltipEvent && (
        <div
          className="event-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="tooltip-header">
            <h3 className="tooltip-title">
              {tooltipEvent.extendedProps.pauta}
            </h3>
            <Badge
              className={getBadgeClasses(tooltipEvent.extendedProps.status)}
            >
              {tooltipEvent.extendedProps.status}
            </Badge>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <CalendarIcon className="h-4 w-4" />
              <span>
                <strong>Programa:</strong>{" "}
                {tooltipEvent.extendedProps.programa ||
                  tooltipEvent.extendedProps.program}
              </span>
            </div>
            <div className="tooltip-row">
              <User className="h-4 w-4" />
              <span>
                <strong>Produtor:</strong> {tooltipEvent.extendedProps.produtor}
              </span>
            </div>
            <div className="tooltip-row">
              <Tv className="h-4 w-4" />
              <span>
                <strong>Apresentador:</strong>{" "}
                {tooltipEvent.extendedProps.apresentador}
              </span>
            </div>
            <div className="tooltip-row">
              <MapPin className="h-4 w-4" />
              <span>
                <strong>Local:</strong> {tooltipEvent.extendedProps.cidade} -{" "}
                {tooltipEvent.extendedProps.bairro}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
