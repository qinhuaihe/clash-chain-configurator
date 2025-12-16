import { useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import yaml from 'js-yaml';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from './ui/sonner';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

function parseVmessLink(link: string): ProxyNode | null {
    try {
        const encoded = link.replace('vmess://', '');
        const decoded = JSON.parse(atob(encoded));
        return {
            name: decoded.ps || decoded.name || `vmess-${decoded.add}`,
            type: 'vmess',
            server: decoded.add,
            port: Number(decoded.port),
            uuid: decoded.id,
            alterId: Number(decoded.aid) || 0,
            cipher: 'auto',
            tls: decoded.tls === 'tls',
            servername: decoded.sni || decoded.host,
            network: decoded.net || 'tcp',
            udp: true,
            'skip-cert-verify': true,
            ...(decoded.net === 'ws' && {
                'ws-opts': {
                    path: decoded.path || '/',
                    headers: decoded.host ? { Host: decoded.host } : undefined,
                },
            }),
        } as ProxyNode;
    } catch {
        return null;
    }
}

function parseVlessLink(link: string): ProxyNode | null {
    try {
        const url = new URL(link);
        const params = url.searchParams;
        return {
            name: decodeURIComponent(url.hash.slice(1)) || `vless-${url.hostname}`,
            type: 'vless',
            server: url.hostname,
            port: Number(url.port) || 443,
            uuid: url.username,
            encryption: '',
            flow: params.get('flow') || undefined,
            tls: params.get('security') === 'tls' || params.get('security') === 'reality',
            servername: params.get('sni') || undefined,
            network: params.get('type') || 'tcp',
            udp: true,
            'skip-cert-verify': true,
            ...(params.get('type') === 'ws' && {
                'ws-opts': {
                    path: params.get('path') || '/',
                    headers: params.get('host') ? { Host: params.get('host')! } : undefined,
                },
            }),
            ...(params.get('security') === 'reality' && {
                'reality-opts': {
                    'public-key': params.get('pbk') || '',
                    'short-id': params.get('sid') || '',
                },
                'client-fingerprint': params.get('fp') || 'chrome',
            }),
        } as ProxyNode;
    } catch {
        return null;
    }
}

function parseTrojanLink(link: string): ProxyNode | null {
    try {
        const url = new URL(link);
        const params = url.searchParams;
        return {
            name: decodeURIComponent(url.hash.slice(1)) || `trojan-${url.hostname}`,
            type: 'trojan',
            server: url.hostname,
            port: Number(url.port) || 443,
            password: decodeURIComponent(url.username),
            sni: params.get('sni') || url.hostname,
            network: params.get('type') || 'tcp',
            udp: true,
            'skip-cert-verify': true,
            ...(params.get('type') === 'ws' && {
                'ws-opts': {
                    path: params.get('path') || '/',
                    headers: params.get('host') ? { Host: params.get('host')! } : undefined,
                },
            }),
        } as ProxyNode;
    } catch {
        return null;
    }
}

function parseSsLink(link: string): ProxyNode | null {
    try {
        let encoded = link.replace('ss://', '');
        let name = '';
        const hashIndex = encoded.indexOf('#');
        if (hashIndex !== -1) {
            name = decodeURIComponent(encoded.slice(hashIndex + 1));
            encoded = encoded.slice(0, hashIndex);
        }
        const atIndex = encoded.lastIndexOf('@');
        let userInfo: string, serverInfo: string;
        if (atIndex !== -1) {
            userInfo = encoded.slice(0, atIndex);
            serverInfo = encoded.slice(atIndex + 1);
        } else {
            const decoded = atob(encoded);
            const parts = decoded.split('@');
            userInfo = parts[0];
            serverInfo = parts[1];
        }
        let cipher: string, password: string;
        try {
            const decodedUserInfo = atob(userInfo);
            [cipher, password] = decodedUserInfo.split(':');
        } catch {
            [cipher, password] = userInfo.split(':');
        }
        const [server, port] = serverInfo.split(':');
        return {
            name: name || `ss-${server}`,
            type: 'ss',
            server,
            port: Number(port),
            cipher,
            password,
            udp: true,
        } as ProxyNode;
    } catch {
        return null;
    }
}

function parseHysteria2Link(link: string): ProxyNode | null {
    try {
        const url = new URL(link);
        const params = url.searchParams;
        return {
            name: decodeURIComponent(url.hash.slice(1)) || `hy2-${url.hostname}`,
            type: 'hysteria2',
            server: url.hostname,
            port: Number(url.port) || 443,
            password: decodeURIComponent(url.username),
            sni: params.get('sni') || url.hostname,
            obfs: params.get('obfs') || undefined,
            'obfs-password': params.get('obfs-password') || undefined,
            'skip-cert-verify': true,
        } as ProxyNode;
    } catch {
        return null;
    }
}

function parseNodeLink(link: string): ProxyNode | null {
    const trimmed = link.trim();
    if (trimmed.startsWith('vmess://')) return parseVmessLink(trimmed);
    if (trimmed.startsWith('vless://')) return parseVlessLink(trimmed);
    if (trimmed.startsWith('trojan://')) return parseTrojanLink(trimmed);
    if (trimmed.startsWith('ss://')) return parseSsLink(trimmed);
    if (trimmed.startsWith('hysteria2://') || trimmed.startsWith('hy2://')) return parseHysteria2Link(trimmed);
    return null;
}

function containsProxyLinks(text: string): boolean {
    const lines = text.split('\n');
    return lines.some(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('vmess://') ||
            trimmed.startsWith('vless://') ||
            trimmed.startsWith('trojan://') ||
            trimmed.startsWith('ss://') ||
            trimmed.startsWith('hysteria2://') ||
            trimmed.startsWith('hy2://');
    });
}

