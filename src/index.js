require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('@discord-player/extractor');
const fs = require('fs');
const path = require('path');
const Logger = require('./utils/logger');
const config = require('./config/config');

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Initialize Player
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    }
});

// Register extractors
player.extractors.register(YoutubeiExtractor, {});
player.extractors.loadDefault();

// Attach player to client
client.player = player;

// Commands collection
client.commands = new Collection();

// Load commands
const loadCommands = () => {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        if (!fs.statSync(folderPath).isDirectory()) continue;
        
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                Logger.info(`Loaded command: ${command.data.name}`);
            } else {
                Logger.warn(`Command at ${filePath} is missing required properties`);
            }
        }
    }
};

// Load events
const loadEvents = () => {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        Logger.info(`Loaded event: ${event.name}`);
    }
};

// Error handling
process.on('unhandledRejection', error => {
    Logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    Logger.error('Uncaught exception:', error);
    process.exit(1);
});

// Initialize
const init = async () => {
    try {
        Logger.info('Starting bot initialization...');
        
        // Load commands and events
        loadCommands();
        loadEvents();

        // Initialize player events
        const playerEvents = require('./events/playerEvents');
        await playerEvents.execute(player);

        // Login
        await client.login(config.token);
        
    } catch (error) {
        Logger.error('Failed to initialize bot:', error);
        process.exit(1);
    }
};

init();
