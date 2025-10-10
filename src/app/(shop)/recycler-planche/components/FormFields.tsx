import { BoardCondition, BoardType } from '@/lib/utils/enums/enums';
import {
  formatBoardType,
  formatBoardCondition,
} from '@/lib/validations/boards.validation';

interface FormErrors {
  [key: string]: string;
}

interface FormFieldsProps {
  selectedType: BoardType | '';
  selectedCondition: BoardCondition | '';
  errors: FormErrors;
  descriptionLength: number;
  onTypeSelect: (type: BoardType) => void;
  onConditionSelect: (condition: BoardCondition) => void;
  onDescriptionChange: (length: number) => void;
}

export const FormFields = ({
  selectedType,
  selectedCondition,
  errors,
  descriptionLength,
  onTypeSelect,
  onConditionSelect,
  onDescriptionChange,
}: FormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <label className="block text-sm text-gray-600 mb-3">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.name
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
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
              onClick={() => onTypeSelect(type)}
              className={`py-3 px-2 rounded-md text-center transition-colors ${
                selectedType === type
                  ? 'bg-[#0a3d3f] text-white'
                  : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {formatBoardType(type)}
            </button>
          ))}
        </div>
        {errors.boardType && (
          <p className="text-red-500 text-sm mt-1">{errors.boardType}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-3">
          État de la planche <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(BoardCondition).map(condition => (
            <button
              key={condition}
              type="button"
              onClick={() => onConditionSelect(condition)}
              className={`py-3 px-2 rounded-md text-center transition-colors ${
                selectedCondition === condition
                  ? 'bg-[#0a3d3f] text-white'
                  : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {formatBoardCondition(condition)}
            </button>
          ))}
        </div>
        {errors.boardCondition && (
          <p className="text-red-500 text-sm mt-1">{errors.boardCondition}</p>
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
          placeholder="Décris l'état de ta planche, son histoire, les défauts éventuels..."
          rows={4}
          maxLength={500}
          onChange={e => onDescriptionChange(e.target.value.length)}
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.description || descriptionLength > 500
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
            {descriptionLength > 500 && (
              <p className="text-red-500 text-sm">
                La description ne peut pas dépasser 500 caractères (
                {descriptionLength}/500)
              </p>
            )}
          </div>
          <p
            className={`text-sm ${descriptionLength > 500 ? 'text-red-500' : 'text-gray-500'}`}
          >
            {descriptionLength}/500
          </p>
        </div>
      </div>
    </div>
  );
};
