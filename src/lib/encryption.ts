import CryptoJS from 'crypto-js';

// Client-side encryption utilities for sensitive mental health data
class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Initialize encryption key (derived from user session or device)
  initializeKey(userSession?: string): void {
    if (userSession) {
      // For authenticated users, derive key from session
      this.encryptionKey = CryptoJS.SHA256(userSession + 'mental-health-salt').toString();
    } else {
      // For anonymous users, use device-based key
      let deviceKey = localStorage.getItem('mh_device_key');
      if (!deviceKey) {
        deviceKey = CryptoJS.lib.WordArray.random(256/8).toString();
        localStorage.setItem('mh_device_key', deviceKey);
      }
      this.encryptionKey = deviceKey;
    }
  }

  // Encrypt sensitive data before storing
  encrypt(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  // Decrypt sensitive data after retrieving
  decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Encrypt object data
  encryptObject<T>(obj: T): string {
    return this.encrypt(JSON.stringify(obj));
  }

  // Decrypt object data
  decryptObject<T>(encryptedData: string): T {
    const decryptedString = this.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  }

  // Clear encryption key (for logout)
  clearKey(): void {
    this.encryptionKey = null;
  }

  // Generate secure hash for anonymous user identification
  generateAnonymousId(): string {
    const randomData = CryptoJS.lib.WordArray.random(128/8);
    return CryptoJS.SHA256(randomData).toString().substring(0, 16);
  }
}

export const encryption = EncryptionService.getInstance();