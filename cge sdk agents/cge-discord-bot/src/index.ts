import { Client, GatewayIntentBits, Events, REST, Routes, Collection, CommandInteraction, TextChannel, EmbedBuilder } from 'discord.js';
import * as dotenv from 'dotenv';
import * as setupCommand from './commands/setup';
import * as testCommand from './commands/test';
import * as statusCommand from './commands/status';

// Load environment variables
dotenv.config();

// Validate environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// Channel name for status updates
const AGENT_STATUS_CHANNEL = 'agent-status';

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is not defined in .env file');
  process.exit(1);
}

if (!GUILD_ID) {
  console.error('❌ GUILD_ID is not defined in .env file');
  process.exit(1);
}

/**
 * Extended client with commands collection
 */
interface BotClient extends Client {
  commands?: Collection<string, any>;
}

/**
 * Create Discord client with required intents
 */
const client: BotClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

/**
 * Initialize commands collection
 */
client.commands = new Collection();
client.commands.set(setupCommand.data.name, setupCommand);
client.commands.set(testCommand.data.name, testCommand);
client.commands.set(statusCommand.data.name, statusCommand);

/**
 * Register slash commands with Discord
 */
async function registerCommands(): Promise<void> {
  try {
    console.log('🔄 Started refreshing application (/) commands.');

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN!);

    const commands = [
      setupCommand.data.toJSON(),
      testCommand.data.toJSON(),
      statusCommand.data.toJSON()
    ];

    // Register commands for the specific guild
    await rest.put(
      Routes.applicationGuildCommands(client.user!.id, GUILD_ID!),
      { body: commands }
    );

    console.log(`✅ Successfully reloaded ${commands.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

/**
 * Send status update to agent-status channel
 */
async function sendStatusUpdate(message: string, color: number = 0x00FF00): Promise<void> {
  try {
    const guild = client.guilds.cache.get(GUILD_ID!);
    if (!guild) return;

    const channel = guild.channels.cache.find(
      ch => ch.name === AGENT_STATUS_CHANNEL
    ) as TextChannel;

    if (!channel) {
      console.warn(`⚠️  Could not find #${AGENT_STATUS_CHANNEL} channel for status update`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription(message)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('❌ Error sending status update:', error);
  }
}

/**
 * Bot ready event handler
 */
client.once(Events.ClientReady, async (readyClient) => {
  console.log('✅ Bot is online!');
  console.log(`📝 Logged in as: ${readyClient.user.tag}`);
  console.log(`🆔 Bot ID: ${readyClient.user.id}`);
  console.log(`🌐 Serving ${readyClient.guilds.cache.size} guild(s)`);

  // Register slash commands
  await registerCommands();

  // Set bot status
  readyClient.user.setPresence({
    activities: [{ name: 'CGE Development Automation' }],
    status: 'online'
  });

  console.log('🎮 Bot is ready to receive commands!');

  // Send online status to agent-status channel
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'long'
  });
  await sendStatusUpdate(`🟢 **Bot Online**\n\`${timestamp}\``, 0x00FF00);
});

/**
 * Interaction create event handler
 */
client.on(Events.InteractionCreate, async (interaction) => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    await handleSlashCommand(interaction);
  }
});

/**
 * Handle slash command interactions
 */
async function handleSlashCommand(interaction: CommandInteraction): Promise<void> {
  const command = client.commands?.get(interaction.commandName);

  if (!command) {
    console.warn(`⚠️ Unknown command: ${interaction.commandName}`);
    await interaction.reply({
      content: '❌ Unknown command!',
      ephemeral: true
    });
    return;
  }

  try {
    console.log(`🔧 Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing command ${interaction.commandName}:`, error);

    const errorMessage = '❌ There was an error executing this command!';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errorMessage,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        ephemeral: true
      });
    }
  }
}

/**
 * Error event handlers
 */
client.on(Events.Error, (error) => {
  console.error('❌ Discord client error:', error);
});

/**
 * Handle unhandled rejections with logging
 */
process.on('unhandledRejection', (error: Error) => {
  console.error('❌ Unhandled promise rejection:', error);
  console.error('   Stack trace:', error.stack);

  // Don't exit immediately, let the launcher handle restarts
  // This allows the bot to continue running for non-critical errors
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught exception:', error);
  console.error('   Stack trace:', error.stack);

  // Critical error - exit and let launcher restart
  process.exit(1);
});

/**
 * Graceful shutdown handler for SIGINT (Ctrl+C)
 */
process.on('SIGINT', async () => {
  console.log('\n⏹️ Received SIGINT - Shutting down bot...');
  await performGracefulShutdown();
});

/**
 * Graceful shutdown handler for SIGTERM
 */
process.on('SIGTERM', async () => {
  console.log('\n⏹️ Received SIGTERM - Shutting down bot...');
  await performGracefulShutdown();
});

/**
 * Perform graceful shutdown
 */
async function performGracefulShutdown(): Promise<void> {
  try {
    // Send offline status to agent-status channel
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'medium',
      timeStyle: 'long'
    });
    await sendStatusUpdate(`🔴 **Bot Offline**\n\`${timestamp}\``, 0xFF0000);

    console.log('📤 Sent offline status to Discord');

    // Give Discord a moment to send the message
    await new Promise(resolve => setTimeout(resolve, 500));

    // Destroy the Discord client
    client.destroy();
    console.log('✓ Discord client disconnected');

    // Exit cleanly
    process.exit(0);
  } catch (error) {
    console.error('⚠️  Error during graceful shutdown:', error);
    // Force exit even if there's an error
    process.exit(0);
  }
}

/**
 * Login to Discord
 */
console.log('🚀 Starting CGE Discord Bot...');
client.login(DISCORD_TOKEN).catch((error) => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});
