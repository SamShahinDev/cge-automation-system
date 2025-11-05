"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

// Step 1 Schema
const step1Schema = z.object({
  businessName: z.string().min(2, "Business name required"),
  industry: z.string().min(1, "Please select your industry"),
  businessSize: z.string().min(1, "Please select business size"),
  website: z.string().url().optional().or(z.literal(""))
});

// Step 2 Schema
const step2Schema = z.object({
  primaryChallenge: z.string().min(10, "Please describe your main challenge"),
  currentTools: z.string().min(2, "What tools do you use now?"),
  painPoints: z.array(z.string()).min(1, "Select at least one pain point")
});

// Step 3 Schema
const step3Schema = z.object({
  solutionType: z.string().min(1, "Please select solution type"),
  keyFeatures: z.string().min(10, "Describe key features needed"),
  userCount: z.string().min(1, "Estimated users required"),
  timeline: z.string().min(1, "Please select timeline")
});

// Step 4 Schema
const step4Schema = z.object({
  budgetRange: z.string().min(1, "Please select budget range"),
  decisionMaker: z.boolean(),
  additionalStakeholders: z.string().optional()
});

// Step 5 Schema
const step5Schema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number").optional().or(z.literal("")),
  preferredContact: z.enum(["email", "phone", "either"]),
  additionalInfo: z.string().optional(),
  consentUpdates: z.boolean().refine(val => val === true, {
    message: "You must agree to receive updates"
  })
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;
type Step3FormData = z.infer<typeof step3Schema>;
type Step4FormData = z.infer<typeof step4Schema>;
type Step5FormData = z.infer<typeof step5Schema>;

// Industries and business sizes
const INDUSTRIES = [
  "Healthcare & Medical",
  "Professional Services",
  "Manufacturing",
  "Retail & E-commerce",
  "Construction & Trades",
  "Financial Services",
  "Education",
  "Non-profit",
  "Other"
] as const;

const BUSINESS_SIZES = [
  { value: "1", label: "Just me (1)" },
  { value: "2-10", label: "Small team (2-10)" },
  { value: "11-50", label: "Growing business (11-50)" },
  { value: "50+", label: "Established company (50+)" }
] as const;

// Pain points options
const PAIN_POINTS = [
  "Too many manual processes",
  "Data in multiple places",
  "Can't get the reports I need",
  "Software doesn't fit our workflow",
  "Spending too much on multiple tools",
  "No mobile access",
  "Can't scale efficiently",
  "Other"
] as const;

// Solution types
const SOLUTION_TYPES = [
  { value: "crm", label: "Customer Management (CRM)" },
  { value: "operations", label: "Operations Management" },
  { value: "financial", label: "Financial/Accounting Tools" },
  { value: "project", label: "Project Management" },
  { value: "industry", label: "Industry-Specific Solution" },
  { value: "unsure", label: "Not sure yet" }
] as const;

// User counts
const USER_COUNTS = [
  { value: "1-5", label: "1-5 users" },
  { value: "6-15", label: "6-15 users" },
  { value: "16-50", label: "16-50 users" },
  { value: "50+", label: "50+ users" }
] as const;

// Timelines
const TIMELINES = [
  { value: "asap", label: "ASAP (within 2 weeks)" },
  { value: "month", label: "Within a month" },
  { value: "3months", label: "Within 3 months" },
  { value: "exploring", label: "Just exploring options" }
] as const;

// Budget ranges
const BUDGET_RANGES = [
  { value: "under-500", label: "Under $500/month" },
  { value: "500-1000", label: "$500-1,000/month" },
  { value: "1000-2500", label: "$1,000-2,500/month" },
  { value: "2500-plus", label: "$2,500+/month" },
  { value: "not-sure", label: "Not sure yet" }
] as const;

// Preferred contact methods
const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "either", label: "Either is fine" }
] as const;

// Session storage key
const STORAGE_KEY = 'project-form-progress';

// Combined form data type
type AllFormData = Step1FormData & Step2FormData & Step3FormData & Step4FormData & Step5FormData;

interface ProjectFormProps {
  onComplete?: (data: AllFormData) => void;
}

