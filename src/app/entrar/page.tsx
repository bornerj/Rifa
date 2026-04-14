import { redirect } from "next/navigation";

import { loginAdminAction } from "@/features/auth/actions";
import { AuthCard } from "@/features/auth/components/auth-card";
import { getCurrentAdmin } from "@/features/auth/session";
import { BrandShell } from "@/components/brand-shell";

export const dynamic = "force-dynamic";

export default async function LoginPage(): Promise<React.JSX.Element> {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin?.emailConfirmed) {
    redirect("/admin");
  }

  return (
    <BrandShell
      badge="Acesso"
      title="Entre no painel da sua rifa"
      description="Use o e-mail e a senha cadastrados para administrar suas rifas, acompanhar o status e preparar o sorteio."
    >
      <div className="mx-auto max-w-xl">
        <AuthCard
          title="Entrar"
          description="Se o e-mail ainda nao estiver confirmado, voce podera reenviar o link magico assim que entrar."
          action={loginAdminAction}
          submitLabel="Entrar"
          footerLabel="Ainda nao criou a conta?"
          footerAction="Cadastrar agora"
          footerHref="/cadastrar"
          fields={[
            { name: "email", label: "E-mail", type: "email", placeholder: "voce@exemplo.com" },
            { name: "password", label: "Senha", type: "password", placeholder: "Sua senha" },
          ]}
        />
      </div>
    </BrandShell>
  );
}
