
import axios from 'axios';

/**
 * Checks the status of a web server using an HTTP GET request.
 * @param target The URL to check (e.g., https://google.com).
 * @returns An object with the status and latency.
 */
export async function checkHttp(target: string): Promise<{ status: 'UP' | 'DOWN'; latency: number | null }> {
    const startTime = Date.now();
    try {
        const response = await axios.get(target, {
            timeout: 10000, // 10-second timeout
            validateStatus: (status) => status >= 200 && status < 300, // Only 2xx status codes are considered UP
        });
        const latency = Date.now() - startTime;
        return { status: 'UP', latency };
    } catch (error) {
        const latency = Date.now() - startTime;
        // Axios throws an error for non-2xx status codes or other network issues.
        return { status: 'DOWN', latency };
    }
}