export function ProjectForm({ onComplete }: ProjectFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Total steps in the questionnaire
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null);
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null);
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null);
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null);
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null);

  // Get the current schema based on step
  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1:
        return step1Schema;
      case 2:
        return step2Schema;
      case 3:
        return step3Schema;
      case 4:
        return step4Schema;
      case 5:
        return step5Schema;
      default:
        return step1Schema;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<any>({
    resolver: zodResolver(getCurrentSchema()),
    mode: 'onChange',
    defaultValues: currentStep === 1 ? {
      businessName: '',
      industry: '',
      businessSize: '',
      website: ''
    } : currentStep === 2 ? {
      primaryChallenge: '',
      currentTools: '',
      painPoints: []
    } : currentStep === 3 ? {
      solutionType: '',
      keyFeatures: '',
      userCount: '',
      timeline: ''
    } : currentStep === 4 ? {
      budgetRange: '',
      decisionMaker: false,
      additionalStakeholders: ''
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferredContact: 'email',
      additionalInfo: '',
      consentUpdates: false
    }
  });

  // Watch form values for saving to sessionStorage
  const formValues = watch();

  // Load saved progress from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.step1Data) setStep1Data(parsed.step1Data);
        if (parsed.step2Data) setStep2Data(parsed.step2Data);
        if (parsed.step3Data) setStep3Data(parsed.step3Data);
        if (parsed.step4Data) setStep4Data(parsed.step4Data);
        if (parsed.step5Data) setStep5Data(parsed.step5Data);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  }, []);

  // Load form data when step changes
  useEffect(() => {
    if (currentStep === 1 && step1Data) {
      Object.keys(step1Data).forEach((key) => {
        setValue(key, step1Data[key as keyof Step1FormData]);
      });
    } else if (currentStep === 2 && step2Data) {
      Object.keys(step2Data).forEach((key) => {
        setValue(key, step2Data[key as keyof Step2FormData]);
      });
    } else if (currentStep === 3 && step3Data) {
      Object.keys(step3Data).forEach((key) => {
        setValue(key, step3Data[key as keyof Step3FormData]);
      });
    } else if (currentStep === 4 && step4Data) {
      Object.keys(step4Data).forEach((key) => {
        setValue(key, step4Data[key as keyof Step4FormData]);
      });
    } else if (currentStep === 5 && step5Data) {
      Object.keys(step5Data).forEach((key) => {
        setValue(key, step5Data[key as keyof Step5FormData]);
      });
    }
  }, [currentStep, step1Data, step2Data, step3Data, step4Data, step5Data, setValue]);

  // Save progress to sessionStorage whenever form values change
  useEffect(() => {
    const allData = {
      currentStep,
      step1Data,
      step2Data,
      step3Data,
      step4Data,
      step5Data,
      currentFormValues: formValues
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  }, [formValues, currentStep, step1Data, step2Data, step3Data, step4Data, step5Data]);

  const onSubmit = (data: any) => {
    console.log(`Step ${currentStep} data:`, data);

    // Save step data
    if (currentStep === 1) {
      setStep1Data(data as Step1FormData);
    } else if (currentStep === 2) {
      setStep2Data(data as Step2FormData);
    } else if (currentStep === 3) {
      setStep3Data(data as Step3FormData);
    } else if (currentStep === 4) {
      setStep4Data(data as Step4FormData);
    } else if (currentStep === 5) {
      setStep5Data(data as Step5FormData);
    }

    // Move to next step or complete
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      reset(); // Reset form for next step
    } else {
      // Final submission
      const allData: AllFormData = {
        ...step1Data!,
        ...step2Data!,
        ...step3Data!,
        ...step4Data!,
        ...data
      };
      sessionStorage.removeItem(STORAGE_KEY);
      if (onComplete) {
        onComplete(allData);
      }
    }
  };

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={currentStep}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
                  <p className="text-muted-foreground">
                    This helps us understand your needs better
                  </p>
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    {...register('businessName')}
                    className={cn(errors.businessName && "border-destructive")}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label htmlFor="industry">
                    Industry <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('industry', value);
                      trigger('industry');
                    }}
                    value={formValues.industry}
                  >
                    <SelectTrigger
                      id="industry"
                      className={cn(errors.industry && "border-destructive")}
                    >
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-destructive">
                      {errors.industry.message}
                    </p>
                  )}
                </div>

                {/* Business Size */}
                <div className="space-y-2">
                  <Label htmlFor="businessSize">
                    Business Size <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('businessSize', value);
                      trigger('businessSize');
                    }}
                    value={formValues.businessSize}
                  >
                    <SelectTrigger
                      id="businessSize"
                      className={cn(errors.businessSize && "border-destructive")}
                    >
                      <SelectValue placeholder="Select business size" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessSize && (
                    <p className="text-sm text-destructive">
                      {errors.businessSize.message}
                    </p>
                  )}
                </div>

                {/* Website (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="website">
                    Website <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    {...register('website')}
                    className={cn(errors.website && "border-destructive")}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">
                      {errors.website.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Current Challenges */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">What challenges are you facing?</h2>
                  <p className="text-muted-foreground">
                    Help us understand your pain points so we can provide the best solution
                  </p>
                </div>

                {/* Primary Challenge */}
                <div className="space-y-2">
                  <Label htmlFor="primaryChallenge">
                    What's the biggest challenge your business faces today? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="primaryChallenge"
                    placeholder="What's the biggest challenge your business faces today?"
                    className={cn(
                      "min-h-[100px] resize-y",
                      errors.primaryChallenge && "border-destructive"
                    )}
                    {...register('primaryChallenge')}
                  />
                  <div className="flex items-center justify-between">
                    {errors.primaryChallenge && (
                      <p className="text-sm text-destructive">
                        {errors.primaryChallenge.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {watch('primaryChallenge')?.length || 0} characters
                    </p>
                  </div>
                </div>

                {/* Current Tools */}
                <div className="space-y-2">
                  <Label htmlFor="currentTools">
                    What tools do you currently use? <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="currentTools"
                    placeholder="Excel, QuickBooks, HubSpot, etc."
                    {...register('currentTools')}
                    className={cn(errors.currentTools && "border-destructive")}
                  />
                  {errors.currentTools && (
                    <p className="text-sm text-destructive">
                      {errors.currentTools.message}
                    </p>
                  )}
                </div>

                {/* Pain Points */}
                <div className="space-y-3">
                  <Label>
                    Select your pain points <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PAIN_POINTS.map((painPoint) => {
                      const currentPainPoints = watch('painPoints') || [];
                      const isChecked = currentPainPoints.includes(painPoint);

                      return (
                        <div key={painPoint} className="flex items-center space-x-2">
                          <Checkbox
                            id={painPoint}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const current = watch('painPoints') || [];
                              if (checked) {
                                setValue('painPoints', [...current, painPoint]);
                              } else {
                                setValue('painPoints', current.filter((p: string) => p !== painPoint));
                              }
                              trigger('painPoints');
                            }}
                          />
                          <label
                            htmlFor={painPoint}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {painPoint}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {errors.painPoints && (
                    <p className="text-sm text-destructive">
                      {errors.painPoints.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Desired Solution */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">What solution are you looking for?</h2>
                  <p className="text-muted-foreground">
                    Tell us about your ideal solution
                  </p>
                </div>

                {/* Solution Type */}
                <div className="space-y-3">
                  <Label>
                    Type of solution needed <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={watch('solutionType')}
                    onValueChange={(value) => {
                      setValue('solutionType', value);
                      trigger('solutionType');
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {SOLUTION_TYPES.map((solution) => (
                      <div key={solution.value} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={solution.value}
                          id={solution.value}
                          className={cn(errors.solutionType && "border-destructive")}
                        />
                        <label
                          htmlFor={solution.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {solution.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.solutionType && (
                    <p className="text-sm text-destructive">
                      {errors.solutionType.message}
                    </p>
                  )}
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <Label htmlFor="keyFeatures">
                    What must your solution do? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="keyFeatures"
                    placeholder="Describe the key features you need..."
                    className={cn(
                      "min-h-[100px] resize-y",
                      errors.keyFeatures && "border-destructive"
                    )}
                    {...register('keyFeatures')}
                  />
                  <div className="flex items-center justify-between">
                    {errors.keyFeatures && (
                      <p className="text-sm text-destructive">
                        {errors.keyFeatures.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {watch('keyFeatures')?.length || 0} characters
                    </p>
                  </div>
                </div>

                {/* User Count */}
                <div className="space-y-2">
                  <Label htmlFor="userCount">
                    How many users will need access? <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('userCount', value);
                      trigger('userCount');
                    }}
                    value={formValues.userCount}
                  >
                    <SelectTrigger
                      id="userCount"
                      className={cn(errors.userCount && "border-destructive")}
                    >
                      <SelectValue placeholder="Select number of users" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_COUNTS.map((count) => (
                        <SelectItem key={count.value} value={count.value}>
                          {count.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.userCount && (
                    <p className="text-sm text-destructive">
                      {errors.userCount.message}
                    </p>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <Label htmlFor="timeline">
                    When do you need this? <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('timeline', value);
                      trigger('timeline');
                    }}
                    value={formValues.timeline}
                  >
                    <SelectTrigger
                      id="timeline"
                      className={cn(errors.timeline && "border-destructive")}
                    >
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timeline && (
                    <p className="text-sm text-destructive">
                      {errors.timeline.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Budget Expectations */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Budget & Decision Making</h2>
                  <p className="text-muted-foreground">
                    Help us understand your budget expectations
                  </p>
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <Label htmlFor="budgetRange">
                    What's your estimated monthly budget? <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('budgetRange', value);
                      trigger('budgetRange');
                    }}
                    value={formValues.budgetRange}
                  >
                    <SelectTrigger
                      id="budgetRange"
                      className={cn(errors.budgetRange && "border-destructive")}
                    >
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.budgetRange && (
                    <p className="text-sm text-destructive">
                      {errors.budgetRange.message}
                    </p>
                  )}
                </div>

                {/* Decision Maker */}
                <div className="space-y-3">
                  <Label>
                    Are you the final decision maker? <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={watch('decisionMaker') === true ? 'yes' : watch('decisionMaker') === false ? 'no' : ''}
                    onValueChange={(value) => {
                      setValue('decisionMaker', value === 'yes');
                      trigger('decisionMaker');
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="decision-yes" />
                      <label
                        htmlFor="decision-yes"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Yes, I make the final decision
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="decision-no" />
                      <label
                        htmlFor="decision-no"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        No, I need to consult others
                      </label>
                    </div>
                  </RadioGroup>
                  {errors.decisionMaker && (
                    <p className="text-sm text-destructive">
                      {errors.decisionMaker.message}
                    </p>
                  )}
                </div>

                {/* Additional Stakeholders (Conditional) */}
                {watch('decisionMaker') === false && (
                  <div className="space-y-2">
                    <Label htmlFor="additionalStakeholders">
                      Who else is involved in the decision? <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Textarea
                      id="additionalStakeholders"
                      placeholder="e.g., CEO, IT Manager, etc."
                      className="min-h-[80px] resize-y"
                      {...register('additionalStakeholders')}
                    />
                    {errors.additionalStakeholders && (
                      <p className="text-sm text-destructive">
                        {errors.additionalStakeholders.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Contact Information */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Let's connect</h2>
                  <p className="text-muted-foreground">
                    How can we reach you with a customized proposal?
                  </p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register('firstName')}
                      className={cn(errors.firstName && "border-destructive")}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...register('lastName')}
                      className={cn(errors.lastName && "border-destructive")}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    className={cn(errors.email && "border-destructive")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register('phone')}
                    className={cn(errors.phone && "border-destructive")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Preferred Contact Method */}
                <div className="space-y-2">
                  <Label htmlFor="preferredContact">
                    Preferred contact method <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('preferredContact', value);
                      trigger('preferredContact');
                    }}
                    value={formValues.preferredContact}
                  >
                    <SelectTrigger
                      id="preferredContact"
                      className={cn(errors.preferredContact && "border-destructive")}
                    >
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.preferredContact && (
                    <p className="text-sm text-destructive">
                      {errors.preferredContact.message}
                    </p>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">
                    Anything else we should know? <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any additional details..."
                    className="min-h-[80px] resize-y"
                    {...register('additionalInfo')}
                  />
                  {errors.additionalInfo && (
                    <p className="text-sm text-destructive">
                      {errors.additionalInfo.message}
                    </p>
                  )}
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consentUpdates"
                    checked={watch('consentUpdates') || false}
                    onCheckedChange={(checked) => {
                      setValue('consentUpdates', checked === true);
                      trigger('consentUpdates');
                    }}
                    className={cn(errors.consentUpdates && "border-destructive")}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="consentUpdates"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I agree to receive project updates and occasional insights <span className="text-destructive">*</span>
                    </label>
                    {errors.consentUpdates && (
                      <p className="text-sm text-destructive">
                        {errors.consentUpdates.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    sessionStorage.removeItem(STORAGE_KEY);
                  }}
                >
                  Clear Progress
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid}
                >
                  {currentStep === totalSteps ? 'Submit' : 'Next'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
