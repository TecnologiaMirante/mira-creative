// /src/components/Card/ScriptForm.jsx

import { useState, useEffect, useContext } from "react";
import { createPauta, enviarNotificacaoCriacao } from "../../../firebase";
import { BasicInfoCard } from "./BasicInfoCard";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import UserContext from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useUserCache } from "@/context/UserCacheContext";
import { Button } from "../ui/button";

const initialState = {
  produtorId: "",
  cidade: "",
  bairro: "",
  titulo: "",
  apresentadorId: "",
  roteiristaId: "",
  dataGravacaoInicio: null,
  dataGravacaoFim: null,
  dataExibicao: null,
  duracaoMinutos: "",
  duracaoSegundos: "",
  status: "Em Produção",
  motivoCancelamento: "",
  dataCancelamento: null,
  isVisible: true,
  roteiroId: null,
};

export function ScriptForm({ onCancel, initialData, mode = "create" }) {
  const { user: user } = useContext(UserContext);
  const { getUserById, isLoadingCache } = useUserCache();
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [cidades, setCidades] = useState([]);
  const isReadOnly = mode === "view";
  const [dateValidationError, setDateValidationError] = useState("");

  const navigate = useNavigate();

  // UseEffect para popular dados
  useEffect(() => {
    if (mode === "create") {
      setFormData({
        ...initialState,
        // program: programaNome,
        // espelhoId
      });
    } else if (initialData) {
      setFormData({
        ...initialData,
        // program: initialData.program || programaNome,
      });
    }
  }, [
    initialData,
    mode,
    // programaNome,
    // espelhoId
  ]);

  // useEffect para carregar cidades do IBGE
  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/21/municipios"
    )
      .then((res) => res.json())
      .then((data) => {
        const lista = data.map((c) => c.nome);
        setCidades([
          "MARANHÃO",
          "São Luís",
          ...lista.filter((c) => c !== "São Luís"),
        ]);
      })
      .catch((err) => console.error("Erro ao carregar cidades:", err));
  }, []);

  // useEffect para validar data de exibição
  useEffect(() => {
    const dataInicio = formData.dataGravacaoInicio;
    if (dataInicio && formData.dataExibicao) {
      if (formData.dataExibicao < dataInicio) {
        setDateValidationError(
          "A data de exibição não pode ser anterior à data de gravação."
        );
      } else {
        setDateValidationError("");
      }
    } else {
      setDateValidationError("");
    }
  }, [formData.dataGravacaoInicio, formData.dataExibicao]);

  // Handler de input básico
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };

      if (field === "dataGravacao") {
        if (value?.from) {
          // Se for um range
          newState.dataGravacaoInicio = value.from;
          newState.dataGravacaoFim = value.to || null;
        } else {
          // Se for data única (ou nulo)
          newState.dataGravacaoInicio = value;
          newState.dataGravacaoFim = null;
        }
      }

      if (field === "status" && value !== "Cancelado") {
        newState.motivoCancelamento = "";
        newState.dataCancelamento = "";
      }
      return newState;
    });
  };

  // Handler de envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateValidationError) {
      toast.error("Erro de Validação", {
        description: dateValidationError,
        duration: 1500,
      });
      return;
    }
    if (!user) {
      toast.error("Você não está autenticado."), { duration: 1500 };
      return;
    }

    setIsLoading(true);

    // Separar dados da Pauta e do Roteiro
    const pautaData = {
      // espelhoId,
      produtorId: formData.produtorId,
      apresentadorId: formData.apresentadorId,
      roteiristaId: formData.roteiristaId,
      cidade: formData.cidade,
      bairro: formData.bairro,
      titulo: formData.titulo,
      dataGravacaoInicio: formData.dataGravacaoInicio,
      dataGravacaoFim: formData.dataGravacaoFim,
      dataExibicao: formData.dataExibicao,
      duracaoMinutos: formData.duracaoMinutos || "00",
      duracaoSegundos: formData.duracaoSegundos || "00",
      status: formData.status,
      roteiroId: null,
    };

    try {
      const newPautaId = await createPauta(pautaData, user.uid);
      if (!newPautaId) {
        throw new Error("Falha ao criar o documento da pauta.");
      }

      if (!isLoadingCache) {
        // Envia para o Produtor
        const produtor = getUserById(pautaData.produtorId);
        if (produtor?.email) {
          enviarNotificacaoCriacao(
            produtor.email,
            pautaData.titulo,
            newPautaId,
            "Produtor"
          );
        }

        // Envia para o Apresentador
        const apresentador = getUserById(pautaData.apresentadorId);
        if (apresentador?.email) {
          enviarNotificacaoCriacao(
            apresentador.email,
            pautaData.titulo,
            newPautaId,
            "Apresentador"
          );
        }

        // Envia para o Roteirista
        const roteirista = getUserById(pautaData.roteiristaId);
        if (roteirista?.email) {
          enviarNotificacaoCriacao(
            roteirista.email,
            pautaData.titulo,
            newPautaId,
            "Roteirista"
          );
        }
      }

      toast.success("Pauta criada com sucesso!", { duration: 1500 });
      navigate(-1);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Falha ao salvar.", {
        description: error.message || "Ocorreu um erro inesperado.",
        duration: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Nova Pauta</h1>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <BasicInfoCard
          formData={formData}
          onFormChange={handleInputChange}
          cidades={cidades}
          isReadOnly={isReadOnly}
          dateError={dateValidationError}
          // espelhoId={espelhoId}
          // programaNome={programaNome}
        />
        {!isReadOnly && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Pauta"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
