import { SavedMessage, InterviewSession, VoiceInterviewError } from "@/types/interview";

export interface InterviewMetrics {
  totalDuration: number;
  messageCount: number;
  candidateResponses: number;
  averageResponseTime: number;
  interactionRate: number;
  silencePeriods: number[];
  topicCoverage: string[];
  confidenceScore: number;
  fluencyScore: number;
  engagementScore: number;
  responseDepthScore: number;
}

export interface InterviewAnalytics {
  sessionId: string;
  metrics: InterviewMetrics;
  insights: string[];
  recommendations: string[];
  skillsAssessed: string[];
  behavioralIndicators: string[];
  interviewQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

class InterviewAnalyticsEngine {
  private messageTimestamps: Map<string, Date> = new Map();
  
  // Universal topic keywords that apply to any role/industry
  private universalTopicKeywords: Map<string, string[]> = new Map([
    // Universal topics (apply to all roles)
    ['communication', ['explain', 'describe', 'tell me', 'walk through', 'clarify', 'elaborate', 'detail']],
    ['problem-solving', ['approach', 'solution', 'challenge', 'resolve', 'handle', 'tackle', 'overcome']],
    ['experience', ['worked', 'responsible', 'involved', 'participated', 'contributed', 'achieved', 'accomplished']],
    ['leadership', ['led', 'managed', 'coordinated', 'supervised', 'guided', 'directed', 'organized']],
    ['collaboration', ['team', 'together', 'collaborated', 'cooperated', 'partnership', 'group', 'colleague']],
    ['learning', ['learned', 'studied', 'developed', 'improved', 'grew', 'acquired', 'mastered']],
    ['creativity', ['innovative', 'creative', 'designed', 'invented', 'original', 'unique', 'novel']],
    ['analytical', ['analyzed', 'evaluated', 'assessed', 'examined', 'investigated', 'research', 'data']],
    
    // Technical topics (for developers, engineers, tech roles)
    ['technical-architecture', ['architecture', 'system design', 'scalability', 'microservices', 'distributed systems']],
    ['programming', ['algorithm', 'code', 'programming', 'development', 'coding', 'software', 'implementation']],
    ['database', ['database', 'sql', 'queries', 'data modeling', 'mongodb', 'mysql', 'postgresql']],
    ['web-development', ['frontend', 'backend', 'api', 'web', 'javascript', 'react', 'node', 'html', 'css']],
    ['devops', ['deployment', 'docker', 'kubernetes', 'cloud', 'aws', 'ci/cd', 'infrastructure']],
    ['testing', ['testing', 'quality assurance', 'debugging', 'unit tests', 'integration tests']],
    ['security', ['security', 'authentication', 'authorization', 'encryption', 'cybersecurity']],
    
    // Industry-specific topics
    ['sales-marketing', ['sales', 'marketing', 'customer', 'revenue', 'campaigns', 'lead generation']],
    ['education', ['teaching', 'student', 'curriculum', 'lesson', 'learning objectives', 'assessment']],
    ['healthcare', ['patient', 'medical', 'clinical', 'treatment', 'diagnosis', 'healthcare']],
    ['finance', ['financial', 'budget', 'accounting', 'revenue', 'cost', 'profit', 'investment']],
    ['operations', ['process', 'efficiency', 'workflow', 'logistics', 'supply chain', 'optimization']]
  ]);

  analyzeMessages(messages: SavedMessage[]): InterviewMetrics {
    const candidateMessages = messages.filter(m => m.role === 'user');
    
    return {
      totalDuration: this.calculateTotalDuration(messages),
      messageCount: messages.length,
      candidateResponses: candidateMessages.length,
      averageResponseTime: this.calculateAverageResponseTime(candidateMessages),
      interactionRate: this.calculateInteractionRate(messages),
      silencePeriods: this.detectSilencePeriods(candidateMessages),
      topicCoverage: this.analyzeTopicCoverage(messages),
      confidenceScore: this.assessConfidence(candidateMessages),
      fluencyScore: this.assessFluency(candidateMessages),
      engagementScore: this.assessEngagement(candidateMessages),
      responseDepthScore: this.assessResponseDepth(candidateMessages)
    };
  }

