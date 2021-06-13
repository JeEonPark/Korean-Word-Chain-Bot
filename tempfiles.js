const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = '=';

const fs = require('fs');
const { resolve } = require('path');

client.commands = new Discord.Collection();

//봇이 제대로 시작되었을 경우 print
client.once('ready', async () => {
    console.log('AstroTranslator is Online!');
    client.user.setActivity("More Info, AstroJonny#0880");
});

//명령어
client.on('message', async message => {
    if (message.author.bot) return; //봇 일경우 리턴

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    var saying = message.content;
    console.log(message.author.username + " : " + saying);
    var whatLanguage = await checkLanguage(saying);
    if(whatLanguage == "ko"){
        var translated = await TranslateKRtoJP(saying);
        message.channel.send(`<@${message.author.id}>`+ " : " + translated);
    } else if(whatLanguage == "ja"){
        var translated = await TranslateJPtoKR(saying);
        message.channel.send(`<@${message.author.id}>` + " : " + translated);
    }
    var resu = await TranslateKRtoJP(saying);
    console.log(resu)

});

client.login(getConfig("discordKey"));

//config.json 파싱 메서드 configName은 ''로 감싸져야 됨
function getConfig(configName) {
    var dataBuffer = fs.readFileSync('./json/config.json');
    var dataJson = dataBuffer.toString();

    var data = JSON.parse(dataJson);
    return (data[configName]);

}

const checkLanguage = async (message) => { //들어온 메시지의 언어를 판별하는 객체
    return new Promise(function (resolve, reject) {
        var express = require('express');
        var app = express();
        var client_id = getConfig("NaverClientID");
        var client_secret = getConfig('NaverClientSecret');
        var query = message;

        var api_url = 'https://openapi.naver.com/v1/papago/detectLangs';
        var request = require('request');
        var options = {
            url: api_url,
            form: { 'query': query },
            headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
        };
        var result;
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var parEntire = response.body;
                var par = JSON.parse(parEntire);
                result = par['langCode'];
                resolve(result);
            } else {
                console.log('error = ' + response.statusCode);
            }
        });
    });
}

const TranslateKRtoJP = async (message) => {
    return new Promise(function (resolve, reject) {
        var express = require('express');
        var app = express();
        var client_id = getConfig("NaverClientID");
        var client_secret = getConfig('NaverClientSecret');
        var query = message;
        var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
        var request = require('request');
        var options = {
            url: api_url,
            form: { 'source': 'ko', 'target': 'ja', 'text': query },
            headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
        };
        var result
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var parEntire = response.body;
                var par = JSON.parse(parEntire);
                result1 = par["message"];
                result2 = result1['result'];
                result3 = result2['translatedText'];
                resolve(result3);
            } else {
                console.log('error = ' + response.statusCode);
            }
        });
    });
}

const TranslateJPtoKR = async (message) => {
    return new Promise(function (resolve, reject) {
        var express = require('express');
        var app = express();
        var client_id = getConfig("NaverClientID");
        var client_secret = getConfig('NaverClientSecret');
        var query = message;
        var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
        var request = require('request');
        var options = {
            url: api_url,
            form: { 'source': 'ja', 'target': 'ko', 'text': query },
            headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
        };
        var result
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var parEntire = response.body;
                var par = JSON.parse(parEntire);
                result1 = par["message"];
                result2 = result1['result'];
                result3 = result2['translatedText'];
                resolve(result3);
            } else {
                console.log('error = ' + response.statusCode);
            }
        });
    });
}