'use client';
import { Check, X } from 'lucide-react';

interface PasswordCriteria {
  hasMinLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordValidationProps {
  password: string;
  confirmPassword: string;
}

const checkPasswordCriteria = (password: string): PasswordCriteria => {
  return {
    hasMinLength: password.length >= 12,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[^\w\s]/.test(password),
  };
};

const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  const criteria = checkPasswordCriteria(password);
  if (criteria.hasMinLength) score += 20;
  if (criteria.hasLowercase) score += 20;
  if (criteria.hasUppercase) score += 20;
  if (criteria.hasNumber) score += 20;
  if (criteria.hasSpecialChar) score += 20;
  return Math.min(score, 100);
};

const getStrengthColor = (strength: number): string => {
  if (strength < 40) return 'bg-red-700';
  if (strength < 60) return 'bg-orange-700';
  if (strength < 80) return 'bg-yellow-700';
  return 'bg-green-700';
};

const getStrengthText = (strength: number): string => {
  if (strength < 40) return 'Faible';
  if (strength < 60) return 'Moyen';
  if (strength < 80) return 'Bon';
  return 'Excellent';
};

export const PasswordValidation = ({
  password,
  confirmPassword,
}: PasswordValidationProps) => {
  const criteria = checkPasswordCriteria(password);
  const strength = calculatePasswordStrength(password);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  if (!password) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Force du mot de passe
          </span>
          <span
            className={`text-sm font-medium ${
              strength < 40
                ? 'text-red-800'
                : strength < 60
                  ? 'text-orange-800'
                  : strength < 80
                    ? 'text-yellow-800'
                    : 'text-green-800'
            }`}
          >
            {getStrengthText(strength)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Critères requis :
        </h4>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2">
            {criteria.hasMinLength ? (
              <Check size={16} className="text-gray-600" />
            ) : (
              <X size={16} className="text-gray-400" />
            )}
            <span
              className={`text-sm ${criteria.hasMinLength ? 'text-gray-600' : 'text-gray-400'}`}
            >
              Au moins 12 caractères
            </span>
          </div>
          <div className="flex items-center gap-2">
            {criteria.hasLowercase ? (
              <Check size={16} className="text-gray-600" />
            ) : (
              <X size={16} className="text-gray-400" />
            )}
            <span
              className={`text-sm ${criteria.hasLowercase ? 'text-gray-600' : 'text-gray-400'}`}
            >
              Une lettre minuscule (a-z)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {criteria.hasUppercase ? (
              <Check size={16} className="text-gray-600" />
            ) : (
              <X size={16} className="text-gray-400" />
            )}
            <span
              className={`text-sm ${criteria.hasUppercase ? 'text-gray-600' : 'text-gray-400'}`}
            >
              Une lettre majuscule (A-Z)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {criteria.hasNumber ? (
              <Check size={16} className="text-gray-600" />
            ) : (
              <X size={16} className="text-gray-400" />
            )}
            <span
              className={`text-sm ${criteria.hasNumber ? 'text-gray-600' : 'text-gray-400'}`}
            >
              Un chiffre (0-9)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {criteria.hasSpecialChar ? (
              <Check size={16} className="text-gray-600" />
            ) : (
              <X size={16} className="text-gray-400" />
            )}
            <span
              className={`text-sm ${criteria.hasSpecialChar ? 'text-gray-600' : 'text-gray-400'}`}
            >
              Un caractère spécial (!@#$%^&*)
            </span>
          </div>
        </div>
      </div>
      {password && confirmPassword && (
        <div className="flex items-center gap-2">
          {passwordsMatch ? (
            <>
              <Check size={16} className="text-green-800" />
              <span className="text-sm text-green-800 font-medium">
                Les mots de passe correspondent ✓
              </span>
            </>
          ) : (
            <>
              <X size={16} className="text-red-800" />
              <span className="text-sm text-red-800 font-medium">
                Les mots de passe ne correspondent pas
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
