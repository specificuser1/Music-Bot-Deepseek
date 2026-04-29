const { SlashCommandBuilder } = require('discord.js');
const EmbedManager = require('../../utils/embeds');
const emojis = require('../../utils/emojis');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused track'),

    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.client.player;
        const queue = player.nodes.get(interaction.guildId);

        if (!queue || !queue.node.isPlaying()) {
            return interaction.editReply({
                embeds: [EmbedManager.error('No music is currently playing!')]
            });
        }

        if (!queue.node.isPaused()) {
            return interaction.editReply({
                embeds: [EmbedManager.warning('Music is not paused!')]
            });
        }

        queue.node.setPaused(false);

        return interaction.editReply({
            embeds: [EmbedManager.success(
                `${emojis.get('music', 'resume')} Resumed the music!`
            )]
        });
    }
};
