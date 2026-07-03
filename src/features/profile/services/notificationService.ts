import axios from 'axios';
import { authStateManager } from '../../auth/state';
import { API_URL } from '../../../config/apiConfig';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

function getAuthHeaders(): { Authorization: string } {
    const token = authStateManager.getState().token;
    if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
    }
    return { Authorization: `Bearer ${token}` };
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  /**
   * Obtiene la lista de notificaciones del usuario autenticado
   */
  async getMyNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>('/notifications/my-notifications', {
          headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  },

  /**
   * Obtiene la cantidad de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<number>('/notifications/my-notifications/unread-count', {
          headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      // console.warn('Error al obtener conteo de notificaciones no leídas:', error.message);
      return 0; // Si falla, mejor retornar 0 para no romper la UI
    }
  },

  /**
   * Marca una notificación específica como leída
   */
  async markAsRead(id: number): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(`/notifications/${id}/read`, null, {
          headers: getAuthHeaders(),
      });
      import('react-native').then(({ DeviceEventEmitter }) => {
          DeviceEventEmitter.emit('notificationMarkedAsRead');
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error al marcar notificación ${id} como leída:`, error);
      throw error;
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/mark-all-read', null, {
          headers: getAuthHeaders(),
      });
      import('react-native').then(({ DeviceEventEmitter }) => {
          DeviceEventEmitter.emit('notificationMarkedAsRead');
      });
    } catch (error: any) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }
};
