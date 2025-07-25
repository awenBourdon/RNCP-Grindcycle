'use client'
import { useState } from 'react'

export const useImageModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [currentBoardId, setCurrentBoardId] = useState('')
  const [currentBoardName, setCurrentBoardName] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')

  const openModal = (
    images: string[],
    boardId: string,
    boardName?: string,
    userName?: string,
    description?: string
  ) => {
    setCurrentImages(images)
    setCurrentBoardId(boardId)
    setCurrentBoardName(boardName || '')
    setCurrentUserName(userName || '')
    setCurrentDescription(description || '')
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCurrentImages([])
    setCurrentBoardId('')
    setCurrentBoardName('')
    setCurrentUserName('')
    setCurrentDescription('')
  }

  return {
    isOpen,
    images: currentImages,
    boardId: currentBoardId,
    name: currentBoardName,
    userName: currentUserName,
    description: currentDescription,
    openModal,
    closeModal,
  }
}
