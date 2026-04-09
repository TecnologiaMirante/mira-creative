// /src/lib/utils.js

import { clsx } from "clsx";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

export const getProgramStyle = (program) => {
  // Se o programa não estiver definido, retorna o padrão
  if (!program) return "text-slate-600 border-slate-500 fill-slate-500";

  // Verifica exatamente "Daqui"
  if (program === "Daqui") {
    return "text-indigo-600 border-indigo-500 fill-indigo-500";
  }

  // Verifica se COMEÇA com "Especial" (pega "Especial - Carnaval", "Especial - Natal", etc.)
  if (program.startsWith("Especial")) {
    return "text-purple-600 border-purple-500 fill-purple-500";
  }

  // Padrão para qualquer outro caso
  return "text-slate-600 border-slate-500 fill-slate-500";
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

export const getUsersBadgeClasses = (status) => {
  const statusMap = {
    Apresentador:
      "bg-[#fef9c3] text-[#854d0e] border border-[#fde68a] hover:bg-[#fef9c3]",
    Editor:
      "bg-[#dcfce7] text-[#166534] border border-[#86efac] hover:bg-[#dcfce7]",
    Produtor:
      "bg-[#ede9fe] text-[#5b21b6] border border-[#c4b5fd] hover:bg-[#ede9fe]",
    Administrador:
      "bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd] hover:bg-[#dbeafe]",
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
  overlay: {
    background:
      "radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 32%), rgba(15, 23, 42, 0.58)",
    backdropFilter: "blur(10px)",
    zIndex: 1200,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "min(92vw, 760px)",
    maxWidth: "760px",
    height: "auto",
    maxHeight: "88vh",
    overflow: "hidden",
    borderRadius: "28px",
    padding: "0",
    border: "1px solid rgba(226, 232, 240, 0.85)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    boxShadow:
      "0 36px 90px -35px rgba(15, 23, 42, 0.55), 0 12px 30px -20px rgba(99, 102, 241, 0.25)",
    zIndex: 1201,
  },
};

// Função para transformar Segundos Totais em "MM:SS" ou "HH:MM:SS"
export function formatSegundos(totalSegundos) {
  if (!totalSegundos || isNaN(totalSegundos) || totalSegundos < 0) {
    return "00:00";
  }

  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const minFormat = String(minutos).padStart(2, "0");
  const segFormat = String(segundos).padStart(2, "0");

  if (horas > 0) {
    return `${horas}:${minFormat}:${segFormat}`;
  }
  return `${minFormat}:${segFormat}`;
}

// Função auxiliar para calcular segundos totais de um array de pautas
export function calcularTotalEmSegundos(pautas) {
  if (!pautas || !Array.isArray(pautas)) return 0;

  return pautas.reduce((acc, pauta) => {
    const min = parseInt(pauta.duracaoMinutos, 10) || 0;
    const seg = parseInt(pauta.duracaoSegundos, 10) || 0;
    return acc + (min * 60 + seg);
  }, 0);
}

// Sua função antiga pode usar a nova lógica para manter compatibilidade
export function calcularDuracaoTotal(pautas) {
  const total = calcularTotalEmSegundos(pautas);
  return formatSegundos(total);
}

// --- CONFIGURAÇÃO DE CORES E ESTILOS PARA CRONOGRAMA ---
export const getStatusConfig = (status) => {
  const map = {
    Aprovado: {
      bg: "bg-blue-50",
      border: "border-l-4 border-blue-600",
      text: "text-blue-700",
      icon: CheckCircle2,
    },
    "Em Produção": {
      bg: "bg-amber-50",
      border: "border-l-4 border-amber-600",
      text: "text-amber-700",
      icon: Clock3,
    },
    "Em Revisão": {
      bg: "bg-pink-50",
      border: "border-l-4 border-pink-600",
      text: "text-pink-700",
      icon: AlertCircle,
    },
    Exibido: {
      bg: "bg-emerald-50",
      border: "border-l-4 border-emerald-600",
      text: "text-emerald-700",
      icon: PlayCircle,
    },
    Cancelado: {
      bg: "bg-red-50",
      border: "border-l-4 border-red-600",
      text: "text-red-700",
      icon: XCircle,
    },
  };
  return (
    map[status] || {
      bg: "bg-slate-50",
      border: "border-l-4 border-slate-500",
      text: "text-slate-700",
      icon: FileText,
    }
  );
};

export const getProgramConfig = (nomePrograma) => {
  if (nomePrograma === "Daqui") {
    return {
      bg: "bg-indigo-50",
      border: "border-l-4 border-indigo-600",
      text: "text-indigo-700",
    };
  }
  if (nomePrograma?.startsWith("Especial")) {
    return {
      bg: "bg-purple-50",
      border: "border-l-4 border-purple-600",
      text: "text-purple-700",
    };
  }
  return {
    bg: "bg-indigo-50",
    border: "border-l-4 border-indigo-600",
    text: "text-indigo-700",
  };
};
