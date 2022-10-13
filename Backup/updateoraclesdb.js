//----------------------------------------------
const Discord = require("discord.js");
require("dotenv").config();
const moment = require("moment");
//----------------------------------------------
const database = require("../config/database");
const User = require("../models/UsersProfile");
//----------------------------------------------
  
module.exports = {
    name:"updateoraclesdb",
    category: "info",
    permissions: ['ADMINISTRATOR'],
    devOnly: false,
    run: async ({client, message, args}) => {
        // Connect to the database.
        const db = new database();
        db.connect();

        // GuildID
        const guildId = process.env.GUILD_ID;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return console.error("Target guild not found");

        //Create Embed Message
        let embed = new Discord.MessageEmbed();

        // Roles definition:
        const oraclesRoleID = '961267518775918662';
        const veteranosRoleID = '965299911992164412';
        const membrosRoleID = '965300143110889493';
        const novatosRoleID = '965300197561344000';

        

        // Get all members, removing bots.
        let allMembers = guild.members.cache.filter(member => !member.user.bot && member.roles.cache.some(role => role.id)).map((m) => (m));
        
        // Updating message
        embed = embed
            .setDescription("🕑 Aguarde enquanto o bot atualiza a base de dados...\nEssa ação pode levar alguns minutos.")
            .setColor('#808080')
        await message.reply({embeds: [embed]})
       
        let status;
        let raidOracles;
        // If the collection does not exists, insert.
        if(await User.exists() == null){
            
            //Verify if it has the "Oracles" role.
            for (let i = 0; i < allMembers.length; i++) {
                if(allMembers[i].roles.cache.some(role => role.id === oraclesRoleID) == true){raidOracles = true}
                else{raidOracles = false}
                    
                switch (true) {
                    case (allMembers[i].roles.cache.some(role => role.id === veteranosRoleID) == true):
                    status = "[Veteranos]";
                    break;
                    case allMembers[i].roles.cache.some(role => role.id === membrosRoleID) == true:
                    status = "[Membros]";
                    break;
                    case allMembers[i].roles.cache.some(role => role.id === novatosRoleID) == true:
                    status = "[Novatos]";
                    break;
                    default: 
                    status = "[Outros]"
                }
                
                // First time inserting to the database.
                const newUser = await User.create({discordID: allMembers[i].id, 
                                                   discordUser: allMembers[i].user.username, 
                                                   nickname: allMembers[i].nickname,
                                                   oracle: raidOracles,
                                                   status: status,
                                                   active: true,
                                                   joinDate: null
                                                   });
            }
        } else{
            // Update all to false in case of somebody leaves the discord but was already in the DB.
            await User.updateMany({active: false})

            // Verify each user.
            for (let i = 0; i < allMembers.length; i++) {

            //Verify if it has the "Oracles" role.
            if(allMembers[i].roles.cache.some(role => role.id === oraclesRoleID) == true){raidOracles = true}
                else{raidOracles = false}
            
            switch (true) {
                case (allMembers[i].roles.cache.some(role => role.id === veteranosRoleID) == true):
                status = "[Veteranos]";
                break;
                case allMembers[i].roles.cache.some(role => role.id === membrosRoleID) == true:
                status = "[Membros]";
                break;
                case allMembers[i].roles.cache.some(role => role.id === novatosRoleID) == true:
                status = "[Novatos]";
                break;
                default: 
                status = "[Outros]"
            }

            // Case the ID is null, add, otherwise, update.
            if(await User.findOne({discordID: allMembers[i].id }).exec() == null){

                const newUser = await User.create({discordID: allMembers[i].id, 
                                                   discordUser: allMembers[i].user.username, 
                                                   nickname: allMembers[i].nickname,
                                                   oracle: raidOracles,
                                                   status: status,
                                                   active: true,
                                                   joinDate: null});
            }
            // Update
            else{
                const updateUsers = await User.updateOne({discordID: allMembers[i].id}, 
                                                    {$set: {discordUser: allMembers[i].user.username, 
                                                            nickname: allMembers[i].nickname, 
                                                            oracle: raidOracles,
                                                            status: status,
                                                            active: true}
                                                    });
            }
            }
        }

        console.log("Atualização concluída.");
        embed = embed
                .setDescription(`✅ Membros atualizados com sucesso!`)
                .setColor('#00FF00');

        await message.reply({embeds: [embed]});
    }
    
}