  private calculateTotalDuration(messages: SavedMessage[]): number {
    if (messages.length < 2) return 0;
    
    const firstMessage = this.messageTimestamps.get(messages[0].content);
    const lastMessage = this.messageTimestamps.get(messages[messages.length - 1].content);
    
    if (!firstMessage || !lastMessage) return 0;
    
    return lastMessage.getTime() - firstMessage.getTime();
  }

  private calculateAverageResponseTime(candidateMessages: SavedMessage[]): number {
    const responseTimes: number[] = [];
    
    for (let i = 1; i < candidateMessages.length; i++) {
      const currentTimestamp = this.messageTimestamps.get(candidateMessages[i].content);
      const previousTimestamp = this.messageTimestamps.get(candidateMessages[i-1].content);
      
      if (currentTimestamp && previousTimestamp) {
        responseTimes.push(currentTimestamp.getTime() - previousTimestamp.getTime());
      }
    }
    
    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
  }

  private calculateInteractionRate(messages: SavedMessage[]): number {
    const totalDuration = this.calculateTotalDuration(messages);
    return totalDuration > 0 ? (messages.length / totalDuration) * 60000 : 0; // messages per minute
  }

  private detectSilencePeriods(messages: SavedMessage[]): number[] {
    const silencePeriods: number[] = [];
    const SILENCE_THRESHOLD = 5000; // 5 seconds
    
    for (let i = 1; i < messages.length; i++) {
      const currentTimestamp = this.messageTimestamps.get(messages[i].content);
      const previousTimestamp = this.messageTimestamps.get(messages[i-1].content);
      
      if (currentTimestamp && previousTimestamp) {
        const gap = currentTimestamp.getTime() - previousTimestamp.getTime();
        if (gap > SILENCE_THRESHOLD) {
          silencePeriods.push(gap);
        }
      }
    }
    
    return silencePeriods;
  }

  private analyzeTopicCoverage(messages: SavedMessage[]): string[] {
    const coveredTopics: Set<string> = new Set();
    const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
    
    this.universalTopicKeywords.forEach((keywords, topic) => {
      const found = keywords.some(keyword => allContent.includes(keyword.toLowerCase()));
      if (found) {
        coveredTopics.add(topic);
      }
    });
    
    return Array.from(coveredTopics);
  }

  private assessConfidence(candidateMessages: SavedMessage[]): number {
    const confidenceIndicators = [
      'confident', 'definitely', 'absolutely', 'certainly', 'sure',
      'know', 'clearly', 'obviously', 'believe', 'convinced'
    ];
    
    const uncertaintyIndicators = [
      'think', 'maybe', 'perhaps', 'guess', 'probably', 'might',
      'not sure', 'don\'t know', 'uncertain', 'confused', 'unsure'
    ];
    
    let confidenceScore = 50; // baseline
    const allContent = candidateMessages.map(m => m.content.toLowerCase()).join(' ');
    
    confidenceIndicators.forEach(indicator => {
      const matches = (allContent.match(new RegExp(`\\b${indicator}\\b`, 'g')) || []).length;
      confidenceScore += matches * 3;
    });
    
    uncertaintyIndicators.forEach(indicator => {
      const matches = (allContent.match(new RegExp(`\\b${indicator}\\b`, 'g')) || []).length;
      confidenceScore -= matches * 2;
    });
    
    return Math.max(0, Math.min(100, confidenceScore));
  }

  private assessFluency(candidateMessages: SavedMessage[]): number {
    if (candidateMessages.length === 0) return 0;
    
    const averageLength = candidateMessages.reduce((sum, msg) => sum + msg.content.length, 0) / candidateMessages.length;
    const complexSentences = candidateMessages.filter(msg => 
      msg.content.includes(',') || msg.content.includes(';') || 
      msg.content.includes('because') || msg.content.includes('however') ||
      msg.content.includes('therefore') || msg.content.includes('although')
    ).length;
    
    // Assess vocabulary diversity
    const allWords = candidateMessages.map(m => m.content).join(' ').toLowerCase().split(/\s+/);
    const uniqueWords = new Set(allWords.filter(word => word.length > 3));
    const vocabularyDiversity = uniqueWords.size / Math.max(allWords.length, 1);
    
    const fluencyScore = Math.min(100, 
      (averageLength / 50) * 25 + // Length factor (25%)
      (complexSentences / candidateMessages.length) * 50 + // Complexity factor (50%)
      (vocabularyDiversity * 100) * 25 // Vocabulary diversity (25%)
    );
    
    return Math.max(0, fluencyScore);
  }

