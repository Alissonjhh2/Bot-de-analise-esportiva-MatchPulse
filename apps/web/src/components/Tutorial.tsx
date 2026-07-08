'use client';

import { motion } from 'framer-motion';
import { Modal } from '@matchpulse/ui';
import { Button } from  '@matchpulse/ui';
import { X, ChevronRight, ChevronLeft, SkipForward, LayoutDashboard, PlusCircle, MessageSquare, Bell } from 'lucide-react';
import { tutorialSteps } from '@matchpulse/config';
import { useTutorial } from '@matchpulse/hooks';
import { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  Bell,
};

export function Tutorial() {
  const {
    isOpen,
    currentStep,
    showSkipModal,
    setShowSkipModal,
    handleNext,
    handlePrevious,
    handleSkip,
    confirmSkip,
  } = useTutorial();

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const IconComponent = iconMap[step.icon] || LayoutDashboard;

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setShowSkipModal(true)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2D69B3] rounded-lg flex items-center justify-center text-white font-bold">
                {currentStep + 1}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                de {tutorialSteps.length}
              </span>
            </div>
            <button
              onClick={() => setShowSkipModal(true)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Fechar tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#2D69B3] to-[#3DB8F5] rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              {step.description}
            </p>
          </motion.div>

          <div className="flex gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-[#2D69B3]'
                    : index < currentStep
                    ? 'bg-[#2D69B3] opacity-50'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button onClick={() => handleNext(tutorialSteps.length)} className="flex-1">
              {currentStep === tutorialSteps.length - 1 ? 'Concluir' : 'Próximo'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <button
            onClick={handleSkip}
            className="w-full mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-[#2D69B3] transition-colors"
          >
            Pular tutorial
          </button>
        </div>
      </Modal>

      <Modal isOpen={showSkipModal} onClose={() => setShowSkipModal(false)}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <SkipForward className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Pular Tutorial?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você pode reabrir o tutorial a qualquer momento nas configurações.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSkipModal(false)}
              className="flex-1"
            >
              Continuar Tutorial
            </Button>
            <Button onClick={confirmSkip} className="flex-1">
              Pular
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
