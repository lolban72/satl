import ProductCreateForm from "@/app/admin/product/ui/ProductCreateForm"; // путь поправь под твой проект
// или перенеси ProductCreateForm в /admin/products/ui и импортируй оттуда

export default function NewProductPage() {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-lg font-semibold">Добавить товар</div>
      <div className="mt-4">
        <ProductCreateForm />
      </div>
      <p className="mt-3 text-sm text-gray-600">
        Сейчас создаётся товар + один вариант (one/default).
      </p>
    </div>
  );
}
