type ImageShowcaseGridProps = {
  images: Array<{
    imageUrl: string;
    isRealItemImage?: boolean;
  }>;
  emptyMessage?: string;
  usePlaceholders?: boolean;
};

export function ImageShowcaseGrid({
  images,
  emptyMessage = "As imagens serao carregadas em breve.",
  usePlaceholders = false,
}: ImageShowcaseGridProps): React.JSX.Element {
  if (!images.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        {emptyMessage}
      </div>
    );
  }

  const visibleImages = images.slice(0, 3);

  return (
    <div
      className="max-w-[240px]"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "0.5rem",
      }}
    >
      {visibleImages.map((image, index) => (
        usePlaceholders ? (
          <div
            key={`${image.imageUrl}-${index}`}
            className="flex h-16 items-center justify-center rounded-[1.25rem] border border-slate-200 bg-slate-100 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            Imagem {index + 1}
          </div>
        ) : (
          <a
            key={`${image.imageUrl}-${index}`}
            href={image.imageUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative block h-16 w-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white"
          >
            <img
              src={image.imageUrl}
              alt={`Imagem ${index + 1} do item da rifa`}
              className="block h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-[10px] font-semibold text-white">
              {image.isRealItemImage ? "Imagem real do objeto" : "Ampliar"}
            </div>
          </a>
        )
      ))}

      <div className="flex min-h-16 items-center justify-center rounded-[1.25rem] border border-dashed border-brand-200 bg-brand-50 p-3 text-center text-[11px] font-semibold leading-4 text-brand-800">
        Clique nas imagens para ver ampliado
      </div>
    </div>
  );
}
