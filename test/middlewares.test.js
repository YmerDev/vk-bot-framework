const { expect } = require('chai');
const { BotFramework } = require('../dist/bot-framework');
const { Context } = require('../dist/context');

const bot = new BotFramework({
    access_token: process.env.TOKEN,
});

const event = (type, message) => bot.middlewares.next(new Context({
    type,
    object: {
        text: message,
    },
    client_info: {
    },
    group_id: -1,
    event_id: Math.random(),
}));

describe('middlewares', () => {
    afterEach(bot.middlewares.cleanup);

    it('should call middleware with text trigger', done => {
        const type = 'message_new';
        const message = '/start';

        bot.middlewares.command('/start', ctx => {
            expect(ctx.updateType).to.be.equal(type);
            expect(ctx.update.object.text).to.be.equal(message);

            done();
        });

        event(type, message);
    });

    it('should call middleware with regexp trigger', done => {
        const type = 'message_new';
        const message = 'Hello dear Ivan!';

        bot.middlewares.command(/hello dear ([a-zA-Z]*)!/i, ctx => {
            expect(ctx.updateType).to.be.equal(type);
            expect(ctx.update.object.text).to.be.equal(message);
            expect(ctx.match[0]).to.be.equal('hello dear ivan!');
            expect(ctx.match[1]).to.be.equal('ivan');

            done();
        });

        event(type, message);
    });

    it('should call middleware with event trigger', done => {
        const type = 'group_leave';

        bot.middlewares.event(type, ctx => {
            expect(ctx.updateType).to.be.equal(type);

            done();
        });

        event(type);
    });

    it('should call middleware without trigger', done => {
        const type = 'message_new';
        const message = 'something';

        bot.middlewares.use(ctx => {
            expect(ctx.updateType).to.be.equal(type);
            expect(ctx.update.object.text).to.be.equal(message);

            done();
        });

        event(type, message);
    });
});