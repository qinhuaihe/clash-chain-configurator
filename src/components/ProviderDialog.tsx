import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

const providerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(['http', 'inline']),
    url: z.string().optional(),
    payload: z.string().optional(),
    interval: z.coerce.number().min(60, "Interval must be at least 60 seconds").default(3600)
}).refine((data) => {
    if (data.type === 'http') {
        return data.url && data.url.length > 0;
    }
    return true;
}, {
    message: "URL is required for http type",
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
    message: "Must be a valid URL",
    path: ["url"]
}).refine((data) => {
    if (data.type === 'inline') {
        return data.payload && data.payload.trim().length > 0;
    }
    return true;
}, {
    message: "Payload is required for inline type",
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

    const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<ProviderFormValues>({
        resolver: zodResolver(providerSchema) as any,
        defaultValues: {
            name: '',
            type: 'http',
            url: '',
            payload: '',
            interval: 3600
        }
    });

    const watchType = watch('type');

    useEffect(() => {
        if (open && provider) {
            reset({
                name: provider.name,
                type: (provider.type as 'http' | 'inline') || 'http',
                url: provider.url || '',
                payload: provider.payload || '',
                interval: provider.interval || 3600
            });
        } else if (open) {
            reset({
                name: '',
                type: 'http',
                url: '',
                payload: '',
                interval: 3600
            });
        }
    }, [open, provider, reset]);

    const onSubmit = (data: ProviderFormValues) => {
        const namesToCheck = isEditing 
            ? existingNames.filter(n => n !== provider?.name)
            : existingNames;
        
        if (namesToCheck.includes(data.name)) {
            toast.error('Provider name already exists', {
                description: `A provider with the name "${data.name}" already exists.`
            });
            return;
        }
        
        onSave(data as ProxyProviderExtend);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Provider' : 'Add Provider'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="Provider Name"
                            className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                            <span className="text-xs text-destructive">{errors.name.message}</span>
                        )}
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="type">Type</Label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="http">HTTP</SelectItem>
                                        <SelectItem value="inline">Inline</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    {watchType === 'http' && (
                        <div className="grid gap-1.5">
                            <Label htmlFor="url">URL</Label>
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
                            <Label htmlFor="payload">Payload</Label>
                            <textarea
                                id="payload"
                                {...register('payload')}
                                placeholder="Enter proxy nodes YAML..."
                                className={`min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.payload ? "border-destructive" : "border-input"}`}
                            />
                            {errors.payload && (
                                <span className="text-xs text-destructive">{errors.payload.message}</span>
                            )}
                        </div>
                    )}
                    <div className="grid gap-1.5">
                        <Label htmlFor="interval">Interval (seconds)</Label>
                        <Input
                            id="interval"
                            type="number"
                            {...register('interval')}
                            placeholder="3600"
                            className={errors.interval ? "border-destructive" : ""}
                        />
                        {errors.interval && (
                            <span className="text-xs text-destructive">{errors.interval.message}</span>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isEditing ? 'Save' : 'Add'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
