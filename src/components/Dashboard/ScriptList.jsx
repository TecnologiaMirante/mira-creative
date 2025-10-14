import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ScriptCard } from "./ScriptCard";

export function ScriptList({
  scripts,
  onViewScript,
  onEditScript,
  onDeleteScript,
  isLoading,
  hasActiveFilter,
}) {
  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Carregando roteiros...</p>
      </Card>
    );
  }

  if (scripts.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {hasActiveFilter
              ? "Nenhum roteiro encontrado"
              : "Nenhum roteiro cadastrado"}
          </h3>
          <p className="text-muted-foreground">
            {hasActiveFilter
              ? "Tente ajustar os filtros para encontrar o que procura"
              : "Comece criando seu primeiro roteiro"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    // AUMENTADO O ESPAÇAMENTO PARA OS CARDS RESPIRAREM MELHOR
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scripts.map((script) => (
        <ScriptCard
          key={script.id}
          script={script}
          onView={onViewScript}
          onEdit={onEditScript}
          onDelete={onDeleteScript}
        />
      ))}
    </div>
  );
}
