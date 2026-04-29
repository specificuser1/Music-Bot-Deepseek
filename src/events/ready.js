const { Events, ActivityType } = require('discord.js');
const Logger = require('../utils/logger');
const config = require('../config/config');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        Logger.success(`Logged in as ${client.user.tag}!`);
        Logger.info(`Bot is ready in ${client.guilds.cache.size} guilds`);
        
        // Set bot status
        const statuses = [
            () => ({ 
                name: 'Made By Subhan',
                type: ActivityType.Listening 
            }),
            () => ({ 
                name: `${client.guilds.cache.size} servers`,
                type: ActivityType.Watching 
            }),
            () => ({ 
                name: '/play to start music',
                type: ActivityType.Playing 
            }),
            () => ({ 
                name: 'Maki Music Bot',
                type: ActivityType.Competing 
            })
        ];

        let i = 0;
        setInterval(() => {
            const status = statuses[i]();
            client.user.setActivity(status.name, { 
                type: status.type 
            });
            i = (i + 1) % statuses.length;
        }, 10000);

        // Register slash commands
        try {
            Logger.info('Started refreshing application (/) commands.');
            
            const commands = [];
            client.commands.forEach(command => {
                commands.push(command.data.toJSON());
            });

            const { REST, Routes } = require('@discordjs/rest');
            const rest = new REST({ version: '10' }).setToken(config.token);

            if (config.guildId) {
                await rest.put(
                    Routes.applicationGuildCommands(config.clientId, config.guildId),
                    { body: commands }
                );
            }

            await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commands }
            );

            Logger.success('Successfully reloaded application (/) commands.');
        } catch (error) {
            Logger.error('Error refreshing commands:', error);
        }
    }
};
