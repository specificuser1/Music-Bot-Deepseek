const { SlashCommandBuilder } = require('discord.js');
const EmbedManager = require('../../utils/embeds');
const emojis = require('../../utils/emojis');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and clear queue'),

    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.client.player;
        const queue = player.nodes.get(interaction.guildId);

        if (!queue) {
            return interaction.editReply({
                embeds: [EmbedManager.error(
                    'No music is currently playing!',
                    { footer: 'Nothing to stop' }
                )]
            });
        }

        const trackCount = queue.tracks.data.length;
        queue.delete();

        return interaction.editReply({
            embeds: [EmbedManager.success(
                `Stopped music and cleared ${trackCount} tracks from queue!`
            )]
        });
    }
};
