import {
  Guild,
  CategoryChannel,
  TextChannel,
  ChannelType,
  Collection,
  GuildChannel
} from 'discord.js';
import { CategoryConfig, ChannelConfig, CHANNEL_STRUCTURE } from '../config/channels';

/**
 * Creates a category with all its channels
 * @param guild - The Discord guild
 * @param categoryName - Name of the category to create
 * @param channels - Array of channel configurations
 * @returns The created category channel
 */
export async function createCategoryWithChannels(
  guild: Guild,
  categoryName: string,
  channels: ChannelConfig[]
): Promise<CategoryChannel> {
  try {
    // Create the category
    console.log(`Creating category: ${categoryName}`);
    const category = await guild.channels.create({
      name: categoryName,
      type: ChannelType.GuildCategory
    });

    // Create all channels within the category
    for (const channelConfig of channels) {
      console.log(`  Creating channel: ${channelConfig.name}`);
      await guild.channels.create({
        name: channelConfig.name,
        type: channelConfig.type,
        parent: category.id,
        topic: channelConfig.description
      });
    }

    return category;
  } catch (error) {
    console.error(`Error creating category ${categoryName}:`, error);
    throw error;
  }
}

/**
 * Deletes all channels in the guild except the specified one
 * @param guild - The Discord guild
 * @param excludeChannelId - Channel ID to preserve (usually where command was run)
 * @returns Number of channels deleted
 */
export async function deleteAllChannels(
  guild: Guild,
  excludeChannelId: string
): Promise<number> {
  let deletedCount = 0;

  try {
    const channels = guild.channels.cache;
    console.log(`Found ${channels.size} channels to process`);

    for (const [id, channel] of channels) {
      // Skip the channel where command was run
      if (id === excludeChannelId) {
        console.log(`Preserving channel: ${channel.name}`);
        continue;
      }

      try {
        console.log(`Deleting channel: ${channel.name}`);
        await channel.delete();
        deletedCount++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Failed to delete channel ${channel.name}:`, error);
        // Continue with next channel even if one fails
      }
    }

    console.log(`Deleted ${deletedCount} channels`);
    return deletedCount;
  } catch (error) {
    console.error('Error during channel deletion:', error);
    throw error;
  }
}

/**
 * Sets up permissions for a channel (placeholder for future permission logic)
 * @param channel - The channel to configure
 */
export async function setupChannelPermissions(
  channel: GuildChannel
): Promise<void> {
  // Placeholder for future permission configuration
  // Can be extended to set specific role permissions per channel
  console.log(`Setting permissions for: ${channel.name}`);
}

/**
 * Validates that all expected channels exist in the guild
 * @param guild - The Discord guild
 * @returns Object with validation results
 */
export async function validateSetup(
  guild: Guild
): Promise<{ valid: boolean; missing: string[]; extra: string[] }> {
  const expectedChannels = new Set<string>();
  const expectedCategories = new Set<string>();

  // Build expected channel and category names
  for (const category of CHANNEL_STRUCTURE) {
    expectedCategories.add(category.name.toLowerCase());
    for (const channel of category.channels) {
      expectedChannels.add(channel.name.toLowerCase());
    }
  }

  const actualChannels = new Set<string>();
  const actualCategories = new Set<string>();
  const missingChannels: string[] = [];
  const missingCategories: string[] = [];
  const extraChannels: string[] = [];

  // Check actual channels
  guild.channels.cache.forEach(channel => {
    const channelName = channel.name.toLowerCase();

    if (channel.type === ChannelType.GuildCategory) {
      actualCategories.add(channelName);
    } else {
      actualChannels.add(channelName);
    }
  });

  // Find missing channels
  for (const expected of expectedChannels) {
    if (!actualChannels.has(expected)) {
      missingChannels.push(expected);
    }
  }

  // Find missing categories
  for (const expected of expectedCategories) {
    if (!actualCategories.has(expected)) {
      missingCategories.push(expected);
    }
  }

  // Find extra channels (not in config)
  for (const actual of actualChannels) {
    if (!expectedChannels.has(actual)) {
      extraChannels.push(actual);
    }
  }

  const missing = [...missingCategories, ...missingChannels];
  const valid = missing.length === 0;

  return { valid, missing, extra: extraChannels };
}

/**
 * Gets a summary of the current guild structure
 * @param guild - The Discord guild
 * @returns Summary object with counts
 */
export function getGuildSummary(guild: Guild): {
  totalChannels: number;
  totalCategories: number;
  textChannels: number;
  voiceChannels: number;
} {
  let totalChannels = 0;
  let totalCategories = 0;
  let textChannels = 0;
  let voiceChannels = 0;

  guild.channels.cache.forEach(channel => {
    if (channel.type === ChannelType.GuildCategory) {
      totalCategories++;
    } else if (channel.type === ChannelType.GuildText) {
      textChannels++;
      totalChannels++;
    } else if (channel.type === ChannelType.GuildVoice) {
      voiceChannels++;
      totalChannels++;
    } else {
      totalChannels++;
    }
  });

  return { totalChannels, totalCategories, textChannels, voiceChannels };
}
