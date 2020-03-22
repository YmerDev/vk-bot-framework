import axios, { AxiosInstance } from 'axios';

interface IObject {
    [key: string]: any;
}

class VkApi {
    private axios: AxiosInstance;
    
    constructor(
        private access_token: string,
        api_version: number = 5.103
    ) {
        this.axios = axios.create({
            baseURL: 'https://api.vk.com/method/',
            timeout: 1000,
            transformResponse(data: string) {
                // console.log({ data });
                const result = JSON.parse(data);

                if (result.error) {
                    console.log(result.error);
                }

                return result.response ? result.response : result;
            }
        });

        this.axios.interceptors.request.use(config => {
            config.params = config.params || {};
            config.params['access_token'] = this.access_token;
            config.params['v'] = api_version;
            return config;
        });
    }

    public async post(method: string, args?: IObject) {
        const response = await this.axios.get(method, {
            params: { 
                ...args 
            } 
        });

        return response.data;
    }

    public async get(method: string, args?: IObject) {
        const response = await this.axios.get(method, {
            params: { 
                ...args 
            } 
        });

        return response.data;
    }

    public getAxios() {
        return this.axios;
    }
}

export { VkApi };