// /src/components/pautas/SortablePautaCard.jsx

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PautaCard } from "./PautaCard";

export function SortablePautaCard(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Para adicionar estilos ao arrastar
  } = useSortable({ id: props.pauta.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto", // Garante que o item arrastado fique por cima
    opacity: isDragging ? 0.8 : 1, // Dá um efeito de "flutuar"
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PautaCard
        {...props} // Passa as props (pauta, onView, onEdit, onRemove)
        dndAttributes={attributes}
        dndListeners={listeners}
      />
    </div>
  );
}
