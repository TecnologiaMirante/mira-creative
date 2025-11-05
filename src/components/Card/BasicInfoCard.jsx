// /src/components/Card/BasicInfoCardindex.jsx

import Select from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { AlertTriangle, CalendarIcon } from "lucide-react";
import { useUserCache } from "@/context/UserCacheContext";
import { useMemo } from "react";

// --- Opções para os seletores ---
const programsOptions = [
  { value: "Daqui", label: "Daqui" },
  { value: "Especial", label: "Especial" },
];

const statusOptions = [
  { value: "Aprovado", label: "Aprovado" },
  { value: "Cancelado", label: "Cancelado" },
  { value: "Em Produção", label: "Em Produção" },
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Exibido", label: "Exibido" },
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "40px",
    height: "40px",
    boxShadow: state.isFocused ? "0 0 0 2px #e0e7ff" : "none", // Anel de foco suave
    borderColor: state.isFocused ? "#a5b4fc" : "#d1d5db",
    "&:hover": {
      borderColor: "#a5b4fc",
    },
    fontSize: "0.875rem",
    borderRadius: "0.375rem",
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "40px",
    padding: "0 8px",
  }),
  input: (provided) => ({ ...provided, margin: "0px" }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (provided) => ({ ...provided, height: "40px" }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#4f46e5"
      : state.isFocused
      ? "#e0e7ff"
      : "white",
    color: state.isSelected ? "white" : "#111827",
    cursor: "pointer",
    fontSize: "0.875rem",
    "&:active": {
      backgroundColor: "#c7d2fe",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    marginTop: "4px",
    zIndex: 20,
  }),
};

