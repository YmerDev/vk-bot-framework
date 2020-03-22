import { MiddlewareManager } from "./middleware-manager";
import { VkApi } from "./api";
import { Context } from "./context";

/* TODO: move it out from here */
interface ISettings {
    access_token?: string;
    group_id?: number;
    modules?: string[]; // List of modules which should be enabled automatically
}

interface IObject {
    [key: string]: any;
}

class BotFramework {
    public middleware: MiddlewareManager;
    public vk: VkApi;

    private longPollParams?: IObject = undefined;

    constructor(
        private settings: ISettings,
    ) {

        this.middleware = new MiddlewareManager(this);
        this.vk = new VkApi(this.settings.access_token || '');

        if (this.settings.modules) {
            this.settings.modules.forEach(module => {
                import(`./modules/${module}`).then(({ default: moduleClass }) => {
                    this.middleware.use(new moduleClass(this).middleware());
                });
            });
        }
    }

    public async startPolling(ts?: number): Promise<void> {
        if (!this.longPollParams) {
            this.longPollParams = await this.getLongPollParams();
        }
        
        // @ts-ignore
        const { data: body } = await this.vk.getAxios().get(this.longPollParams.server, {
            params: {
                ...this.longPollParams,
                ts,
                act: 'a_check',
                wait: 30, // TODO: move it from here
            },
            timeout: 0,
        });

        if (body.failed === 1) {
            return this.startPolling(body.ts);
        }

        if (body.failed) {
            this.longPollParams = undefined;
            this.startPolling();

            return;
        }

        this.startPolling(body.ts);
        body.updates.forEach((update: any) => this.middleware.next(new Context(update, this)));
    }

    public async sendMessage(peer_id: number, ...args: any) {
        const [message] = args;

        return this.vk.post('messages.send', {
            message,
            peer_id,
            random_id: Math.random(),
        });
    }

    private async getLongPollParams() {
        if (!this.settings.group_id) {
            const [group] = await this.vk.get('groups.getById');
            this.settings.group_id = group.id;
        }

        return await this.vk.get('groups.getLongPollServer', {
            group_id: this.settings.group_id,
        });
    }
}

export { BotFramework }