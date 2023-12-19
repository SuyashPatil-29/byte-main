"use client";
import GcpUpload from "@/components/GcpUpload";
import LanguageFileUpload from "@/components/LanguageFileUpload";
import LanguageImageUpload from "@/components/LanguageImageUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { pdfjs } from "react-pdf";
import * as z from "zod";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


export default function SelectForm() {
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [uploading, setUploading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const [translatedTextFromFile, setTranslatedTextFromFile] = useState("");
  
  const FormSchema = z.object({
    language: z.string({
      required_error: "Please select a Language",
    }),
  });
  
  const formSchema = z.object({
    language: z.string(),
  });

  const form1 = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmitForm1 = async (data: z.infer<typeof FormSchema>) => {
    const response = axios
      .post(
        "https://translation.googleapis.com/language/translate/v2",
        {},
        {
          params: {
            q: search,
            target: data.language,
            key: "AIzaSyClsCDihHhh50O2eO_G2NcboqUzt7NvbuY",
          },
        }
      )
      .then((response) => {
        setTranslatedTextFromFile("");
        setConvertedText(response.data.data.translations[0].translatedText);
      })
      .catch((err) => {
        console.log("rest api error", err);
      });
  };

  return (
    <div className="flex-1 px-4 py-10 md:py-16 max-w-5xl xl:max-w-6xl mx-auto w-full flex flex-col">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold">Language Translator</h1>
        <p className="text-muted-foreground font-medium">
          Choose a language to translate your text.
        </p>
      </div>
      <div className="flex space-x-3 mt-4 items-start">
        <Textarea
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          className="resize-none pr-12 text-base scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex-1 lg:min-w-[840px]"
          placeholder="Enter your text to translate"
          rows={1}
          maxRows={3}
          minRows={3}
          autoFocus
        />
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Form {...form1}>
              <form
                onSubmit={form.handleSubmit(onSubmitForm1)}
                className="space-y-6 relative"
                id="language-input"
              >
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-20 md:min-w-[180px]">
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="mr">Marathi</SelectItem>
                          <SelectItem value="bn">Bengali</SelectItem>
                          <SelectItem value="gu">Gujarati</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                          <SelectItem value="te">Telugu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <Button form="language-input" type="submit">
              Submit
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <LanguageFileUpload />
            <LanguageImageUpload />
          </div>
        </div>
      </div>
      <div className="mt-10">
        <h1 className="text-3xl font-bold">Translated Text</h1>
        <p className="text-muted-foreground font-medium">
          Translated text will appear below
        </p>
        {(translatedTextFromFile || convertedText) && (
          <Card className="mt-4 mx-3 p-5 font-medium">
            {translatedTextFromFile}
            {convertedText}
          </Card>
        )}
      </div>
    </div>
  );
}

// "use client"
// import { useState } from 'react';

// import { TranslationServiceClient } from '@google-cloud/translate';

// const translate = new TranslationServiceClient();

// export default function TranslationUpload() {
//   const [file, setFile] = useState<File>();
//   const [translatedText, setTranslatedText] = useState('');

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   }

//   const handleTranslate = async () => {
//     if(!file) return;

//     const text = await file.text();

//     const translation = await translate.translateText({
//       parent: 'projects/byte-busters-3',
//       contents: [text],
//       mimeType: 'text/plain',
//       sourceLanguageCode: 'en',
//       targetLanguageCode: 'es',
//     }) 

//     console.log(translation);
//   }

//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} />
//       <button onClick={handleTranslate}>Translate</button>

//       <pre>{translatedText}</pre>
//     </div>
//   )
// }