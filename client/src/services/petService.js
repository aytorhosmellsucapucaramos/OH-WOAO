/**
 * Pet Service
 * Maneja todas las operaciones relacionadas con mascotas
 */

import api from './api';

/**
 * Registrar nueva mascota
 */
export const registerPet = async (petData) => {
  const formData = new FormData();
  
  Object.keys(petData).forEach(key => {
    if (petData[key] !== null && petData[key] !== undefined) {
      // Manejar el objeto paymentData separadamente
      if (key === 'paymentData' && typeof petData[key] === 'object') {
        const payment = petData[key];
        if (payment.receiptNumber) formData.append('receiptNumber', payment.receiptNumber);
        if (payment.issueDate) formData.append('receiptIssueDate', payment.issueDate);
        if (payment.fullName) formData.append('receiptPayer', payment.fullName);
        if (payment.amountPaid) formData.append('receiptAmount', payment.amountPaid);
        if (payment.voucherPhoto) formData.append('voucherPhoto', payment.voucherPhoto);
      } else {
        formData.append(key, petData[key]);
      }
    }
  });
  
  const { data } = await api.post('/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return data;
};

/**
 * Obtener todas las mascotas con paginación
 */
export const getPets = async (params = {}) => {
  const { data } = await api.get('/pets', { params });
  return data;
};

/**
 * Buscar mascota por DNI o CUI
 */
export const searchPet = async (query) => {
  const { data } = await api.get('/search', { params: { q: query } });
  return data;
};

/**
 * Obtener mascota por CUI
 */
export const getPetByCUI = async (cui) => {
  const { data } = await api.get(`/pet/${cui}`);
  return data;
};
