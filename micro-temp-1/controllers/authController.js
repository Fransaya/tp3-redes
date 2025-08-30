import { login } from '../auth.js';

let tokens = null;

export const getTokens = async (req, res) => {
    try {
        tokens = await login();
        res.json(tokens);
    } catch (error) {
        res.status(401).json({ error: 'No se pudo hacer login', message: error.message });
    }
};