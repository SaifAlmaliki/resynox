"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { vapiLogger, LogLevel } from '@/lib/vapi.logger';
import { X, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';

// Only show in development mode
const isDev = process.env.NODE_ENV === 'development';

const VapiDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<ReturnType<typeof vapiLogger.getStoredLogs>>([]);
  const [activeTab, setActiveTab] = useState('logs');
  const [connectionStatus, setConnectionStatus] = useState({
    vapi: 'unknown',
    server: 'unknown',
    lastChecked: new Date().toISOString()
  });

  // Refresh logs
  const refreshLogs = () => {
    setLogs(vapiLogger.getStoredLogs());
  };

  // Clear logs
  const clearLogs = () => {
    vapiLogger.clearStoredLogs();
    refreshLogs();
  };

  // Check connection status
  const checkConnections = async () => {
    try {
      // Check VAPI connection - just attempt the request
      await fetch('https://api.vapi.ai/health', { 
        method: 'GET',
        mode: 'no-cors' // This will prevent CORS errors but won't give us the response content
      });
      
      // Check our server connection
      const serverStatus = await fetch('/api/health', { 
        method: 'GET' 
      });
      
      setConnectionStatus({
        vapi: 'ok', // We can't actually check the status due to CORS, so we assume it's OK if the request doesn't fail
        server: serverStatus.ok ? 'ok' : 'error',
        lastChecked: new Date().toISOString()
      });
      
      vapiLogger.info('Connection check completed', { 
        vapi: 'ok',
        server: serverStatus.ok ? 'ok' : 'error'
      });
    } catch (error) {
      vapiLogger.error('Connection check failed', { error });
      setConnectionStatus({
        vapi: 'error',
        server: 'error',
        lastChecked: new Date().toISOString()
      });
    }
  };

  // Load logs on initial render
  useEffect(() => {
    if (isOpen) {
      refreshLogs();
      checkConnections();
    }
  }, [isOpen]);

  // Don't render anything in production
  if (!isDev) return null;

  // Get log level badge
  const getLogLevelBadge = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return <Badge variant="destructive">ERROR</Badge>;
      case LogLevel.WARN:
        return <Badge variant="outline" className="bg-yellow-500 text-yellow-900 hover:bg-yellow-600">WARN</Badge>;
      case LogLevel.INFO:
        return <Badge variant="secondary">INFO</Badge>;
      case LogLevel.DEBUG:
        return <Badge variant="outline">DEBUG</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  // Get connection status badge
  const getConnectionBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge variant="outline" className="bg-green-500 text-green-900 hover:bg-green-600">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get connection status icon
  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
      >
        VAPI Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-[500px] shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">VAPI Debug Panel</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Monitor VAPI integration and troubleshoot issues
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
            <TabsTrigger value="connections" className="flex-1">Connections</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-4">
          <TabsContent value="logs" className="m-0">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                {logs.length} log entries
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshLogs}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={clearLogs}>
                  Clear
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[300px] rounded border p-2">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No logs available
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs border rounded p-2">
                      <div className="flex justify-between mb-1">
                        <div>{getLogLevelBadge(log.level)}</div>
                        <div className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </div>
                      <div className="font-medium">{log.message}</div>
                      {log.data !== undefined && log.data !== null && (
                        <pre className="mt-1 bg-muted p-1 rounded text-[10px] overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="connections" className="m-0">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                Last checked: {new Date(connectionStatus.lastChecked).toLocaleTimeString()}
              </div>
              <Button variant="outline" size="sm" onClick={checkConnections}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Check Now
              </Button>
            </div>
            
            <div className="space-y-3 p-3 border rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getConnectionIcon(connectionStatus.vapi)}
                  <span>VAPI API</span>
                </div>
                {getConnectionBadge(connectionStatus.vapi)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getConnectionIcon(connectionStatus.server)}
                  <span>Application Server</span>
                </div>
                {getConnectionBadge(connectionStatus.server)}
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <h4 className="font-medium mb-1">Troubleshooting Tips:</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>If VAPI connection fails, check your API tokens in environment variables</li>
                <li>If server connection fails, make sure your Next.js server is running</li>
                <li>Try restarting the development server if issues persist</li>
                <li>Check browser console for additional error details</li>
              </ul>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="pt-0">
        <div className="w-full text-xs text-muted-foreground text-center">
          This panel is only visible in development mode
        </div>
      </CardFooter>
    </Card>
  );
};

export default VapiDebugPanel;
