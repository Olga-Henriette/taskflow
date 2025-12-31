import axios from './axios';

export const getTicketComments = (ticketId) => {
  return axios.get(`/tickets/${ticketId}/comments`);
};

export const createComment = (ticketId, content) => {
  return axios.post(`/tickets/${ticketId}/comments`, { content });
};

export const updateComment = (ticketId, commentId, content) => {
  return axios.put(`/tickets/${ticketId}/comments/${commentId}`, { content });
};

export const deleteComment = (ticketId, commentId) => {
  return axios.delete(`/tickets/${ticketId}/comments/${commentId}`);
};