/**
 * Get a cookie value by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };
  
  /**
   * Set a cookie with the given name and value
   * @param name - The name of the cookie
   * @param value - The value to store
   * @param days - Number of days until the cookie expires (optional)
   */
  export const setCookie = (name: string, value: string, days?: number): void => {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (days) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      cookie += `; expires=${expiry.toUTCString()}`;
    }
    
    cookie += '; path=/';
    document.cookie = cookie;
  };
  
  /**
   * Delete a cookie by name
   * @param name - The name of the cookie to delete
   */
  export const deleteCookie = (name: string): void => {
    setCookie(name, '', -1);
  };
  
  /**
   * Check if a cookie exists
   * @param name - The name of the cookie to check
   * @returns boolean indicating if the cookie exists
   */
  export const hasCookie = (name: string): boolean => {
    return getCookie(name) !== null;
  };