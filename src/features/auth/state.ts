import { useState, useEffect } from 'react';

export interface JwtPayload {
  sub: string;
  authorities?: string[];
  role?: string;
  iat: number;
  exp: number;
  firstName?: string;
  lastName?: string;
}


export interface AuthState {
  token: string | null;
  payload: JwtPayload | null;
  role: string | null;
}

let globalAuthState: AuthState = {
  token: null,
  payload: null,
  role: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// Decodificador base64 seguro e independiente del entorno
function base64Decode(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const rawStr = str.replace(/=+$/, '');
  let output = '';
  
  if (rawStr.length % 4 === 1) {
    throw new Error('Formato de string base64 inválido.');
  }

  for (let bc = 0, bs = 0, buffer = 0, idx = 0; idx < rawStr.length; idx++) {
    const char = rawStr.charAt(idx);
    const pos = chars.indexOf(char);
    if (pos === -1) continue;

    buffer = bc % 4 ? buffer * 64 + pos : pos;
    if (bc++ % 4) {
      output += String.fromCharCode(255 & (buffer >> ((-2 * bc) & 6)));
    }
  }

  return output;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payloadBase64Url = parts[1];
    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = base64Decode(payloadBase64);
    
    let utf8String = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      utf8String += '%' + ('00' + charCode.toString(16)).slice(-2);
    }
    const jsonStr = decodeURIComponent(utf8String);
    return JSON.parse(jsonStr) as JwtPayload;
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
}

export const authStateManager = {
  getState(): AuthState {
    return { ...globalAuthState };
  },

  setSession(token: string) {
    const payload = decodeJwt(token);
    let role: string | null = null;
    
    if (payload) {
      if (payload.authorities && payload.authorities.length > 0) {
        const foundRole = payload.authorities.find((auth) => auth.startsWith('ROLE_'));
        if (foundRole) {
          role = foundRole.replace('ROLE_', '');
        } else {
          role = payload.authorities[0];
        }
      } else if (payload.role) {
        role = payload.role;
      }
    }

    globalAuthState = {
      token,
      payload,
      role,
    };
    notify();
  },

  clearSession() {
    globalAuthState = {
      token: null,
      payload: null,
      role: null,
    };
    notify();
  },

  updateProfileNames(firstName: string, lastName: string) {
    if (globalAuthState.payload) {
      globalAuthState = {
        ...globalAuthState,
        payload: {
          ...globalAuthState.payload,
          firstName,
          lastName,
        },
      };
      notify();
    }
  },

  isAdmin(): boolean {

    return globalAuthState.role === 'ADMIN';
  },
};

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>(authStateManager.getState());

  useEffect(() => {
    const handler = () => {
      setState(authStateManager.getState());
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return state;
}
