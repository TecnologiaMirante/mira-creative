// /components/dashboard/FilterBar.js

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

// --- Opções para os seletores ---
const programsFilterOptions = [
  { value: "all", label: "Todos os programas" },
  { value: "Daqui", label: "Daqui" },
  { value: "Especial", label: "Especial" },
];

const statusFilterOptions = [
  { value: "all", label: "Todos os status" },
  { value: "Aprovado", label: "Aprovado" },
  { value: "Cancelado", label: "Cancelado" },
  { value: "Em Produção", label: "Em Produção" },
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Exibido", label: "Exibido" },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  options,
  resultsCount,
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Roteiros</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie todos os roteiros ({resultsCount} exibidos)
            </p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por pauta..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-  justify-between">
          {/* PROGRAMAS */}
          <Select
            value={filters.programa}
            onValueChange={(value) => onFilterChange("programa", value)}
          >
            <SelectTrigger className="w-full sm:w-48 cursor-pointer">
              <SelectValue placeholder="Filtrar por programa" />
            </SelectTrigger>
            <SelectContent>
              {programsFilterOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* STATUS */}
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger className="w-full sm:w-48 cursor-pointer">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilterOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* CIDADES*/}
          <Select
            value={filters.cidade}
            onValueChange={(value) => onFilterChange("cidade", value)}
          >
            <SelectTrigger className="w-full sm:w-48 cursor-pointer">
              <SelectValue placeholder="Filtrar por cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">
                Todas as cidades
              </SelectItem>
              {options.cidades?.map((cidade) => (
                <SelectItem
                  className="cursor-pointer"
                  key={cidade}
                  value={cidade}
                >
                  {cidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* BAIRROS */}
          <Select
            value={filters.bairro}
            onValueChange={(value) => onFilterChange("bairro", value)}
          >
            <SelectTrigger className="w-full sm:w-48 cursor-pointer">
              <SelectValue placeholder="Filtrar por bairro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">
                Todos os bairros
              </SelectItem>
              {options.bairros?.map((bairro) => (
                <SelectItem
                  className="cursor-pointer"
                  key={bairro}
                  value={bairro}
                >
                  {bairro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* PRODUTORES */}
          <Select
            value={filters.produtor}
            onValueChange={(value) => onFilterChange("produtor", value)}
          >
            <SelectTrigger className="w-full sm:w-48 cursor-pointer">
              <SelectValue placeholder="Filtrar por produtor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">
                Todos os produtores
              </SelectItem>
              {options.produtores?.map((produtor) => (
                <SelectItem
                  className="cursor-pointer"
                  key={produtor}
                  value={produtor}
                >
                  {produtor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* APRESENTADORES */}
          <Select
            value={filters.apresentador}
            onValueChange={(value) => onFilterChange("apresentador", value)}
          >
            <SelectTrigger className="w-full sm:w-48 cursor-pointer">
              <SelectValue placeholder="Filtrar por apresentador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">
                Todos os apresentadores
              </SelectItem>
              {options.apresentadores?.map((apresentador) => (
                <SelectItem
                  className="cursor-pointer"
                  key={apresentador}
                  value={apresentador}
                >
                  {apresentador}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
