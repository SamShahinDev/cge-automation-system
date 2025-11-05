import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
  CategoryChannel,
  Message
} from 'discord.js';
import { CHANNEL_STRUCTURE, getTotalChannelCount, getTotalCategoryCount } from '../config/channels';

/**
 * Test setup command definition
 */
export const data = new SlashCommandBuilder()
  .setName('test-setup')
  .setDescription('Verify bot setup and permissions are working correctly');

/**
 * Test results interface
 */
interface TestResult {
  name: string;
  passed: boolean;
  warning?: boolean;
  message?: string;
}

/**
 * Execute the test setup command
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    await interaction.deferReply({ ephemeral: false });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command can only be used in a server!');
      return;
    }

    const results: TestResult[] = [];

    // Test 1: Bot Connection
    results.push(...await testBotConnection(guild));

    // Test 2: Channel Structure
    results.push(...await testChannelStructure(guild));

    // Test 3: Message Permissions
    results.push(...await testMessagePermissions(guild, interaction));

    // Test 4: Bot Capabilities
    results.push(...await testBotCapabilities(guild, interaction));

    // Generate results embed
    const embed = generateResultsEmbed(results);

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Error in test-setup command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (interaction.deferred) {
      await interaction.editReply(`❌ Error during setup test: ${errorMessage}`);
    } else {
      await interaction.reply({ content: `❌ Error during setup test: ${errorMessage}`, ephemeral: true });
    }
  }
}

/**
 * Test bot connection and basic guild access
 */
async function testBotConnection(guild: any): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test: Can see guild
  results.push({
    name: 'Guild Access',
    passed: !!guild,
    message: guild ? `Connected to ${guild.name}` : 'Cannot access guild'
  });

  // Test: Bot member exists
  const botMember = guild.members.me;
  results.push({
    name: 'Bot Member',
    passed: !!botMember,
    message: botMember ? `Bot user: ${botMember.user.tag}` : 'Bot member not found'
  });

  if (!botMember) {
    return results;
  }

  // Test: Administrator permission
  const hasAdmin = botMember.permissions.has(PermissionFlagsBits.Administrator);
  results.push({
    name: 'Administrator Permission',
    passed: hasAdmin,
    warning: !hasAdmin,
    message: hasAdmin ? 'Bot has administrator permissions' : 'Bot lacks administrator permissions (may cause issues)'
  });

  // Test: Manage Channels permission
  const canManageChannels = botMember.permissions.has(PermissionFlagsBits.ManageChannels);
  results.push({
    name: 'Manage Channels',
    passed: canManageChannels,
    message: canManageChannels ? 'Can manage channels' : 'Cannot manage channels'
  });

  // Test: Send Messages permission
  const canSendMessages = botMember.permissions.has(PermissionFlagsBits.SendMessages);
  results.push({
    name: 'Send Messages',
    passed: canSendMessages,
    message: canSendMessages ? 'Can send messages' : 'Cannot send messages'
  });

  // Test: Manage Messages permission
  const canManageMessages = botMember.permissions.has(PermissionFlagsBits.ManageMessages);
  results.push({
    name: 'Manage Messages',
    passed: canManageMessages,
    message: canManageMessages ? 'Can manage messages' : 'Cannot manage messages'
  });

  return results;
}

/**
 * Test channel structure
 */
