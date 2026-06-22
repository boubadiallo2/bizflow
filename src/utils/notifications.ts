import Swal from 'sweetalert2';

// Configuration de base pour le style BizFlow
const baseConfig = {
  customClass: {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-secondary',
    popup: 'swal-bizflow-popup'
  },
  buttonsStyling: false,
};

export const showConfirm = async (title: string, text?: string, confirmText = 'Oui, continuer') => {
  const result = await Swal.fire({
    ...baseConfig,
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Annuler',
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: 'success',
    title: title,
    text: text,
  });
};

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    icon: 'error',
    title: title,
    text: text,
  });
};
