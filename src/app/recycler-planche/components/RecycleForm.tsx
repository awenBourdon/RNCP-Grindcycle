"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, Recycle, Info } from "lucide-react";

export default function RecycleForm() {
  const [selectedType, setSelectedType] = useState("")
  const [selectedCondition, setSelectedCondition] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewImage(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  
  // TODO : Tout fragmenter en components quand ce sera fonctionnel à 100% avec les vraies données
  return (
    <>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <Link href="/" className="inline-flex items-center mb-12 text-gray-600 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="border-b border-transparent group-hover:border-gray-600 pb-1 transition-colors">
            Retour à l&apos;accueil
          </span>
        </Link>

        {/* Introduction */}
        <div className="mb-12">
          <div className="flex items-start gap-6">
            <div className="bg-[#0a3d3f] p-3 rounded-full text-white">
              <Recycle size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-normal mb-6">Donne une seconde vie à ta planche</h2>
              <p className="text-gray-600 max-w-3xl">
                Remplis ce formulaire pour nous aider à évaluer ta planche. Une fois soumis, nous te contacterons pour
                organiser la collecte et t&apos;informer des points que tu recevras en échange.
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-16">
          <div>
            <h3 className="text-2xl font-normal mb-8">Informations sur ta planche</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm text-gray-600 mb-3">Type de planche</label>
                <div className="grid grid-cols-2 gap-3">
                  {["skate", "cruiser", "longboard"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`py-3 px-4 rounded-md text-center transition-colors ${
                        selectedType === type
                          ? "bg-[#0a3d3f] text-white"
                          : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">Marque de la planche</label>
                <input
                  type="text"
                  placeholder="Ex: Element, Santa Cruz, etc."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">État global</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Neuf", "Bon", "Moyen", "Usé", "Très usé", "Cassé"].map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => setSelectedCondition(condition)}
                      className={`py-3 px-2 rounded-md text-center transition-colors ${
                        selectedCondition === condition
                          ? "bg-[#0a3d3f] text-white"
                          : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">Acheté quand</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                />
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm text-gray-600 mb-3">Longueur (cm)</label>
                  <input
                    type="number"
                    placeholder="Ex: 80"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-3">Largeur (cm)</label>
                  <input
                    type="number"
                    placeholder="Ex: 20"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-gray-600 mb-3">Photos de ta planche</label>
                <div className="bg-[#f8f7f4] p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <Info size={16} className="text-gray-600" />
                    <p className="text-sm text-gray-600">
                      Ajoute au moins une photo montrant l&apos;état général de ta planche. Tu peux ajouter jusqu&apos;à
                      3 photos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`border border-dashed ${
                        previewImage ? "border-[#0a3d3f]" : "border-gray-300"
                      } rounded-lg bg-white p-4 flex flex-col items-center justify-center h-40 relative`}
                    >
                      {previewImage ? (
                        <>
                          <Image
                            src={previewImage || "/placeholder.svg"}
                            alt="Aperçu"
                            fill
                            className="object-contain p-2 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-2 right-2 bg-black text-white w-6 h-6 flex items-center justify-center z-10 rounded-full"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-gray-400 mb-2" />
                          <p className="text-sm text-center text-gray-600 mb-2">Clique ou glisse une photo ici</p>
                          <p className="text-xs text-center text-gray-500">JPG, PNG • Max 5MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageUpload}
                      />
                    </div>

                    {[1, 2].map((index) => (
                      <div
                        key={index}
                        className="border border-dashed border-gray-300 rounded-lg bg-white p-4 flex flex-col items-center justify-center h-40 relative"
                      >
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <p className="text-sm text-center text-gray-600 mb-2">Photo supplémentaire</p>
                        <p className="text-xs text-center text-gray-500">Optionnel</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-gray-600 mb-3">Commentaires (optionnel)</label>
                <textarea
                  placeholder="Informations supplémentaires sur ta planche..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-xl align-center py-4 bg-[#0a3d3f] text-white rounded-full font-normal text-lg hover:bg-[#0a4d4f] transition-colors flex items-center justify-center"
            >
              <Recycle className="mr-2 h-5 w-5" />
              Soumettre ma planche
            </button>
          </div>
        </form>

        <div className="mt-16">
          <h3 className="text-2xl font-normal mb-8">Comment ça fonctionne ?</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f8f7f4] p-6 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
                1
              </div>
              <p className="text-lg font-medium mb-3">Soumets ta planche</p>
              <p className="text-gray-600">Remplis ce formulaire avec les détails de ta planche usée</p>
            </div>

            <div className="bg-[#f8f7f4] p-6 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
                2
              </div>
              <p className="text-lg font-medium mb-3">Nous l&apos;évaluons</p>
              <p className="text-gray-600">Notre équipe évalue ta planche et te propose des points</p>
            </div>

            <div className="bg-[#f8f7f4] p-6 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
                3
              </div>
              <p className="text-lg font-medium mb-3">Échange tes points</p>
              <p className="text-gray-600">Utilise tes points pour acheter une planche recyclée</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}