export function BasicInfoCard({
  formData,
  onFormChange,
  cidades,
  dateError,
  isReadOnly = false,
}) {
  const { userCache, isLoadingCache } = useUserCache();

  const userOptions = useMemo(() => {
    if (isLoadingCache) return [];
    return [...userCache.values()].map((user) => ({
      value: user.uid, // O ID do usuário
      label: user.display_name, // O Nome do usuário
    }));
  }, [userCache, isLoadingCache]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          {/* PROGRAMA */}
          <div className="space-y-2 md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <Label htmlFor="program" className="font-semibold text-indigo-800">
              Programa
            </Label>
            <Select
              inputId="program"
              options={programsOptions}
              styles={customSelectStyles}
              value={
                programsOptions.find((o) => o.value === formData.program) ||
                null
              }
              onChange={(selected) => onFormChange("program", selected.value)}
              placeholder="Selecione o programa"
              isDisabled={isReadOnly}
              required
            />
          </div>

          {/* Pauta */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Pauta</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => onFormChange("titulo", e.target.value)}
              placeholder="Descreva o título da pauta"
              required
              readOnly={isReadOnly}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              inputId="status"
              styles={customSelectStyles}
              options={statusOptions}
              value={
                statusOptions.find((o) => o.value === formData.status) || null
              }
              onChange={(selected) => onFormChange("status", selected.value)}
              placeholder="Selecione o status"
              required
              isDisabled={isReadOnly}
            />
          </div>

          {/* Produtor */}
          <div className="space-y-2">
            <Label htmlFor="produtorId">Produtor</Label>
            <Select
              inputId="produtorId"
              styles={customSelectStyles}
              options={userOptions}
              value={
                userOptions.find((o) => o.value === formData.produtorId) || null
              }
              onChange={(selected) =>
                onFormChange("produtorId", selected.value)
              }
              placeholder="Selecione o Produtor"
              isLoading={isLoadingCache}
              isDisabled={isReadOnly}
              required
            />
          </div>

          {/* Apresentador */}
          <div className="space-y-2">
            <Label htmlFor="apresentadorId">Apresentador</Label>
            <Select
              inputId="apresentadorId"
              styles={customSelectStyles}
              options={userOptions}
              value={
                userOptions.find((o) => o.value === formData.apresentadorId) ||
                null
              }
              onChange={(selected) =>
                onFormChange("apresentadorId", selected.value)
              }
              placeholder="Selecione o Apresentador"
              isLoading={isLoadingCache}
              isDisabled={isReadOnly}
              required
            />
          </div>

          {/* Roteirista */}
          <div className="space-y-2">
            <Label htmlFor="roteiristaId">Roteirista</Label>
            <Select
              inputId="roteiristaId"
              styles={customSelectStyles}
              options={userOptions}
              value={
                userOptions.find((o) => o.value === formData.roteiristaId) ||
                null
              }
              onChange={(selected) =>
                onFormChange("roteiristaId", selected.value)
              }
              placeholder="Selecione o Roteirista"
              isLoading={isLoadingCache}
              isDisabled={isReadOnly}
              required
            />
          </div>

          {/* Cidade */}
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Select
              inputId="cidade"
              styles={customSelectStyles}
              options={cidades.map((c) => ({ value: c, label: c }))}
              value={
                cidades
                  .map((c) => ({ value: c, label: c }))
                  .find((c) => c.value === formData.cidade) || null
              }
              onChange={(selected) => {
                onFormChange("cidade", selected.value);
                if (selected.value === "MARANHÃO") {
                  onFormChange("bairro", "TODOS");
                } else {
                  onFormChange("bairro", "");
                }
              }}
              placeholder="Selecione a cidade"
              isDisabled={isReadOnly}
              required
            />
          </div>

          {/* Bairro */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bairro">Bairro</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="todosBairros"
                  checked={formData.bairro === "TODOS"}
                  onCheckedChange={(checked) =>
                    onFormChange("bairro", checked ? "TODOS" : "")
                  }
                  disabled={isReadOnly || formData.cidade === "MARANHÃO"}
                />
                <Label
                  htmlFor="todosBairros"
                  className="cursor-pointer text-sm font-normal"
                >
                  Todos
                </Label>
              </div>
            </div>
            <Input
              id="bairro"
              value={formData.bairro}
              onChange={(e) => onFormChange("bairro", e.target.value)}
              placeholder="Bairro de gravação"
              required
              readOnly={isReadOnly || formData.bairro === "TODOS"}
              disabled={formData.cidade === "MARANHÃO"}
            />
          </div>

          {/* Data de Gravação */}
          <div className="space-y-2">
            <Label htmlFor="dataGravacao">Data da gravação</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  id="dataGravacao"
                  disabled={isReadOnly}
                  className={`w-full justify-start text-left font-normal ${
                    !formData.dataGravacao ? "text-muted-foreground" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dataGravacao ? (
                    format(formData.dataGravacao, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dataGravacao}
                  onSelect={(date) => onFormChange("dataGravacao", date)}
                  disabled={isReadOnly}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data de Exibição */}
          <div className="space-y-2">
            <Label htmlFor="dataExibicao">Data de exibição</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  id="dataExibicao"
                  disabled={isReadOnly}
                  // Adiciona borda vermelha se houver erro
                  className={`w-full justify-start text-left font-normal ${
                    !formData.dataExibicao ? "text-muted-foreground" : ""
                  } ${
                    dateError
                      ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
                      : ""
                  }`} // <-- Estilo de erro
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dataExibicao ? (
                    format(formData.dataExibicao, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dataExibicao}
                  onSelect={(date) => onFormChange("dataExibicao", date)}
                  disabled={(date) =>
                    // Garante que a comparação só ocorra se dataGravacao for uma data válida
                    formData.dataGravacao instanceof Date &&
                    !isNaN(formData.dataGravacao)
                      ? date < formData.dataGravacao
                      : false
                  }
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {/* --- EXIBE A MENSAGEM DE ERRO AQUI --- */}
            {dateError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertTriangle className="h-4 w-4" /> {dateError}
              </p>
            )}
          </div>

          {/* Seção de Cancelamento Condicional */}
          {formData.status === "Cancelado" && (
            <div className="md:col-span-2 p-4 rounded-lg border border-red-300 bg-red-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                {/* Motivo do Cancelamento */}
                <div className="space-y-2">
                  <Label
                    htmlFor="motivoCancelamento"
                    className="font-semibold text-red-800"
                  >
                    Motivo do Cancelamento
                  </Label>
                  <Textarea
                    id="motivoCancelamento"
                    value={formData.motivoCancelamento || ""}
                    onChange={(e) =>
                      onFormChange("motivoCancelamento", e.target.value)
                    }
                    placeholder="Descreva o motivo do cancelamento"
                    className="w-full resize-none "
                    readOnly={isReadOnly}
                    required
                  />
                </div>

                {/* Data do Cancelamento */}
                <div className="space-y-2">
                  <Label
                    htmlFor="dataCancelamento-popover" // Mudei htmlFor
                    className="font-semibold text-red-800"
                  >
                    Data do Cancelamento
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        id="dataCancelamento-popover" // Mudei ID
                        disabled={isReadOnly}
                        className={`w-full justify-start text-left bg-red-50 font-normal ${
                          !formData.dataCancelamento
                            ? "text-muted-foreground"
                            : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataCancelamento ? (
                          format(formData.dataCancelamento, "PPP", {
                            locale: ptBR,
                          })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dataCancelamento}
                        onSelect={(date) =>
                          onFormChange("dataCancelamento", date)
                        }
                        disabled={isReadOnly}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
