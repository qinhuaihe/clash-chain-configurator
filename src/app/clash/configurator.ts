import baseConfig from './baseConfig.yaml';
import jsyaml from 'js-yaml';

export type Options = {
    providers: ProxyProviderExtend[];
    finalProxyNodes: ProxyNode;
}

export default class ConfigConfigurator {
    config = baseConfig as ClashConfig;

    constructor() { }

    setProviders(providers: ProxyProviderExtend[]) {
        this.config['proxy-providers'] = {};
        providers.forEach(x => {
            this.config['proxy-providers'][x.name] = {
                type: 'http',
                path: x.path,
                interval: x.interval || 3600,
                override: {
                    "additional-prefix": providers.length > 1 ? x.name : undefined
                }
            };
        });

        this.configure();
    }

    setFinalProxyNodes(finalProxyNodes: ProxyNode[]) {
        this.config.proxies = finalProxyNodes;
        this.configure();
    }

    private configure() {
        const providerKeys = Object.keys(this.config['proxy-providers']);
        if (!providerKeys.length) return;

        if (this.config.proxies.length) {
            this.config.proxies.forEach(x => x['dialer-proxy'] = '手动选择');
        }
        console.log(providerKeys);
        this.config['proxy-groups'] = [
            { name: '我的代理', type: 'select', proxies: [...this.config.proxies.map(x => x.name), '手动选择'] },
            { name: '手动选择', type: 'select', use: [...providerKeys], proxies: ['自动选择'] },
            { name: '自动选择', type: 'url-test', use: [...providerKeys], url: 'http://www.gstatic.com/generate_204', interval: 3600 }
        ];
    }

    get content() {
        return jsyaml.dump(this.config);
    }
}