function parseProxyLinksToYaml(text: string): string | null {
    const lines = text.split('\n').filter(line => line.trim());
    const nodes: ProxyNode[] = [];
    for (const line of lines) {
        const node = parseNodeLink(line);
        if (node) {
            nodes.push(node);
        }
    }
    if (nodes.length === 0) return null;
    return yaml.dump(nodes, { lineWidth: -1, flowLevel: 1 });
}

const providerSchema = z.object({
    name: z.string().min(1, "名称不能为空"),
    type: z.enum(['http', 'inline']),
    url: z.string().optional(),
    payloadContent: z.string().optional(),
    interval: z.coerce.number().min(60, "间隔至少60分钟").default(86400)
}).refine((data) => {
    if (data.type === 'http') {
        return data.url && data.url.length > 0;
    }
    return true;
}, {
    message: "HTTP类型需要订阅地址",
    path: ["url"]
}).refine((data) => {
    if (data.type === 'http' && data.url) {
        try {
            new URL(data.url);
            return true;
        } catch {
            return false;
        }
    }
    return true;
}, {
    message: "必须是有效的URL",
    path: ["url"]
}).refine((data) => {
    if (data.type === 'inline') {
        return data.payloadContent && data.payloadContent.trim().length > 0;
    }
    return true;
}, {
    message: "内联类型需要节点内容",
    path: ["payload"]
});

type ProviderFormValues = z.infer<typeof providerSchema>;

interface ProviderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    provider?: ProxyProviderExtend | null;
    onSave: (provider: ProxyProviderExtend) => void;
    existingNames: string[];
}

