"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Cloud, File, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { Button, buttonVariants } from "./ui/button";
import { Progress } from "./ui/progress";
import { useToast } from "./ui/use-toast";

const UploadDropzone = () => {
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>("");

  const { startUpload } = useUploadThing("documentUpload");

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);

    return interval;
  };

  
  if(fileUrl) return (
    <div className="flex flex-col items-center justify-evenly gap-12 py-24 px-6">
        <h1 className="text-xl font-semibold">Document translated successfully</h1>
        <a href={fileUrl} target="_blank" className={cn(buttonVariants(), "w-full")}>Download Now</a>
    </div>
)

  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        setIsUploading(true);

        const progressInterval = startSimulatedProgress();

        // handle file uploading
        const res = await startUpload(acceptedFile);
        console.log(acceptedFile[0].type);
        console.log(typeof acceptedFile[0].type);

        if (!res) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        const [fileResponse] = res;

        const key = fileResponse?.key;

        if (!key) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        clearInterval(progressInterval);
        setUploadProgress(100);

        const options = {
          method: "POST",
          url: "https://api.edenai.run/v2/translation/document_translation",
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODg1NjhmYTktM2ZlNy00MGU1LTg1ZDctYmVlNGVmODcyZjFhIiwidHlwZSI6ImFwaV90b2tlbiJ9.EWzT_bUTkMXIgqgcxzFKIw_Cl1n3gv5oejkLYnY4ONw",
          },
          data: {
            providers: "google",
            source_language: "en",
            target_language: "es",
            file_url: fileResponse.url,
            fallback_providers: "",
          },
        };
        axios
          .request(options)
          .then((response) => {
            setFileUrl(response.data.google.document_resource_url);
          })
          .catch((error) => {
            console.error(error);
          });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 4 MB)</p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    indicatorColor={
                      uploadProgress === 100 ? "bg-green-500" : ""
                    }
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Translating...
                    </div>
                  ) : null}
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const LanguageFileUpload = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button className="bg-black text-white flex-1 py-2">
          Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default LanguageFileUpload;

// "use client";
// import {
//   Dialog,
//   DialogContent,
//   DialogTrigger
// } from "@/components/ui/dialog";
// import { useUploadThing } from "@/lib/uploadthing";
// import { cn } from "@/lib/utils";
// import axios from "axios";
// import { Cloud, File, Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import Dropzone from "react-dropzone";
// import { Button, buttonVariants } from "./ui/button";
// import { Progress } from "./ui/progress";
// import { useToast } from "./ui/use-toast";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// const UploadDropzone = () => {
//   const { toast } = useToast();

//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [uploadProgress, setUploadProgress] = useState<number>(0);
//   const [fileUrl, setFileUrl] = useState<string>("");
//   const [language, setLanguage] = useState("hn")

//   const FormSchema = z.object({
//     language: z.string({
//       required_error: "Please select a Language",
//     }),
//   });
  
//   const formSchema = z.object({
//     language: z.string(),
//   });

//   const form1 = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//   });
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//   });

//   const onSubmitForm1 = async (data: z.infer<typeof FormSchema>) => {
//     console.log(data);
//     setLanguage(data.language);
//     form.reset();
//   }

//   const { startUpload } = useUploadThing("documentUpload");

//   const startSimulatedProgress = () => {
//     setUploadProgress(0);

//     const interval = setInterval(() => {
//       setUploadProgress((prevProgress) => {
//         if (prevProgress >= 95) {
//           clearInterval(interval);
//           return prevProgress;
//         }
//         return prevProgress + 5;
//       });
//     }, 500);

//     return interval;
//   };

  
//   if(fileUrl) return (
//     <div className="flex flex-col items-center justify-evenly gap-12 py-24 px-6">
//         <h1 className="text-xl font-semibold">Document translated successfully</h1>
//         <a href={fileUrl} target="_blank" className={cn(buttonVariants(), "w-full")}>Download Now</a>
//     </div>
// )

//   return (
//     <Dropzone
//       multiple={false}
//       onDrop={async (acceptedFile) => {
//         setIsUploading(true);

//         const progressInterval = startSimulatedProgress();

//         // handle file uploading
//         const res = await startUpload(acceptedFile);
//         console.log(acceptedFile[0].type);
//         console.log(typeof acceptedFile[0].type);