async function testChannelStructure(guild: any): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const expectedCategories = new Map<string, string[]>();
  const foundCategories = new Map<string, CategoryChannel>();
  const foundChannels = new Map<string, TextChannel>();
  const missingChannels: string[] = [];

  // Build expected structure
  for (const category of CHANNEL_STRUCTURE) {
    expectedCategories.set(category.name.toLowerCase(), category.channels.map(ch => ch.name));
  }

  // Scan actual channels
  guild.channels.cache.forEach((channel: any) => {
    if (channel.type === ChannelType.GuildCategory) {
      foundCategories.set(channel.name.toLowerCase(), channel);
    } else if (channel.type === ChannelType.GuildText) {
      foundChannels.set(channel.name.toLowerCase(), channel);
    }
  });

  // Test: Total category count
  const expectedCategoryCount = getTotalCategoryCount();
  const actualCategoryCount = foundCategories.size;
  results.push({
    name: 'Category Count',
    passed: actualCategoryCount >= expectedCategoryCount,
    message: `Found ${actualCategoryCount}/${expectedCategoryCount} categories`
  });

  // Test: Each expected category exists
  for (const [categoryName] of expectedCategories) {
    const exists = foundCategories.has(categoryName);
    if (!exists) {
      results.push({
        name: `Category: ${categoryName}`,
        passed: false,
        message: 'Category missing'
      });
    }
  }

  // Test: Each expected channel exists
  for (const category of CHANNEL_STRUCTURE) {
    for (const channel of category.channels) {
      const exists = foundChannels.has(channel.name.toLowerCase());
      if (!exists) {
        missingChannels.push(channel.name);
      }
    }
  }

  const expectedChannelCount = getTotalChannelCount();
  const actualChannelCount = foundChannels.size;
  results.push({
    name: 'Channel Count',
    passed: missingChannels.length === 0,
    message: `Found ${actualChannelCount}/${expectedChannelCount} expected channels`
  });

  // List missing channels if any
  if (missingChannels.length > 0) {
    results.push({
      name: 'Missing Channels',
      passed: false,
      message: `Missing: ${missingChannels.join(', ')}`
    });
  }

  // Test: Key channels exist
  const keyChannels = ['command-center', 'approvals', 'agent-status', 'error-log'];
  for (const channelName of keyChannels) {
    const exists = foundChannels.has(channelName);
    results.push({
      name: `Key Channel: #${channelName}`,
      passed: exists,
      warning: !exists,
      message: exists ? 'Exists' : 'Missing'
    });
  }

  return results;
}

/**
 * Test message permissions in channels
 */
async function testMessagePermissions(guild: any, interaction: CommandInteraction): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Find a test channel (agent-status)
  const testChannel = guild.channels.cache.find(
    (ch: any) => ch.name === 'agent-status' && ch.type === ChannelType.GuildText
  ) as TextChannel;

  if (!testChannel) {
    results.push({
      name: 'Message Permission Test',
      passed: false,
      warning: true,
      message: 'Cannot find #agent-status channel for testing'
    });
    return results;
  }

  // Test: Send message
  try {
    const testMessage = await testChannel.send('🧪 Test message from /test-setup command');

    results.push({
      name: 'Send Messages',
      passed: true,
      message: `Successfully sent message to #${testChannel.name}`
    });

    // Test: Edit message
    try {
      await testMessage.edit('🧪 Test message (edited) ✓');
      results.push({
        name: 'Edit Messages',
        passed: true,
        message: 'Successfully edited message'
      });
    } catch (error) {
      results.push({
        name: 'Edit Messages',
        passed: false,
        message: 'Failed to edit message'
      });
    }

    // Test: Add reaction
    try {
      await testMessage.react('✅');
      results.push({
        name: 'Add Reactions',
        passed: true,
        message: 'Successfully added reaction'
      });
    } catch (error) {
      results.push({
        name: 'Add Reactions',
        passed: false,
        message: 'Failed to add reaction'
      });
    }

    // Clean up test message after a delay
    setTimeout(async () => {
      try {
        await testMessage.delete();
      } catch (error) {
        console.error('Failed to delete test message:', error);
      }
    }, 5000);

  } catch (error) {
    results.push({
      name: 'Send Messages',
      passed: false,
      message: `Cannot send messages to #${testChannel.name}`
    });
  }

  return results;
}

/**
 * Test bot capabilities
 */
