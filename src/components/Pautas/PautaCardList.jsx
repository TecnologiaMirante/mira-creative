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
import { convertTimestamp, getStatusStyle } from "@/lib/utils";
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

const InfoGroup = ({ title, children }) => (
  <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      {title}
    </p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const Chip = ({ icon: Icon, value, danger = false }) => (
  <div
    className={`inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${
      danger ? "bg-red-50 text-red-600" : "bg-white text-slate-700"
    }`}
  >
    <Icon className="h-3.5 w-3.5" />
    <span className="truncate">{value}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status);
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1">
      <Circle className={`h-2.5 w-2.5 ${style}`} />
      <p className={`text-[12px] font-semibold ${style}`}>{status || "Status N/D"}</p>
    </div>
  );
};

export function PautaCardList({
  pauta,
  onEdit,
  onRemove,
  dndListeners,
  dndAttributes,
}) {
  const { user } = useContext(UserContext);
  const { getUserById, isLoadingCache } = useUserCache();
  const produtor =
    isLoadingCache ? "..." : getUserById(pauta.produtorId)?.display_name || "N/D";
  const apresentador =
    isLoadingCache ? "..." : getUserById(pauta.apresentadorId)?.display_name || "N/D";
  const roteirista =
    isLoadingCache ? "..." : getUserById(pauta.roteiristaId)?.display_name || "N/D";

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

  const duracao = `${pauta.duracaoMinutos || "00"}:${pauta.duracaoSegundos || "00"}`;

  return (
    <Card className="group relative flex h-full min-h-[170px] flex-col overflow-hidden border-0 bg-white/92 transition-all duration-300 hover:shadow-[0_18px_26px_-22px_rgba(15,23,42,0.28)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" />

      <div className="grid h-full gap-3 p-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)_auto] lg:items-center">
        <div className="min-w-0">
          <CardHeader className="p-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-800 transition-colors hover:text-indigo-600">
                {pauta.titulo}
              </CardTitle>

              {user?.typeUser !== "Visualizador" && dndListeners && (
                <button
                  {...dndAttributes}
                  {...dndListeners}
                  className="cursor-grab p-1 text-slate-400 hover:text-slate-700"
                >
                  <Menu className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardHeader>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <InfoGroup title="Equipe">
            <Chip icon={User} value={produtor} />
            <Chip icon={Tv} value={apresentador} />
            <Chip icon={PenSquare} value={roteirista} />
            <Chip
              icon={FileText}
              value={pauta.roteiroId ? "Roteiro vinculado" : "Sem roteiro"}
            />
          </InfoGroup>

          <InfoGroup title="Agenda">
            <Chip icon={MapPin} value={`${pauta.cidade || "N/D"} - ${pauta.bairro || "N/D"}`} />
            <Chip icon={Timer} value={duracao} />
            <Chip icon={CalendarDays} value={convertTimestamp(pauta.dataGravacaoInicio)} />
            <Chip icon={CalendarDays} value={convertTimestamp(pauta.dataExibicao)} />
            {isDateInvalid && (
              <Chip icon={AlertTriangle} value="Exibição inconsistente" danger />
            )}
          </InfoGroup>
        </div>

        <CardFooter className="flex flex-col items-start gap-2 p-0 lg:items-end">
          <StatusBadge status={pauta.status} />
          <TooltipProvider>
            <div className="flex items-center gap-1">
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
                      <p>Editar pauta</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <AlertDialog>
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
                        <p>Remover pauta</p>
                      </TooltipContent>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover pauta do espelho?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação remove a pauta deste espelho, sem excluí-la do sistema.
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

              <Link
                to={`/home/pautas/${pauta.id}`}
                className="flex items-center rounded-full bg-indigo-50 px-2.5 py-1.5 text-[12px] font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
              >
                Ver Pauta
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
          </TooltipProvider>
        </CardFooter>
      </div>
    </Card>
  );
}
