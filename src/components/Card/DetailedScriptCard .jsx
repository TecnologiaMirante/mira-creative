// /components/roteiros/DetailedScriptCard.js

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Sparkles, LoaderCircle, Check, X } from "lucide-react";

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
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-xl text-gray-900 shrink-0">
          Roteiro Detalhado
        </CardTitle>
        {!isReadOnly && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {hasSuggestions && !isAIAssistantLoading && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDeclineAllSuggestions}
                  className="flex items-center gap-1.5 text-red-600 hover:bg-red-100 hover:text-red-700 h-8 px-2 text-xs"
                >
                  <X size={14} /> Rejeitar tudo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onAcceptAllSuggestions}
                  className="flex items-center gap-1.5 text-green-600 hover:bg-green-100 hover:text-green-700 h-8 px-2 text-xs"
                >
                  <Check size={14} /> Aceitar tudo
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1 self-center" />
              </>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAprimorar}
              className="flex items-center gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed h-8 px-2 text-xs"
              disabled={isAIAssistantLoading || !pauta?.trim()}
            >
              {isAIAssistantLoading ? (
                <>
                  <LoaderCircle size={14} className="animate-spin" />
                  Aprimorando...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Aprimorar
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onAddRow}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 h-8 px-2 text-xs"
            >
              <Plus className="h-4 w-4" /> Adicionar Linha
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto border-t">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b hover:bg-gray-50">
                <TableHead className="px-6 py-2 font-semibold text-gray-700 w-[calc(50%_-_32px)]">
                  Vídeo
                </TableHead>
                <TableHead className="px-6 py-2 font-semibold text-gray-700 w-[calc(50%_-_32px)]">
                  Texto
                </TableHead>
                <TableHead className="w-16 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scriptRows.map((row) => (
                <TableRow key={row.id}>
                  {/* Coluna Vídeo */}
                  <TableCell className="px-6 align-center hover:bg-gray-50">
                    <Textarea
                      value={row.video}
                      onChange={(e) =>
                        onUpdateRow(row.id, "video", e.target.value)
                      }
                      placeholder="Descrição do vídeo..."
                      className="w-full resize-none h-[100px]"
                      readOnly={isReadOnly}
                    />
                    {row.suggestion?.video && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm overflow-y-auto h-[102px]">
                        <div className="flex items-start gap-2 text-amber-700 text-justify whitespace-normal">
                          <Sparkles
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <p>{row.suggestion.video}</p>
                        </div>
                        {!isReadOnly && (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-red-600 hover:bg-red-100"
                              onClick={() =>
                                onDeclineSuggestion(row.id, "video")
                              }
                            >
                              <X size={14} className="mr-1" /> Rejeitar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-green-600 hover:bg-green-100"
                              onClick={() =>
                                onAcceptSuggestion(row.id, "video")
                              }
                            >
                              <Check size={14} className="mr-1" /> Aceitar
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  {/* Coluna Texto */}
                  <TableCell className="px-6 align-center hover:bg-gray-50">
                    <Textarea
                      value={row.texto}
                      onChange={(e) =>
                        onUpdateRow(row.id, "texto", e.target.value)
                      }
                      placeholder="Texto do roteiro..."
                      className="w-full resize-none h-[100px]"
                      readOnly={isReadOnly}
                    />
                    {row.suggestion?.texto && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm overflow-y-auto h-[102px]">
                        <div className="flex items-start gap-2 text-amber-700 text-justify whitespace-normal">
                          <Sparkles
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <p>{row.suggestion.texto}</p>
                        </div>
                        {!isReadOnly && (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-red-600 hover:bg-red-100"
                              onClick={() =>
                                onDeclineSuggestion(row.id, "texto")
                              }
                            >
                              <X size={14} className="mr-1" /> Rejeitar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-green-600 hover:bg-green-100"
                              onClick={() =>
                                onAcceptSuggestion(row.id, "texto")
                              }
                            >
                              <Check size={14} className="mr-1" /> Aceitar
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  {/* Coluna Botão Excluir */}
                  <TableCell className="p-3 text-center align-top w-16">
                    {scriptRows.length > 1 && !isReadOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveRow(row.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8 w-8 mx-auto"
                        disabled={isAIAssistantLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
