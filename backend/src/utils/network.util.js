/**
 * Extract the real IP address from a request object
 * Handles various proxy scenarios and deployment environments
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
export const getClientIpAddress = (req) => {
  // Check for IP from various headers (common in load balancers, proxies)
  const forwardedIps = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  const clientIp = req.headers["x-client-ip"];
  const forwarded = req.headers["forwarded"];

  // x-forwarded-for can contain multiple IPs, take the first one (original client)
  if (forwardedIps) {
    const ips = forwardedIps.split(",").map((ip) => ip.trim());
    // Return the first non-private IP or the first IP if all are private
    for (const ip of ips) {
      if (isPublicIp(ip)) {
        return ip;
      }
    }
    return ips[0];
  }

  // Try other headers
  if (realIp) return realIp;
  if (clientIp) return clientIp;

  // Parse forwarded header (RFC 7239)
  if (forwarded) {
    const forMatch = forwarded.match(/for=([^;,\s]+)/);
    if (forMatch) {
      return forMatch[1].replace(/"/g, "");
    }
  }

  // Fallback to connection remote address
  if (req.connection?.remoteAddress) {
    return req.connection.remoteAddress;
  }

  // Fallback to socket remote address
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }

  // Final fallback for development
  return "127.0.0.1";
};

/**
 * Check if an IP address is public (not private/local)
 * @param {string} ip - IP address to check
 * @returns {boolean} - True if public IP
 */
const isPublicIp = (ip) => {
  // IPv4 private ranges
  const privateRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // 127.0.0.0/8 (localhost)
    /^169\.254\./, // 169.254.0.0/16 (link-local)
    /^::1$/, // IPv6 localhost
    /^fc00:/, // IPv6 private
    /^fe80:/, // IPv6 link-local
  ];

  return !privateRanges.some((range) => range.test(ip));
};

/**
 * Validate if an IP address has a valid format
 * @param {string} ip - IP address to validate
 * @returns {boolean} - True if valid IP format
 */
export const isValidIpAddress = (ip) => {
  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};
