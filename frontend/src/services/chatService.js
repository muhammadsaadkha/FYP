import api from './api.js';

export const askAssistant = (message) => api.post('/chat', { message });
