import { ACCESS_CONFIG, canAccessFeature, FeatureKey, LicenseInfo } from '../types/access';

const INSTALLATION_KEY = 'tka_installation_id_v1';
const LICENSE_TOKEN_KEY = 'tka_license_token_v1';
const LICENSE_INFO_KEY = 'tka_license_info_v1';

type Listener = (isPremium: boolean, info: LicenseInfo | null) => void;

class AccessService {
  private listeners: Set<Listener> = new Set();
  private _isPremium: boolean = false;
  private _licenseInfo: LicenseInfo | null = null;
  private _initialized: boolean = false;

  constructor() {
    this.init();
  }

  // Ensure unique installation ID
  public getInstallationId(): string {
    let id = localStorage.getItem(INSTALLATION_KEY);
    if (!id) {
      id = 'INST-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      localStorage.setItem(INSTALLATION_KEY, id);
    }
    return id;
  }

  public getLicenseToken(): string | null {
    return localStorage.getItem(LICENSE_TOKEN_KEY);
  }

  public getLicenseInfo(): LicenseInfo | null {
    if (this._licenseInfo) return this._licenseInfo;
    try {
      const data = localStorage.getItem(LICENSE_INFO_KEY);
      if (data) {
        this._licenseInfo = JSON.parse(data);
        return this._licenseInfo;
      }
    } catch {}
    return null;
  }

  public isPremium(): boolean {
    return this._isPremium;
  }

  public canAccess(featureKey: FeatureKey): boolean {
    return canAccessFeature(featureKey, this._isPremium);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this._isPremium, this._licenseInfo);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this._isPremium, this._licenseInfo);
      } catch (err) {
        console.error('Error notifying access listener:', err);
      }
    }
  }

  // Headers to attach to server requests
  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'x-installation-id': this.getInstallationId(),
    };
    const token = this.getLicenseToken();
    if (token) {
      headers['x-license-token'] = token;
    }
    return headers;
  }

  // Initialize and verify license with server
  public async init(): Promise<boolean> {
    const token = this.getLicenseToken();
    const installationId = this.getInstallationId();

    if (!token) {
      this._isPremium = false;
      this._licenseInfo = null;
      this._initialized = true;
      this.notify();
      return false;
    }

    try {
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installationId, token }),
      });

      if (!res.ok) throw new Error('Network error');

      const data = await res.json();
      if (data.valid && data.isPremium) {
        this._isPremium = true;
        this._licenseInfo = data.licenseInfo;
        localStorage.setItem(LICENSE_INFO_KEY, JSON.stringify(data.licenseInfo));
      } else {
        // Token was invalid or revoked
        this._isPremium = false;
        this._licenseInfo = null;
        localStorage.removeItem(LICENSE_TOKEN_KEY);
        localStorage.removeItem(LICENSE_INFO_KEY);
      }
    } catch (err) {
      console.warn('License verification network error, keeping cached state if any:', err);
      // If network fails, gracefully respect cached token if available
      const cached = this.getLicenseInfo();
      this._isPremium = Boolean(cached && cached.status === 'active');
    }

    this._initialized = true;
    this.notify();
    return this._isPremium;
  }

  // Activate license code with backend
  public async activateCode(
    code: string,
    clientName?: string
  ): Promise<{ success: boolean; message: string; error?: string }> {
    const installationId = this.getInstallationId();

    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          installationId,
          clientName: clientName || 'Pengguna SD/MI',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'Aktivasi gagal. Silakan periksa kembali kode yang Anda masukkan.',
          error: data.code,
        };
      }

      // Save token and license info
      localStorage.setItem(LICENSE_TOKEN_KEY, data.token);
      localStorage.setItem(LICENSE_INFO_KEY, JSON.stringify(data.licenseInfo));
      this._isPremium = true;
      this._licenseInfo = data.licenseInfo;
      this.notify();

      return {
        success: true,
        message: data.message || 'Selamat! Seluruh fitur aplikasi kini telah terbuka permanen.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Verifikasi belum dapat dilakukan karena gangguan koneksi. Silakan coba kembali beberapa saat lagi.',
        error: 'CONNECTION_ERROR',
      };
    }
  }

  // Deactivate / logout from license on this device
  public deactivateDevice(): void {
    localStorage.removeItem(LICENSE_TOKEN_KEY);
    localStorage.removeItem(LICENSE_INFO_KEY);
    this._isPremium = false;
    this._licenseInfo = null;
    this.notify();
  }
}

export const accessService = new AccessService();
