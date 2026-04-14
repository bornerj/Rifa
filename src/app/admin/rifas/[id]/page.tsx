import { notFound } from "next/navigation";

import { BrandShell } from "@/components/brand-shell";
import { AdminRaffleDetailsClient } from "@/features/raffles/components/admin-raffle-details-client";

export const dynamic = "force-dynamic";

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return [];
}

type AdminRaffleDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminRaffleDetailsPage({
  params,
}: AdminRaffleDetailsPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <BrandShell
      badge="Detalhes da rifa"
      title="Painel detalhado da rifa"
      description="Acompanhe reservas, pagamentos confirmados e o sorteio do jeito que o admin vai usar em producao."
    >
      <AdminRaffleDetailsClient raffleId={id} />
    </BrandShell>
  );
}
