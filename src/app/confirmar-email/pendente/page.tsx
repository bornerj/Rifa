import { MagicLinkPanel } from "@/features/auth/components/magic-link-panel";
import { requireCurrentAdmin } from "@/features/auth/session";
import { BrandShell } from "@/components/brand-shell";
import { readProviderEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function PendingEmailConfirmationPage(): Promise<React.JSX.Element> {
  const admin = await requireCurrentAdmin();
  const providers = readProviderEnv();
  const isPreviewMode =
    !providers.BREVO_SMTP_USER ||
    !(providers.BREVO_SMTP_KEY ?? providers.BREVO_API_KEY) ||
    !providers.BREVO_SENDER_EMAIL;

  return (
    <BrandShell
      badge="Confirmacao pendente"
      title={`Confirme o e-mail de ${admin.name}`}
      description="Antes de administrar rifas, precisamos confirmar o dono da conta por e-mail."
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Proximo passo</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isPreviewMode ? (
              <>
                Este ambiente esta em modo de preview. O e-mail real nao sera enviado para{" "}
                <strong>{admin.email}</strong>. Clique em <strong>Enviar novo link</strong> para
                gerar o link de confirmacao diretamente na tela.
              </>
            ) : (
              <>
                Abra a caixa de entrada de <strong>{admin.email}</strong> e clique no link magico.
                Assim que ele for usado, o painel administrativo fica liberado.
              </>
            )}
          </p>
        </section>
        <MagicLinkPanel />
      </div>
    </BrandShell>
  );
}
