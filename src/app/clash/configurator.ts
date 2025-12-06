import baseConfig from './baseConfig.yaml';
import jsyaml from 'js-yaml';

export type Options = {
    airports: Airport[];
    finalProxyNodes: ProxyNode;
}

export default class ConfigConfigurator {
    config = baseConfig as ClashConfig;

    constructor() { }

    setAirports(airports: Airport[]) {
        this.config['proxy-providers'] = {};
        airports.forEach(x => {
            this.config['proxy-providers'][x.name] = {
                type: 'file',
                path: x.path,
                interval: 3600
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

        this.config['proxy-groups'] = [
            { name: '我的代理', type: 'select', proxies: [...this.config.proxies.map(x => x.name), '手动选择'] },
            { name: '手动选择', type: 'select', use: providerKeys, proxies: ['自动选择'] },
            { name: '自动选择', type: 'url-test', use: providerKeys, url: 'http://www.gstatic.com/generate_204', interval: 3600 }
        ];
    }

    get content() {
        return jsyaml.dump(this.config);
    }
}
