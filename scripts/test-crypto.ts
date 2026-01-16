import { deriveKEK, generateMasterKey, encryptMK, decryptMK, encrypt, decrypt, generateRandomValues } from '../lib/crypto';
import { webcrypto } from 'node:crypto';

// Polyfill for Node.js to match browser behavior in tests
if (typeof crypto === 'undefined') {
    (global as any).crypto = webcrypto;
}
if (typeof atob === 'undefined') {
    (global as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof btoa === 'undefined') {
    (global as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

async function testCrypto() {
    console.log('Testing Crypto...');

    const password = 'my-master-password';
    const saltKek = generateRandomValues(16);

    console.log('1. Deriving KEK...');
    const kek = await deriveKEK(password, saltKek);
    console.log('KEK derived, length:', kek.length);

    console.log('2. Generating & Encrypting Master Key...');
    const mk = generateMasterKey();
    const { ciphertext: encMk, nonce: mkNonce } = await encryptMK(mk, kek);
    console.log('MK Encrypted:', encMk);

    console.log('3. Decrypting Master Key...');
    const decryptedMk = await decryptMK(encMk, kek, mkNonce);
    console.log('MK Decrypted correctly:', Buffer.from(mk).equals(Buffer.from(decryptedMk)));

    console.log('4. Encrypting Vault Item...');
    const secretData = JSON.stringify({ site: 'google.com', pass: 'secret123' });
    const { ciphertext: encData, nonce: dataNonce } = await encrypt(secretData, mk);
    console.log('Data Encrypted:', encData);

    console.log('5. Decrypting Vault Item...');
    const decryptedDataStr = await decrypt(encData, mk, dataNonce);
    const decryptedData = JSON.parse(decryptedDataStr);
    console.log('Data Decrypted correctly:', decryptedData.pass === 'secret123');

    if (Buffer.from(mk).equals(Buffer.from(decryptedMk)) && decryptedData.pass === 'secret123') {
        console.log('ALL TESTS PASSED!');
    } else {
        console.error('TESTS FAILED!');
    }
}

testCrypto().catch(console.error);
