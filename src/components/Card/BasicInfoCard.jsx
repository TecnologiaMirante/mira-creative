import Select from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const statusOptions = [
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Em Produção", label: "Em Produção" },
  { value: "Finalizado", label: "Finalizado" },
  { value: "Exibido", label: "Exibido" },
];

export function BasicInfoCard({
  // PROPS: Dados e funções recebidos do componente pai
  formData, // O objeto com todos os dados do formulário
  onFormChange, // A função do pai para atualizar o estado
  cidades, // A lista de cidades
  dateError, // A mensagem de erro de data
  isReadOnly = false, // Controla se os campos são editáveis (padrão: false)
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prop 'isReadOnly' em todos os campos para travá-los no modo de visualização */}
          {/* PAUTA  */}
          <div className="space-y-2">
            <Label htmlFor="pauta">Pauta</Label>
            <Input
              id="pauta"
              value={formData.pauta}
              onChange={(e) => onFormChange("pauta", e.target.value)}
              placeholder="Descreva a pauta do roteiro..."
              rows={4}
              required
              readOnly={isReadOnly}
            />
          </div>
          {/* STATUS */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              options={statusOptions}
              value={
                statusOptions.find((o) => o.value === formData.status) || null
              }
              onChange={(selected) => onFormChange("status", selected.value)}
              placeholder="Selecione o status"
              isDisabled={isReadOnly}
              required
            />
          </div>
          {/* PRODUTOR */}
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
          {/* APRESENTADOR(A) */}
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
          {/* CIDADE */}
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Select
              options={cidades.map((c) => ({ value: c, label: c }))}
              value={
                cidades
                  .map((c) => ({ value: c, label: c }))
                  .find((c) => c.value === formData.cidade) || null
              }
              onChange={(selected) => {
                // Lógica de mudança permanece, mas chamando a função do pai
                onFormChange("cidade", selected.value);
                if (selected.value === "MARANHÃO") {
                  onFormChange("bairro", "TODOS");
                } else {
                  onFormChange("bairro", "");
                }
              }}
              placeholder="Selecione a cidade"
              isDisabled={isReadOnly} // Para o react-select, a prop é 'isDisabled'
              required
            />
          </div>
          {/* BAIRRO */}
          <div className="space-y-2">
            <div className="flex flex-row gap-2 items-center">
              <Label htmlFor="bairro">Bairro</Label>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="todosBairros"
                  checked={formData.bairro === "TODOS"}
                  onCheckedChange={(checked) =>
                    onFormChange("bairro", checked ? "TODOS" : "")
                  }
                  disabled={isReadOnly || formData.cidade === "MARANHÃO"}
                />
                <Label htmlFor="todosBairros" className="cursor-pointer">
                  Todos os bairros
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
          {/* DATA DE GRAVAÇÃO */}
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
          {/* DATA DE EXIBIÇÃO */}
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
          {/* Exibe o erro de data se ele existir */}
          {dateError && (
            <div className="md:col-span-2 text-red-600 text-sm -mt-2">
              {dateError}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
