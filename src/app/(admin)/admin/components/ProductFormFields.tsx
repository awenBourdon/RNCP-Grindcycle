import { BoardType } from '@/lib/utils/enums/enums';
import { UsedBoard } from '@/lib/utils/types/types';

interface FormErrors {
  [key: string]: string;
}

interface ProductFormFieldsProps {
  name: string;
  description: string;
  type: string;
  priceEuro: number;
  pricePoints: number;
  usedBoardId: string;
  availableUsedBoards: UsedBoard[];
  errors: FormErrors;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriceEuroChange: (value: string) => void;
  onPricePointsChange: (value: string) => void;
  onUsedBoardIdChange: (value: string) => void;
}

const BOARD_TYPES = [BoardType.SKATE, BoardType.CRUISER, BoardType.LONG];

const getBoardTypeLabel = (type: BoardType): string => {
  switch (type) {
    case BoardType.SKATE:
      return 'Skate';
    case BoardType.CRUISER:
      return 'Cruiser';
    case BoardType.LONG:
      return 'Long';
    default:
      return type;
  }
};

export const ProductFormFields = ({
  name,
  description,
  type,
  priceEuro,
  pricePoints,
  usedBoardId,
  availableUsedBoards,
  errors,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onPriceEuroChange,
  onPricePointsChange,
  onUsedBoardIdChange,
}: ProductFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <label className="block text-sm text-gray-600 mb-3">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          maxLength={100}
          placeholder="Nom du produit"
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.name
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {name.length}/100 caractères
        </p>
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-3">
          Type de planche <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {BOARD_TYPES.map(boardType => (
            <button
              key={boardType}
              type="button"
              onClick={() => onTypeChange(boardType)}
              className={`py-3 px-2 rounded-md text-center transition-colors text-sm ${
                type === boardType
                  ? 'bg-[#0a3d3f] text-white'
                  : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {getBoardTypeLabel(boardType)}
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
        <input
          type="number"
          step="0.01"
          min="0.01"
          max="9999.99"
          value={priceEuro || ''}
          onChange={e => onPriceEuroChange(e.target.value)}
          placeholder="0.00"
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.priceEuro
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Entre 0.01€ et 9999.99€ (ex: 89.99)
        </p>
        {errors.priceEuro && (
          <p className="text-red-500 text-sm mt-1">{errors.priceEuro}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-3">
          Prix en Points <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          max="999999"
          step="1"
          value={pricePoints || ''}
          onChange={e => onPricePointsChange(e.target.value)}
          placeholder="0"
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.pricePoints
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Entre 1 et 999,999 points (ex: 150)
        </p>
        {errors.pricePoints && (
          <p className="text-red-500 text-sm mt-1">{errors.pricePoints}</p>
        )}
      </div>

      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm text-gray-600 mb-3">
          Description (optionnel)
        </label>
        <textarea
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder="Décrivez l'état du produit, son histoire, les défauts éventuels..."
          rows={4}
          maxLength={1000}
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.description
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>
          <p
            className={`text-sm ${description.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}
          >
            {description.length}/1000
          </p>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm text-gray-600 mb-3">
          Planche d&apos;occasion à recycler
        </label>
        <select
          value={usedBoardId}
          onChange={e => onUsedBoardIdChange(e.target.value)}
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
        {usedBoardId ? (
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
