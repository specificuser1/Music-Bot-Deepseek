const emojis = require('../config/emojis.json');

class EmojiManager {
    constructor() {
        this.emojis = emojis;
    }

    /**
     * Get emoji from category
     * @param {string} category - The category of emoji
     * @param {string} name - The name of emoji
     * @returns {string} The emoji string
     */
    get(category, name) {
        try {
            if (!this.emojis[category]) {
                throw new Error(`Emoji category "${category}" not found`);
            }
            if (!this.emojis[category][name]) {
                throw new Error(`Emoji "${name}" not found in category "${category}"`);
            }
            return this.emojis[category][name];
        } catch (error) {
            console.error(`[EMOJI ERROR] ${error.message}`);
            // Return fallback text emojis
            const fallbacks = {
                music: {
                    play: '▶️', pause: '⏸️', resume: '⏯️', stop: '⏹️',
                    skip: '⏭️', queue: '📋', volume: '🔊', loop: '🔁',
                    shuffle: '🔀', lyrics: '📝', search: '🔍', delete: '🗑️'
                },
                status: {
                    success: '✅', error: '❌', warning: '⚠️', loading: '⏳',
                    online: '🟢', idle: '🟡', dnd: '🔴', offline: '⚫'
                },
                platforms: {
                    youtube: '▶️', spotify: '🟢', soundcloud: '🟠',
                    apple: '🍎', deezer: '🔵'
                },
                controls: {
                    first: '⏮️', prev: '◀️', next: '▶️',
                    last: '⏭️', refresh: '🔄'
                },
                misc: {
                    bot: '🤖', music_note: '🎵', discord: '💬',
                    github: '🐙', heart: '❤️', star: '⭐',
                    clock: '🕐', users: '👥', channel: '📺'
                }
            };
            
            return fallbacks[category]?.[name] || '❓';
        }
    }

    /**
     * Get formatted string with emoji
     * @param {string} category - The category
     * @param {string} name - The emoji name
     * @param {string} text - Text to append
     * @returns {string} Formatted string
     */
    format(category, name, text = '') {
        const emoji = this.get(category, name);
        return `${emoji} ${text}`;
    }

    /**
     * Get multiple emojis as object
     * @param {string} category - The category
     * @returns {object} Object with all emojis
     */
    getAll(category) {
        return this.emojis[category] || {};
    }

    /**
     * Get platform emoji by platform name
     * @param {string} platform - Platform name
     * @returns {string} Platform emoji
     */
    getPlatform(platform) {
        const platformMap = {
            youtube: this.get('platforms', 'youtube'),
            spotify: this.get('platforms', 'spotify'),
            soundcloud: this.get('platforms', 'soundcloud'),
            apple_music: this.get('platforms', 'apple'),
            deezer: this.get('platforms', 'deezer')
        };
        return platformMap[platform] || '🎵';
    }
}

module.exports = new EmojiManager();
