
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const TOKEN = process.env["TOKEN"];
const channels = {
    vent: {
        id: "1281351152440705086"
    },
    confession: {
        id: "1281530845089366068"
    },
    review: {
        id: "1281353089139478568"
    }
};

const storagePath = path.join(__dirname, 'pendingMessages.json');

async function loadPendingMessages() {
    if (await fs.pathExists(storagePath)) {
        return fs.readJson(storagePath);
    }
    return {};
}

async function savePendingMessages(data) {
    return fs.writeJson(storagePath, data);
}

client.once('ready', async () => {
    console.log('Bot is online!');
    client.pendingMessages = await loadPendingMessages();
});

client.login(TOKEN);

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const messageId = interaction.message.id;
    const messageData = client.pendingMessages[messageId];

    if (interaction.customId === 'accept') {
        const originalMessage = messageData.message;
        const type = messageData.type;
        const targetChannel = client.channels.cache.get(channels[type].id);
        if (targetChannel) {
            targetChannel.send(`Message:\n${originalMessage}\n\nTo submit your vents or confessions go to https://ruet-mailbox.onrender.com/`);
        }
        await interaction.update({ content: 'Message accepted and sent to the appropriate channel.', components: [] });
    } else if (interaction.customId === 'reject') {
        await interaction.update({ content: 'Message rejected.', components: [] });
    }

    delete client.pendingMessages[messageId];
    await savePendingMessages(client.pendingMessages);
});

client.on('messageCreate', async (message) => {
    if (message.channel.id === channels.review.id && message.author.bot) {
        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && !user.bot;
        const collector = message.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === '✅') {
                const originalMessage = message.embeds[0].description.split('\n')[1].trim();
                const type = message.embeds[0].footer.text.split(': ')[1];
                const targetChannel = client.channels.cache.get(channels[type].id);
                if (targetChannel) {
                    targetChannel.send(`Message:\n${originalMessage}\n\nTo submit your vents or confessions go to https://ruet-mailbox.onrender.com/`);
                }
            }
            message.delete();
        });

        collector.on('end', () => {
            message.reactions.removeAll();
        });
    }
});

module.exports = {
    sendMessage: async (message, type) => {
        const reviewChannel = client.channels.cache.get(channels.review.id);
        if (reviewChannel) {
            const embed = new EmbedBuilder()
                .setTitle('New Submission')
                .setDescription(`Message:\n${message}`)
                .setFooter({ text: `Type: ${type}` });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('accept')
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('reject')
                        .setLabel('Reject')
                        .setStyle(ButtonStyle.Danger)
                );

            const sentMessage = await reviewChannel.send({ embeds: [embed], components: [row] });
            
            client.pendingMessages[sentMessage.id] = { message, type };
            await savePendingMessages(client.pendingMessages);
        } else {
            console.error('Review channel not found');
        }
    }
};
