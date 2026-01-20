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
import {
  createPrograma,
  notificarCriacaoPrograma,
  getUsers,
} from "../../../firebaseClient";
import UserContext from "@/context/UserContext";
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

export function CriarProgramaModal({ isOpen, onClose, onProgramaCreated }) {
  const { user } = useContext(UserContext);

  const [nome, setNome] = useState("Daqui");
  const [nomeEspecial, setNomeEspecial] = useState("");
  const [status, setStatus] = useState("Em Produção");
  const [dataExibicao, setDataExibicao] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Usuário não encontrado. Faça login novamente.", {
        duration: 1500,
      });
      return;
    }

    setIsSaving(true);

    const nomeFinal =
      nome === "Especial" && nomeEspecial.trim() !== ""
        ? `Especial - ${nomeEspecial.trim()}`
        : nome;

    const programaData = {
      nome: nomeFinal,
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
        toast.success("Programa criado com sucesso!", { duration: 1500 });

        // --- BLOCO DE NOTIFICAÇÃO ---
        getUsers().then((todosUsuarios) => {
          // Filtra para não mandar notificação pra você mesmo
          const idsParaNotificar = todosUsuarios
            .map((u) => u.uid)
            .filter((uid) => uid !== user.uid);

          if (idsParaNotificar.length > 0) {
            // Precisamos adicionar o ID que acabou de ser criado ao objeto para o link funcionar
            const programaComId = { ...programaData, id: newProgramaId };

            notificarCriacaoPrograma(
              programaComId,
              idsParaNotificar,
              user.display_name
            );
          }
        });

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
      toast.error("Erro ao criar programa.", {
        description: error.message,
        duration: 1500,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.defaultPrevented) return;
      if (e.target.type === "button") return;

      const form = e.currentTarget;

      // Verifica se o formulário é válido (respeita os 'required')
      // O reportValidity() retorna true se ok, ou false se inválido (e mostra o balão de erro)
      if (!form.reportValidity()) {
        e.preventDefault(); // Impede qualquer outra ação
        return; // Não envia
      }

      // Se estiver válido, força o envio
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStylesModal}
      contentLabel="Criar Novo Programa"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
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
              {nome === "Especial" && (
                <div className="space-y-2">
                  <Label htmlFor="nome-especial">Nome do Especial</Label>
                  <input
                    id="nome-especial"
                    type="text"
                    placeholder="Ex: Natal 2025, Carnaval, 20 anos da emissora..."
                    className="w-full border border-slate-300 rounded-md p-2"
                    value={nomeEspecial}
                    onChange={(e) => setNomeEspecial(e.target.value)}
                    required={nome === "Especial"}
                  />
                </div>
              )}
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
