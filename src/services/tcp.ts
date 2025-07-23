
import net from 'net';

/**
 * Checks the status of a TCP port on a host.
 * @param target The IP address or hostname.
 * @param port The port number to check.
 * @returns An object with the status and latency.
 */
export async function checkTcp(target: string, port: number): Promise<{ status: 'UP' | 'DOWN'; latency: number | null }> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const startTime = Date.now();

        socket.setTimeout(10000); // 10-second timeout

        socket.on('connect', () => {
            const latency = Date.now() - startTime;
            socket.destroy();
            resolve({ status: 'UP', latency });
        });

        socket.on('error', () => {
            socket.destroy();
            resolve({ status: 'DOWN', latency: null });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ status: 'DOWN', latency: null });
        });

        socket.connect(port, target);
    });
}
