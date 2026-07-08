import { useState, useEffect } from 'react';
import { storage } from '@matchpulse/utils';

const TUTORIAL_SEEN_KEY = 'hasSeenTutorial';

export function useTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = storage.get<string>(TUTORIAL_SEEN_KEY);
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = (totalSteps: number) => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    storage.set(TUTORIAL_SEEN_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const confirmSkip = () => {
    storage.set(TUTORIAL_SEEN_KEY, 'true');
    setShowSkipModal(false);
    setIsOpen(false);
  };

  const resetTutorial = () => {
    storage.remove(TUTORIAL_SEEN_KEY);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return {
    isOpen,
    currentStep,
    showSkipModal,
    setIsOpen,
    setShowSkipModal,
    handleNext,
    handlePrevious,
    handleClose,
    handleSkip,
    confirmSkip,
    resetTutorial,
  };
}
