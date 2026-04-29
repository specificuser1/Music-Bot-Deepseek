const { SlashCommandBuilder } = require('discord.js');
const EmbedManager = require('../../utils/embeds');
const emojis = require('../../utils/emojis');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.client.player;
        const queue = player.nodes.get(interaction.guildId);

        if (!queue || !queue.node.isPlaying()) {
            return interaction.editReply({
                embeds: [EmbedManager.error(
                    'No music is currently playing!',
                    { footer: 'Use /play to start music' }
                )]
            });
        }

        const currentTrack = queue.currentTrack;
        const skipped = queue.node.skip();

        if (skipped) {
            return interaction.editReply({
                embeds: [EmbedManager.success(
                    `Skipped: **[${currentTrack.title}](${currentTrack.url})**`
                )]
            });
        } else {
            return interaction.editReply({
                embeds: [EmbedManager.error('Failed to skip the song!')]
            });
        }
    }
};