//         if (!res) {
//           return toast({
//             title: "Something went wrong",
//             description: "Please try again later",
//             variant: "destructive",
//           });
//         }

//         const [fileResponse] = res;

//         const key = fileResponse?.key;

//         if (!key) {
//           return toast({
//             title: "Something went wrong",
//             description: "Please try again later",
//             variant: "destructive",
//           });
//         }

//         clearInterval(progressInterval);
//         setUploadProgress(100);

//         const options = {
//           method: "POST",
//           url: "https://api.edenai.run/v2/translation/document_translation",
//           headers: {
//             Authorization:
//               "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODg1NjhmYTktM2ZlNy00MGU1LTg1ZDctYmVlNGVmODcyZjFhIiwidHlwZSI6ImFwaV90b2tlbiJ9.EWzT_bUTkMXIgqgcxzFKIw_Cl1n3gv5oejkLYnY4ONw",
//           },
//           data: {
//             providers: "google",
//             source_language: "en",
//             target_language: language,
//             file_url: fileResponse.url,
//             fallback_providers: "",
//           },
//         };
//         axios
//           .request(options)
//           .then((response) => {
//             setFileUrl(response.data.google.document_resource_url);
//           })
//           .catch((error) => {
//             console.error(error);
//           });
//       }}
//     >
//       {({ getRootProps, getInputProps, acceptedFiles }) => (
//         <div>
//         <div
//           {...getRootProps()}
//           className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
//         >
//           <div className="flex items-center justify-center h-full w-full">
//             <label
//               htmlFor="dropzone-file"
//               className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
//             >
//               <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                 <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
//                 <p className="mb-2 text-sm text-zinc-700">
//                   <span className="font-semibold">Click to upload</span> or drag
//                   and drop
//                 </p>
//                 <p className="text-xs text-zinc-500">PDF (up to 4 MB)</p>
//               </div>

//               {acceptedFiles && acceptedFiles[0] ? (
//                 <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
//                   <div className="px-3 py-2 h-full grid place-items-center">
//                     <File className="h-4 w-4 text-blue-500" />
//                   </div>
//                   <div className="px-3 py-2 h-full text-sm truncate">
//                     {acceptedFiles[0].name}
//                   </div>
//                 </div>
//               ) : null}

//               {isUploading ? (
//                 <div className="w-full mt-4 max-w-xs mx-auto">
//                   <Progress
//                     indicatorColor={
//                       uploadProgress === 100 ? "bg-green-500" : ""
//                     }
//                     value={uploadProgress}
//                     className="h-1 w-full bg-zinc-200"
//                   />
//                   {uploadProgress === 100 ? (
//                     <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
//                       <Loader2 className="h-3 w-3 animate-spin" />
//                       Translating...
//                     </div>
//                   ) : null}
//                 </div>
//               ) : null}

//               <input
//                 {...getInputProps()}
//                 type="file"
//                 id="dropzone-file"
//                 className="hidden"
//               />
//             </label>
//           </div>
//         </div>
//         <div className="flex space-x-2">
//             <Form {...form1}>
//               <form
//                 onSubmit={form.handleSubmit(onSubmitForm1)}
//                 className="space-y-6 relative"
//                 id="language-input"
//               >
//                 <FormField
//                   control={form.control}
//                   name="language"
//                   render={({ field }) => (
//                     <FormItem>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger className="w-20 md:min-w-[180px]">
//                             <SelectValue placeholder="Select Language" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="hi">Hindi</SelectItem>
//                           <SelectItem value="mr">Marathi</SelectItem>
//                           <SelectItem value="bn">Bengali</SelectItem>
//                           <SelectItem value="gu">Gujarati</SelectItem>
//                           <SelectItem value="ta">Tamil</SelectItem>
//                           <SelectItem value="te">Telugu</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </form>
//             </Form>
//             <Button form="language-input" type="submit">
//               Submit
//             </Button>
//           </div>
//         </div>
//       )}
//     </Dropzone>
//   );
// };

// const LanguageFileUpload = () => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   return (
//     <Dialog
//       open={isOpen}
//       onOpenChange={(v) => {
//         if (!v) {
//           setIsOpen(v);
//         }
//       }}
//     >
//       <DialogTrigger asChild onClick={() => setIsOpen(true)}>
//         <Button className="bg-black text-white flex-1 py-2">
//           Document
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <UploadDropzone />
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default LanguageFileUpload;

