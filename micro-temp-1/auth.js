import dotenv from 'dotenv';
dotenv.config();

const LOGIN_URL = process.env.LOGIN_URL;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

/**
 * Hace login y devuelve accessToken, refreshToken y expiresIn
 */
export async function login() {
    try {
        console.log('Enviando login con:', { username: USERNAME, password: PASSWORD });

        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "temp_capture_service",
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

        return { accessToken, refreshToken, expiresIn };
    } catch (error) {
        console.error('Error en login:', error.message);
        throw error;
    }
}
