const { Client, GatewayIntentBits } = require('discord.js'); // Updated import
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const TOKEN = process.env[TOKEN];
const channels = {
    vent:{
        id: "1281351152440705086"
    },
    confession:{
        id: "1281530845089366068"
    }
}


client.once('ready', () => {
  console.log('Bot is online!');
});

client.login(TOKEN);

module.exports = {
  sendMessage: (message, type) => {
    console.log(channels[type].id)
    const channel = client.channels.cache.get(channels[type].id);
    if (channel) {
      channel.send(message);
    } else {
      console.error('Channel not found');
    }
  }
};
