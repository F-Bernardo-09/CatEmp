import { Link } from "react-router";
import type { ItemDestaque } from "./types";

interface CardItemProps {
  item: ItemDestaque;
}

function CardItem({ item }: CardItemProps) {
  return (
    <Link
      to={item.link}
      className="relative isolate block aspect-[16/9] overflow-hidden rounded-card bg-page shadow-xl transition-transform hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:aspect-[2.2/1]"
    >
      <img
        className="absolute inset-0 size-full object-cover"
        src={item.imagemUrl}
        alt=""
        fetchPriority="high"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-0 p-5 text-text-inverse sm:p-9">
        <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
          {item.titulo}
        </h2>
      </div>
    </Link>
  );
}

export default CardItem;
