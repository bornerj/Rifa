import { notFound } from "next/navigation";

import { BrandShell } from "@/components/brand-shell";
import { DrawSimulationClient } from "@/features/raffles/components/draw-simulation-client";

export const dynamic = "force-dynamic";

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return [];
}

type DrawSimulationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DrawSimulationPage({
  params,
}: DrawSimulationPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <BrandShell
      badge="Simulacao de sorteio"
      title="Tela separada para simular a roleta da rifa"
      description="Veja apenas as cotas com pagamento confirmado e teste visualmente o comportamento do sorteio antes de aprovar o fluxo definitivo."
    >
      <DrawSimulationClient raffleId={id} />
    </BrandShell>
  );
}
