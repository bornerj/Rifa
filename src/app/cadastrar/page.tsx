import { redirect } from "next/navigation";

import { AuthCard } from "@/features/auth/components/auth-card";
import { getCurrentAdmin } from "@/features/auth/session";
import { registerAdminAction } from "@/features/auth/actions";
import { BrandShell } from "@/components/brand-shell";

export const dynamic = "force-dynamic";

export default async function RegisterPage(): Promise<React.JSX.Element> {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin) {
    redirect("/admin");
  }

  return (
    <BrandShell
      badge="Cadastro"
      title="Crie o primeiro acesso administrativo"
      description="Esse cadastro sera o dono inicial da rifa e recebera o link magico para confirmar o e-mail antes de operar o painel."
    >
      <div className="mx-auto max-w-xl">
        <AuthCard
          title="Cadastrar admin"
          description="Use um e-mail real para testar o fluxo de confirmacao no Vercel. Em ambiente local, o link tambem aparece na tela como fallback."
          action={registerAdminAction}
          submitLabel="Criar conta"
          footerLabel="Ja tem uma conta?"
          footerAction="Entrar"
          footerHref="/entrar"
          fields={[
            { name: "name", label: "Nome", placeholder: "Seu nome" },
            { name: "email", label: "E-mail", type: "email", placeholder: "voce@exemplo.com" },
            { name: "password", label: "Senha", type: "password", placeholder: "Minimo 8 caracteres" },
            {
              name: "confirmPassword",
              label: "Confirmar senha",
              type: "password",
              placeholder: "Repita a senha",
            },
          ]}
        />
      </div>
    </BrandShell>
  );
}
