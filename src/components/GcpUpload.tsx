"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cloud, File, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useToast } from "./ui/use-toast";
import axios from "axios";

const UploadDropzone = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>("");

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

  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        setIsUploading(true);

        const progressInterval = startSimulatedProgress();

        // handle file uploading
        const data = new FormData();
        data.append("file", acceptedFile[0]);

        await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        const url =
          "https://translation.googleapis.com/v3/projects/byte-busters-401816/locations/global:translateDocument";

        const options = {
          source_language_code: "en",
          target_language_code: "hi",
          document_input_config: {
            gcsSource: {
              inputUri: `gs://doc-storage-byte/${acceptedFile[0].name}`,
            },
          },
          document_output_config: {
            gcsDestination: {
              outputUriPrefix: `gs://byte-translated-docs/${acceptedFile[0].name}`,
            },
          },
        };

        axios
          .post(url, options, {
            headers: {
              Authorization: "Bearer " + "ya29.a0AfB_byCMC6eFfjUfgkCyT4fKRQVmJH09WoWyR-KR2bNFRFvtSxrmJtJRScyTDOgpO0F47D_2PGQvWv7oKHRw3Iqu6bsT0PQBUuybSpMQWCrKOhOr5MIFrWKz2p8jchMHpCYDSPsJTKadVzsyvJ68f9Uh1EHCITF_gpWhPwaCgYKAVQSARISFQHGX2Mii_EmNgcovOcachqRhiwrwQ0173",
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log("Success:", response.data);
          })
          .catch((error) => {
            console.error(
              "Error:",
              error.response ? error.response.data : error.message
            );
          });

        clearInterval(progressInterval);
        setUploadProgress(100);
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
                      Redirecting...
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

const GcpUpload = () => {
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
        <Button className="bg-black text-white flex-1">
          Translate A document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Tutor</DialogTitle>
          <DialogDescription>Enter tutor details below.</DialogDescription>
        </DialogHeader>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default GcpUpload;
