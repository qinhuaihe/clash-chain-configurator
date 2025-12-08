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
            console.log('xxxxxxxx', x.name, x.payload);
            this.config['proxy-providers'][x.name] = {
                type: x.type,
                url: x.url,
                interval: x.interval,
                override: {
                    "additional-prefix": providers.length > 1 ? x.name : undefined
                },
                payload: x.payloadContent ? jsyaml.load(x.payloadContent) as ProxyNode[] : undefined,
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
        const { dns, 'proxy-providers': providers, proxies, 'proxy-groups': groups, rules, ...rest } = this.config;
        
        const parts: string[] = [];
        
        parts.push(jsyaml.dump(rest, { lineWidth: -1 }));

        if (dns && Object.keys(dns).length > 0) {
            parts.push(jsyaml.dump({ dns }, { lineWidth: -1, flowLevel: 2 }));
        }
        
        if (providers && Object.keys(providers).length > 0) {
            parts.push(jsyaml.dump({ 'proxy-providers': providers }, { lineWidth: -1, flowLevel: 4 }));
        }
        
        if (proxies && proxies.length > 0) {
            parts.push(jsyaml.dump({ proxies }, { lineWidth: -1, flowLevel: 2 }));
        }
        
        if (groups && groups.length > 0) {
            parts.push(jsyaml.dump({ 'proxy-groups': groups }, { lineWidth: -1, flowLevel: 2 }));
        }

        if (rules && rules.length > 0) {
            parts.push(jsyaml.dump({ rules }, { lineWidth: -1, flowLevel: 2 }));
        }
        
        return parts.join('\n');
    }
}