async function testBotCapabilities(guild: any, interaction: CommandInteraction): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const botMember = guild.members.me;
  if (!botMember) {
    return results;
  }

  // Test: Slash commands registered
  try {
    const commands = await interaction.client.application?.commands.fetch({ guildId: guild.id });
    const commandCount = commands?.size || 0;

    results.push({
      name: 'Slash Commands',
      passed: commandCount > 0,
      message: `${commandCount} commands registered`
    });
  } catch (error) {
    results.push({
      name: 'Slash Commands',
      passed: false,
      message: 'Failed to fetch registered commands'
    });
  }

  // Test: Can create channels
  const canCreate = botMember.permissions.has(PermissionFlagsBits.ManageChannels);
  results.push({
    name: 'Create/Delete Channels',
    passed: canCreate,
    message: canCreate ? 'Bot can create/delete channels' : 'Bot cannot create/delete channels'
  });

  // Test: Can manage roles
  const canManageRoles = botMember.permissions.has(PermissionFlagsBits.ManageRoles);
  results.push({
    name: 'Manage Roles',
    passed: canManageRoles,
    warning: !canManageRoles,
    message: canManageRoles ? 'Can manage roles' : 'Cannot manage roles (may limit functionality)'
  });

  // Test: Can view audit log
  const canViewAudit = botMember.permissions.has(PermissionFlagsBits.ViewAuditLog);
  results.push({
    name: 'View Audit Log',
    passed: canViewAudit,
    warning: !canViewAudit,
    message: canViewAudit ? 'Can view audit log' : 'Cannot view audit log (may limit monitoring)'
  });

  return results;
}

/**
 * Generate results embed
 */
function generateResultsEmbed(results: TestResult[]): EmbedBuilder {
  const passed = results.filter(r => r.passed && !r.warning).length;
  const failed = results.filter(r => !r.passed && !r.warning).length;
  const warnings = results.filter(r => r.warning).length;
  const total = results.length;

  // Determine overall color
  let color = 0x00FF00; // Green
  if (failed > 0) {
    color = 0xFF0000; // Red
  } else if (warnings > 0) {
    color = 0xFFFF00; // Yellow
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('🧪 Bot Setup Test Results')
    .setTimestamp();

  // Group results by category
  const categories = [
    { title: '🔗 Bot Connection', pattern: /^(Guild Access|Bot Member|Administrator|Manage|Send Messages)/ },
    { title: '📁 Channel Structure', pattern: /^(Category|Channel Count|Missing|Key Channel)/ },
    { title: '💬 Message Permissions', pattern: /^(Send Messages|Edit|Add Reactions)/ },
    { title: '⚙️ Bot Capabilities', pattern: /^(Slash|Create|Manage Roles|View Audit)/ }
  ];

  for (const category of categories) {
    const categoryResults = results.filter(r => category.pattern.test(r.name));
    if (categoryResults.length === 0) continue;

    let fieldValue = '';
    for (const result of categoryResults) {
      const icon = result.passed ? '✅' : result.warning ? '⚠️' : '❌';
      const status = result.passed ? 'PASS' : result.warning ? 'WARN' : 'FAIL';
      fieldValue += `${icon} **${result.name}**: ${status}\n`;
      if (result.message) {
        fieldValue += `   └ ${result.message}\n`;
      }
    }

    embed.addFields({
      name: category.title,
      value: fieldValue || 'No tests',
      inline: false
    });
  }

  // Summary
  const summary = `**Total Tests:** ${total}\n` +
                  `✅ **Passed:** ${passed}\n` +
                  `❌ **Failed:** ${failed}\n` +
                  `⚠️ **Warnings:** ${warnings}`;

  embed.addFields({
    name: '📊 Summary',
    value: summary,
    inline: false
  });

  // Suggestions if there are failures
  if (failed > 0 || warnings > 0) {
    let suggestions = '';

    if (failed > 0) {
      suggestions += '**To fix failures:**\n';
      suggestions += '• Run `/setup-channels` to create missing channels\n';
      suggestions += '• Check bot permissions in Server Settings → Roles\n';
      suggestions += '• Ensure bot has Administrator permission\n\n';
    }

    if (warnings > 0) {
      suggestions += '**To resolve warnings:**\n';
      suggestions += '• Grant additional permissions to the bot role\n';
      suggestions += '• Some features may have limited functionality\n';
    }

    embed.addFields({
      name: '💡 Suggestions',
      value: suggestions,
      inline: false
    });
  } else {
    embed.addFields({
      name: '✅ Status',
      value: 'All tests passed! Your bot is fully configured and ready.',
      inline: false
    });
  }

  return embed;
}
