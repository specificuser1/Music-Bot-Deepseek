const { SlashCommandBuilder } = require('discord.js');
const EmbedManager = require('../../utils/embeds');
const config = require('../../config/config');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust music volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (1-100)')
                .setMinValue(1)
                .setMaxValue(config.maxVolume)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.client.player;
        const queue = player.nodes.get(interaction.guildId);
        const volume = interaction.options.getInteger('level');

        if (!queue || !queue.node.isPlaying()) {
            return interaction.editReply({
                embeds: [EmbedManager.error(
                    'No music is currently playing!'
                )]
            });
        }

        // Show current volume if no level specified
        if (!volume) {
            const currentVolume = queue.node.volume;
            const volumeBar = this.createVolumeBar(currentVolume);
            
            return interaction.editReply({
                embeds: [EmbedManager.info(
                    `Current volume: \`${currentVolume}%\`\n${volumeBar}`
                )]
            });
        }

        // Set new volume
        const success = queue.node.setVolume(volume);
        
        if (success) {
            const volumeBar = this.createVolumeBar(volume);
            return interaction.editReply({
                embeds: [EmbedManager.success(
                    `Volume set to \`${volume}%\`\n${volumeBar}`
                )]
            });
        } else {
            return interaction.editReply({
                embeds: [EmbedManager.error('Failed to change volume!')]
            });
        }
    },

    createVolumeBar(volume) {
        const barLength = 20;
        const filled = Math.round((barLength * volume) / 100);
        const empty = barLength - filled;
        
        const filledChar = '█';
        const emptyChar = '░';
        
        return `[${filledChar.repeat(filled)}${emptyChar.repeat(empty)}]`;
    }
};
