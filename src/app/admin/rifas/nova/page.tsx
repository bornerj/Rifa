import { CreateRaffleForm } from "@/features/raffles/components/create-raffle-form";
import { requireConfirmedAdmin } from "@/features/auth/session";
import { BrandShell } from "@/components/brand-shell";

export const dynamic = "force-dynamic";

export default async function NewRafflePage(): Promise<React.JSX.Element> {
  await requireConfirmedAdmin();

  return (
    <BrandShell
      badge="Nova rifa"
      title="Cadastre a rifa e publique a pagina"
      description="Neste MVP, as imagens entram por URL, o PIX e copiado por payload e o pagamento sera confirmado manualmente depois."
    >
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
        <CreateRaffleForm />
      </section>
    </BrandShell>
  );
}
