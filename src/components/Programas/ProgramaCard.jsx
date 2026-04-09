import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Circle,
  ChevronRight,
  FileText,
  User,
  Trash2,
  Edit,
  Clock,
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
import { Button } from "@/components/ui/button";
import {
  convertTimestamp,
  getProgramStyle,
  getStatusStyle,
  formatSegundos,
} from "@/lib/utils";
import { useUserCache } from "@/context/UserCacheContext";
import { useContext } from "react";
import UserContext from "@/context/UserContext";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-2 text-[13px] text-slate-500">
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
    </div>
    <div className="min-w-0 truncate">
      <span className="font-semibold text-slate-700">{label}: </span>
      <span>{value || "N/D"}</span>
    </div>
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

export function ProgramaCard({ programa, onDelete, onEdit }) {
  const { user } = useContext(UserContext);
  const programStyle = getProgramStyle(programa.nome);
  const { getUserById, isLoadingCache } = useUserCache();

  let editorName = programa.lastEditedByName;
  if (!editorName && programa.editedBy) {
    const editor = getUserById(programa.editedBy);
    editorName = editor?.display_name;
  }

  if (!editorName) editorName = "N/D";

  return (
    <Card
      className={`group relative flex h-full min-h-[258px] flex-col overflow-hidden border-0 bg-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_28px_-24px_rgba(15,23,42,0.3)] ${programStyle}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" />

      <div className="grid h-full grid-rows-[auto_1fr_auto]">
        <Link
          to={`/home/programas/${programa.id}`}
          className="min-h-0 flex flex-col h-full"
        >
          <CardHeader className="pb-2">
            <CardTitle
              className={`line-clamp-2 min-h-[2.9rem] text-[18px] font-bold leading-snug tracking-tight ${programStyle.text}`}
            >
              {programa.nome}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-2 border-b border-slate-100 pb-3 flex-1">
            <InfoRow
              icon={CalendarDays}
              label="Exibição"
              value={convertTimestamp(programa.dataExibicao)}
            />
            <InfoRow
              icon={FileText}
              label="Pautas"
              value={`${programa.pautaCount ?? 0} no espelho`}
            />
            <InfoRow
              icon={Clock}
              label="Duração"
              value={formatSegundos(programa.duracaoTotalSegundos)}
            />
            <InfoRow
              icon={User}
              label="Última edição"
              value={isLoadingCache ? "..." : editorName}
            />
          </CardContent>
        </Link>

        {/* O Erro de tag desbalanceada estava a partir daqui */}
        <CardFooter className="flex flex-col gap-2.5 px-6 py-3 sm:flex-row sm:items-center sm:justify-between bg-white relative z-10">
          <StatusBadge status={programa.status} />

          <div className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto">
            {user?.typeUser !== "Visualizador" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-500 hover:text-indigo-600"
                  onClick={(e) => {
                    e.preventDefault(); // Impede o clique de ativar o Link principal
                    onEdit(programa);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => e.preventDefault()} // Impede o clique de ativar o Link principal
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Excluir este programa?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O programa será movido
                        para a lixeira.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(programa.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Sim, Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            <Link
              to={`/home/programas/${programa.id}`}
              className="flex items-center rounded-full bg-indigo-50 px-2.5 py-1.5 text-[12px] font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              Ver Espelho
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
