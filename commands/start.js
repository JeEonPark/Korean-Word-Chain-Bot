const { MessageAttachment } = require("discord.js");
const fs = require('fs');
const Hangul = require('hangul-js');
const cheerio = require('cheerio');
const request = require('request');

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

            if (msg == "reset") {
                isitCorrect = false;
                isitFirst = true;
                correctedWords = "";
                message.channel.send("이전 단어가 초기화됩니다. 첫 번째 단어를 입력해주세요.");
            } else if (!Hangul.isCompleteAll(msg)) {
                //오타가 있을 경우
                isitCorrect = false;
                message.channel.send("오타!!");
            } else if (msg.length == 1) {
                //한 글자가 들어왔을 경우
                isitCorrect = false;
                message.channel.send("두 글자 이상의 단어를 입력해주세요!");
            } else {
                if (isitFirst) {
                    //처음 경우일 경우
                    isitCorrect = true;
                } else if (correctedWords.charAt(correctedWords.length - 1) != msg.charAt(0)) {
                    //끝 단어와 다음 단어가 같지 않을 경우
                    if (isItDooum(correctedWords, msg)) {
                        //두음법칙 조건에 부합한 경우
                        isitCorrect = true;
                    } else {
                        //두음법칙 조건에 부합하지 않은 경우
                        isitCorrect = false;
                        message.channel.send("'" + whatisNext(correctedWords.charAt(correctedWords.length - 1)) + "' (으)로 시작하는 단어로 입력해주세요!");
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
                        message.channel.send("명사로만 입력할 수 있습니다! 다시 입력해주세요!\n해당단어의 품사 : " + finalData);
                    } else if (isitHanbang(msg)) {
                        message.channel.send("\"" + msg + "\"의 다음 단어가 너무 어렵거나 단어가 없어요!! 다시 입력해주세요!")
                    } else {
                        //모든게 정답
                        correctedWords = msg;

                        //다음 단어에 두음법칙이 있는지 파악
                        let nextWords = whatisNext(correctedWords.charAt(correctedWords.length - 1));

                        if (isitFirst) {
                            isitFirst = false;
                        }
                        const newEmbed = new Discord.MessageEmbed()
                            .setColor('#50D447')
                            .addFields(
                                { name: `${message.author.username} said`, value: `${correctedWords}` },
                                { name: 'It means', value: `${await whatsMean(correctedWords)}` },
                                { name: 'Next word Starts with', value: `${nextWords}` }
                            )
                            .setFooter('다음 단어가 없거나 초기화해야하는 경우 reset 을 입력하세요!', 'https://discord.com/assets/6f26ddd1bf59740c536d2274bb834a05.png');

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
        
        let xml2js = require('xml2js');
        let parser = new xml2js.Parser();
        let openUrl = "https://stdict.korean.go.kr/api/search.do?certkey_no=2755&key=" + getConfig("koreanApiKey") + "&type_search=search&q=" + words;
        request(encodeURI(openUrl), (err, response, body) => {
            if (err) throw err;

            let xmlToJson = "";
            parser.parseString(response.body, function (err, result) {
                xmlToJson = result;
            });
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

//두음법칙에 부합하는지 확인하는 철자
function isItDooum(w1, w2) {

    let disW1 = Hangul.disassemble(w1.charAt(w1.length - 1));
    let disW2 = Hangul.disassemble(w2.charAt(0));

    let result = false;
    if (disW1.length >= 3 && Hangul.assemble([disW1[0], disW1[1], disW1[2]]) == '뢰') {

        if (Hangul.assemble([disW2[0], disW2[1], disW2[2]]) == '뇌') {
            result = true;
        }

    } else if (disW1[0] == 'ㄴ' && disW2[0] == 'ㅇ') { //한자음 녀, 뇨, 뉴, 니 → 여, 요, 유, 이
        if (disW1[1] == 'ㅕ' && disW2[1] == 'ㅕ') {
            result = true;
        } else if (disW1[1] == 'ㅛ' && disW2[1] == 'ㅛ') {
            result = true;
        } else if (disW1[1] == 'ㅠ' && disW2[1] == 'ㅠ') {
            result = true;
        } else if (disW1[1] == 'ㅣ' && disW2[1] == 'ㅣ') {
            result = true;
        }
    } else if (disW1[0] == 'ㄹ' && disW2[0] == 'ㅇ') { //한자음 랴, 려, 례, 료, 류, 리 → 야, 여, 예, 요, 유, 이
        if (disW1[1] == 'ㅑ' && disW2[1] == 'ㅑ') {
            result = true;
        } else if (disW1[1] == 'ㅕ' && disW2[1] == 'ㅕ') {
            result = true;
        } else if (disW1[1] == 'ㅖ' && disW2[1] == 'ㅖ') {
            result = true;
        } else if (disW1[1] == 'ㅛ' && disW2[1] == 'ㅛ') {
            result = true;
        } else if (disW1[1] == 'ㅠ' && disW2[1] == 'ㅠ') {
            result = true;
        } else if (disW1[1] == 'ㅣ' && disW2[1] == 'ㅣ') {
            result = true;
        } else if (disW1[1] == 'ㅓ' && disW2[1] == 'ㅓ') {
            result = true;
        } else if (disW1[1] == 'ㅡ' && disW2[1] == 'ㅡ') {
            result = true;
        } else if (disW1[1] == 'ㅏ' && disW2[1] == 'ㅏ') {
            result = true;
        }
    } else if (disW1[0] == 'ㄹ' && disW2[0] == 'ㄴ') { //한자음 라, 래, 로, 뢰, 루, 르 → 나, 내, 노, 뇌, 누, 느
        if (disW1[1] == 'ㅏ' && disW2[1] == 'ㅏ') {
            result = true;
        } else if (disW1[1] == 'ㅐ' && disW2[1] == 'ㅐ') {
            result = true;
        } else if (disW1[1] == 'ㅗ' && disW2[1] == 'ㅗ') {
            result = true;
        } else if (disW1[1] == 'ㅜ' && disW2[1] == 'ㅜ') {
            result = true;
        } else if (disW1[1] == 'ㅡ' && disW2[1] == 'ㅡ') {
            result = true;
        }
    }

    return result;

}

//해당 단어의 다음에 와도 될 것들을 return 하는 함수
function whatisNext(word) {
    let result = word + ", ";
    let nextWord = "none";

    let disWord = Hangul.disassemble(word);
    if (disWord.length >= 3 && Hangul.assemble([disWord[0], disWord[1], disWord[2]]) == '뢰') {
        nextWord = "뇌"
        var temp = Hangul.disassemble(nextWord);

        if (disWord.length == 3) {
            return result + nextWord;
        } else if (disWord.length == 4) {
            return result + Hangul.assemble([temp[0], temp[1], temp[2], disWord[3]]);
        }

    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "녀") {
        nextWord = "여";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "뇨") {
        nextWord = "요";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "뉴") {
        nextWord = "유";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "니") {
        nextWord = "이";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "랴") {
        nextWord = "야";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "려") {
        nextWord = "여";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "례") {
        nextWord = "예";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "료") {
        nextWord = "요";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "류") {
        nextWord = "유";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "리") {
        nextWord = "이";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "러") {
        nextWord = "어";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "라") {
        nextWord = "아, 나";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "래") {
        nextWord = "내";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "로") {
        nextWord = "노";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "루") {
        nextWord = "누";
    } else if (Hangul.assemble([disWord[0], disWord[1]]) == "르") {
        nextWord = "으, 느";
    }

    var temp = Hangul.disassemble(nextWord);

    if (nextWord == "none") {
        return word;
    } else if (disWord.length == 2) {
        return result + nextWord;
    } else if (disWord.length == 3) {
        return result + Hangul.assemble([temp[0], temp[1], disWord[2]]);
    } else if (disWord.length == 4) {
        return result + Hangul.assemble([temp[0], temp[1], disWord[2], disWord[3]]);
    }

}

function isitHanbang(word) {

    let result = false;

    let hanbangWords = ["릇", "녘", "럼", "렁", "켓", "섯", "뀌", "쁨",
        "늄", "륨", "븀", "껑", "귿", "즘", "듭", "듬", "늬", "릎", "뺌", "츠", "갗", "탉", "믄", "긶", "읓",
        "읔", "븀", "읗"]
    console.log(word.charAt(word.length - 1));
    for (var a of hanbangWords) {
        if (word.charAt(word.length - 1) == a) {
            result = true;
        }
    }

    return result;

}



const whatsMean = async (word) => {
    return new Promise(function (resolve, reject) {

        var url = "https://m.kpedia.jp/s/1/" + word;

        request(encodeURI(url), (err, response, body) => {
            if (err) throw err;
          
            var $ = cheerio.load(body);
            var parse = $('html body div.container table.school-course tbody tr td a');

            try {
                var resultKey = parse[0].children[0].children[0].data;
            } catch {
                resolve("検索結果なし");
            }
            

            try {
                var result = parse[1].children[0].data;
            } catch {
                resolve("検索結果なし");
            }

            if(resultKey == word){
                resolve(result);
            } else {
                resolve("検索結果なし");
            }
            
            
        });
    });
}