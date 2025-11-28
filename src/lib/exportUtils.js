// /src/lib/exportUtils.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { convertDate, getPdfStatusColors } from "./utils";

// Função auxiliar segura para converter imagem em Base64
const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => {
      console.error("Erro ao carregar imagem:", error);
      resolve(null);
    };
  });
};

export const exportScriptToPDF = async (formData, scriptRows) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  try {
    // 1. Carrega a logo
    const logoBase64 = await getBase64ImageFromURL("/logo.png");

    // 2. Adiciona a logo
    const logoY = 15;
    if (logoBase64) {
      const imgWidth = 30;
      const imgHeight = 30;
      const x = (pageWidth - imgWidth) / 2;
      doc.addImage(logoBase64, "PNG", x, logoY, imgWidth, imgHeight);
    }

    // 3. Badge de Status
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

    // 4. Título da Pauta
    const pautaTitle =
      formData.titulo || formData.pauta || "Roteiro Sem Título";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);

    const maxTitleWidth = pageWidth * 0.7;
    const lines = doc.splitTextToSize(pautaTitle.toUpperCase(), maxTitleWidth);
    const firstLineY = 55;
    doc.text(lines, pageWidth / 2, firstLineY, { align: "center" });

    const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
    const titleHeight = lines.length * lineHeight;
    const nextY = firstLineY + titleHeight + 5;

    // 5. Tabela de Informações (ATUALIZADA COM NOVOS CAMPOS)
    const duracaoFormatada = `${formData.duracaoMinutos || "00"}:${
      formData.duracaoSegundos || "00"
    }`;

    const infoBody = [
      ["PROGRAMA", formData.program || "Não vinculado"],
      [
        "PRODUTOR",
        formData.produtor || formData.produtorNome || "Não vinculado",
      ],
      [
        "APRESENTADOR",
        formData.apresentador || formData.apresentadorNome || "Não vinculado",
      ],
      [
        "ROTEIRISTA",
        formData.roteirista || formData.roteiristaNome || "Não vinculado",
      ],
      ["DURAÇÃO", duracaoFormatada],
      // -------------------------------------
      ["CIDADE", formData.cidade || "Não vinculada"],
      ["BAIRRO", formData.bairro || "Não vinculado"],
      [
        "DATA DA GRAVAÇÃO",
        convertDate(formData.dataGravacaoInicio || formData.dataGravacao),
      ],
      ["DATA DE EXIBIÇÃO", convertDate(formData.dataExibicao)],
    ];

    if (formData.status === "Cancelado") {
      if (formData.motivoCancelamento) {
        infoBody.push(["MOTIVO DO CANCELAMENTO", formData.motivoCancelamento]);
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
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60, fillColor: [245, 245, 245] },
        1: { cellWidth: "auto" },
      },
      didParseCell: function (data) {
        if (formData.status === "Cancelado") {
          const label = data.row.raw[0];
          if (
            label === "MOTIVO DO CANCELAMENTO" ||
            label === "DATA DO CANCELAMENTO"
          ) {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [159, 18, 57];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    // 6. Tabela do Roteiro
    const tableData = scriptRows.map((row) => [
      row.video || "",
      row.texto || "",
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [["VÍDEO / IMAGEM", "TEXTO / LOCUÇÃO"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 11,
        cellPadding: 5,
        valign: "top",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 12,
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: "bold" },
        1: { cellWidth: "auto" },
      },
    });

    toast.success("Roteiro exportado com sucesso!"), { duration: 1500 };

    const fileName = `roteiro_${(pautaTitle || "sem_titulo")
      .replace(/\s+/g, "_")
      .toLowerCase()}.pdf`;

    doc.save(fileName);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.error("Falha ao exportar roteiro.", {
      description: "Verifique se o logo.png está na pasta public.",
    });
  }
};
