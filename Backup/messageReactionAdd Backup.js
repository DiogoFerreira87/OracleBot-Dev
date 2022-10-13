const { MessageEmbed, ReactionManager } = require("discord.js");
const moment = require("moment");
const { numberOfPlayers } = require("../util/functions");

module.exports = {
  name: "messageReactionAdd",
  run: async (bot, reaction, user) => {
    //const { client } = bot;

    
    // Get the current Embed
    let currentEmbed = reaction.message.embeds[0];

    // Must be the correct emoji:☑️, The message author must be the BOT and the reaction can't be by the BOT yet.
    if (reaction.emoji.name === "☑️" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {
      
      // Cache the reaction users
      //let reactions = await reaction.message.reactions.cache.first().users.fetch();
      let reactions = await reaction.message.reactions.resolve('☑️').users.fetch();
      reactions = reactions.filter((u) => u.id != process.env.BOT_ID); // Remove the bot reaction.

      // If user already reacted to other list, remove his reaction.
      reaction.message.reactions.cache.find(r => r.emoji.name == "👥").users.remove(user);
      
      // Get the number of players for this activity.
      let players;
      if(currentEmbed.footer.text.startsWith("Outros")  == true) {
        players = global.Jogadores;
      }
      else {
        players = numberOfPlayers(currentEmbed.footer.text);
      }

      //Get user id's
      let playersList = reactions.map((user) => user.id); // ARRAY

      // If the number of reactions <= number of players
      if (playersList.length <= players) {
        let playersMessage = reactions.map((item) => `${item}`).join("\n");

        // // Verify if there is a player on the list.
        // if(playersMessage === ''){
        //   playersMessage = "Nenhum jogador no momento...";
        // }
        // Update the fields
        currentEmbed.fields[0].name = `🎮 Jogadores (${playersList.length}/${players})`;
        currentEmbed.fields[0].value = playersMessage;
      } else {
        reaction.users.remove(user.id);
      }

      // Remove bot's reaction.
      reaction.users.remove(process.env.BOT_ID);
      
      // Edit the embed message
      return await reaction.message.edit({ embeds: [currentEmbed] });
    } else {
      
      // Reaction: Reservas 👥
      if (reaction.emoji.name === "👥" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {
        
        // Cache the reaction users
        let reactions = await reaction.message.reactions.resolve('👥').users.fetch();
        reactions = reactions.filter((u) => u.id != process.env.BOT_ID); // Remove the bot reaction
        
        // If user already reacted to other list, remove his reaction.
        reaction.message.reactions.cache.find(r => r.emoji.name == "☑️").users.remove(user);

        // Get the current Embed
        let currentEmbed = reaction.message.embeds[0];
        
        // //Get user id's
        let playersList = reactions.map((user) => user.id);
        let playersMessage = reactions.map((item) => `${item}`).join("\n");
        
        // Update the fields
        currentEmbed.fields[1].name = `👥 Reservas (${playersList.length})`;
        currentEmbed.fields[1].value = playersMessage;

        // Remove bot's reaction.
        reaction.users.remove(process.env.BOT_ID);

        // Edit the embed message
        return await reaction.message.edit({ embeds: [currentEmbed] });

      } else {
        if (reaction.emoji.name === "☑️" && reaction.message.author.id === process.env.BOT_ID) {
          await reaction.message.edit("<@&965299911992164412>"); // Veterano
          await reaction.message.edit("<@&965300143110889493>"); // Membros
          await reaction.message.edit("<@&965300197561344000>"); // Novatos
          await reaction.message.edit("<@&965294430552719442>"); // Convidado
          await reaction.message.edit("<@&961267518775918662>"); // Oracles
          // await reaction.message.edit("<@&820469652999503883>"); // Fundador
        }
        return;
      }
    }
  },
};
