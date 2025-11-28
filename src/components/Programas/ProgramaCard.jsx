// /src/components/programas/ProgramaCard.jsx

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
  calcularDuracaoTotal,
  convertTimestamp,
  getProgramStyle,
  getStatusStyle,
  formatSegundos,
} from "@/lib/utils";
import { useUserCache } from "@/context/UserCacheContext";
import { useContext } from "react";
import UserContext from "@/context/UserContext";

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

// --- Card Principal ---
export function ProgramaCard({ programa, onDelete, onEdit }) {
  const { user } = useContext(UserContext);

  const programStyle = getProgramStyle(programa.nome);
  const { getUserById, isLoadingCache } = useUserCache();

  let editorName = programa.lastEditedByName;
  if (!editorName && programa.editedBy) {
    const editor = getUserById(programa.editedBy);
    editorName = editor.display_name;
  }

  if (!editorName) {
    editorName = "N/D";
  }

  return (
    // Borda superior colorida e sombra mais sutil no card
    <Card
      className={`flex flex-col h-full rounded-lg border bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg relative group border-t-4 ${programStyle}`}
    >
      <div className="flex flex-col">
        <Link to={`/home/programas/${programa.id}`} className="space-y-4 mb-4">
          <CardHeader className="cursor-pointer">
            <CardTitle
              className={`text-2xl font-extrabold line-clamp-2 leading-snug ${programStyle.text}`}
            >
              {programa.nome}
            </CardTitle>
          </CardHeader>

          {/* Conteúdo: Informações principais */}
          <CardContent className="pb-4 space-y-3 flex-grow border-b border-slate-100">
            {/* EXIBIÇÃO */}
            <InfoItem icon={CalendarDays}>
              <p>
                <span className="font-semibold text-slate-700">Exibição: </span>
                {convertTimestamp(programa.dataExibicao)}
              </p>
            </InfoItem>

            {/* PAUTAS */}
            <InfoItem icon={FileText}>
              <p>
                <span className="font-semibold text-slate-700">Pautas: </span>
                {programa.pautaCount ?? 0} no espelho
              </p>
            </InfoItem>
            {/* DURAÇÃO */}
            <InfoItem icon={Clock}>
              <p>
                <span className="font-semibold text-slate-700">Duração: </span>
                {formatSegundos(programa.duracaoTotalSegundos)}
              </p>
            </InfoItem>

            {/* EDIÇÃO */}
            <InfoItem icon={User}>
              <p>
                <span className="font-semibold text-slate-700">
                  Última Edição:{" "}
                </span>
                {isLoadingCache ? "..." : editorName}
              </p>
            </InfoItem>
          </CardContent>
        </Link>

        {/* Rodapé: Status e Ação */}
        <CardFooter className="px-6 flex justify-between items-center">
          <StatusBadge status={programa.status} />

          <div className="flex items-center gap-1 ">
            {user?.typeUser !== "Visualizador" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                  onClick={() => onEdit(programa)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
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
              className="flex items-center text-sm font-medium text-indigo-600 p-2 rounded-md hover:bg-indigo-50"
            >
              Ver Espelho
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
