import { ChannelType } from 'discord.js';

/**
 * Channel configuration interface
 */
export interface ChannelConfig {
  name: string;
  type: ChannelType;
  description?: string;
}

/**
 * Category configuration interface
 */
export interface CategoryConfig {
  name: string;
  channels: ChannelConfig[];
}

/**
 * Complete channel structure for CGE Development Automation Discord server
 * This defines all categories and their channels in the order they should be created
 */
export const CHANNEL_STRUCTURE: CategoryConfig[] = [
  {
    name: '🎯 COMMAND CENTER',
    channels: [
      {
        name: 'command-center',
        type: ChannelType.GuildText,
        description: 'Main command interface for all automation operations'
      },
      {
        name: 'approvals',
        type: ChannelType.GuildText,
        description: 'All agents post here for approval before executing tasks'
      }
    ]
  },
  {
    name: '🤖 AGENT WORKSPACE',
    channels: [
      {
        name: 'orchestrator-status',
        type: ChannelType.GuildText,
        description: 'Coordination updates and agent orchestration status'
      },
      {
        name: 'blueprint-work',
        type: ChannelType.GuildText,
        description: 'Technical specification development workspace'
      },
      {
        name: 'phase-planning',
        type: ChannelType.GuildText,
        description: 'Phase decomposition and timeline planning'
      },
      {
        name: 'prompt-generation',
        type: ChannelType.GuildText,
        description: 'Prompt creation and template generation'
      },
      {
        name: 'enhancement-work',
        type: ChannelType.GuildText,
        description: 'Prompt enhancement and optimization'
      },
      {
        name: 'build-monitor',
        type: ChannelType.GuildText,
        description: 'Build execution tracking and real-time monitoring'
      },
      {
        name: 'review-results',
        type: ChannelType.GuildText,
        description: 'Quality checks, test results, and issue identification'
      }
    ]
  },
  {
    name: '📊 MONITORING',
    channels: [
      {
        name: 'error-log',
        type: ChannelType.GuildText,
        description: 'Error tracking and exception logging'
      },
      {
        name: 'agent-status',
        type: ChannelType.GuildText,
        description: 'Health checks and agent availability monitoring'
      },
      {
        name: 'activity-log',
        type: ChannelType.GuildText,
        description: 'Complete audit trail of all system activities'
      }
    ]
  },
  {
    name: '📚 ARCHIVES',
    channels: [
      {
        name: 'completed-projects',
        type: ChannelType.GuildText,
        description: 'Archive of finished projects and deliverables'
      },
      {
        name: 'documentation',
        type: ChannelType.GuildText,
        description: 'System documentation, guides, and references'
      }
    ]
  }
];

/**
 * Get total number of channels across all categories
 */
export function getTotalChannelCount(): number {
  return CHANNEL_STRUCTURE.reduce((total, category) => total + category.channels.length, 0);
}

/**
 * Get total number of categories
 */
export function getTotalCategoryCount(): number {
  return CHANNEL_STRUCTURE.length;
}

/**
 * Find a channel configuration by name
 */
export function findChannelConfig(channelName: string): ChannelConfig | undefined {
  for (const category of CHANNEL_STRUCTURE) {
    const channel = category.channels.find(ch => ch.name === channelName);
    if (channel) return channel;
  }
  return undefined;
}
