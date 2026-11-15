
import * as SecureStore from 'expo-secure-store';

import { api } from './api';
import {
    LoginCredentials,
    LoginResponse,
    AuthUser,
    RegisterCredentials,
    RegisterResponse,
} from '@/types/auth';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

export async function login(
    credentials: LoginCredentials,
): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
        '/auth/login',
        credentials,
    );

    await SecureStore.setItemAsync(
        TOKEN_KEY,
        response.data.accessToken,
    );

    await SecureStore.setItemAsync(
        USER_KEY,
        JSON.stringify(response.data.user),
    );

    return response.data;
}

export async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
}

export async function getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthUser | null> {
    const storedUser = await SecureStore.getItemAsync(USER_KEY);

    if (!storedUser) {
        return null;
    }

    return JSON.parse(storedUser) as AuthUser;
}

export async function register(
    credentials: RegisterCredentials,
): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
        '/users',
        credentials,
    );
    return response.data;
}