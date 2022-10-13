//const { Collection } = require("discord.js");
const { numberOfPlayers } = require("../util/functions");
const moment = require("moment");
//----------------------------------------------
const database = require("../config/database");
const Grid = require("../models/Grid");
//----------------------------------------------

module.exports = {
  name: "messageReactionRemove",
  run: async (bot, reaction, user) => {

    // Connect to the database
    const db = new database();
    db.connect();


    // Get the current Embedcls

    let currentEmbed = reaction.message.embeds[0];
    let embedTitle = currentEmbed.title;
    let gridID = parseInt(embedTitle.substring(embedTitle.indexOf("#") + 1).match(/^(\S+)\s(.*)/).slice(1)[0]);

    // Get the Grid Type
    let embedFooter = currentEmbed.footer;
    let type = embedFooter.text.match(/^(\S+)\s(.*)/).slice(1)[0];

    // Get the current date and time
    let diaHora = new Date(); // Today
    diaHora = diaHora.toLocaleString();

    // Get the number of players
    let players = numberOfPlayers(embedFooter.text);

    // // Get users reactions
    // const us = reaction.users.cache;

    // If the message author is the BOT AND the reaction user is not the bot, then continue.
    if (reaction.emoji.name === "☑️" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {

    // Get the grid from DB
    var grid = await Grid.find({ gridID: gridID, type: type, starter: true}).sort({ userListID: 1 });

    // Get user data from DB
    var userGridInfo = await Grid.findOne({ gridID: gridID, type: type, userID: user.id });
    
      // Find if the user is already in the grid/type, then...
      if ((userGridInfo) != null) {
            
        // Verify if the user is the Grid's author
        if(userGridInfo.userListID == 1 && grid.length > 1){

          // Add the bot reaction
          await reaction.message.react("☑️");

          return await reaction.message.reply({
            content:
              `❌ Erro: **<@${user.id}>, não é possível sair da grade que você mesmo criou.** \nCaso queira cancelar a grade, use o comando '**/Fechar**'.`
          });
        
          // Case there are more people already in the list.
        } else {
          if(userGridInfo.userListID == 1 && grid.length == 1){
              // Remove all reactions
              await reaction.message.reactions.removeAll()
              
              // Add the bot reaction
              await reaction.message.react("☑️");
              await reaction.message.react("👥");

              return await reaction.message.reply({
              content:
                `❌ Erro: **<@${user.id}>, não é possível sair da grade que você mesmo criou.** \nCaso queira cancelar a grade, use o comando '**/Fechar**'.`
              });
            }       
        }
        
        const query = {gridID: gridID, type: type, userID: user.id};
        await Grid.findOneAndUpdate(query, {starter: false, queue: false, quitter: true, backup: false, userListID: 0}, {new: true})

        var newGrid = await Grid.find({ gridID: gridID, type: type, starter: true }).sort({ userListID: 1 });
        
        // Get number of players (DB)
        let playersList = newGrid.length;

        // Add the participants to the list
        let userList;
        for (let i = 0; i < playersList; i++) {
          if (userList == null) {
            userList = `<@${newGrid[i].userID}>`;
          } else {
            userList = userList + "\n" + `<@${newGrid[i].userID}>`;
          }
        }

        // Update the fields
        currentEmbed.fields[0].name = `🎮 Jogadores (${playersList}/${players})`;
        currentEmbed.fields[0].value = userList;
        
        return await reaction.message.edit({ embeds: [currentEmbed] });

        // let fields = currentEmbed.fields.length;

        // for (let i = 0; i < fields; i++) {
          
        //   if (currentEmbed.fields[i].name.includes("Reservas")){
        //     console.log(currentEmbed.fields[i])
        //     console.log("ACHEI!!")
        //   }else{
        //     console.log(currentEmbed.fields[i])
        //   }
          
        // }

      }

      // // If there is no users for this reaction...
      // if (us.size == 0) {
      //   await reaction.message.react("☑️");

      //   // Get the number of players for this activity.
      //   let players = numberOfPlayers(currentEmbed.footer.text);

      //   // Update the fields
      //   currentEmbed.fields[0].name = `🎮 Jogadores (0/${players})`;
      //   currentEmbed.fields[0].value = "Nenhum jogador no momento...";

      //   // Edit the embed message
      //   return await reaction.message.edit({ embeds: [currentEmbed] });
      // } else {
      //   // Cache the reaction users
      //   let reactions = await reaction.message.reactions
      //     .resolve("☑️")
      //     .users.fetch();

      //   // Get the number of players for this activity.
      //   let players;
      //   if(currentEmbed.footer.text.startsWith("Outros")  == true) {
      //     players = global.Jogadores;
      //   } else {
      //     players = numberOfPlayers(currentEmbed.footer.text);
      //   }

      //   if (reaction.emoji.name === "☑️") {
      //     //Get user id's
      //     let playersList = reactions.map((user) => user.id);
      //     let playersMessage = reactions.map((msg) => `${msg}`).join("\n");

      //     // Update the fields
      //     currentEmbed.fields[0].name = `🎮 Jogadores (${playersList.length}/${players})`;
      //     currentEmbed.fields[0].value = playersMessage;

      //     // Edit the embed message
      //     return await reaction.message.edit({ embeds: [currentEmbed] });
      //   }
      // }
    }
    //  else {
    //   if (
    //     reaction.emoji.name === "👥" &&
    //     reaction.message.author.id === process.env.BOT_ID &&
    //     user.id != process.env.BOT_ID
    //   ) {
    //     // If there is no users for this reaction...
    //     if (us.size == 0) {
    //       await reaction.message.react("👥");

    //       // Update the fields
    //       currentEmbed.fields[1].name = `👥 Reservas (0)`;
    //       currentEmbed.fields[1].value = "Nenhum";

    //       // Edit the embed message
    //       return reaction.message.edit({ embeds: [currentEmbed] });
    //     } else {
    //       // Cache the reaction users
    //       let reactions = await reaction.message.reactions
    //         .resolve("👥")
    //         .users.fetch();

    //       //Get user id's
    //       let playersList = reactions.map((user) => user.id);
    //       let playersMessage = reactions.map((msg) => `${msg}`).join("\n");

    //       // Update the fields
    //       currentEmbed.fields[1].name = `👥 Reservas (${playersList.length})`;
    //       currentEmbed.fields[1].value = playersMessage;

    //       // Edit the embed message
    //       return await reaction.message.edit({ embeds: [currentEmbed] });
    //     }
    //   }
    // }
  },
};
