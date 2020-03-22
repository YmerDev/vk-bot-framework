import { BotFramework } from "../bot-framework";
import { Context } from "../context";

class Session {
    private storage: Map<string, any> = new Map();

    constructor(
        private bot: BotFramework,
    ) {}

    middleware() {
        return (context: Context, next: Function) => {
            if (!context.isMessage()) { // Only messages currently supported.
                return next();
            }

            const key = this.getKey(context);

            let session = this.storage.get(key) || {};

            const updatedContext = context.extend('session', {
                ...session,
                set: (value: any) => {
                    session = value;
                 }
            });

            this.storage.set(key, session);


            return next(updatedContext);
        };
    }

    /**
     * Get key for storage
     * 
     * @param {Context} context 
     * 
     * @returns {string}
     */
    private getKey(context: Context): string {
        const userId = context.getSender();
        const key = `vk_bot_user:${userId}`;
        return key;
    }
}

export default Session;