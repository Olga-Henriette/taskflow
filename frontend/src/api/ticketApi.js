import axios from './axios';

/**
 * Récupérer tous les tickets d'un projet
 */
export const getProjectTickets = async (projectId, params = {}) => {
  const response = await axios.get(`/tickets/projects/${projectId}/tickets`, { params });
  return response;
};

export const getTicketById = async (ticketId) => {
  const response = await axios.get(`/tickets/${ticketId}`);
  return response;
};

export const createTicket = async (projectId, ticketData) => {
  const response = await axios.post(`/tickets/projects/${projectId}/tickets`, ticketData);
  return response;
};

export const updateTicket = async (ticketId, ticketData) => {
  const response = await axios.put(`/tickets/${ticketId}`, ticketData);
  return response;
};

export const deleteTicket = async (ticketId) => {
  const response = await axios.delete(`/tickets/${ticketId}`);
  return response;
};

/**
 * Assigner des utilisateurs au ticket
 */
export const assignTicket = async (ticketId, userIds) => {
  const response = await axios.post(`/tickets/${ticketId}/assign`, { userIds });
  return response;
};

/**
 * Retirer un utilisateur du ticket
 */
export const unassignTicket = async (ticketId, userId) => {
  const response = await axios.delete(`/tickets/${ticketId}/assign/${userId}`);
  return response;
};