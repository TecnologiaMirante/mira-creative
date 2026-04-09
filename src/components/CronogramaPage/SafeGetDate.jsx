//src/components/CronogramaPage/SafeGetDate.jsx

// Converte qualquer coisa (Timestamp, Objeto {seconds}, String) para YYYY-MM-DD
export const SafeGetDate = (dateObj) => {
  if (!dateObj) return null;

  // Se for o objeto de range { from: ..., to: ... }, pega o from
  if (dateObj.from) dateObj = dateObj.from;

  try {
    // Caso 1: Timestamp do Firebase (com método toDate)
    if (typeof dateObj.toDate === "function") {
      return dateObj.toDate().toISOString().split("T")[0];
    }
    // Caso 2: Objeto serializado { seconds: 123... } (comum em estados React)
    if (dateObj.seconds) {
      return new Date(dateObj.seconds * 1000).toISOString().split("T")[0];
    }
    // Caso 3: String (YYYY-MM-DD ou ISO)
    if (typeof dateObj === "string") {
      return dateObj.split("T")[0];
    }
    // Caso 4: Objeto Date nativo JS
    if (dateObj instanceof Date) {
      return dateObj.toISOString().split("T")[0];
    }
  } catch (e) {
    console.error("Erro ao converter data:", dateObj, e);
    return null;
  }
  return null;
};
