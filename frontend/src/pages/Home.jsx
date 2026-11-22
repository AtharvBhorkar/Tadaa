import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-5xl font-extrabold text-gray-900">
        Tadaa<span className="text-violet-600">!</span>
      </h1>
      <p className="mt-3 text-lg text-gray-500">Kholo aur dekho kya nikla</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/products" className="rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white hover:bg-violet-700">
          Shop products
        </Link>
        <Link to="/mystery" className="rounded-lg border px-5 py-2.5 font-medium hover:bg-gray-50">
          Mystery box
        </Link>
      </div>
    </div>
  );
}