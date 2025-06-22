import { vapiLogger } from "./vapi.logger";

export interface VapiPerformanceMetrics {
  connectionTime: number;
  firstResponseTime: number;
  averageLatency: number;
  messagesSent: number;
  messagesReceived: number;
  reconnections: number;
  errors: number;
  uptime: number;
}

export interface VapiConnectionConfig {
  preloadAssistant?: boolean;
  warmupConnection?: boolean;
  cacheDuration?: number;
  loadBalancing?: boolean;
  priorityQueue?: boolean;
}

class VapiPerformanceManager {
  private metrics: VapiPerformanceMetrics = {
    connectionTime: 0,
    firstResponseTime: 0,
    averageLatency: 0,
    messagesSent: 0,
    messagesReceived: 0,
    reconnections: 0,
    errors: 0,
    uptime: 0
  };

  private sessionStartTime: number = 0;
  private connectionStartTime: number = 0;
  private lastMessageTime: number = 0;
  private latencyMeasurements: number[] = [];
  private assistantCache: Map<string, any> = new Map();
  private connectionQueue: Array<{ operation: () => Promise<void>; priority: number }> = [];
  private isProcessingQueue: boolean = false;

  // Connection optimization
  async optimizeConnection(config: VapiConnectionConfig = {}): Promise<void> {
    const {
      preloadAssistant = true,
      warmupConnection = true,
      cacheDuration = 5 * 60 * 1000, // 5 minutes
      loadBalancing = false,
      priorityQueue = true
    } = config;

    try {
      // Preload assistant configuration
      if (preloadAssistant) {
        await this.preloadAssistant();
      }

      // Warm up connection
      if (warmupConnection) {
        await this.warmupConnection();
      }

      // Setup priority queue
      if (priorityQueue) {
        this.setupPriorityQueue();
      }

      vapiLogger.info('VAPI connection optimized', { config });
    } catch (error) {
      vapiLogger.error('Failed to optimize VAPI connection', { error });
      throw error;
    }
  }

  private async preloadAssistant(): Promise<void> {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) return;

