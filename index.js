const Discord = require("discord.js");
require("dotenv").config();

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_MESSAGE_REACTIONS", "GUILD_PRESENCES"],
  restTimeOffset: 0
});

let bot = { client , prefix: "!" }

client.events = new Discord.Collection();
client.commands = new Discord.Collection();
client.slashcommands = new Discord.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload);
client.loadCommands = (bot, reload) => require("./handlers/commands")(bot, reload);
client.loadSlashCommands = (bot, reload) => require("./handlers/slashcommands")(bot, reload);

client.loadEvents(bot, false);
client.loadCommands(bot, false);
client.loadSlashCommands(bot, false);

module.exports = bot;

client.login(process.env.TOKEN);