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
import { Plus, Import, Copy, Download } from "lucide-react";
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
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold">Clash 链式代理配置器</h1>

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
    );
}