// /components/chat/AiChat.jsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, ShieldAlert, ArrowDown } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../../../firebaseClient"; // Ajuste o caminho conforme sua estrutura
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

// Função auxiliar para carregar histórico
const loadMessagesFromStorage = () => {
  try {
    const savedMessages = localStorage.getItem("daquiChatHistory");
    if (savedMessages) {
      return JSON.parse(savedMessages).map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (error) {
    console.error("Falha ao carregar o histórico do chat:", error);
  }
  return [
    {
      id: "1",
      content:
        "Olá! Sou o Daqui, seu assistente de IA. Pergunte-me qualquer coisa sobre os roteiros cadastrados.",
      sender: "ai",
      timestamp: new Date(),
    },
  ];
};

export function AiChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(loadMessagesFromStorage);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 1. Gerenciamento de Autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        localStorage.removeItem("daquiChatHistory");
        setMessages([
          {
            id: "1",
            content:
              "Olá! Sou o Daqui, seu assistente de IA. Pergunte-me qualquer coisa sobre os roteiros cadastrados.",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Salvar no LocalStorage sempre que houver novas mensagens
  useEffect(() => {
    try {
      const limitedMessages = messages.slice(-20); // salva só as 20 mais recentes
      localStorage.setItem("daquiChatHistory", JSON.stringify(limitedMessages));
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
    }
  }, [messages]);

  // 3. Função de Scroll para o fundo
  const scrollToBottom = (duration = 400) => {
    const container = chatContainerRef.current;
    if (!container) return;

    const start = container.scrollTop;
    const end = container.scrollHeight - container.clientHeight;
    const change = end - start;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing para suavidade extra
      container.scrollTop =
        start +
        change *
          (progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  // 4. Scroll automático ao carregar a página (Instantâneo)
  useEffect(() => {
    // Pequeno timeout para garantir que o DOM renderizou
    const timer = setTimeout(() => {
      scrollToBottom(500);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 5. Scroll automático quando novas mensagens chegam (Suave)
  useEffect(() => {
    // Apenas rola se o usuário já estiver perto do fundo ou se for mensagem enviada por ele
    if (chatContainerRef.current) {
      scrollToBottom(500);
    }
  }, [messages]);

  // 6. Lógica do Botão Flutuante (Detectar Scroll)
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Se a distância do topo + altura da tela for menor que a altura total - 100px,
    // significa que o usuário subiu a tela.
    const isNearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 100;

    setShowScrollButton(!isNearBottom);
  };

  const askDaqui = httpsCallable(functions, "askDaqui");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const currentMessages = [...messages.slice(-19), userMessage];
    setMessages((prev) => [...prev.slice(-19), userMessage]); // Máx 20 mensagens no estado

    setInputValue("");
    setIsLoading(true);

    // Força o scroll para ver a mensagem do usuário
    setTimeout(() => scrollToBottom(), 100);

    try {
      const chatHistory = currentMessages
        .slice(-8)
        .filter((msg, i) => !(i === 0 && msg.sender === "ai"))
        .map((msg) => ({
          role: msg.sender === "ai" ? "model" : "user",
          content: msg.content,
        }));

      const result = await askDaqui({ history: chatHistory });

      setMessages((prev) => [
        ...prev.slice(-19),
        {
          id: (Date.now() + 1).toString(),
          content: result.data.answer,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(-19),
        {
          id: (Date.now() + 1).toString(),
          content: `Desculpe, ocorreu um erro: ${error.message}`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem("daquiChatHistory");
    setMessages([
      {
        id: "1",
        content:
          "Olá! Sou o Daqui, seu assistente de IA. Pergunte-me qualquer coisa sobre os roteiros cadastrados.",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    setTimeout(() => scrollToBottom(200), 50); // Pequena animação opcional
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const parseLinks = (text) =>
    text.split(/\[link:(.*?)\]/g).map((part, idx) => {
      if (idx % 2 === 1) {
        const [rota, id] = part.split("/");
        let label = "";
        let path = "";

        switch (rota) {
          case "pautas":
            label = "Ver Pauta";
            path = `/home/pautas/${id}`;
            break;
          case "programas":
            label = "Ver Programa";
            path = `/home/programas/${id}`;
            break;
          default:
            return part; // Se não reconhecer, mantém o texto
        }

        return (
          <Button
            key={idx}
            variant="link"
            className="p-0 h-auto text-sm font-semibold text-blue-600 hover:text-blue-800"
            onClick={() => navigate(path)}
          >
            {label}
          </Button>
        );
      }
      return part;
    });

  if (!user) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-muted-foreground">
          Você precisa estar logado para usar o assistente de IA.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 h-full flex flex-col relative max-h-screen">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Pergunte ao Daqui</h1>
          <p className="text-lg text-muted-foreground">
            Assistente de IA para análise de pautas e roteiros
          </p>
        </div>
        {messages.some((msg) => msg.sender === "user") && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Limpar chat
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todo o chat?</AlertDialogTitle>

                <AlertDialogDescription>
                  Toda a conversa será apagada{" "}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleClearChat}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Sim, limpar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card className="flex-1 flex flex-col bg-white border shadow-sm overflow-hidden relative">
        {/* Área de Mensagens com Scroll */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6 scroll-smooth"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "ai" && (
                <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center shadow-sm mt-1">
                  <Bot className="w-4 h-4 text-pink-600" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.sender === "ai"
                    ? parseLinks(message.content)
                    : message.content}
                </div>
                <span
                  className={`text-[10px] mt-1 block text-right ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {message.sender === "user" && (
                <img
                  src={user?.photoURL}
                  alt="User"
                  className="w-8 h-8 rounded-full shadow-sm mt-1 border-2 border-white"
                />
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-pink-600 animate-pulse" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex space-x-1 items-center">
                <div
                  className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          )}

          {/* Div invisível para referência do scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Botão Flutuante "Ir para baixo" */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom(500)}
            className="absolute bottom-34 right-8 z-50 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in"
            aria-label="Ir para as mensagens recentes"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}

        {/* Input Area */}
        <div className="border-t bg-white p-4 z-20">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta aqui..."
              className="flex-1 min-h-[44px]"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="h-[44px] px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-[11px] text-gray-400 mt-2 text-center">
            O Daqui pode cometer erros. Verifique as informações importantes.
          </p>
        </div>
      </Card>
    </div>
  );
}
