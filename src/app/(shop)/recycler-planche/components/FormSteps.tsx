export const FormSteps = () => {
  return (
    <div className="mt-16">
      <h3 className="text-2xl font-normal mb-8">Comment ça fonctionne ?</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#f8f7f4] p-6 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
            1
          </div>
          <p className="text-lg font-medium mb-3">Soumets ta planche</p>
          <p className="text-gray-600">
            Remplis ce formulaire avec les détails de ta planche usée
          </p>
        </div>

        <div className="bg-[#f8f7f4] p-6 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
            2
          </div>
          <p className="text-lg font-medium mb-3">Nous l&rsquo;évaluons</p>
          <p className="text-gray-600">
            Notre équipe évalue ta planche et te donne des points
          </p>
        </div>

        <div className="bg-[#f8f7f4] p-6 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
            3
          </div>
          <p className="text-lg font-medium mb-3">Échange tes points</p>
          <p className="text-gray-600">
            Utilise tes points pour acheter une planche recyclée
          </p>
        </div>
      </div>
    </div>
  )
}
