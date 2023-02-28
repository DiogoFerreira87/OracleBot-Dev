const { MessageEmbed, ReactionManager, Channel } = require("discord.js");
const { numberOfPlayers } = require("../util/functions");
const moment = require("moment");
//----------------------------------------------
const database = require("../config/database");
const Grid = require("../models/Grid");
const { Interaction } = require("discord.js");
//----------------------------------------------

module.exports = {
  name: "messageReactionRemove",
  run: async (bot, reaction, user) => {
    
    // If the message author is the BOT AND the reaction user is not the bot, then continue.
    if (reaction.emoji.name === "☑️" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {
      // -------------------------------------------------------------------------------------------------------------------------
      // Get parameters
      // -------------------------------------------------------------------------------------------------------------------------
      // Connect to the database
      const db = new database();
      db.connect();

      // Get the current Embed
      let currentEmbed = reaction.message.embeds[0];
      let embedTitle = currentEmbed.title;
      let gridID = parseInt(embedTitle.substring(embedTitle.indexOf("#") + 1).match(/^(\S+)\s(.*)/).slice(1)[0]);

      // Get the Grid Type
      let embedFooter = currentEmbed.footer;
      let type = embedFooter.text.match(/^(\S+)\s(.*)/).slice(1)[0];

      // Get the current date and time
      let diaHora = moment(new Date()).format('DD/MM/YYYY'); // Today
      diaHora = diaHora.toLocaleString();

      let createdDate = moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate();
      
      // Get the number of players
      let players;
      if(numberOfPlayers(embedFooter.text) == null){
        players = global.Jogadores;
      } else {
        players = numberOfPlayers(embedFooter.text);
      }

      // Getting embed fields
      let fields = currentEmbed.fields.length;
      // -------------------------------------------------------------------------------------------------------------------------

      // Get the grid from DB
      var grid = await Grid.find({ gridID: gridID, type: type, starter: true}).sort({ userListID: 1 });

      // Get user data from DB
      var userGridInfo = await Grid.findOne({ gridID: gridID, type: type, userID: user.id });
      
      // User is starter / starter null / user not in the DB.
      if(userGridInfo.starter == true || userGridInfo.queue == true || userGridInfo.starter == null || userGridInfo == null){
      
        // Find if the user is already in the DB, then...
        if ((userGridInfo) != null) {
          
          // Verify if the grid list has only one member
          if ((grid.length == 1 && userGridInfo.userListID == 1)) {
            // Remove all reactions
            await reaction.message.reactions.removeAll();

            // Add the bot reaction
            await reaction.message.react("☑️");
            await reaction.message.react("👥");

            // Send DM
            //user.send("Ta maluco??");
            
            return await reaction.message.reply({
              content:
                `❌ **Erro:** **<@${user.id}>, não é possível sair da grade que você mesmo criou.**
                    Caso queira cancelar a grade, marque abaixo algum <@&643576108347818026>.`
            });

          } else { // If there are more people already in the list, just remove bot's reaction and send the message
            // Verify if the user is the Grid's author
            if(userGridInfo.userListID == 1){
              
              // Remove Bot's reaction
              await reaction.message.react("☑️");

              return await reaction.message.reply({
                content:
                  `❌ **Erro:** **<@${user.id}>, não é possível sair da grade que você mesmo criou.**
                      Caso queira cancelar a grade, marque abaixo algum <@&643576108347818026>.`
              });
            
            } else { // 

              // Update the user as "quitter" in DB.
              const query = {gridID: gridID, type: type, userID: user.id};
              await Grid.findOneAndUpdate(query, {starter: false, queue: false, quitter: true, backup: false, userListID: 0, updatedDate: createdDate}, {new: true})
            }
          }
        }
      }

      //----------------------------------------------------------------------------------------------------------------
      // Queue List (New)
      //----------------------------------------------------------------------------------------------------------------
      // Get the starter grid list from DB
      var grid = await Grid.find({ gridID: gridID, type: type, starter: true}).sort({ userListID: 1 });
      var gridFull = await Grid.find({ gridID: gridID, type: type}).sort({ userListID: 1 });

      // Get the next userListID
      let userlistID = gridFull[gridFull.length - 1].userListID + 1;

      // If there is space in the starters list, get the first one on the Queue list and add him.
      if (grid.length < players){
        // Get the grid from DB
        var gridQueueList = await Grid.find({ gridID: gridID, type: type, queue: true}).sort({ userListID: 1 });

        // If the list is not null
        if(gridQueueList.length != 0){

          // Get the first user from the list
          let userID = gridQueueList[0].userID

          // Update the user:
          const query = {gridID: gridID, type: type, userID: userID};
          await Grid.findOneAndUpdate(query, {starter: true, queue: false, quitter: false, backup: false, userListID: userlistID, updatedDate: createdDate}, {new: true})

          // Send a message to the user that is now in the starter list
          // Send DM
          //user.send("Ta maluco??");

          await reaction.message.reply({
            content:
              `❗️Atenção: O player <@${user.id}> saiu da grade e o player <@${userID}> entrou no seu lugar!`
          });

        }

      }
      //----------------------------------------------------------------------------------------------------------------

      //----------------------------------------------------------------------------------------------------------------
      // Starter List
      //----------------------------------------------------------------------------------------------------------------
      // This list will never be null, the creator will always be present.
      // Getting data from DB
      var starterGridList = await Grid.find({ gridID: gridID, type: type, starter: true }).sort({ userListID: 1 });
      
      // Get number of players (Qty)
      let starterQty = starterGridList.length;

      // Add the participants to the list
      let starterUserList;
      for (let i = 0; i < starterQty; i++) {
        if (starterUserList == null) {
          starterUserList = `<@${starterGridList[i].userID}>`;
        } else {
          starterUserList = starterUserList + "\n" + `<@${starterGridList[i].userID}>`;
        }
      }

      // Update the fields
      currentEmbed.fields[0].name = `🎮 Jogadores (${starterQty}/${players})`;
      currentEmbed.fields[0].value = starterUserList;
      //----------------------------------------------------------------------------------------------------------------

      //----------------------------------------------------------------------------------------------------------------
      // Queue List
      //----------------------------------------------------------------------------------------------------------------
      // Getting data from DB
      var queueGridList = await Grid.find({ gridID: gridID, type: type, queue: true }).sort({ userListID: 1 });

      //Get the id for the field
      let queueEmbedID;
      for (let i = 0; i < fields; i++) {
        if(currentEmbed.fields[i].name != null){
          if (currentEmbed.fields[i].name.includes("espera")){
            queueEmbedID = i;
          }
        }
      }
      
      // Check if the list has no users 
      if(queueGridList.length == 0){
        
        // Delete the field
        currentEmbed.fields[queueEmbedID] = [];

      } else { // If the list still has users, just update.

        // Get number of players (DB)
        let queueQty = queueGridList.length;

        // Add the participants to the list
        let queueUserList;
        for (let i = 0; i < queueQty; i++) {
          if (queueUserList == null) {
            queueUserList = `<@${queueGridList[i].userID}>`;
          } else {
            queueUserList = queueUserList + "\n" + `<@${queueGridList[i].userID}>`;
          }
        }
        
        // Update the fields
        currentEmbed.fields[queueEmbedID].value = queueUserList;
        currentEmbed.fields[queueEmbedID].name = `⌛ Lista de espera (${queueQty})`;
      }
      //----------------------------------------------------------------------------------------------------------------
      
      //----------------------------------------------------------------------------------------------------------------
      // Backup List
      //----------------------------------------------------------------------------------------------------------------
      // Getting data from DB
      var backupGridList = await Grid.find({ gridID: gridID, type: type, backup: true }).sort({ userListID: 1 });
      
      //Get the id for the field
      let backupEmbedID;
      for (let i = 0; i < fields; i++) {
        if(currentEmbed.fields[i].name != null){
          if (currentEmbed.fields[i].name.includes("Reservas")){
            backupEmbedID = i;
          }
        }
      }

      // Check if the list has no users
      if(backupGridList.length == 0){

        // Update the fields
        currentEmbed.fields[backupEmbedID].name = `👥 Reservas (0)`;
        currentEmbed.fields[backupEmbedID].value = "Nenhum";
        
      } else { // If the list still has users, just update.
        // Get number of players (DB)
        let backupQty = backupGridList.length;

        // Add the participants to the list
        let backupUserList;
        for (let i = 0; i < backupQty; i++) {
          if (backupUserList == null) {
            backupUserList = `<@${backupGridList[i].userID}>`;
          } else {
            backupUserList = backupUserList + "\n" + `<@${backupGridList[i].userID}>`;
          }
        }
        
        // Update the fields
        currentEmbed.fields[backupEmbedID].value = backupUserList;
        currentEmbed.fields[backupEmbedID].name = `👥 Reservas (${backupQty})`;
      }
      //----------------------------------------------------------------------------------------------------------------

      // Edit the embed message
      return await reaction.message.edit({ embeds: [currentEmbed] });
      
    } else {
      // Reaction: Reservas 👥
      // Must be the correct emoji:👥, The message author must be the BOT and the reaction can't be by the BOT yet
      if (reaction.emoji.name === "👥" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {
        // -------------------------------------------------------------------------------------------------------------------------
        // Get parameters
        // -------------------------------------------------------------------------------------------------------------------------
        // Connect to the database
        const db = new database();
        db.connect();

        // Get the current Embed
        let currentEmbed = reaction.message.embeds[0];
        let embedTitle = currentEmbed.title;
        let gridID = parseInt(embedTitle.substring(embedTitle.indexOf("#") + 1).match(/^(\S+)\s(.*)/).slice(1)[0]);

        // Get the Grid Type
        let embedFooter = currentEmbed.footer;
        let type = embedFooter.text.match(/^(\S+)\s(.*)/).slice(1)[0];

        // Get the current date and time
        let diaHora = moment(new Date()).format('DD/MM/YYYY'); // Today
        diaHora = diaHora.toLocaleString();

        let createdDate = moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate();
        
        // Get the number of players
        let players;
        if(numberOfPlayers(embedFooter.text) == null){
          players = global.Jogadores;
        } else {
          players = numberOfPlayers(embedFooter.text);
        }

        // Getting embed fields
        let fields = currentEmbed.fields.length;
        // -------------------------------------------------------------------------------------------------------------------------

        // Get user data from DB
        var userGridInfo = await Grid.findOne({ gridID: gridID, type: type, userID: user.id });
        
        // User not starter / starter null / user not in the DB.
        if((userGridInfo.starter != true || userGridInfo.starter == null || userGridInfo == null) && userGridInfo.queue != true){

          const query = {gridID: gridID, type: type, userID: user.id};
          // Update the user
          await Grid.findOneAndUpdate(query, {starter: false, queue: false, quitter: true, backup: false, userListID: 0, updatedDate: createdDate}, {new: true})

        } 
          //----------------------------------------------------------------------------------------------------------------
          // Backup List
          //----------------------------------------------------------------------------------------------------------------
          // Getting data from DB
          var backupGridList = await Grid.find({ gridID: gridID, type: type, backup: true }).sort({ userListID: 1 });
          
          //Get the id for the field
          let backupEmbedID;
          for (let i = 0; i < fields; i++) {
            if(currentEmbed.fields[i].name != null){
              if (currentEmbed.fields[i].name.includes("Reservas")){
                backupEmbedID = i;
              }
            }
          }
          
          // Check if the list has no users
          if(backupGridList.length == 0){

            // Update the fields
            currentEmbed.fields[backupEmbedID].name = `👥 Reservas (0)`;
            currentEmbed.fields[backupEmbedID].value = "Nenhum";
            
          } else { // If the list still has users, just update.
            // Get number of players (DB)
            let backupQty = backupGridList.length;

            // Add the participants to the list
            let backupUserList;
            for (let i = 0; i < backupQty; i++) {
              if (backupUserList == null) {
                backupUserList = `<@${backupGridList[i].userID}>`;
              } else {
                backupUserList = backupUserList + "\n" + `<@${backupGridList[i].userID}>`;
              }
            }
            
            // Update the fields
            currentEmbed.fields[backupEmbedID].value = backupUserList;
            currentEmbed.fields[backupEmbedID].name = `👥 Reservas (${backupQty})`;
          }
          //----------------------------------------------------------------------------------------------------------------

          // Edit the embed message
          return await reaction.message.edit({ embeds: [currentEmbed] });
        
      }
    }
  },
};