export default function ProviderDialog({ open, onOpenChange, provider, onSave, existingNames }: ProviderDialogProps) {
    const isEditing = !!provider;

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<ProviderFormValues>({
        resolver: zodResolver(providerSchema) as any,
        defaultValues: {
            name: '',
            type: 'http',
            url: '',
            payloadContent: '',
            interval: 86400
        }
    });

    const watchType = watch('type');

    const isBase64 = (str: string): boolean => {
        if (!str || str.length === 0) return false;
        const trimmed = str.trim();
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(trimmed)) return false;
        if (trimmed.length % 4 !== 0) return false;
        try {
            const decoded = atob(trimmed);
            return decoded.length > 0 && /[\x20-\x7E\r\n\t]/.test(decoded);
        } catch {
            return false;
        }
    };

    const handlePayloadPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = e.clipboardData.getData('text/plain');
        if (text && isBase64(text)) {
            e.preventDefault();
            try {
                const decoded = atob(text.trim());
                if (containsProxyLinks(decoded)) {
                    const yamlContent = parseProxyLinksToYaml(decoded);
                    if (yamlContent) {
                        setValue('payloadContent', yamlContent);
                        toast.success('代理链接已解码并转换为YAML');
                        return;
                    }
                }
                setValue('payloadContent', decoded);
                toast.success('Base64内容已解码');
            } catch {
                // If decoding fails, let the default paste happen
            }
        } else if (text && containsProxyLinks(text)) {
            e.preventDefault();
            const yamlContent = parseProxyLinksToYaml(text);
            if (yamlContent) {
                setValue('payloadContent', yamlContent);
                toast.success('代理链接已转换为YAML');
            }
        }
    }, [setValue]);

    useEffect(() => {
        if (open && provider) {
            reset({
                name: provider.name,
                type: (provider.type as 'http' | 'inline') || 'http',
                url: provider.url || '',
                payloadContent: provider.payloadContent || '',
                interval: provider.interval || 86400
            });
        } else if (open) {
            reset({
                name: '',
                type: 'http',
                url: '',
                payloadContent: '',
                interval: 86400
            });
        }
    }, [open, provider, reset]);

    const onSubmit = (data: ProviderFormValues) => {
        const namesToCheck = isEditing
            ? existingNames.filter(n => n !== provider?.name)
            : existingNames;

        if (namesToCheck.includes(data.name)) {
            toast.error('机场名称已存在', {
                description: `名称为"${data.name}"的机场已存在`
            });
            return;
        }

        onSave(data as ProxyProviderExtend);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? '编辑机场' : '添加机场'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="name">名称 <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="机场名称"
                            className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                            <span className="text-xs text-destructive">{errors.name.message}</span>
                        )}
                    </div>
                    <div className="grid gap-1.5">
                        <Label>类型</Label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="http" id="type-http" />
                                        <Label htmlFor="type-http" className="font-normal cursor-pointer">HTTP</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="inline" id="type-inline" />
                                        <Label htmlFor="type-inline" className="font-normal cursor-pointer">Inline</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                    {watchType === 'http' && (
                        <div className="grid gap-1.5">
                            <Label htmlFor="url">订阅地址 <span className="text-destructive">*</span></Label>
                            <Input
                                id="url"
                                {...register('url')}
                                placeholder="https://example.com/config.yaml"
                                className={errors.url ? "border-destructive" : ""}
                            />
                            {errors.url && (
                                <span className="text-xs text-destructive">{errors.url.message}</span>
                            )}
                        </div>
                    )}
                    {watchType === 'inline' && (
                        <div className="grid gap-1.5">
                            <Label htmlFor="payload">节点内容 <span className="text-destructive">*</span></Label>
                            <textarea
                                id="payload"
                                {...register('payloadContent')}
                                onPaste={handlePayloadPaste}
                                placeholder="输入代理节点YAML...(Base64会自动解码)"
                                className={`min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.payloadContent ? "border-destructive" : "border-input"}`}
                            />
                            {errors.payloadContent && (
                                <span className="text-xs text-destructive">{errors.payloadContent.message}</span>
                            )}
                        </div>
                    )}
                    {watchType === 'http' && (
                        <div className="grid gap-1.5">
                            <Label htmlFor="interval">更新间隔(秒) <span className="text-destructive">*</span></Label>
                            <Input
                                id="interval"
                                type="number"
                                {...register('interval')}
                                placeholder="86400"
                                className={errors.interval ? "border-destructive" : ""}
                            />
                            {errors.interval && (
                                <span className="text-xs text-destructive">{errors.interval.message}</span>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            取消
                        </Button>
                        <Button type="submit">
                            {isEditing ? '保存' : '添加'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
