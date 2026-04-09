import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

function SuggestionBox({
  value,
  onAccept,
  onDecline,
  isReadOnly,
}) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-[linear-gradient(180deg,_rgba(255,251,235,0.95),_rgba(255,255,255,0.92))] p-3">
      <div className="flex items-start gap-2 text-amber-700">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-sm leading-6">{value}</p>
      </div>
      {!isReadOnly && (
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-xl px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onDecline}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Rejeitar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-xl px-3 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            onClick={onAccept}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Aceitar
          </Button>
        </div>
      )}
    </div>
  );
}

export function DetailedScriptCard({
  scriptRows,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  isReadOnly = false,
  isAIAssistantLoading,
  hasSuggestions,
  pauta,
  onAprimorar,
  onAcceptAllSuggestions,
  onDeclineAllSuggestions,
  onAcceptSuggestion,
  onDeclineSuggestion,
}) {
  return (
    <Card className="overflow-hidden border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)]">
      <CardHeader className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.10),_transparent_32%)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl tracking-tight text-slate-900">
              Roteiro detalhado
            </CardTitle>
            <p className="text-sm text-slate-600">
              Edite vídeo e texto lado a lado, com sugestões de IA mais legíveis
              e revisão mais confortável.
            </p>
          </div>

          {!isReadOnly && (
            <div className="flex flex-wrap items-center gap-2">
              {hasSuggestions && !isAIAssistantLoading && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onDeclineAllSuggestions}
                    className="h-9 rounded-xl px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Rejeitar tudo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onAcceptAllSuggestions}
                    className="h-9 rounded-xl px-3 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Aceitar tudo
                  </Button>
                </>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAprimorar}
                className="h-9 rounded-xl border-amber-200 bg-amber-50/80 px-3 text-amber-700 hover:bg-amber-50"
                disabled={isAIAssistantLoading || !pauta?.trim()}
              >
                {isAIAssistantLoading ? (
                  <>
                    <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />
                    Aprimorando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Aprimorar com IA
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onAddRow}
                className="h-9 rounded-xl px-4"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Adicionar linha
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        {scriptRows.map((row, index) => (
          <div
            key={row.id}
            className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-sm"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Bloco de roteiro
                  </p>
                  <p className="text-xs text-slate-500">
                    Vídeo e texto alinhados para edição
                  </p>
                </div>
              </div>

              {scriptRows.length > 1 && !isReadOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveRow(row.id)}
                  className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700"
                  disabled={isAIAssistantLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Vídeo
                  </p>
                </div>
                <Textarea
                  value={row.video}
                  onChange={(e) => onUpdateRow(row.id, "video", e.target.value)}
                  placeholder="Descrição visual do que será captado..."
                  className="min-h-[168px] rounded-3xl border-slate-200 bg-white px-4 py-3 text-sm leading-6"
                  readOnly={isReadOnly}
                />
                <SuggestionBox
                  value={row.suggestion?.video}
                  isReadOnly={isReadOnly}
                  onDecline={() => onDeclineSuggestion(row.id, "video")}
                  onAccept={() => onAcceptSuggestion(row.id, "video")}
                />
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Texto
                  </p>
                </div>
                <Textarea
                  value={row.texto}
                  onChange={(e) => onUpdateRow(row.id, "texto", e.target.value)}
                  placeholder="Texto de locução, passagem ou condução..."
                  className="min-h-[168px] rounded-3xl border-slate-200 bg-white px-4 py-3 text-sm leading-6"
                  readOnly={isReadOnly}
                />
                <SuggestionBox
                  value={row.suggestion?.texto}
                  isReadOnly={isReadOnly}
                  onDecline={() => onDeclineSuggestion(row.id, "texto")}
                  onAccept={() => onAcceptSuggestion(row.id, "texto")}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
