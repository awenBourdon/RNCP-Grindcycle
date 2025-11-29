import { BoardCondition, BoardType } from '@/lib/utils/enums/enums';

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

const BOARD_TYPES = [BoardType.SKATE, BoardType.CRUISER, BoardType.LONG];
const BOARD_CONDITIONS = [
  BoardCondition.GOOD,
  BoardCondition.AVERAGE,
  BoardCondition.BAD,
];

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

const getBoardConditionLabel = (condition: BoardCondition): string => {
  switch (condition) {
    case BoardCondition.GOOD:
      return 'Bon état';
    case BoardCondition.AVERAGE:
      return 'État moyen';
    case BoardCondition.BAD:
      return 'Mauvais état';
    default:
      return condition;
  }
};

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
        <label htmlFor="name" className="block text-sm text-gray-600 mb-3">
          Nom{' '}
          <span className="text-red-500" aria-label="requis">
            *
          </span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          aria-label="Nom de la planche"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.name
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
        />
        {errors.name && (
          <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <fieldset>
          <legend
            id="boardType-legend"
            className="block text-sm text-gray-600 mb-3"
          >
            Type de planche{' '}
            <span className="text-red-500" aria-label="requis">
              *
            </span>
          </legend>
          <div
            className="grid grid-cols-3 gap-3"
            role="group"
            aria-labelledby="boardType-legend"
          >
            {BOARD_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onTypeSelect(type)}
                aria-pressed={selectedType === type}
                aria-label={`Type de planche: ${getBoardTypeLabel(type)}`}
                className={`py-3 px-2 rounded-md text-center transition-colors ${
                  selectedType === type
                    ? 'bg-[#0a3d3f] text-white'
                    : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {getBoardTypeLabel(type)}
              </button>
            ))}
          </div>
          {errors.boardType && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {errors.boardType}
            </p>
          )}
        </fieldset>
      </div>

      <div>
        <fieldset>
          <legend
            id="boardCondition-legend"
            className="block text-sm text-gray-600 mb-3"
          >
            État de la planche{' '}
            <span className="text-red-500" aria-label="requis">
              *
            </span>
          </legend>
          <div
            className="grid grid-cols-3 gap-3"
            role="group"
            aria-labelledby="boardCondition-legend"
          >
            {BOARD_CONDITIONS.map(condition => (
              <button
                key={condition}
                type="button"
                onClick={() => onConditionSelect(condition)}
                aria-pressed={selectedCondition === condition}
                aria-label={`État de la planche: ${getBoardConditionLabel(condition)}`}
                className={`py-3 px-2 rounded-md text-center transition-colors ${
                  selectedCondition === condition
                    ? 'bg-[#0a3d3f] text-white'
                    : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {getBoardConditionLabel(condition)}
              </button>
            ))}
          </div>
          {errors.boardCondition && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {errors.boardCondition}
            </p>
          )}
        </fieldset>
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
          aria-label="Description de la planche"
          aria-invalid={!!(errors.description || descriptionLength > 500)}
          aria-describedby={
            errors.description || descriptionLength > 500
              ? 'description-error'
              : 'description-hint'
          }
          className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-1 ${
            errors.description || descriptionLength > 500
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#0a3d3f] focus:ring-[#0a3d3f]'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.description && (
              <p
                id="description-error"
                className="text-red-500 text-sm"
                role="alert"
              >
                {errors.description}
              </p>
            )}
            {descriptionLength > 500 && (
              <p
                id="description-error"
                className="text-red-500 text-sm"
                role="alert"
              >
                La description ne peut pas dépasser 500 caractères (
                {descriptionLength}/500)
              </p>
            )}
          </div>
          <p
            id="description-hint"
            className={`text-sm ${descriptionLength > 500 ? 'text-red-500' : 'text-gray-500'}`}
            aria-live="polite"
          >
            {descriptionLength}/500
          </p>
        </div>
      </div>
    </div>
  );
};
