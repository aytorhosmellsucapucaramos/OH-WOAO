/**
 * Catalog Service
 * Maneja la obtención de catálogos (razas, colores, tamaños)
 */

import api from './api';

/**
 * Obtener todas las razas
 */
export const getBreeds = async () => {
  const { data } = await api.get('/catalogs/breeds');
  return data.data;
};

/**
 * Obtener todos los colores
 */
export const getColors = async () => {
  const { data } = await api.get('/catalogs/colors');
  return data.data;
};

/**
 * Obtener todos los tamaños
 */
export const getSizes = async () => {
  const { data } = await api.get('/catalogs/sizes');
  return data.data;
};

/**
 * Obtener todos los catálogos de una vez
 */
export const getAllCatalogs = async () => {
  const { data } = await api.get('/catalogs/all');
  return data.data;
};
