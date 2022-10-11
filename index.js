// IMPORTS
const TelegramApi = require("node-telegram-bot-api");

const { commandOptions, gameOptions, againOptions } = require("./options");
const sequelize = require("./db");
const UserModel = require("./models");

// CONSTANTS
const token = "5601386337:AAFsYcpxif5Hhed_zx-Y7oMFqh-l1FkhQEo";
const bot = new TelegramApi(token, {polling: true});
const chats = {};

// Функция-обработичк начала игры (команда /game)
const startGame = async (chatId) => {
  await bot.sendMessage(chatId, "Сейчас я загадаю цифру от 0 до 9, а ты должен(на) отгадать ее!");
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  return bot.sendMessage(chatId, "Отгадывай!", gameOptions);
};
// Функция-обработичк для получения инфо об игроке (команда /info)
const getInfo = async (chatId, from) => {
  const user = await UserModel.findOne({chatId});
  return bot.sendMessage(chatId, `Тебя зовут - ${from.first_name} ${from.last_name}.\nПравильных ответов - ${user.right}\nНеправильных ответов - ${user.wrong}`, commandOptions);
};
// Функция-обработичк на команду /start
const onStart = async (chatId, from) => {
  if (!UserModel.findOne({chatId})){
    await UserModel.create({chatId});
  }
  await bot.sendMessage(chatId, `Привет, ${from.username}! Ты готов(а)?`, commandOptions);
}

// Функция-обработчик запуска диалога с ботом
const start = async () => {

  try {
    await sequelize.authenticate();
    await sequelize.sync();
  }
  catch (e) {
    console.log("Ошибка подключения к БД", e)
  }

  //Установка команд для бота
  bot.setMyCommands(commandOptions);

  // Обработка входящих боту сообщений
  bot.on("message", async msg => {

    // Получение информации о пользователе
    const text = msg.text;
    const chatId = msg.chat.id;
    const from = msg.from;
    
    try {
      await bot.sendSticker(chatId, "https://tlgrm.eu/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/11.webp")
      // Проверка сообщений на команды
      switch(text){
        case "/start": {
          return onStart(chatId, from);
        };
        case "/info": {
          return getInfo(chatId, from);
        };
        case "/game": {
          return startGame(chatId);
        };
        default: 
          return bot.sendMessage(chatId, "Извини, я тебя не понимаю, попробуй еще раз", commandOptions);
      }
    }
    catch (e) {
      return bot.sendMessage(chatId, `Произошла какая-то ошибка :(\nУже исправляю`, commandOptions)
    }
  });

  // Обработка нажатия кнопок-действий
  bot.on("callback_query", async msg => {

    //Получение информации о пользователе
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const from = msg.from;

    //Получение информации о пользователе из БД
    const user = await UserModel.findOne({chatId});

    // Проверка кнопок на команды и цифры
    switch (data){
      case "/start": {
        return onStart(chatId, from);
      }
      case "/info": {
        return getInfo(chatId, from);
      }
      case "/game": {
        return startGame(chatId);
      }
      case String(chats[chatId]): {
        user.right += 1;
        await bot.sendMessage(chatId, "Поздравляю, ты отгадал(а) цифру!", againOptions);
        break;
      }
      case "/again": {
        return startGame(chatId);
      }
      default: {
        user.wrong += 1;
        await bot.sendMessage(chatId, `Ты выбрал(а) цифру ${data}, это неверно :(\nЯ загадал цифру ${chats[chatId]}`, againOptions);
        break;
      }
    }
    await user.save();
  });
};

// Запуск бота
start();
