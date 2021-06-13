const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = 'l!';

const fs = require('fs');
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

//봇이 제대로 시작되었을 경우 print
client.once('ready', async () => {
    console.log('ShiritoriKR is Online!');
    client.user.setActivity("l!help, AstroJonny#0880");
});

//명령어
client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return; //prefix로 시작하지 않거나 봇 일경우 리턴

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    //lists
    if(command === 'start') {
        client.commands.get('start').execute(message, args, Discord, client);
    }

});

client.login(getConfig("discordKey"));

//config.json 파싱 메서드 configName은 ''로 감싸져야 됨
function getConfig(configName) {
    var dataBuffer = fs.readFileSync('./json/config.json');
    var dataJson = dataBuffer.toString();

    var data = JSON.parse(dataJson);
    return (data[configName]);

}