// /src/lib/utils.js

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getStatusClasses = (status) => {
  const statusMap = {
    Aprovado: "border-blue-600 ",
    "Em Produção": "border-amber-600",
    "Em Revisão": "border-pink-600 ",
    Exibido: "border-emerald-600 ",
    Cancelado: "border-red-600 ",
  };
  return statusMap[status] || "border-slate-600";
};

export const getUsersBadgeClasses = (status) => {
  const statusMap = {
    Administrador:
      "bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd] hover:bg-[#dbeafe]",
    Produtor:
      "bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] hover:bg-[#fef3c7]",
    Apresentador:
      "bg-[#d1fae5] text-[#065f46] border border-[#6ee7b7] hover:bg-[#d1fae5]",
    Visualizador:
      "bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] hover:bg-[#fee2e2]",
  };

  return (
    statusMap[status] ||
    "bg-[#f3f4f6] text-[#374151] border border-[#d1d5db] hover:bg-[#f3f4f6]"
  );
};

export const getProgramStyle = (program) => {
  switch (program) {
    case "Daqui":
      return "text-indigo-600 border-indigo-500 fill-indigo-500";
    case "Especial":
      return "text-purple-600 border-purple-500 fill-purple-500";
    default:
      return "text-slate-600 border-slate-500 fill-slate-500";
  }
};

export const getStatusStyle = (status) => {
  const statusStyles = {
    Aprovado: "text-blue-700",
    "Em Produção": "text-amber-700",
    "Em Revisão": "text-pink-700",
    Exibido: "text-emerald-700",
    Cancelado: "text-red-700",
  };

  return statusStyles[status] || "text-slate-700";
};

export const getPdfStatusColors = (status) => {
  switch (status) {
    case "Aprovado":
      return {
        fill: [219, 234, 254],
        text: [30, 64, 175],
        border: [147, 197, 253],
      };
    case "Cancelado":
      return {
        fill: [254, 226, 226],
        text: [159, 18, 57],
        border: [252, 165, 165],
      };
    case "Em Produção":
      return {
        fill: [254, 243, 199],
        text: [146, 64, 14],
        border: [252, 211, 77],
      };
    case "Em Revisão":
      return {
        fill: [252, 231, 243],
        text: [157, 23, 77],
        border: [251, 207, 232],
      };
    case "Exibido":
      return {
        fill: [209, 250, 229],
        text: [6, 95, 70],
        border: [110, 231, 183],
      };

    default:
      return {
        fill: [243, 244, 246],
        text: [31, 41, 55],
        border: [209, 213, 219],
      };
  }
};

export function convertDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("pt-BR");
}

export function convertTimestamp(timestamp) {
  if (!timestamp) return "Não definida";
  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "Data inválida";
  }
}

export const customStylesModal = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "400px",
    height: "auto",
    maxHeight: "90vh",
    borderRadius: "0.5rem",
    padding: "1rem",
  },
};

export function calcularDuracaoTotal(pautas) {
  let totalSegundos = 0;

  pautas.forEach((pauta) => {
    const minutos = parseInt(pauta.duracaoMinutos, 10) || 0;
    const segundos = parseInt(pauta.duracaoSegundos, 10) || 0;
    totalSegundos += minutos * 60 + segundos;
  });

  if (totalSegundos === 0) {
    return "00:00";
  }

  const minutosFinais = Math.floor(totalSegundos / 60);
  const segundosFinais = totalSegundos % 60;

  return `${String(minutosFinais).padStart(2, "0")}:${String(
    segundosFinais
  ).padStart(2, "0")}`;
}