  private assessEngagement(candidateMessages: SavedMessage[]): number {
    const engagementIndicators = [
      'interesting', 'excited', 'passionate', 'love', 'enjoy', 'motivate',
      'challenge', 'opportunity', 'growth', 'learn', 'develop', 'improve'
    ];
    
    const allContent = candidateMessages.map(m => m.content.toLowerCase()).join(' ');
    let engagementScore = 30; // baseline
    
    engagementIndicators.forEach(indicator => {
      const matches = (allContent.match(new RegExp(`\\b${indicator}\\b`, 'g')) || []).length;
      engagementScore += matches * 5;
    });
    
    // Bonus for asking questions (shows engagement)
    const questionsAsked = candidateMessages.filter(m => m.content.includes('?')).length;
    engagementScore += questionsAsked * 10;
    
    return Math.max(0, Math.min(100, engagementScore));
  }

  private assessResponseDepth(candidateMessages: SavedMessage[]): number {
    if (candidateMessages.length === 0) return 0;
    
    const averageLength = candidateMessages.reduce((sum, msg) => sum + msg.content.length, 0) / candidateMessages.length;
    const detailedResponses = candidateMessages.filter(msg => msg.content.length > 100).length;
    const examplesGiven = candidateMessages.filter(msg => 
      msg.content.toLowerCase().includes('example') ||
      msg.content.toLowerCase().includes('for instance') ||
      msg.content.toLowerCase().includes('such as') ||
      msg.content.toLowerCase().includes('like when')
    ).length;
    
    const depthScore = Math.min(100,
      (averageLength / 150) * 50 + // Average response length (50%)
      (detailedResponses / candidateMessages.length) * 30 + // Detailed responses ratio (30%)
      (examplesGiven / candidateMessages.length) * 20 // Examples given ratio (20%)
    );
    
    return Math.max(0, depthScore);
  }

  generateInsights(metrics: InterviewMetrics, session: InterviewSession): string[] {
    const insights: string[] = [];
    
    // Duration insights
    if (metrics.totalDuration < 5 * 60 * 1000) {
      insights.push("Interview was quite short. Consider longer sessions for comprehensive assessment.");
    } else if (metrics.totalDuration > 30 * 60 * 1000) {
      insights.push("Comprehensive interview duration - good opportunity for thorough evaluation.");
    }
    
    // Interaction insights
    if (metrics.interactionRate < 0.5) {
      insights.push("Limited interaction detected. Candidate may benefit from more engaging questions.");
    } else if (metrics.interactionRate > 2) {
      insights.push("High interaction rate - shows good conversational flow.");
    }
    
    // Confidence insights
    if (metrics.confidenceScore < 30) {
      insights.push("Candidate showed some uncertainty. Consider supportive questioning to build confidence.");
    } else if (metrics.confidenceScore > 80) {
      insights.push("Candidate demonstrated strong confidence in responses.");
    }
    
    // Engagement insights
    if (metrics.engagementScore > 70) {
      insights.push("High engagement level - candidate shows genuine interest.");
    } else if (metrics.engagementScore < 40) {
      insights.push("Limited engagement signals detected. Consider more interactive questions.");
    }
    
    // Response depth insights
    if (metrics.responseDepthScore > 70) {
      insights.push("Candidate provided detailed, thoughtful responses with good examples.");
    } else if (metrics.responseDepthScore < 40) {
      insights.push("Responses could be more detailed. Encourage elaboration with follow-up questions.");
    }
    
    // Topic coverage insights
    if (metrics.topicCoverage.length >= 5) {
      insights.push("Excellent topic coverage - well-rounded discussion across multiple areas.");
    } else if (metrics.topicCoverage.length < 3) {
      insights.push("Limited topic coverage. Consider diversifying question types for broader assessment.");
    }
    
    return insights;
  }

