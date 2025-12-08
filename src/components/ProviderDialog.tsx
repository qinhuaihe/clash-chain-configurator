import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

const providerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    path: z.string().url("Must be a valid URL"),
    interval: z.coerce.number().min(60, "Interval must be at least 60 seconds").default(3600)
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

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProviderFormValues>({
        resolver: zodResolver(providerSchema) as any,
        defaultValues: {
            name: '',
            path: '',
            interval: 3600
        }
    });

    useEffect(() => {
        if (open && provider) {
            reset({
                name: provider.name,
                path: provider.path,
                interval: provider.interval || 3600
            });
        } else if (open) {
            reset({
                name: '',
                path: '',
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
                        <Label htmlFor="path">URL</Label>
                        <Input
                            id="path"
                            {...register('path')}
                            placeholder="https://example.com/config.yaml"
                            className={errors.path ? "border-destructive" : ""}
                        />
                        {errors.path && (
                            <span className="text-xs text-destructive">{errors.path.message}</span>
                        )}
                    </div>
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
