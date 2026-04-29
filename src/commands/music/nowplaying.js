const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const EmbedManager = require('../../utils/embeds');
const canvasManager = require('../../utils/canvas');
const emojis = require('../../utils/emojis');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show currently playing track'),

    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.client.player;
        const queue = player.nodes.get(interaction.guildId);

        if (!queue || !queue.node.isPlaying()) {
            return interaction.editReply({
                embeds: [EmbedManager.error(
                    'No music is currently playing!'
                )]
            });
        }

        try {
            const track = queue.currentTrack;
            
            // Generate canvas image
            const imageBuffer = await canvasManager.createNowPlayingImage(track);
            const attachment = new AttachmentBuilder(imageBuffer, { 
                name: 'nowplaying.png' 
            });

            const embed = EmbedManager.nowPlaying(track, queue);

            return interaction.editReply({
                content: `${emojis.get('music', 'play')} **Now Playing**`,
                embeds: [embed],
                files: [attachment]
            });
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                embeds: [EmbedManager.error('Failed to generate now playing image!')]
            });
        }
    }
};
