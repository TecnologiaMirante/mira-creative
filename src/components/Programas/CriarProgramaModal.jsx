// /src/components/programas/CriarProgramaModal.jsx

import { useContext, useState } from "react";
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
import { createPrograma } from "../../../firebase"; // Importe a função
import UserContext from "@/context/UserContext";

// Estilos (Consistente com seu AdicionarPautaModal)
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    borderRadius: "0.5rem",
    padding: "0",
    border: "none",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const programsOptions = [
  { value: "Daqui", label: "Daqui" },
  { value: "Especial", label: "Especial" },
];
const statusOptions = [
  { value: "Em Produção", label: "Em Produção" },
  { value: "Exibido", label: "Exibido" },
  { value: "Cancelado", label: "Cancelado" },
];

export function CriarProgramaModal({ isOpen, onClose, onProgramaCreated }) {
  const { user } = useContext(UserContext);

  const [nome, setNome] = useState("Daqui");
  const [status, setStatus] = useState("Em Produção");
  const [dataExibicao, setDataExibicao] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dataExibicao) {
      toast.error("A data de exibição é obrigatória.");
      return;
    }
    if (!user) {
      toast.error("Usuário não encontrado. Faça login novamente.");
      return;
    }

    setIsSaving(true);
    const programaData = {
      nome,
      status,
      dataExibicao,
      espelhoId: null, // Começa sem espelho
      pautaCount: 0, // Começa com 0 pautas
      lastEditedByName: user?.display_name || "N/D",
      motivoCancelamento: "",
      isVisible: true,
    };

    try {
      const newProgramaId = await createPrograma(programaData);
      if (newProgramaId) {
        toast.success("Programa criado com sucesso!");

        onProgramaCreated({
          id: newProgramaId,
          ...programaData,
          dataExibicao: dataExibicao, // Passa o objeto Date
          editedBy: user.uid, // Passa o ID para o card (caso o cache falhe)
        });
        onClose(); // Fecha o modal
      } else {
        throw new Error("Falha ao retornar ID do novo programa.");
      }
    } catch (error) {
      toast.error("Erro ao criar programa.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Criar Novo Programa"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Criar Programa</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Corpo do Formulário */}
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
              {isSaving ? "Salvando..." : "Salvar Programa"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
