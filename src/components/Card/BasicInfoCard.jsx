// /src/components/Card/BasicInfoCard.jsx

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
import { AlertTriangle, CalendarIcon, Link2Off, Loader2 } from "lucide-react";
import { useUserCache } from "@/context/UserCacheContext";
import { useEffect, useMemo, useState } from "react";
import { Switch } from "../ui/switch";
import { getPrograma, removePautaFromEspelho } from "../../../firebase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

const statusOptions = [
  { value: "Aprovado", label: "Aprovado" },
  { value: "Em Produção", label: "Em Produção" },
  { value: "Exibido", label: "Exibido" },
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Cancelado", label: "Cancelado" },
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "40px",
    height: "40px",
    boxShadow: state.isFocused ? "0 0 0 2px #e0e7ff" : "none",
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
  const { userCache, isLoadingCache = true } = useUserCache() || {};
  const [isRangeMode, setIsRangeMode] = useState(!!formData.dataGravacaoFim);

  const [nomePrograma, setNomePrograma] = useState("Carregando...");
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    const fetchNome = async () => {
      if (!formData?.programaId) {
        setNomePrograma("Programa não vinculado");
        return;
      }

      const programaData = await getPrograma(formData.programaId);

      if (programaData) {
        setNomePrograma(programaData.nome);
      } else {
        setNomePrograma("Programa não encontrado");
      }
    };

    fetchNome();
  }, [formData.programaId]); // Só roda se o ID mudar

  useEffect(
    () => setIsRangeMode(!!formData.dataGravacaoFim),
    [formData.dataGravacaoFim]
  );

  const userOptions = useMemo(() => {
    if (isLoadingCache || !userCache) return []; // Proteção contra 'undefined'
    return [...userCache.values()].map((user) => ({
      value: user.uid,
      label: user.display_name,
    }));
  }, [userCache, isLoadingCache]);

  const selectedDate = useMemo(() => {
    if (isRangeMode) {
      return {
        from: formData.dataGravacaoInicio || null,
        to: formData.dataGravacaoFim || null,
      };
    }
    return formData.dataGravacaoInicio || null;
  }, [formData.dataGravacaoInicio, formData.dataGravacaoFim, isRangeMode]);

  const handleDateSelect = (value) => {
    if (isRangeMode) {
      onFormChange("dataGravacao", {
        from: value?.from || null,
        to: value?.to || null,
      });
    } else {
      onFormChange("dataGravacao", value || null);
    }
  };

  const handleRangeToggle = (isRange) => {
    setIsRangeMode(isRange);
    onFormChange("dataGravacao", null); // Limpa as datas
  };

  const handleUnlink = async () => {
    if (!formData.programaId || !formData.espelhoId) {
      toast.error("Dados incompletos para desvincular."), { duration: 1500 };
      return;
    }

    setIsUnlinking(true);
    try {
      const success = await removePautaFromEspelho(
        formData.espelhoId,
        formData,
        formData.programaId
      );

      if (success) {
        toast.success("Pauta desvinculada do programa com sucesso!", {
          duration: 1500,
        });
        onFormChange("programaId", null);
        onFormChange("espelhoId", null);
        setNomePrograma("Programa não vinculado");
      } else {
        toast.error("Erro ao desvincular pauta."), { duration: 1500 };
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro interno."), { duration: 1500 };
    } finally {
      setIsUnlinking(false);
    }
  };

  const renderLabel = () => {
    const inicio = formData.dataGravacaoInicio;
    const fim = formData.dataGravacaoFim;

    if (!inicio) return "Selecione uma data";

    // As datas aqui já são objetos Date, pois a PautaDetailPage as formatou
    if (isRangeMode && inicio && fim) {
      return (
        <>
          {format(inicio, "PPP", { locale: ptBR })} —{" "}
          {format(fim, "PPP", { locale: ptBR })}
        </>
      );
    }
    if (inicio) {
      // Cobre 'range' com só uma data E 'single'
      return format(inicio, "PPP", { locale: ptBR });
    }
    return "Selecione uma data";
  };

  const handleTimeChange = (field, value) => {
    // Garante que o valor tenha 2 dígitos (ex: "5" -> "05")
    const formattedValue = value.padStart(2, "0");
    onFormChange(field, formattedValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <div className="px-6 pb-2">
        <div className="p-4 bg-slate-100 border rounded-lg space-y-2">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Programa:</span>{" "}
            {nomePrograma}
          </p>
        </div>
        {/* Botão de Desvincular (Só aparece se tiver programaId) */}
        {formData.programaId && !isReadOnly && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isUnlinking}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                title="Desvincular do Programa"
              >
                {isUnlinking ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Link2Off className="h-4 w-4 mr-1" />
                )}
                Desvincular
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desvincular Programa</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover esta pauta do programa? Isso
                  afetará a duração e o espelho do programa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnlink}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Sim, Desvincular
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
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
                if (
                  selected.value === "MARANHÃO" &&
                  formData.bairro !== "TODOS"
                ) {
                  onFormChange("bairro", "TODOS");
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
                  disabled={isReadOnly}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="dataGravacao">Data da gravação</Label>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Única</span>
                <Switch
                  checked={isRangeMode}
                  onCheckedChange={handleRangeToggle}
                  disabled={isReadOnly}
                />
                <span>Intervalo</span>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="dataGravacao"
                  disabled={isReadOnly}
                  className={`w-full justify-start text-left font-normal ${
                    !selectedDate?.from && !selectedDate
                      ? "text-muted-foreground"
                      : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {renderLabel()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode={isRangeMode ? "range" : "single"}
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isReadOnly}
                  initialFocus
                  locale={ptBR}
                  numberOfMonths={isRangeMode ? 2 : 1}
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
                  className={`w-full justify-start text-left font-normal ${
                    !formData.dataExibicao ? "text-muted-foreground" : ""
                  } ${dateError ? "border-red-500 ..." : ""}`}
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
                    (formData.dataGravacaoInicio instanceof Date &&
                      !isNaN(formData.dataGravacaoInicio) &&
                      date < formData.dataGravacaoInicio) ||
                    isReadOnly
                  }
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {dateError && (
              <p className="mt-1.5 ...">
                <AlertTriangle className="h-4 w-4" /> {dateError}
              </p>
            )}
          </div>

          {/* Tempo de reprodução */}
          <div className="space-y-2">
            <Label htmlFor="duracaoMinutos">Duração da Pauta (mm:ss)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="duracaoMinutos"
                type="number"
                placeholder="mm"
                value={formData.duracaoMinutos || ""}
                onChange={(e) => onFormChange("duracaoMinutos", e.target.value)}
                onBlur={(e) =>
                  handleTimeChange("duracaoMinutos", e.target.value)
                }
                className="w-20 text-center"
                readOnly={isReadOnly}
              />
              <span className="font-bold text-slate-500">:</span>
              <Input
                id="duracaoSegundos"
                type="number"
                placeholder="ss"
                value={formData.duracaoSegundos || ""}
                onChange={(e) =>
                  onFormChange("duracaoSegundos", e.target.value)
                }
                onBlur={(e) =>
                  handleTimeChange("duracaoSegundos", e.target.value)
                }
                max={59} // Segundos não podem passar de 59
                className="w-20 text-center"
                readOnly={isReadOnly}
              />
            </div>
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
                    htmlFor="dataCancelamento-popover"
                    className="font-semibold text-red-800"
                  >
                    Data do Cancelamento
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        id="dataCancelamento-popover"
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
