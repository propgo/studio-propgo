import { WizardShell } from "@/components/projects/wizard-shell";
import { PropertyDetailsForm } from "@/components/projects/property-details-form";

interface Props {
  searchParams: Promise<{ step?: string }>;
}

export default async function NewProjectPage({ searchParams }: Props) {
  const { step } = await searchParams;
  const currentStep = Math.min(Math.max(parseInt(step ?? "1", 10) || 1, 1), 5);

  return (
    <WizardShell currentStep={currentStep}>
      {currentStep === 1 && <PropertyDetailsForm />}
      {currentStep === 2 && (
        <div className="text-white/40 text-sm">Floor Plans — coming in Phase 4</div>
      )}
      {currentStep === 3 && (
        <div className="text-white/40 text-sm">Photos & Tagging — coming in Phase 4</div>
      )}
      {currentStep === 4 && (
        <div className="text-white/40 text-sm">Storyboard — coming in Phase 5</div>
      )}
      {currentStep === 5 && (
        <div className="text-white/40 text-sm">Voiceover — coming in Phase 6</div>
      )}
    </WizardShell>
  );
}
