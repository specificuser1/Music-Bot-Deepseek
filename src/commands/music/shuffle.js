const { SlashCommandBuilder } = require('discord.js');
const EmbedManager = require('../../utils/embeds');
const emojis = require('../../utils/emojis');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queue'),

    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.client.player;
        const queue = player.nodes.get(interaction.guildId);

        if (!queue || !queue.node.isPlaying()) {
            return interaction.editReply({
                embeds: [EmbedManager.error('No music is currently playing!')]
            });
        }

        if (queue.tracks.data.length < 2) {
            return interaction.editReply({
                embeds: [EmbedManager.warning(
                    'Need at least 2 tracks in queue to shuffle!'
                )]
            });
        }

        queue.tracks.shuffle();

        return interaction.editReply({
            embeds: [EmbedManager.success(
                `${emojis.get('music', 'shuffle')} Shuffled ${queue.tracks.data.length} tracks!`
            )]
        });
    }
};
