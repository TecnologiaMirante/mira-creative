// /src/components/pautas/AdicionarPautaModal.jsx

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { getPautas } from "../../../firebase"; // Função que já criamos
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { useUserCache } from "@/context/UserCacheContext";

// Estilos do Modal (copiado do seu AppSidebar.js para consistência)
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "600px", // Um pouco maior para a lista
    height: "auto",
    maxHeight: "90vh",
    borderRadius: "0.5rem",
    padding: "0", // Vamos controlar o padding
    border: "none",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

// Um item da lista de pautas
function PautaDisponivelItem({ pauta, onAdd, isAdding }) {
  const { getUserById, isLoadingCache } = useUserCache();
  const produtor = getUserById(pauta.produtorId);

  return (
    <div className="flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0">
      <div>
        <h4 className="font-semibold text-slate-800">{pauta.titulo}</h4>
        <p className="text-sm text-slate-500">
          Produtor: {isLoadingCache ? "..." : produtor.display_name}
        </p>
      </div>
      <Button
        size="sm"
        className="gap-1.5 bg-blue-600 hover:bg-blue-700 h-8 px-2 text-xs"
        onClick={() => onAdd(pauta.id)}
        disabled={isAdding}
      >
        <Plus className="h-4 w-4" /> Adicionar
      </Button>
    </div>
  );
}

export function AdicionarPautaModal({
  isOpen,
  onClose,
  espelhoId,
  pautasAtuais,
  onPautaAdded,
}) {
  const [pautasDisponiveis, setPautasDisponiveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPautas = async () => {
      setIsLoading(true);
      const pautasSoltas = await getPautas();

      // Filtra as pautas que já estão no espelho (bom manter por segurança)
      const idsPautasAtuais = new Set(pautasAtuais.map((p) => p.id));
      const disponiveis = pautasSoltas.filter(
        (p) => !idsPautasAtuais.has(p.id)
      );

      setPautasDisponiveis(disponiveis);
      setIsLoading(false);
    };
    fetchPautas();
  }, [isOpen, pautasAtuais]);

  const handleAddPauta = async (pautaId) => {
    setIsAdding(pautaId);

    await onPautaAdded(pautaId);

    setIsAdding(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Adicionar Pauta ao Espelho"
      ariaHideApp={false}
    >
      <div className="flex flex-col">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Adicionar Pauta</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Corpo com a Lista */}
        <div
          className="p-4 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          {isLoading ? (
            <p>Carregando pautas...</p>
          ) : pautasDisponiveis.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              Nenhuma pauta disponível para adicionar.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {pautasDisponiveis.map((pauta) => (
                <PautaDisponivelItem
                  key={pauta.id}
                  pauta={pauta}
                  onAdd={handleAddPauta}
                  isAdding={isAdding === pauta.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
