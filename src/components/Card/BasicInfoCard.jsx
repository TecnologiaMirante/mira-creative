// /src/components/Card/BasicInfoCardindex.jsx

import Select from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "../ui/textarea";

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
              id="program"
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
            <Label htmlFor="pauta">Pauta</Label>
            <Input
              id="pauta"
              value={formData.pauta}
              onChange={(e) => onFormChange("pauta", e.target.value)}
              placeholder="Descreva a pauta do roteiro"
              required
              readOnly={isReadOnly}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
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
            <Label htmlFor="produtor">Produtor</Label>
            <Input
              id="produtor"
              value={formData.produtor}
              onChange={(e) => onFormChange("produtor", e.target.value)}
              placeholder="Nome do produtor"
              required
              readOnly={isReadOnly}
            />
          </div>

          {/* Apresentador(a) */}
          <div className="space-y-2">
            <Label htmlFor="apresentador">Apresentador(a)</Label>
            <Input
              id="apresentador"
              value={formData.apresentador}
              onChange={(e) => onFormChange("apresentador", e.target.value)}
              placeholder="Nome do(a) apresentador(a)"
              required
              readOnly={isReadOnly}
            />
          </div>

          {/* Cidade */}
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Select
              id="cidade"
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
            <Input
              id="dataGravacao"
              type="date"
              value={formData.dataGravacao}
              onChange={(e) => onFormChange("dataGravacao", e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          {/* Data de Exibição */}
          <div className="space-y-2">
            <Label htmlFor="dataExibicao">Data de exibição</Label>
            <Input
              id="dataExibicao"
              type="date"
              value={formData.dataExibicao}
              onChange={(e) => onFormChange("dataExibicao", e.target.value)}
              readOnly={isReadOnly}
            />
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
                    className="w-full resize-none"
                    readOnly={isReadOnly}
                    required
                  />
                </div>

                {/* Data do Cancelamento */}
                <div className="space-y-2">
                  <Label
                    htmlFor="dataCancelamento"
                    className="font-semibold text-red-800"
                  >
                    Data do Cancelamento
                  </Label>
                  <Input
                    id="dataCancelamento"
                    type="date"
                    value={formData.dataCancelamento || ""}
                    onChange={(e) =>
                      onFormChange("dataCancelamento", e.target.value)
                    }
                    readOnly={isReadOnly}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {dateError && (
            <div className="md:col-span-2 text-red-600 text-sm font-medium">
              {dateError}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
