const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const emojis = require('./emojis');

class EmbedManager {
    /**
     * Create a base embed
     * @param {Object} options - Embed options
     * @returns {EmbedBuilder}
     */
    static base(options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || config.colors.default)
            .setTimestamp(options.timestamp || new Date())
            .setFooter({ 
                text: options.footer || 'Music Bot • Made with ❤️',
                iconURL: options.footerIcon || null
            });

        if (options.title) embed.setTitle(options.title);
        if (options.description) embed.setDescription(options.description);
        if (options.thumbnail) embed.setThumbnail(options.thumbnail);
        if (options.image) embed.setImage(options.image);
        if (options.url) embed.setURL(options.url);
        if (options.author) embed.setAuthor(options.author);
        if (options.fields) embed.addFields(options.fields);

        return embed;
    }

    /**
     * Success embed
     * @param {string} message - Success message
     * @param {Object} options - Additional options
     * @returns {EmbedBuilder}
     */
    static success(message, options = {}) {
        return this.base({
            ...options,
            color: config.colors.success,
            description: `${emojis.get('status', 'success')} **${message}**`,
            ...options
        });
    }

    /**
     * Error embed
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {EmbedBuilder}
     */
    static error(message, options = {}) {
        return this.base({
            ...options,
            color: config.colors.error,
            description: `${emojis.get('status', 'error')} **${message}**`,
            ...options
        });
    }

    /**
     * Warning embed
     * @param {string} message - Warning message
     * @param {Object} options - Additional options
     * @returns {EmbedBuilder}
     */
    static warning(message, options = {}) {
        return this.base({
            ...options,
            color: config.colors.warning,
            description: `${emojis.get('status', 'warning')} **${message}**`,
            ...options
        });
    }

    /**
     * Info embed
     * @param {string} message - Info message
     * @param {Object} options - Additional options
     * @returns {EmbedBuilder}
     */
    static info(message, options = {}) {
        return this.base({
            ...options,
            color: config.colors.info,
            description: `${emojis.get('misc', 'music_note')} **${message}**`,
            ...options
        });
    }

    /**
     * Now playing embed
     * @param {Object} track - Track object
     * @param {Object} queue - Queue object
     * @returns {EmbedBuilder}
     */
    static nowPlaying(track, queue) {
        const progress = this.createProgressBar(
            queue.node.getTimestamp()?.progress || 0
        );
        
        return this.base({
            title: `${emojis.get('music', 'play')} Now Playing`,
            color: config.colors.success,
            thumbnail: track.thumbnail,
            fields: [
                {
                    name: `${emojis.get('misc', 'music_note')} Track`,
                    value: `**[${track.title}](${track.url})**`,
                    inline: false
                },
                {
                    name: `${emojis.get('misc', 'users')} Author`,
                    value: track.author || 'Unknown',
                    inline: true
                },
                {
                    name: `${emojis.get('misc', 'clock')} Duration`,
                    value: `${track.duration} ${progress}`,
                    inline: true
                },
                {
                    name: `${emojis.get('misc', 'channel')} Requested By`,
                    value: `${track.requestedBy}`,
                    inline: true
                },
                {
                    name: 'Platform',
                    value: `${emojis.getPlatform(track.source)} ${track.source || 'Unknown'}`,
                    inline: true
                }
            ]
        });
    }

    /**
     * Queue embed
     * @param {Object} queue - Queue object
     * @param {number} page - Page number
     * @returns {EmbedBuilder}
     */
    static queue(queue, page = 1) {
        const tracksPerPage = 10;
        const start = (page - 1) * tracksPerPage;
        const end = start + tracksPerPage;
        const tracks = queue.tracks.data.slice(start, end);
        
        const totalPages = Math.ceil(queue.tracks.data.length / tracksPerPage);
        
        const queueList = tracks.map((track, i) => 
            `\`${start + i + 1}.\` ${emojis.getPlatform(track.source)} **[${track.title}](${track.url})** | \`${track.duration}\` | ${track.requestedBy}`
        ).join('\n');

        return this.base({
            title: `${emojis.get('music', 'queue')} Queue List`,
            color: config.colors.info,
            description: queueList || 'No tracks in queue',
            fields: [
                {
                    name: `${emojis.get('music', 'play')} Now Playing`,
                    value: `**[${queue.currentTrack?.title}](${queue.currentTrack?.url})** | \`${queue.currentTrack?.duration}\``,
                    inline: false
                },
                {
                    name: `${emojis.get('misc', 'clock')} Queue Duration`,
                    value: `\`${queue.durationFormatted}\``,
                    inline: true
                },
                {
                    name: `${emojis.get('misc', 'music_note')} Total Tracks`,
                    value: `\`${queue.tracks.data.length}\``,
                    inline: true
                },
                {
                    name: `${emojis.get('controls', 'next')} Page`,
                    value: `\`${page}/${totalPages || 1}\``,
                    inline: true
                }
            ]
        });
    }

    /**
     * Create progress bar
     * @param {number} percentage - Progress percentage
     * @returns {string} Progress bar
     */
    static createProgressBar(percentage) {
        const barLength = 15;
        const filled = Math.round((barLength * percentage) / 100);
        const empty = barLength - filled;
        
        const filledChar = '▰';
        const emptyChar = '▱';
        
        const progress = filledChar.repeat(filled) + emptyChar.repeat(empty);
        return `\n[${progress}] ${percentage}%`;
    }

    /**
     * Help embed
     * @param {Object} commands - Commands collection
     * @returns {EmbedBuilder}
     */
    static help(commands) {
        const categories = {
            music: [],
            info: []
        };

        commands.forEach(cmd => {
            if (cmd.category) {
                if (!categories[cmd.category]) categories[cmd.category] = [];
                categories[cmd.category].push(cmd);
            }
        });

        return this.base({
            title: `${emojis.get('misc', 'bot')} Music Bot Commands`,
            color: config.colors.info,
            description: `Here are all available commands:`,
            fields: [
                {
                    name: `${emojis.get('music', 'play')} Music Commands`,
                    value: categories.music.map(cmd => 
                        `\`/${cmd.data.name}\` - ${cmd.data.description}`
                    ).join('\n') || 'No commands',
                    inline: false
                },
                {
                    name: `${emojis.get('misc', 'discord')} Info Commands`,
                    value: categories.info.map(cmd => 
                        `\`/${cmd.data.name}\` - ${cmd.data.description}`
                    ).join('\n') || 'No commands',
                    inline: false
                }
            ]
        });
    }
}

module.exports = EmbedManager;
