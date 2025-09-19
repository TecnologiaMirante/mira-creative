// /components/dashboard/DashboardPage.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { StatsGrid } from "./StatsGrid";
import { FilterBar } from "./FilterBar";
import { ScriptList } from "./ScriptList";

export function DashboardPage({ onEditScript, onViewScript }) {
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    produtor: "all",
    apresentador: "all",
    cidade: "all",
    bairro: "all",
  });

  const [filterOptions, setFilterOptions] = useState({
    produtores: [],
    apresentadores: [],
    cidades: [],
    bairros: [],
  });

  useEffect(() => {
    setIsLoading(true);

    // Ordena primeiro por 'createdAt' (decrescente) e depois por 'pauta' (crescente/alfabética)
    const q = query(
      collection(db, "pautas"),
      orderBy("createdAt", "desc"),
      orderBy("pauta", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const scriptsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScripts(scriptsData);

      const produtoresUnicos = [
        ...new Set(scriptsData.map((s) => s.produtor).filter(Boolean)),
      ];
      const apresentadoresUnicos = [
        ...new Set(scriptsData.map((s) => s.apresentador).filter(Boolean)),
      ];
      const cidadesUnicas = [
        ...new Set(scriptsData.map((s) => s.cidade).filter(Boolean)),
      ];
      const bairrosUnicos = [
        ...new Set(scriptsData.map((s) => s.bairro).filter(Boolean)),
      ];

      setFilterOptions({
        produtores: produtoresUnicos,
        apresentadores: apresentadoresUnicos,
        cidades: cidadesUnicas,
        bairros: bairrosUnicos,
      });

      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredScripts = useMemo(() => {
    return scripts.filter((script) => {
      const searchLower = searchQuery.toLowerCase();

      const searchMatch =
        !searchQuery ||
        script.pauta?.toLowerCase().includes(searchLower) ||
        script.apresentador?.toLowerCase().includes(searchLower);

      const statusMatch =
        filters.status === "all" || script.status === filters.status;
      const produtorMatch =
        filters.produtor === "all" || script.produtor === filters.produtor;
      const apresentadorMatch =
        filters.apresentador === "all" ||
        script.apresentador === filters.apresentador;
      const cidadeMatch =
        filters.cidade === "all" || script.cidade === filters.cidade;
      const bairroMatch =
        filters.bairro === "all" || script.bairro === filters.bairro;

      return (
        searchMatch &&
        statusMatch &&
        produtorMatch &&
        apresentadorMatch &&
        cidadeMatch &&
        bairroMatch
      );
    });
  }, [scripts, searchQuery, filters]);

  const stats = useMemo(
    () => ({
      total: scripts.length,
      emProducao: scripts.filter((s) => s.status === "Em Produção").length,
      aprovados: scripts.filter((s) => s.status === "Aprovado").length,
      exibidos: scripts.filter((s) => s.status === "Exibido").length,
    }),
    [scripts]
  );

  const handleDeleteScript = async (scriptId) => {
    if (confirm("Tem certeza que deseja excluir este roteiro?")) {
      await deleteDoc(doc(db, "pautas", scriptId));
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Visão geral dos roteiros e produção
        </p>
      </div>
      <StatsGrid stats={stats} />
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        options={filterOptions}
        resultsCount={filteredScripts.length}
      />
      <ScriptList
        scripts={filteredScripts}
        onViewScript={onViewScript}
        onEditScript={onEditScript}
        onDeleteScript={handleDeleteScript}
        isLoading={isLoading}
        hasActiveFilter={
          searchQuery !== "" ||
          filters.status !== "all" ||
          filters.produtor !== "all" ||
          filters.apresentador !== "all"
        }
      />
    </div>
  );
}
