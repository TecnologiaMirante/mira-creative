// /src/components/NotificationCenter/NotificationCenter.jsx

import { useState, useEffect, useContext } from "react";
import { Bell, Trash2, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  listenToNotificacoes,
  markNotificacaoAsRead,
  markAllNotificacoesAsRead,
  deleteNotificacao,
} from "@infra/firebase";
import UserContext from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PopoverArrow, PopoverClose } from "@radix-ui/react-popover";

export function NotificationCenter() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = listenToNotificacoes(user.uid, (data) => {
      setNotificacoes(data);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notificacoes.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notificacao) => {
    if (!notificacao.isRead) {
      await markNotificacaoAsRead(notificacao.id);
    }

    if (notificacao.link) {
      navigate(notificacao.link);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllNotificacoesAsRead(user.uid);
    if (success) {
      toast.success("Todas notificações marcadas como lidas", {
        duration: 1500,
      });
    }
  };

  const handleDeleteNotification = async (e, notificacaoId) => {
    e.stopPropagation();
    const success = await deleteNotificacao(notificacaoId);
    if (success) {
      toast.success("Notificação removida", { duration: 1500 });
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case "programa_criado":
      case "programa_editado":
        return "🎬";
      case "pauta_criada":
      case "pauta_editada":
        return "📝";
      case "roteiro_criado":
      case "roteiro_editado":
        return "📄";
      default:
        return "🔔";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (error) {
      return "";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        side="right"
        align="center"
        sideOffset={8}
      >
        <PopoverArrow className="fill-border" />

        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Notificações</h3>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 gap-1.5 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </Button>
            )}

            <PopoverClose asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </PopoverClose>
          </div>
        </div>

        <ScrollArea className="h-[200px]">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  onClick={() => handleNotificationClick(notificacao)}
                  className={`group relative flex gap-3 p-4 transition-colors cursor-pointer hover:bg-accent ${
                    !notificacao.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(notificacao.tipo)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium ${
                          !notificacao.isRead
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notificacao.titulo}
                      </p>
                      {!notificacao.isRead && (
                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notificacao.mensagem}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notificacao.createdAt)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteNotification(e, notificacao.id)}
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
