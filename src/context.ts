import { BotFramework } from './bot-framework';

interface IObject { // temporarily solution
    [K: string]: any;
}

class Context {
    public updateType: string;
    private clientInfo: object | null = null;
    private extends: IObject = {};


    constructor(
        public update: any,
        private bot: BotFramework
    ) {
        this.updateType = update.type;

        if (this.isMessage()) {
            this.clientInfo = update.client_info;
        }

        return new Proxy(this, {
            get: (target: any, name: string) => (name in this.extends) ? this.extends[name] : target[name],
        })
    }

    public reply(...args: any[]) {
        const userId = this.getSender();

        if (!userId) {
            throw new Error(`Unable to reply to user because this is not message event. Type: ${this.updateType}`);
        }

       return this.bot.sendMessage(userId, ...args);
    }

    public extend<T extends Object>(key: any, argument: T): T & Context {
        this.extends = Object.assign(this.extends, {
            [key]: argument
        });

        return this as any;
    }

    public isMessage(): boolean {
        return this.updateType === 'message_new';
    }

    public getSender(): number | null {
        if (!this.isMessage()) {
            return null;
        }

        const { object: message } = this.update;

        return message.peer_id || message.user_id;
    }
}

export { Context };