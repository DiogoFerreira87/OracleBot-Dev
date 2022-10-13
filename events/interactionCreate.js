const Discord = require("discord.js");

module.exports = {
	name: "interactionCreate",
	run: async (bot, interaction) => {
        const {client} = bot
		//if (!interaction.isCommand()) return
		//if (!interaction.inGuild()) return interaction.reply("This command can only be used in a guild")

		const slashcmd = client.slashcommands.get(interaction.commandName)
		
		if (!slashcmd) return

		let embed = new Discord.MessageEmbed();

		embed = embed
            .setDescription("❌ Erro: Você não tem permissão para usar esse comando.")
            .setColor('#ff0000')

		// check permissions
		if (slashcmd.perms && !interaction.member.permissions.has(slashcmd.perms))
			return interaction.reply({embeds: [embed]})

		slashcmd.run(client, interaction)
	},
}