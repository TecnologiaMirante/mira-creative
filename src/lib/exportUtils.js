// c:\Users\victor.moura\Desktop\codes\ReactJS\Mira Creative\src\lib\exportUtils.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { convertDate, getPdfStatusColors } from "./utils";

export const exportScriptToPDF = async (formData, scriptRows) => {
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

      if (formData.status) {
        const statusText = formData.status.toUpperCase();
        const colors = getPdfStatusColors(formData.status);
        const fontSize = 10;
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "bold");
        const paddingX = 6;
        const textWidth = doc.getTextWidth(statusText);
        const badgeWidth = textWidth + paddingX * 2;
        const badgeHeight = 10;
        const badgeX = pageWidth - badgeWidth - 14;
        const badgeY = logoY;
        doc.setFillColor(...colors.fill);
        doc.setDrawColor(...colors.border);
        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, "FD");
        const textX = badgeX + badgeWidth / 2;
        const textY = badgeY + badgeHeight / 2 + fontSize * 0.15;
        doc.setTextColor(...colors.text);
        doc.text(statusText, textX, textY, { align: "center" });
      }

      const pautaTitle = formData.pauta || "Roteiro Sem Título";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      const maxTitleWidth = pageWidth * 0.7;
      const lines = doc.splitTextToSize(
        pautaTitle.toUpperCase(),
        maxTitleWidth
      );
      const firstLineY = 55;
      doc.text(lines, pageWidth / 2, firstLineY, { align: "center" });
      const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
      const titleHeight = lines.length * lineHeight;
      const nextY = firstLineY + titleHeight + 2;

      const infoBody = [
        ["PROGRAMA", formData.program || "N/A"],
        ["PRODUTOR", formData.produtor || "N/A"],
        ["APRESENTADOR", formData.apresentador || "N/A"],
        ["CIDADE", formData.cidade || "N/A"],
        ["BAIRRO", formData.bairro || "N/A"],
        ["DATA DA GRAVAÇÃO", convertDate(formData.dataGravacao)],
        ["DATA DE EXIBIÇÃO", convertDate(formData.dataExibicao)],
      ];

      if (formData.status === "Cancelado") {
        if (formData.motivoCancelamento) {
          infoBody.push([
            "MOTIVO DO CANCELAMENTO",
            formData.motivoCancelamento,
          ]);
        }
        if (formData.dataCancelamento) {
          infoBody.push([
            "DATA DO CANCELAMENTO",
            convertDate(formData.dataCancelamento),
          ]);
        }
      }

      autoTable(doc, {
        startY: nextY,
        body: infoBody,
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
        didParseCell: function (data) {
          if (formData.status === "Cancelado") {
            const isMotivoRow = data.row.raw[0] === "MOTIVO DO CANCELAMENTO";
            const isDataRow = data.row.raw[0] === "DATA DO CANCELAMENTO";

            if (isMotivoRow || isDataRow) {
              data.cell.styles.fillColor = [254, 226, 226];
              data.cell.styles.textColor = [159, 18, 57];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

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

      toast.success("Roteiro exportado com sucesso!", { duration: 3000 });

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
