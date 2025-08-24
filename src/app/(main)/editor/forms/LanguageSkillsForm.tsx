"use client";

import { EditorFormProps } from "@/lib/types";
import { Form } from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { languageSkillsSchema, LanguageSkillsValues } from "@/lib/validation";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

// List of languages (this is a sample list, you can extend it)
const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Arabic",
  "Russian",
  "Portuguese",
  "Italian",
  // Add more languages as needed
];

const proficiencyLevels = [
  { value: "native", label: "Native" },
  { value: "advanced", label: "Advanced" },
  { value: "intermediate", label: "Intermediate" },
  { value: "beginner", label: "Beginner" },
];

export default function LanguageSkillsForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<LanguageSkillsValues>({
    resolver: zodResolver(languageSkillsSchema),
    defaultValues: {
      languages: resumeData.languages || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  // Sync form changes with parent component state
  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;

      setResumeData({
        ...resumeData,
        languages: values.languages?.filter((lang): lang is { 
          language: string; 
          level: "native" | "advanced" | "intermediate" | "beginner" 
        } => {
          return lang !== undefined && 
            typeof lang.language === 'string' && 
            lang.language.trim() !== '' &&
            (lang.level === 'native' || 
             lang.level === 'advanced' || 
             lang.level === 'intermediate' || 
             lang.level === 'beginner');
        }) || [],
      });
    });

    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Form header section with a title and description */}
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Language Skills</h2>
        <p className="text-sm text-muted-foreground">
          Add the languages you know and your proficiency level.
        </p>
      </div>
      
      <Form {...form}>
        <form className="space-y-4 py-2 pb-4">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-2 rounded-lg border p-4"
              >
                <FormField
                  control={form.control}
                  name={`languages.${index}.language`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`languages.${index}.level`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Proficiency Level</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {proficiencyLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="self-end"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ language: "", level: "beginner" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Language
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
