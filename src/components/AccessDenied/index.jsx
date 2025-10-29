// /src/components/AccessDenied.jsx

import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function AccessDenied() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
      <Card className="w-full max-w-lg text-center shadow-xl border-t-4 border-red-500">
        <CardHeader>
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso Restrito
          </CardTitle>
          <CardDescription className="text-base text-gray-600 pt-2">
            Desculpe, você não tem permissão para acessar esta área.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sua conta de usuário atual não tem o nível de autorização necessário
            para ver este conteúdo.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Se você acredita que isso é um erro, por favor, entre em contato com
            um <strong>administrador</strong> do sistema.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
