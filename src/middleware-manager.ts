import { Context } from "./context";
import { BotFramework } from './bot-framework';

interface IMiddlewares {
    callback: Function;
    triggers?: any[];
}

class MiddlewaresManager {
    private middlewares: IMiddlewares[] = [];

    constructor(
        private bot: BotFramework,
    ) {}

    /**
     * Adds middleware provider.
     * 
     * @param {Function} middleware - Middleware function
     * 
     * @returns {MiddlewaresManager}
     */
    public use(middleware: Function): MiddlewaresManager {
        const length = this.middlewares.length;

        this.middlewares.push({
            callback: (context: Context) =>
            middleware(
                context,
                (ctx: any) => this.next(ctx || context, length)
            )
        });

        return this;
    }

    /**
     * Command trigger
     * 
     * @param {RegExp | string} triggersList 
     * @param {Function[]} middlewares 
     * 
     * @returns {MiddlewaresManager}
     */
    public command(triggersList: any, ...middlewares: Function[]): MiddlewaresManager {
        const triggers =
        (!Array.isArray(triggersList) ? [triggersList] : triggersList)
        .map(trigger =>
            trigger instanceof RegExp ? trigger : trigger.toLowerCase()
        );

        middlewares.forEach(callback => {
            const length = this.middlewares.length;

            this.middlewares.push({
                callback: (context: Context) => callback(context, () => this.next(context, length)),
                triggers,
            });
        
        });

        return this;
    }

    /**
     * Call callback on certain event gathered.
     * 
     * @param {string | string[]} event 
     * @param {Function[]} middleware 
     * 
     * @returns {MiddlewaresManager}
     */
    public event(event: string | string[], ...middleware: Function[]): MiddlewaresManager {
        this.command(event, ...middleware);
        return this;
    }

    public next(context: any | Context, length: number = -1): void {
        if (this.middlewares.length <= length + 1) {
            return;
        }

        const { callback, triggers } = this.middlewares[length + 1];

        const isTriggered = (triggers || []).some(
            (trigger: any) => {

                if (context.isMessage() && trigger !== 'message_new') {
                    const { object: message } = context.update;

                    const messageText = (message.text || message.body || '').toLowerCase();
         
                    if (trigger instanceof RegExp) {
                        const match = messageText.match(trigger);

                        if (match) {
                            context.extend('match', match);
                        }

                        return !!match;
                    }

                    return messageText.startsWith(trigger);
                }
    
                return context.updateType === trigger;
            }
        );

        if (!triggers || (!triggers.length && context.isMessage()) || isTriggered) {
            return callback(context);
        }

        return this.next(context, length + 1);
    }

    public cleanup(): MiddlewaresManager {
        this.middlewares = [];

        return this;
    }
}

export { MiddlewaresManager };