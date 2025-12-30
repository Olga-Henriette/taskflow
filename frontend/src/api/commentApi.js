import axios from './axios';

export const getTicketComments = async (ticketId, params = {}) => {
  const response = await axios.get(`/comments/tickets/${ticketId}/comments`, { params });
  return response;
};

export const createComment = async (ticketId, content) => {
  const response = await axios.post(`/comments/tickets/${ticketId}/comments`, { content });
  return response;
};

export const updateComment = async (commentId, content) => {
  const response = await axios.put(`/comments/${commentId}`, { content });
  return response;
};

export const deleteComment = async (commentId) => {
  const response = await axios.delete(`/comments/${commentId}`);
  return response;
};