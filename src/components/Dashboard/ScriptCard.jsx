// /components/dashboard/ScriptCard.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
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

// Funções auxiliares de estilização (específicas para este card)
const getStatusColor = (status) => {
  switch (status) {
    case "Exibido":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "Em Produção":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "Aprovado":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Em Revisão":
      return "bg-pink-100 text-pink-800 border-pink-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getStatusBorderColor = (status) => {
  switch (status) {
    case "Exibido":
      return "border-l-emerald-500";
    case "Em Produção":
      return "border-l-amber-500";
    case "Aprovado":
      return "border-l-blue-500";
    case "Em Revisão":
      return "border-l-pink-500";
    default:
      return "border-l-gray-400";
  }
};

export function ScriptCard({ script, onView, onEdit, onDelete }) {
  function convertDate(date) {
    const displaydate = date
      ? new Date(date).toLocaleDateString("pt-BR")
      : "N/A";

    return displaydate;
  }

  return (
    <Card
      className={`flex flex-col h-full hover:shadow-lg transition-all duration-200 border-l-4 ${getStatusBorderColor(
        script.status
      )} group`}
      onClick={() => onView(script)}
    >
      <div className="cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {script.pauta}
            </CardTitle>
            <Badge className={`shrink-0 ${getStatusColor(script.status)}`}>
              {script.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* PRODUTOR */}
            <div>
              <span className="font-medium text-muted-foreground">
                Produtor
              </span>
              <p className="text-foreground font-medium truncate">
                {script.produtor}
              </p>
            </div>

            {/* APRESENTADOR */}
            <div>
              <span className="font-medium text-muted-foreground">
                Apresentador
              </span>
              <p className="text-foreground font-medium truncate">
                {script.apresentador}
              </p>
            </div>

            {/* CIDADE */}
            <div>
              <span className="font-medium text-muted-foreground">Cidade</span>
              <p className="text-foreground font-medium truncate">
                {script.cidade}
              </p>
            </div>

            {/* BAIRRO */}
            <div>
              <span className="font-medium text-muted-foreground">Bairro</span>
              <p className="text-foreground font-medium truncate">
                {script.bairro}
              </p>
            </div>

            {/* DATA DA GRAVAÇÃO */}
            <div>
              <span className="font-medium text-muted-foreground">
                Data da Gravação
              </span>
              <p className="text-foreground font-medium">
                {script.dataGravacao.length === 0
                  ? "Sem data inserida"
                  : convertDate(script.dataGravacao)}
              </p>
            </div>

            {/* DATA DA EXIBIÇÃO */}
            <div>
              <span className="font-medium text-muted-foreground">
                Data da Exibição
              </span>
              <p className="text-foreground font-medium">
                {script.dataExibicao.length === 0
                  ? "Sem data inserida"
                  : convertDate(script.dataExibicao)}
              </p>
            </div>
          </div>
        </CardContent>
      </div>
      <div className="px-4 pt-0 mt-auto">
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={(e) => {
              e.stopPropagation();

              onView(script);
            }} // stopPropagation evita que o clique no botão dispare o clique do Card também
          >
            <Eye className="h-3 w-3" /> Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={(e) => {
              e.stopPropagation();

              onEdit(script);
            }}
          >
            <Edit className="h-3 w-3" />
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 hover:bg-destructive/50 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className="h-3 w-3" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Isso excluirá permanentemente
                  este roteiro dos nossos servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(script.id)}
                  className="bg-destructive text-white font-bold hover:bg-destructive/90"
                >
                  Continuar e Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
