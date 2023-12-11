"use client";
import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "@/components/ui/dialog";
import { useUploadThing } from "@/lib/uploadthing";
import axios from "axios";
import { Cloud, File, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useToast } from "./ui/use-toast";

const UploadDropzone = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [translatedTextFromPhoto, setTranslatedTextFromPhoto] =
    useState<string>("");
  const [uploaded, setUploaded] = useState<boolean>(false);

  const { startUpload } = useUploadThing("imageUpload");

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

  if (translatedTextFromPhoto)
    return (
      <div className="text-center text-xl font-bold text-white mt-10 mb-10 bg-slate-700 p-5 rounded-lg shadow-lg shadow-slate-900/50 dark:shadow-slate-900/50 dark:bg-slate-800 dark:text-slate-200 w-full max-w-[500px] mx-auto">
        {translatedTextFromPhoto}
      </div>
    );

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
          url: "https://api.edenai.run/v2/ocr/ocr",
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODg1NjhmYTktM2ZlNy00MGU1LTg1ZDctYmVlNGVmODcyZjFhIiwidHlwZSI6ImFwaV90b2tlbiJ9.EWzT_bUTkMXIgqgcxzFKIw_Cl1n3gv5oejkLYnY4ONw",
          },
          data: {
            providers: "google",
            source_language: "en",
            file_url: fileResponse.url,
            fallback_providers: "google",
          },
        };
        axios
          .request(options)
          .then((response) => {
            axios
              .post(
                "https://translation.googleapis.com/language/translate/v2",
                {},
                {
                  params: {
                    q: response.data.google.text,
                    target: "hi",
                    key: "AIzaSyClsCDihHhh50O2eO_G2NcboqUzt7NvbuY",
                  },
                }
              )
              .then((response) => {
                setTranslatedTextFromPhoto(
                  response.data.data.translations[0].translatedText
                );
              })
              .catch((err) => {
                console.log("rest api error", err);
              });
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

const LanguageImageUpload = () => {
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
        <Button className="bg-black text-white flex-1">Photo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default LanguageImageUpload;
