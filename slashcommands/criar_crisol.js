const { dayOfWeek } = require("../util/functions");
const { validateTime } = require("../util/functions");
const { validateDate } = require("../util/functions");
const { MessageEmbed, MessageComponentInteraction } = require("discord.js");
const { capitalizeFirstLetter } = require("../util/functions");
const moment = require("moment");
const { numberOfPlayers } = require("../util/functions");
//----------------------------------------------
const database = require("../config/database");
const Grid = require("../models/Grid");
//----------------------------------------------

const crucible = [
  { name: "Controle", value: "Controle" },
  { name: "Competitivo", value: "Competitivo" },
  { name: "Osíris", value: "Osíris" },
  { name: "Bandeira de Ferro", value: "Bandeira" },
  { name: "Partida Privada", value: "Privada" },
];

const run = async (client, interaction) => {
  // Atividades:
  let crucible = interaction.options.getString("crisol");
  let dia = interaction.options.getString("dia");
  let hora = interaction.options.getString("hora");
  let descricao = interaction.options.getString("descricao");

  // Verificar config da data
  if (validateDate(dia) == false) { // If it is not a date in the format DD/MM or DD/MM/YYYY
    dia = capitalizeFirstLetter(dia); // Verifi if it is "Hoje"
    if (dia != "Hoje") {
      return await interaction.reply({
        content:
          "❌ Erro: **Formato de data inválido** - Por favor digite **'Hoje'** ou uma data no formato (**dd/mm** ou **dd/mm/aaaa**)",
        ephemeral: true
      });
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
  let diaHora = moment(new Date()).format('DD/MM/YYYY'); // Today

  if(capitalizeFirstLetter(hora) == "Agora"){
    if(moment(diaHora,"DD/MM/YYYY").format("DD/MM/YYYY") != moment(dia,"DD/MM/YYYY").format("DD/MM/YYYY")) {
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
  let user;
  if(interaction.member.nickname == null){
    user = interaction.member.user.username
  } else {
    user = interaction.member.nickname;
  }
  let userID = interaction.member.id;
  let avatar = interaction.user.displayAvatarURL();

  // Format the description
  descricao = capitalizeFirstLetter(descricao);

  // Header novo
  const gradeHeader = `**Dia:** ${diaFormatado} (${diaSemana})\n**Hora:** ${horaFormatada}\n**Obs.:** ${descricao}
  ----------------------------------------------------`;

  // Threads created only on this channel
  let channel = client.channels.cache.get(process.env.GRIDS_CHANNEL);

  // Create the thread
  const thread = await channel.threads.create({
    name: `${crucible} - ${diaSemana} ${newHora}`,
    autoArchiveDuration: 1440,
  });

  let crucibleImage;
  let crucibleColor;
  let crucibleThumbnail;
  let crucibleFooter;
  let players;
  switch (crucible) {
    case "Controle":
      crucibleImage = "https://live.staticflickr.com/65535/52327844443_6968ac2cbb_o.png";
      crucibleColor = "#ff0000";
      crucibleTitle = "Controle";
      crucibleThumbnail = "https://live.staticflickr.com/65535/52327844398_680ac5d28e_o.png";
      crucibleFooter = "Controle"
      players = numberOfPlayers(crucibleFooter)
      break;
    case "Competitivo":
      crucibleImage = "https://live.staticflickr.com/65535/52327897449_5aa49da92c_o.png";
      crucibleColor = "#ff0037";
      crucibleTitle = "Competitivo";
      crucibleThumbnail = "https://live.staticflickr.com/65535/52327844398_680ac5d28e_o.png";
      crucibleFooter = "Competitivo"
      players = numberOfPlayers(crucibleFooter)
      break;
    case "Osíris":
      crucibleImage = "https://live.staticflickr.com/65535/52327897359_b54eccd8c4_o.png";
      crucibleColor = "#ffb700";
      crucibleTitle = "Desafios de Osíris";
      crucibleThumbnail = "https://live.staticflickr.com/65535/52328022755_b79af49163_o.png";
      crucibleFooter = "Osíris"
      players = numberOfPlayers(crucibleFooter)
      break;
    case "Bandeira":
      crucibleImage = "https://live.staticflickr.com/65535/52326647212_323838d782_o.png";
      crucibleColor = "#007036";
      crucibleTitle = "Bandeira de Ferro";
      crucibleThumbnail = "https://live.staticflickr.com/65535/52328022750_0891ba1a16_o.png";
      crucibleFooter = "Bandeira"
      players = numberOfPlayers(crucibleFooter)
      break;
    case "Privada":
      crucibleImage = "https://live.staticflickr.com/65535/52326647127_a22e62e7a2_o.png";
      crucibleColor = "#8400ff";
      crucibleTitle = "Partida Privada";
      crucibleThumbnail = "https://live.staticflickr.com/65535/52327601666_059f67c51f_o.png";
      crucibleFooter = "Privada"
      players = numberOfPlayers(crucibleFooter)
      break;
  }

  // ----------------------------------------------------------------

  // --------------------------------------------------------------------------------------//
  // Connect to the database.
  const db = new database();
  db.connect();

  let createdDate = moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate();

  let crucibleType = crucibleFooter;
  let grid;
  let gridID;
  diaHora = diaHora.toLocaleString();

  if ((await Grid.findOne({ type: crucibleType })) == null) {
    // First time inserting to the database.
    gridID = 1; // First ID

    const newGrid = Grid.create({
      gridID: gridID,
      type: crucibleType,
      date: moment.utc(dia, "DD/MM/YYYY HH:mm").toDate(),
      description: descricao,
      userListID: 1,
      user: user,
      userID: userID,
      starter: true,
      queue: false,
      backup: false,
      quitter: false,
      createdDate: createdDate,
    });

  } else {

    // Get the next grid id to persist
    grid = (await Grid.find({type: crucibleType}).sort({_id:-1}).limit(1));
    gridID = (grid[0].gridID) + 1; // Next ID

    const newGrid = Grid.create({
      gridID: gridID,
      type: crucibleType,
      date: moment.utc(dia, "DD/MM/YYYY HH:mm").toDate(),
      description: descricao,
      userListID: 1,
      user: user,
      userID: userID,
      starter: true,
      queue: false,
      backup: false,
      quitter: false,
      createdDate: createdDate,
    });
  }
  // --------------------------------------------------------------------------------------//

  const exampleEmbed = new MessageEmbed()
    .setColor(crucibleColor)
    .setImage(crucibleImage)
    .setTitle(
      "\n---------------------------------------------\n" + "#"+ gridID + " - " + crucibleTitle + "\n---------------------------------------------"
    )
    //.setURL('https://discord.js.org/')
    //.setAuthor({ name: 'crucible Oracles'});//, iconURL: 'https://i.imgur.com/GX7G6BM.png'})//, url: 'https://discord.js.org' })
    .setAuthor({name: `${user}`,iconURL: `${avatar}`})
    .setDescription(gradeHeader)
    .setThumbnail(crucibleThumbnail)
    .addFields(
      { name: `🎮 Jogadores (1/${players})`, value: `<@${userID}>` },
      { name: "👥 Reservas (0)", value: "Nenhum" }
    )
    .setTimestamp()
    .setFooter({ text: `${crucibleFooter} - Reaja à mensagem para entrar na lista.` }); //, iconURL: 'https://i.imgur.com/GX7G6BM.png' });

  // React to the message
  // Orales role
  thread.send({content: "<@&961267518775918662>", embeds: [exampleEmbed] }).then((embedMessage) => {
    embedMessage.react("☑️"), embedMessage.react("👥");
  });

  await interaction.reply({
    content: "Grade criada com sucesso!!",
    ephemeral: true,
  });
};

// https://github.com/discord/discord-api-docs/issues/2438 VERIFICAR ISSO AQUI
module.exports = {
  name: "abrir_crisol",
  description: "Criar uma grade!",
  //perm: "MODERATE_MEMBERS",
  // https://discordjs.guide/interactions/slash-commands.html#option-types // Option-Types
  options: [
    {
      name: "crisol",
      description: "Qual tipo de Crisol?",
      type: "SUB_COMMAND",
      type: "STRING",
      value: "crisol",
      required: true,
      choices: crucible,
    },
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
      description: "Descrição da atividade da grade. Ex.: 5.500 no comp, Tentar Farol, Fazer contratos...",
      type: "STRING",
      required: true,
    },
  ],
  run,
};
