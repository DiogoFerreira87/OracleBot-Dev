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

const dungeon = [
  { name: "Pináculo da Sentinela", value: "Sentinela" },
  { name: "Domínio da Avareza", value: "Avareza" },
  { name: "Profecia", value: "Profecia" },
  { name: "Fosso da Heresia", value: "Fosso" },
  { name: "O Trono Estilhaçado", value: "Trono" },
  { name: "Dualidade", value: "Dualidade" },
];

const run = async (client, interaction) => {
  // Atividades:
  let dungeon = interaction.options.getString("masmorra");
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
          ephemeral: true,
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

  let dungeonType = "Masmorra";
  let grid;
  let gridID;
  diaHora = diaHora.toLocaleString();

  if ((await Grid.findOne({ type: dungeonType })) == null) {
    // First time inserting to the database.
    gridID = 1; // First ID

    const newGrid = Grid.create({
      gridID: gridID,
      type: dungeonType,
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
    grid = (await Grid.find({type: dungeonType}).sort({gridID: -1}).limit(1));
    gridID = (grid[0].gridID) + 1; // Next ID

    const newGrid = Grid.create({
      gridID: gridID,
      type: dungeonType,
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
    name: `${dungeon} - ${diaSemana} ${newHora}`,
    autoArchiveDuration: 1440,
  });

  let dungeonImage;
  let dungeonColor;
  switch (dungeon) {
    case "Sentinela":
      dungeonImage = "https://live.staticflickr.com/65535/52577701954_7d407c133a_o.png";
      dungeonColor = "#48a6ae";
      dungeonTitle = "Pináculo da Sentinela";
      dungeonThumbnail = "https://live.staticflickr.com/65535/52577869510_aace59b938_o.png";
      break;

    case "Avareza":
      dungeonImage = "https://live.staticflickr.com/65535/52328023315_988066a646_o.png";
      dungeonColor = "#48a6ae";
      dungeonTitle = "Domínio da Avareza";
      dungeonThumbnail = "https://live.staticflickr.com/65535/52328023310_8017890567_o.png";
      break;

    case "Profecia":
      dungeonImage = "https://live.staticflickr.com/65535/52327844898_fbd4d60bee_o.png";
      dungeonColor = "#cc3178";
      dungeonTitle = "Profecia";
      dungeonThumbnail = "https://live.staticflickr.com/65535/52327844893_c9827a8ed0_o.png";
      break;

    case "Fosso":
      dungeonImage = "https://live.staticflickr.com/65535/52327897914_4147c43486_o.png";
      dungeonColor = "#f28c0c";
      dungeonTitle = "Fosso da Heresia";
      dungeonThumbnail = "https://live.staticflickr.com/65535/52327897909_f41a85cbfe_o.png";
      break;

    case "Trono":
      dungeonImage = "https://live.staticflickr.com/65535/52327602096_cf54e77f99_o.png";
      dungeonColor = "#d2debb";
      dungeonTitle = "O Trono Estilhaçado";
      dungeonThumbnail = "https://live.staticflickr.com/65535/52326647542_e1c48810ec_o.png";
      break;
      
    case "Dualidade":
      dungeonImage = "https://live.staticflickr.com/65535/52327897974_5ced1248c8_o.png";
      dungeonColor = "#ff5900";
      dungeonTitle = "Dualidade";
      dungeonThumbnail = "https://live.staticflickr.com/65535/52327897934_eaf1e75c1a_o.png";
      break;
  }

  // ----------------------------------------------------------------

  const exampleEmbed = new MessageEmbed()
    .setColor(dungeonColor)
    .setImage(dungeonImage)
    .setTitle(
      "\n---------------------------------------------\n" + "#"+ gridID + " - " + dungeonTitle + "\n---------------------------------------------"
    )
    //.setURL('https://discord.js.org/')
    //.setAuthor({ name: 'dungeon Oracles'});//, iconURL: 'https://i.imgur.com/GX7G6BM.png'})//, url: 'https://discord.js.org' })
    .setAuthor({name: `${user}`,iconURL: `${avatar}`})
    .setDescription(gradeHeader)
    .setThumbnail(dungeonThumbnail)
    .addFields(
      { name: "🎮 Jogadores (1/3)", value: `<@${userID}>` },
      { name: "👥 Reservas (0)", value: "Nenhum" }
    )
    .setTimestamp()
    .setFooter({ text: "Masmorra - Reaja à mensagem para entrar na lista." }); //, iconURL: 'https://i.imgur.com/GX7G6BM.png' });

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
  name: "abrir_masmorra",
  description: "Criar uma grade!",
  //perm: "MODERATE_MEMBERS",
  // https://discordjs.guide/interactions/slash-commands.html#option-types // Option-Types
  options: [
    {
      name: "masmorra",
      description: "Qual masmorra?",
      type: "SUB_COMMAND",
      type: "STRING",
      value: "masmorra",
      required: true,
      choices: dungeon,
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
      description: "Descrição da atividade da grade. Ex.: Farmar o boss, Loot run...",
      type: "STRING",
      required: true,
    },
  ],
  run,
};
