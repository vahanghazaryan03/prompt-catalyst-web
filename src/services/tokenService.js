// tokenService.js
class TokenService {
  constructor() {
    this.REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes
    this.lastRefreshTime = null;
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
      this.lastRefreshTime = Date.now();
    } else {
      this.clearToken();
    }
  }

  clearToken() {
    localStorage.removeItem('authToken');
    this.lastRefreshTime = null;
  }

  needsRefresh() {
    return this.lastRefreshTime && 
           (Date.now() - this.lastRefreshTime >= this.REFRESH_INTERVAL);
  }

  async refreshToken() {
    const currentToken = this.getToken();
    if (!currentToken) return null;

    try {
      const response = await fetch('https://catalystmedia.ai/promptcatalystfreedemo/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: currentToken })
      });

      if (!response.ok) throw new Error('Refresh failed');
      
      const data = await response.json();
      if (data.token) {
        this.setToken(data.token);
        return data.token;
      }
      
      throw new Error('No token in refresh response');
    } catch (error) {
      this.clearToken();
      window.dispatchEvent(new Event('tokenExpired'));
      throw error;
    }
  }

  async ensureFreshToken() {
    if (this.needsRefresh()) {
      return this.refreshToken();
    }
    return this.getToken();
  }
}

export const tokenService = new TokenService();
export default tokenService;