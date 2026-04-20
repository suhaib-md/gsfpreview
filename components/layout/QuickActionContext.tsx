'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type ModalType = 'subscription' | 'donation' | 'expense' | null

interface QuickActionContextType {
  activeModal: ModalType
  openModal: (type: NonNullable<ModalType>) => void
  closeModal: () => void
}

const QuickActionContext = createContext<QuickActionContextType>({
  activeModal: null,
  openModal: () => {},
  closeModal: () => {},
})

export function QuickActionProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  return (
    <QuickActionContext.Provider
      value={{
        activeModal,
        openModal: (type) => setActiveModal(type),
        closeModal: () => setActiveModal(null),
      }}
    >
      {children}
    </QuickActionContext.Provider>
  )
}

export function useQuickAction() {
  return useContext(QuickActionContext)
}
