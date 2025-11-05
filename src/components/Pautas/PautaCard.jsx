// /src/components/pautas/PautaCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Menu,
  X,
  PenSquare,
  FileText,
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
import UserContext from "@/context/UserContext";
import { useContext } from "react";
import { getProgramStyle, getStatusClasses, getStatusStyle } from "@/lib/utils";
import { useUserCache } from "@/context/UserCacheContext";

const InfoItem = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <Icon className="h-4 w-4 flex-shrink-0" />
    <div className="truncate">{children || <p>Não informado</p>}</div>
  </div>
);

function convertTimestamp(timestamp) {
  if (!timestamp) return "Não definida";
  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "Data inválida";
  }
}

// --- Card Principal ---
export function PautaCard({
  pauta,
  programaNome,
  onView,
  onEdit,
  onRemove, // Prop para "Remover do Espelho"
  onDelete,
  dndListeners,
  dndAttributes,
}) {
  const { user } = useContext(UserContext);

  const { getUserById, isLoadingCache } = useUserCache();
  const produtor = getUserById(pauta.produtorId);
  const apresentador = getUserById(pauta.apresentadorId);
  const roteirista = getUserById(pauta.roteiristaId);

  // --- Lógica de Datas (Mantida) ---
  let isDateInvalid = false;
  if (pauta.dataGravacao && pauta.dataExibicao) {
    try {
      const gravacaoDate = pauta.dataGravacao.toDate();
      const exibicaoDate = pauta.dataExibicao.toDate();
      if (exibicaoDate < gravacaoDate) {
        isDateInvalid = true;
      }
    } catch (e) {
      console.error("Erro ao comparar datas no Card:", e);
    }
  }

  const pautaStyle = getStatusClasses(pauta.status);
  const statusStyle = getStatusStyle(pauta.status);

  console.log(pauta.status);

  return (
    <Card
      className={`flex flex-col h-full rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg relative group border-t-4 ${pautaStyle}`}
    >
      <div className="flex-grow px-6">
        {/* Cabeçalho do roteiro */}
        <CardHeader className="p-0 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p
                className={`text-lg font-bold ${getProgramStyle(
                  programaNome
                )} shrink-0`}
              >
                {programaNome || "Programa N/D"}
              </p>
              <CardTitle className="pt-1 text-xl text-justify font-extrabold text-slate-800 line-clamp-2 leading-snug">
                {pauta.titulo}
              </CardTitle>
            </div>

            {/* Status e Alça D&D */}
            <div className="flex items-center gap-3 pl-4">
              <div className="flex items-center gap-2">
                <Circle className={`h-2 w-2 ${statusStyle}`} />
                <p className={`text-sm font-semibold ${statusStyle} shrink-0`}>
                  {pauta.status || "Status N/D"}
                </p>
              </div>
              {/* ALÇA DE DRAG-AND-DROP */}
              {dndListeners && (
                <button
                  {...dndAttributes}
                  {...dndListeners}
                  className="cursor-grab p-1 text-slate-400 hover:text-slate-700"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Conteúdo com Informações */}
        <CardContent className="p-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-slate-100">
            {/* PRODUTOR*/}
            <InfoItem icon={User}>
              <p>
                <span className="font-semibold text-slate-700">Produtor: </span>
                {isLoadingCache ? "..." : produtor.display_name}
              </p>
            </InfoItem>

            {/* APRESENTADOR */}
            <InfoItem icon={Tv}>
              <p>
                <span className="font-semibold text-slate-700">
                  Apresentador:{" "}
                </span>
                {isLoadingCache ? "..." : apresentador.display_name}
              </p>
            </InfoItem>

            {/* ROTEIRISTA */}
            <InfoItem icon={PenSquare}>
              <p>
                <span className="font-semibold text-slate-700">
                  Roteirista:{" "}
                </span>
                {isLoadingCache ? "..." : roteirista.display_name}
              </p>
            </InfoItem>

            {/* ROTEIRO */}
            <InfoItem icon={FileText}>
              <p>
                <span className="font-semibold text-slate-700">Roteiro: </span>
                {pauta.roteiroId || "Não definido"}{" "}
              </p>
            </InfoItem>

            {/* CIDADE E BAIRRO*/}
            <InfoItem icon={MapPin}>
              <span className="font-semibold text-slate-700">{`${
                pauta.cidade || "Não definido"
              } - `}</span>
              <span>{`${pauta.bairro || "Não definido"}`}</span>
            </InfoItem>

            <InfoItem icon={CalendarDays}>
              <p>
                <span className="font-semibold text-slate-700">Gravação: </span>
                {convertTimestamp(pauta.dataGravacao)}
              </p>
            </InfoItem>
          </div>
          {isDateInvalid && (
            <p className="text-xs text-red-500 font-medium px-1 pt-1">
              Atenção: Data de exibição anterior à gravação!
            </p>
          )}
          {/* Linha de Data de Gravação e Exibição */}
        </CardContent>
      </div>

      {/* Overlay de Ações (Exatamente como o seu ScriptCard) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
        <div className="flex w-full gap-2">
          {/* Botão VER */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onView(pauta);
            }}
          >
            <Eye className="h-4 w-4" /> Ver
          </Button>

          {user?.typeUser !== "Visualizador" && (
            <>
              {/* Botão EDITAR */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(pauta);
                }}
              >
                <Edit className="h-4 w-4" /> Editar
              </Button>

              {/* Botão REMOVER (do Espelho) */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Remover Pauta do Espelho?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover a pauta deste espelho, mas não irá
                      excluí-la. Você poderá adicioná-la novamente mais tarde.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemove(pauta.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Continuar e Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
