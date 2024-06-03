const { dayOfWeek } = require("../util/functions");
const { validateTime } = require("../util/functions");
const { validateDate } = require("../util/functions");
const { MessageEmbed, MessageComponentInteraction } = require("discord.js");
const { capitalizeFirstLetter } = require("../util/functions");
const moment = require("moment");
//----------------------------------------------
const database = require("../config/database");
const Grid = require("../models/Grid");
//----------------------------------------------

const raids = [
  //{ name: "NOVA RAID", value: "NOVA RAID" },
  { name: "Panteão", value: "Panteão" },
  { name: "O Fim de Crota - MESTRE", value: "Crota Mestre" },
  { name: "O Fim de Crota", value: "Crota" },
  { name: "Raiz dos Pesadelos - MESTRE", value: "RdP Mestre" },
  { name: "Raiz dos Pesadelos", value: "RdP" },
  { name: "A Queda do Rei - MESTRE", value: "QdR Mestre" },
  { name: "A Queda do Rei", value: "Queda do Rei" },
  { name: "Voto do Discípulo - MESTRE", value: "VoD Mestre" },
  { name: "Voto do Discípulo", value: "VoD" },
  { name: "Câmara de Cristal - MESTRE", value: "VoG Mestre" },
  { name: "Câmara de Cristal", value: "VoG" },
  { name: "Cripta da Pedra Profunda", value: "Cripta" },
  { name: "Jardim da Salvação", value: "Jardim" },
  { name: "Último Desejo", value: "Último Desejo" },
];

const run = async (client, interaction) => {
  // Atividades:
  let raid = interaction.options.getString("raid");
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
  let diaHora = moment(new Date()).format('DD/MM/YYYY'); // Today

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
        newHora = `${hora.replace(":", "h").substring(0, hora.length -2)}`;
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
  // --------------------------------------------------------------------------------------//
  // Connect to the database.
  const db = new database();
  db.connect();

  let createdDate = moment.utc(diaHora, "DD/MM/YYYY HH:mm:ss").toDate();

  let raidType = "Raid";
  let grid;
  let gridID;
  diaHora = diaHora.toLocaleString();

  if ((await Grid.findOne({ type: raidType })) == null) {
    // First time inserting to the database.
    gridID = 1; // First ID

    const newGrid = Grid.create({
      gridID: gridID,
      type: raidType,
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
    grid = (await Grid.find({type: raidType}).sort({gridID: -1}).limit(1));
    gridID = (grid[0].gridID) + 1; // Next ID

    const newGrid = Grid.create({
      gridID: gridID,
      type: raidType,
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
    name: `${raid} - ${diaSemana} ${newHora}`,
    autoArchiveDuration: 1440,
  });

  let raidImage;
  let raidColor;
  switch (raid) {
    // case "NOVA RAID":
    //   raidImage = "https://i.imgur.com/viX0Ivl.png";
    //   raidColor = "#025926";
    //   raidTitle = "O fim de Crota - Mestre";
    //   break;
    case "Panteão":
      raidImage = "https://i.imgur.com/heUSeVk.png";
      raidColor = "#590202";
      raidTitle = "Panteão";
      break;
    case "Crota Mestre":
      raidImage = "https://i.imgur.com/viX0Ivl.png";
      raidColor = "#025926";
      raidTitle = "O fim de Crota - Mestre";
      break;
    case "Crota":
      raidImage = "https://i.imgur.com/9i9aDlO.png";
      raidColor = "#0bba54";
      raidTitle = "O fim de Crota";
      break;
    case "RdP Mestre":
      raidImage = "https://i.imgur.com/PQcEtVg.png";
      raidColor = "#7c00bf";
      raidTitle = "Raiz dos Pesadelos - Mestre";
      break;
    case "RdP":
      raidImage = "https://i.imgur.com/nzOzy8u.png";
      raidColor = "#bf0096";
      raidTitle = "Raiz dos Pesadelos";
      break;
    case "QdR Mestre":
      raidImage = "https://i.imgur.com/DAiUTGN.png";
      raidColor = "#6d00ba";
      raidTitle = "A Queda do Rei - Mestre";
      break;
    case "Queda do Rei":
      raidImage = "https://i.imgur.com/DGIPC8D.png";
      raidColor = "#ff0000";
      raidTitle = "A Queda do Rei";
      break;
    case "VoD Mestre":
      raidImage = "https://i.imgur.com/gG62qGQ.png";
      raidColor = "#ff0000";
      raidTitle = "Voto do Discípulo - Mestre";
      break;
    case "VoD":
      raidImage = "https://i.imgur.com/vwGog57.png";
      raidColor = "#93ae73";
      raidTitle = "Voto do Discípulo - Normal";
      break;
    case "VoG Mestre":
      raidImage = "https://i.imgur.com/4uVNqyS.png";
      raidColor = "#d2e5f1";
      raidTitle = "Câmara de Cristal - Mestre";
      break;
    case "VoG":
      raidImage = "https://i.imgur.com/jKB2yeL.png";
      raidColor = "#d6c31e";
      raidTitle = "Câmara de Cristal - Normal";
      break;
    case "Cripta":
      raidImage = "https://i.imgur.com/BcVPYxp.png";
      raidColor = "#b0cddf";
      raidTitle = "Cripta da Pedra Profunda";
      break;
    case "Jardim":
      raidImage = "https://i.imgur.com/0RLUTGg.png";
      raidColor = "#334136";
      raidTitle = "Jardim da Salvação";
      break;
    case "Último Desejo":
      raidImage = "https://i.imgur.com/g7CkEu0.png";
      raidColor = "#4b8e83";
      raidTitle = "Último Desejo";
      break;
  }

  // ----------------------------------------------------------------

  const exampleEmbed = new MessageEmbed()
    .setColor(raidColor)
    .setImage(raidImage)
    .setTitle(
      "\n---------------------------------------------\n" + "#"+ gridID + " - " + raidTitle + "\n---------------------------------------------"
    )
    //.setURL('https://discord.js.org/')
    //.setAuthor({ name: 'Raid Oracles'});//, iconURL: 'https://i.imgur.com/GX7G6BM.png'})//, url: 'https://discord.js.org' })
    .setAuthor({name: `${user}`,iconURL: `${avatar}`})
    .setDescription(gradeHeader)
    .setThumbnail("https://i.imgur.com/GX7G6BM.png?2")
    .addFields(
      { name: "🎮 Jogadores (1/6)", value: `<@${userID}>` },
      { name: "👥 Reservas (0)", value: "Nenhum" }
    )
    .setTimestamp()
    .setFooter({ text: "Raid - Reaja à mensagem para entrar na lista." }); //, iconURL: 'https://i.imgur.com/GX7G6BM.png' });

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
  name: "criar_raid",
  description: "Criar uma grade!",
  //perm: "MODERATE_MEMBERS",
  // https://discordjs.guide/interactions/slash-commands.html#option-types // Option-Types
  options: [
    {
      name: "raid",
      description: "Qual RAID?",
      type: "SUB_COMMAND",
      type: "STRING",
      value: "raid",
      required: true,
      choices: raids,
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
      description: "Descrição da atividade da grade. Ex.: Loot run,  Sem morrer, Todos com a mesma classe...",
      type: "STRING",
      required: true,
    },
  ],
  run,
};
