"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATA_SOURCE_LABELS, DataSource } from "@/types/crm";

export const importOptionsSchema = z.object({
  defaultDataSource: z.string().optional(),
  defaultLeadOwner: z.string().trim().max(100, "Keep this under 100 characters").optional(),
});

export type ImportOptionsValues = z.infer<typeof importOptionsSchema>;

export function ImportOptionsForm({
  dataSources,
  defaultValues,
  onChange,
}: {
  dataSources: string[];
  defaultValues: ImportOptionsValues;
  onChange: (values: ImportOptionsValues) => void;
}) {
  const form = useForm<ImportOptionsValues>({
    resolver: zodResolver(importOptionsSchema),
    defaultValues,
  });

  useEffect(() => {
    const subscription = form.watch((values) => onChange(values as ImportOptionsValues));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  return (
    <Form {...form}>
      <form className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="defaultDataSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default data source</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Let AI detect from CSV" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dataSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {DATA_SOURCE_LABELS[source as DataSource] ?? source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Used only when a row has no clear source signal.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultLeadOwner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default lead owner</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Priya Sharma" {...field} />
              </FormControl>
              <FormDescription>Applied when a row has no owner column.</FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
