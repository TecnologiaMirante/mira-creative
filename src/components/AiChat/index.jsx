// /components/chat/AiChat.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, ShieldAlert } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Se o usuário deslogar, limpamos o histórico salvo para garantir a privacidade.
      if (!currentUser) {
        localStorage.removeItem("daquiChatHistory");
        // Resetamos o estado para a mensagem inicial
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem("daquiChatHistory", JSON.stringify(messages));
    } catch (error) {
      console.error("Falha ao salvar o histórico do chat:", error);
    }
  }, [messages]);

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

    // Crie uma cópia do histórico atual ANTES de adicionar a nova mensagem
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // ---- INÍCIO DA MUDANÇA ----
      // 1. Formate o histórico para enviar à Cloud Function
      //    Removemos a primeira mensagem (o "Olá!" inicial do bot) para não poluir o contexto
      const chatHistory = currentMessages.slice(1).map((msg) => {
        return {
          role: msg.sender === "ai" ? "model" : "user",
          content: msg.content,
        };
      });

      // 2. Envie o histórico junto com a pergunta
      const result = await askDaqui({ history: chatHistory });
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        // O resultado agora vem de 'result.data.answer'
        content: result.data.answer,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Erro ao chamar a função da IA:", error);
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        content: `Desculpe, ocorreu um erro: ${error.message}`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const parseLinks = (text) => {
    const linkRegex = /\[link:(.*?)\]/g;
    const parts = text.split(linkRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const path = `/${part}`;
        return (
          <Button
            key={index}
            variant="link"
            className="p-0 h-auto text-sm font-semibold"
            onClick={() => navigate(path)}
          >
            Visualizar Roteiro
          </Button>
        );
      }
      return part;
    });
  };
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pergunte ao Daqui</h1>
        <p className="text-muted-foreground">
          Assistente de IA para análise de pautas e roteiros
        </p>
      </div>

      <Card className="flex-1 flex flex-col bg-white border max-h-[calc(100vh-200px)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "ai" && (
                <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-pink-600" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-pink-50 text-foreground border border-pink-100"
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {message.sender === "ai"
                    ? parseLinks(message.content)
                    : message.content}
                </div>
                <span
                  className={`text-xs mt-1 block ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-muted-foreground/70"
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
                  alt="Foto do usuário"
                  className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                />
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-pink-600" />
              </div>
              <div className="bg-pink-50 border border-pink-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua pergunta sobre os roteiros..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            O Daqui pode cometer erros. Considere verificar informações
            importantes.
          </p>
        </div>
      </Card>
    </div>
  );
}
