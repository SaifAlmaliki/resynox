"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CallStatus, InterviewSession, VoiceInterviewError } from "@/types/interview";

interface UseInterviewSessionProps {
  interviewId: string;
  userId: string;
  maxReconnectAttempts?: number;
  sessionTimeout?: number; // in milliseconds
}

export function useInterviewSession({
  interviewId,
  userId,
  maxReconnectAttempts = 3,
  sessionTimeout = 30 * 60 * 1000 // 30 minutes
}: UseInterviewSessionProps) {
  const [session, setSession] = useState<InterviewSession>({
    id: interviewId,
    status: CallStatus.INACTIVE,
    errorCount: 0,
    reconnectAttempts: 0
  });

  const [errors, setErrors] = useState<VoiceInterviewError[]>([]);
  const sessionRef = useRef<InterviewSession>(session);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update ref when session changes
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Session timeout management
  const resetSessionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (sessionRef.current.status === CallStatus.ACTIVE) {
        setSession(prev => ({
          ...prev,
          status: CallStatus.FINISHING
        }));
        addError({
          code: 'SESSION_TIMEOUT',
          message: 'Interview session timed out',
          recoverable: false
        });
      }
    }, sessionTimeout);
  }, [sessionTimeout]);

  // Add error with deduplication
  const addError = useCallback((error: Omit<VoiceInterviewError, 'timestamp'>) => {
    const newError: VoiceInterviewError = {
      ...error,
      timestamp: new Date()
    };

    setErrors(prev => {
      // Prevent duplicate errors within 5 seconds
      const recent = prev.filter(e => 
        Date.now() - e.timestamp.getTime() < 5000 && 
        e.code === newError.code
      );
      
      if (recent.length > 0) {
        return prev;
      }
      
      return [...prev.slice(-9), newError]; // Keep last 10 errors
    });

    setSession(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      lastActivity: new Date()
    }));
  }, []);

  // Update session status with validation
  const updateStatus = useCallback((newStatus: CallStatus) => {
    setSession(prev => {
      // Skip if status is already the same
      if (prev.status === newStatus) {
        return prev;
      }
      
      // Validate status transitions
      const validTransitions: Record<CallStatus, CallStatus[]> = {
        [CallStatus.INACTIVE]: [CallStatus.INITIALIZING, CallStatus.CONNECTING, CallStatus.ACTIVE], // Allow direct to ACTIVE
        [CallStatus.INITIALIZING]: [CallStatus.CONNECTING, CallStatus.ACTIVE, CallStatus.ERROR], // Allow direct to ACTIVE
        [CallStatus.CONNECTING]: [CallStatus.ACTIVE, CallStatus.ERROR],
        [CallStatus.ACTIVE]: [CallStatus.PAUSED, CallStatus.FINISHING, CallStatus.ERROR],
        [CallStatus.PAUSED]: [CallStatus.ACTIVE, CallStatus.FINISHING, CallStatus.ERROR],
        [CallStatus.FINISHING]: [CallStatus.FINISHED, CallStatus.ERROR],
        [CallStatus.FINISHED]: [CallStatus.INACTIVE],
        [CallStatus.ERROR]: [CallStatus.INACTIVE, CallStatus.CONNECTING]
      };

      if (!validTransitions[prev.status]?.includes(newStatus)) {
        console.warn(`Invalid status transition: ${prev.status} -> ${newStatus}`);
        return prev;
      }

      const updatedSession = {
        ...prev,
        status: newStatus,
        lastActivity: new Date()
      };

      // Set timestamps based on status
      if (newStatus === CallStatus.ACTIVE && !prev.startTime) {
        updatedSession.startTime = new Date();
      } else if (newStatus === CallStatus.FINISHED && prev.startTime) {
        updatedSession.endTime = new Date();
        updatedSession.duration = updatedSession.endTime.getTime() - prev.startTime.getTime();
      }

      return updatedSession;
    });

    // Manage session timeout
    if (newStatus === CallStatus.ACTIVE) {
      resetSessionTimeout();
    } else if (timeoutRef.current && 
               [CallStatus.FINISHED, CallStatus.ERROR, CallStatus.INACTIVE].includes(newStatus)) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [resetSessionTimeout]);

  // Handle reconnection logic
  const attemptReconnect = useCallback(() => {
    if (session.reconnectAttempts >= maxReconnectAttempts) {
      addError({
        code: 'MAX_RECONNECT_ATTEMPTS',
        message: 'Maximum reconnection attempts exceeded',
        recoverable: false
      });
      updateStatus(CallStatus.ERROR);
      return false;
    }

    setSession(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    updateStatus(CallStatus.CONNECTING);
    return true;
  }, [session.reconnectAttempts, maxReconnectAttempts, addError, updateStatus]);

  // Reset session
  const resetSession = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setSession({
      id: interviewId,
      status: CallStatus.INACTIVE,
      errorCount: 0,
      reconnectAttempts: 0
    });

    setErrors([]);
  }, [interviewId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    session,
    errors,
    updateStatus,
    addError,
    attemptReconnect,
    resetSession,
    canReconnect: session.reconnectAttempts < maxReconnectAttempts,
    isActive: session.status === CallStatus.ACTIVE,
    hasErrors: errors.length > 0,
    lastError: errors[errors.length - 1] || null
  };
} 