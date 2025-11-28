// /src/components/pautas/PautaCardList.jsx

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  User,
  MapPin,
  Tv,
  CalendarDays,
  Circle,
  Menu,
  PenSquare,
  FileText,
  ChevronRight,
  AlertTriangle,
  Timer,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  convertTimestamp,
  getStatusClasses,
  getStatusStyle,
} from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useUserCache } from "@/context/UserCacheContext";
import UserContext from "@/context/UserContext";
import { useContext } from "react";

const InfoItem = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <Icon className="h-4 w-4 flex-shrink-0" />
    <div className="truncate">{children || <p>Não informado</p>}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status);
  return (
    <div className="flex items-center gap-2">
      <Circle className={`h-2 w-2 ${style}`} />
      <p className={`text-sm font-semibold ${style}`}>
        {status || "Status N/D"}
      </p>
    </div>
  );
};

function formatGravacao(inicio, fim) {
  const dataInicio = convertTimestamp(inicio);
  if (dataInicio === "Não definida") return "Não definida";

  const dataFim = convertTimestamp(fim);
  if (dataFim === "Não definida" || dataFim === dataInicio) {
    return dataInicio; // Retorna só a data de início
  }
  return `${dataInicio} - ${dataFim}`; // Retorna o intervalo
}

// --- Card Principal ---
export function PautaCardList({
  pauta,
  onEdit,
  onRemove, // Prop para "Remover do Espelho"
  dndListeners,
  dndAttributes,
}) {
  const { user } = useContext(UserContext);
  const { getUserById, isLoadingCache } = useUserCache();
  const produtor = getUserById(pauta.produtorId);
  const apresentador = getUserById(pauta.apresentadorId);
  const roteirista = getUserById(pauta.roteiristaId);

  // --- Lógica de Datas  ---
  let isDateInvalid = false;
  const dataInicio = pauta.dataGravacaoInicio;
  const dataExibicao = pauta.dataExibicao;

  if (dataInicio && dataExibicao) {
    try {
      const gravacaoDate = dataInicio.toDate
        ? dataInicio.toDate()
        : new Date(dataInicio);
      const exibicaoDate = dataExibicao.toDate
        ? dataExibicao.toDate()
        : new Date(dataExibicao);

      if (exibicaoDate < gravacaoDate) {
        isDateInvalid = true;
      }
    } catch (e) {
      console.error("Erro ao comparar datas no Card:", e);
    }
  }

  const pautaStyle = getStatusClasses(pauta.status);
  const duracao = `${pauta.duracaoMinutos || "00"}:${
    pauta.duracaoSegundos || "00"
  }`;

  return (
    <Card
      className={`flex flex-col h-full rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg relative group border-t-4 ${pautaStyle}`}
    >
      {/* <div className="flex-grow px-4"> */}
      <div className="flex flex-col">
        {/* Cabeçalho do roteiro */}
        <div className="space-y-4 mb-4">
          <CardHeader className="cursor-pointer">
            <div className="flex items-start justify-between">
              <CardTitle className="text-justify text-2xl font-extrabold text-slate-800 line-clamp-2 leading-snug hover:text-indigo-600 transition-colors">
                {pauta.titulo}
              </CardTitle>

              {/* ALÇA DE DRAG-AND-DROP */}
              {user?.typeUser !== "Visualizador" && dndListeners && (
                <button
                  {...dndAttributes}
                  {...dndListeners}
                  className="cursor-grab p-1 text-slate-400 hover:text-slate-700"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>
          </CardHeader>

          {/* Conteúdo com Informações */}
          <CardContent className="px-6 space-y-4 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-slate-100">
              {/* Produtor */}
              <InfoItem icon={User}>
                <p>
                  <span className="font-semibold text-slate-700">
                    Produtor:{" "}
                  </span>
                  {isLoadingCache ? "..." : produtor.display_name}
                </p>
              </InfoItem>
              {/* Apresentador */}
              <InfoItem icon={Tv}>
                <p>
                  <span className="font-semibold text-slate-700">
                    Apresentador:{" "}
                  </span>
                  {isLoadingCache ? "..." : apresentador.display_name}
                </p>
              </InfoItem>
              {/* Roteirista */}
              <InfoItem icon={PenSquare}>
                <p>
                  <span className="font-semibold text-slate-700">
                    Roteirista:{" "}
                  </span>
                  {isLoadingCache ? "..." : roteirista.display_name}
                </p>
              </InfoItem>
              {/* Roteiro */}
              <InfoItem icon={FileText}>
                <p>
                  <span className="font-semibold text-slate-700">
                    Roteiro:{" "}
                  </span>
                  {pauta.roteiroId ? "Vinculado" : "Não Vinculado"}
                </p>
              </InfoItem>
              {/* Cidade e Bairro*/}
              <InfoItem icon={MapPin}>
                <span className="font-semibold text-slate-700">{`${
                  pauta.cidade || "N/D"
                } - `}</span>
                <span>{`${pauta.bairro || "N/D"}`}</span>
              </InfoItem>
            </div>

            {/* Linha de Data de Gravação e Exibição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 pt-4 border-t border-slate-100">
              {/* 5. CAMPO DE GRAVAÇÃO ATUALIZADO */}
              <InfoItem icon={CalendarDays}>
                <p>
                  <span className="font-semibold ...">Gravação: </span>
                  {formatGravacao(
                    pauta.dataGravacaoInicio,
                    pauta.dataGravacaoFim
                  )}
                </p>
              </InfoItem>

              {/* Data de Exibição */}
              <InfoItem icon={CalendarDays}>
                <p className={isDateInvalid ? "text-red-600 ..." : ""}>
                  {isDateInvalid && <AlertTriangle className="h-4 w-4" />}{" "}
                  <span
                    className={`font-semibold ${
                      isDateInvalid ? "text-red-700" : "text-slate-700"
                    }`}
                  >
                    Exibição:{" "}
                  </span>
                  {convertTimestamp(pauta.dataExibicao)}
                </p>
              </InfoItem>
            </div>

            {/* 3. ADICIONE A DURAÇÃO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 pt-4 border-t border-slate-100">
              <InfoItem icon={Timer}>
                <p>
                  <span className="font-semibold text-slate-700">
                    Duração:{" "}
                  </span>
                  {duracao}
                </p>
              </InfoItem>
            </div>

            {isDateInvalid && (
              <p className="text-xs text-red-500 font-medium px-1 pt-1">
                Atenção: Data de exibição anterior à gravação!
              </p>
            )}
          </CardContent>
        </div>

        {/* Rodapé: Status e Ação */}
        <CardFooter className="px-6 flex justify-between items-center">
          <StatusBadge status={pauta.status} />
          <TooltipProvider>
            <div className="flex items-center gap-1">
              {user?.typeUser !== "Visualizador" && (
                <>
                  {/* EDITAR PAUTA */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(pauta);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar pauta</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* REMOVER PAUTA */}
                  <Tooltip>
                    <AlertDialog>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>Remover pauta</p>
                      </TooltipContent>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remover Pauta do Espelho?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá remover a pauta deste espelho, mas não
                            irá excluí-la. Você poderá adicioná-la novamente
                            mais tarde.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onRemove(pauta.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Continuar e Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </Tooltip>
                </>
              )}

              {/* Ver Pauta */}
              <Link
                to={`/home/pautas/${pauta.id}`}
                className="flex items-center text-sm font-medium text-indigo-600 p-2 rounded-md hover:bg-indigo-50"
              >
                Ver Pauta
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </TooltipProvider>
        </CardFooter>
      </div>
    </Card>
  );
}
