import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClock,
  CalendarIcon,
  PencilLine,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import Select from "react-select";
import { toast } from "sonner";

import UserContext from "@/context/UserContext";
import { useUserCache } from "@/context/UserCacheContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { selectPortalTarget, selectStyles } from "@/lib/selectStyles";
import { customStylesModal } from "@/lib/utils";
import {
  getUsers,
  notificarEdicaoPrograma,
  updatePrograma,
} from "../../../firebaseClient";

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

  const [nome, setNome] = useState(programa?.nome || "");
  const [nomeEspecial, setNomeEspecial] = useState("");
  const [status, setStatus] = useState(programa?.status || "");
  const [dataExibicao, setDataExibicao] = useState(() => {
    if (!programa?.dataExibicao) return null;
    return programa.dataExibicao.toDate?.() || programa.dataExibicao;
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!programa) return;

    if (programa.nome.startsWith("Especial - ")) {
      setNome("Especial");
      setNomeEspecial(programa.nome.replace("Especial - ", ""));
    } else {
      setNome(programa.nome);
      setNomeEspecial("");
    }

    setStatus(programa.status);
    setDataExibicao(() => {
      if (!programa?.dataExibicao) return null;
      return programa.dataExibicao.toDate?.() || programa.dataExibicao;
    });
  }, [programa]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Usuário não autenticado.", { duration: 1500 });
      return;
    }

    setIsSaving(true);

    const oldStatus = programa.status;
    let oldDateString = null;
    if (programa.dataExibicao) {
      const dateObj = programa.dataExibicao.toDate
        ? programa.dataExibicao.toDate()
        : new Date(programa.dataExibicao);
      oldDateString = dateObj.toDateString();
    }

    const editor = getUserById(user.uid);
    const nomeFinal =
      nome === "Especial" && nomeEspecial.trim() !== ""
        ? `Especial - ${nomeEspecial.trim()}`
        : nome;

    const programaData = {
      nome: nomeFinal,
      status,
      dataExibicao,
      lastEditedByName: editor.display_name || "N/D",
    };

    try {
      const success = await updatePrograma(programa.id, programaData);
      if (!success) {
        throw new Error("Falha ao salvar no banco de dados.");
      }

      toast.success("Programa atualizado com sucesso!", { duration: 1500 });

      const newDateString = dataExibicao ? dataExibicao.toDateString() : null;
      const mudancas = [];

      if (oldStatus !== status) {
        mudancas.push({ campo: "Status", de: oldStatus, para: status });
      }

      if (oldDateString !== newDateString) {
        const oldDateFormatted = oldDateString
          ? format(new Date(oldDateString), "dd/MM")
          : "Sem data";
        const newDateFormatted = newDateString
          ? format(new Date(newDateString), "dd/MM")
          : "Sem data";

        mudancas.push({
          campo: "Data",
          de: oldDateFormatted,
          para: newDateFormatted,
        });
      }

      if (mudancas.length > 0) {
        getUsers().then((todosUsuarios) => {
          const idsParaNotificar = todosUsuarios
            .map((u) => u.uid)
            .filter((uid) => uid !== user.uid);

          if (idsParaNotificar.length > 0) {
            notificarEdicaoPrograma(
              { ...programa, ...programaData },
              idsParaNotificar,
              user.display_name,
              mudancas
            );
          }
        });
      }

      onProgramaUpdated({ ...programa, ...programaData });
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar programa.", {
        description: error.message,
        duration: 1500,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (e.defaultPrevented) return;
    if (e.target.type === "button") return;

    const form = e.currentTarget;
    if (!form.reportValidity()) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStylesModal}
      contentLabel="Editar Programa"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="flex max-h-[88vh] flex-col">
          <div className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] px-5 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Atualização
                </span>
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Editar programa
                  </h2>
                  <p className="max-w-2xl text-sm text-slate-600">
                    Ajuste status, nomenclatura e agenda mantendo tudo alinhado
                    com o restante do fluxo.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm hover:bg-white"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    <PencilLine className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Identidade
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      Nome e posicionamento
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Agenda
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      Controle de exibição
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="programa-nome">Nome do Programa</Label>
                <Select
                  inputId="programa-nome"
                  options={programsOptions}
                  styles={selectStyles}
                  menuPortalTarget={selectPortalTarget}
                  value={programsOptions.find((o) => o.value === nome) || null}
                  onChange={(selected) => setNome(selected.value)}
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="programa-status">Status</Label>
                <Select
                  inputId="programa-status"
                  options={statusOptions}
                  styles={selectStyles}
                  menuPortalTarget={selectPortalTarget}
                  value={statusOptions.find((o) => o.value === status) || null}
                  onChange={(selected) => setStatus(selected.value)}
                  required
                />
              </div>
            </div>

            {nome === "Especial" && (
              <div className="space-y-2.5 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4">
                <Label htmlFor="nome-especial">Nome do Especial</Label>
                <input
                  id="nome-especial"
                  type="text"
                  placeholder="Ex: Natal 2025, Carnaval..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  value={nomeEspecial}
                  onChange={(e) => setNomeEspecial(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="dataExibicao">Data de exibição</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="dataExibicao"
                    className={`h-12 w-full justify-start rounded-2xl border-slate-200 bg-white text-left font-normal shadow-sm ${
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
                <PopoverContent className="w-auto rounded-3xl border-slate-200 p-0 shadow-2xl">
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

          <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="text-sm text-slate-500">
              Alterações relevantes podem disparar notificações para a equipe.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2 rounded-xl px-5"
              >
                {isSaving ? (
                  <Save className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
