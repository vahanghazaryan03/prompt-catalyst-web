import { create } from 'zustand';

const useEditStore = create((set, get) => ({
  // Image upload state for transferring from Generate to Edit
  pendingImageForEdit: null,
  
  // Function to set an image for editing (called from Generate component)
  setPendingImageForEdit: (imageData) => {
    set({ pendingImageForEdit: imageData });
  },
  
  // Function to clear the pending image (called from Edit component after using it)
  clearPendingImageForEdit: () => {
    set({ pendingImageForEdit: null });
  },
}));

export default useEditStore;