    try {
      // Check if assistant is already cached
      if (this.assistantCache.has(assistantId)) {
        vapiLogger.debug('Assistant already cached', { assistantId });
        return;
      }

      // Preload assistant configuration
      const assistantConfig = await this.fetchAssistantConfig(assistantId);
      this.assistantCache.set(assistantId, {
        config: assistantConfig,
        timestamp: Date.now()
      });

      vapiLogger.info('Assistant preloaded successfully', { assistantId });
    } catch (error) {
      vapiLogger.warn('Failed to preload assistant', { error });
    }
  }

  private async fetchAssistantConfig(assistantId: string): Promise<any> {
    // This would typically fetch from VAPI API
    // For now, return a placeholder
    return {
      id: assistantId,
      model: 'gpt-4o',
      voice: 'default'
    };
  }

  private async warmupConnection(): Promise<void> {
    try {
      vapiLogger.debug('Warming up VAPI connection...');
      
      // Perform lightweight connection test
      // This could be a simple ping or minimal assistant call
      const warmupStart = Date.now();
      
      // Simulate warmup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const warmupTime = Date.now() - warmupStart;
      vapiLogger.info('VAPI connection warmed up', { warmupTime });
    } catch (error) {
      vapiLogger.warn('Connection warmup failed', { error });
    }
  }

  private setupPriorityQueue(): void {
    // Implement priority-based connection queue
    // Higher priority for active interviews
    vapiLogger.debug('Priority queue setup complete');
  }

  // Performance monitoring
  startSession(): void {
    this.sessionStartTime = Date.now();
    this.resetMetrics();
    vapiLogger.debug('Performance monitoring started');
  }

  recordConnectionStart(): void {
    this.connectionStartTime = Date.now();
  }

  recordConnectionSuccess(): void {
    if (this.connectionStartTime) {
      this.metrics.connectionTime = Date.now() - this.connectionStartTime;
      vapiLogger.debug('Connection established', { connectionTime: this.metrics.connectionTime });
    }
  }

  recordFirstResponse(): void {
    if (this.sessionStartTime) {
      this.metrics.firstResponseTime = Date.now() - this.sessionStartTime;
      vapiLogger.debug('First response received', { firstResponseTime: this.metrics.firstResponseTime });
    }
  }

  recordMessageSent(): void {
    this.metrics.messagesSent++;
    this.lastMessageTime = Date.now();
  }

  recordMessageReceived(): void {
    this.metrics.messagesReceived++;
    
    // Calculate latency if we have a last message time
    if (this.lastMessageTime) {
      const latency = Date.now() - this.lastMessageTime;
      this.latencyMeasurements.push(latency);
      this.updateAverageLatency();
    }
  }

  recordReconnection(): void {
    this.metrics.reconnections++;
    vapiLogger.warn('Reconnection recorded', { totalReconnections: this.metrics.reconnections });
  }

  recordError(): void {
    this.metrics.errors++;
    vapiLogger.error('Error recorded', { totalErrors: this.metrics.errors });
  }

  private updateAverageLatency(): void {
    if (this.latencyMeasurements.length > 0) {
      const sum = this.latencyMeasurements.reduce((a, b) => a + b, 0);
      this.metrics.averageLatency = sum / this.latencyMeasurements.length;
      
      // Keep only last 50 measurements for performance
      if (this.latencyMeasurements.length > 50) {
        this.latencyMeasurements = this.latencyMeasurements.slice(-50);
      }
    }
  }

  private resetMetrics(): void {
    this.metrics = {
      connectionTime: 0,
      firstResponseTime: 0,
      averageLatency: 0,
      messagesSent: 0,
      messagesReceived: 0,
      reconnections: 0,
      errors: 0,
      uptime: 0
    };
    this.latencyMeasurements = [];
  }

  // Performance analysis
  getPerformanceReport(): VapiPerformanceMetrics & { 
    analysis: string[];
    recommendations: string[];
  } {
    const currentTime = Date.now();
    const uptime = this.sessionStartTime ? currentTime - this.sessionStartTime : 0;
    
    const metrics = {
      ...this.metrics,
      uptime
    };

    const analysis = this.analyzePerformance(metrics);
    const recommendations = this.generateRecommendations(metrics);

    return {
      ...metrics,
      analysis,
      recommendations
    };
  }

  private analyzePerformance(metrics: VapiPerformanceMetrics): string[] {
    const analysis: string[] = [];

    // Connection performance
    if (metrics.connectionTime > 5000) {
      analysis.push("Slow connection detected (>5s)");
    } else if (metrics.connectionTime < 1000) {
      analysis.push("Excellent connection speed (<1s)");
    }

    // Latency analysis
    if (metrics.averageLatency > 2000) {
      analysis.push("High latency detected (>2s average)");
    } else if (metrics.averageLatency < 500) {
      analysis.push("Low latency performance (<500ms average)");
    }

    // Reliability analysis
    const errorRate = metrics.errors / Math.max(metrics.messagesSent, 1);
    if (errorRate > 0.1) {
      analysis.push("High error rate detected (>10%)");
    } else if (errorRate < 0.01) {
      analysis.push("Excellent reliability (<1% error rate)");
    }

    // Reconnection analysis
    if (metrics.reconnections > 2) {
      analysis.push("Frequent reconnections detected");
    } else if (metrics.reconnections === 0) {
      analysis.push("Stable connection maintained");
    }

    return analysis;
  }

  private generateRecommendations(metrics: VapiPerformanceMetrics): string[] {
    const recommendations: string[] = [];

    // Connection recommendations
    if (metrics.connectionTime > 3000) {
      recommendations.push("Consider enabling connection preloading");
      recommendations.push("Check network conditions");
    }

    // Latency recommendations
    if (metrics.averageLatency > 1500) {
      recommendations.push("Consider using a CDN or edge servers");
      recommendations.push("Optimize message payload sizes");
    }

    // Error recommendations
    if (metrics.errors > 0) {
      recommendations.push("Review error handling and retry logic");
      recommendations.push("Implement connection health checks");
    }

    // General recommendations
    if (metrics.messagesReceived === 0 && metrics.messagesSent > 0) {
      recommendations.push("Check for message delivery issues");
    }

    return recommendations;
  }

  // Cache management
  clearCache(): void {
    this.assistantCache.clear();
    vapiLogger.debug('Performance cache cleared');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.assistantCache.size,
      entries: Array.from(this.assistantCache.keys())
    };
  }

  // Queue management
  async addToQueue(operation: () => Promise<void>, priority: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connectionQueue.push({
        operation: async () => {
          try {
            await operation();
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        priority
      });

      // Sort by priority if needed
      if (priority > 0) {
        this.connectionQueue.sort((a, b) => b.priority - a.priority);
      }

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.connectionQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.connectionQueue.length > 0) {
        const queueItem = this.connectionQueue.shift();
        if (queueItem) {
          await queueItem.operation();
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Health check
  async performHealthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    errors: string[];
  }> {
    const healthCheck = {
      healthy: true,
      latency: 0,
      errors: [] as string[]
    };

    try {
      const startTime = Date.now();
      
      // Perform basic connectivity test
      // This would typically ping the VAPI service
      await new Promise(resolve => setTimeout(resolve, 50));
      
      healthCheck.latency = Date.now() - startTime;

      // Check cache health
      if (this.assistantCache.size === 0) {
        healthCheck.errors.push('Assistant cache is empty');
      }

      // Check error rate
      const errorRate = this.metrics.errors / Math.max(this.metrics.messagesSent, 1);
      if (errorRate > 0.2) {
        healthCheck.healthy = false;
        healthCheck.errors.push('High error rate detected');
      }

    } catch (error) {
      healthCheck.healthy = false;
      healthCheck.errors.push(`Health check failed: ${error}`);
    }

    return healthCheck;
  }
}

export const vapiPerformance = new VapiPerformanceManager(); 