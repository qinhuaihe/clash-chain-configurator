import baseConfig from './baseConfig.yaml';
import jsyaml from 'js-yaml';

export type Options = {
  providers: ProxyProviderExtend[];
  finalProxyNodes: ProxyNode;
};

export default class ConfigConfigurator {
  config = baseConfig as ClashConfig;

  constructor() {}

  setProviders(providers: ProxyProviderExtend[]) {
    this.config['proxy-providers'] = {};
    providers.forEach((x) => {
      this.config['proxy-providers'][x.name] = {
        type: x.type,
        url: x.url || undefined,
        interval: x.interval,
        override: {
          'additional-prefix': providers.length > 1 ? `${x.name} ` : undefined,
        },
        payload: x.payloadContent ? (jsyaml.load(x.payloadContent) as ProxyNode[]) : undefined,
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
      this.config.proxies.forEach((x) => (x['dialer-proxy'] = '手动选择'));
    }
    this.config['proxy-groups'] = [
      {
        name: '我的代理',
        type: 'select',
        proxies: [...this.config.proxies.map((x) => x.name), '手动选择'],
      },
      { name: '手动选择', type: 'select', use: [...providerKeys], proxies: ['自动选择'] },
      {
        name: '自动选择',
        type: 'url-test',
        use: [...providerKeys],
        url: 'http://www.gstatic.com/generate_204',
        interval: 3600,
      },
    ];
  }

  get content() {
    const {
      dns,
      'proxy-providers': proxyProviders,
      proxies,
      'proxy-groups': proxyGroups,
      'rule-providers': ruleProviders,
      rules,
      ...rest
    } = this.config;

    const parts: string[] = [];

    parts.push(jsyaml.dump(rest, { lineWidth: -1 }));

    if (dns && Object.keys(dns).length > 0) {
      parts.push(jsyaml.dump({ dns }, { lineWidth: -1, flowLevel: 2 }));
    }

    if (proxyProviders && Object.keys(proxyProviders).length > 0) {
      parts.push(
        jsyaml.dump({ 'proxy-providers': proxyProviders }, { lineWidth: -1, flowLevel: 4 }),
      );
    }

    if (proxies && proxies.length > 0) {
      parts.push(jsyaml.dump({ proxies }, { lineWidth: -1, flowLevel: 2 }));
    }

    if (proxyGroups && proxyGroups.length > 0) {
      parts.push(jsyaml.dump({ 'proxy-groups': proxyGroups }, { lineWidth: -1, flowLevel: 2 }));
    }

    if (ruleProviders && Object.keys(ruleProviders).length > 0) {
      parts.push(jsyaml.dump({ 'rule-providers': ruleProviders }, { lineWidth: -1, flowLevel: 4 }));
    }

    if (rules && rules.length > 0) {
      parts.push(jsyaml.dump({ rules }, { lineWidth: -1, flowLevel: 2 }));
    }

    return parts.join('\n');
  }
}
