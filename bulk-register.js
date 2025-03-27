/****************************************************
 * bulk-register.js
 * Ejecución: node bulk-register.js
 ****************************************************/
const axios = require('axios');

/**
 * Función para registrar un usuario en tu endpoint
 * @param {number} i índice de usuario (1..10)
 */
async function registerUser(i) {
    const email = `user${i}@prueba.com`;
    const password = `user${i}@prueba.com`;

    // Ajusta la URL base y endpoint
    const BASE_URL = 'http://localhost:5000';
    const REGISTER_ENDPOINT = '/api/auth/register';

    console.log(`\nRegistrando usuario #${i}: ${email}`);

    try {
        const resp = await axios.post(`${BASE_URL}${REGISTER_ENDPOINT}`, {
            email,
            password
            // Si tu endpoint requiere más campos, agrégalos aquí
            // nombre, role, etc.
        });
        console.log('Respuesta:', resp.data);
    } catch (error) {
        console.error(`Error registrando ${email}:`);
        if (error.response) {
            // Respuesta del servidor con error
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            // Error de red, DNS, etc.
            console.error(error.message);
        }
    }
}

/**
 * Función principal que registra 10 usuarios en serie
 */
async function main() {
    for (let i = 1; i <= 10; i++) {
        await registerUser(i); // Espera cada registro antes de continuar
    }
    console.log('\nProceso de registro finalizado.');
}

// Llamamos a main()
main().catch(err => {
    // Cualquier error no capturado
    console.error('Error global en main():', err);
});
