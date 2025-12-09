import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { toast } from './ui/sonner';

const PROXY_TYPES = [
    { value: 'http', label: 'HTTP' },
    { value: 'socks5', label: 'SOCKS5' },
    { value: 'ss', label: 'Shadowsocks' },
    { value: 'ssr', label: 'ShadowsocksR' },
    { value: 'snell', label: 'Snell' },
    { value: 'vmess', label: 'VMess' },
    { value: 'vless', label: 'VLESS' },
    { value: 'trojan', label: 'Trojan' },
    { value: 'anytls', label: 'AnyTLS' },
    { value: 'mieru', label: 'Mieru' },
    { value: 'sudoku', label: 'Sudoku' },
    { value: 'hysteria', label: 'Hysteria' },
    { value: 'hysteria2', label: 'Hysteria2' },
    { value: 'tuic', label: 'TUIC' },
    { value: 'wireguard', label: 'WireGuard' },
    { value: 'ssh', label: 'SSH' },
] as const;

type ProxyType = typeof PROXY_TYPES[number]['value'];

interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'number' | 'password' | 'checkbox';
    required?: boolean;
    placeholder?: string;
}

const COMMON_FIELDS: FieldConfig[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Proxy name' },
    { name: 'server', label: 'Server', type: 'text', required: true, placeholder: 'Server address' },
    { name: 'port', label: 'Port', type: 'number', required: true, placeholder: '443' },
];

