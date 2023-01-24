const { MessageEmbed, ReactionManager, Channel } = require("discord.js");
const moment = require("moment");
const { numberOfPlayers } = require("../util/functions");
//----------------------------------------------
const database = require("../config/database");
const Grid = require("../models/Grid");
const { Interaction } = require("discord.js");
//----------------------------------------------

module.exports = {
  name: "messageReactionAdd",
  run: async (bot, reaction, user) => {
    
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
    let diaHora = new Date(); // Today
    diaHora = diaHora.toLocaleString();

    // Get the number of players
    let players;
    if(numberOfPlayers(embedFooter.text) == null){
      players = global.Jogadores;
    } else {
      players = numberOfPlayers(embedFooter.text);
    }

    // Getting embed fields
    let fields = currentEmbed.fields.length;

    // Must be the correct emoji:☑️, The message author must be the BOT and the reaction can't be by the BOT yet
    if (reaction.emoji.name === "☑️" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {
      // -------------------------------------------------------------------------------------------------------------------------
      // Get parameters
      // -------------------------------------------------------------------------------------------------------------------------

      // Get the Players/Queue/Backup lists
      var grid = await Grid.find({ gridID: gridID, type: type, starter: true}).sort({ userListID: 1 });
      var gridFull = await Grid.find({ gridID: gridID, type: type}).sort({ userListID: 1 });

      var queueList = await Grid.find({ gridID: gridID, type: type, queue: true}).sort({ userListID: 1 });

      // Get the next userListID
      let userlistID = gridFull[gridFull.length - 1].userListID + 1;

      // -------------------------------------------------------------------------------------------------------------------------
      // If the grid is already full, create a new field: queue.
      if ((grid.length == players)) {
        
        // Get user info
        var userGridInfo = await Grid.findOne({ gridID: gridID, type: type, userID: user.id });

        // -------------------------------------------------------------------------------------------------------------------------
        // If the user is the first one (created the grid), just remove bot's reaction.
        // -------------------------------------------------------------------------------------------------------------------------
        if(userGridInfo != null && userGridInfo.userListID == 1){
          
          await reaction.users.remove(process.env.BOT_ID);

        }
        else {

          //Get the id for the field
          let queueEmbedID;
          for (let i = 0; i < fields; i++) {
            if(currentEmbed.fields[i].name != null){
              if (currentEmbed.fields[i].name.includes("espera")){
                queueEmbedID = i;
              }
            }
          }

          // Queue List
          if(queueList.length == 0 && queueEmbedID == null){

            // Add a new field to the Embed
            currentEmbed.addFields({
              value: currentEmbed.fields[1].value,
              name: currentEmbed.fields[1].name,
            });

            currentEmbed.fields[1].value = `<@${user.id}>`;
            currentEmbed.fields[1].name = "⌛ Lista de espera (1)";
          
            // If the user is not in the database yet, add him.
            if (userGridInfo == null) {
              
            // Get the whole grid
            var grid = await Grid.find({ gridID: gridID, type: type}).sort({ userListID: 1 });

            // Add the user to Database
            const queueGridDB = Grid.create({
              gridID: grid[0].gridID,
              type: grid[0].type,
              date: grid[0].date,
              description: grid[0].description,
              userListID: grid[grid.length - 1].userListID + 1, // Criar user list aqui. Pegar o ultimo numero + 1.
              user: user.username,
              userID: user.id,
              starter: false,
              queue: true,
              backup: false,
              quitter: false,
              createdDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate(),
            });

            // Save on DB to be able to search the new value.
            (await queueGridDB).save;
          
            //------------------------------------------------------------------------------------------------------------
            //APAGAR ESSA PARTE, É SOMENTE PRA ATUALIZAR A LISTA NOS TESTES.
            // After insert in the DB, get the new list
            var newGrid = await Grid.find({ gridID: gridID, type: type, starter: true, }).sort({ userListID: 1 });

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

            //------------------------------------------------------------------------------------------------------------

          } else { // Update the user
            
            const query = {gridID: gridID, type: type, userID: user.id};
            await Grid.findOneAndUpdate(query, {starter: false, queue: true, quitter: false, backup: false, userListID: userlistID, updatedDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate()}, {new: true})
            
            // Remove the User's reaction (In case of reaction)
            await reaction.message.reactions.resolve("👥").users.remove(user.id);
          }

            return await reaction.message.edit({ embeds: [currentEmbed] });

          // If there is already people in the queue list, add
          } else {
            // Get the whole grid
            var grid = await Grid.find({ gridID: gridID, type: type}).sort({ userListID: 1 });

            // If the user is not yet in the database, add him.
            if (userGridInfo == null) {

              // Add the user to Database
              const queueGridDB = Grid.create({
                gridID: grid[0].gridID,
                type: grid[0].type,
                date: grid[0].date,
                description: grid[0].description,
                userListID: grid[grid.length - 1].userListID + 1, // Criar user list aqui. Pegar o ultimo numero + 1.
                user: user.username,
                userID: user.id,
                starter: false,
                queue: true,
                backup: false,
                quitter: false,
                createdDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate(),
              });

              // Save on DB to be able to search the new value.
              (await queueGridDB).save;

            } else {  // If the user is already in the db, update him.
              const query = {gridID: gridID, type: type, userID: user.id};
              // Update user
              await Grid.findOneAndUpdate(query, {starter: false, queue: true, quitter: false, backup: false, userListID: userlistID, updatedDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate()}, {new: true})
  
              // Remove the User's reaction (In case of reaction)
              await reaction.message.reactions.resolve("👥").users.remove(user.id);
            }
            //--------------------------------------------------------------------------------------------------------
            // Create the Queue list
            // Get the queue list from DB
            var queueList = await Grid.find({ gridID: gridID, type: type, queue: true}).sort({ userListID: 1 });
            
            // Get number of players (DB)
            let queuePlayersList = queueList.length;

            // Add the participants to the list
            let queueUserList;
            for (let i = 0; i < queuePlayersList; i++) {
              if (queueUserList == null) {
                queueUserList = `<@${queueList[i].userID}>`;
              } else {
                queueUserList = queueUserList + "\n" + `<@${queueList[i].userID}>`;
              }
            }
            
            // Update the fields
            currentEmbed.fields[1].value = queueUserList;
            currentEmbed.fields[1].name = `⌛ Lista de espera (${queuePlayersList})`;
            //--------------------------------------------------------------------------------------------------------

            return await reaction.message.edit({ embeds: [currentEmbed] });
          }
        }

      } else { // If the grid is not full, add the user

        // Get user info
        var userGridInfo = await Grid.findOne({ gridID: gridID, type: type, userID: user.id });

        // -------------------------------------------------------------------------------------------------------------------------
        // If the user is the first one (created the grid), just remove bot's reaction.
        // -------------------------------------------------------------------------------------------------------------------------
        if(userGridInfo != null && userGridInfo.userListID == 1){
          
          await reaction.users.remove(process.env.BOT_ID);

        } else { // If not the first user, add or update
          
          // If the user is not in the database yet, add him.
          if (userGridInfo == null) {

            // Add the user to Database
            const newGridDB = Grid.create({
              gridID: grid[0].gridID,
              type: grid[0].type,
              date: grid[0].date,
              description: grid[0].description,
              userListID: grid[grid.length - 1].userListID + 1, // Criar user list aqui. Pegar o ultimo numero + 1.
              user: user.username,
              userID: user.id,
              starter: true,
              queue: false,
              backup: false,
              quitter: false,
              createdDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate(),
            });

            // Save on DB to be able to search the new value.
            (await newGridDB).save;

          } 
          // If the user is already in the database, update him.
          else { 
            const query = {gridID: gridID, type: type, userID: user.id};
            // Update user
            await Grid.findOneAndUpdate(query, {starter: true, queue: false, quitter: false, backup: false, userListID: userlistID, updatedDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate()}, {new: true})

            // Remove the User's reaction (In case of reaction)
            await reaction.message.reactions.resolve("👥").users.remove(user.id);
          }
        }
        
        //------------------------------------------------------------------------------------------------------
        
        //------------------------------------------------------------------------------------------------------
        // Starter List - After insert in the DB, get the new list
        //------------------------------------------------------------------------------------------------------
        // Getting data from DB
        var starterGridList = await Grid.find({ gridID: gridID, type: type, starter: true }).sort({ userListID: 1 });

        // Get number of players (DB)
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
        //------------------------------------------------------------------------------------------------------
        
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
        return await reaction.message.edit({ embeds: [currentEmbed] });
      }
       
    } else { 
        // Reaction: Reservas 👥
        // Must be the correct emoji:👥, The message author must be the BOT and the reaction can't be by the BOT yet
        if (reaction.emoji.name === "👥" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {

          // Get the Players lists
          var grid = await Grid.find({ gridID: gridID, type: type}).sort({ userListID: 1 });
          
          // Get the next userListID
          let userlistID = grid[grid.length - 1].userListID + 1;

          // Get user info
          var userGridInfo = await Grid.findOne({ gridID: gridID, type: type, userID: user.id });

          // If the user is the first one (created the grid), remove bot's reaction.
          if(userGridInfo != null && userGridInfo.userListID == 1){
            
            await reaction.users.remove(user.id);

          } else {
            
              // If the reaction user is not in the database yet, add him.
              if (userGridInfo == null) {

                const newGridDB = Grid.create({
                        gridID: grid[0].gridID,
                        type: grid[0].type,
                        date: grid[0].date,
                        description: grid[0].description,
                        userListID: grid[grid.length - 1].userListID + 1, // Criar user list aqui. Pegar o ultimo numero + 1.
                        user: user.username,
                        userID: user.id,
                        starter: false,
                        queue: false,
                        backup: true,
                        quitter: false,
                        createdDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate(),
                      });
                // Save on DB to be able to search the new value.
                (await newGridDB).save;
              } 
                // If the user is already in the database, update him.
                else {
                  const query = {gridID: gridID, type: type, userID: user.id};
                  // Update the user
                  await Grid.findOneAndUpdate(query, {starter: false, queue: false, quitter: false, backup: true, userListID: userlistID, updatedDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate()}, {new: true})

                  // Remove the User's reaction (In case of reaction)
                  await reaction.message.reactions.resolve("☑️").users.remove(user.id);
                }

                //----------------------------------------------------------------------------------------------------------------
                // Starter List
                //----------------------------------------------------------------------------------------------------------------
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

            }
        }
      } 
  }
};
