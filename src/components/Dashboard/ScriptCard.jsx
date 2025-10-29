"use client";

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
  AlertTriangle,
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

// --- Paleta de Estilos Profissional e Sóbria ---
const getProgramStyle = (program) => {
  switch (program) {
    case "Daqui":
      return "text-indigo-600 font-bold";
    case "Especial":
      return "text-purple-600 font-bold";
    default:
      return "text-slate-600 font-bold";
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Aprovado":
      return "text-blue-600 fill-blue-500";
    case "Cancelado":
      return "text-red-600 fill-red-500";
    case "Em Produção":
      return "text-amber-600 fill-amber-500";
    case "Em Revisão":
      return "text-pink-600 fill-pink-500";
    case "Exibido":
      return "text-emerald-600 fill-emerald-500";
    default:
      return "text-slate-500 fill-slate-400";
  }
};

// Componente reutilizável para itens de informação
const InfoItem = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <Icon className="h-4 w-4 flex-shrink-0" />
    <div className="truncate">{children || <p>Não informado</p>}</div>
  </div>
);

export function ScriptCard({ script, onView, onEdit, onDelete }) {
  const { user: user } = useContext(UserContext);

  function convertDate(dateString) {
    if (!dateString) return "Não definida";
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // --- CALCULAR SE AS DATAS SÃO INVÁLIDAS ---
  let isDateInvalid = false;
  if (script.dataGravacao && script.dataExibicao) {
    try {
      const gravacaoDate = new Date(`${script.dataGravacao}T00:00:00`);
      const exibicaoDate = new Date(`${script.dataExibicao}T00:00:00`);
      // Verifica se as datas são válidas e se exibicao é anterior a gravacao
      if (
        !isNaN(gravacaoDate) &&
        !isNaN(exibicaoDate) &&
        exibicaoDate < gravacaoDate
      ) {
        isDateInvalid = true;
      }
    } catch (e) {
      console.error("Erro ao comparar datas no Card:", e);
      // Tratar como válido se houver erro na conversão para evitar falsos positivos
    }
  }

  const statusStyle = getStatusStyle(script.status);

  return (
    <Card className="flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 relative group overflow-hidden">
      {/* Corpo principal clicável */}
      <div
        className="flex-grow p-6 cursor-pointer"
        onClick={() => onView(script)}
      >
        {/* Cabeçalho do roteiro */}
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${getProgramStyle(script.program)}`}>
              {script.program || "Programa N/D"}
            </p>
            <div className="flex items-center gap-2">
              <Circle className={`h-2 w-2 ${statusStyle}`} />
              <p className={`text-sm font-semibold ${statusStyle}`}>
                {script.status || "Status N/D"}
              </p>
            </div>
          </div>
          <CardTitle className="pt-2 text-xl font-extrabold text-slate-800 line-clamp-2 leading-snug">
            {script.pauta}
          </CardTitle>
        </CardHeader>

        {/* Linha de Informações */}
        <CardContent className="p-0 space-y-4">
          {/* Linha de Produtor e Apresentador*/}
          <div className="grid grid-cols-1 gap-x-4 gap-y-1 pt-4 border-t border-slate-100">
            <InfoItem icon={User}>
              <p>
                <span className="font-semibold text-slate-700">Produtor: </span>
                {script.produtor || "N/D"}
              </p>
            </InfoItem>
            <InfoItem icon={Tv}>
              <p>
                <span className="font-semibold text-slate-700">
                  Apresentador:{" "}
                </span>
                {script.apresentador || "N/D"}
              </p>
            </InfoItem>
            <InfoItem icon={MapPin}>
              <span className="font-semibold text-slate-700">{`${
                script.cidade || "N/D"
              } - `}</span>
              <span>{`${script.bairro || "N/D"}`}</span>
            </InfoItem>
          </div>

          {/* Linha de Data de Gravação e Exibição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-slate-100">
            <InfoItem icon={CalendarDays}>
              <p>
                <span className="font-semibold text-slate-700">Gravação: </span>
                {convertDate(script.dataGravacao)}
              </p>
            </InfoItem>
            <InfoItem icon={CalendarDays}>
              {/* --- APLICA ESTILO CONDICIONAL AQUI --- */}
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
                {/* Ícone de alerta */}
                <span
                  className={`font-semibold ${
                    isDateInvalid ? "text-red-700" : "text-slate-700"
                  }`}
                >
                  Exibição:{" "}
                </span>
                {convertDate(script.dataExibicao)}
              </p>
            </InfoItem>
          </div>
          {/* Mensagem de Alerta se a data for inválida */}
          {isDateInvalid && (
            <p className="text-xs text-red-500 font-medium px-1 pt-1">
              Atenção: Data de exibição anterior à gravação!
            </p>
          )}
        </CardContent>
      </div>

      {/* Overlay de Ações que aparece no Hover */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onView(script);
            }}
          >
            <Eye className="h-4 w-4" /> Ver
          </Button>
          {user?.typeUser !== "Visualizador" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(script);
                }}
              >
                <Edit className="h-4 w-4" /> Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" /> Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Você tem certeza absoluta?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(script.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Continuar e Excluir
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
