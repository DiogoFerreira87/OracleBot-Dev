module.exports = {
  name: "cache",
  run: async (bot) => {
    const { client } = bot;

    // Get the Guid ID
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    // Count active public threads.
    const threadCount = client.channels.cache.filter((channel) => channel.parentId == process.env.GRIDS_CHANNEL && channel.type == "GUILD_PUBLIC_THREAD"); // (Procurando atividade)

    // Get the threads ID's.
    let threadIds = [];
    threadIds = threadCount.map((g) => g.id);

    // Read all the threads alive on the Grids_Channel and cache the first message of each one.
    for (let i = 0; i < threadCount.size; i++) {
      let channel = guild.channels.cache.get(threadIds[i]);

      channel.messages
        .fetch()
        .then((messages) => messages.filter((m) => m.author.id === process.env.BOT_ID)) // Bot ID
        .catch(console.error);
    }

    // Get Channel info
    const channel = client.channels.cache.get(process.env.GRIDS_CHANNEL);

    // Get the messages
    let messagesArray = [];
    messagesArray = channel.messages.cache.filter(m => m.author.id === process.env.BOT_ID)
    
    let users = guild.members.fetch().then((members) => {});

    console.log("Cache, funcionando.");
  },
};

//https://discord.js.org/#/docs/main/stable/class/MessageManager?scrollTo=fetch
