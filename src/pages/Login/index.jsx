import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginButton } from "../../components/LoginButton";
import UserContext from "../../context/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Sparkles, Video, Users, Zap } from "lucide-react";

export function Login() {
  const { token } = useContext(UserContext);

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-teal-50 flex items-center justify-center p-4 select-none ">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-yellow-400/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Lado Esquerdo */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-purple-500 to-teal-500 rounded-xl flex items-center justify-center animate-gradient">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-sans font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Mira Creative
              </h1>
            </div>
            <p className="text-xl text-muted-foreground ">
              A plataforma completa para gerenciamento de roteiros e produção
              audiovisual
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Gestão de Roteiros</h3>
                <p className="text-sm text-muted-foreground">
                  Organize e gerencie todos os seus projetos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Colaboração em Equipe</h3>
                <p className="text-sm text-muted-foreground">
                  Trabalhe junto com sua equipe em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold">IA Integrada</h3>
                <p className="text-sm text-muted-foreground">
                  Assistente inteligente para criação de conteúdo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-purple-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto animate-gradient">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold font-sans bg-gradient-to-r from-orange-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-base">
                <p className="text-black-600">
                  Faça login com sua conta{" "}
                  <strong className="text-blue-600">Google da Mirante </strong>
                  para acessar o portal{" "}
                  <strong className="text-blue-600">Mira Creative</strong>
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LoginButton />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Ao continuar, você concorda com nossos{" "}
                  <a href="/" className="text-primary hover:underline">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="/" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
