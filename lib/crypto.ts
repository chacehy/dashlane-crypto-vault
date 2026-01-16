import { argon2id } from 'hash-wasm';

const AES_ALGO = 'AES-GCM';
const IV_LEN = 12; // bytes for AES-GCM

// Helper to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper to convert Uint8Array to base64
function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binaryString = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
}

/**
 * Derives a Key Encryption Key (KEK) from a password and salt using Argon2id.
 */
export async function deriveKEK(password: string, salt: string): Promise<Uint8Array> {
    const hash = await argon2id({
        password,
        salt: base64ToUint8Array(salt),
        parallelism: 4,
        iterations: 3,
        memorySize: 65536, // 64MB
        hashLength: 32, // bytes
        outputType: 'binary',
    });
    return hash;
}

/**
 * Generates a random 256-bit Master Key (MK).
 */
export function generateMasterKey(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Generates a random salt or nonce of specified length.
 */
export function generateRandomValues(len: number = 16): string {
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    return uint8ArrayToBase64(bytes);
}

/**
 * Encrypts data using a key and AES-GCM.
 */
export async function encrypt(data: string, keyBytes: Uint8Array): Promise<{ ciphertext: string; nonce: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes as any,
        AES_ALGO,
        false,
        ['encrypt']
    );

    const encodedData = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
        { name: AES_ALGO, iv } as any,
        cryptoKey,
        encodedData
    );

    return {
        ciphertext: uint8ArrayToBase64(new Uint8Array(encrypted)),
        nonce: uint8ArrayToBase64(iv),
    };
}

/**
 * Decrypts data using a key and AES-GCM.
 */
export async function decrypt(ciphertext: string, keyBytes: Uint8Array, nonce: string): Promise<string> {
    const iv = base64ToUint8Array(nonce);
    const data = base64ToUint8Array(ciphertext);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes as any,
        AES_ALGO,
        false,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: AES_ALGO, iv } as any,
        cryptoKey,
        data as any
    );

    return new TextDecoder().decode(decrypted);
}

/**
 * Helper to encrypt a Master Key with a KEK.
 */
export async function encryptMK(mk: Uint8Array, kek: Uint8Array): Promise<{ ciphertext: string; nonce: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        kek as any,
        AES_ALGO,
        false,
        ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
        { name: AES_ALGO, iv } as any,
        cryptoKey,
        mk as any
    );

    return {
        ciphertext: uint8ArrayToBase64(new Uint8Array(encrypted)),
        nonce: uint8ArrayToBase64(iv),
    };
}

/**
 * Helper to decrypt a Master Key with a KEK.
 */
export async function decryptMK(encryptedMk: string, kek: Uint8Array, nonce: string): Promise<Uint8Array> {
    const iv = base64ToUint8Array(nonce);
    const data = base64ToUint8Array(encryptedMk);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        kek as any,
        AES_ALGO,
        false,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: AES_ALGO, iv } as any,
        cryptoKey,
        data as any
    );

    return new Uint8Array(decrypted);
}

/**
 * Generates an RSA-OAEP key pair for asymmetric encryption.
 */
export async function generateAsymmetricKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Exports a public key to a base64-encoded JWK.
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
    const jwk = await crypto.subtle.exportKey('jwk', key);
    return btoa(JSON.stringify(jwk));
}

/**
 * Imports a public key from a base64-encoded JWK.
 */
export async function importPublicKey(jwkBase64: string): Promise<CryptoKey> {
    const jwk = JSON.parse(atob(jwkBase64));
    return await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
    );
}

/**
 * Exports a private key encrypted with a KEK.
 */
export async function exportPrivateKey(key: CryptoKey, kek: Uint8Array): Promise<{ ciphertext: string; nonce: string }> {
    const jwk = await crypto.subtle.exportKey('jwk', key);
    const jwkString = JSON.stringify(jwk);
    return await encrypt(jwkString, kek);
}

/**
 * Imports a private key decrypted with a KEK.
 */
export async function importPrivateKey(encryptedJwk: string, kek: Uint8Array, nonce: string): Promise<CryptoKey> {
    const jwkString = await decrypt(encryptedJwk, kek, nonce);
    const jwk = JSON.parse(jwkString);
    return await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['decrypt']
    );
}

/**
 * Encrypts data with a public key using RSA-OAEP.
 */
export async function asymmetricEncrypt(data: Uint8Array, publicKey: CryptoKey): Promise<Uint8Array> {
    const encrypted = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' } as any,
        publicKey,
        data as any
    );
    return new Uint8Array(encrypted);
}

/**
 * Decrypts data with a private key using RSA-OAEP.
 */
export async function asymmetricDecrypt(ciphertext: Uint8Array, privateKey: CryptoKey): Promise<Uint8Array> {
    const decrypted = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' } as any,
        privateKey,
        ciphertext as any
    );
    return new Uint8Array(decrypted);
}

// Helper to convert base64 to Uint8Array for sharing
export function b64ToUint8(b64: string): Uint8Array {
    return base64ToUint8Array(b64);
}

// Helper to convert Uint8Array to base64 for sharing
export function uint8ToB64(bytes: Uint8Array): string {
    return uint8ArrayToBase64(bytes);
}
