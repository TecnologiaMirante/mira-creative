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
import { getPrograma } from "../../../firebaseClient";

const DetailItem = ({ icon: Icon, label, value, danger = false }) => (
  <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/75 px-3 py-2.5">
    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
      <Icon
        className={`h-3.5 w-3.5 ${danger ? "text-red-500" : "text-slate-400"}`}
      />
      <span>{label}</span>
    </div>
    <p
      className={`truncate text-[13px] font-medium ${
        danger ? "text-red-600" : "text-slate-700"
      }`}
    >
      {value || "N/D"}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status);
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1">
      <Circle className={`h-2 w-2 ${style}`} />
      <p className={`text-[11px] font-semibold ${style}`}>
        {status || "Status N/D"}
      </p>
    </div>
  );
};

export function PautaCardGrid({ pauta, onView, onEdit, onDelete }) {
  const { user } = useContext(UserContext);
  const { getUserById, isLoadingCache } = useUserCache();
  const [nomePrograma, setNomePrograma] = useState("Carregando...");

  const produtor = isLoadingCache
    ? "..."
    : getUserById(pauta.produtorId)?.display_name || "N/D";
  const apresentador = isLoadingCache
    ? "..."
    : getUserById(pauta.apresentadorId)?.display_name || "N/D";
  const roteirista = isLoadingCache
    ? "..."
    : getUserById(pauta.roteiristaId)?.display_name || "N/D";

  useEffect(() => {
    const fetchNome = async () => {
      if (!pauta?.programaId) {
        setNomePrograma("Programa nao vinculado");
        return;
      }
      const programaData = await getPrograma(pauta.programaId);
      setNomePrograma(programaData?.nome || "Programa nao encontrado");
    };

    fetchNome();
  }, [pauta.programaId]);

  let isDateInvalid = false;
  try {
    const gravacaoDate = pauta.dataGravacaoInicio?.toDate
      ? pauta.dataGravacaoInicio.toDate()
      : pauta.dataGravacaoInicio
        ? new Date(pauta.dataGravacaoInicio)
        : null;
    const exibicaoDate = pauta.dataExibicao?.toDate
      ? pauta.dataExibicao.toDate()
      : pauta.dataExibicao
        ? new Date(pauta.dataExibicao)
        : null;
    if (gravacaoDate && exibicaoDate && exibicaoDate < gravacaoDate) {
      isDateInvalid = true;
    }
  } catch (error) {
    console.error("Erro ao comparar datas no card:", error);
  }

  const pautaStyle = getStatusClasses(pauta.status);
  const duracao = `${pauta.duracaoMinutos || "00"}:${pauta.duracaoSegundos || "00"}`;

  return (
    <Card
      className={`group relative flex h-full min-h-[248px] flex-col overflow-hidden border-0 bg-white/92 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_24px_-22px_rgba(15,23,42,0.28)] ${pautaStyle}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" />

      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`truncate text-[10px] font-bold uppercase tracking-[0.14em] ${getProgramStyle(
                nomePrograma,
              )}`}
            >
              {nomePrograma}
            </p>
            <Link to={`/home/pautas/${pauta.id}`}>
              <CardTitle className="line-clamp-2 pt-0.5 text-[15px] font-bold leading-snug text-slate-800 transition-colors hover:text-indigo-600">
                {pauta.titulo}
              </CardTitle>
            </Link>
          </div>
          {pauta.roteiroId && (
            <div className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
              Roteiro
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid flex-1 gap-2 pb-2.5">
        <div className="grid grid-cols-2 gap-2">
          <DetailItem icon={User} label="Produtor" value={produtor} />
          <DetailItem icon={Tv} label="Apres." value={apresentador} />
          <DetailItem icon={PenSquare} label="Roteirista" value={roteirista} />
          <DetailItem
            icon={MapPin}
            label="Local"
            value={`${pauta.cidade || "N/D"} - ${pauta.bairro || "N/D"}`}
          />
          <DetailItem icon={Timer} label="Duracao" value={duracao} />
          <DetailItem
            icon={CalendarDays}
            label="Exibicao"
            value={convertTimestamp(pauta.dataExibicao)}
            danger={isDateInvalid}
          />
        </div>

        {isDateInvalid && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Exibicao anterior a gravacao.
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t border-slate-100 px-6 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <StatusBadge status={pauta.status} />

        <TooltipProvider>
          <div className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-500 hover:text-blue-600"
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
                      className="h-7 w-7 text-slate-500 hover:text-indigo-600"
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
                            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700"
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
                        <AlertDialogTitle>Excluir esta pauta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          A pauta sera movida para a lixeira.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(pauta.id)}
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
