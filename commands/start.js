const { MessageAttachment } = require("discord.js");

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
            if(isitFirst){
                correctedWords = msg;
                message.channel.send(msg + " 의 다음 단어 입력");
                isitFirst = false;
            } else {
                if(msg.length == 1){
                    //한 글자가 들어왔을 경우
                    message.channel.send("두 글자 이상의 단어를 입력해주세요!");
                } else if (correctedWords.charAt(correctedWords.length-1) == msg.charAt(0)){
                    //끝자리와 첫자리가 같으면
                    correctedWords = msg;
                    message.channel.send(msg + " 의 다음 단어 입력");
                } else {
                    message.channel.send(correctedWords.charAt(correctedWords.length-1) + " 으로 끝나는 단어로 입력해주세요!");
                }
            }

        });

    }
}