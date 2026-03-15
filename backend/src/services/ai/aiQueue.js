/**
 * Lightweight Concurrent AI Job Queue
 * Manages throughput to external AI providers to prevent rate-limiting.
 */
export class AIQueue {
    constructor(concurrency = 2) {
        this.queue = [];
        this.running = 0;
        this.concurrency = concurrency;
    }

    async add(task, retries = 1) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, retries, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.running >= this.concurrency || this.queue.length === 0) return;

        const { task, retries, resolve, reject } = this.queue.shift();
        this.running++;

        try {
            const result = await task();
            resolve(result);
        } catch (error) {
            if (retries > 0) {
                console.warn(`[AIQueue] Task failed, retrying... (${retries} left)`);
                this.queue.push({ task, retries: retries - 1, resolve, reject });
            } else {
                reject(error);
            }
        } finally {
            this.running--;
            this.process();
        }
    }
}

export const defaultAIQueue = new AIQueue(3);
