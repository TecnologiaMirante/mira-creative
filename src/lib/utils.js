import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getStatusClasses = (status) => {
  const statusMap = {
    Aprovado:
      "bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd] hover:bg-[#dbeafe]",
    "Em Produção":
      "bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] hover:bg-[#fef3c7]",
    Exibido:
      "bg-[#d1fae5] text-[#065f46] border border-[#6ee7b7] hover:bg-[#d1fae5]",
    "Em Revisão":
      "bg-[#fce7f3] text-[#9d174d] border border-[#f9a8d4] hover:bg-[#fce7f3]",
    Cancelado:
      "bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] hover:bg-[#fee2e2]",
  };
  return (
    statusMap[status] ||
    "bg-[#f3f4f6] text-[#374151] border border-[#d1d5db] hover:bg-[#f3f4f6]"
  );
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
