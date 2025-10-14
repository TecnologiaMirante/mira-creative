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
import { Plus, Trash2 } from "lucide-react";

export function DetailedScriptCard({
  // PROPS: Dados e funções recebidos do componente pai
  scriptRows, // O array com as linhas do roteiro
  onAddRow, // Função para adicionar uma nova linha
  onRemoveRow, // Função para remover uma linha
  onUpdateRow, // Função para atualizar o texto de uma linha
  isReadOnly = false,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-gray-900">
          Roteiro Detalhado
        </CardTitle>
        {/* Só mostra o botão de adicionar se não estiver no modo de visualização */}
        {!isReadOnly && (
          <Button
            type="button"
            onClick={onAddRow}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Adicionar Linha
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 w-1/2">
                  Vídeo
                </TableHead>
                <TableHead className="font-semibold text-gray-900 w-1/2">
                  Texto
                </TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scriptRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="p-2">
                    <Textarea
                      value={row.video}
                      onChange={(e) =>
                        onUpdateRow(row.id, "video", e.target.value)
                      }
                      placeholder="Descrição do vídeo..."
                      rows={3}
                      className="w-full resize-none"
                      readOnly={isReadOnly}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Textarea
                      value={row.texto}
                      onChange={(e) =>
                        onUpdateRow(row.id, "texto", e.target.value)
                      }
                      placeholder="Texto do roteiro..."
                      rows={3}
                      className="w-full resize-none"
                      readOnly={isReadOnly}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    {/* Só mostra o botão de remover se houver mais de uma linha e não for modo de visualização */}
                    {scriptRows.length > 1 && !isReadOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveRow(row.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
