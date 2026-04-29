const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require('discord-player');
const EmbedManager = require('../../utils/embeds');
const Logger = require('../../utils/logger');
const emojis = require('../../utils/emojis');
const canvasManager = require('../../utils/canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or URL')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const query = interaction.options.getString('query', true);
            const channel = interaction.member?.voice?.channel;

            if (!channel) {
                return interaction.editReply({
                    embeds: [EmbedManager.error(
                        'You need to be in a voice channel!',
                        { footer: 'Join a voice channel first' }
                    )]
                });
            }

            const player = interaction.client.player;

            // Search for the track
            const searchResult = await player.search(query, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });

            if (!searchResult || !searchResult.tracks.length) {
                return interaction.editReply({
                    embeds: [EmbedManager.error(
                        `No results found for: \`${query}\``,
                        { footer: 'Try with different keywords' }
                    )]
                });
            }

            // Create queue if not exists
            let queue = player.nodes.get(interaction.guildId);
            
            if (!queue) {
                queue = player.nodes.create(interaction.guildId, {
                    metadata: {
                        channel: interaction.channel,
                        voiceChannel: channel,
                    },
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 60000,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 30000,
                    volume: 80,
                });
            }

            // Connect to voice channel
            if (!queue.connection) {
                await queue.connect(channel);
            }

            // Handle playlist vs single track
            if (searchResult.playlist) {
                queue.addTrack(searchResult.tracks);
                
                const embed = EmbedManager.success(
                    `Added playlist: **[${searchResult.playlist.title}](${searchResult.playlist.url})**`,
                    {
                        fields: [
                            {
                                name: `${emojis.get('misc', 'music_note')} Tracks`,
                                value: `\`${searchResult.tracks.length}\``,
                                inline: true
                            },
                            {
                                name: `${emojis.get('misc', 'clock')} Duration`,
                                value: `\`${searchResult.playlist.durationFormatted || 'N/A'}\``,
                                inline: true
                            }
                        ]
                    }
                );

                return interaction.editReply({ embeds: [embed] });
            } else {
                const track = searchResult.tracks[0];
                queue.addTrack(track);

                const embed = EmbedManager.success(
                    `Added to queue: **[${track.title}](${track.url})**`,
                    {
                        thumbnail: track.thumbnail,
                        fields: [
                            {
                                name: `${emojis.get('misc', 'users')} Author`,
                                value: track.author || 'Unknown',
                                inline: true
                            },
                            {
                                name: `${emojis.get('misc', 'clock')} Duration`,
                                value: `\`${track.duration}\``,
                                inline: true
                            },
                            {
                                name: 'Position',
                                value: `\`#${queue.tracks.data.length}\``,
                                inline: true
                            }
                        ]
                    }
                );

                if (!queue.node.isPlaying()) {
                    await queue.node.play();
                    
                    // Generate and send canvas image
                    const imageBuffer = await canvasManager.createNowPlayingImage(track);
                    const attachment = new AttachmentBuilder(imageBuffer, { 
                        name: 'nowplaying.png' 
                    });

                    return interaction.editReply({
                        content: `${emojis.get('music', 'play')} **Now Playing**`,
                        embeds: [embed],
                        files: [attachment]
                    });
                }

                return interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            Logger.error('Error in play command:', error);
            
            if (error.message?.includes('Sign in')) {
                return interaction.editReply({
                    embeds: [EmbedManager.error(
                        'This video requires authentication. Please contact the bot owner.'
                    )]
                });
            }

            return interaction.editReply({
                embeds: [EmbedManager.error('An error occurred while trying to play!')]
            });
        }
    }
};
