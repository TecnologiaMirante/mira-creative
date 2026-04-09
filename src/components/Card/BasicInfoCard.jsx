import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarIcon,
  Link2Off,
  Loader2,
  MapPin,
  RadioTower,
  TimerReset,
  Users2,
} from "lucide-react";
import { toast } from "sonner";

import { useUserCache } from "@/context/UserCacheContext";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { selectPortalTarget, selectStyles } from "@/lib/selectStyles";
import { getPrograma } from "../../../firebaseClient";
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

function FieldShell({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

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
      setNomePrograma(
        programaData ? programaData.nome : "Programa não encontrado",
      );
    };

    fetchNome();
  }, [formData.programaId]);

  useEffect(() => {
    setIsRangeMode(!!formData.dataGravacaoFim);
  }, [formData.dataGravacaoFim]);

  const userOptions = useMemo(() => {
    if (isLoadingCache || !userCache) return [];
    return [...userCache.values()]
      .map((user) => ({
        value: user.uid,
        label: user.display_name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [userCache, isLoadingCache]);

  const cityOptions = useMemo(
    () =>
      cidades
        .map((cidade) => ({ value: cidade, label: cidade }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [cidades],
  );

  const selectedDate = useMemo(() => {
    if (isRangeMode) {
      return {
        from: formData.dataGravacaoInicio || null,
        to: formData.dataGravacaoFim || null,
      };
    }
    return formData.dataGravacaoInicio || null;
  }, [formData.dataGravacaoFim, formData.dataGravacaoInicio, isRangeMode]);

  const handleDateSelect = (value) => {
    if (isRangeMode) {
      onFormChange("dataGravacao", {
        from: value?.from || null,
        to: value?.to || null,
      });
      return;
    }

    onFormChange("dataGravacao", value || null);
  };

  const handleRangeToggle = (isRange) => {
    setIsRangeMode(isRange);
    onFormChange("dataGravacao", null);
  };

  const handleUnlink = async () => {
    if (!formData.programaId || !formData.espelhoId) {
      toast.error("Dados incompletos para desvincular.", { duration: 1500 });
      return;
    }

    setIsUnlinking(true);
    try {
      onFormChange("programaId", null);
      onFormChange("espelhoId", null);
      onFormChange("pendingProgramUnlink", true);
      toast.success("Desvinculação preparada. Salve a pauta para confirmar.", {
        duration: 1500,
      });
      setNomePrograma("Programa não vinculado");
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro interno.", { duration: 1500 });
    } finally {
      setIsUnlinking(false);
    }
  };

  const renderLabel = () => {
    const inicio = formData.dataGravacaoInicio;
    const fim = formData.dataGravacaoFim;

    if (!inicio) return "Selecione uma data";
    if (isRangeMode && inicio && fim) {
      return `${format(inicio, "PPP", { locale: ptBR })} até ${format(
        fim,
        "PPP",
        {
          locale: ptBR,
        },
      )}`;
    }
    return format(inicio, "PPP", { locale: ptBR });
  };

  const handleTimeChange = (field, value) => {
    const formattedValue = value.padStart(2, "0");
    onFormChange(field, formattedValue);
  };

  return (
    <Card className="p-0 overflow-hidden border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)]">
      <CardHeader className="p-4 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12)_0%,_transparent_100%)]">
        <div className="space-y-2">
          <CardTitle className="text-2xl tracking-tight text-slate-900">
            Informações da pauta
          </CardTitle>
          <p className="text-sm text-slate-600">
            Organize responsáveis, agenda e dados de produção com uma leitura
            mais clara para edição e conferência.
          </p>
        </div>

        {formData.programaId && !isReadOnly && (
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUnlinking}
                  className="h-9 rounded-xl px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  {isUnlinking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Link2Off className="mr-2 h-4 w-4" />
                  )}
                  Desvincular do programa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desvincular programa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso remove a pauta do espelho e impacta a duração total do
                    programa vinculado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUnlink}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Sim, desvincular
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-5 p-5 sm:p-6">
        {/* PRIMEIRA LINHA DE CARDS: Agora usa grid-cols-1 ou xl:grid-cols-2 iguais */}
        <div className="grid items-stretch gap-5 xl:grid-cols-2">
          {/* Card 1: Identidade editorial */}
          <FieldShell
            icon={RadioTower}
            title="Identidade editorial"
            description="Título, status e posicionamento da pauta"
            className="h-full" // Garante que estique
          >
            {/* O conteúdo interno foi ajustado para preencher o espaço vertical */}
            <div className="flex flex-col gap-4 h-full md:grid md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Pauta</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => onFormChange("titulo", e.target.value)}
                  placeholder="Descreva o título da pauta"
                  required
                  readOnly={isReadOnly}
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  inputId="status"
                  styles={selectStyles}
                  menuPortalTarget={selectPortalTarget}
                  menuPosition="fixed"
                  options={statusOptions}
                  value={
                    statusOptions.find((o) => o.value === formData.status) ||
                    null
                  }
                  onChange={(selected) =>
                    onFormChange("status", selected.value)
                  }
                  placeholder="Selecione o status"
                  required
                  isDisabled={isReadOnly}
                />
              </div>
            </div>
          </FieldShell>

          {/* Card 2: Duração e exibição */}
          <FieldShell
            icon={TimerReset}
            title="Duração e exibição"
            description="Controle de tempo e publicação"
            className="h-full" // Garante que estique para ficar igual ao vizinho
          >
            <div className="flex flex-col gap-4 h-full md:grid md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dataExibicao">Data de exibição</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="dataExibicao"
                      disabled={isReadOnly}
                      className={`h-11 w-full justify-start rounded-2xl border border-slate-200 bg-white text-left font-normal ${
                        !formData.dataExibicao ? "text-muted-foreground" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataExibicao ? (
                        format(formData.dataExibicao, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[1400] w-auto rounded-3xl border-slate-200 p-0 shadow-2xl">
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
                  <p className="flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    {dateError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracaoMinutos">Duração da pauta</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="duracaoMinutos"
                    type="number"
                    placeholder="mm"
                    value={formData.duracaoMinutos || ""}
                    onChange={(e) =>
                      onFormChange("duracaoMinutos", e.target.value)
                    }
                    onBlur={(e) =>
                      handleTimeChange("duracaoMinutos", e.target.value)
                    }
                    className="h-11 w-full rounded-2xl text-center"
                    readOnly={isReadOnly}
                  />
                  <span className="text-xl font-semibold text-slate-400">
                    :
                  </span>
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
                    max={59}
                    className="h-11 w-full rounded-2xl text-center"
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </FieldShell>
        </div>

        {/* SEGUNDA LINHA DE CARDS: Agora usa a mesma grid-cols da primeira */}
        <div className="grid items-stretch gap-5 xl:grid-cols-2 ">
          {/* Card 3: Equipe responsável */}
          <FieldShell
            icon={Users2}
            title="Equipe responsável"
            description="Distribuição de papéis na pauta"
            className="h-full"
          >
            {/* Como tem 3 selects, vamos usar flex flex-col ou grid-cols-3 dependendo do espaço */}
            <div className="flex flex-col gap-4 h-full xl:grid xl:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="produtorId">Produtor</Label>
                <Select
                  inputId="produtorId"
                  styles={selectStyles}
                  menuPortalTarget={selectPortalTarget}
                  menuPosition="fixed"
                  options={userOptions}
                  value={
                    userOptions.find((o) => o.value === formData.produtorId) ||
                    null
                  }
                  onChange={(selected) =>
                    onFormChange("produtorId", selected.value)
                  }
                  placeholder="Selecione"
                  isLoading={isLoadingCache}
                  isDisabled={isReadOnly}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apresentadorId">Apresentador</Label>
                <Select
                  inputId="apresentadorId"
                  styles={selectStyles}
                  menuPortalTarget={selectPortalTarget}
                  menuPosition="fixed"
                  options={userOptions}
                  value={
                    userOptions.find(
                      (o) => o.value === formData.apresentadorId,
                    ) || null
                  }
                  onChange={(selected) =>
                    onFormChange("apresentadorId", selected.value)
                  }
                  placeholder="Selecione"
                  isLoading={isLoadingCache}
                  isDisabled={isReadOnly}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roteiristaId">Roteirista</Label>
                <Select
                  inputId="roteiristaId"
                  styles={selectStyles}
                  menuPortalTarget={selectPortalTarget}
                  menuPosition="fixed"
                  options={userOptions}
                  value={
                    userOptions.find(
                      (o) => o.value === formData.roteiristaId,
                    ) || null
                  }
                  onChange={(selected) =>
                    onFormChange("roteiristaId", selected.value)
                  }
                  placeholder="Selecione"
                  isLoading={isLoadingCache}
                  isDisabled={isReadOnly}
                  required
                />
              </div>
            </div>
          </FieldShell>

          {/* Card 4: Local de gravação */}
          <FieldShell
            icon={MapPin}
            title="Local de gravação"
            description="Cidade, bairro e janela de captação"
            className="h-full"
          >
            <div className="flex flex-col gap-4 h-full xl:grid xl:grid-cols-2 ">
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Select
                    inputId="cidade"
                    styles={selectStyles}
                    menuPortalTarget={selectPortalTarget}
                    menuPosition="fixed"
                    options={cityOptions}
                    value={
                      cityOptions.find((c) => c.value === formData.cidade) ||
                      null
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
                        className="text-sm font-normal text-slate-500"
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
                    className="h-11 rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataGravacao">Data da gravação</Label>
                  <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-600">
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
                      className={`h-11 w-full justify-start rounded-2xl border border-slate-200 bg-white text-left font-normal ${
                        !selectedDate?.from && !selectedDate
                          ? "text-muted-foreground"
                          : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {renderLabel()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[1400] w-auto rounded-3xl border-slate-200 p-0 shadow-2xl">
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
            </div>
          </FieldShell>
        </div>

        {/* ... resto do código (Cancelamento) ... */}

        {formData.status === "Cancelado" && (
          <div className="rounded-[28px] border border-red-200 bg-[linear-gradient(180deg,_rgba(254,242,242,0.95),_rgba(255,255,255,0.96))] p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-500">
                Cancelamento
              </p>
              <p className="mt-1 text-base font-semibold text-red-900">
                Contextualize o motivo e a data do cancelamento
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="motivoCancelamento" className="text-red-900">
                  Motivo do Cancelamento
                </Label>
                <Textarea
                  id="motivoCancelamento"
                  value={formData.motivoCancelamento || ""}
                  onChange={(e) =>
                    onFormChange("motivoCancelamento", e.target.value)
                  }
                  placeholder="Descreva o motivo do cancelamento"
                  className="min-h-[132px] resize-none rounded-2xl border-red-200 bg-white"
                  readOnly={isReadOnly}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dataCancelamento-popover"
                  className="text-red-900"
                >
                  Data do Cancelamento
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="dataCancelamento-popover"
                      disabled={isReadOnly}
                      className={`h-11 w-full justify-start rounded-2xl border-red-200 bg-white text-left font-normal ${
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
                  <PopoverContent className="z-[1400] w-auto rounded-3xl border-slate-200 p-0 shadow-2xl">
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
      </CardContent>
    </Card>
  );
}
