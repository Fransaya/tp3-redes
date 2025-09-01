import dotenv from 'dotenv';
dotenv.config();

const LOGIN_URL = process.env.LOGIN_URL;
const USERNAME = process.env.AUTH_USER;
const PASSWORD = process.env.PASSWORD;

import setToken from './utils/setToken.js';

/**
 * Hace login y devuelve accessToken, refreshToken y expiresIn
 */
export async function login() {
    try {
        console.log('Enviando login con:', { username: "temp_capture_service", password: PASSWORD });

        const response = await fetch(`${LOGIN_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: USERNAME,
                password: PASSWORD
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error en login: ${response.status} - ${text}`);
        }

        const data = await response.json();
        const { accessToken, refreshToken, expiresIn } = data;

        console.log('Login exitoso');
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log('Expira en (s):', expiresIn);
        
        //*  this funciton save the tokens in a memory variable
        setToken({ accessToken, refreshToken, expiresIn });

        return { accessToken, refreshToken, expiresIn };
    } catch (error) {
        console.error('Error en login:', error.message);
        throw error;
    }
}