  generateRecommendations(metrics: InterviewMetrics, errors: VoiceInterviewError[]): string[] {
    const recommendations: string[] = [];
    
    // Technical recommendations
    if (errors.length > 0) {
      recommendations.push("Consider testing audio setup before starting future interviews.");
    }
    
    // Communication recommendations
    if (metrics.fluencyScore < 50) {
      recommendations.push("Practice expressing ideas clearly and organizing thoughts before speaking.");
    }
    
    // Engagement recommendations
    if (metrics.candidateResponses < 5) {
      recommendations.push("Try to provide more detailed responses to showcase your knowledge and experience.");
    }
    
    // Confidence recommendations
    if (metrics.confidenceScore < 50) {
      recommendations.push("Practice common interview questions to build confidence in your responses.");
    }
    
    // Depth recommendations
    if (metrics.responseDepthScore < 50) {
      recommendations.push("Use specific examples and stories to illustrate your points more effectively.");
    }
    
    // Interaction recommendations
    if (metrics.topicCoverage.length < 4) {
      recommendations.push("Try to cover diverse topics to demonstrate your well-rounded capabilities.");
    }
    
    return recommendations;
  }

  recordMessageTimestamp(content: string, timestamp: Date): void {
    this.messageTimestamps.set(content, timestamp);
  }

  generateFullAnalysis(
    messages: SavedMessage[], 
    session: InterviewSession, 
    errors: VoiceInterviewError[]
  ): InterviewAnalytics {
    const metrics = this.analyzeMessages(messages);
    const insights = this.generateInsights(metrics, session);
    const recommendations = this.generateRecommendations(metrics, errors);
    
    // Determine overall interview quality
    const overallScore = (
      metrics.confidenceScore * 0.25 +
      metrics.fluencyScore * 0.25 +
      metrics.engagementScore * 0.25 +
      metrics.responseDepthScore * 0.25
    );
    
    let interviewQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 80) interviewQuality = 'excellent';
    else if (overallScore >= 65) interviewQuality = 'good';
    else if (overallScore >= 45) interviewQuality = 'fair';
    else interviewQuality = 'poor';
    
    return {
      sessionId: session.id,
      metrics,
      insights,
      recommendations,
      skillsAssessed: this.extractAllSkills(messages),
      behavioralIndicators: this.extractBehavioralIndicators(messages),
      interviewQuality
    };
  }

