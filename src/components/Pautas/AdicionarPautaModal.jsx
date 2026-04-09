import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { CirclePlus, FileText, Plus, Search, User2, X } from "lucide-react";

import { getPautas } from "../../../firebaseClient";
import { useUserCache } from "@/context/UserCacheContext";
import { Button } from "@/components/ui/button";
import { customStylesModal } from "@/lib/utils";

function PautaDisponivelItem({ pauta, onAdd, isAdding }) {
  const { getUserById, isLoadingCache } = useUserCache();
  const produtor = getUserById(pauta.produtorId);

  return (
    <div className="group rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-600">
            <FileText className="h-3.5 w-3.5" />
            Pauta disponível
          </div>
          <h4 className="truncate text-base font-semibold text-slate-900">
            {pauta.titulo}
          </h4>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
            <User2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">
              Produtor: {isLoadingCache ? "..." : produtor.display_name}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          className="h-10 rounded-xl px-4"
          onClick={() => onAdd(pauta.id)}
          disabled={isAdding}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Vincular
        </Button>
      </div>
    </div>
  );
}

export function AdicionarPautaModal({
  isOpen,
  onClose,
  pautasAtuais,
  onPautaAdded,
}) {
  const navigate = useNavigate();
  const [pautasDisponiveis, setPautasDisponiveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);

    const unsubscribe = getPautas((todasAsPautas) => {
      if (!todasAsPautas) {
        setPautasDisponiveis([]);
        setIsLoading(false);
        return;
      }

      const idsPautasAtuais = new Set(pautasAtuais.map((p) => p.id));

      const disponiveis = todasAsPautas.filter((p) => {
        const naoEstaNesteEspelho = !idsPautasAtuais.has(p.id);
        const naoTemDono = !p.espelhoId;
        return naoEstaNesteEspelho && naoTemDono;
      });

      setPautasDisponiveis(disponiveis);
      setIsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOpen, pautasAtuais]);

  const handleAddPauta = async (pautaId) => {
    setIsAdding(pautaId);
    await onPautaAdded(pautaId);
    setIsAdding(null);
  };

  const handleNavigateToCreate = () => {
    onClose();
    navigate("/home/pautas/create");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStylesModal}
      contentLabel="Vincular Pauta ao Espelho"
      ariaHideApp={false}
    >
      <div className="flex max-h-[88vh] flex-col">
        <div className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">
                <CirclePlus className="h-3.5 w-3.5" />
                Espelho
              </span>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Vincular pauta
                </h2>
                <p className="max-w-2xl text-sm text-slate-600">
                  Escolha uma pauta livre para adicionar ao espelho atual sem
                  perder a organização da grade.
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Disponíveis
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {pautasDisponiveis.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Critério
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Sem vínculo com outro espelho
              </p>
            </div>
          </div>
        </div>

        <div
          className="space-y-3 overflow-y-auto px-5 py-6 sm:px-7"
          style={{ maxHeight: "calc(88vh - 230px)" }}
        >
          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-12 text-center">
              <p className="text-sm text-slate-500">Carregando pautas...</p>
            </div>
          ) : pautasDisponiveis.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-12 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="text-base font-medium text-slate-700">
                Nenhuma pauta disponível para vincular
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Todas as pautas livres já estão sendo usadas ou não existem no
                momento.
              </p>
            </div>
          ) : (
            pautasDisponiveis.map((pauta) => (
              <PautaDisponivelItem
                key={pauta.id}
                pauta={pauta}
                onAdd={handleAddPauta}
                isAdding={isAdding === pauta.id}
              />
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <Button
            variant="link"
            className="h-auto justify-start p-0 text-sm text-indigo-600 hover:text-indigo-700"
            onClick={handleNavigateToCreate}
          >
            Ou cadastrar uma nova pauta
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
