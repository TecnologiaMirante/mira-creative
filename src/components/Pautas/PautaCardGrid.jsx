// /src/components/pautas/PautaCardGrid.jsx

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
  Eye,
  User,
  MapPin,
  Tv,
  CalendarDays,
  Circle,
  PenSquare,
  FileText,
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
  getProgramStyle,
} from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useUserCache } from "@/context/UserCacheContext";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/context/UserContext";
import { getPrograma } from "../../../firebase";

// --- Componentes Internos (Helpers) ---

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
    return dataInicio;
  }
  return `${dataInicio} - ${dataFim}`;
}

// --- Card Principal (GRID) ---

export function PautaCardGrid({ pauta, onView, onEdit, onDelete }) {
  const { user } = useContext(UserContext);
  const { getUserById, isLoadingCache } = useUserCache();
  const produtor = getUserById(pauta.produtorId);
  const apresentador = getUserById(pauta.apresentadorId);
  const roteirista = getUserById(pauta.roteiristaId);
  const [nomePrograma, setNomePrograma] = useState("Carregando...");

  useEffect(() => {
    const fetchNome = async () => {
      if (!pauta?.programaId) {
        setNomePrograma("Programa não vinculado");
        return;
      }

      // Chama sua função
      const programaData = await getPrograma(pauta.programaId);

      // Se achou, salva o nome no estado
      if (programaData) {
        setNomePrograma(programaData.nome);
      } else {
        setNomePrograma("Programa não encontrado");
      }
    };

    fetchNome();
  }, [pauta.programaId]); // Só roda se o ID mudar

  // --- Lógica de Datas ---
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

      if (exibicaoDate < gravacaoDate) isDateInvalid = true;
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
      <div className="flex flex-col flex-grow p-2">
        {/* Cabeçalho */}
        <CardHeader className="p-0 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p
                className={`text-base font-bold ${getProgramStyle(
                  nomePrograma
                )}`}
              >
                {nomePrograma}
              </p>

              <Link to={`/home/pautas/${pauta.id}`}>
                <CardTitle className="text-justify pt-1 text-xl font-extrabold text-slate-800 line-clamp-2 leading-snug hover:text-indigo-600 transition-colors h-14">
                  {pauta.titulo}
                </CardTitle>
              </Link>
            </div>
          </div>
        </CardHeader>

        {/* Conteúdo */}
        <CardContent className="p-0 space-y-4 flex-grow">
          {/* Seção 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-slate-100">
            {/* Produtor */}
            <InfoItem icon={User}>
              <p>
                <span className="font-semibold text-slate-700">Produtor: </span>

                {isLoadingCache ? "..." : produtor.display_name}
              </p>
            </InfoItem>

            {/* Apresentador */}
            <InfoItem icon={Tv}>
              <p>
                <span className="font-semibold text-slate-700">Apres: </span>

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
                <span className="font-semibold text-slate-700">Roteiro: </span>

                {pauta.roteiroId ? "Vinculado" : "Não Vinculado"}
              </p>
            </InfoItem>
          </div>

          {/* Seção 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-slate-100">
            <InfoItem icon={MapPin}>
              <span className="font-semibold text-slate-700">{`${
                pauta.cidade || "N/D"
              } - `}</span>

              <span>{`${pauta.bairro || "N/D"}`}</span>
            </InfoItem>

            <InfoItem icon={Timer}>
              <p>
                <span className="font-semibold text-slate-700">Duração: </span>

                {duracao}
              </p>
            </InfoItem>
          </div>

          {/* Seção 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-b pb-4 border-slate-100">
            {/* Data de Gravação */}
            <InfoItem icon={CalendarDays}>
              <p>
                <span className="font-semibold text-slate-700">Gravação: </span>

                {formatGravacao(
                  pauta.dataGravacaoInicio,

                  pauta.dataGravacaoFim
                )}
              </p>
            </InfoItem>

            {/* Data de exibição*/}
            <InfoItem icon={CalendarDays}>
              <p
                className={
                  isDateInvalid
                    ? "text-red-600 font-semibold flex items-center gap-1"
                    : ""
                }
              >
                {isDateInvalid && (
                  <AlertTriangle className="h-4 w-4 inline-block" />
                )}{" "}
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

          {isDateInvalid && (
            <p className="text-xs text-red-500 font-medium px-1 pt-1">
              Atenção: Data de exibição anterior à gravação!
            </p>
          )}
        </CardContent>
      </div>

      {/* Rodapé */}
      <CardFooter className="flex justify-between items-start">
        <StatusBadge status={pauta.status} />

        <TooltipProvider>
          {/* Visível no mobile (opacity-100) e no hover do desktop (md:opacity-0 group-hover:opacity-100) */}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();

                    onView(pauta);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Ver Pauta</p>
              </TooltipContent>
            </Tooltip>

            {user?.typeUser !== "Visualizador" && (
              <>
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
                    <p>Editar Pauta</p>
                  </TooltipContent>
                </Tooltip>

                {onDelete && (
                  <AlertDialog>
                    <Tooltip>
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
                        <p>Excluir Pauta</p>
                      </TooltipContent>
                    </Tooltip>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir esta Pauta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          A pauta será movida para a lixeira (invisível).
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            console.log("Excluindo pauta...", pauta.id);
                            onDelete(pauta.id);
                          }}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Sim, Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
