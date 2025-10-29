import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function Userdialog({ user, onSave }) {
  const [newTypeUser, setNewTypeUser] = useState(user?.typeUser);

  const handleSaveClick = () => {
    if (onSave) {
      onSave(user?.id, newTypeUser);
    }
  };

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <Dialog>
      {/* 1. O GATILHO (Trigger) */}
      {/* O 'asChild' faz com que o Button seja o gatilho, sem criar um botão extra */}
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          onClick={stopPropagation} // Impede que o card seja clicado
        >
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      {/* 2. O CONTEÚDO (Content) */}
      <DialogContent
        className="sm:max-w-[425px]"
        onClick={stopPropagation} // Impede cliques dentro do modal
      >
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Visualize as informações e atualize o tipo de usuário.
          </DialogDescription>
        </DialogHeader>

        {/* 3. O CORPO (Visualização e Formulário) */}
        <div className="grid gap-4 py-4">
          {/* Informações de Visualização */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <span id="name" className="col-span-3 font-medium">
              {user?.display_name || "Não informado"}
            </span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <span id="email" className="col-span-3 font-medium">
              {user?.email || "Não informado"}
            </span>
          </div>

          {/* Campo de Edição (Formulário) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="typeUser" className="text-right">
              Tipo
            </Label>
            <Select value={newTypeUser} onValueChange={setNewTypeUser}>
              <SelectTrigger id="typeUser" className="col-span-3">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {/* Adapte estes valores aos seus 'typeUser' */}
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Produtor">Produtor</SelectItem>
                <SelectItem value="Apresentador">Apresentador</SelectItem>
                <SelectItem value="Visualizador">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 4. O RODAPÉ (Ações) */}
        <DialogFooter>
          {/* Botão de Cancelar (usa DialogClose para fechar) */}
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          {/* Botão de Salvar (usa DialogClose para fechar após o clique) */}
          <DialogClose asChild>
            <Button onClick={handleSaveClick}>Salvar Alterações</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