const TYPE_SPECIFIC_FIELDS: Record<ProxyType, FieldConfig[]> = {
    http: [
        { name: 'username', label: 'Username', type: 'text', placeholder: 'Optional' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional' },
        { name: 'tls', label: 'TLS', type: 'checkbox' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
    ],
    socks5: [
        { name: 'username', label: 'Username', type: 'text', placeholder: 'Optional' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional' },
        { name: 'tls', label: 'TLS', type: 'checkbox' },
        { name: 'udp', label: 'UDP', type: 'checkbox' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
    ],
    ss: [
        { name: 'cipher', label: 'Cipher', type: 'text', required: true, placeholder: 'aes-128-gcm' },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'udp', label: 'UDP', type: 'checkbox' },
        { name: 'udp-over-tcp', label: 'UDP over TCP', type: 'checkbox' },
        { name: 'plugin', label: 'Plugin', type: 'text', placeholder: 'obfs, v2ray-plugin' },
    ],
    ssr: [
        { name: 'cipher', label: 'Cipher', type: 'text', required: true, placeholder: 'chacha20-ietf' },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'obfs', label: 'Obfs', type: 'text', required: true, placeholder: 'tls1.2_ticket_auth' },
        { name: 'protocol', label: 'Protocol', type: 'text', required: true, placeholder: 'auth_sha1_v4' },
        { name: 'obfs-param', label: 'Obfs Param', type: 'text', placeholder: 'Optional' },
        { name: 'protocol-param', label: 'Protocol Param', type: 'text', placeholder: 'Optional' },
        { name: 'udp', label: 'UDP', type: 'checkbox' },
    ],
    snell: [
        { name: 'psk', label: 'PSK', type: 'password', required: true },
        { name: 'version', label: 'Version', type: 'number', placeholder: '3' },
    ],
    vmess: [
        { name: 'uuid', label: 'UUID', type: 'text', required: true },
        { name: 'alterId', label: 'Alter ID', type: 'number', required: true, placeholder: '0' },
        { name: 'cipher', label: 'Cipher', type: 'text', required: true, placeholder: 'auto' },
        { name: 'tls', label: 'TLS', type: 'checkbox' },
        { name: 'servername', label: 'SNI', type: 'text', placeholder: 'Optional' },
        { name: 'network', label: 'Network', type: 'text', placeholder: 'tcp, ws, h2, grpc' },
        { name: 'udp', label: 'UDP', type: 'checkbox' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
    ],
    vless: [
        { name: 'uuid', label: 'UUID', type: 'text', required: true },
        { name: 'flow', label: 'Flow', type: 'text', placeholder: 'xtls-rprx-vision' },
        { name: 'tls', label: 'TLS', type: 'checkbox' },
        { name: 'servername', label: 'SNI', type: 'text', placeholder: 'Optional' },
        { name: 'network', label: 'Network', type: 'text', placeholder: 'tcp, ws, h2, grpc' },
        { name: 'udp', label: 'UDP', type: 'checkbox' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
    ],
    trojan: [
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'sni', label: 'SNI', type: 'text', placeholder: 'Optional' },
        { name: 'network', label: 'Network', type: 'text', placeholder: 'tcp, ws, grpc' },
        { name: 'udp', label: 'UDP', type: 'checkbox' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
    ],
    anytls: [
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'sni', label: 'SNI', type: 'text', placeholder: 'Optional' },
        { name: 'client-fingerprint', label: 'Client Fingerprint', type: 'text', placeholder: 'chrome' },
        { name: 'udp', label: 'UDP', type: 'checkbox' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
    ],
    mieru: [
        { name: 'username', label: 'Username', type: 'text', placeholder: 'Optional' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional' },
        { name: 'transport', label: 'Transport', type: 'text', placeholder: 'TCP, UDP' },
        { name: 'port-range', label: 'Port Range', type: 'text', placeholder: '2090-2099' },
    ],
    sudoku: [
        { name: 'key', label: 'Key', type: 'password', required: true },
        { name: 'aead-method', label: 'AEAD Method', type: 'text', placeholder: 'chacha20-poly1305' },
        { name: 'http-mask', label: 'HTTP Mask', type: 'checkbox' },
    ],
    hysteria: [
        { name: 'auth-str', label: 'Auth String', type: 'password', required: true },
        { name: 'obfs', label: 'Obfs', type: 'text', placeholder: 'Optional' },
        { name: 'up', label: 'Up Bandwidth', type: 'text', placeholder: '50 Mbps' },
        { name: 'down', label: 'Down Bandwidth', type: 'text', placeholder: '100 Mbps' },
        { name: 'sni', label: 'SNI', type: 'text', placeholder: 'Optional' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
        { name: 'fast-open', label: 'Fast Open', type: 'checkbox' },
    ],
    hysteria2: [
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'obfs', label: 'Obfs', type: 'text', placeholder: 'salamander' },
        { name: 'obfs-password', label: 'Obfs Password', type: 'password', placeholder: 'Optional' },
        { name: 'up', label: 'Up Bandwidth', type: 'text', placeholder: '50 Mbps' },
        { name: 'down', label: 'Down Bandwidth', type: 'text', placeholder: '100 Mbps' },
        { name: 'sni', label: 'SNI', type: 'text', placeholder: 'Optional' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
    ],
    tuic: [
        { name: 'uuid', label: 'UUID', type: 'text', required: true },
        { name: 'token', label: 'Token', type: 'password', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional' },
        { name: 'sni', label: 'SNI', type: 'text', placeholder: 'Optional' },
        { name: 'congestion-controller', label: 'Congestion Controller', type: 'text', placeholder: 'bbr' },
        { name: 'udp-relay-mode', label: 'UDP Relay Mode', type: 'text', placeholder: 'native, quic' },
        { name: 'skip-cert-verify', label: 'Skip Cert Verify', type: 'checkbox' },
        { name: 'fast-open', label: 'Fast Open', type: 'checkbox' },
    ],
    wireguard: [
        { name: 'private-key', label: 'Private Key', type: 'password', required: true },
        { name: 'public-key', label: 'Public Key', type: 'text', required: true },
        { name: 'ip', label: 'IP', type: 'text', required: true, placeholder: '10.0.0.2' },
        { name: 'ipv6', label: 'IPv6', type: 'text', placeholder: 'Optional' },
        { name: 'allowed-ips', label: 'Allowed IPs', type: 'text', placeholder: '0.0.0.0/0' },
        { name: 'pre-shared-key', label: 'Pre-Shared Key', type: 'password', placeholder: 'Optional' },
        { name: 'mtu', label: 'MTU', type: 'number', placeholder: '1420' },
        { name: 'udp', label: 'UDP', type: 'checkbox' },
    ],
    ssh: [
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Or use private key' },
        { name: 'private-key', label: 'Private Key', type: 'text', placeholder: 'Or use password' },
        { name: 'private-key-passphrase', label: 'Key Passphrase', type: 'password', placeholder: 'Optional' },
    ],
};

interface FinalProxyNodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    proxyNode?: ProxyNode | null;
    onSave: (proxyNode: ProxyNode) => void;
    existingNames: string[];
}

export default function FinalProxyNodeDialog({
    open,
    onOpenChange,
    proxyNode,
    onSave,
    existingNames,
}: FinalProxyNodeDialogProps) {
    const isEditing = !!proxyNode;
    const [proxyType, setProxyType] = useState<ProxyType>('http');

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {} as Record<string, any>
    });

    useEffect(() => {
        if (open && proxyNode) {
            setProxyType(proxyNode.type as ProxyType);
            const values: Record<string, any> = { ...proxyNode };
            if (proxyNode['allowed-ips'] && Array.isArray(proxyNode['allowed-ips'])) {
                values['allowed-ips'] = proxyNode['allowed-ips'].join(', ');
            }
            reset(values);
        } else if (open) {
            setProxyType('http');
            reset({ type: 'http' });
        }
    }, [open, proxyNode, reset]);

    const handleTypeChange = (type: ProxyType) => {
        setProxyType(type);
        reset({ type, name: watch('name'), server: watch('server'), port: watch('port') });
    };

    const onSubmit = (data: Record<string, any>) => {
        const namesToCheck = isEditing
            ? existingNames.filter(n => n !== proxyNode?.name)
            : existingNames;

        if (namesToCheck.includes(data.name)) {
            toast.error('代理名称已存在', {
                description: `名称为"${data.name}"的代理已存在`
            });
            return;
        }

        const result: Record<string, any> = { type: proxyType };
        const allFields = [...COMMON_FIELDS, ...TYPE_SPECIFIC_FIELDS[proxyType]];

        for (const field of allFields) {
            const value = data[field.name];
            if (value === undefined || value === '' || value === false) continue;

            if (field.type === 'number') {
                result[field.name] = Number(value);
            } else if (field.type === 'checkbox') {
                result[field.name] = Boolean(value);
            } else if (field.name === 'allowed-ips' && typeof value === 'string') {
                result[field.name] = value.split(',').map((s: string) => s.trim()).filter(Boolean);
            } else {
                result[field.name] = value;
            }
        }

        if (proxyType === 'vless') {
            result['encryption'] = '';
        }

        onSave(result as ProxyNode);
        onOpenChange(false);
    };

    const allFields = [...COMMON_FIELDS, ...TYPE_SPECIFIC_FIELDS[proxyType]];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? '编辑落地节点' : '添加落地节点'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-1.5">
                        <Label>代理类型</Label>
                        <Select value={proxyType} onValueChange={(v) => handleTypeChange(v as ProxyType)}>
                            <SelectTrigger>
                                <SelectValue placeholder="选择代理类型" />
                            </SelectTrigger>
                            <SelectContent>
                                {PROXY_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {allFields.map((field) => (
                            <div key={field.name} className={field.type === 'checkbox' ? 'flex items-center gap-2' : 'grid gap-1.5'}>
                                {field.type === 'checkbox' ? (
                                    <>
                                        <input
                                            type="checkbox"
                                            id={field.name}
                                            {...register(field.name)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor={field.name}>{field.label}</Label>
                                    </>
                                ) : (
                                    <>
                                        <Label htmlFor={field.name}>
                                            {field.label}
                                            {field.required && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                        <Input
                                            id={field.name}
                                            type={field.type}
                                            {...register(field.name, { required: field.required })}
                                            placeholder={field.placeholder}
                                            className={errors[field.name] ? "border-destructive" : ""}
                                        />
                                        {errors[field.name] && (
                                            <span className="text-xs text-destructive">{field.label}不能为空</span>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

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
