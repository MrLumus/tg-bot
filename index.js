// IMPORTS
const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");

// CONSTANTS
const token = "5601386337:AAFsYcpxif5Hhed_zx-Y7oMFqh-l1FkhQEo";
const bot = new TelegramApi(token, {polling: true});
const chats = {};

// Функция-обработичк начала игры
const startGame = async (chatId) => {
  await bot.sendMessage(chatId, "Сейчас я загадаю цифру от 0 до 9, а ты должен(на) отгадать ее!");
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  return bot.sendMessage(chatId, "Отгадывай!", gameOptions);
}

// Функция-обработчик запуска диалога с ботом
const start = () => {

  //Установка команд для бота
  bot.setMyCommands([
    {command: "/start", description: "Приветсвие"},
    {command: "/info", description: "Информация о пользователе"},
    {command: "/game", description: "Игра 'Угадай число'"},
  ]);

  // Обработка входящих боту сообщений
  bot.on("message", async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const from = msg.from;
    
    // Проверка сообщений на команды
    switch(text){
      case "/start": {
        await bot.sendSticker(chatId, "https://tlgrm.eu/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/11.webp")
        await bot.sendMessage(chatId, `Привет, ${from.username}! Ты готов(а)?`);
      };
      case "/info": {
        return bot.sendMessage(chatId, `Тебя зовут: ${from.first_name} ${from.last_name}`);
      };
      case "/game": {
        startGame(chatId);
      };
      default: 
        return bot.sendMessage(chatId, "Извини, я тебя не понимаю, попробуй еще раз");
    }
  });

  // Обработка нажатия кнопок-действий
  bot.on("callback_query", async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    // Проверка кнопок на команды и цифры
    switch (data){
      case "/again": {
        return startGame(chatId);
      }
      case String(chats[chatId]): {
        return bot.sendMessage(chatId, "Поздравляю, ты отгадал(а) цифру!", againOptions)
      }
      default: {
        return bot.sendMessage(chatId, `Ты выбрал(а) цифру ${data}, это неверно :(\nЯ загадал цифру ${chats[chatId]}`, againOptions);
      }
    }
  });
};

// Запуск бота
start();
