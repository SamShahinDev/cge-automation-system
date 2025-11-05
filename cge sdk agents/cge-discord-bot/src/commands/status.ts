import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  version as discordJsVersion
} from 'discord.js';

/**
 * Bot status command definition
 */
export const data = new SlashCommandBuilder()
  .setName('bot-status')
  .setDescription('Display bot status, uptime, and system information');

// Track bot start time
const botStartTime = Date.now();

/**
 * Execute the bot status command
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    await interaction.deferReply({ ephemeral: false });

    const client = interaction.client;
    const guild = interaction.guild;

    // Calculate uptime
    const uptimeMs = Date.now() - botStartTime;
    const uptimeString = formatUptime(uptimeMs);

    // Calculate latency
    const apiLatency = Math.round(client.ws.ping);
    const messageLatency = Date.now() - interaction.createdTimestamp;

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const memoryTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

    // Get Node.js version
    const nodeVersion = process.version;

    // Get registered commands count
    let commandCount = 0;
    try {
      if (guild) {
        const commands = await client.application?.commands.fetch({ guildId: guild.id });
        commandCount = commands?.size || 0;
      } else {
        const commands = await client.application?.commands.fetch();
        commandCount = commands?.size || 0;
      }
    } catch (error) {
      console.error('Error fetching commands:', error);
    }

    // Get guild count
    const guildCount = client.guilds.cache.size;

    // Get user count
    let userCount = 0;
    client.guilds.cache.forEach(g => {
      userCount += g.memberCount || 0;
    });

    // Determine status color based on health
    let statusColor = 0x00FF00; // Green - Healthy
    if (apiLatency > 200) {
      statusColor = 0xFFFF00; // Yellow - Elevated latency
    }
    if (apiLatency > 500) {
      statusColor = 0xFF0000; // Red - High latency
    }

    // Build the embed
    const embed = new EmbedBuilder()
      .setColor(statusColor)
      .setTitle('🤖 Bot Status Dashboard')
      .setDescription('Current bot status and system information')
      .setThumbnail(client.user?.displayAvatarURL() || '')
      .setTimestamp();

    // Bot Information
    embed.addFields({
      name: '🤖 Bot Information',
      value:
        `**Bot Name:** ${client.user?.tag || 'Unknown'}\n` +
        `**Bot ID:** ${client.user?.id || 'Unknown'}\n` +
        `**Status:** ${getStatusEmoji(apiLatency)} Online\n` +
        `**Uptime:** ${uptimeString}`,
      inline: false
    });

    // Performance Metrics
    embed.addFields({
      name: '⚡ Performance Metrics',
      value:
        `**API Latency:** ${apiLatency}ms ${getLatencyStatus(apiLatency)}\n` +
        `**Message Latency:** ${messageLatency}ms\n` +
        `**Memory Usage:** ${memoryUsedMB} MB / ${memoryTotalMB} MB\n` +
        `**Memory Usage %:** ${((parseFloat(memoryUsedMB) / parseFloat(memoryTotalMB)) * 100).toFixed(1)}%`,
      inline: false
    });

    // Server Statistics
    if (guild) {
      embed.addFields({
        name: '📊 Server Statistics',
        value:
          `**Current Server:** ${guild.name}\n` +
          `**Server Members:** ${guild.memberCount || 0}\n` +
          `**Total Servers:** ${guildCount}\n` +
          `**Total Users:** ${userCount.toLocaleString()}`,
        inline: false
      });
    }

    // Command Information
    embed.addFields({
      name: '⚙️ Command Information',
      value:
        `**Registered Commands:** ${commandCount}\n` +
        `**Command Scope:** ${guild ? 'Guild-specific' : 'Global'}`,
      inline: false
    });

    // System Information
    embed.addFields({
      name: '💻 System Information',
      value:
        `**Node.js Version:** ${nodeVersion}\n` +
        `**Discord.js Version:** v${discordJsVersion}\n` +
        `**Platform:** ${process.platform}\n` +
        `**Architecture:** ${process.arch}`,
      inline: false
    });

    // Health Status Summary
    const healthStatus = getHealthStatus(apiLatency, parseFloat(memoryUsedMB), parseFloat(memoryTotalMB));
    embed.addFields({
      name: '🏥 Health Status',
      value: healthStatus,
      inline: false
    });

    // Footer with additional info
    embed.setFooter({
      text: `Requested by ${interaction.user.tag} • Bot Version 1.0.0`,
      iconURL: interaction.user.displayAvatarURL()
    });

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Error in bot-status command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (interaction.deferred) {
      await interaction.editReply(`❌ Error getting bot status: ${errorMessage}`);
    } else {
      await interaction.reply({ content: `❌ Error getting bot status: ${errorMessage}`, ephemeral: true });
    }
  }
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get status emoji based on latency
 */
function getStatusEmoji(latency: number): string {
  if (latency < 100) return '🟢';
  if (latency < 200) return '🟡';
  if (latency < 500) return '🟠';
  return '🔴';
}

/**
 * Get latency status text
 */
function getLatencyStatus(latency: number): string {
  if (latency < 100) return '(Excellent)';
  if (latency < 200) return '(Good)';
  if (latency < 500) return '(Fair)';
  return '(Poor)';
}

/**
 * Get overall health status
 */
function getHealthStatus(latency: number, memoryUsed: number, memoryTotal: number): string {
  const memoryPercent = (memoryUsed / memoryTotal) * 100;
  const issues: string[] = [];

  if (latency > 500) {
    issues.push('🔴 **High Latency** - API response time is elevated');
  } else if (latency > 200) {
    issues.push('🟡 **Moderate Latency** - API response time is slightly elevated');
  }

  if (memoryPercent > 90) {
    issues.push('🔴 **High Memory Usage** - Memory usage is critical');
  } else if (memoryPercent > 75) {
    issues.push('🟡 **Elevated Memory Usage** - Memory usage is above normal');
  }

  if (issues.length === 0) {
    return '🟢 **All Systems Operational**\nBot is running smoothly with no detected issues.';
  } else {
    return '**Detected Issues:**\n' + issues.join('\n');
  }
}

/**
 * Reset bot start time (for testing purposes)
 */
export function resetStartTime(): void {
  // This function can be called to reset the start time if needed
  // Currently not exposed, but available for future use
}
