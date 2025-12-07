import { useState, useEffect } from "react";
import ConfigConfigurator from "./clash/configurator";
import ProviderList from "@/components/ProviderList";
import ProviderDialog from "@/components/ProviderDialog";
import FinalProxyNodeList from "@/components/FinalProxyNodeList";
import FinalProxyNodeDialog from "@/components/FinalProxyNodeDialog";
import ImportProxyNodesDialog from "@/components/ImportProxyNodesDialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Plus, Import } from "lucide-react";

const configurator = new ConfigConfigurator();

export default function App() {
    const [content, setContent] = useState(configurator.content);
    const [providers, setProviders] = useState<Airport[]>([{ name: '机场1', path: '', interval: 3600 }]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [proxyNodes, setProxyNodes] = useState<ProxyNode[]>([]);
    const [proxyNodeDialogOpen, setProxyNodeDialogOpen] = useState(false);
    const [editingProxyNodeIndex, setEditingProxyNodeIndex] = useState<number | null>(null);
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    useEffect(() => {
        configurator.setAirports(providers);
        setContent(configurator.content);
    }, [providers]);

    useEffect(() => {
        configurator.setFinalProxyNodes(proxyNodes);
        setContent(configurator.content);
    }, [proxyNodes]);

    configurator.setAirports(providers);

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

    const handleSaveProvider = (provider: Airport) => {
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

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold">Clash Chain Configurator</h1>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Provider List</h2>
                    <Button onClick={handleAddProvider}>
                        <Plus className="mr-2 h-4 w-4" /> Add Provider
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
                    <h2 className="text-xl font-semibold">Proxy Nodes</h2>
                    <div className="flex gap-2">
                        <Button onClick={() => setImportDialogOpen(true)} variant="outline">
                            <Import className="mr-2 h-4 w-4" /> Import
                        </Button>
                        <Button onClick={handleAddProxyNode}>
                            <Plus className="mr-2 h-4 w-4" /> Add Proxy Node
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

            <div className="border p-4 rounded bg-slate-100 dark:bg-slate-900 overflow-auto">
                <h2 className="text-xl font-semibold mb-2">Generated Config</h2>
                <pre className="text-sm">
                    <code>{content}</code>
                </pre>
            </div>
        </div>
    );
}