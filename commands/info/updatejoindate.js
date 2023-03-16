//----------------------------------------------
const Discord = require("discord.js");
require("dotenv").config();
const moment = require("moment");
const { validateDate } = require("../../util/functions");
//----------------------------------------------
const database = require("../../config/database");
const User = require("../../models/UsersProfile");
//----------------------------------------------

module.exports = {
    name:"updatejoindate",
    category: "info",
    permissions: ['ADMINISTRATOR'],
    devOnly: false,
    run: async ({client, message, args}) => {
        //Create Embed Message
        let embed = new Discord.MessageEmbed();

        // Message color
        let greenColor = '#00FF00';
        let redColor = '#FF0000';

        // OracleID Role
        let oraclesRoleID = '961267518775918662';
        
        // GuildID
        const guildId = process.env.GUILD_ID;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return console.error("Target guild not found");

        let userID = args[0].slice(2,-1)

        // Get member
        let getMember = guild.members.cache.filter(member => member.id === userID).map((m) => (m));

        if (args.length != 2){
            embed = embed
            .setDescription("❌ Erro: O comando **'!updatejoindate'** precisa de 2 parâmetros para funcionar:\n1 - **Membro** \n2 - **Data de entrada no clã**.\n**Exemplo:** !updatejoindate @Diogo#3099 10/12/2020\n\nPor favor repita o comando com os argumentos corretos.")
            .setColor(redColor)
            
            return message.reply({embeds: [embed]})
        }else{
                        
            // Verify first argument 
            if(getMember[0].id === null){
                embed = embed
                    .setDescription("❌ Erro: **O membro não existe na base de dados.\nVerifique se a marcação está correta.**")
                    .setColor(redColor)
                    
                    return await message.reply({embeds: [embed]});
                
            }else{
                // Verify second argument 
                if (validateDate(args[1]) == false) { // If it is not a date in the format DD/MM or DD/MM/YYYY
                    embed = embed
                    .setDescription("❌ Erro: **Formato de data inválido**\nPor favor digite uma data no formato **dd/mm/aaaa**")
                    .setColor(redColor)
                    
                    return await message.reply({embeds: [embed]});
                }
                else{
                    // Verify if the user has the Oracles Role
                    const raidOracles = guild.members.cache.get(userID).roles.cache.some(role => role.id == oraclesRoleID);
                    
                    if(raidOracles != true){
                        embed = embed
                        .setDescription("❌ Erro: **Membro não possui o cargo 'Oracles'.**\nAdicione o cargo primeiro para depois adicionar a data de entrada no clã.")
                        .setColor(redColor)

                        return await message.reply({embeds: [embed]});
                    }else{
                        // Connect to the database.
                        const db = new database();
                        db.connect();

                        // If the user is not on the db, insert it.
                        if(await User.findOne({discordID: userID}) == null)
                        {
                            // First time inserting to the database.
                            const newUser = await User.create({discordID: getMember[0].id, 
                                discordUser: getMember[0].user.username, 
                                nickname: getMember[0].nickname,
                                oracle: raidOracles,
                                status: null,
                                active: true,
                                joinDate: null
                                });
                        }
                        
                        // Update user join date.
                        const joinDate = moment(args[1], "DD/MM/YYYY").format("YYYY-MM-DD");
                        const date = await User.updateOne({discordID: userID}, {joinDate: joinDate});
                    }
                }
            }
        }
        console.log("Novo membro adicionado ao clã.");
        embed = embed
                .setDescription(`✅ A data de entrada do membro ${args[0]} foi atualizada com sucesso. \nData de entrada no clã: ${args[1]}`)
                .setColor(greenColor);

        await message.reply({embeds: [embed]});
    }
}