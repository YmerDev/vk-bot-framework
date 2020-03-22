const { expect } = require('chai');
const { BotFramework } = require('../dist/bot-framework');
const { Context } = require('../dist/context');

const bot = new BotFramework({
    access_token: process.env.TOKEN,
});

const eventEmit = type => bot.middlewares.next(new Context({
    type,
}));

describe('context', () => {
    afterEach(bot.middlewares.cleanup);

    it('should throw error on non-message reply attempt', done => {
        const type = 'group_join';
        
        bot.middlewares.event(type, ctx => {
            expect(() => ctx.reply('Message')).to.throw(Error, new RegExp(`Type: ${type}`));
    
            done();
        });

        eventEmit(type);
    });
});