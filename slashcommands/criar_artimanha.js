const { dayOfWeek } = require("../util/functions");
const { validateTime } = require("../util/functions");
const { validateDate } = require("../util/functions");
const { MessageEmbed, MessageComponentInteraction } = require("discord.js");
const { capitalizeFirstLetter } = require("../util/functions");
const moment = require("moment");

const run = async (client, interaction) => {
  // Atividades:
  let dia = interaction.options.getString("dia");
  let hora = interaction.options.getString("hora");
  let descricao = interaction.options.getString("descricao");

  // Verificar config da data
  if (validateDate(dia) == false) { // If it is not a date in the format DD/MM or DD/MM/YYYY
    dia = capitalizeFirstLetter(dia); // Verifi if it is "Hoje"
    if (dia != "Hoje") {
      return await interaction.reply({content:"❌ Erro: **Formato de data inválido** - Por favor digite **'Hoje'** ou uma data no formato (**dd/mm** ou **dd/mm/aaaa**)", ephemeral: true });
    } else{
      dia = new Date(); // Today
      dia = moment(dia,"DD/MM/YYYY").format("DD/MM/YYYY") + " " + hora;
    }
  }
  else{
    dia = moment(dia,"DD/MM/YYYY").format("DD/MM/YYYY") + " " + hora; // If it is all good, format the correct date.
  }

  // Verificar config hora
  let horaFormatada;
  let newHora;
  let diaHora = new Date(); // Today

  if(capitalizeFirstLetter(hora) == "Agora"){

    if(moment(diaHora,"DD/MM/YYYY").format("DD/MM/YYYY") != moment(dia,"DD/MM/YYYY").format("DD/MM/YYYY"))
    {
      return await interaction.reply({
        content:
          "❌ Erro: **Data e hora inconsistentes** - Não é possível criar uma grade para 'agora' em uma data futura.",
        ephemeral: true,
      });
    }

    horaFormatada = "Assim que fechar...";
    newHora = "Agora";
  } else{
    
    if (validateTime(hora) == false) {
      return await interaction.reply({
        content:
          "❌ Erro: **Formato de hora inválido** - Por favor, digite 'Agora' ou use o formato **hh:mm**. Ex: 15:00, 17:30, 20:45.",
        ephemeral: true,
      });
    } else{

      horaFormatada = moment(dia, "DD/MM HH:mm").format("HH:mm");

      // Thread formatted hour
      if (hora.includes(":00")) {
        newHora = `${hora.substring(0, 2)}h`;
      } else {
        newHora = `${hora.replace(":", "h")}`;
      }
    }
  }

  // Format the date
  let diaFormatado = moment(dia, "DD/MM HH:mm").format("DD/MM");
  let diaSemana = dayOfWeek(moment(dia,"DD/MM/YYYY").format("DD/MM/YYYY"));

  // Get interaction member
  let usuario = interaction.member.nickname;
  let avatar = interaction.user.displayAvatarURL();

  // Format the description
  descricao = capitalizeFirstLetter(descricao);

  // Header novo
  const gradeHeader = `**Dia:** ${diaFormatado} (${diaSemana})\n**Hora:** ${horaFormatada}\n**Obs.:** ${descricao}
--------------------------------------------------------`;

  // Threads created only on this channel
  let channel = client.channels.cache.get(process.env.GRIDS_CHANNEL);

  // Create the thread
  const thread = await channel.threads.create({
    name: `Artimanha - ${diaSemana} ${newHora}`,
    autoArchiveDuration: 1440,
  });

  let gambitImage = "https://live.staticflickr.com/65535/52328022545_641fb7ebc0_b.jpg";
  let gambitColor = "#004512";
  let gambitTitle = "Artimanha";

  // ----------------------------------------------------------------
  
  const exampleEmbed = new MessageEmbed()
    .setColor(gambitColor)
    .setImage(gambitImage)
    .setTitle(
      "\n------------------------------------------------\n" + gambitTitle + "\n------------------------------------------------"
    )
    //.setURL('https://discord.js.org/')
    //.setAuthor({ name: 'gambit Oracles'});//, iconURL: 'https://i.imgur.com/GX7G6BM.png'})//, url: 'https://discord.js.org' })
    .setAuthor({name: `${usuario}`,iconURL: `${avatar}`})
    .setDescription(gradeHeader)
    .setThumbnail("https://live.staticflickr.com/65535/52328022535_fb28ef74f6_o.png")
    .addFields(
      { name: "🎮 Jogadores (0/4)", value: "Nenhum jogador no momento..." },
      { name: "👥 Reservas (0)", value: "Nenhum" }
    )
    .setTimestamp()
    .setFooter({ text: "Artimanha - Reaja à mensagem para entrar na lista." }); //, iconURL: 'https://i.imgur.com/GX7G6BM.png' });

  // React to the message
  thread.send({ embeds: [exampleEmbed] }).then((embedMessage) => {
    embedMessage.react("☑️"), embedMessage.react("👥");
  });

  await interaction.reply({
    content: "Grade criada com sucesso!!",
    ephemeral: true,
  });
};
// https://github.com/discord/discord-api-docs/issues/2438 VERIFICAR ISSO AQUI
module.exports = {
  name: "abrir_artimanha",
  description: "Criar uma grade!",
  //perm: "MODERATE_MEMBERS",
  // https://discordjs.guide/interactions/slash-commands.html#option-types // Option-Types
  options: [
    {
      name: "dia",
      description: "Dia da atividade. Digite 'Hoje' ou uma data no formato (dd/mm ou dd/mm/aaaa)",
      type: "STRING",
      required: true,
    },
    {
      name: "hora",
      description: "Hora da atividade. Digite 'Agora' ou uma hora no formato (hh:mm). Ex.: 15:00, 17:30, 20:45",
      type: "STRING",
      required: true,
    },
    {
      name: "descricao",
      description: "Descrição da atividade da grade. Ex.: GM Lâmina da Luz, Traficante de Armas...",
      type: "STRING",
      required: true,
    },
  ],
  run,
};
