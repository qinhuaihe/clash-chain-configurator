import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Clock, Link, Pencil, FileText } from 'lucide-react';

interface ProviderListProps {
    providers: ProxyProviderExtend[];
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
}

export default function ProviderList({ providers, onRemove, onEdit }: ProviderListProps) {
    if (providers.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                暂无机场
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider, index) => (
                <Card key={index} className="relative">
                    <CardHeader className="p-3 sm:p-4 pb-2">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-base sm:text-lg">{provider.name || `Provider ${index + 1}`}</CardTitle>
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
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${provider.type === 'inline' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                                {provider.type || 'http'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {provider.interval || 3600}s
                            </span>
                        </div>
                        {provider.type === 'inline' ? (
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span className="truncate line-clamp-2 break-all">
                                    {provider.payload ? `${provider.payload.slice(0, 80)}${provider.payload.length > 80 ? '...' : ''}` : '无节点内容'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate" title={provider.path}>
                                    {provider.path || '未设置订阅地址'}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
