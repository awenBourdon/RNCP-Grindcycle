import ToTop from "../homeComponents/ToTop";
import Catalog from "./components/Catalog";

export default function CatalogPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-40 pb-16 px-6 text-center bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-normal text-[#010101]">Catalogue</h1>
        </div>
  </div>
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <Catalog />
      </div>
      <ToTop/>
    </div>
  )
}
