const { MessageEmbed, ReactionManager } = require("discord.js");
const moment = require("moment");
const { numberOfPlayers } = require("../util/functions");
//----------------------------------------------
const database = require("../config/database");
const Grid = require("../models/Grid");
//----------------------------------------------

module.exports = {
  name: "messageReactionAdd",
  run: async (bot, reaction, user) => {
    // Must be the correct emoji:☑️, The message author must be the BOT and the reaction can't be by the BOT yet
    if (reaction.emoji.name === "☑️" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {
      
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
      let players = numberOfPlayers(embedFooter.text);

      // If the reaction user is not in the database yet, add him.
      if ((await Grid.findOne({ gridID: gridID, type: type, userID: user.id })) == null) {

        var grid = await Grid.find({ gridID: gridID, type: type, starter: true}).sort({ userListID: 1 });

        // If the grid is already full, create a new field: queue.
        if ((grid.length == players)) {
          
          var queueList = await Grid.find({ gridID: gridID, type: type, queue: true}).sort({ userListID: 1 });

          var backupList = await Grid.find({ gridID: gridID, type: type, backup: true}).sort({ userListID: 1 });

          if(queueList.length == 0){

            //currentEmbed.addFields({ name: "⌛ Lista de espera:", value: `<@${user.id}>`});

          }else{

          }
          // if (backupList.length == 0){
            
          // }

          // create espera
  
          //field 00 -- Participantes
  
          // field 01 -- Reserva
          
          // field 02 -- Espera
  
          //-- 
  
          //field 01 = Espera
  
          //find reservas
          // field 02 = reservas
          
          //currentEmbed.fields[2] = [];
          // currentEmbed.fields[1].name = "👥 Reservas (0)";
          // currentEmbed.fields[1].value = "Nenhum";

          // currentEmbed.addFields({
          //   name: currentEmbed.fields[1].name,
          //   value: currentEmbed.fields[1].value,
          // });

        }

        //   // console.log(currentEmbed.fields[1].name);
        //   // console.log(currentEmbed.fields[1].value);

        //   currentEmbed.fields[1].name = "⌛ Lista de espera:";
        //   currentEmbed.fields[1].value = `<@${user.id}>`;

        //   return await reaction.message.edit({ embeds: [currentEmbed] });
        // } else {
        //   if (grid.length > players) {
        //     currentEmbed.fields[1].value =
        //       currentEmbed.fields[1].value + "\n" + `<@${user.id}>`;

        //     return await reaction.message.edit({ embeds: [currentEmbed] });
        //   }
        // }

        //   // // Update the fields
        //   //   currentEmbed.fields[1].name = `👥 Reservas (${playersList.length})`;
        //   //   currentEmbed.fields[1].value = playersMessage;

        // A partir daqui funcionando até o "else"
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

        return await reaction.message.edit({ embeds: [currentEmbed] });
      }
      
      // If the reaction user is already in the database, update him.
      else {
        
        // var grid = await Grid.find({ gridID: gridID, type: type, queue: true,}).sort({ userListID: 1 });

        // let userList;
        // if(grid.length == 0){
        //   userList = 1
        // }else{
        //   userList = grid[grid.length - 1].userListID + 1
        // }

        // const query = {gridID: gridID, type: type, userID: user.id};
        // await Grid.findOneAndUpdate(query, {starter: false, queue: true, quitter: false, backup: false, userListID: userList}, {new: true})


        // if ((grid.length = players)) {
  
        //   currentEmbed.addFields({ name: "⌛ Lista de espera:", value: `<@${user.id}>`});
  
        // }
        
        var userGridInfo = await Grid.findOne({ gridID: gridID, type: type, userID: user.id });

        // Remove BOT reaction
        if(userGridInfo.userListID == 1){
          await reaction.users.remove(process.env.BOT_ID);
          
        }

        // Get the user list
        var newGrid = await Grid.find({gridID: gridID, type: type, starter: true}).sort({ userListID: 1 });

        // Get number of players (DB)
        let playersList = newGrid.length;

        // If the player list is not full, and is not the creator of the grid, add the player.
        if (playersList > 1 && playersList < players && userGridInfo.userListID != 1) {

          let userlistID = newGrid[newGrid.length - 1].userListID + 1;

          const query = {gridID: gridID, type: type, userID: user.id};
          await Grid.findOneAndUpdate(query, {starter: true, queue: false, quitter: false, backup: false, userListID: userlistID, updatedDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate()}, {new: true})

          newGrid = await Grid.find({gridID: gridID, type: type, starter: true}).sort({ userListID: 1 });

          playersList = newGrid.length;
          // Add the participants to the list
          let userList;
          for (let i = 0; i < newGrid.length; i++) {
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
        }
        // If the player list is already full, then create queue list.
        // else{

        //   const query = {gridID: gridID, type: type, userID: user.id};
        //   await Grid.findOneAndUpdate(query, {starter: true, queue: false, quitter: false, backup: false, userListID: userlistID, updatedDate: moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate()}, {new: true})


        // }
      }
    } else {

    //   // Cache the reaction users
    //   //let reactions = await reaction.message.reactions.cache.first().users.fetch();
    //   let reactions = await reaction.message.reactions.resolve('☑️').users.fetch();
    //   reactions = reactions.filter((u) => u.id != process.env.BOT_ID); // Remove the bot reaction.

    //   // If user already reacted to other list, remove his reaction.
    //   reaction.message.reactions.cache.find(r => r.emoji.name == "👥").users.remove(user);

    //   // Get the number of players for this activity.
    //   let players;
    //   if(currentEmbed.footer.text.startsWith("Outros")  == true) {
    //     players = global.Jogadores;
    //   }
    //   else {
    //     players = numberOfPlayers(currentEmbed.footer.text);
    //   }

    //   //Get user id's
    //   let playersList = reactions.map((user) => user.id); // ARRAY

    //   // If the number of reactions <= number of players
    //   if (playersList.length <= players) {
    //     let playersMessage = reactions.map((item) => `${item}`).join("\n");

    //     // // Verify if there is a player on the list.
    //     // if(playersMessage === ''){
    //     //   playersMessage = "Nenhum jogador no momento...";
    //     // }
    //     // Update the fields
    //     currentEmbed.fields[0].name = `🎮 Jogadores (${playersList.length}/${players})`;
    //     currentEmbed.fields[0].value = playersMessage;
    //   } else {
    //     reaction.users.remove(user.id);
    //   }

    //   // Remove bot's reaction.
    //   reaction.users.remove(process.env.BOT_ID);

    //   // Edit the embed message
    //   return await reaction.message.edit({ embeds: [currentEmbed] });
    // } else {

      // Reaction: Reservas 👥
      if (reaction.emoji.name === "👥" && reaction.message.author.id === process.env.BOT_ID && user.id != process.env.BOT_ID) {

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
        //let players = numberOfPlayers(embedFooter.text);

        // If the reaction user is not in the database yet, add him.
        if ((await Grid.findOne({ gridID: gridID, type: type, userID: user.id })) == null) {
          
          var grid = await Grid.find({ gridID: gridID, type: type, starter: true}).sort({ userListID: 1 });

          var gridQueue = await Grid.find({ gridID: gridID, type: type, queue: true}).sort({ userListID: 1 });

          if(gridQueue.length == 0){

            const newGridDB = Grid.create({
              gridID: grid[0].gridID,
              type: grid[0].type,
              date: grid[0].date,
              description: grid[0].description,
              userListID: 1,
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
          
          // After insert in the DB, get the new list
          var backupGrid = await Grid.find({ gridID: gridID, type: type, backup: true, }).sort({ userListID: 1 });
          
          // Look for field reserva and edit.
            for (let i = 0; i < currentEmbed.fields.length; i++) {
              
              if(currentEmbed.fields[i].name.includes("Reservas")){
                currentEmbed.fields[i].value = `<@${backupGrid[0].userID}>`;
              }
            }
          }

          // Edit the embed message
          return await reaction.message.edit({ embeds: [currentEmbed] });

        }

        // // Cache the reaction users
        // let reactions = await reaction.message.reactions.resolve('👥').users.fetch();
        // reactions = reactions.filter((u) => u.id != process.env.BOT_ID); // Remove the bot reaction

        // // If user already reacted to other list, remove his reaction.
        // reaction.message.reactions.cache.find(r => r.emoji.name == "☑️").users.remove(user);

        // // Get the current Embed
        // let currentEmbed = reaction.message.embeds[0];

        // // //Get user id's
        // let playersList = reactions.map((user) => user.id);
        // let playersMessage = reactions.map((item) => `${item}`).join("\n");

        // // Update the fields
        // currentEmbed.fields[1].name = `👥 Reservas (${playersList.length})`;
        // currentEmbed.fields[1].value = playersMessage;

        // // Remove bot's reaction.
        // reaction.users.remove(process.env.BOT_ID);

        // // Edit the embed message
        // return await reaction.message.edit({ embeds: [currentEmbed] });

      } 
      //   else {
      //   // if (reaction.emoji.name === "☑️" && reaction.message.author.id === process.env.BOT_ID) {
      //   //   // await reaction.message.edit("<@&965299911992164412>"); // Veterano
      //   //   // await reaction.message.edit("<@&965300143110889493>"); // Membros
      //   //   // await reaction.message.edit("<@&965300197561344000>"); // Novatos
      //   //   await reaction.message.edit("<@&965294430552719442>"); // Convidado
      //   //   await reaction.message.edit("<@&961267518775918662>"); // Oracles
      //   //   // await reaction.message.edit("<@&820469652999503883>"); // Fundador
      //   // }
      //   // return;
      // }
    }
  },
};
