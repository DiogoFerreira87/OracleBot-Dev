const guildId = process.env.GUILD_ID

module.exports = {
  name: "ready",
  run: async (bot) => {
    const {client} = bot

    const guild = client.guilds.cache.get(guildId)

    await guild.commands.set([...client.slashcommands.values()])
    console.log(`Successfully loaded in ${client.slashcommands.size}`)
    
    console.log("Logged in as " + bot.client.user.tag);

  },
};
