import { formatPrice } from "../../utils/formatPrice";

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square bg-gray-100">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-400">{product.category}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-gray-800">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          <button
            disabled={outOfStock}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}