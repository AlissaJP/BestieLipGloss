interface CheckoutStepperProps {
  currentStep: number;
}

const steps = ['Panier', 'Livraison', 'Paiement'];

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center gap-2 ${i <= currentStep ? 'text-primary' : 'text-gray-400'}`}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                i < currentStep
                  ? 'bg-primary border-primary text-white'
                  : i === currentStep
                  ? 'border-primary text-primary bg-white shadow-sm'
                  : 'border-gray-200 text-gray-400 bg-white'
              }`}
            >
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span
              className={`font-lato text-sm hidden sm:block font-medium ${
                i === currentStep ? 'text-primary' : i < currentStep ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-10 sm:w-20 h-0.5 mx-2 sm:mx-3 transition-colors ${
                i < currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
