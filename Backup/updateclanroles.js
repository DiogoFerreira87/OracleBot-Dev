//----------------------------------------------
const Discord = require("discord.js");
require("dotenv").config();
const moment = require("moment");
//----------------------------------------------
const database = require("../config/database");
const User = require("../models/UsersProfile");
//----------------------------------------------
  
module.exports = {
    name:"updateclanroles",
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

        // Message definition:
        let removed;
        let added;
        let color;

        

        // Get all members, removing bots.
        let allMembers = guild.members.cache.filter(member => !member.user.bot && member.roles.cache.some(role => role.id === oraclesRoleID)).map((m) => (m));
        
        var user;
        var date;
        var days;
        var role;

        for (let i = 0; i < allMembers.length; i++) {
            
            user = await User.findOne({discordID: {$eq: allMembers[i].id}}).exec();
            date = moment(user.joinDate).format("YYYY-MM-DD")
            days = moment().diff(date, 'days');
            color = '#00FF00'
            switch (true) {
                case (days < 90):
                    switch (true) {
                        case (allMembers[i].roles.cache.some(role => role.id === membrosRoleID) == true):
                            await allMembers[i].roles.remove(membrosRoleID);
                            removed = `❌ O cargo <@&${membrosRoleID}> foi removido do membro <@${allMembers[i].id}>`;

                            await allMembers[i].roles.add(novatosRoleID);
                            added = `✅ O cargo <@&${novatosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;

                            embed = embed
                            .setDescription(removed + '\n\n' + added)
                            .setColor(color)

                            await message.reply({embeds: [embed]})
                            break;

                        case (allMembers[i].roles.cache.some(role => role.id === veteranosRoleID) == true):
                            await allMembers[i].roles.remove(veteranosRoleID);
                            removed = `❌ O cargo <@&${veteranosRoleID}> foi removido do membro <@${allMembers[i].id}>`;

                            await allMembers[i].roles.add(novatosRoleID);
                            added = `✅ O cargo <@&${novatosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;

                            embed = embed
                            .setDescription(removed + '\n\n' + added)
                            .setColor(color)

                            await message.reply({embeds: [embed]})
                            break;

                        case (allMembers[i].roles.cache.some(role => role.id === novatosRoleID) == false):
                            await allMembers[i].roles.add(novatosRoleID);
                            added = `✅ O cargo <@&${novatosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;
                            embed = embed
                            .setDescription(added)
                            .setColor(color)
                            
                            await message.reply({embeds: [embed]})
                            break;
                    }
                    role = '[Novatos]'
                    break;

                case (days >= 90 && days <= 270):
                    switch (true) {
                        case (allMembers[i].roles.cache.some(role => role.id === novatosRoleID) == true):
                            await allMembers[i].roles.remove(novatosRoleID);
                            removed = `❌ O cargo <@&${novatosRoleID}> foi removido do membro <@${allMembers[i].id}>`;

                            await allMembers[i].roles.add(membrosRoleID);
                            added = `✅ O cargo <@&${membrosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;

                            embed = embed
                            .setDescription(removed + '\n\n' + added)
                            .setColor(color)

                            await message.reply({embeds: [embed]})
                            break;

                        case (allMembers[i].roles.cache.some(role => role.id === veteranosRoleID) == true):
                            await allMembers[i].roles.remove(veteranosRoleID);
                            removed = `❌ O cargo <@&${veteranosRoleID}> foi removido do membro <@${allMembers[i].id}>`;

                            await allMembers[i].roles.add(membrosRoleID);
                            added = `✅ O cargo <@&${membrosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;

                            embed = embed
                            .setDescription(removed + '\n\n' + added)
                            .setColor(color)

                            await message.reply({embeds: [embed]})
                            break;

                        case (allMembers[i].roles.cache.some(role => role.id === membrosRoleID) == false):
                            await allMembers[i].roles.add(membrosRoleID);
                            added = `✅ O cargo <@&${membrosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;

                            embed = embed
                            .setDescription(added)
                            .setColor(color)

                            await message.reply({embeds: [embed]})
                            break;
                    }
                    role = '[Membros]'
                    break;

                case (days > 270):
                    switch (true) {
                        case (allMembers[i].roles.cache.some(role => role.id === membrosRoleID) == true):
                            await allMembers[i].roles.remove(membrosRoleID);
                            removed = `❌ O cargo <@&${membrosRoleID}> foi removido do membro <@${allMembers[i].id}>`;

                            await allMembers[i].roles.add(veteranosRoleID);
                            added = `✅ O cargo <@&${veteranosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;
                            
                            embed = embed
                            .setDescription(removed + '\n\n' + added)
                            .setColor(color)

                            await message.reply({embeds: [embed]})
                            break;
                        
                        case (allMembers[i].roles.cache.some(role => role.id === novatosRoleID) == true):
                            await allMembers[i].roles.remove(novatosRoleID);
                            removed = `❌ O cargo <@&${novatosRoleID}> foi removido do membro <@${allMembers[i].id}>`;

                            await allMembers[i].roles.add(veteranosRoleID);
                            added = `✅ O cargo <@&${veteranosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;

                            embed = embed
                            .setDescription(removed + '\n\n' + added)
                            .setColor(color)

                            await message.reply({embeds: [embed]})
                            break;

                        case (allMembers[i].roles.cache.some(role => role.id === veteranosRoleID) == false):
                            await allMembers[i].roles.add(veteranosRoleID);
                            added = `✅ O cargo <@&${veteranosRoleID}> foi concedido ao membro <@${allMembers[i].id}>`;

                            embed = embed
                            .setDescription(added)
                            .setColor(color)

                            await message.reply({embeds: [embed]})
                            break;
                    }
                    role = '[Veteranos]'
                    break;
            }
        }
        
        console.log("Atualização concluída.");
        embed = embed
                .setDescription(`✅ Atualização concluída.`)
                .setColor(color)

        await message.reply({embeds: [embed]})
    }
    
}