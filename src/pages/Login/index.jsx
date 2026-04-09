import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Clapperboard, ShieldCheck } from "lucide-react";

import logoJanela from "../../assets/janelaProduções.png";
import logoMirante from "../../assets/logo_mirante.png";
import UserContext from "../../context/UserContext";
import { LoginButton } from "../../components/LoginButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductionEditorialIllustration } from "@/components/ProductionEditorialIllustration/ProductionEditorialIllustration";

export function Login() {
  const { token } = useContext(UserContext);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home/programas";

  if (token) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#1f2937_0%,#1f3358_42%,#1a4254_100%)] px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <ProductionEditorialIllustration />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_26%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.20),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />

        <div className="absolute left-[-6rem] top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl motion-float" />

        <div
          className="absolute right-[-4rem] top-16 h-80 w-80 rounded-full bg-indigo-500/14 blur-3xl motion-float"
          style={{ animationDelay: "1.4s" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] xl:gap-12">
          <section className="motion-rise flex flex-col justify-between gap-8 lg:min-h-[520px]">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 shadow-[0_18px_38px_-24px_rgba(15,23,42,0.9)] backdrop-blur">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 text-white shadow-[0_16px_30px_-18px_rgba(59,130,246,0.9)]">
                <Clapperboard className="h-6 w-6" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400/90">
                  Portal Editorial
                </p>

                <p className="text-xl font-semibold tracking-tight text-white">
                  Mira Creative
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                Orquestração de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                  Produção
                </span>
              </h1>

              <p className="max-w-md text-base leading-7 text-slate-300/82 sm:text-lg">
                Gerencie todo o ciclo editorial da emissora em um único ambiente
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-3 mt-4 self-start rounded-full border border-white/5 bg-slate-900/30 px-5 py-3 backdrop-blur-sm">
              <img
                src={logoMirante}
                alt="Logo Mirante"
                className="h-10"
                style={{ opacity: 0.5, filter: "brightness(0) invert(1)" }}
              />

              <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                ©{new Date().getFullYear()} Mirante Tecnologia
              </span>
            </div>
          </section>

          <section className="motion-rise" style={{ animationDelay: "0.12s" }}>
            <Card className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(ellipse_at_top_left,_rgba(34,211,238,0.12),_transparent_60%),radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),_transparent_60%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.88))] text-white shadow-[0_36px_90px_-44px_rgba(2,6,23,0.95)] backdrop-blur-xl">
              <CardHeader className="flex flex-col items-center text-center border-b border-white/5 p-8 sm:p-10 pb-6 sm:pb-8">
                <div className="h-16 w-16 mb-5 flex items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-[0_22px_40px_-18px_rgba(59,130,246,0.6)] ring-1 ring-white/20">
                  <img
                    src={logoJanela}
                    alt="Mirante"
                    className="h-8 w-auto drop-shadow-md"
                  />
                </div>

                <CardTitle className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                  Acesso ao Portal
                </CardTitle>

                <CardDescription className="pt-2.5 text-sm leading-6 text-slate-300/80 sm:text-base">
                  Bem-vindo ao{" "}
                  <span className="font-semibold text-slate-200">
                    Mira Creative
                  </span>
                  .
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 p-8 sm:p-10 pt-6 sm:pt-8">
                <LoginButton />

                <div
                  className="mt-2 flex items-start gap-3 rounded-2xl border border-blue-500/10 bg-blue-500/5 px-4 py-3.5 transition-colors hover:bg-blue-500/10"
                  style={typeof rise !== "undefined" ? rise(0.26) : {}}
                >
                  <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-blue-400/80" />

                  <p className="text-[13px] leading-relaxed text-left text-slate-400/90">
                    Acesso exclusivo para colaboradores Mirante.{" "}
                    <span className="mt-1 block font-medium text-slate-300 sm:mt-0 sm:inline">
                      Use seu e-mail corporativo.
                    </span>
                  </p>
                </div>

                <div className="lg:hidden flex items-center justify-center gap-2.5 pt-4">
                  <img
                    src={logoMirante}
                    alt="Mirante"
                    className="h-6 w-auto opacity-20 grayscale"
                  />

                  <span className="text-[11px] font-semibold tracking-[0.2em] text-slate-500/60">
                    © {new Date().getFullYear()} Mirante Tecnologia
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
