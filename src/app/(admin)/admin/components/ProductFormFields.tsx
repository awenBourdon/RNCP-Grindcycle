import { BoardType } from '@/lib/utils/enums/enums';
import { UsedBoard } from '@/lib/utils/types/types';
import { formatBoardType } from '@/lib/validations/boards.validation';

interface FormData {
  name: string;
  description: string;
  type: string;
  priceEuro: number;
  pricePoints: number;
  usedBoardId: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ProductFormFieldsProps {
  formData: FormData;
  availableUsedBoards: UsedBoard[];
  errors: FormErrors;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

export const ProductFormFields = ({
  formData,
  availableUsedBoards,
  errors,
  onChange,
}: ProductFormFieldsProps) => {
  const priceEuroError =
    formData.priceEuro < 0 ? 'Le prix ne peut pas être négatif' : null;
  const pricePointsError =
    formData.pricePoints < 0
      ? 'Le nombre de points ne peut pas être négatif'
      : null;
  const nameError =
    formData.name.length > 100
      ? 'Le nom ne peut pas dépasser 100 caractères'
      : null;
  const descriptionError =
    formData.description.length > 1000
      ? 'La description ne peut pas dépasser 1000 caractères'
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <label className="block text-sm text-gray-600 mb-3">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          maxLength={100}
          placeholder="Nom du produit"
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.name || nameError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.name.length}/100 caractères
        </p>
        {(errors.name || nameError) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.name || nameError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-3">
          Type de planche <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(BoardType).map(type => (
            <button
              key={type}
              type="button"
              onClick={() =>
                onChange({
                  target: { name: 'type', value: type },
                } as React.ChangeEvent<HTMLSelectElement>)
              }
              className={`py-3 px-2 rounded-md text-center transition-colors ${
                formData.type === type
                  ? 'bg-[#0a3d3f] text-white'
                  : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {formatBoardType(type)}
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="text-red-500 text-sm mt-1">{errors.type}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-3">
          Prix en Euros <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="9999.99"
            name="priceEuro"
            value={formData.priceEuro || ''}
            onChange={onChange}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
              errors.priceEuro || priceEuroError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
            }`}
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Entre 0.01€ et 9999.99€ (ex: 89.99)
        </p>
        {(errors.priceEuro || priceEuroError) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.priceEuro || priceEuroError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-3">
          Prix en Points <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="999999"
            step="1"
            name="pricePoints"
            value={formData.pricePoints || ''}
            onChange={onChange}
            placeholder="0"
            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
              errors.pricePoints || pricePointsError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
            }`}
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Entre 1 et 999,999 points (ex: 150)
        </p>
        {(errors.pricePoints || pricePointsError) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.pricePoints || pricePointsError}
          </p>
        )}
      </div>

      <div className="col-span-1 md:col-span-2">
        <label
          htmlFor="description"
          className="block text-sm text-gray-600 mb-3"
        >
          Description (optionnel)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Décrivez l'état du produit, son histoire, les défauts éventuels..."
          rows={4}
          maxLength={1000}
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.description || descriptionError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {(errors.description || descriptionError) && (
              <p className="text-red-500 text-sm">
                {errors.description || descriptionError}
              </p>
            )}
          </div>
          <p
            className={`text-sm ${formData.description.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}
          >
            {formData.description.length}/1000
          </p>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2">
        <label
          htmlFor="usedBoardId"
          className="block text-sm text-gray-600 mb-3"
        >
          Planche d&apos;occasion à recycler
        </label>
        <select
          id="usedBoardId"
          name="usedBoardId"
          value={formData.usedBoardId}
          onChange={onChange}
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.usedBoardId
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
        >
          <option value="">Produit pas lié à une planche réhabilitée</option>
          <optgroup label="Planches disponibles pour recyclage">
            {availableUsedBoards.map(board => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </optgroup>
        </select>
        {errors.usedBoardId && (
          <p className="text-red-500 text-sm mt-1">{errors.usedBoardId}</p>
        )}
        {formData.usedBoardId ? (
          <p className="text-xs text-gray-500 mt-2">
            Cette planche sera automatiquement marquée comme &quot;Recyclée en
            produit&quot; après création.
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-2">
            Ce produit sera créé indépendamment, sans lien avec une planche
            réhabilitée.
          </p>
        )}
      </div>
    </div>
  );
};
