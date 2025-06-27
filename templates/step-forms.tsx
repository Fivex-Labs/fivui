"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

export interface StepFormStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
  optional?: boolean
  required?: boolean
}

export interface StepValidation {
  isValid: boolean
  errors?: string[]
}

export interface StepFormProps {
  steps: StepFormStep[]
  currentStep?: number
  onStepChange?: (step: number) => void
  onComplete?: () => void
  onCancel?: () => void
  onValidate?: (stepId: string, stepIndex: number) => StepValidation
  className?: string
  showStepNumbers?: boolean
  allowStepSkipping?: boolean
  nextButtonText?: string
  previousButtonText?: string
  completeButtonText?: string
  cancelButtonText?: string
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "dots" | "progress"
}

const StepForms = React.forwardRef<HTMLDivElement, StepFormProps>(
  ({
    steps,
    currentStep: controlledCurrentStep,
    onStepChange,
    onComplete,
    onCancel,
    onValidate,
    className,
    showStepNumbers = true,
    allowStepSkipping = false,
    nextButtonText = "Next",
    previousButtonText = "Previous",
    completeButtonText = "Complete",
    cancelButtonText = "Cancel",
    orientation = "horizontal",
    variant = "default",
    ...props
  }, ref) => {
    const [internalCurrentStep, setInternalCurrentStep] = React.useState(0)
    const [isAnimating, setIsAnimating] = React.useState(false)
    const currentStep = controlledCurrentStep ?? internalCurrentStep
    const isControlled = controlledCurrentStep !== undefined

    const handleStepChange = (step: number) => {
      if (step === currentStep) return
      
      setIsAnimating(true)
      setTimeout(() => {
        if (!isControlled) {
          setInternalCurrentStep(step)
        }
        onStepChange?.(step)
        setIsAnimating(false)
      }, 150)
    }

    const isCurrentStepValid = () => {
      const currentStepData = steps[currentStep]
      if (!currentStepData.required) return true
      
      if (onValidate) {
        const validation = onValidate(currentStepData.id, currentStep)
        return validation.isValid
      }
      
      return true
    }

    const handleNext = () => {
      if (!isCurrentStepValid()) {
        return
      }
      
      if (currentStep < steps.length - 1) {
        handleStepChange(currentStep + 1)
      } else {
        onComplete?.()
      }
    }

    const handlePrevious = () => {
      if (currentStep > 0) {
        handleStepChange(currentStep - 1)
      }
    }

    const isStepAccessible = (stepIndex: number) => {
      if (allowStepSkipping) return true
      if (stepIndex <= currentStep) return true
      
      // Check if all required steps before this one are valid
      for (let i = 0; i < stepIndex; i++) {
        const step = steps[i]
        if (step.required && onValidate) {
          const validation = onValidate(step.id, i)
          if (!validation.isValid) return false
        }
      }
      
      return true
    }

    const handleStepClick = (stepIndex: number) => {
      if (isStepAccessible(stepIndex)) {
        // If clicking on a future step, validate current step first
        if (stepIndex > currentStep && !isCurrentStepValid()) {
          return
        }
        handleStepChange(stepIndex)
      }
    }

    const getStepStatus = (stepIndex: number) => {
      if (stepIndex < currentStep) return "completed"
      if (stepIndex === currentStep) return "current"
      return "upcoming"
    }

    const renderStepIndicator = (step: StepFormStep, index: number) => {
      const status = getStepStatus(index)
      const isClickable = isStepAccessible(index)
      const isLast = index === steps.length - 1

      if (variant === "dots") {
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && handleStepClick(index)}
              disabled={!isClickable}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 ease-in-out",
                status === "completed" && "bg-primary scale-110",
                status === "current" && "bg-primary scale-125 ring-4 ring-primary/20",
                status === "upcoming" && "bg-muted hover:bg-muted-foreground/20",
                isClickable && "hover:scale-110 cursor-pointer",
                !isClickable && "cursor-not-allowed"
              )}
              aria-label={`Step ${index + 1}: ${step.title}`}
            />
            {!isLast && (
              <div className="w-8 h-px bg-border mx-2" />
            )}
          </div>
        )
      }

      if (variant === "progress") {
        return null // Progress bar is rendered separately
      }

      // Enhanced default variant with connecting lines
      return (
        <div key={step.id} className="flex items-center relative">
          <div className="flex flex-col items-center">
            <button
              onClick={() => isClickable && handleStepClick(index)}
              disabled={!isClickable}
              className={cn(
                "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ease-in-out transform",
                status === "completed" && "bg-primary border-primary text-primary-foreground shadow-lg scale-105",
                status === "current" && "border-primary text-primary bg-background shadow-lg scale-110 ring-4 ring-primary/10",
                status === "upcoming" && "border-border text-muted-foreground bg-background hover:border-primary/50",
                isClickable && "hover:scale-105 cursor-pointer",
                !isClickable && "cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
            >
              {status === "completed" ? (
                <Check className="w-6 h-6 animate-in fade-in-0 zoom-in-50 duration-200" />
              ) : showStepNumbers ? (
                <span className="text-sm font-semibold">{index + 1}</span>
              ) : (
                <div className="w-3 h-3 rounded-full bg-current" />
              )}
              
              {/* Pulse animation for current step */}
              {status === "current" && (
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
              )}
            </button>
            
            {/* Step info */}
            <div className="mt-3 text-center max-w-[120px]">
              <p className={cn(
                "text-sm font-medium transition-colors duration-200",
                status === "current" && "text-foreground",
                status === "completed" && "text-foreground",
                status === "upcoming" && "text-muted-foreground"
              )}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1 leading-tight">
                  {step.description}
                </p>
              )}
              {step.required && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  <span className="text-xs text-destructive font-medium">Required</span>
                </div>
              )}
              {step.optional && (
                <span className="text-xs text-muted-foreground mt-1 block">Optional</span>
              )}
            </div>
          </div>
          
          {/* Connecting line */}
          {!isLast && orientation === "horizontal" && (
            <div className="flex-1 h-px bg-border mx-6 mt-[-60px] relative">
              <div 
                className={cn(
                  "h-full bg-primary transition-all duration-500 ease-in-out",
                  index < currentStep ? "w-full" : "w-0"
                )}
              />
            </div>
          )}
        </div>
      )
    }

    const renderProgressBar = () => {
      if (variant !== "progress") return null
      
      const progress = ((currentStep + 1) / steps.length) * 100
      
      return (
        <div className="space-y-3">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-foreground font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>
      )
    }

    const currentStepData = steps[currentStep]

    return (
      <div ref={ref} className={cn("space-y-8", className)} {...props}>
        {/* Step Indicators */}
        <div className="space-y-6">
          {variant === "progress" && renderProgressBar()}
          
          {variant === "dots" && (
            <div className="flex justify-center items-center">
              {steps.map((step, index) => renderStepIndicator(step, index))}
            </div>
          )}
          
          {variant === "default" && (
            <div className={cn(
              "flex",
              orientation === "horizontal" ? "items-start justify-between px-4" : "flex-col space-y-8"
            )}>
              {steps.map((step, index) => renderStepIndicator(step, index))}
            </div>
          )}
        </div>

        {/* Current Step Content */}
        <div className="relative">
          <Card className={cn(
            "transition-all duration-300 ease-in-out",
            isAnimating && "opacity-50 scale-[0.98]",
            !isAnimating && "opacity-100 scale-100"
          )}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    {currentStepData.title}
                    {currentStepData.optional && (
                      <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                        Optional
                      </span>
                    )}
                    {currentStepData.required && (
                      <span className="text-sm font-normal text-destructive bg-destructive/10 px-2 py-1 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Required
                      </span>
                    )}
                  </CardTitle>
                  {currentStepData.description && (
                    <CardDescription className="text-base">
                      {currentStepData.description}
                    </CardDescription>
                  )}
                </div>
                <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {currentStep + 1} of {steps.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className={cn(
                "transition-all duration-200 ease-in-out",
                isAnimating && "opacity-0 translate-y-2",
                !isAnimating && "opacity-100 translate-y-0"
              )}>
                {currentStepData.content}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-3">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">
                {cancelButtonText}
              </Button>
            )}
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="flex items-center gap-2"
                disabled={isAnimating}
              >
                <ChevronLeft className="w-4 h-4" />
                {previousButtonText}
              </Button>
            )}
          </div>
          
          <Button 
            onClick={handleNext}
            className="flex items-center gap-2 min-w-[100px]"
            disabled={isAnimating || (currentStepData.required && !isCurrentStepValid())}
          >
            {currentStep === steps.length - 1 ? completeButtonText : nextButtonText}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    )
  }
)

StepForms.displayName = "StepForms"

export { StepForms } 