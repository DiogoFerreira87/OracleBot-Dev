const { dayOfWeek } = require("../util/functions");
const { validateTime } = require("../util/functions");
const { validateDate } = require("../util/functions");
const { MessageEmbed, MessageComponentInteraction, CommandInteractionOptionResolver } = require("discord.js");
const { capitalizeFirstLetter } = require("../util/functions");
const moment = require("moment");
//----------------------------------------------
const database = require("../config/database");
const Grid = require("../models/Grid");
//----------------------------------------------

const nightfall = [
  { name: "Anoitecer Normal", value: "Anoitecer Normal" },
  { name: "100k", value: "100k" },
  { name: "GM", value: "GM" },
];

const run = async (client, interaction) => {
  // Atividades:
  let nightfall = interaction.options.getString("anoitecer");
  let dia = interaction.options.getString("dia");
  let hora = interaction.options.getString("hora");
  let descricao = interaction.options.getString("descricao");

  // Verificar config da data
  if (validateDate(dia) == false) {
    // If it is not a date in the format DD/MM or DD/MM/YYYY
    dia = capitalizeFirstLetter(dia); // Verifi if it is "Hoje"
    if (dia != "Hoje") {
      return await interaction.reply({
        content:
          "❌ Erro: **Formato de data inválido** - Por favor digite **'Hoje'** ou uma data no formato (**dd/mm** ou **dd/mm/aaaa**)",
        ephemeral: true,
      }); 
    } else {
      dia = new Date(); // Today
      dia = moment(dia, "DD/MM/YYYY").format("DD/MM/YYYY") + " " + hora;
    }
  } else {
    dia = moment(dia, "DD/MM/YYYY").format("DD/MM/YYYY") + " " + hora; // If it is all good, format the correct date.
  }

  // Verificar config hora
  let horaFormatada;
  let newHora;
  let diaHora = moment(new Date()).format('DD/MM/YYYY'); // Today

  if (capitalizeFirstLetter(hora) == "Agora") {
    if (moment(diaHora, "DD/MM/YYYY").format("DD/MM/YYYY") != moment(dia, "DD/MM/YYYY").format("DD/MM/YYYY")) {
      return await interaction.reply({
        content:
          "❌ Erro: **Data e hora inconsistentes** - Não é possível criar uma grade para 'agora' em uma data futura.",
        ephemeral: true,
      });
    }

    horaFormatada = "Assim que fechar...";
    newHora = "Agora";
  } else {
    if (validateTime(hora) == false) {
      return await interaction.reply({
        content:
          "❌ Erro: **Formato de hora inválido** - Por favor, digite 'Agora' ou use o formato **hh:mm**. Ex: 15:00, 17:30, 20:45.",
        ephemeral: true,
      });
    } else {
      horaFormatada = moment(dia, "DD/MM HH:mm").format("HH:mm");

      // Thread formatted hour
      if (hora.includes(":00")) {
        newHora = `${hora.replace(":", "h").substring(0, hora.length -2)}`;

      } else {
        newHora = `${hora.replace(":", "h")}`;
      }
    }
  }

  // Format the date
  let diaFormatado = moment(dia, "DD/MM HH:mm").format("DD/MM");
  let diaSemana = dayOfWeek(moment(dia, "DD/MM/YYYY").format("DD/MM/YYYY"));

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

  // --------------------------------------------------------------------------------------//
  // Connect to the database.
  const db = new database();
  db.connect();

  let createdDate = moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate();
  
  let nightfallType = "Anoitecer";
  let grid;
  let gridID;
  diaHora = diaHora.toLocaleString();

  if ((await Grid.findOne({ type: nightfallType })) == null) {
    // First time inserting to the database.
    gridID = 1; // First ID

    const newGrid = Grid.create({
      gridID: gridID,
      type: nightfallType,
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
  else {

    // Get the next grid id to persist
    grid = (await Grid.find({type: nightfallType}).sort({gridID: -1}).limit(1));
    gridID = (grid[0].gridID) + 1; // Next ID

    const newGrid = Grid.create({
      gridID: gridID,
      type: nightfallType,
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

  // Threads created only on this channel
  let channel = client.channels.cache.get(process.env.GRIDS_CHANNEL);

  // Create the thread
  const thread = await channel.threads.create({
    name: `${nightfall} - ${diaSemana} ${newHora}`,
    autoArchiveDuration: 1440,
  });

  let nightfallImage;
  let nightfallColor;
  switch (nightfall) {
    case "Anoitecer Normal":
      nightfallImage = "https://live.staticflickr.com/65535/52328022305_f8678ff937_b.jpg";
      nightfallColor = "#ff0000";
      nightfallTitle = "Anoitecer Normal";
      break;
    case "100k":
      nightfallImage = "https://live.staticflickr.com/65535/52327601226_24c90211ed_b.jpg";
      nightfallColor = "#93ae73";
      nightfallTitle = "Anoitecer 100k";
      break;
    case "GM":
      nightfallImage = "https://live.staticflickr.com/65535/52326646562_fc08ea094a_b.jpg";
      nightfallColor = "#d2e5f1";
      nightfallTitle = "Anoitecer Grão-Mestre";
      break;
  }

  // ----------------------------------------------------------------

  const exampleEmbed = new MessageEmbed()
    .setColor(nightfallColor)
    .setImage(nightfallImage)
    .setTitle(
      "\n---------------------------------------------\n" + "#"+ gridID + " - " + nightfallTitle + "\n---------------------------------------------"
    )
    //.setURL('https://discord.js.org/')
    //.setAuthor({ name: 'nightfall Oracles'});//, iconURL: 'https://i.imgur.com/GX7G6BM.png'})//, url: 'https://discord.js.org' })
    .setAuthor({ name: `${user}`, iconURL: `${avatar}` })
    .setDescription(gradeHeader)
    .setThumbnail("https://live.staticflickr.com/65535/52327601186_122e3f4321_o.png")
    .addFields(
      { name: "🎮 Jogadores (1/3)", value: `<@${userID}>` },
      { name: "👥 Reservas (0)", value: "Nenhum" }
    )
    .setTimestamp()
    .setFooter({ text: "Anoitecer - Reaja à mensagem para entrar na lista." }); //, iconURL: 'https://i.imgur.com/GX7G6BM.png' });

  // React to the message
  // Orales role 961267518775918662
  // Test Role 965910989885296680
  thread.send({content: "<@&965910989885296680>", embeds: [exampleEmbed] }).then((embedMessage) => {
    embedMessage.react("☑️"), embedMessage.react("👥");
  });

  await interaction.reply({
    content: "Grade criada com sucesso!!",
    ephemeral: true,
  });
};

// https://github.com/discord/discord-api-docs/issues/2438 VERIFICAR ISSO AQUI

module.exports = {
  name: "abrir_anoitecer",
  description: "Criar uma grade!",
  //perm: "MODERATE_MEMBERS",
  // https://discordjs.guide/interactions/slash-commands.html#option-types // Option-Types
  options: [
    {
      name: "anoitecer",
      description: "Qual anoitecer?",
      type: "SUB_COMMAND",
      type: "STRING",
      value: "anoitecer",
      required: true,
      choices: nightfall,
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
      description: "Descrição da atividade da grade. Ex.: GM Lâmina da Luz, Traficante de Armas...",
      type: "STRING",
      required: true,
    },
  ],
  run,
};
