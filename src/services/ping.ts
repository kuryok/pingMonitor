
import ping from 'ping';

/**
 * Checks the status of a host using an ICMP ping.
 * @param target The IP address or hostname to ping.
 * @returns An object with the status and latency.
 */
export async function checkPing(target: string): Promise<{ status: 'UP' | 'DOWN'; latency: number | null }> {
    try {
        const res = await ping.promise.probe(target);
        if (res.alive) {
            const latency = res.time !== 'unknown' ? Math.round(res.time) : null;
            return { status: 'UP', latency };
        }
    } catch (error) {
        // The ping library can throw errors for invalid hosts, etc.
        console.error(`Error pinging ${target}:`, error);
    }
    return { status: 'DOWN', latency: null };
}
