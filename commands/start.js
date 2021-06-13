const { MessageAttachment } = require("discord.js");
const fs = require('fs');

module.exports = {
    name: 'start',
    description: "Starting Shiritori",
    execute(message, args, Discord, client) {
        message.channel.send("끝말잇기를 시작합니다. 첫 번째 단어를 입력해주세요.");
        let isitFirst = true;
        let correctedWords = "";
        //단어 받기
        client.on('message', async message => {
            if (message.author.bot) return;
            const msg = message.content;

            let isitCorrect = true;

            if (msg.length == 1) {
                //한 글자가 들어왔을 경우
                isitCorrect = false;
                message.channel.send("두 글자 이상의 단어를 입력해주세요!");
            } else {
                if (isitFirst) {
                    //처음 경우일 경우
                    isitFirst = false;
                    isitCorrect = true;
                } else if (correctedWords.charAt(correctedWords.length - 1) != msg.charAt(0)) {
                    //끝 단어와 다음 단어가 같지 않을 경우
                    if (false) {
                        //두음법칙 조건에 부합한 경우
                        isitCorrect = true;
                    } else {
                        //두음법칙 조건에 부합하지 않은 경우
                        isitCorrect = false;
                        message.channel.send("'" + correctedWords.charAt(correctedWords.length - 1) + "' (으)로 시작하는 단어로 입력해주세요!");
                    }
                } else if (correctedWords.charAt(correctedWords.length - 1) == msg.charAt(0)) {
                    //끝 단어와 다음 단어가 같을 경우
                    isitCorrect = true;
                }

            }

            //위 조건에 부합할 경우 실행
            if (isitCorrect) {
                let finalData = await isitExist(msg);
                if (finalData == "false") {
                    message.channel.send("국어사전에 존재하지 않는 단어입니다! 다시 입력해주세요!");
                } else {
                    if (finalData != "명사") {
                        message.channel.send("명사로만 입력할 수 있습니다! 다시 입력해주세요!");
                    } else {
                        //모든게 정답
                        correctedWords = msg;
                        const newEmbed = new Discord.MessageEmbed()
                            .setColor('#7cfc00')
                            .addFields(
                                { name: `${message.author.username} said`, value: `${correctedWords}` },
                                { name: 'It means', value: '.' },
                                { name: 'Next word Starts with', value: `${correctedWords.charAt(correctedWords.length - 1)}` }
                            )
                            .setFooter('Next!', 'https://discord.com/assets/6f26ddd1bf59740c536d2274bb834a05.png');

                        message.channel.send(newEmbed);
                    }
                }

            }

        });

    }
}

//config.json 파싱 메서드 configName은 ''로 감싸져야 됨
function getConfig(configName) {
    var dataBuffer = fs.readFileSync('./json/config.json');
    var dataJson = dataBuffer.toString();

    var data = JSON.parse(dataJson);
    return (data[configName]);

}

const isitExist = async (words) => {
    return new Promise(function (resolve, reject) {
        var request = require('request');
        let xml2js = require('xml2js');
        let parser = new xml2js.Parser();
        let openUrl = "https://stdict.korean.go.kr/api/search.do?certkey_no=2755&key=" + getConfig("koreanApiKey") + "&type_search=search&q=" + words;
        request(encodeURI(openUrl), (err, response, body) => {
            if (err) throw err;

            let xmlToJson = "";
            parser.parseString(response.body, function (err, result) {
                xmlToJson = result;
            });
            console.log(xmlToJson);
            console.log(xmlToJson["channel"]["total"][0]);

            if (xmlToJson["channel"]["total"][0] == 0) {
                resolve("false")
            } else {
                resolve(xmlToJson["channel"]["item"][0]["pos"][0]);
                console.log(xmlToJson["channel"]["item"][0]["pos"][0]);
            }
        });
    });
}
