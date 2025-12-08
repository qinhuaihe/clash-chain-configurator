import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Clock, Link, Pencil } from 'lucide-react';

interface ProviderListProps {
    providers: ProxyProviderExtend[];
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
}

export default function ProviderList({ providers, onRemove, onEdit }: ProviderListProps) {
    if (providers.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                No providers added yet.
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider, index) => (
                <Card key={index} className="relative">
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{provider.name || `Provider ${index + 1}`}</CardTitle>
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
                            <Link className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate" title={provider.url}>
                                {provider.url || 'No URL set'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>Interval: {provider.interval || 3600}s</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
