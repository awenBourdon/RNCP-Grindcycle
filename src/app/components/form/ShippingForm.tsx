'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  pointsShippingSchema,
  SHIPPING_CONFIG,
  type PointsShippingInput,
} from '@/lib/validations/shipping.validation';

interface ShippingFormProps {
  onSubmit: (data: PointsShippingInput) => void;
  isLoading?: boolean;
  submitText?: string;
}

export function ShippingForm({
  onSubmit,
  isLoading = false,
  submitText = 'Confirmer',
}: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<PointsShippingInput>({
    resolver: zodResolver(pointsShippingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'France',
      email: '',
      phone: '',
    },
    mode: 'onChange',
  });

  const country = watch('country');

  const InputError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <div className="mt-1 text-red-600 text-sm">{error}</div>;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="firstName"
            className="text-sm font-medium text-gray-700"
          >
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <InputError error={errors.firstName?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="lastName"
            className="text-sm font-medium text-gray-700"
          >
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <InputError error={errors.lastName?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address" className="text-sm font-medium text-gray-700">
          Adresse <span className="text-red-500">*</span>
        </label>
        <input
          {...register('address')}
          type="text"
          id="address"
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors ${
            errors.address ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <InputError error={errors.address?.message} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="city" className="text-sm font-medium text-gray-700">
            Ville <span className="text-red-500">*</span>
          </label>
          <input
            {...register('city')}
            type="text"
            id="city"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <InputError error={errors.city?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="postalCode"
            className="text-sm font-medium text-gray-700"
          >
            Code postal <span className="text-red-500">*</span>
          </label>
          <input
            {...register('postalCode')}
            type="text"
            id="postalCode"
            placeholder={
              country === 'France'
                ? '75001'
                : country === 'Belgique'
                  ? '1000'
                  : country === 'Suisse'
                    ? '1000'
                    : '1000'
            }
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors ${
              errors.postalCode ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <InputError error={errors.postalCode?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="country" className="text-sm font-medium text-gray-700">
          Pays <span className="text-red-500">*</span>
        </label>
        <select
          {...register('country')}
          id="country"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
        >
          {SHIPPING_CONFIG.countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <InputError error={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="0123456789 ou 01 23 45 67 89"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <InputError error={errors.phone?.message} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid || !isDirty}
        className="w-full py-4 px-6 bg-[#0a3d3f] text-white rounded-full font-medium cursor-pointer hover:bg-[#0a4d4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Commande en cours...
          </>
        ) : (
          submitText
        )}
      </button>
    </form>
  );
}
