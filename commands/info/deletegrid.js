//----------------------------------------------
const Discord = require("discord.js");
require("dotenv").config();
const moment = require("moment");
const { validateDate } = require("../../util/functions");
//----------------------------------------------
const database = require("../../config/database");
const User = require("../../models/UsersProfile");
const Grid = require("../../models/Grid");

//----------------------------------------------

module.exports = {
    name:"deletegrid",
    category: "info",
    permissions: ['ADMINISTRATOR'],
    devOnly: false,
    run: async ({client, message, args}) => {
        //Create Embed Message
        let embed = new Discord.MessageEmbed();

        // Message color
        let greenColor = '#00FF00';
        let redColor = '#FF0000';

        // GuildID
        const guildId = process.env.GUILD_ID;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return console.error("Target guild not found");

        if (args.length != 2){
            embed = embed
            .setDescription("❌ Erro: O comando **'!deletegrid'** precisa de 2 parâmetros para funcionar:\n1 - **Tipo de grade que deseja apagar.**\n2 - **Número da grade que deseja apagar.** \n**Exemplo:** !deletegrid Raid 120 \n\nPor favor repita o comando com os argumentos corretos.")
            .setColor(redColor)
            
            return message.reply({embeds: [embed]})
        }else{
            
            let gridType = args[0];
            let gridID = args[1];
            
            // Connect to the database.
            const db = new database();
            db.connect();

            let type = await Grid.find({type: args[0]}).limit(1);
            let id = await Grid.find({type: args[0], gridID: args[1]}).limit(1);

            if (type.length == 0){
                embed = embed
                    .setDescription(`❌ Erro: O tipo de grade "${args[0]}" não exite. Por favor digite um tipo correto.`)
                    .setColor(redColor);
                
                return message.reply({embeds: [embed]})

            }else{
                if(id == 0){
                    embed = embed
                    .setDescription(`❌ Erro: O tipo de grade "${args[0]}" exite, porém não foi possível encontrar a grade número "${args[1]}". \nPor favor verifique se o número da grade está correto.`)
                    .setColor(redColor);
                
                    return message.reply({embeds: [embed]})
                
                }else{
                    // Delete Grid
                    let apagar = await Grid.deleteMany({type: gridType, gridID: gridID})

                    console.log(`A grade do tipo ${args[0]} número ${args[1]} foi apagada com sucesso.`)
                    
                    embed = embed
                    .setDescription(`✅ A grade do tipo "${args[0]}" número "${args[1]}" foi apagada com sucesso.`)
                    .setColor(greenColor);

                    return message.reply({embeds: [embed]});
                }
                
            }
        }
    }
}