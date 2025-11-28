// /src/components/CronogramaPage/EventCard.jsx

import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import {
  Clapperboard,
  Clock,
  Eye,
  FileText,
  MapPin,
  Tv,
  User,
} from "lucide-react";
import { formatSegundos } from "@/lib/utils";

// --- COMPONENTE DE CARD DO EVENTO (Extraído para melhor controle) ---
export const EventCard = ({ eventInfo, allPrograms, getUserById }) => {
  const navigate = useNavigate();
  const { extendedProps } = eventInfo.event;
  const { styles } = extendedProps;
  const isPrograma = extendedProps.eventType === "programa";
  const Icon = isPrograma ? Tv : styles.icon || FileText;

  // Lógica de Nomes
  let nomeProgramaDisplay = "Programa não vinculado";
  let nomeProdutorDisplay = "Produtor não vinculado";

  if (!isPrograma) {
    if (extendedProps.programaId) {
      const prog = allPrograms.find((p) => p.id === extendedProps.programaId);
      if (prog) nomeProgramaDisplay = prog.nome;
    } else if (extendedProps.programa && extendedProps.programa !== "—") {
      nomeProgramaDisplay = extendedProps.programa;
    }

    if (extendedProps.produtorId) {
      const user = getUserById(extendedProps.produtorId);
      if (user) nomeProdutorDisplay = user.display_name || user.nome;
      else nomeProdutorDisplay = "Usuário não encontrado";
    } else {
      nomeProdutorDisplay = extendedProps.produtor || "N/D";
    }
  }

  const handleNavigate = () => {
    const route = isPrograma ? "programas" : "pautas";
    navigate(`/home/${route}/${extendedProps.id}`);
  };

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => e.preventDefault()}
          className={`
             group w-full h-full min-h-[28px] p-1.5 rounded-r-md cursor-pointer transition-all duration-200
             shadow-sm hover:shadow-md hover:brightness-95
             flex items-center gap-2 overflow-hidden
             ${styles.bg} ${styles.border} ${styles.text}
          `}
        >
          <Icon size={14} className="flex-shrink-0 opacity-70" />
          <div className="font-semibold text-xs truncate leading-tight select-none flex-grow">
            {eventInfo.event.title}
          </div>
        </div>
      </TooltipTrigger>

      <TooltipContent
        className="w-[280px] sm:w-80 p-0 border-0 shadow-xl z-50 rounded-lg overflow-hidden flex flex-col"
        side="right"
        align="start"
        sideOffset={5}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div
          className={`px-4 py-3 flex justify-between items-start ${styles.bg} border-b border-gray-100`}
        >
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${styles.text}`}
            >
              {isPrograma ? "Programa" : "Pauta"}
            </span>
            <h3
              className={`font-bold text-base leading-tight mt-0.5 ${styles.text} line-clamp-2`}
            >
              {isPrograma ? extendedProps.nome : extendedProps.titulo}
            </h3>
          </div>
          <Badge
            className={`ml-2 shrink-0 ${styles.text} bg-white/50 hover:bg-white/60 border-0`}
          >
            {extendedProps.status || "Agendado"}
          </Badge>
        </div>

        <div className="bg-white px-4 py-3 flex flex-col gap-2.5">
          {!isPrograma ? (
            <>
              <InfoRow
                icon={Clapperboard}
                label="Programa"
                value={nomeProgramaDisplay}
              />
              <InfoRow
                icon={User}
                label="Produtor"
                value={nomeProdutorDisplay}
              />
              <InfoRow
                icon={MapPin}
                label="Local"
                value={`${extendedProps.cidade || ""}${
                  extendedProps.bairro ? " - " + extendedProps.bairro : ""
                }`}
              />
            </>
          ) : (
            <>
              <InfoRow
                icon={Clock}
                label="Duração"
                value={formatSegundos(extendedProps.duracaoTotalSegundos)}
              />
              <InfoRow
                icon={FileText}
                label="Pautas"
                value={`${extendedProps.pautaCount || 0} vinculadas`}
              />
              <InfoRow
                icon={User}
                label="Edição"
                value={extendedProps.lastEditedByName}
              />
            </>
          )}
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
          className="bg-gray-50 px-4 py-3 border-t flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600 group"
        >
          <span>Ver detalhes completos</span>
          <Eye
            size={16}
            className="text-gray-400 group-hover:text-gray-700 transition-colors"
          />
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-xs md:text-sm text-slate-600">
      <Icon className="w-3 h-3 md:w-4 md:h-4 mt-0.5 text-slate-400 shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">
          {label}
        </span>
        <span className="font-medium text-slate-800 break-words">{value}</span>
      </div>
    </div>
  );
}