  private extractAllSkills(messages: SavedMessage[]): string[] {
    // Universal skills that apply to ANY role
    const universalSkillIndicators = new Map([
      ['Communication', ['explained', 'presented', 'discussed', 'articulated', 'conveyed', 'described']],
      ['Problem Solving', ['solved', 'resolved', 'figured out', 'troubleshot', 'addressed', 'debugged']],
      ['Leadership', ['led', 'managed', 'coordinated', 'supervised', 'guided', 'mentored']],
      ['Teamwork', ['collaborated', 'worked together', 'team effort', 'group project', 'partnered']],
      ['Adaptability', ['adapted', 'flexible', 'adjusted', 'changed approach', 'pivoted', 'learned']],
      ['Critical Thinking', ['analyzed', 'evaluated', 'assessed', 'considered', 'examined', 'researched']],
      ['Time Management', ['prioritized', 'organized', 'scheduled', 'deadline', 'efficient', 'planned']],
      ['Learning Ability', ['learned', 'studied', 'researched', 'developed', 'acquired', 'mastered']]
    ]);

    // Technical skills that apply to developers, engineers, and tech roles
    const technicalSkillIndicators = new Map([
      ['Programming', ['javascript', 'python', 'java', 'typescript', 'react', 'node.js', 'coding', 'programming']],
      ['Database Management', ['sql', 'mongodb', 'database', 'queries', 'data modeling', 'mysql', 'postgresql']],
      ['System Design', ['architecture', 'scalability', 'microservices', 'api design', 'distributed systems']],
      ['DevOps & Infrastructure', ['docker', 'kubernetes', 'aws', 'cloud', 'deployment', 'ci/cd', 'monitoring']],
      ['Software Development', ['agile', 'scrum', 'testing', 'debugging', 'version control', 'git', 'code review']],
      ['Web Development', ['html', 'css', 'frontend', 'backend', 'responsive design', 'web apis', 'frameworks']],
      ['Data & Analytics', ['machine learning', 'data analysis', 'algorithms', 'statistics', 'visualization']],
      ['Security', ['cybersecurity', 'encryption', 'authentication', 'authorization', 'secure coding']]
    ]);

    // Industry-specific skills for non-technical roles
    const industrySkillIndicators = new Map([
      ['Sales & Marketing', ['sales', 'marketing', 'customer acquisition', 'lead generation', 'crm', 'campaigns']],
      ['Education & Training', ['teaching', 'curriculum', 'student engagement', 'lesson planning', 'assessment']],
      ['Healthcare', ['patient care', 'medical', 'clinical', 'diagnosis', 'treatment', 'healthcare']],
      ['Finance & Accounting', ['budgeting', 'financial analysis', 'accounting', 'auditing', 'compliance']],
      ['Human Resources', ['recruitment', 'employee relations', 'performance management', 'hr policies']],
      ['Operations & Logistics', ['supply chain', 'inventory', 'logistics', 'process improvement', 'operations']],
      ['Customer Service', ['customer support', 'service excellence', 'complaint resolution', 'client relations']],
      ['Creative & Design', ['design thinking', 'creative process', 'visual design', 'user experience', 'branding']]
    ]);

    const foundSkills: Set<string> = new Set();
    const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
    
    // Check universal skills (everyone has these)
    universalSkillIndicators.forEach((keywords, skill) => {
      const found = keywords.some(keyword => allContent.includes(keyword.toLowerCase()));
      if (found) {
        foundSkills.add(skill);
      }
    });

    // Check technical skills (for developers, engineers, tech roles)
    technicalSkillIndicators.forEach((keywords, skill) => {
      const found = keywords.some(keyword => allContent.includes(keyword.toLowerCase()));
      if (found) {
        foundSkills.add(skill);
      }
    });

    // Check industry-specific skills
    industrySkillIndicators.forEach((keywords, skill) => {
      const found = keywords.some(keyword => allContent.includes(keyword.toLowerCase()));
      if (found) {
        foundSkills.add(skill);
      }
    });
    
    return Array.from(foundSkills);
  }

  private extractBehavioralIndicators(messages: SavedMessage[]): string[] {
    const indicators: string[] = [];
    const candidateMessages = messages.filter(m => m.role === 'user');
    const allContent = candidateMessages.map(m => m.content.toLowerCase()).join(' ');
    
    // Leadership indicators
    if (candidateMessages.some(m => 
      /\b(led|managed|supervised|coordinated|guided|directed)\b/.test(m.content.toLowerCase())
    )) {
      indicators.push('Leadership Experience');
    }
    
    // Problem-solving indicators
    if (candidateMessages.some(m => 
      /\b(solved|resolved|fixed|addressed|troubleshot|overcame)\b/.test(m.content.toLowerCase())
    )) {
      indicators.push('Problem-Solving Approach');
    }
    
    // Team collaboration indicators
    if (candidateMessages.some(m => 
      /\b(team|collaborated|together|group|partnership|colleague)\b/.test(m.content.toLowerCase())
    )) {
      indicators.push('Team Collaboration');
    }
    
    // Initiative indicators
    if (candidateMessages.some(m => 
      /\b(initiated|started|proposed|suggested|took charge|volunteer)\b/.test(m.content.toLowerCase())
    )) {
      indicators.push('Initiative Taking');
    }
    
    // Learning mindset indicators
    if (candidateMessages.some(m => 
      /\b(learned|studied|developed|improved|grew|acquired)\b/.test(m.content.toLowerCase())
    )) {
      indicators.push('Growth Mindset');
    }
    
    return indicators;
  }
}

export const interviewAnalytics = new InterviewAnalyticsEngine(); 