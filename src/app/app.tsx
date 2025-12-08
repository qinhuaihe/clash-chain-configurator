import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ConfigConfigurator from "./clash/configurator";
import ProviderList from "@/components/ProviderList";
import ProviderDialog from "@/components/ProviderDialog";
import FinalProxyNodeList from "@/components/FinalProxyNodeList";
import FinalProxyNodeDialog from "@/components/FinalProxyNodeDialog";
import ImportProxyNodesDialog from "@/components/ImportProxyNodesDialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Plus, Import, Copy, Download, Github } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const configurator = new ConfigConfigurator();

const STORAGE_KEYS = {
    PROVIDERS: 'clash-chain-providers',
    PROXY_NODES: 'clash-chain-proxy-nodes'
};

export default function App() {
    const [content, setContent] = useState(configurator.content);
    const [providers, setProviders] = useState<ProxyProviderExtend[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [proxyNodes, setProxyNodes] = useState<ProxyNode[]>([]);
    const [proxyNodeDialogOpen, setProxyNodeDialogOpen] = useState(false);
    const [editingProxyNodeIndex, setEditingProxyNodeIndex] = useState<number | null>(null);
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    useEffect(() => {
        try {
            const savedProviders = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
            const savedProxyNodes = localStorage.getItem(STORAGE_KEYS.PROXY_NODES);
            if (savedProviders) {
                setProviders(JSON.parse(savedProviders));
            }
            if (savedProxyNodes) {
                setProxyNodes(JSON.parse(savedProxyNodes));
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    }, []);

    useEffect(() => {
        configurator.setProviders(providers);
        setContent(configurator.content);
        try {
            localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
        } catch (e) {
            console.error('Failed to save providers:', e);
        }
    }, [providers]);

    useEffect(() => {
        configurator.setFinalProxyNodes(proxyNodes);
        setContent(configurator.content);
        try {
            localStorage.setItem(STORAGE_KEYS.PROXY_NODES, JSON.stringify(proxyNodes));
        } catch (e) {
            console.error('Failed to save proxy nodes:', e);
        }
    }, [proxyNodes]);

    configurator.setProviders(providers);

    const handleRemoveProvider = (index: number) => {
        setProviders(providers.filter((_, i) => i !== index));
    };

    const handleEditProvider = (index: number) => {
        setEditingIndex(index);
        setDialogOpen(true);
    };

    const handleAddProvider = () => {
        setEditingIndex(null);
        setDialogOpen(true);
    };

    const handleSaveProvider = (provider: ProxyProviderExtend) => {
        if (editingIndex !== null) {
            const newProviders = [...providers];
            newProviders[editingIndex] = provider;
            setProviders(newProviders);
        } else {
            setProviders([...providers, provider]);
        }
    };

    const handleRemoveProxyNode = (index: number) => {
        setProxyNodes(proxyNodes.filter((_, i) => i !== index));
    };

    const handleEditProxyNode = (index: number) => {
        setEditingProxyNodeIndex(index);
        setProxyNodeDialogOpen(true);
    };

    const handleAddProxyNode = () => {
        setEditingProxyNodeIndex(null);
        setProxyNodeDialogOpen(true);
    };

    const handleSaveProxyNode = (proxyNode: ProxyNode) => {
        if (editingProxyNodeIndex !== null) {
            const newProxyNodes = [...proxyNodes];
            newProxyNodes[editingProxyNodeIndex] = proxyNode;
            setProxyNodes(newProxyNodes);
        } else {
            setProxyNodes([...proxyNodes, proxyNode]);
        }
    };

    const handleImportProxyNodes = (nodes: ProxyNode[]) => {
        setProxyNodes([...proxyNodes, ...nodes]);
    };

    const handleCopyConfig = async () => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success('已复制到剪贴板');
        } catch {
            toast.error('复制失败');
        }
    };

    const handleDownloadConfig = () => {
        const blob = new Blob([content], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clash-config.yaml';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('配置已下载');
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">Clash 链式代理配置器</h1>
                        <a
                            href="https://x.com/shift_neo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            by 
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            迷雾NEO
                        </a>
                    </div>
                    <a
                        href="https://github.com/qinhuaihe/clash-chain-configurator"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Github className="h-5 w-5" />
                        <span className="hidden sm:inline">源代码</span>
                    </a>
                </div>
            </header>
            
            <div className="container mx-auto p-4 pt-20 space-y-8">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                    <p>🔒 本应用是开源的纯客户端应用，不会向任何服务器传输数据，所有数据均存储在浏览器本地。</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">机场列表</h2>
                        <Button onClick={handleAddProvider}>
                            <Plus className="mr-2 h-4 w-4" /> 添加
                        </Button>
                    </div>
                    <ProviderList 
                        providers={providers} 
                        onRemove={handleRemoveProvider} 
                        onEdit={handleEditProvider}
                    />
                </div>

                <ProviderDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    provider={editingIndex !== null ? providers[editingIndex] : null}
                    onSave={handleSaveProvider}
                    existingNames={providers.map(p => p.name)}
                />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">代理节点</h2>
                        <div className="flex gap-2">
                            <Button onClick={() => setImportDialogOpen(true)} variant="outline">
                                <Import className="mr-2 h-4 w-4" /> 导入
                            </Button>
                            <Button onClick={handleAddProxyNode}>
                                <Plus className="mr-2 h-4 w-4" /> 添加
                            </Button>
                        </div>
                    </div>
                    <FinalProxyNodeList
                        proxyNodes={proxyNodes}
                        onRemove={handleRemoveProxyNode}
                        onEdit={handleEditProxyNode}
                    />
                </div>

                <FinalProxyNodeDialog
                    open={proxyNodeDialogOpen}
                    onOpenChange={setProxyNodeDialogOpen}
                    proxyNode={editingProxyNodeIndex !== null ? proxyNodes[editingProxyNodeIndex] : null}
                    onSave={handleSaveProxyNode}
                    existingNames={proxyNodes.map(p => p.name)}
                />

                <ImportProxyNodesDialog
                    open={importDialogOpen}
                    onOpenChange={setImportDialogOpen}
                    onImport={handleImportProxyNodes}
                    existingNames={proxyNodes.map(p => p.name)}
                />

                <Toaster />

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">生成的配置</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopyConfig}>
                                <Copy className="mr-2 h-4 w-4" /> 复制
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadConfig}>
                                <Download className="mr-2 h-4 w-4" /> 下载
                            </Button>
                        </div>
                    </div>
                    <SyntaxHighlighter
                        language="yaml"
                        style={oneDark}
                        showLineNumbers
                        customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem', height: '800px', overflow: 'auto' }}
                    >
                        {content}
                    </SyntaxHighlighter>
                </div>
            </div>
        </>
    );
}