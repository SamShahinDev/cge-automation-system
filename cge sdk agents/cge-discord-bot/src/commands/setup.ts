import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  ComponentType
} from 'discord.js';
import { CHANNEL_STRUCTURE, getTotalChannelCount, getTotalCategoryCount } from '../config/channels';
import { createCategoryWithChannels, deleteAllChannels, getGuildSummary } from '../utils/channelManager';

/**
 * Setup command definition
 */
export const data = new SlashCommandBuilder()
  .setName('setup-channels')
  .setDescription('Set up all CGE Development Automation channels')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * Execute the setup command
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    // Defer reply as this will take some time
    await interaction.deferReply({ ephemeral: false });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command can only be used in a server!');
      return;
    }

    // Get current guild summary
    const beforeSummary = getGuildSummary(guild);

    // Create confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⚠️ Channel Setup Confirmation')
      .setDescription(
        `This will **DELETE ALL EXISTING CHANNELS** except this one and create a new structure.\n\n` +
        `**Current Server:**\n` +
        `• Categories: ${beforeSummary.totalCategories}\n` +
        `• Text Channels: ${beforeSummary.textChannels}\n` +
        `• Total Channels: ${beforeSummary.totalChannels}\n\n` +
        `**New Structure:**\n` +
        `• Categories: ${getTotalCategoryCount()}\n` +
        `• Text Channels: ${getTotalChannelCount()}\n` +
        `• Total Channels: ${getTotalChannelCount()}\n\n` +
        `**This action cannot be undone!**`
      )
      .setTimestamp();

    // Create confirmation buttons
    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm_setup')
      .setLabel('✅ Confirm Setup')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel_setup')
      .setLabel('❌ Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(confirmButton, cancelButton);

    // Send confirmation message
    await interaction.editReply({
      embeds: [confirmEmbed],
      components: [row]
    });

    // Wait for button interaction
    const filter = (i: ButtonInteraction) => i.user.id === interaction.user.id;
    const collector = interaction.channel?.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 30000 // 30 seconds to respond
    });

    if (!collector) {
      await interaction.editReply({ content: '❌ Failed to create collector', embeds: [], components: [] });
      return;
    }

    collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
      if (buttonInteraction.customId === 'cancel_setup') {
        await buttonInteraction.update({
          content: '❌ Setup cancelled.',
          embeds: [],
          components: []
        });
        collector.stop();
        return;
      }

      if (buttonInteraction.customId === 'confirm_setup') {
        await buttonInteraction.update({
          content: '🚀 Starting channel setup...',
          embeds: [],
          components: []
        });
        collector.stop();

        await performSetup(interaction, guild);
      }
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        interaction.editReply({
          content: '⏱️ Setup timed out. No changes were made.',
          embeds: [],
          components: []
        }).catch(console.error);
      }
    });

  } catch (error) {
    console.error('Error in setup command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (interaction.deferred) {
      await interaction.editReply(`❌ Error during setup: ${errorMessage}`);
    } else {
      await interaction.reply({ content: `❌ Error during setup: ${errorMessage}`, ephemeral: true });
    }
  }
}

/**
 * Performs the actual channel setup
 */
async function performSetup(interaction: CommandInteraction, guild: any): Promise<void> {
  try {
    const startTime = Date.now();
    let progressMessage = '**Progress:**\n';

    // Step 1: Delete existing channels
    progressMessage += '🗑️ Deleting existing channels...\n';
    await interaction.editReply(progressMessage);

    const deletedCount = await deleteAllChannels(guild, interaction.channelId);
    progressMessage += `✅ Deleted ${deletedCount} channels\n\n`;
    await interaction.editReply(progressMessage);

    // Step 2: Create new structure
    let categoryCount = 0;
    let channelCount = 0;

    for (const categoryConfig of CHANNEL_STRUCTURE) {
      progressMessage += `📁 Creating category: **${categoryConfig.name}**\n`;
      await interaction.editReply(progressMessage);

      try {
        await createCategoryWithChannels(
          guild,
          categoryConfig.name,
          categoryConfig.channels
        );

        categoryCount++;
        channelCount += categoryConfig.channels.length;

        progressMessage += `✅ Created ${categoryConfig.channels.length} channels\n`;
        await interaction.editReply(progressMessage);

      } catch (error) {
        console.error(`Error creating category ${categoryConfig.name}:`, error);
        progressMessage += `❌ Error creating category: ${error}\n`;
        await interaction.editReply(progressMessage);
        // Continue with next category even if one fails
      }

      // Add small delay between categories
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Step 3: Completion summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const afterSummary = getGuildSummary(guild);

    const completionEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Channel Setup Complete!')
      .setDescription(
        `**Summary:**\n` +
        `• Categories Created: ${categoryCount}\n` +
        `• Channels Created: ${channelCount}\n` +
        `• Channels Deleted: ${deletedCount}\n` +
        `• Time Taken: ${duration}s\n\n` +
        `**Final Structure:**\n` +
        `• Total Categories: ${afterSummary.totalCategories}\n` +
        `• Total Text Channels: ${afterSummary.textChannels}\n` +
        `• Total Channels: ${afterSummary.totalChannels}\n\n` +
        `All channels have been set up successfully! 🎉`
      )
      .setTimestamp()
      .setFooter({ text: `Executed by ${interaction.user.tag}` });

    await interaction.editReply({
      content: null,
      embeds: [completionEmbed]
    });

  } catch (error) {
    console.error('Error performing setup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await interaction.editReply(`❌ Critical error during setup: ${errorMessage}`);
  }
}
