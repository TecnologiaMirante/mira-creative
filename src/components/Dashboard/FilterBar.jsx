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

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger className="w-full sm:w-48 cursor-pointer">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">
                Todos os status
              </SelectItem>
              <SelectItem className="cursor-pointer" value="Em Revisão">
                Em Revisão
              </SelectItem>
              <SelectItem className="cursor-pointer" value="Aprovado">
                Aprovado
              </SelectItem>
              <SelectItem className="cursor-pointer" value="Em Produção">
                Em Produção
              </SelectItem>
              <SelectItem className="cursor-pointer" value="Exibido">
                Exibido
              </SelectItem>
            </SelectContent>
          </Select>

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
        </div>
      </div>
    </Card>
  );
}
