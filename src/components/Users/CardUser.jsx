// /src/components/CardUser/index.jsx
import { Copy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Userdialog } from "./UserDialog";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useContext } from "react";
import UserContext from "@/context/UserContext";
import { getUsersBadgeClasses } from "@/lib/utils";

export function CardUser({ userTeam }) {
  const { user: user } = useContext(UserContext);

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopyEmail = async (e) => {
    e.stopPropagation();

    if (!userTeam?.email) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(userTeam?.email);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = userTeam?.email;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast.success(
        `E-mail do usuário ${userTeam?.display_name} copiado com sucesso!`,
        { duration: 1000 }
      );
    } catch (err) {
      console.error("Falha ao copiar e-mail:", err);
      toast.success(
        `Falha ao copiar e-mail do usuário ${userTeam?.display_name} copiado com sucesso!`,
        { duration: 1000 }
      );
    }
  };

  const handleUpdateUserType = async (userId, newType) => {
    const userDocRef = doc(db, "users", userId);

    try {
      await updateDoc(userDocRef, {
        typeUser: newType,
      });
      toast.success(
        `Tipo de usuário de ${userTeam?.display_name} foi alterado com sucesso!`
      );
    } catch (error) {
      console.error("Erro ao atualizar usuário: ", error);
      toast.error("Falha ao atualizar o tipo de usuário.", { duration: 1000 });
    }
  };

  return (
    <Card
      className="
        relative
        transition-all 
        duration-200 
        ease-in-out 
        cursor-pointer 
        border border-gray-200 
        hover:border-blue-500 
        hover:shadow-lg 
        hover:-translate-y-0.5
      "
    >
      <Tooltip>
        <TooltipTrigger asChild className="absolute top-2 left-2">
          <Button
            className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            variant="ghost"
            size="icon"
            onClick={handleCopyEmail}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-blue-600 rounded-full [&_svg]:invisible"
        >
          <p>Copiar e-mail</p>
        </TooltipContent>
      </Tooltip>

      {userTeam?.id === user?.uid && (
        <div className="absolute top-2 right-0 left-0 flex justify-center items-center">
          <Badge className={getUsersBadgeClasses(userTeam?.typeUser)}>
            Você
          </Badge>
        </div>
      )}

      <div className="absolute bottom-3 right-0 left-0 flex justify-center items-center">
        <Badge className={getUsersBadgeClasses(userTeam?.typeUser)}>
          {userTeam?.typeUser}
        </Badge>
      </div>

      {user?.typeUser === "Administrador" && (
        <div className="absolute top-2 right-2">
          <Userdialog user={userTeam} onSave={handleUpdateUserType} />
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage
              src={userTeam?.photoURL}
              alt={userTeam?.display_name}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
              {getInitials(userTeam?.display_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {userTeam?.display_name}
            </h3>
            <p className="text-sm text-gray-600 truncate">{userTeam?.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
