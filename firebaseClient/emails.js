import { auth } from "./config";

export const emailCriacaoPauta = async (
  destinatarioEmail,
  tituloPauta,
  pautaId,
  papel,
) => {
  try {
    const WEBHOOK_URL = "https://eohs4z2pchccj0t.m.pipedream.net";
    const remetenteNome =
      auth.currentUser?.displayName || "Sistema Mira Creative";

    const baseUrl =
      import.meta.env.VITE_PUBLIC_APP_URL || "miracreative.vercel.app";

    const linkDaPauta = `${baseUrl}/home/pautas/${pautaId}`;

    const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

        <div style="background-color: #2563eb; padding: 28px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nova Pauta Criada</h1>
          <p style="color: #dbeafe; margin: 6px 0 0; font-size: 14px;">
            Um novo item foi adicionado ao sistema Mira Creative
          </p>
        </div>

        <div style="padding: 40px 32px; color: #1f2937;">

          <p style="font-size: 16px; line-height: 1.6;">
            Olá! <strong style="color: #2563eb;">${remetenteNome}</strong> criou uma nova pauta:
          </p>

          <h2 style="font-size: 22px; margin: 12px 0 26px; color: #111827;">
            ${tituloPauta}
          </h2>

          <div style="
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
          ">
            <p style="margin: 0 0 10px; font-size: 15px; font-weight: bold; color: #1e3a8a;">
              Informações:
            </p>
            <ul style="list-style: none; padding: 0; margin: 0; margin-top: 12px;">
              <li style="
                margin-bottom: 10px;
                background: #ffffff;
                padding: 12px 15px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
                font-size: 15px;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 10px;
              ">
                <span style="font-size: 10px; color: #2563eb;">●</span>
                Você foi vinculado como&nbsp;<strong style="color: #2563eb;">${papel}</strong>.
              </li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${linkDaPauta}"
              style="
                background-color: #2563eb;
                color: #ffffff;
                padding: 14px 28px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
                display: inline-block;
              ">
              Ver Pauta
            </a>
          </div>

        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} Mira Creative — Sistema automático de notificações.
        </div>

      </div>
    </div>
`;

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: destinatarioEmail,
        subject: `🎬 Nova Pauta Criada: ${tituloPauta}`,
        body: emailHtml,
      }),
    });
  } catch (error) {
    console.error("Erro ao enviar notificação (webhook):", error);
  }
};

export const emailEdicaoPauta = async (
  destinatarios,
  tituloPauta,
  pautaId,
  mudancas,
) => {
  try {
    // Filtra emails vazios ou inválidos
    const emailsValidos = destinatarios.filter(
      (email) => email && email.includes("@"),
    );
    if (emailsValidos.length === 0) return;

    const WEBHOOK_URL = "https://eohs4z2pchccj0t.m.pipedream.net";
    const remetenteNome =
      auth.currentUser?.displayName || "Sistema Mira Creative";

    const baseUrl =
      import.meta.env.VITE_PUBLIC_APP_URL || "http://192.168.7.40:5173";
    const linkDaPauta = `${baseUrl}/home/pautas/${pautaId}`;

    // NOMES BONITOS
    const camposBonitos = {
      titulo: "Título",
      status: "Status",
      produtorId: "Produtor",
      apresentadorId: "Apresentador",
      roteiristaId: "Roteirista",
      cidade: "Cidade",
      bairro: "Bairro",
      duracaoMinutos: "Duração (Minutos)",
      duracaoSegundos: "Duração (Segundos)",
      motivoCancelamento: "Motivo de Cancelamento",
      dataCancelamento: "Data de Cancelamento",
      dataGravacaoInicio: "Início da Gravação",
      dataGravacaoFim: "Fim da Gravação",
      dataExibicao: "Data de Exibição",
    };

    // COR ESPECIAL PARA STATUS (DEPOIS)
    function corStatus(status) {
      if (!status) return "#065f46"; // padrão verde escuro

      const s = status.toLowerCase();

      if (s === "cancelado" || s === "cancelada") return "#b91c1c"; // vermelho
      if (s === "aprovado" || s === "aprovada") return "#15803d"; // verde
      if (s === "pendente") return "#b45309"; // amarelo

      return "#065f46"; // fallback verde
    }

    // MONTA LISTA DE ALTERAÇÕES COM ANTES → DEPOIS
    const detalhesMudancas = mudancas.map((item) => {
      const campoBonito = camposBonitos[item.campo] || item.campo;

      const corDepois =
        item.campo === "status" ? corStatus(item.depois) : "#065f46";

      return {
        campo: campoBonito,
        antes: item.antes,
        depois: item.depois,
        corDepois,
      };
    });

    // HTML DO EMAIL
    const emailHtml = `
  <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background-color: #2563eb; padding: 28px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Pauta Atualizada</h1>
        <p style="color: #dbeafe; margin: 6px 0 0; font-size: 14px;">
          Uma pauta recebeu alterações no sistema Mira Creative
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 40px 32px; color: #1f2937;">

        <p style="font-size: 16px; line-height: 1.6;">
          Olá! <strong style="color: #2563eb;">${remetenteNome}</strong> realizou alterações na pauta:
        </p>

        <h2 style="font-size: 22px; margin: 10px 0 26px; color: #111827;">
          ${tituloPauta}
        </h2>

        <div style="
          background-color: #f8fafc;
          border-left: 4px solid #2563eb;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 30px;
        ">
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: bold; color: #1e3a8a;">
            Alterações realizadas:
          </p>

          <div style="margin-top: 12px;">
            ${detalhesMudancas
              .map(
                (item) => `
                <div style="
                  background: #ffffff;
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  padding: 14px 16px;
                  margin-bottom: 12px;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                ">

                  <div style="
                    font-weight: bold;
                    color: #1e3a8a;
                    margin-bottom: 6px;
                    font-size: 15px;
                  ">
                    ${item.campo}
                  </div>

                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 6px;">
                    <span style="font-weight: bold; color: #b91c1c;">Antes:</span><br>
                    ${item.antes}
                  </div>

                  <div style="font-size: 14px; color: ${item.corDepois}; margin-top: 6px;">
                    <span style="font-weight: bold;">Depois:</span><br>
                    ${item.depois}
                  </div>

                </div>
              `,
              )
              .join("")}
          </div>
        </div>

        <!-- Button -->
        <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
          <a href="${linkDaPauta}"
            style="
              background-color: #2563eb;
              color: #ffffff;
              padding: 14px 28px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              display: inline-block;
            ">
            Ver Pauta Atualizada
          </a>
        </div>

        <!-- Fallback Link -->
        <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 20px;">
          Caso o botão não funcione, copie e cole este link no navegador:<br>
          <a href="${linkDaPauta}" style="color: #2563eb;">${linkDaPauta}</a>
        </p>

      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} Mira Creative — Sistema automático de notificações.
      </div>

    </div>
  </div>
`;

    // ENVIA UM EMAIL POR DESTINATÁRIO
    await Promise.all(
      emailsValidos.map((email) =>
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: `✏️ Pauta Atualizada: ${tituloPauta}`,
            body: emailHtml,
          }),
        }),
      ),
    );
  } catch (error) {
    console.error("Erro ao enviar notificação de edição:", error);
  }
};
