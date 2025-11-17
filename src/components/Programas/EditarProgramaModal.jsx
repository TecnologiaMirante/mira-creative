// /src/components/programas/EditarProgramaModal.jsx

import { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { updatePrograma } from "../../../firebase";
import UserContext from "@/context/UserContext";
import { useUserCache } from "@/context/UserCacheContext";
import { customStylesModal } from "@/lib/utils";

const programsOptions = [
  { value: "Daqui", label: "Daqui" },
  { value: "Especial", label: "Especial" },
];

const statusOptions = [
  { value: "Aprovado", label: "Aprovado" },
  { value: "Em Produção", label: "Em Produção" },
  { value: "Exibido", label: "Exibido" },
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Cancelado", label: "Cancelado" },
];

export function EditarProgramaModal({
  isOpen,
  onClose,
  programa,
  onProgramaUpdated,
}) {
  const { user } = useContext(UserContext);
  const { getUserById } = useUserCache();

  const [nome, setNome] = useState(programa.nome);
  const [status, setStatus] = useState(programa.status);
  const [dataExibicao, setDataExibicao] = useState(
    programa.dataExibicao.toDate
      ? programa.dataExibicao.toDate()
      : programa.dataExibicao
  );
  const [isSaving, setIsSaving] = useState(false);

  // Atualiza o estado se a prop 'programa' mudar
  useEffect(() => {
    if (programa) {
      setNome(programa.nome);
      setStatus(programa.status);
      setDataExibicao(
        programa.dataExibicao.toDate
          ? programa.dataExibicao.toDate()
          : programa.dataExibicao
      );
    }
  }, [programa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dataExibicao) {
      toast.error("A data de exibição é obrigatória.");
      return;
    }
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    setIsSaving(true);

    const editor = getUserById(user.uid);
    const programaData = {
      nome,
      status,
      dataExibicao,
      lastEditedByName: editor.display_name || "N/D",
    };

    try {
      const success = await updatePrograma(programa.id, programaData);
      if (success) {
        toast.success("Programa atualizado com sucesso!");
        // Passa os dados atualizados de volta para a lista
        onProgramaUpdated({ ...programa, ...programaData });
        onClose();
      } else {
        throw new Error("Falha ao salvar no banco de dados.");
      }
    } catch (error) {
      toast.error("Erro ao atualizar programa.", {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStylesModal}
      contentLabel="Editar Programa"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">
              Editar Programa
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Corpo do Formulário (pré-preenchido) */}
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="programa-nome">Nome do Programa</Label>
              <Select
                inputId="programa-nome"
                options={programsOptions}
                value={programsOptions.find((o) => o.value === nome)}
                onChange={(selected) => setNome(selected.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="programa-status">Status</Label>
              <Select
                inputId="programa-status"
                options={statusOptions}
                value={statusOptions.find((o) => o.value === status)}
                onChange={(selected) => setStatus(selected.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataExibicao">Data de exibição</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    id="dataExibicao"
                    className={`w-full justify-start text-left font-normal ${
                      !dataExibicao ? "text-muted-foreground" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataExibicao ? (
                      format(dataExibicao, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataExibicao}
                    onSelect={setDataExibicao}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Rodapé */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Save className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
