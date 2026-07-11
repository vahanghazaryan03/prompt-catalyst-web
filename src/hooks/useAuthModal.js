import { create } from 'zustand';

const useAuthModal = create((set) => ({
  isOpen: false,
  view: 'login', // 'login', 'register', 'reset'
  defaultEmail: '',
  
  openModal: (view = 'login', defaultEmail = '') => set({ 
    isOpen: true, 
    view, 
    defaultEmail 
  }),
  
  closeModal: () => set({ 
    isOpen: false, 
    view: 'login', 
    defaultEmail: '' 
  }),
}));

export default useAuthModal;