// /components/roteiros/ScriptForm.js
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Download } from "lucide-react";
import { BasicInfoCard } from "./BasicInfoCard";
import { DetailedScriptCard } from "./DetailedScriptCard ";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const initialState = {
  produtor: "",
  cidade: "",
  bairro: "",
  pauta: "",
  apresentador: "",
  dataGravacao: "",
  dataExibicao: "",
  status: "",
  scriptRows: [],
};

import { toast } from "sonner";

export function ScriptForm({ onCancel, onSave, initialData, mode = "create" }) {
  const [formData, setFormData] = useState(initialState);
  const [scriptRows, setScriptRows] = useState([
    { id: Date.now().toString(), video: "", texto: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [cidades, setCidades] = useState([]);
  const isReadOnly = mode === "view";

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && initialData) {
      setFormData(initialData);
      setScriptRows(
        initialData.scriptRows || [
          { id: Date.now().toString(), video: "", texto: "" },
        ]
      );
    } else {
      setFormData(initialState);
      setScriptRows([{ id: Date.now().toString(), video: "", texto: "" }]);
    }
  }, [initialData, mode]);

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

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const addScriptRow = () =>
    setScriptRows([
      ...scriptRows,
      { id: Date.now().toString(), video: "", texto: "" },
    ]);

  const removeScriptRow = (id) =>
    setScriptRows(scriptRows.filter((row) => row.id !== id));

  const updateScriptRow = (id, field, value) => {
    setScriptRows(
      scriptRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const dataToSave = {
      ...formData,

      scriptRows: scriptRows.filter(
        (row) => row.video.trim() || row.texto.trim()
      ),
    };

    try {
      if (mode === "edit") {
        const scriptDocRef = doc(db, "pautas", initialData.id);
        await updateDoc(scriptDocRef, dataToSave);
      } else {
        await addDoc(collection(db, "pautas"), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }

      toast.success(
        `Roteiro ${mode === "edit" ? "editado" : "salvo"} com sucesso!`,
        {
          duration: 3000,
        }
      );

      onSave?.();
    } catch (error) {
      console.error("Erro ao salvar roteiro:", error);

      toast.error("Falha ao salvar o roteiro.", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mapeia os status para cores
  const getStatusStyle = (status) => {
    switch (status) {
      case "Exibido":
        return {
          fill: [209, 250, 229],
          text: [6, 95, 70],
          border: [110, 231, 183],
        }; // verde
      case "Em Produção":
        return {
          fill: [254, 243, 199],
          text: [146, 64, 14],
          border: [252, 211, 77],
        }; // amarelo
      case "Aprovado":
        return {
          fill: [219, 234, 254],
          text: [30, 64, 175],
          border: [147, 197, 253],
        }; // azul
      case "Em Revisão":
        return {
          fill: [252, 231, 243],
          text: [157, 23, 77],
          border: [251, 207, 232],
        }; // rosa
      default:
        return {
          fill: [243, 244, 246],
          text: [31, 41, 55],
          border: [209, 213, 219],
        }; // cinza
    }
  };

  function convertDate(date) {
    const displaydate = date
      ? new Date(date).toLocaleDateString("pt-BR")
      : "N/A";

    return displaydate;
  }

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    try {
      const response = await fetch("/logo.png");
      const blob = await response.blob();
      const reader = new FileReader();

      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        const imgWidth = 30;
        const imgHeight = 30;
        const x = (pageWidth - imgWidth) / 2;
        const logoY = 15;
        doc.addImage(base64data, "PNG", x, logoY, imgWidth, imgHeight);

        // --- STATUS COMO BADGE ESTILIZADO (em cima, à direita da logo) ---
        if (formData.status) {
          const statusText = formData.status.toUpperCase();
          const colors = getStatusStyle(formData.status);

          const fontSize = 10;
          doc.setFontSize(fontSize);
          doc.setFont("helvetica", "bold");

          const paddingX = 6;
          const textWidth = doc.getTextWidth(statusText);
          const badgeWidth = textWidth + paddingX * 2;
          const badgeHeight = 10;

          const badgeX = pageWidth - badgeWidth - 14; // canto direito
          const badgeY = logoY; // alinhado com a logo no topo

          // Fundo arredondado
          doc.setFillColor(...colors.fill);
          doc.setDrawColor(...colors.border);
          doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, "FD");

          // Texto centralizado
          const textX = badgeX + badgeWidth / 2;
          const textY = badgeY + badgeHeight / 2 + fontSize * 0.15;
          doc.setTextColor(...colors.text);
          doc.text(statusText, textX, textY, { align: "center" });
        }

        // --- TÍTULO DA PAUTA ---
        const pautaTitle = formData.pauta || "Roteiro Sem Título";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);

        const maxTitleWidth = pageWidth * 0.7;
        const lines = doc.splitTextToSize(
          pautaTitle.toUpperCase(),
          maxTitleWidth
        );

        const firstLineY = 55; // Y inicial para o título
        doc.text(lines, pageWidth / 2, firstLineY, { align: "center" });

        // calcula a altura que o título ocupou
        const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
        const titleHeight = lines.length * lineHeight;

        // posição Y logo abaixo do título
        const nextY = firstLineY + titleHeight + 2;

        // --- TABELA DE INFORMAÇÕES ---
        autoTable(doc, {
          startY: nextY,
          body: [
            ["PRODUTOR", formData.produtor || "N/A"],
            ["APRESENTADOR", formData.apresentador || "N/A"],
            ["CIDADE", formData.cidade || "N/A"],
            ["BAIRRO", formData.bairro || "N/A"],
            ["DATA DA GRAVAÇÃO", convertDate(formData.dataGravacao) || "N/A"],
            ["DATA DE EXIBIÇÃO", convertDate(formData.dataExibicao) || "N/A"],
          ],
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 3,
            halign: "left",
            valign: "middle",
            textColor: [0, 0, 0],
          },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 60 },
            1: { cellWidth: "auto" },
          },
        });

        // --- TABELA DE ROTEIRO ---
        const tableData = scriptRows.map((row) => [row.video, row.texto]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 10,
          head: [["VÍDEO", "TEXTO"]],
          body: tableData,
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 3,
            valign: "top",
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
            fontSize: 11,
          },
          columnStyles: {
            0: { cellWidth: 70, fontStyle: "bold" },
            1: { cellWidth: "auto" },
          },
          didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
              `Página ${data.pageNumber} de ${pageCount}`,
              pageWidth - 20,
              pageHeight - 10,
              { align: "right" }
            );
          },
        });

        toast.success("Roteiro exportado com sucesso!", {
          duration: 3000,
        });

        // --- SALVAR ---
        const fileName = `roteiro_${(formData.pauta || "sem_titulo")
          .replace(/\s+/g, "_")
          .toLowerCase()}.pdf`;
        doc.save(fileName);
      };
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Falha ao exportar roteiro.", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
        duration: 3000,
      });
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
            <h1 className="text-3xl font-bold">
              {mode === "edit"
                ? "Editar Roteiro"
                : mode === "view"
                ? "Visualizar Roteiro"
                : "Criar Novo Roteiro"}
            </h1>
          </div>
        </div>

        {isReadOnly && (
          <Button onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <BasicInfoCard
          formData={formData}
          onFormChange={handleInputChange}
          cidades={cidades}
          isReadOnly={isReadOnly}
        />
        <DetailedScriptCard
          scriptRows={scriptRows}
          onAddRow={addScriptRow}
          onRemoveRow={removeScriptRow}
          onUpdateRow={updateScriptRow}
          isReadOnly={isReadOnly}
        />
        {!isReadOnly && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Roteiro"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
