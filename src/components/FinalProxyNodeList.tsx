import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Pencil, Server, Shield } from 'lucide-react';

interface FinalProxyNodeListProps {
    proxyNodes: ProxyNode[];
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
}

const TYPE_LABELS: Record<string, string> = {
    http: 'HTTP',
    socks5: 'SOCKS5',
    ss: 'Shadowsocks',
    ssr: 'ShadowsocksR',
    snell: 'Snell',
    vmess: 'VMess',
    vless: 'VLESS',
    trojan: 'Trojan',
    anytls: 'AnyTLS',
    mieru: 'Mieru',
    sudoku: 'Sudoku',
    hysteria: 'Hysteria',
    hysteria2: 'Hysteria2',
    tuic: 'TUIC',
    wireguard: 'WireGuard',
    ssh: 'SSH',
};

export default function FinalProxyNodeList({ proxyNodes, onRemove, onEdit }: FinalProxyNodeListProps) {
    if (proxyNodes.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                暂无落地节点
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {proxyNodes.map((node, index) => (
                <Card key={index} className="relative">
                    <CardHeader className="p-3 sm:p-4 pb-2">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-base sm:text-lg">{node.name || `Proxy ${index + 1}`}</CardTitle>
                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                    {TYPE_LABELS[node.type] || node.type}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onEdit(index)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => onRemove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Server className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate" title={`${node.server}:${node.port}`}>
                                {node.server}:{node.port}
                            </span>
                        </div>
                        {(node.tls || node.type === 'trojan' || node.type === 'vless' || node.type === 'vmess') && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Shield className="h-4 w-4 flex-shrink-0" />
                                <span>
                                    {node.tls ? 'TLS已启用' : 'TLS可用'}
                                    {(node as any).sni || (node as any).servername ? ` (${(node as any).sni || (node as any).servername})` : ''}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
